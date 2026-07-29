import { createPublicServerClient } from "./supabase-public.server";

export type InducteeRow = {
  mlbId: number;
  slug: string;
  name: string;
  pos: string;
  debut: string;
  last: string;
  bats: string;
  throws: string;
  bwar: number | null;
  innerCircle: boolean;
  prettyUnanimous: boolean;
};

const COLUMNS =
  "mlb_id, slug, name, pos, debut, last, bats, throws, bwar, inner_circle, pretty_unanimous";

type RawRow = {
  mlb_id: number;
  slug: string;
  name: string;
  pos: string;
  debut: string;
  last: string;
  bats: string;
  throws: string;
  bwar: number | string | null;
  inner_circle: boolean;
  pretty_unanimous: boolean;
};

function toInductee(row: RawRow): InducteeRow {
  return {
    mlbId: row.mlb_id,
    slug: row.slug,
    name: row.name,
    pos: row.pos,
    debut: row.debut,
    last: row.last,
    bats: row.bats,
    throws: row.throws,
    bwar: row.bwar === null ? null : Number(row.bwar),
    innerCircle: row.inner_circle,
    prettyUnanimous: row.pretty_unanimous,
  };
}

export async function fetchPublishedInductees(): Promise<InducteeRow[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("inductees")
    .select(COLUMNS)
    .eq("published", true)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toInductee(row as RawRow));
}

export async function fetchInducteeBySlug(slug: string): Promise<InducteeRow | null> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("inductees")
    .select(COLUMNS)
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toInductee(data as RawRow) : null;
}