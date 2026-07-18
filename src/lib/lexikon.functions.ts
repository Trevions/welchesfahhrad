import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type LexikonTerm = {
  slug: string;
  term: string;
  short_definition: string;
  body: string;
  category: string | null;
  synonyms: string[];
  related_article_slugs: string[];
  related_term_slugs: string[];
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string | null;
  created_at: string | null;
};

export type LexikonListItem = Pick<
  LexikonTerm,
  "slug" | "term" | "short_definition" | "category" | "synonyms"
>;

export const getLexikonTerms = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("lexikon_terms")
    .select("slug, term, short_definition, category, synonyms")
    .eq("status", "published")
    .order("term", { ascending: true })
    .limit(2000);
  if (error) throw new Error(error.message);
  return { terms: (data ?? []) as LexikonListItem[] };
});

export const getLexikonTermBySlug = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("lexikon_terms")
      .select(
        "slug, term, short_definition, body, category, synonyms, related_article_slugs, related_term_slugs, seo_title, seo_description, updated_at, created_at",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { term: null as LexikonTerm | null, relatedArticles: [], relatedTerms: [] };

    const term = row as LexikonTerm;

    const [{ data: articles }, { data: relTerms }] = await Promise.all([
      term.related_article_slugs?.length
        ? supabaseAdmin
            .from("articles")
            .select("slug, title, category")
            .in("slug", term.related_article_slugs)
            .eq("status", "published")
        : Promise.resolve({ data: [] as any[] }),
      term.related_term_slugs?.length
        ? supabaseAdmin
            .from("lexikon_terms")
            .select("slug, term, short_definition")
            .in("slug", term.related_term_slugs)
            .eq("status", "published")
        : Promise.resolve({ data: [] as any[] }),
    ]);

    return {
      term,
      relatedArticles: (articles ?? []) as Array<{ slug: string; title: string; category: string }>,
      relatedTerms: (relTerms ?? []) as Array<{ slug: string; term: string; short_definition: string }>,
    };
  });
