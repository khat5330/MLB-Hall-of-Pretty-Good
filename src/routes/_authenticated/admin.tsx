import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import {
  approveInductee,
  claimFirstAdmin,
  getAdminStatus,
  listReviewQueue,
  lookupPlayers,
  queueCaption,
  rejectQueueItem,
  type PlayerCandidate,
  type QueueItem,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Review queue — Hall of Pretty Good Admin" },
      {
        name: "description",
        content: "Review induction posts and publish new Hall of Pretty Good inductees.",
      },
      { property: "og:title", content: "Review queue — Hall of Pretty Good Admin" },
      {
        property: "og:description",
        content: "Review induction posts and publish new Hall of Pretty Good inductees.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = useServerFn(getAdminStatus);
  const claim = useServerFn(claimFirstAdmin);

  const statusQuery = useQuery({ queryKey: ["admin-status"], queryFn: () => status({}) });

  const claimMutation = useMutation({
    mutationFn: () => claim({}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-status"] }),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-3">
          <h1 className="text-2xl font-bold text-primary">Induction review queue</h1>
          <button
            type="button"
            onClick={signOut}
            className="rounded-sm border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
          >
            Sign out
          </button>
        </div>

        {statusQuery.isPending && (
          <p className="mt-6 text-sm text-muted-foreground">Checking your access…</p>
        )}

        {statusQuery.error && (
          <div className="mt-6 border border-destructive bg-secondary p-5">
            <h2 className="font-semibold text-destructive">Could not check admin access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {(statusQuery.error as Error).message}
            </p>
          </div>
        )}

        {statusQuery.data && !statusQuery.data.isAdmin && (
          <div className="mt-6 border border-border bg-secondary p-5">
            {statusQuery.data.canClaim ? (
              <>
                <h2 className="font-semibold text-foreground">Claim administrator access</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  No administrator exists yet. Claim it now to lock the admin area to your account.
                </p>
                <button
                  type="button"
                  onClick={() => claimMutation.mutate()}
                  disabled={claimMutation.isPending}
                  className="mt-4 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {claimMutation.isPending ? "Claiming…" : "Make me the administrator"}
                </button>
                {claimMutation.error && (
                  <p className="mt-2 text-sm text-destructive">
                    {(claimMutation.error as Error).message}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                This account does not have administrator access.
              </p>
            )}
          </div>
        )}

        {statusQuery.data?.isAdmin && <AdminConsole />}
      </main>
      <SiteFooter />
    </div>
  );
}

function AdminConsole() {
  const queryClient = useQueryClient();
  const list = useServerFn(listReviewQueue);
  const queue = useServerFn(queueCaption);

  const [caption, setCaption] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const pending = useQuery({
    queryKey: ["review-queue", "needs_review"],
    queryFn: () => list({ data: { status: "needs_review" } }),
  });

  // Nothing publishes automatically yet (that's phase 3), so this list is
  // always empty for now — the tab exists so the UI doesn't need to change
  // again once auto-publish is turned on.
  const autoPublished = useQuery({
    queryKey: ["review-queue", "auto_published"],
    queryFn: () => list({ data: { status: "auto_published" } }),
  });

  const addMutation = useMutation({
    mutationFn: () => queue({ data: { caption, sourceUrl: sourceUrl || null } }),
    onSuccess: () => {
      setCaption("");
      setSourceUrl("");
      queryClient.invalidateQueries({ queryKey: ["review-queue"] });
    },
  });

  return (
    <>
      <section className="mt-6 border border-border bg-secondary p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Paste an induction caption
        </h2>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          placeholder="Alex Gordon received 97% of over 39,300 votes and is now officially the 82nd member of the Hall of Pretty Good! Welcome to the Inner Circle."
          className="mt-3 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="Post link (optional)"
          className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="button"
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || caption.trim().length === 0}
          className="mt-3 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {addMutation.isPending ? "Reading caption…" : "Add to review queue"}
        </button>
        {addMutation.error && (
          <p className="mt-2 text-sm text-destructive">{(addMutation.error as Error).message}</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Awaiting review ({pending.data?.length ?? 0})
        </h2>
        {pending.isPending && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
        {pending.error && (
          <p className="mt-3 text-sm text-destructive">{(pending.error as Error).message}</p>
        )}
        {pending.data?.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">Nothing waiting. All caught up.</p>
        )}
        <div className="mt-3 space-y-4">
          {pending.data?.map((item) => (
            <QueueCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Auto-published ({autoPublished.data?.length ?? 0})
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Read-only audit trail of items an automated confidence rule published without review.
          Nothing publishes automatically yet, so this is always empty for now.
        </p>
        {autoPublished.error && (
          <p className="mt-3 text-sm text-destructive">{(autoPublished.error as Error).message}</p>
        )}
        {autoPublished.data?.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">Nothing here yet.</p>
        )}
        <div className="mt-3 space-y-3">
          {autoPublished.data?.map((item) => (
            <article key={item.id} className="border border-border bg-background p-4 text-sm">
              <p className="text-foreground">{item.sourceCaption}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Published as MLB id {item.publishedMlbId} · {item.createdAt}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function QueueCard({ item }: { item: QueueItem }) {
  const queryClient = useQueryClient();
  const approve = useServerFn(approveInductee);
  const reject = useServerFn(rejectQueueItem);
  const lookup = useServerFn(lookupPlayers);

  const initial =
    item.candidates.find((c) => c.mlbId === item.matchedMlbId) ?? item.candidates[0] ?? null;

  const [candidates, setCandidates] = useState<PlayerCandidate[]>(item.candidates);
  const [selected, setSelected] = useState<PlayerCandidate | null>(initial);
  const [name, setName] = useState(item.parsedName ?? "");
  const [bwar, setBwar] = useState(item.parsedBwar === null ? "" : String(item.parsedBwar));
  const [innerCircle, setInnerCircle] = useState(item.parsedInnerCircle);
  const [prettyUnanimous, setPrettyUnanimous] = useState(false);

  // Picking a candidate refreshes the bWAR field from its Baseball-Reference
  // total (when we have one), so switching matches doesn't leave a stale
  // number from whichever candidate was previously selected.
  function selectCandidate(candidate: PlayerCandidate | null) {
    setSelected(candidate);
    if (candidate?.careerBwar != null) setBwar(String(candidate.careerBwar));
  }

  const searchMutation = useMutation({
    mutationFn: () => lookup({ data: { name } }),
    onSuccess: (rows) => {
      setCandidates(rows);
      selectCandidate(rows[0] ?? null);
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Pick the matching MLB player first.");
      return approve({
        data: {
          id: item.id,
          mlbId: selected.mlbId,
          name: selected.name || name,
          pos: selected.pos,
          debut: selected.debut,
          last: selected.last,
          bats: selected.bats,
          throws: selected.throws,
          bwar: bwar.trim() === "" ? null : Number(bwar),
          innerCircle,
          prettyUnanimous,
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review-queue"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => reject({ data: { id: item.id, notes: null } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review-queue"] }),
  });

  return (
    <article className="border border-border bg-background p-4">
      <p className="text-sm text-foreground">{item.sourceCaption}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.source}
        {item.sourceUrl && (
          <>
            {" · "}
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              view post
            </a>
          </>
        )}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Player name
          <div className="mt-1 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-sm border border-input bg-background px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-foreground"
            />
            <button
              type="button"
              onClick={() => searchMutation.mutate()}
              className="shrink-0 rounded-sm border border-input px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
            >
              {searchMutation.isPending ? "…" : "Search"}
            </button>
          </div>
        </label>

        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Career bWAR
          <input
            value={bwar}
            onChange={(e) => setBwar(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 34.8"
            className="mt-1 w-full rounded-sm border border-input bg-background px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-foreground"
          />
        </label>
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          MLB match
        </p>
        {candidates.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            No match found — edit the name and search again.
          </p>
        ) : (
          <select
            value={selected?.mlbId ?? ""}
            onChange={(e) =>
              selectCandidate(candidates.find((c) => String(c.mlbId) === e.target.value) ?? null)
            }
            className="mt-1 w-full rounded-sm border border-input bg-background px-2 py-1.5 text-sm"
          >
            {candidates.map((c) => (
              <option key={c.mlbId} value={c.mlbId}>
                {c.name} — {c.pos} ({c.debut}–{c.last})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={innerCircle}
            onChange={(e) => setInnerCircle(e.target.checked)}
          />
          Inner Circle
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prettyUnanimous}
            onChange={(e) => setPrettyUnanimous(e.target.checked)}
          />
          Pretty Unanimous
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => approveMutation.mutate()}
          disabled={approveMutation.isPending || !selected}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {approveMutation.isPending ? "Publishing…" : "Approve & publish"}
        </button>
        <button
          type="button"
          onClick={() => rejectMutation.mutate()}
          disabled={rejectMutation.isPending}
          className="rounded-sm border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Reject
        </button>
      </div>
      {approveMutation.error && (
        <p className="mt-2 text-sm text-destructive">{(approveMutation.error as Error).message}</p>
      )}
    </article>
  );
}
