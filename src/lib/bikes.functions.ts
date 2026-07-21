import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Bike, BikeCategory } from "@/lib/bike-types";

// Defensive parser: JSONB columns should be objects/arrays, but historic rows
// may hold doubly-serialised JSON strings. Parse those transparently so the
// UI never crashes on `specs.length` / `specs.foo` (Fix 1 frontend guard).
function coerceJson<T = unknown>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") {
    const s = v.trim();
    if (s.startsWith("{") || s.startsWith("[")) {
      try {
        return JSON.parse(s) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
  return v as T;
}
function coerceObj(v: unknown): Record<string, any> {
  const p = coerceJson<Record<string, any>>(v, {});
  return p && typeof p === "object" && !Array.isArray(p) ? p : {};
}
function coerceArr<T = any>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  const p = coerceJson<any>(v, []);
  return Array.isArray(p) ? (p as T[]) : [];
}
// Normalise highlights: accept legacy string[], {pros,cons}, or JSON string (Fix 2).
function normaliseHighlights(v: unknown): { pros: string[]; cons: string[] } {
  const parsed = typeof v === "string" ? coerceJson<any>(v, null) : v;
  if (Array.isArray(parsed)) return { pros: parsed.filter((x) => typeof x === "string"), cons: [] };
  if (parsed && typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;
    return {
      pros: Array.isArray(o.pros) ? (o.pros as unknown[]).filter((x) => typeof x === "string") as string[] : [],
      cons: Array.isArray(o.cons) ? (o.cons as unknown[]).filter((x) => typeof x === "string") as string[] : [],
    };
  }
  return { pros: [], cons: [] };
}

function rowToBike(r: any): Bike {
  return {
    id: r.id,
    slug: r.slug,
    brand: r.brand,
    model: r.model,
    year: r.year ?? null,
    category: r.category as BikeCategory,
    bike_type: r.bike_type ?? null,
    price_eur: r.price_eur ?? null,
    price_date: r.price_date ?? null,
    image_url: r.image_url ?? null,
    gallery: coerceArr<string>(r.gallery),
    manufacturer_url: r.manufacturer_url ?? null,
    excerpt: r.excerpt ?? null,
    description: r.description ?? null,
    highlights: normaliseHighlights(r.highlights),
    specs: coerceObj(r.specs),
    ebike: r.ebike ? coerceObj(r.ebike) : null,
    ratings: coerceObj(r.ratings),
    intended_use: coerceArr<string>(r.intended_use),
    terrain: coerceArr<string>(r.terrain),
    meta_title: r.meta_title ?? null,
    meta_description: r.meta_description ?? null,
    og_image_url: r.og_image_url ?? null,
    keywords: coerceArr<string>(r.keywords),
    featured: !!r.featured,
    published: !!r.published,
    published_at: r.published_at ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
    geometry: coerceObj(r.geometry),
    cockpit: coerceObj(r.cockpit),
    wheelset: coerceObj(r.wheelset),
    drivetrain_detail: coerceObj(r.drivetrain_detail),
    brakes_detail: coerceObj(r.brakes_detail),
    ebike_detail: coerceObj(r.ebike_detail),
    suitability: coerceObj(r.suitability),
    performance: coerceObj(r.performance),
    range_matrix: coerceObj(r.range_matrix),
    maintenance: coerceObj(r.maintenance),
    costs: coerceObj(r.costs),
    environmental: coerceObj(r.environmental),
    safety_features: coerceObj(r.safety_features),
    accessories: coerceArr<string>(r.accessories),
    awards: coerceArr(r.awards),
    model_history: coerceObj(r.model_history),
    videos: coerceArr(r.videos),
    faq: coerceArr(r.faq),
    ai_summary: coerceObj(r.ai_summary),
    availability: r.availability ?? null,
    expert_rating: r.expert_rating ?? null,
  };
}

const SELECT_PUBLIC = "*";

function publicClient() {
  // Lazy import to keep handler-only execution
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  );
}

export const listPublicBikes = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb
    .from("bikes")
    .select(SELECT_PUBLIC)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return { bikes: (data ?? []).map(rowToBike) };
});

export const listFeaturedBikes = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb
    .from("bikes")
    .select(SELECT_PUBLIC)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return { bikes: (data ?? []).map(rowToBike) };
});

