import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, requireAdmin, textResult } from "../helpers";

const LEX_STATUS = z.enum(["draft", "published"]);
const COLS = "id, slug, term, short_definition, category, status, updated_at";

export const listLexikonTerms = defineTool({
  name: "list_lexikon_terms",
  title: "Lexikon-Begriffe auflisten",
  description: "Listet Lexikon-Einträge mit Filter.",
  inputSchema: {
    search: z.string().optional(),
    status: LEX_STATUS.optional(),
    category: z.string().optional(),
    limit: z.number().int().min(1).max(200).optional().default(100),
  },
  annotations: { readOnlyHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    let q = gate.sb.from("lexikon_terms").select(COLS).order("term").limit(input.limit ?? 100);
    if (input.status) q = q.eq("status", input.status);
    if (input.category) q = q.eq("category", input.category);
    if (input.search) q = q.or(`term.ilike.%${input.search}%,slug.ilike.%${input.search}%`);
    const { data, error } = await q;
    if (error) return textResult(error.message, true);
    return jsonResult({ terms: data });
  },
});

export const getLexikonTerm = defineTool({
  name: "get_lexikon_term",
  title: "Lexikon-Eintrag abrufen",
  description: "Vollständiger Lexikon-Eintrag per ID oder Slug.",
  inputSchema: { id: z.string().uuid().optional(), slug: z.string().optional() },
  annotations: { readOnlyHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    let q = gate.sb.from("lexikon_terms").select("*").limit(1);
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { data, error } = await q.maybeSingle();
    if (error) return textResult(error.message, true);
    if (!data) return textResult("Nicht gefunden.", true);
    return jsonResult({ term: data });
  },
});

const mutable = {
  slug: z.string().min(1),
  term: z.string().min(1),
  short_definition: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1),
  status: LEX_STATUS.default("draft"),
  synonyms: z.array(z.string()).optional(),
  related_article_slugs: z.array(z.string()).optional(),
  related_term_slugs: z.array(z.string()).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
};

export const createLexikonTerm = defineTool({
  name: "create_lexikon_term",
  title: "Lexikon-Begriff anlegen",
  description: "Erstellt einen neuen Lexikon-Eintrag.",
  inputSchema: mutable,
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    const { data, error } = await gate.sb.from("lexikon_terms").insert(input as never).select("id, slug").single();
    if (error) return textResult(error.message, true);
    return jsonResult({ ok: true, term: data });
  },
});

export const updateLexikonTerm = defineTool({
  name: "update_lexikon_term",
  title: "Lexikon-Begriff aktualisieren",
  description: "Aktualisiert Felder eines Lexikon-Eintrags.",
  inputSchema: {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
    patch: z.object(mutable).partial(),
  },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.id && !input.slug) return textResult("id oder slug erforderlich.", true);
    let q = gate.sb.from("lexikon_terms").update(input.patch as never);
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { data, error } = await q.select("id, slug").single();
    if (error) return textResult(error.message, true);
    return jsonResult({ ok: true, term: data });
  },
});

export const deleteLexikonTerm = defineTool({
  name: "delete_lexikon_term",
  title: "Lexikon-Begriff löschen",
  description: "Löscht einen Lexikon-Eintrag endgültig.",
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
    let q = gate.sb.from("lexikon_terms").delete();
    q = input.id ? q.eq("id", input.id) : q.eq("slug", input.slug!);
    const { error } = await q;
    if (error) return textResult(error.message, true);
    return textResult("Gelöscht.");
  },
});
