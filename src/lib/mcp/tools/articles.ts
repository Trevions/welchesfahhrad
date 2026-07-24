import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, requireAdmin, textResult } from "../helpers";

const ART_COLS = "id, slug, title, excerpt, category, status, source, read_time, view_count, published_at, updated_at, cover_image";
const CATEGORY = z.enum(["Nachrichten", "Ratgeber", "E-Bikes", "Tests"]);
const STATUS = z.enum(["draft", "published"]);

export const listArticles = defineTool({
  name: "list_articles",
  title: "Artikel auflisten",
  description: "Listet Artikel (welchesfahrrad.de). Filter: status, category, Suche. Max 100.",
  inputSchema: {
    search: z.string().optional(),
    category: CATEGORY.optional(),
    status: STATUS.optional(),
    limit: z.number().int().min(1).max(100).optional().default(50),
  },
  annotations: { readOnlyHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    let q = gate.sb.from("articles").select(ART_COLS).order("updated_at", { ascending: false }).limit(input.limit ?? 50);
    if (input.category) q = q.eq("category", input.category);
    if (input.status) q = q.eq("status", input.status);
    if (input.search) q = q.or(`title.ilike.%${input.search}%,slug.ilike.%${input.search}%,excerpt.ilike.%${input.search}%`);
    const { data, error } = await q;
    if (error) return textResult(error.message, true);
    return jsonResult({ articles: data });
  },
});

export const getArticle = defineTool({
  name: "get_article",
  title: "Artikel abrufen",
  description: "Kompletter Artikel per ID oder Slug (inkl. body Markdown).",
  inputSchema: { id: z.string().uuid().optional(), slug: z.string().optional() },
  annotations: { readOnlyHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    let q = gate.sb.from("articles").select("*").limit(1);
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { data, error } = await q.maybeSingle();
    if (error) return textResult(error.message, true);
    if (!data) return textResult("Nicht gefunden.", true);
    return jsonResult({ article: data });
  },
});

const artMutable = {
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  body: z.string().min(1).describe("Markdown-Text"),
  cover_image: z.string().optional(),
  cover_image_caption: z.string().optional(),
  cover_image_credit: z.string().optional(),
  cover_image_is_ai: z.boolean().optional(),
  category: CATEGORY,
  source: z.string().optional(),
  status: STATUS.default("draft"),
  read_time: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
  og_image: z.string().optional(),
};

export const createArticle = defineTool({
  name: "create_article",
  title: "Artikel anlegen",
  description: "Erstellt einen Artikel. Body ist Markdown. Standardstatus: draft.",
  inputSchema: artMutable,
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    const row = { ...input, author_id: ctx.getUserId() };
    const { data, error } = await gate.sb.from("articles").insert(row as never).select("id, slug, status").single();
    if (error) return textResult(error.message, true);
    return jsonResult({ ok: true, article: data });
  },
});

export const updateArticle = defineTool({
  name: "update_article",
  title: "Artikel aktualisieren",
  description: "Aktualisiert einzelne Felder eines Artikels.",
  inputSchema: {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
    patch: z.object(artMutable).partial(),
  },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    let q = gate.sb.from("articles").update(input.patch as never);
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { data, error } = await q.select("id, slug, status").single();
    if (error) return textResult(error.message, true);
    return jsonResult({ ok: true, article: data });
  },
});

export const publishArticle = defineTool({
  name: "publish_article",
  title: "Artikel veröffentlichen",
  description: "Setzt status='published' und published_at. Optional wieder auf draft/archived.",
  inputSchema: {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
    status: STATUS.default("published"),
  },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    const patch: Record<string, unknown> = { status: input.status };
    if (input.status === "published") patch.published_at = new Date().toISOString();
    let q = gate.sb.from("articles").update(patch as never);
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { data, error } = await q.select("id, slug, status, published_at").single();
    if (error) return textResult(error.message, true);
    return jsonResult({ ok: true, article: data });
  },
});

export const deleteArticle = defineTool({
  name: "delete_article",
  title: "Artikel löschen",
  description: "Löscht einen Artikel endgültig.",
  inputSchema: {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
    confirm: z.literal(true),
  },
  annotations: { destructiveHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    let q = gate.sb.from("articles").delete();
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { error } = await q;
    if (error) return textResult(error.message, true);
    return textResult("Gelöscht.");
  },
});
