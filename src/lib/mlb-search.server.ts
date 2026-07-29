const BASE = "https://statsapi.mlb.com/api/v1";

export type PlayerCandidate = {
  mlbId: number;
  name: string;
  pos: string;
  debut: string;
  last: string;
  bats: string;
  throws: string;
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
  };
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
  if (!detailRes.ok) return people.map(toCandidate);
  const detail = (await detailRes.json()) as { people?: Person[] };
  return (detail.people ?? people).map(toCandidate);
}