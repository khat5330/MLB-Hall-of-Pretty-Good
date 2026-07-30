-- Splits pending_inductees.status into the values needed to distinguish
-- items awaiting human review from items an automated confidence rule
-- published without one (auto-publish logic itself lands in a later phase;
-- this migration only prepares the schema for it).
--
-- 'pending' (the old default, used by the pre-phase-2 admin code) is
-- retired in favor of 'needs_review'. Safe to run against an empty table;
-- if a future run somehow has existing 'pending' rows, migrate them first:
--   update public.pending_inductees set status = 'needs_review' where status = 'pending';

ALTER TABLE public.pending_inductees ALTER COLUMN status SET DEFAULT 'needs_review';

ALTER TABLE public.pending_inductees ADD CONSTRAINT pending_inductees_status_check
  CHECK (status IN ('needs_review', 'auto_published', 'approved', 'rejected'));

ALTER TABLE public.pending_inductees
  ADD COLUMN auto_publish_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN published_mlb_id integer REFERENCES public.inductees(mlb_id);
