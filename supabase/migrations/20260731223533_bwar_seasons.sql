-- Baseball-Reference season-level WAR, synced from Baseball-Reference's public
-- war_daily_bat.txt / war_daily_pitch.txt bulk files by a scheduled GitHub
-- Action (see .github/workflows/sync-bwar.yml) using the real pybaseball
-- library. Not scoped to inductees only — holds any MLB player so a lookup
-- at admin-review time works for anyone, before they're ever inducted.
--
-- Career bWAR for a player is the sum of `war` across all their rows here.
-- A player with a season split across teams (traded mid-year) or who both
-- batted and pitched in the same year has multiple rows for that year;
-- summing handles both cases correctly.

create table public.bwar_seasons (
  mlb_id integer not null,
  year_id integer not null,
  player_type text not null check (player_type in ('bat', 'pitch')),
  team_id text,
  stint_id integer not null default 1,
  war numeric,
  war_rep numeric,
  waa numeric,
  updated_at timestamptz not null default now(),
  primary key (mlb_id, year_id, player_type, stint_id)
);

create index bwar_seasons_mlb_id_idx on public.bwar_seasons (mlb_id);

alter table public.bwar_seasons enable row level security;

-- Public reference data, same trust level as the published inductees table.
-- Only the sync job (service-role key, bypasses RLS) ever writes here.
create policy "Anyone can read bWAR data"
  on public.bwar_seasons for select
  using (true);
