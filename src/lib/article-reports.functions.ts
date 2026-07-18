import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const statusEnum = z.enum(["new", "read", "resolved", "archived"]);

const submitInput = z.object({
  article_slug: z.string().trim().min(1).max(200),
  article_title: z.string().trim().max(300).optional().nullable(),
  reporter_name: z.string().trim().min(1).max(120),
  reporter_email: z.string().trim().email().max(254),
  reason: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().min(5).max(5000),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""), // honeypot
});

async function assertStaff(context: { supabase: any; userId: string }) {
  const { data: admin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (admin) return "admin" as const;
  const { data: editor } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "editor",
  });
  if (editor) return "editor" as const;
  throw new Error("Forbidden: staff access required");
}

export const submitArticleReport = createServerFn({ method: "POST" })
  .inputValidator((d) => submitInput.parse(d))
  .handler(async ({ data }) => {
    if (data.website && data.website.length > 0) return { ok: true };

    const ua = getRequestHeader("user-agent") ?? null;
    const fwd = getRequestHeader("x-forwarded-for") ?? "";
    const ip = fwd.split(",")[0]?.trim() || null;

    let ipHash: string | null = null;
    if (ip) {
      const enc = new TextEncoder().encode(ip + "|radmap");
      const buf = await crypto.subtle.digest("SHA-256", enc);
      ipHash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("article_reports").insert({
      article_slug: data.article_slug,
      article_title: data.article_title || null,
      reporter_name: data.reporter_name,
      reporter_email: data.reporter_email,
      reason: data.reason || null,
      description: data.description,
      user_agent: ua,
      ip_hash: ipHash,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listArticleReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z
      .object({
        status: statusEnum.optional(),
        search: z.string().max(200).optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    let q = context.supabase
      .from("article_reports")
      .select(
        "id, article_slug, article_title, reporter_name, reporter_email, reason, description, status, created_at, updated_at",
      )
      .order("created_at", { ascending: false });
    if (data?.status) q = q.eq("status", data.status);
    if (data?.search) q = q.or(
      `article_title.ilike.%${data.search}%,article_slug.ilike.%${data.search}%,reporter_name.ilike.%${data.search}%,reporter_email.ilike.%${data.search}%`,
    );
    const { data: rows, error } = await q.limit(500);
    if (error) throw new Error(error.message);

    const { count: unread } = await context.supabase
      .from("article_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    return { reports: rows ?? [], unread: unread ?? 0 };
  });

export const getUnreadArticleReportCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { count } = await context.supabase
      .from("article_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
    return { unread: count ?? 0 };
  });

export const updateArticleReportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: statusEnum }))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("article_reports")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteArticleReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const role = await assertStaff(context);
    if (role !== "admin") throw new Error("Forbidden: admins only");
    const { error } = await context.supabase
      .from("article_reports")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
