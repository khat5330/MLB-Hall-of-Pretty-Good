import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { inducteesBySlug, type Inductee } from "@/data/inductees";
import { getPlayerStats, type StatMap } from "@/lib/mlb.functions";

const HITTING_COLS: Array<[string, string]> = [
  ["gamesPlayed", "G"],
  ["plateAppearances", "PA"],
  ["atBats", "AB"],
  ["runs", "R"],
  ["hits", "H"],
  ["doubles", "2B"],
  ["triples", "3B"],
  ["homeRuns", "HR"],
  ["rbi", "RBI"],
  ["stolenBases", "SB"],
  ["baseOnBalls", "BB"],
  ["strikeOuts", "SO"],
  ["avg", "AVG"],
  ["obp", "OBP"],
  ["slg", "SLG"],
  ["ops", "OPS"],
];

const PITCHING_COLS: Array<[string, string]> = [
  ["wins", "W"],
  ["losses", "L"],
  ["era", "ERA"],
  ["gamesPlayed", "G"],
  ["gamesStarted", "GS"],
  ["saves", "SV"],
  ["inningsPitched", "IP"],
  ["hits", "H"],
  ["runs", "R"],
  ["earnedRuns", "ER"],
  ["homeRuns", "HR"],
  ["baseOnBalls", "BB"],
  ["strikeOuts", "SO"],
  ["whip", "WHIP"],
];

const HITTING_HERO = ["gamesPlayed", "hits", "homeRuns", "rbi", "stolenBases", "avg", "obp", "ops"];
const PITCHING_HERO = ["wins", "losses", "era", "inningsPitched", "strikeOuts", "whip", "saves", "gamesStarted"];

const statsQueryOptions = (player: Inductee) =>
  queryOptions({
    queryKey: ["player-stats", player.id, player.pos],
    queryFn: () =>
      getPlayerStats({
        data: { id: player.id, group: player.pos === "P" ? "pitching" : "hitting" },
      }),
    staleTime: 1000 * 60 * 60,
  });

export const Route = createFileRoute("/players/$slug")({
  loader: ({ params, context }) => {
    const player = inducteesBySlug.get(params.slug);
    if (!player) throw notFound();
    return context.queryClient.ensureQueryData(statsQueryOptions(player));
  },
  head: ({ params }) => {
    const player = inducteesBySlug.get(params.slug);
    const title = player
      ? `${player.name} — Hall of Pretty Good Stats`
      : "Player — Hall of Pretty Good";
    const description = player
      ? `Career and season-by-season statistics for ${player.name} (${player.debut}–${player.last}), inductee of the MLB Hall of Pretty Good.`
      : "Career and season-by-season statistics for Hall of Pretty Good inductees.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PlayerPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-5xl px-4 py-12" role="alert">
      <p className="text-sm text-muted-foreground">Could not load stats: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm text-muted-foreground">That player is not an inductee (yet).</p>
      <Link to="/" className="text-sm text-primary underline">
        Back to the database
      </Link>
    </div>
  ),
});

function fmt(value: StatMap[string] | undefined) {
  if (value === undefined || value === null || value === "" || value === "-.--" || value === ".---")
    return "—";
  return String(value);
}

function PlayerPage() {
  const { slug } = Route.useParams();
  const player = inducteesBySlug.get(slug)!;
  const { data } = useSuspenseQuery(statsQueryOptions(player));

  const isPitcher = data.group === "pitching";
  const cols = isPitcher ? PITCHING_COLS : HITTING_COLS;
  const heroKeys = isPitcher ? PITCHING_HERO : HITTING_HERO;
  const labels = new Map(cols);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link to="/" className="text-xs text-primary underline underline-offset-2">
          ← All inductees
        </Link>

        <div className="mt-3 border-b-2 border-primary pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-4xl">
            {player.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {player.pos} · Bats: {player.bats} / Throws: {player.throws} · {player.debut}–
            {player.last}
          </p>
          <a
            href={`https://www.baseball-reference.com/search/search.fcgi?search=${encodeURIComponent(player.name)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs font-medium text-primary underline underline-offset-2"
          >
            View on Baseball-Reference
          </a>
        </div>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Career totals
          </h2>
          {data.career ? (
            <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4 lg:grid-cols-8">
              {heroKeys.map((key) => (
                <div key={key} className="bg-secondary px-3 py-3 text-center">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    {labels.get(key) ?? key}
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-semibold text-primary">
                    {fmt(data.career?.[key])}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Career totals unavailable.</p>
          )}

          {data.career && (
            <div className="mt-4 overflow-x-auto border border-border">
              <table className="stat-table">
                <thead>
                  <tr>
                    <th scope="col">Career</th>
                    {cols.map(([key, label]) => (
                      <th key={key} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold">Total</td>
                    {cols.map(([key]) => (
                      <td key={key}>{fmt(data.career?.[key])}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Season by season
          </h2>
          <div className="mt-3 overflow-x-auto border border-border">
            <table className="stat-table">
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Team</th>
                  <th scope="col">Lg</th>
                  {cols.map(([key, label]) => (
                    <th key={key} scope="col">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.seasons.map((row, i) => (
                  <tr key={`${row.season}-${row.team}-${i}`}>
                    <td className="font-semibold">{row.season}</td>
                    <td>{row.team}</td>
                    <td>{row.league}</td>
                    {cols.map(([key]) => (
                      <td key={key}>{fmt(row.stat[key])}</td>
                    ))}
                  </tr>
                ))}
                {data.seasons.length === 0 && (
                  <tr>
                    <td colSpan={cols.length + 3} className="!text-left text-muted-foreground">
                      No season data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}