Add support for user-provided bWAR values so each inductee's career stats page shows their Baseball-Reference WAR alongside MLB API stats.

Changes:
1. Extend `Inductee` type in `src/data/inductees.ts` with an optional `bwar: number | null` field.
2. Update `src/lib/mlb.functions.ts` to merge the static `bwar` value into the returned `career` `StatMap` as a synthetic stat key (e.g. `bwar`) so it flows through the existing stats pipeline.
3. Update `src/routes/players.$slug.tsx`:
   - Add `bwar` to the hero stat keys for both hitters and pitchers.
   - Add `bwar` column to the career totals table column lists.
   - Format bWAR to one decimal place.
4. Once the user pastes their name/bWAR list, parse it and populate `bwar` on the matching inductee records in `src/data/inductees.ts`.

Notes:
- bWAR is not available from the MLB Stats API, so it will be stored as a static override per inductee.
- Players without a bWAR value will display "—".
- The user only needs to paste a simple list (one per line: `Name, bWAR` or `Name: bWAR`); I will handle matching against existing names and updating the data file.