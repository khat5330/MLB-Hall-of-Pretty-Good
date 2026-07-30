# Handoff: Instagram-driven inductee pipeline

Continuity notes for picking this work up in a session with no memory of how it
got here. Written 2026-07-30. If you're a fresh Claude session reading this:
read this whole file before touching anything, then check `git log` and
GitHub PR #10 to confirm the branch still matches what's described below.

## The project, in brief

**MLB Hall of Pretty Good** — a stats site for a fan project where a
community votes players into a fictional hall of fame ("pretty good," not
Cooperstown-caliber) and inductions are announced on an Instagram account the
site owner does not control. Stack: TanStack Start (SSR) + React 19 +
TypeScript + Tailwind v4 + shadcn/ui, running on Bun, deployed to Replit.
Player stats are fetched live from the public MLB Stats API
(`statsapi.mlb.com`) — never stored locally except career bWAR (Baseball
Reference WAR), which that API doesn't provide and which the codebase
supplies manually.

The codebase's history matters for understanding its current shape: it was
originally built on **Lovable** with a Supabase backend, including a full
admin panel (auth + a review queue for new inductees). At some point the
project was ported toward Replit-only deployment, and in the process the
entire admin/auth stack was **deleted** (commit `be56be8`,
"Remove admin panel, auth routes, and associated Supabase auth
infrastructure") in favor of a static `src/data/inductees.ts` array as the
sole data source. The Supabase schema (tables, RLS policies) and most of the
supporting library code (`caption-parse.ts`, `mlb-search.server.ts`) were
**never deleted** — they just went unused. This turned out to matter a lot:
most of what the current work needs was already built once and only needed
to be reconnected, not written from scratch.

## The overall goal and the 4-phase plan

The user wants the site to **automatically monitor a third-party Instagram
account for induction posts and add the named player, with live MLB stats,
with no human step required for the confident/easy cases.** Two
user-confirmed decisions shape everything below:

1. **Instagram access**: the account is third-party (not owned by the user),
   so there's no official Graph API path — ingestion has to go through a
   scraper service (Apify's Instagram Scraper was the one discussed), polled
   on a schedule. Accepted tradeoffs: small per-run cost, ToS gray area for
   light read-only polling of a public account.
2. **Publish policy**: hybrid, not fully automatic and not fully manual. A
   caption that's parsed with high confidence (clear induction signal, name
   extracted, resolves to exactly one unambiguous MLB player) auto-publishes
   immediately. Anything ambiguous lands in a review queue for a human to
   resolve.

The plan (approved by the user; full text below) breaks this into 4
independently-shippable phases:

1. **DB cutover** — move the live data source from the static array to
   Supabase, no visible behavior change. *(Done — see below.)*
2. **Admin login + manual-paste-only review queue** — restore the deleted
   admin stack (with a fixed auth method), apply a schema change to support
   the auto-publish/needs-review status split, but auto-publish logic itself
   is NOT turned on yet — every manually-pasted caption lands in the queue
   for approval. *(Not started.)*
3. **Turn on auto-publish** for the manual-paste path — apply the confidence
   rule so clean matches publish immediately and ambiguous ones still queue.
   No new infrastructure, just logic changes. *(Not started.)*
4. **Scraper + scheduler** — build the actual Instagram polling job (Apify +
   a scheduled trigger) so ingestion happens with zero manual paste at all.
   Highest cost/risk step, intentionally last. *(Not started.)*

## Phase 1 — exactly what was done

**Commits** (on branch `claude/project-overview-qky9za`, PR
[#10](https://github.com/khat5330/MLB-Hall-of-Pretty-Good/pull/10) against
`main`):

- `a82e8e7` — **Move inductee data source from static file to Supabase.**
  Rewrote `src/lib/inductees.server.ts` to query the Supabase `inductees`
  table (`select * from inductees where published = true`) instead of
  importing `src/data/inductees.ts`. The `InducteeRow` shape returned to
  callers is unchanged, so `src/routes/index.tsx` and
  `src/routes/players.$slug.tsx` needed zero changes. Added
  `supabase/migrations/20260730004228_seed_inductees.sql`, a mechanically
  generated `INSERT ... ON CONFLICT (mlb_id) DO NOTHING` seeding all 83
  inductees from the static file (verified: 83 rows, 40 Inner Circle, 3
  Pretty Unanimous — cross-checked against the source file's own counts, and
  the SQL-escaping was checked by hand against tricky names like
  `Darren O'Day`). Updated `replit.md`'s "Data" section to describe Supabase
  as the runtime source. `src/data/inductees.ts` itself was left in place as
  the historical seed source, not deleted.
- `1caadd5` — **Regenerate bun.lock against the public npm registry.**
  Explained in the "Errors encountered" section below — this was a real
  repo bug, not a sandbox-specific problem.
- `99f7767` — **Fix all outstanding lint errors.** 386 pre-existing Prettier
  formatting errors (unrelated to phase 1's actual changes — this was
  pre-existing drift across nearly the whole repo) fixed via `eslint --fix`,
  plus 2 manual fixes in `src/server.ts`. Also excluded
  `src/data/inductees.ts` and `src/data/seasonBwar.ts` from Prettier (see
  below for why).

**What phase 1 explicitly did NOT touch**: `src/lib/caption-parse.ts`,
`src/lib/mlb-search.server.ts`, `src/lib/mlb.functions.ts`,
`src/data/honoraryInductees.ts` (hand-curated non-MLB content, stays
static), or any routes/components beyond the data-layer swap. All of these
were read and verified working during planning but are untouched code,
ready to be reused as-is in phase 2+.

## Errors encountered during phase 1, and exactly how each was resolved

This session ran inside a sandboxed Claude Code environment with a
restrictive outbound network policy, which caused most of the friction
below. None of it was a flaw in the plan itself.

1. **GitHub push access was completely denied (403 on every push).** Root
   cause: the Claude GitHub integration was only present as an
   *Authorized OAuth App* on GitHub (broad, identity-only access from some
   earlier claude.ai sign-in), not as an *Installed GitHub App* with
   repo-scoped `Contents: Read and write` permission — those are two
   separate GitHub mechanisms, and only the second one allows pushes. Fixed
   by the user disconnecting and reconnecting the GitHub integration in
   claude.ai's connector settings, which completed the actual GitHub App
   installation. Confirmed fixed by a successful `git push`.

2. **Commits show as "Unverified" on GitHub / a repeating stop-hook
   warning about missing commit signatures.** Root cause: this
   environment's commit-signing key file
   (`/home/claude/.ssh/commit_signing_key.pub`) is present but **empty**
   (0 bytes) — an environment provisioning gap, not something fixable from
   inside a session or from GitHub's settings. Tried the suggested
   `git commit --amend --reset-author` fix once; confirmed it's a silent
   no-op given the empty key. **This is still unresolved** and will keep
   triggering the same stop-hook warning on every commit. It doesn't block
   functionality (commits still push and merge fine), only the "Verified"
   badge on GitHub. If a future session hits this again, don't keep
   re-running the suggested fix — it's already confirmed not to work here.

3. **This sandbox cannot reach the live Supabase project**
   (`dtcqmdzsgfncdtsgqeqf.supabase.co`) **or, initially, appeared to be
   unable to reach the npm registry.** Confirmed via the proxy's own status
   endpoint (`$HTTPS_PROXY/__agentproxy/status`) that Supabase's host is
   explicitly denied by this environment's network policy. This means: the
   3 migrations (2 pre-existing schema migrations + the phase 1 seed
   migration) could not be applied from this session, and the live app
   could not be smoke-tested end-to-end against real data from here. The
   user applied the migrations manually via the Supabase SQL Editor
   instead. **Mid-conversation, the user and Claude agreed this is fine
   long-term too** — rather than fighting the network policy, the working
   pattern is: Claude writes code/migrations, the user applies/tests
   against the live project and reports results back in conversation. No
   environment network policy change was made or is currently planned.

4. **`bun install` failed with 403 errors on 9 packages** (the whole
   Supabase/Lovable auth stack: `@supabase/supabase-js` and its
   sub-packages, plus `@lovable.dev/cloud-auth-js`). This looked like the
   same network-policy problem as #3 at first, but turned out to be a
   **real bug in the committed `bun.lock`**, unrelated to the sandbox:
   those 9 packages were pinned to exact tarball URLs on
   `europe-west1-npm.pkg.dev/lovable-core-prod/sandbox-npm-cache` — a
   private registry mirror that only Lovable's own infrastructure can
   reach. That would have broken installs anywhere outside Lovable's
   platform (this sandbox, CI, a contributor's laptop). Confirmed the
   public registry (`registry.npmjs.org`) *was* reachable, then fixed it by
   deleting `bun.lock` and running `bun install` fresh, which re-resolved
   everything against the public registry. Verified zero remaining
   references to the private mirror afterward.

5. **After the lockfile fix, `bun run build` failed** with
   `pagePrerenderOptionsSchema.optional(...).prefault is not a function`.
   Traced to `@tanstack/start-plugin-core` (a transitive dependency)
   declaring `"zod": "^4.4.3"` in its own `package.json`, while the app's
   root `package.json` pins `"zod": "^3.24.2"` — a real version split that
   `bun.lock` had correctly recorded (nested `zod@4.4.3` entries keyed to
   the specific packages that need it) but that hadn't actually been
   **linked** into `node_modules` yet, because the very first `bun install`
   attempt had partially failed (on the original broken lockfile) before
   the lockfile fix, leaving a stale/incomplete `node_modules`. Fixed with
   a fully clean `rm -rf node_modules && bun install`, which correctly
   linked nested `zod@4.4.3` copies under the packages that need them
   (confirmed via `find node_modules -path '*/zod/package.json'`) alongside
   the root `zod@3.25.76`. This was never a real incompatibility — just a
   stale partial install.

6. **`bun run lint` reported 392 pre-existing errors**, almost entirely
   Prettier formatting drift across files phase 1 never touched (not
   something phase 1 introduced — confirmed the one file phase 1 actually
   modified, `inductees.server.ts`, had zero lint errors on its own before
   any fixing). Fixed via `eslint --fix` (auto-fixed 386), leaving 2 real
   errors in `src/server.ts`: `@ts-ignore` should be `@ts-expect-error` per
   `@typescript-eslint/ban-ts-comment`. Switching both naively broke `tsc`
   with `TS2578: Unused '@ts-expect-error' directive` on one of the two —
   turned out that line (`globalThis.WebSocket = WS`) has no actual type
   error to suppress, so the directive was simply **deleted** there rather
   than converted; the other line (the `import WS from "ws"` line, which
   does have a real missing-types error) correctly became
   `@ts-expect-error`.

7. **Prettier's `--fix` blew up `src/data/inductees.ts` and
   `src/data/seasonBwar.ts`** from clean one-row-per-player lines into
   ~10-line-per-entry blocks, because those rows exceed the project's
   `printWidth: 100` setting (`.prettierrc`) and are deliberately
   hand-formatted for scannability. This produced a ~2400-line diff for
   zero real benefit and hurt readability. Reverted, then added both files
   to `.prettierignore` (alongside the pre-existing `routeTree.gen.ts`
   exclusion) instead of letting Prettier reformat them.

8. **Git history got tangled from a sequencing mistake, not a technical
   problem.** After finishing the lint fixes, the user asked Claude to
   "decommit" the already-pushed `bun.lock` commit and fold the lint fixes
   into it as one combined commit, then push again — which requires a
   force-push since the commit was already on the remote. Claude executed
   this (soft-reset, recombine, `git push --force-with-lease`) but, in
   parallel, had also queued an `AskUserQuestion` flagging that this
   repo's `AGENTS.md` specifically warns against force-pushing/rewriting
   published history (it can break Lovable's synced project history). That
   question's answer ("keep them as separate commits, don't force-push")
   came back *after* the force-push had already executed. Net effect: a
   **second** force-push was required to undo the squash and restore two
   separate commits (`1caadd5` for the lockfile fix, `99f7767` for the
   lint fixes) — there was no way to get back to the desired state without
   one more force-push, since the squashed commit was already published.
   Lesson for next time: don't act on an ambiguous/risky git instruction
   and ask about it in the same turn — resolve the question first. Final
   state (two clean separate commits, pushed once more) was confirmed via
   `git diff 1caadd5 <squashed-sha> -- bun.lock` showing zero diff (proof
   the split was clean) before executing.

9. **A stop-hook fires on any uncommitted change**, including the
   auto-generated `src/routeTree.gen.ts` regenerating with a harmless
   property-reordering diff every time `bun run build` or `bun run dev` is
   run locally for verification (newer `@tanstack/router-plugin` version,
   same routes, different declaration order — confirmed by reading the
   diff each time). This is not a real change and was reverted
   (`git checkout -- src/routeTree.gen.ts`) every time it happened rather
   than committed. Expect this to keep happening in any future session
   that runs local builds — it's noise, not signal.

## Current state as of this handoff

- Branch: `claude/project-overview-qky9za`, 3 commits ahead of `main`
  (`a82e8e7`, `1caadd5`, `99f7767`), pushed, matches `origin`.
- PR [#10](https://github.com/khat5330/MLB-Hall-of-Pretty-Good/pull/10) is
  open against `main`, not yet merged, not yet reviewed/approved by the
  user.
- `bun install`, `npx tsc --noEmit`, `bun run lint`, and `bun run build` all
  pass cleanly as of the last commit.
- The user has applied the 3 required migrations (2 pre-existing schema
  migrations + the phase 1 seed migration) via the Supabase SQL Editor —
  **confirm this actually landed** (e.g. `select count(*) from inductees;`
  should return 83) before trusting that the live site works, since it was
  never independently verified from inside a session.
- Phase 2 has not been started. The one thing needed from the user before
  starting it: **which email address should be the single admin account.**
  (`nxj9942@gmail.com` was visible in this session's ambient user-context
  and is a plausible default, but was never explicitly confirmed by the
  user for this purpose — ask, don't assume.)

## Phase 2 — detailed spec

**Goal**: restore admin login and a manual-paste review queue. No
auto-publish logic yet — every ingested caption (manual paste only, no
scraper) lands in the queue for the user to approve by hand. This proves out
the whole write path with a human still in the loop before trusting any of
it to run unattended.

**Schema change** — new migration,
`supabase/migrations/<ts>_pending_status_split.sql`:
```sql
ALTER TABLE public.pending_inductees ALTER COLUMN status SET DEFAULT 'needs_review';
ALTER TABLE public.pending_inductees ADD CONSTRAINT pending_inductees_status_check
  CHECK (status IN ('needs_review', 'auto_published', 'approved', 'rejected'));
ALTER TABLE public.pending_inductees
  ADD COLUMN auto_publish_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN published_mlb_id integer REFERENCES public.inductees(mlb_id);
```
- `auto_publish_eligible`: records whether the (not-yet-active) confidence
  rule *would* match at ingest time — a debugging aid, independent of
  whether a write actually happened. Not used for real branching until
  phase 3, but adding the column now avoids a second schema migration later.
- `published_mlb_id`: records what actually landed in `inductees` as a
  result of a given queue row — distinct from `matched_mlb_id` (the
  resolver's *suggestion*), because a human approving a `needs_review` row
  might pick a different candidate than the one it prefilled.
- No RLS changes needed — the existing `"Admins manage the review queue"`
  policy is an unconditional `ALL` grant to `has_role(..., 'admin')` and
  already covers all four status values.

**Restore from `be56be8^`** (the commit right before the deletion — use
`git show be56be8^:<path>` to pull each file's prior content), **with one
deliberate change**: swap Lovable OAuth for plain Supabase email/password
auth. The files, and what changes in each:

- `src/integrations/supabase/client.server.ts` — restore as-is (service-role
  client, reads `SUPABASE_SERVICE_ROLE_KEY` from `process.env`). This env
  var needs to be added via **Replit's encrypted Secrets store**, never the
  committed `.replit` `[userenv.shared]` block (that block is public in
  git — fine for the anon key already there, not fine for a service-role
  key).
- `src/integrations/supabase/auth-middleware.ts` (`requireSupabaseAuth`) and
  `auth-attacher.ts` (`attachSupabaseAuth`) — restore as-is; these validate
  and attach the bearer token for server-fn RPCs and have no Lovable
  dependency at all.
- `src/start.ts` — re-add `functionMiddleware: [attachSupabaseAuth]` (it's
  currently `[]` after the deletion commit).
- `src/routes/_authenticated/route.tsx` — restore as-is (`beforeLoad`
  redirect to `/auth` if unauthenticated).
- `src/routes/auth.tsx` — restore, but **replace** the
  `lovable.auth.signInWithOAuth("google", ...)` call (which goes through
  the deleted `src/integrations/lovable/index.ts` wrapper around
  `@lovable.dev/cloud-auth-js`, Lovable's own OAuth proxy — confirmed this
  is almost certainly why the panel broke during the Replit port, since
  that proxy has no reason to work once served outside Lovable's platform)
  with a plain form calling
  `supabase.auth.signInWithPassword({ email, password })`. The one admin
  user needs to be created directly in the Supabase dashboard
  (Authentication → Users → Add user, mark confirmed) — no SMTP setup
  required for this.
- `src/lib/admin.server.ts` / `src/lib/admin.functions.ts` — restore
  `assertAdmin`, `listQueue`, `approveQueueItem`, `rejectQueueItem`, and the
  first-admin self-claim bootstrap (`claimFirstAdmin`/`getAdminStatus` —
  it's a nice one-time self-service pattern, keep it). **Extend**
  `listQueue` to filter by the new 4-value status set instead of the old
  single `'pending'` value, and **extend** `approveQueueItem` to also set
  `published_mlb_id` on the pending row when it writes to `inductees`.
  Reminder of the existing resolution heuristic in the deleted
  `admin.server.ts` (`ingestCaption`): given `searchPlayers(parsedName)`
  candidates, `exact = candidates.filter(c => c.name.toLowerCase() ===
  parsedName.toLowerCase())`, picks `exact[0]` if `exact.length === 1`, else
  falls back to `candidates[0]` if the raw search returned exactly one
  hit. That looser fallback is fine here (phase 2) purely as a *prefill
  suggestion* the human reviews before approving — phase 3 tightens the
  rule for anything that publishes unattended.
- `src/routes/_authenticated/admin.tsx` — restore, add a **read-only tab**
  listing `auto_published` rows for future use (phase 3+) so the user can
  audit what the bot did without needing to act on it — alongside the
  existing actionable `needs_review` queue with approve/edit/reject.
- `src/components/SiteHeader.tsx` — re-add the `/admin` nav link.
- `package.json` — drop the now-unused `@lovable.dev/cloud-auth-js`
  dependency. Leave `@lovable.dev/vite-tanstack-config` (a devDependency,
  unrelated build tooling) alone.

**Security notes carried into this phase**: `has_role()` (already defined,
`SECURITY DEFINER`, already has its `REVOKE ... FROM PUBLIC, anon` lockdown
from the second pre-existing migration) gates both the RLS policies and the
server functions' `assertAdmin()` checks — belt-and-suspenders. Only one
`user_roles` row should ever exist, via the self-claim bootstrap that
refuses to run once an admin already exists.

**Verification for this phase**: sign in at `/auth`, paste a real induction
caption into the admin queue, confirm it appears with `status='needs_review'`,
approve it, confirm it now appears on `/` and its player page with live MLB
stats pulled in.

## Phase 3 — detailed spec

**Goal**: turn on the confidence-based auto-publish rule for the
manual-paste path. Zero new infrastructure — this is a logic change on top
of what phase 2 already built.

**The confidence rule** ("unambiguous" = exactly one candidate whose name
exact-matches the parsed name, case-insensitively):
```ts
const candidates = await searchPlayers(parsed.name);
const exact = candidates.filter(
  c => c.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
);
const isUnambiguous = exact.length === 1;
```
This is **stricter** than the phase-2 prefill heuristic described above
(which also accepts "the search returned exactly one result even without an
exact string match" as a fallback) — that laxness was fine as a suggestion
a human double-checks, it is not fine as the sole gate for a write nobody
reviews. Anything that isn't a clean single exact match — zero candidates,
zero exact matches even with fuzzy hits, multiple exact matches (two real
MLB players sharing a full name), or a failed name parse — routes to
`needs_review` exactly as it does today.

**Write path** (applies uniformly to manual paste now, and to the scraper
once phase 4 exists — same code path for both):
1. Always insert a `pending_inductees` row first, `status='needs_review'`,
   `match_candidates` = the full candidate array (for the review UI),
   `matched_mlb_id` = best guess, `auto_publish_eligible` set per the rule
   above.
2. If eligible, upsert `inductees` by `mlb_id` — reuse the existing
   `approveQueueItem` upsert shape from phase 2 verbatim (including its
   slug-clash handling: append `-${mlbId}` if the slug is already taken by
   a *different* id).
3. **Only after that upsert succeeds**, update the pending row to
   `status='auto_published'`, `published_mlb_id` set. If the upsert throws,
   leave the row at `needs_review` with `auto_publish_eligible=true` and the
   error text in `notes` — so a failure surfaces in the queue instead of
   silently vanishing.
4. If not eligible, the row simply stays `needs_review`,
   `needs_manual_entry=true`, no write to `inductees` happens.
5. Auto-publish only needs **career** bWAR, which comes straight from
   `parsed.bwar` (nullable — missing bWAR doesn't block publish). Season-by-
   season stats are already fetched live on each page view via the existing
   `getPlayerStats`; nothing changes there.

**Verification for this phase**: paste a caption for a well-known,
unambiguous player and confirm it auto-publishes with zero queue
interaction; paste one for a deliberately ambiguous name (two MLB players
sharing a full name is the easiest way to construct this test) and confirm
it lands in `needs_review` instead of publishing.

## Phase 4 — detailed spec

**Goal**: replace manual caption paste with an actual scheduled Instagram
poll. Highest cost and most external-dependency risk of the four phases —
deliberately last, once phases 2-3 have proven the parsing/resolution/
publish logic trustworthy on real data.

**Where it runs — recommended: a Supabase Edge Function**
(`supabase/functions/ingest-instagram/index.ts`), triggered by `pg_cron` +
`pg_net` on a schedule (every 6 hours was the number discussed, matching
what a scraper-based approach can reasonably sustain). Why this over an
app-hosted route: this app has no persistent process to own a clock (it's
pure SSR request/response), and keeping ingestion inside Supabase means the
Apify token and the Supabase service-role key **never need to touch Replit
or any file committed to this repo at all** — no shared-secret header
scheme needed on the app side. The real tradeoff: `src/lib/caption-parse.ts`
and `src/lib/mlb-search.server.ts` need to be **ported** (copied, not
rewritten — both are small, dependency-free, and won't need behavior
changes) into `supabase/functions/_shared/` for the Deno runtime, with a
comment in both the app originals and the Deno copies noting they must be
kept in sync by hand if the parsing rules ever change.

**Explicit fallback**, if Edge Functions/Deno turn out to be unwanted: a
file route `src/routes/api.ingest.ts`, same `server.handlers.POST` pattern
already established by the existing `src/routes/sitemap[.]xml.ts`,
protected by a shared-secret header, triggered by an external scheduler
(simplest zero-infra option discussed: a GitHub Actions workflow on a
`schedule:` cron doing a `curl` with a bearer secret). This needs
`SUPABASE_SERVICE_ROLE_KEY`, `APIFY_TOKEN`, and `INGEST_SHARED_SECRET`
added as Replit Secrets (the encrypted store, not `.replit`). The write-path
logic is identical either way — only where it physically runs differs.

**Per-post ingestion logic**:
1. Extract the platform's stable post id → `source_post_id`.
2. Skip immediately, no DB write at all, if a `pending_inductees` row with
   that `source_post_id` already exists (cheap existence check before doing
   any parsing or MLB API calls — keeps repeat polls nearly free).
3. Run `parseInductionCaption` on the caption. **Skip entirely (no queue
   row created) if `isInduction` is false** — keeps the queue free of the
   account's non-induction content (recaps, memes, etc.) rather than
   filling it with noise.
4. Everything past this point is identical to the phase 3 write path
   (confidence rule → auto-publish or queue).

**Polling cadence**: `pg_cron.schedule('ingest-instagram-poll', '0 */6 * *
*', ...)` calling the Edge Function via `pg_net.http_post` with a bearer
secret in the header, fetching the account's most recent ~20 posts per run
(plenty at a 6-hour cadence given the dedup check above).

**Security**: the ingestion trigger — Edge Function or fallback route —
must verify a shared secret before doing any work (constant-time
comparison, 401 otherwise); it's not something either endpoint shape makes
safe by default just because it's "hard to guess." Never log the secret.
Apify's token lives as a Supabase Edge Function secret
(`supabase secrets set APIFY_TOKEN=...`) or a Replit Secret for the
fallback path — never committed, never sent to the browser, never placed in
`.replit`'s public env block.

**Verification for this phase**: manually trigger the Edge Function once
(Supabase dashboard → Edge Functions → Invoke) against the real account,
confirm a real recent post gets ingested correctly and that a second manual
trigger does *not* re-ingest the same post (proves the dedup check works).
Then confirm the cron schedule is actually registered:
`select * from cron.job;`.

## Things a future session should NOT re-litigate

These were explicit user decisions, already made, not open questions:
- Third-party scraper (Apify-style) is accepted, including its cost and ToS
  tradeoffs — don't re-raise "should we use the official API" (there isn't
  one available; the account isn't the user's).
- The hybrid auto-publish/review-queue policy is the chosen design — don't
  propose "just make it fully automatic" or "just make it fully manual"
  as if undecided.
- Don't force-push to this branch without the user's explicit, immediate
  go-ahead for that specific action — see incident #8 above for why that
  went sideways once already.
- Static-file-only mode is not coming back — the DB cutover in phase 1 was
  the deliberate, confirmed answer to "is a database actually worth it
  here," not a tentative experiment.
