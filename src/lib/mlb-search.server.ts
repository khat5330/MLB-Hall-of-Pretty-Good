import { supabase } from "@/integrations/supabase/client";

const BASE = "https://statsapi.mlb.com/api/v1";

export type PlayerCandidate = {
  mlbId: number;
  name: string;
  pos: string;
  debut: string;
  last: string;
  bats: string;
  throws: string;
  /** Career bWAR summed from bwar_seasons, null if we have no data for this player. */
  careerBwar: number | null;
};

type Person = {
  id: number;
  fullName?: string;
  primaryPosition?: { abbreviation?: string };
  mlbDebutDate?: string;
  lastPlayedDate?: string;
  batSide?: { code?: string };
  pitchHand?: { code?: string };
  active?: boolean;
};

function toCandidate(p: Person): PlayerCandidate {
  return {
    mlbId: p.id,
    name: p.fullName ?? "",
    pos: p.primaryPosition?.abbreviation ?? "",
    debut: p.mlbDebutDate ? p.mlbDebutDate.slice(0, 4) : "",
    last: p.lastPlayedDate ? p.lastPlayedDate.slice(0, 4) : p.active ? "Active" : "",
    bats: p.batSide?.code ?? "",
    throws: p.pitchHand?.code ?? "",
    careerBwar: null,
  };
}

/** Sums bwar_seasons.war per mlb_id for the given ids. Missing ids are simply absent. */
async function fetchCareerBwar(mlbIds: number[]): Promise<Map<number, number>> {
  const totals = new Map<number, number>();
  if (mlbIds.length === 0) return totals;
  const { data } = await supabase.from("bwar_seasons").select("mlb_id, war").in("mlb_id", mlbIds);
  for (const row of data ?? []) {
    if (row.war === null) continue;
    totals.set(row.mlb_id, (totals.get(row.mlb_id) ?? 0) + row.war);
  }
  return totals;
}

/** Searches the MLB Stats API for players matching a name. */
export async function searchPlayers(name: string): Promise<PlayerCandidate[]> {
  const query = name.trim();
  if (!query) return [];
  const url = `${BASE}/people/search?names=${encodeURIComponent(query)}&limit=10&hydrate=currentTeam`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as { people?: Person[] };
  const people = json.people ?? [];
  if (people.length === 0) return [];

  // Re-fetch full person records so debut/last/bats/throws are populated.
  const ids = people.slice(0, 10).map((p) => p.id);
  const detailRes = await fetch(`${BASE}/people?personIds=${ids.join(",")}`);
  const detail = detailRes.ok ? ((await detailRes.json()) as { people?: Person[] }) : null;
  const candidates = (detail?.people ?? people).map(toCandidate);

  const bwarTotals = await fetchCareerBwar(candidates.map((c) => c.mlbId));
  return candidates.map((c) => ({ ...c, careerBwar: bwarTotals.get(c.mlbId) ?? null }));
}
