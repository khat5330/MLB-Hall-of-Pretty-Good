import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Crown, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { inductees } from "@/data/inductees";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MLB Hall of Pretty Good — Inductee Database" },
      {
        name: "description",
        content:
          "Search every inductee to the MLB Hall of Pretty Good and browse full career and season-by-season statistics.",
      },
      { property: "og:title", content: "MLB Hall of Pretty Good — Inductee Database" },
      {
        property: "og:description",
        content: "Search every inductee to the MLB Hall of Pretty Good and browse full career and season-by-season statistics.",
      },
    ],
  }),
  component: Index,
});

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function Index() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const list = q
      ? inductees.filter(
          (p) => normalize(p.name).includes(q) || normalize(p.pos).startsWith(q),
        )
      : inductees;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          The MLB Hall of Pretty Good
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every inductee, with full career totals and a season-by-season breakdown. Stats
          courtesy of the official MLB Stats API.
        </p>

        <div className="mt-6">
          <label htmlFor="player-search" className="sr-only">
            Search inductees
          </label>
          <input
            id="player-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a player…"
            autoComplete="off"
            className="w-full rounded-sm border border-input bg-background px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {results.length} of {inductees.length} inductees
          </p>
        </div>

        <div className="mt-4 overflow-x-auto border border-border">
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">Player</th>
                <th scope="col">Pos</th>
                <th scope="col">B/T</th>
                <th scope="col">Yrs</th>
              </tr>
            </thead>
            <tbody>
              {results.map((p) => (
                <tr key={p.slug}>
                  <td>
                    <Link
                      to="/players/$slug"
                      params={{ slug: p.slug }}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {p.name}
                    </Link>
                    {p.innerCircle && (
                      <Star
                        aria-label="Inner Circle inductee"
                        className="ml-1.5 inline-block h-3.5 w-3.5 -translate-y-px fill-[hsl(45_95%_50%)] text-[hsl(45_80%_38%)]"
                      />
                    )}
                    {p.prettyUnanimous && (
                      <Crown
                        aria-label="Pretty Unanimous inductee"
                        className="ml-1 inline-block h-3.5 w-3.5 -translate-y-px fill-[hsl(45_95%_50%)] text-[hsl(45_80%_38%)]"
                      />
                    )}
                  </td>
                  <td>{p.pos}</td>
                  <td>
                    {p.bats}/{p.throws}
                  </td>
                  <td>
                    {p.debut}–{p.last}
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="!text-left text-muted-foreground">
                    No inductees match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
