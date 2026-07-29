-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Inductees
CREATE TABLE public.inductees (
  mlb_id integer PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  pos text NOT NULL,
  debut text NOT NULL,
  last text NOT NULL,
  bats text NOT NULL DEFAULT '',
  throws text NOT NULL DEFAULT '',
  bwar numeric,
  inner_circle boolean NOT NULL DEFAULT false,
  pretty_unanimous boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.inductees TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inductees TO authenticated;
GRANT ALL ON public.inductees TO service_role;
ALTER TABLE public.inductees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published inductees are public"
  ON public.inductees FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins can read all inductees"
  ON public.inductees FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert inductees"
  ON public.inductees FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inductees"
  ON public.inductees FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete inductees"
  ON public.inductees FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Review queue
CREATE TABLE public.pending_inductees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'manual',
  source_post_id text UNIQUE,
  source_url text,
  source_image_url text,
  source_caption text NOT NULL,
  posted_at timestamptz,
  parsed_name text,
  parsed_bwar numeric,
  parsed_inner_circle boolean NOT NULL DEFAULT false,
  matched_mlb_id integer,
  match_candidates jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  needs_manual_entry boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pending_inductees_status_idx ON public.pending_inductees (status, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_inductees TO authenticated;
GRANT ALL ON public.pending_inductees TO service_role;
ALTER TABLE public.pending_inductees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage the review queue"
  ON public.pending_inductees FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER inductees_touch_updated_at BEFORE UPDATE ON public.inductees
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER pending_inductees_touch_updated_at BEFORE UPDATE ON public.pending_inductees
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();