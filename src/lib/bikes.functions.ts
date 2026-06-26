import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Bike, BikeCategory } from "@/lib/bike-types";

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
    image_url: r.image_url ?? null,
    gallery: Array.isArray(r.gallery) ? r.gallery : [],
    manufacturer_url: r.manufacturer_url ?? null,
    excerpt: r.excerpt ?? null,
    description: r.description ?? null,
    highlights: r.highlights ?? { pros: [], cons: [] },
    specs: r.specs ?? {},
    ebike: r.ebike ?? null,
    ratings: r.ratings ?? {},
    intended_use: r.intended_use ?? [],
    terrain: r.terrain ?? [],
    meta_title: r.meta_title ?? null,
    meta_description: r.meta_description ?? null,
    og_image_url: r.og_image_url ?? null,
    keywords: r.keywords ?? [],
    featured: !!r.featured,
    published: !!r.published,
    published_at: r.published_at ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
    geometry: r.geometry ?? {},
    cockpit: r.cockpit ?? {},
    wheelset: r.wheelset ?? {},
    drivetrain_detail: r.drivetrain_detail ?? {},
    brakes_detail: r.brakes_detail ?? {},
    ebike_detail: r.ebike_detail ?? {},
    suitability: r.suitability ?? {},
    performance: r.performance ?? {},
    range_matrix: r.range_matrix ?? {},
    maintenance: r.maintenance ?? {},
    costs: r.costs ?? {},
    environmental: r.environmental ?? {},
    safety_features: r.safety_features ?? {},
    accessories: Array.isArray(r.accessories) ? r.accessories : [],
    awards: Array.isArray(r.awards) ? r.awards : [],
    model_history: r.model_history ?? {},
    videos: Array.isArray(r.videos) ? r.videos : [],
    faq: Array.isArray(r.faq) ? r.faq : [],
    ai_summary: r.ai_summary ?? {},
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
