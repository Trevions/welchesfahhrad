import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://radmap.de";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const [{ data }, { data: lexikon }] = await Promise.all([
          supabaseAdmin
            .from("articles")
            .select("slug, published_at, updated_at")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(5000),
          supabaseAdmin
            .from("lexikon_terms")
            .select("slug, updated_at")
            .eq("status", "published")
            .limit(5000),
        ]);


        const now = new Date().toISOString();
        const staticEntries: Array<{
          path: string;
          changefreq: string;
          priority: string;
          lastmod: string;
        }> = [
          { path: "/", changefreq: "hourly", priority: "1.0", lastmod: now },
          { path: "/nachrichten", changefreq: "hourly", priority: "0.9", lastmod: now },
          { path: "/ratgeber", changefreq: "daily", priority: "0.8", lastmod: now },
          { path: "/e-bikes", changefreq: "daily", priority: "0.8", lastmod: now },
          { path: "/tests", changefreq: "daily", priority: "0.8", lastmod: now },
          { path: "/tools", changefreq: "weekly", priority: "0.85", lastmod: now },
          { path: "/tools/eco-route", changefreq: "weekly", priority: "0.8", lastmod: now },
          { path: "/tools/radel-score", changefreq: "hourly", priority: "0.85", lastmod: now },
          { path: "/tools/reifendruck-rechner", changefreq: "monthly", priority: "0.75", lastmod: now },
          { path: "/tools/rahmengroessen-rechner", changefreq: "monthly", priority: "0.75", lastmod: now },
          { path: "/tools/uebersetzung-rechner", changefreq: "monthly", priority: "0.7", lastmod: now },
          { path: "/tools/ebike-reichweite-rechner", changefreq: "monthly", priority: "0.75", lastmod: now },
          { path: "/tools/kalorien-rechner", changefreq: "monthly", priority: "0.7", lastmod: now },
          { path: "/tools/jobrad-leasing-rechner", changefreq: "monthly", priority: "0.7", lastmod: now },
          { path: "/tools/ebike-foerderung-rechner", changefreq: "monthly", priority: "0.7", lastmod: now },
          { path: "/tools/fahrrad-vergleich", changefreq: "monthly", priority: "0.7", lastmod: now },
          { path: "/tools/fahrrad-wetter", changefreq: "weekly", priority: "0.7", lastmod: now },
          { path: "/tools/luftqualitaet", changefreq: "weekly", priority: "0.6", lastmod: now },
          { path: "/tools/sonnenzeiten", changefreq: "weekly", priority: "0.6", lastmod: now },
          { path: "/tools/tourenplaner", changefreq: "monthly", priority: "0.6", lastmod: now },
          { path: "/tools/sicherheits-check", changefreq: "monthly", priority: "0.6", lastmod: now },
          { path: "/tools/pannenhilfe", changefreq: "monthly", priority: "0.65", lastmod: now },
          { path: "/tools/werkzeug-liste", changefreq: "monthly", priority: "0.6", lastmod: now },
          { path: "/tools/wartungsintervalle", changefreq: "monthly", priority: "0.6", lastmod: now },
          { path: "/tools/stvo", changefreq: "monthly", priority: "0.7", lastmod: now },
          { path: "/tools/bussgeld", changefreq: "monthly", priority: "0.65", lastmod: now },
          { path: "/tools/diebstahlschutz", changefreq: "monthly", priority: "0.6", lastmod: now },
          { path: "/tools/versicherung", changefreq: "monthly", priority: "0.6", lastmod: now },
          { path: "/tools/kaufberater-ai", changefreq: "weekly", priority: "0.85", lastmod: now },
          { path: "/tools/kaufberater", changefreq: "monthly", priority: "0.7", lastmod: now },
          { path: "/karte", changefreq: "weekly", priority: "0.85", lastmod: now },
          { path: "/fahrraeder", changefreq: "daily", priority: "0.8", lastmod: now },
          { path: "/mein-rad", changefreq: "monthly", priority: "0.5", lastmod: now },
          { path: "/passt-zu-dir", changefreq: "daily", priority: "0.7", lastmod: now },
          { path: "/merkliste", changefreq: "monthly", priority: "0.3", lastmod: now },
          { path: "/redaktion", changefreq: "monthly", priority: "0.4", lastmod: now },
          { path: "/ueber-uns", changefreq: "monthly", priority: "0.4", lastmod: now },
          { path: "/kontakt", changefreq: "monthly", priority: "0.4", lastmod: now },
          { path: "/impressum", changefreq: "yearly", priority: "0.2", lastmod: now },
          { path: "/datenschutz", changefreq: "yearly", priority: "0.2", lastmod: now },
          { path: "/agb", changefreq: "yearly", priority: "0.2", lastmod: now },
          { path: "/cookies", changefreq: "yearly", priority: "0.2", lastmod: now },
          { path: "/nutzungsbedingungen", changefreq: "yearly", priority: "0.2", lastmod: now },
          { path: "/barrierefreiheit", changefreq: "yearly", priority: "0.2", lastmod: now },
          { path: "/bildnachweise", changefreq: "monthly", priority: "0.2", lastmod: now },
          { path: "/lexikon", changefreq: "weekly", priority: "0.8", lastmod: now },
          { path: "/mediadaten", changefreq: "monthly", priority: "0.3", lastmod: now },

        ];

        const staticXml = staticEntries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");

        const articleXml = (data ?? [])
          .map((a) => {
            const lastmod =
              (a as any).updated_at ?? (a as any).published_at ?? now;
            const loc = `${BASE_URL}/artikel/${xmlEscape(a.slug)}`;
            return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
          })
          .join("\n");

        const lexikonIndexAlt = `    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}/lexikon" />\n    <xhtml:link rel="alternate" hreflang="de-DE" href="${BASE_URL}/lexikon" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/lexikon" />`;

        const lexikonXml = (lexikon ?? [])
          .map((l: any) => {
            const lastmod = l.updated_at ?? now;
            const loc = `${BASE_URL}/lexikon/${xmlEscape(l.slug)}`;
            const alt = `    <xhtml:link rel="alternate" hreflang="de" href="${loc}" />\n    <xhtml:link rel="alternate" hreflang="de-DE" href="${loc}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`;
            return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alt}\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
          })
          .join("\n");

        // Inject hreflang into the /lexikon index entry within staticXml
        const staticXmlWithAlt = staticXml.replace(
          `<loc>${BASE_URL}/lexikon</loc>\n    <lastmod>${now}</lastmod>`,
          `<loc>${BASE_URL}/lexikon</loc>\n    <lastmod>${now}</lastmod>\n${lexikonIndexAlt}`,
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${staticXmlWithAlt}\n${articleXml}\n${lexikonXml}\n</urlset>`;



        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=600, s-maxage=600",
          },
        });
      },
    },
  },
});
