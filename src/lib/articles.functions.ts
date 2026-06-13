import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Article } from "@/lib/articles";

// Convert stored markdown body into paragraphs the existing UI expects.
function bodyToParagraphs(md: string | null | undefined): string[] {
  if (!md) return [];
  return md
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    // strip markdown markers — visual prose only
    .map((b) =>
      b
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s*[-*]\s+/gm, "• ")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, "$1")
        .replace(/__(.+?)__/g, "$1"),
    )
    .filter((b) => b.length > 0);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const FALLBACK_IMAGE = "/og.jpg";

function rowToArticle(r: any): Article {
  const validCat = ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"] as const;
  const category = (validCat as readonly string[]).includes(r.category)
    ? (r.category as Article["category"])
    : "Nachrichten";
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    category,
    date: formatDate(r.published_at ?? r.updated_at ?? r.created_at),
    readTime: r.read_time ?? "4 min",
    image: r.cover_image || FALLBACK_IMAGE,
    source: r.source ?? undefined,
    body: bodyToParagraphs(r.body),
  };
}

export const getPublicArticles = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("articles")
      .select(
        "slug, title, excerpt, body, cover_image, category, source, read_time, published_at, updated_at, created_at",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(120);
    if (error) throw new Error(error.message);
    const articles: Article[] = (data ?? []).map(rowToArticle);
    return { articles };
  },
);

export const getPublicArticleBySlug = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("articles")
      .select(
        "slug, title, excerpt, body, cover_image, category, source, read_time, seo_title, seo_description, seo_keywords, og_image, published_at, updated_at, created_at",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { article: null as Article | null, seo: null };
    const article = rowToArticle(row);
    return {
      article,
      seo: {
        seo_title: (row as any).seo_title as string | null,
        seo_description: (row as any).seo_description as string | null,
        seo_keywords: (row as any).seo_keywords as string | null,
        og_image: ((row as any).og_image as string | null) || article.image,
      },
    };
  });
