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

Inductee data lives in `src/data/inductees.ts` as a static array. The server functions in `src/lib/inductees.server.ts` read directly from this file — no database required.

Honorary inductees (e.g. Pablo Sanchez) are in `src/data/honoraryInductees.ts`.

Season BWAR data is in `src/data/seasonBwar.ts`.

## Notes

- The codebase was originally built on Lovable with a Supabase backend. The Supabase integration (`src/integrations/supabase/`) and migrations (`supabase/`) are still present but the server functions now use the static data files instead.
- `src/server.ts` polyfills `globalThis.WebSocket` for SSR using the `ws` package (required by the Supabase realtime client that ships as a transitive dependency).
- The admin route (`/admin`) requires Supabase auth — it will not function without a connected Supabase project.

## User preferences

- Keep the existing project structure and stack.
