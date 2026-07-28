import { createServerFn } from "@tanstack/react-start";

export type StatMap = Record<string, string | number | null>;

export type StatRow = {
  season: string;
  team: string;
  league: string;
  stat: StatMap;
};

export type PlayerStats = {
  group: "hitting" | "pitching";
  career: StatMap | null;
  seasons: StatRow[];
};

const BASE = "https://statsapi.mlb.com/api/v1";

export const getPlayerStats = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number; group: "hitting" | "pitching" }) => input)
  .handler(async ({ data }): Promise<PlayerStats> => {
    const url = `${BASE}/people/${data.id}/stats?stats=career,yearByYear&group=${data.group}&gameType=R`;
    const res = await fetch(url);
    if (!res.ok) {
      return { group: data.group, career: null, seasons: [] };
    }
    const json = (await res.json()) as {
      stats?: Array<{
        type?: { displayName?: string };
        splits?: Array<{
          season?: string;
          stat?: Record<string, unknown>;
          team?: { name?: string };
          league?: { name?: string };
        }>;
      }>;
    };

    const blocks = json.stats ?? [];
    const careerBlock = blocks.find((b) => b.type?.displayName === "career");
    const yearBlock = blocks.find((b) => b.type?.displayName === "yearByYear");

    const clean = (stat?: Record<string, unknown>): StatMap => {
      const out: StatMap = {};
      for (const [k, v] of Object.entries(stat ?? {})) {
        if (typeof v === "string" || typeof v === "number") out[k] = v;
      }
      return out;
    };

    const leagueAbbrev = (name?: string) =>
      name === "American League" ? "AL" : name === "National League" ? "NL" : (name ?? "");

    return {
      group: data.group,
      career: careerBlock?.splits?.[0] ? clean(careerBlock.splits[0].stat) : null,
      seasons: (yearBlock?.splits ?? []).map((s) => ({
        season: s.season ?? "",
        team: s.team?.name ?? "",
        league: leagueAbbrev(s.league?.name),
        stat: clean(s.stat),
      })),
    };
  });