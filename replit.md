# MLB Hall of Pretty Good

A searchable inductee database for the MLB Hall of Pretty Good, built with TanStack Start (SSR), React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Running the app

```
bun install && bun run dev
```

The dev server starts on **port 5000**.

## Stack

- **Framework**: TanStack Start (file-based routing, SSR)
- **Runtime**: Bun
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Data fetching**: TanStack Query + TanStack Start server functions
- **Stats**: MLB Stats API (live, fetched at runtime per player page)

## Data

Inductee data lives in the Supabase `inductees` table. The server functions in `src/lib/inductees.server.ts` query it directly (public reads are scoped to `published = true` rows via RLS). `src/data/inductees.ts` is kept as the historical seed source — see `supabase/migrations/*_seed_inductees.sql` — and is no longer read at runtime.

Honorary inductees (e.g. Pablo Sanchez) are in `src/data/honoraryInductees.ts` — hand-curated, non-MLB content, still static by design.

Career and season-by-season Baseball-Reference WAR (bWAR — not available from the MLB Stats API) live in the Supabase `bwar_seasons` table, synced weekly from Baseball-Reference by `.github/workflows/sync-bwar.yml` using the real `pybaseball` Python library (a plain TypeScript `fetch()` gets blocked by Baseball-Reference's bot protection). That same job refreshes the `bwar` column on already-published `inductees` rows so career totals stay current as players keep accumulating WAR.

## Notes

- The codebase was originally built on Lovable with a Supabase backend, then briefly moved to a static-file data source during the Replit port. It has since been moved back to Supabase to support inductees being added by an automated pipeline (see the review-queue schema in `supabase/migrations/`) rather than only by code deploy.
- `src/server.ts` polyfills `globalThis.WebSocket` for SSR using the `ws` package (required by the Supabase realtime client that ships as a transitive dependency).
- The admin route (`/admin`) requires Supabase auth — it will not function without a connected Supabase project.

## User preferences

- Keep the existing project structure and stack.