export const getPublicBikeBySlug = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: row, error } = await sb
      .from("bikes")
      .select(SELECT_PUBLIC)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { bike: null as Bike | null };
    return { bike: rowToBike(row) };
  });

// ---- Admin ----

async function assertStaff(context: { supabase: any; userId: string }) {
  const { data: a } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (a) return;
  const { data: e } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "editor" });
  if (!e) throw new Error("Forbidden");
}

export const listAdminBikes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        search: z.string().optional(),
        category: z.enum(["bike", "ebike"]).optional(),
        published: z.enum(["all", "published", "draft"]).optional(),
      })
      .optional()
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    let q = context.supabase.from("bikes").select("*").order("updated_at", { ascending: false }).limit(200);
    if (data?.search) q = q.or(`brand.ilike.%${data.search}%,model.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    if (data?.category) q = q.eq("category", data.category);
    if (data?.published === "published") q = q.eq("published", true);
    if (data?.published === "draft") q = q.eq("published", false);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { bikes: (rows ?? []).map(rowToBike) };
  });

export const getAdminBike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { data: row, error } = await context.supabase.from("bikes").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Nicht gefunden");
    return { bike: rowToBike(row) };
  });

const bikeInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  brand: z.string().min(1).max(120),
  model: z.string().min(1).max(160),
  year: z.number().int().min(1990).max(2100).nullable().optional(),
  category: z.enum(["bike", "ebike"]),
  bike_type: z.string().max(60).nullable().optional(),
  price_eur: z.number().int().min(0).max(100000).nullable().optional(),
  image_url: z.string().max(1200).nullable().optional(),
  gallery: z.array(z.string().max(1200)).default([]),
  manufacturer_url: z.string().max(600).nullable().optional(),
  excerpt: z.string().max(600).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  highlights: z
    .object({ pros: z.array(z.string().max(200)).default([]), cons: z.array(z.string().max(200)).default([]) })
    .default({ pros: [], cons: [] }),
  specs: z.record(z.string(), z.any()).default({}),
  ebike: z.record(z.string(), z.any()).nullable().optional(),
  ratings: z.record(z.string(), z.any()).default({}),
  intended_use: z.array(z.string().max(60)).default([]),
  terrain: z.array(z.string().max(60)).default([]),
  meta_title: z.string().max(180).nullable().optional(),
  meta_description: z.string().max(400).nullable().optional(),
  og_image_url: z.string().max(1200).nullable().optional(),
  keywords: z.array(z.string().max(60)).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  geometry: z.record(z.string(), z.any()).default({}),
  cockpit: z.record(z.string(), z.any()).default({}),
  wheelset: z.record(z.string(), z.any()).default({}),
  drivetrain_detail: z.record(z.string(), z.any()).default({}),
  brakes_detail: z.record(z.string(), z.any()).default({}),
  ebike_detail: z.record(z.string(), z.any()).default({}),
  suitability: z.record(z.string(), z.any()).default({}),
  performance: z.record(z.string(), z.any()).default({}),
  range_matrix: z.record(z.string(), z.any()).default({}),
  maintenance: z.record(z.string(), z.any()).default({}),
  costs: z.record(z.string(), z.any()).default({}),
  environmental: z.record(z.string(), z.any()).default({}),
  safety_features: z.record(z.string(), z.any()).default({}),
  accessories: z.array(z.string().max(120)).default([]),
  awards: z.array(z.object({ name: z.string(), year: z.number().optional(), source: z.string().optional() })).default([]),
  model_history: z.record(z.string(), z.any()).default({}),
  videos: z.array(z.object({ url: z.string(), title: z.string().optional() })).default([]),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  ai_summary: z.record(z.string(), z.any()).default({}),
  availability: z.string().max(120).nullable().optional(),
  expert_rating: z.number().min(0).max(10).nullable().optional(),
});

export const upsertBike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => bikeInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const now = new Date().toISOString();
    const row: any = { ...data, updated_at: now };
    if (data.published) row.published_at = row.published_at ?? now;
    if (!data.id) {
      const { data: ins, error } = await context.supabase.from("bikes").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      return { id: ins.id };
    }
    const { error } = await context.supabase.from("bikes").update(row).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id };
  });

export const deleteBike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("bikes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
