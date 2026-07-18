import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, requireAdmin, textResult } from "../helpers";

export const analyticsSummary = defineTool({
  name: "get_analytics_summary",
  title: "Analyse-Übersicht",
  description:
    "Kennzahlen: Anzahl Artikel/Fahrräder/Lexikon nach Status, Top-Artikel nach view_count, Newsletter-Abonnenten, offene Kontaktnachrichten.",
  inputSchema: {},
  annotations: { readOnlyHint: true },
  handler: async (_input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    const sb = gate.sb;

    const [articlesTotal, articlesPub, bikesTotal, bikesPub, lex, subs, msgs, topArticles, topBikes] = await Promise.all([
      sb.from("articles").select("id", { count: "exact", head: true }),
      sb.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
      sb.from("bikes").select("id", { count: "exact", head: true }),
      sb.from("bikes").select("id", { count: "exact", head: true }).eq("published", true),
      sb.from("lexikon_terms").select("id", { count: "exact", head: true }).eq("status", "published"),
      sb.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      sb.from("contact_messages").select("id", { count: "exact", head: true }),
      sb.from("articles").select("slug, title, view_count, category").eq("status", "published").order("view_count", { ascending: false }).limit(10),
      sb.from("bikes").select("slug, brand, model, expert_rating, featured").eq("published", true).order("expert_rating", { ascending: false, nullsFirst: false }).limit(10),
    ]);

    return jsonResult({
      counts: {
        articles_total: articlesTotal.count ?? 0,
        articles_published: articlesPub.count ?? 0,
        bikes_total: bikesTotal.count ?? 0,
        bikes_published: bikesPub.count ?? 0,
        lexikon_published: lex.count ?? 0,
        newsletter_subscribers: subs.count ?? 0,
        contact_messages: msgs.count ?? 0,
      },
      top_articles: topArticles.data ?? [],
      top_bikes: topBikes.data ?? [],
    });
  },
});

export const runReadSql = defineTool({
  name: "run_read_sql",
  title: "SQL (nur Lesen) ausführen",
  description:
    "Führt ein einzelnes SELECT-Statement gegen die Datenbank aus (RLS als angemeldeter Admin). Kein INSERT/UPDATE/DELETE/DDL.",
  inputSchema: {
    query: z.string().min(6).describe("Nur SELECT/WITH-Statements. Ein Statement."),
    limit: z.number().int().min(1).max(1000).optional().default(200),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    const q = input.query.trim().replace(/;+\s*$/g, "");
    if (/;/.test(q)) return textResult("Nur ein Statement erlaubt.", true);
    if (!/^\s*(select|with)\b/i.test(q)) return textResult("Nur SELECT/WITH erlaubt.", true);
    if (/\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy)\b/i.test(q)) {
      return textResult("Verändernde Statements nicht erlaubt.", true);
    }
    const wrapped = `select * from (${q}) as _q limit ${input.limit ?? 200}`;
    // Admin wurde bereits verifiziert -> Aufruf mit Service-Role (RPC ist nur für service_role freigegeben).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("exec_read_sql" as never, { _sql: wrapped } as never);
    if (error) return textResult(`SQL: ${error.message}`, true);
    return jsonResult({ rows: data });
  },
});
