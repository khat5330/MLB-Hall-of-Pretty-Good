import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

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
  .inputValidator(
    (input: { id: number; group: "hitting" | "pitching"; bwar?: number | null }) => input,
  )
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

    const careerStat = careerBlock?.splits?.[0] ? clean(careerBlock.splits[0].stat) : {};
    if (data.bwar != null) {
      careerStat.bwar = data.bwar;
    }

    // Season-by-season Baseball-Reference WAR, keyed by season year for this player.
    // Synced from Baseball-Reference by a scheduled job into bwar_seasons (see
    // supabase/migrations/20260731223533_bwar_seasons.sql and
    // .github/workflows/sync-bwar.yml) — summing here handles a year split
    // across teams (traded mid-season) or across batting+pitching (two-way
    // players) the same way career totals do.
    //
    // Non-fatal on failure: bWAR is an enrichment on top of the MLB API stats
    // this function already tolerates failures on (see the `!res.ok` check
    // above), not something worth failing the whole page over.
    const seasonWar: Record<number, number> = {};
    const { data: bwarRows, error: bwarError } = await supabase
      .from("bwar_seasons")
      .select("year_id, war")
      .eq("mlb_id", data.id);
    if (bwarError) {
      console.error(`[bWAR] Failed to load season WAR for mlb_id ${data.id}: ${bwarError.message}`);
    }
    for (const row of bwarRows ?? []) {
      if (row.war === null) continue;
      seasonWar[row.year_id] = (seasonWar[row.year_id] ?? 0) + row.war;
    }

    // A season's bWAR is a full-season total, so when the MLB API splits a season
    // across multiple teams we attribute the total to the first stint only and
    // leave the other stint rows blank to avoid double-counting.
    const usedSeasons = new Set<string>();

    return {
      group: data.group,
      career: Object.keys(careerStat).length > 0 ? careerStat : null,
      seasons: (yearBlock?.splits ?? []).map((s) => {
        const season = s.season ?? "";
        const stat = clean(s.stat);
        const year = Number(season);
        if (!usedSeasons.has(season) && Number.isFinite(year) && year in seasonWar) {
          stat.bwar = seasonWar[year];
          usedSeasons.add(season);
        }
        return {
          season,
          team: s.team?.name ?? "",
          league: leagueAbbrev(s.league?.name),
          stat,
        };
      }),
    };
  });
