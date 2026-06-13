import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden: admin access required");
}

export const listGenerationRuns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("article_generation_runs")
      .select("id, started_at, finished_at, status, sources_found, articles_created, errors_count, error_summary, trigger")
      .order("started_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return { runs: data ?? [] };
  });

export const listArticleSources = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      status: z.enum(["processed", "skipped_brand_mention", "skipped_duplicate", "failed"]).optional(),
    }).optional().parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("article_sources")
      .select("id, article_id, source_url, source_title, source_domain, category, status, skip_reason, discovered_at")
      .order("discovered_at", { ascending: false })
      .limit(100);
    if (data?.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { sources: rows ?? [] };
  });

export const triggerAutoGenerate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      category: z.enum(["Nachrichten", "Ratgeber", "E-Bikes", "Tests"]).optional(),
    }).optional().parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { runAutoGeneratePipeline } = await import("@/lib/auto-article.server");
    const result = await runAutoGeneratePipeline({
      category: data?.category,
      trigger: "manual",
    });
    return result;
  });

export const getAutoGenSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("app_settings")
      .select("auto_generate_enabled, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { enabled: data?.auto_generate_enabled ?? true, updated_at: data?.updated_at ?? null };
  });

export const setAutoGenEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ enabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ id: 1, auto_generate_enabled: data.enabled, updated_by: context.userId, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true, enabled: data.enabled };
  });

export const researchNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ scope: z.enum(["de", "world", "all"]).default("de") }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { researchNewsManual } = await import("@/lib/auto-article.server");
    return await researchNewsManual(data.scope);
  });

