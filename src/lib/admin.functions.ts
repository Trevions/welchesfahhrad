import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { articleImageUrl } from "@/lib/article-image-url";

const articleCategories = ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"] as const;
const articleStatuses = ["draft", "published"] as const;
const imageRefSchema = z.string().max(1200).optional().nullable().or(z.literal(""));

const articleInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen, Bindestriche"),
  title: z.string().min(3).max(300),
  excerpt: z.string().max(600).optional().nullable(),
  body: z.string().default(""),
  cover_image: imageRefSchema,
  category: z.enum(articleCategories),
  source: z.string().max(200).optional().nullable(),
  status: z.enum(articleStatuses),
  read_time: z.string().max(40).optional().nullable(),
  seo_title: z.string().max(120).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  seo_keywords: z.string().max(400).optional().nullable(),
  og_image: imageRefSchema,
  published_at: z.string().optional().nullable(),
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

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const set = new Set((roles ?? []).map((r: { role: string }) => r.role));
    return {
      userId: context.userId,
      email: context.claims?.email ?? null,
      isAdmin: set.has("admin"),
      isEditor: set.has("editor"),
      roles: Array.from(set),
    };
  });

export const listArticles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      search: z.string().optional(),
      category: z.enum(articleCategories).optional(),
      status: z.enum(articleStatuses).optional(),
    }).optional(),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    let q = context.supabase
      .from("articles")
      .select("id, slug, title, excerpt, cover_image, category, status, author_id, view_count, published_at, updated_at, created_at")
      .order("updated_at", { ascending: false });
    if (data?.search) q = q.ilike("title", `%${data.search}%`);
    if (data?.category) q = q.eq("category", data.category);
    if (data?.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q.limit(200);
    if (error) throw new Error(error.message);
    return { articles: rows ?? [] };
  });

export const getArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { data: row, error } = await context.supabase
      .from("articles")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { article: row };
  });

export const upsertArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(articleInput)
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const payload: Record<string, any> = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || null,
      body: data.body ?? "",
      cover_image: data.cover_image || null,
      category: data.category,
      source: data.source || null,
      status: data.status,
      read_time: data.read_time || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      seo_keywords: data.seo_keywords || null,
      og_image: data.og_image || null,
      published_at:
        data.status === "published"
          ? data.published_at || new Date().toISOString()
          : null,
    };
    if (!data.id) payload.author_id = context.userId;

    const query = data.id
      ? context.supabase.from("articles").update(payload as never).eq("id", data.id).select("id, slug").single()
      : context.supabase.from("articles").insert(payload as never).select("id, slug").single();

    const { data: row, error } = await query;
    if (error) throw new Error(error.message);
    return { id: row.id as string, slug: row.slug as string };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const role = await assertStaff(context);
    if (role !== "admin") throw new Error("Forbidden: admins only");
    const { error } = await context.supabase.from("articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data: all } = await context.supabase
      .from("articles")
      .select("id, status, category, view_count, published_at, updated_at, title, slug")
      .order("updated_at", { ascending: false });
    const rows = all ?? [];
    const total = rows.length;
    const published = rows.filter((a: any) => a.status === "published").length;
    const drafts = total - published;
    const totalViews = rows.reduce((acc: number, a: any) => acc + (a.view_count ?? 0), 0);

    const byCategory: Record<string, number> = {};
    for (const cat of articleCategories) byCategory[cat] = 0;
    for (const r of rows) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;

    return {
      total,
      published,
      drafts,
      totalViews,
      byCategory,
      recent: rows.slice(0, 8),
    };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await assertStaff(context);
    if (role !== "admin") throw new Error("Forbidden: admins only");
    const { data: profiles } = await context.supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url, created_at")
      .order("created_at", { ascending: false });
    const { data: roles } = await context.supabase.from("user_roles").select("user_id, role");
    const rolesByUser: Record<string, string[]> = {};
    for (const r of roles ?? []) {
      (rolesByUser[r.user_id] ||= []).push(r.role);
    }
    return {
      users: (profiles ?? []).map((p: any) => ({
        ...p,
        roles: rolesByUser[p.id] ?? [],
      })),
    };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
      role: z.enum(["admin", "editor", "user"]),
      grant: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    const role = await assertStaff(context);
    if (role !== "admin") throw new Error("Forbidden: admins only");
    if (data.grant) {
      const { error } = await context.supabase
        .from("user_roles")
        .insert({ user_id: data.userId, role: data.role });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase.storage
      .from("article-images")
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw new Error(error.message);
    return {
      files: (data ?? [])
        .filter((f: any) => f.name && !f.name.endsWith("/"))
        .map((f: any) => ({
          name: f.name,
          size: f.metadata?.size ?? 0,
          mimetype: f.metadata?.mimetype ?? "",
          created_at: f.created_at,
          url: articleImageUrl(`article-images/${f.name}`),
        })),
    };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string() }))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.storage.from("article-images").remove([data.name]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
