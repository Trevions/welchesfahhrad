import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, requireAdmin, textResult } from "../helpers";

const BIKE_COLUMNS =
  "id, slug, brand, model, year, category, bike_type, price_eur, image_url, published, featured, expert_rating, availability, updated_at";

export const listBikes = defineTool({
  name: "list_bikes",
  title: "Fahrräder auflisten",
  description:
    "Listet Fahrräder (radmap.de). Filter: Kategorie, Marke, Suchtext, publiziert. Max 100.",
  inputSchema: {
    search: z.string().optional().describe("Marke, Modell oder Slug enthält…"),
    category: z.string().optional(),
    brand: z.string().optional(),
    published: z.boolean().optional(),
    limit: z.number().int().min(1).max(100).optional().default(50),
  },
  annotations: { readOnlyHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    let q = gate.sb.from("bikes").select(BIKE_COLUMNS).order("updated_at", { ascending: false }).limit(input.limit ?? 50);
    if (input.category) q = q.eq("category", input.category);
    if (input.brand) q = q.ilike("brand", input.brand);
    if (typeof input.published === "boolean") q = q.eq("published", input.published);
    if (input.search) q = q.or(`brand.ilike.%${input.search}%,model.ilike.%${input.search}%,slug.ilike.%${input.search}%`);
    const { data, error } = await q;
    if (error) return textResult(error.message, true);
    return jsonResult({ bikes: data });
  },
});

export const getBike = defineTool({
  name: "get_bike",
  title: "Fahrrad abrufen",
  description: "Vollständige Daten eines Fahrrads (per ID oder Slug).",
  inputSchema: {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
  },
  annotations: { readOnlyHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    let q = gate.sb.from("bikes").select("*").limit(1);
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { data, error } = await q.maybeSingle();
    if (error) return textResult(error.message, true);
    if (!data) return textResult("Nicht gefunden.", true);
    return jsonResult({ bike: data });
  },
});

// Coerce JSON-string inputs into real objects/arrays so JSONB columns don't
// receive doubly-serialized strings (Fix 1).
const jsonish = z.preprocess((v) => {
  if (typeof v === "string") {
    const s = v.trim();
    if (s.startsWith("{") || s.startsWith("[")) {
      try {
        return JSON.parse(s);
      } catch {
        /* ignore */
      }
    }
  }
  return v;
}, z.union([z.record(z.unknown()), z.array(z.unknown()), z.string(), z.number(), z.boolean(), z.null()]));

// highlights: accept legacy string[] OR {pros, cons} object (Fix 2).
// Always normalise to { pros, cons } before storage.
const highlightsSchema = z.preprocess(
  (v) => {
    if (Array.isArray(v)) return { pros: v.filter((x) => typeof x === "string"), cons: [] };
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      return {
        pros: Array.isArray(o.pros) ? o.pros.filter((x) => typeof x === "string") : [],
        cons: Array.isArray(o.cons) ? o.cons.filter((x) => typeof x === "string") : [],
      };
    }
    return v;
  },
  z.object({ pros: z.array(z.string()).default([]), cons: z.array(z.string()).default([]) }),
);

const bikeMutable = {
  slug: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().optional(),
  category: z.string().min(1),
  bike_type: z.string().optional(),
  price_eur: z.number().int().optional(),
  price_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format: JJJJ-MM-TT")
    .optional()
    .describe("Datum der Preis-Prüfung (JJJJ-MM-TT)"),
  image_url: z.string().url().optional(),
  manufacturer_url: z.string().url().optional(),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  highlights: highlightsSchema.optional(),
  intended_use: z.array(z.string()).optional(),
  terrain: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  specs: jsonish.optional(),
  ebike: jsonish.optional(),
  ratings: jsonish.optional(),
  geometry: jsonish.optional(),
  cockpit: jsonish.optional(),
  wheelset: jsonish.optional(),
  drivetrain_detail: jsonish.optional(),
  brakes_detail: jsonish.optional(),
  ebike_detail: jsonish.optional(),
  suitability: jsonish.optional(),
  performance: jsonish.optional(),
  range_matrix: jsonish.optional(),
  maintenance: jsonish.optional(),
  costs: jsonish.optional(),
  environmental: jsonish.optional(),
  safety_features: jsonish.optional(),
  accessories: jsonish.optional(),
  awards: jsonish.optional(),
  model_history: jsonish.optional(),
  videos: jsonish.optional(),
  faq: jsonish.optional(),
  ai_summary: jsonish.optional(),
  availability: z.string().optional(),
  expert_rating: z.number().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  og_image_url: z.string().url().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
};

export const createBike = defineTool({
  name: "create_bike",
  title: "Fahrrad anlegen",
  description: "Erstellt ein neues Fahrrad (radmap.de). Slug muss eindeutig sein.",
  inputSchema: bikeMutable,
  annotations: { destructiveHint: false },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    const { data, error } = await gate.sb.from("bikes").insert(input as never).select("id, slug").single();
    if (error) return textResult(error.message, true);
    return jsonResult({ ok: true, bike: data });
  },
});

export const updateBike = defineTool({
  name: "update_bike",
  title: "Fahrrad aktualisieren",
  description: "Aktualisiert Felder eines Fahrrads (per ID oder Slug).",
  inputSchema: {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
    patch: z.object(bikeMutable).partial(),
  },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    let q = gate.sb.from("bikes").update(input.patch as never);
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { data, error } = await q.select("id, slug").single();
    if (error) return textResult(error.message, true);
    return jsonResult({ ok: true, bike: data });
  },
});

export const publishBike = defineTool({
  name: "publish_bike",
  title: "Fahrrad publizieren",
  description: "Setzt published=true/false. published_at wird gesetzt bei true.",
  inputSchema: {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
    published: z.boolean().default(true),
  },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    const patch: Record<string, unknown> = { published: input.published };
    if (input.published) patch.published_at = new Date().toISOString();
    let q = gate.sb.from("bikes").update(patch as never);
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { data, error } = await q.select("id, slug, published").single();
    if (error) return textResult(error.message, true);
    return jsonResult({ ok: true, bike: data });
  },
});

export const deleteBike = defineTool({
  name: "delete_bike",
  title: "Fahrrad löschen",
  description: "Löscht ein Fahrrad endgültig. Nicht umkehrbar.",
  inputSchema: {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
    confirm: z.literal(true).describe("Muss true sein zur Bestätigung."),
  },
  annotations: { destructiveHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    let q = gate.sb.from("bikes").delete();
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { error } = await q;
    if (error) return textResult(error.message, true);
    return textResult("Gelöscht.");
  },
});
