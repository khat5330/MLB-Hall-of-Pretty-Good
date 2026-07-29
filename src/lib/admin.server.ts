import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { parseInductionCaption, slugify } from "./caption-parse";
import { searchPlayers, type PlayerCandidate } from "./mlb-search.server";

type DB = SupabaseClient<Database>;

export async function assertAdmin(supabase: DB, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required.");
}

export type QueueItem = {
  id: string;
  source: string;
  sourceUrl: string | null;
  sourceCaption: string;
  postedAt: string | null;
  parsedName: string | null;
  parsedBwar: number | null;
  parsedInnerCircle: boolean;
  matchedMlbId: number | null;
  candidates: PlayerCandidate[];
  status: string;
  notes: string | null;
  createdAt: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function toQueueItem(row: any): QueueItem {
  return {
    id: row.id,
    source: row.source,
    sourceUrl: row.source_url,
    sourceCaption: row.source_caption,
    postedAt: row.posted_at,
    parsedName: row.parsed_name,
    parsedBwar: row.parsed_bwar === null ? null : Number(row.parsed_bwar),
    parsedInnerCircle: row.parsed_inner_circle,
    matchedMlbId: row.matched_mlb_id,
    candidates: Array.isArray(row.match_candidates) ? row.match_candidates : [],
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listQueue(supabase: DB, status: string) {
  const { data, error } = await supabase
    .from("pending_inductees")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toQueueItem);
}

export type IngestInput = {
  caption: string;
  source?: string;
  sourcePostId?: string | null;
  sourceUrl?: string | null;
  postedAt?: string | null;
};

/**
 * Parses a caption, resolves the player against the MLB Stats API and queues
 * it for review. Returns null when the caption is not an induction post or the
 * post has already been ingested.
 */
export async function ingestCaption(supabase: DB, input: IngestInput) {
  const parsed = parseInductionCaption(input.caption);
  if (!parsed.isInduction && !parsed.name) return null;

  if (input.sourcePostId) {
    const { data: existing } = await supabase
      .from("pending_inductees")
      .select("id")
      .eq("source_post_id", input.sourcePostId)
      .maybeSingle();
    if (existing) return null;
  }

  const candidates = parsed.name ? await searchPlayers(parsed.name) : [];
  const exact = candidates.filter(
    (c) => c.name.toLowerCase() === (parsed.name ?? "").toLowerCase(),
  );
  const matched = exact.length === 1 ? exact[0].mlbId : candidates.length === 1 ? candidates[0].mlbId : null;

  const { data, error } = await supabase
    .from("pending_inductees")
    .insert({
      source: input.source ?? "manual",
      source_post_id: input.sourcePostId ?? null,
      source_url: input.sourceUrl ?? null,
      source_caption: input.caption,
      posted_at: input.postedAt ?? null,
      parsed_name: parsed.name,
      parsed_bwar: parsed.bwar,
      parsed_inner_circle: parsed.innerCircle,
      matched_mlb_id: matched,
      match_candidates: candidates,
      needs_manual_entry: matched === null || parsed.bwar === null,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toQueueItem(data);
}

export type ApproveInput = {
  id: string;
  mlbId: number;
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

export async function approveQueueItem(supabase: DB, input: ApproveInput) {
  let slug = slugify(input.name);
  const { data: clash } = await supabase
    .from("inductees")
    .select("mlb_id")
    .eq("slug", slug)
    .maybeSingle();
  if (clash && clash.mlb_id !== input.mlbId) slug = `${slug}-${input.mlbId}`;

  const { error } = await supabase.from("inductees").upsert(
    {
      mlb_id: input.mlbId,
      slug,
      name: input.name,
      pos: input.pos,
      debut: input.debut,
      last: input.last,
      bats: input.bats,
      throws: input.throws,
      bwar: input.bwar,
      inner_circle: input.innerCircle,
      pretty_unanimous: input.prettyUnanimous,
      published: true,
    },
    { onConflict: "mlb_id" },
  );
  if (error) throw new Error(error.message);

  const { error: qErr } = await supabase
    .from("pending_inductees")
    .update({ status: "approved", matched_mlb_id: input.mlbId })
    .eq("id", input.id);
  if (qErr) throw new Error(qErr.message);
  return { slug };
}