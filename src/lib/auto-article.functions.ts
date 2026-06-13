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
    const secret = process.env.ARTICLE_AUTOGEN_SECRET;
    if (!secret) throw new Error("ARTICLE_AUTOGEN_SECRET nicht konfiguriert");

    const resp = await fetch("https://radmap.de/api/public/articles/auto-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-autogen-secret": secret,
      },
      body: JSON.stringify({
        force: true,
        trigger: "manual",
        ...(data?.category ? { category: data.category } : {}),
      }),
    });
    const text = await resp.text();
    if (!resp.ok) throw new Error(`Auto-Generate fehlgeschlagen (${resp.status}): ${text.slice(0, 300)}`);
    return { ok: true as const, raw: text.slice(0, 2000) };
  });
