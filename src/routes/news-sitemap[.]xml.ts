// Google News sitemap — only articles published in the last 48 hours.
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://radmap.de";
const PUBLICATION_NAME = "Radmap";
const PUBLICATION_LANG = "de";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();
        const { data } = await supabaseAdmin
          .from("articles")
          .select("slug, title, published_at")
          .eq("status", "published")
          .gte("published_at", cutoff)
          .order("published_at", { ascending: false })
          .limit(1000);

        const items = (data ?? [])
          .map((a) => {
            const loc = `${BASE_URL}/artikel/${xmlEscape(a.slug)}`;
            const pub = (a as any).published_at ?? new Date().toISOString();
            const title = xmlEscape(a.title ?? "");
            return `  <url>\n    <loc>${loc}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${PUBLICATION_NAME}</news:name>\n        <news:language>${PUBLICATION_LANG}</news:language>\n      </news:publication>\n      <news:publication_date>${pub}</news:publication_date>\n      <news:title>${title}</news:title>\n    </news:news>\n  </url>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${items}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
