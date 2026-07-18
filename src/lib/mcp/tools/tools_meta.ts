import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, requireAdmin, textResult } from "../helpers";

const TOOL_PAGES = [
  { slug: "reifendruck-rechner", name: "Reifendruck-Rechner" },
  { slug: "rahmengroessen-rechner", name: "Rahmengrößen-Rechner" },
  { slug: "ebike-reichweite-rechner", name: "E-Bike Reichweite" },
  { slug: "ebike-foerderung-rechner", name: "E-Bike Förderung" },
  { slug: "jobrad-leasing-rechner", name: "JobRad-Leasing" },
  { slug: "uebersetzung-rechner", name: "Übersetzung / Gang" },
  { slug: "kalorien-rechner", name: "Kalorien-Rechner" },
  { slug: "kaufberater-ai", name: "Kaufberater AI" },
  { slug: "radel-score", name: "Radel-Score" },
  { slug: "eco-route", name: "Eco Route Planner" },
  { slug: "fahrrad-wetter", name: "Fahrrad-Wetter" },
  { slug: "fahrrad-vergleich", name: "Fahrrad-Vergleich" },
  { slug: "sonnenzeiten", name: "Sonnenzeiten" },
  { slug: "luftqualitaet", name: "Luftqualität" },
  { slug: "sicherheits-check", name: "Sicherheits-Check" },
  { slug: "diebstahlschutz", name: "Diebstahlschutz" },
  { slug: "pannenhilfe", name: "Pannenhilfe" },
  { slug: "werkzeug-liste", name: "Werkzeug-Liste" },
  { slug: "wartungsintervalle", name: "Wartungsintervalle" },
  { slug: "versicherung", name: "Versicherung" },
  { slug: "bussgeld", name: "Bußgeld / StVO" },
  { slug: "tourenplaner", name: "Tourenplaner" },
];

export const listToolPages = defineTool({
  name: "list_tool_pages",
  title: "Tools von radmap.de auflisten",
  description: "Übersicht aller Tool-Seiten (Slug + URL) unter /tools.",
  inputSchema: {},
  annotations: { readOnlyHint: true },
  handler: async () => {
    const tools = TOOL_PAGES.map((t) => ({
      ...t,
      url: `https://radmap.de/tools/${t.slug}`,
    }));
    return jsonResult({ tools, count: tools.length });
  },
});

export const analyzeToolTraffic = defineTool({
  name: "analyze_tool_traffic",
  title: "Tools analysieren (Redaktions-Sicht)",
  description:
    "Grobe Nutzungssignale je Tool aus internen Bezügen: Artikel, die das Tool verlinken oder erwähnen, und Anzahl verwandter Lexikon-Begriffe.",
  inputSchema: { slug: z.string().min(2).describe("Tool-Slug, z. B. 'reifendruck-rechner'.") },
  annotations: { readOnlyHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if ("error" in gate) return textResult(gate.error, true);
    const needle = `/tools/${input.slug}`;
    const [refs, lex] = await Promise.all([
      gate.sb
        .from("articles")
        .select("slug, title, view_count, status")
        .ilike("body", `%${needle}%`)
        .limit(50),
      gate.sb
        .from("lexikon_terms")
        .select("slug, term")
        .contains("related_article_slugs", [input.slug])
        .limit(20),
    ]);
    return jsonResult({
      tool: `/tools/${input.slug}`,
      referencing_articles: refs.data ?? [],
      related_lexikon_terms: lex.data ?? [],
    });
  },
});
