import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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

function toInducteeRow(row: Tables<"inductees">): InducteeRow {
  return {
    mlbId: row.mlb_id,
    slug: row.slug,
    name: row.name,
    pos: row.pos,
    debut: row.debut,
    last: row.last,
    bats: row.bats ?? "",
    throws: row.throws ?? "",
    bwar: row.bwar ?? null,
    innerCircle: row.inner_circle ?? false,
    prettyUnanimous: row.pretty_unanimous ?? false,
  };
}

export async function fetchPublishedInductees(): Promise<InducteeRow[]> {
  const { data, error } = await supabase
    .from("inductees")
    .select("*")
    .eq("published", true)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toInducteeRow);
}

export async function fetchInducteeBySlug(slug: string): Promise<InducteeRow | null> {
  const { data, error } = await supabase
    .from("inductees")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toInducteeRow(data) : null;
}
