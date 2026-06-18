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
        const { data } = await supabaseAdmin
          .from("articles")
          .select("slug, published_at, updated_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(5000);

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
          { path: "/karte", changefreq: "weekly", priority: "0.85", lastmod: now },
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

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticXml}\n${articleXml}\n</urlset>`;

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
