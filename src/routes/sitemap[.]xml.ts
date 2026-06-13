import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("articles")
          .select("slug")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(500);

        const staticPaths = ["/", "/nachrichten", "/ratgeber", "/e-bikes", "/tests"];
        const articlePaths = (data ?? []).map((a) => `/artikel/${a.slug}`);
        const all = [...staticPaths, ...articlePaths];

        const urls = all
          .map(
            (p) =>
              `  <url>\n    <loc>${BASE_URL}${p}</loc>\n    <changefreq>daily</changefreq>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
