import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  approveQueueItem,
  assertAdmin,
  ingestCaption,
  listQueue,
  type ApproveInput,
} from "./admin.server";
import { searchPlayers } from "./mlb-search.server";

export type { QueueItem } from "./admin.server";
export type { PlayerCandidate } from "./mlb-search.server";

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    if (data) return { isAdmin: true, canClaim: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    return { isAdmin: false, canClaim: (count ?? 0) === 0 };
  });

/** First signed-in user may claim admin while no admin exists yet. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An administrator already exists.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listReviewQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    return listQueue(context.supabase, data.status);
  });

export const queueCaption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { caption: string; sourceUrl?: string | null }) => {
    const caption = (input.caption ?? "").trim();
    if (!caption) throw new Error("Paste a caption first.");
    if (caption.length > 5000) throw new Error("That caption is too long.");
    return { caption, sourceUrl: input.sourceUrl ?? null };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const item = await ingestCaption(context.supabase, {
      caption: data.caption,
      source: "manual",
      sourceUrl: data.sourceUrl,
    });
    if (!item) throw new Error("That caption does not look like an induction post.");
    return item;
  });

export const lookupPlayers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string }) => ({ name: (input.name ?? "").slice(0, 100) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    return searchPlayers(data.name);
  });

export const approveInductee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ApproveInput) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    return approveQueueItem(context.supabase, data);
  });

export const rejectQueueItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; notes?: string | null }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("pending_inductees")
      .update({ status: "rejected", notes: data.notes ?? null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });