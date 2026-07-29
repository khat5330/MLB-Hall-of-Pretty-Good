## What you're asking for

Watch the Instagram account for "player inducted" posts, pull the name + bWAR out of the caption, look the player up in the MLB API, and drop them into a review queue you approve before they appear on the site.

## The honest constraint

You don't control the account, so Meta's official API is unavailable. The only way to read its posts programmatically is a third-party Instagram scraping service (Apify's Instagram Scraper is the most reliable; ~$0.10–$1 per run depending on volume). Tradeoffs you should know before we build:

- It's against Instagram's Terms of Service. Practically, read-only polling of a public account a few times a day is low-risk, but it's not sanctioned.
- Scrapers break when Instagram changes things. Expect occasional outages.
- It needs a paid account and an API token from you.

Because of that, I'll build the pipeline so the Instagram fetcher is one swappable input, and there's always a **manual paste** path: you paste a caption (or several), the same parser runs, and the results land in the same review queue. That way the site works even if the scraper is down or you'd rather not use one.

## How it will work

```text
Instagram post  ──(scheduled poll, every 6h)──┐
                                              ├──► caption matcher ──► parser (name + bWAR)
Manual caption paste (admin page) ────────────┘                              │
                                                                              ▼
                                                            MLB API name → player ID lookup
                                                                              ▼
                                                            PENDING queue (admin review)
                                                                              ▼
                                              you confirm name / ID / bWAR / inner-circle
                                                                              ▼
                                                            published → live on the site
```

## What gets built

**1. Backend (Lovable Cloud)**
The site's inductees are currently a hardcoded file. A review queue needs real storage, so I'll enable Lovable Cloud and move inductees into a database table, plus a `pending_inductees` table for the queue. The public site reads only published rows — behavior stays identical to today, with the same data migrated over.

**2. Admin login**
Email/password login gated to your account only (admin role in a separate roles table). The queue and manual paste live behind it; nothing else about the public site changes.

**3. Caption matcher and parser**
You give me 3–5 real induction captions plus the keywords/format. I write a matcher (keyword + shape rules, e.g. "has been voted into the Hall of Pretty Good") and a parser that pulls the player name and the bWAR number. Anything that matches but doesn't fully parse still enters the queue flagged "needs manual entry" — nothing silently gets dropped.

**4. MLB player resolution**
Search the MLB Stats API by parsed name. Exact single match → prefilled. Multiple or fuzzy matches → the queue shows candidates (with debut year, position, team) for you to pick. No match → you enter the ID manually.

**5. Review queue page**
Each pending item shows the source post (image + caption + link), the parsed name and bWAR, the matched MLB player with a stats preview, and editable fields. Buttons: Approve & publish, Edit, Reject. Approving writes the inductee and it's live immediately.

**6. Scheduled polling**
A public endpoint protected by a secret, called every 6 hours by a scheduler. It fetches the account's recent posts through the scraper, skips post IDs already seen, and runs new ones through the matcher. Duplicate protection keys off the Instagram post ID, so re-runs are safe.

## What I need from you

1. 3–5 example induction captions, verbatim, plus a non-induction post or two so I can tune the matcher against false positives.
2. An Apify (or equivalent) API token — I'll request it securely when we get to that step. If you'd rather skip the scraper entirely, say so and I'll build steps 1–5 with the manual paste path only, and we can add polling later.
3. The email address you want as the admin account.

## Suggested build order

1. Cloud + database + migrate the existing 83 inductees, public site unchanged.
2. Admin login and the review queue UI, fed by manual caption paste.
3. Caption matcher + parser tuned against your real examples.
4. MLB name → ID resolution with candidate picker.
5. Instagram polling endpoint + scheduler (only if you go with the scraper).

Steps 1–4 give you a fully working "paste a caption, review, publish" flow with no third-party dependency and no ToS question. Step 5 is what makes it hands-off.

## Technical notes

- Storage: Lovable Cloud (Postgres) with row-level security — public read on published inductees, admin-only on the pending queue.
- Polling: a `/api/public/*` endpoint verifying a shared secret header, invoked by pg_cron on a 6-hour schedule; the scraper token stays server-side.
- Parsing: deterministic regex/keyword rules first. If your captions turn out too free-form for that, I'd fall back to a single AI call through the built-in AI gateway to extract name + bWAR as structured JSON — more tolerant of phrasing, and the review queue catches any misread.
- Idempotency: unique constraint on the Instagram post ID prevents duplicate queue entries across polls.
- Stats remain live from the MLB Stats API on page load, exactly as they work now; only the inductee roster and bWAR are stored.
