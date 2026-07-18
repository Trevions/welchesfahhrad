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
> & { related_article_slugs: string[]; related_term_slugs: string[] };

export type LexikonArticleRef = { slug: string; title: string; category: string | null };

export const getLexikonTerms = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("lexikon_terms")
    .select("slug, term, short_definition, category, synonyms, related_article_slugs, related_term_slugs")
    .eq("status", "published")
    .order("term", { ascending: true })
    .limit(2000);
  if (error) throw new Error(error.message);
  const terms = (data ?? []) as LexikonListItem[];

  const articleSlugs = Array.from(
    new Set(terms.flatMap((t) => t.related_article_slugs ?? []).filter(Boolean)),
  );
  let articles: LexikonArticleRef[] = [];
  if (articleSlugs.length) {
    const { data: arts } = await supabaseAdmin
      .from("articles")
      .select("slug, title, category")
      .in("slug", articleSlugs)
      .eq("status", "published");
    articles = (arts ?? []) as LexikonArticleRef[];
  }
  return { terms, articles };
});

export type AutoRelatedTerm = {
  slug: string;
  term: string;
  short_definition: string;
  category: string | null;
  score: number;
};

const STOPWORDS = new Set([
  "der","die","das","und","oder","aber","ist","sind","war","waren","sein","seine","seiner","seines",
  "ein","eine","einer","eines","einem","einen","dem","den","des","zur","zum","auf","aus","bei","mit",
  "nach","von","vom","für","fur","als","auch","noch","nur","wie","was","wer","wenn","weil","dass",
  "dann","doch","nicht","kein","keine","keinen","keiner","mehr","sehr","schon","hier","dort","man",
  "sich","sie","ihr","ihre","ihrer","ihres","unser","unsere","the","and","for","with","from","not",
  "are","was","were","über","uber","unter","zwischen","gegen","ohne","durch","werden","wird","wurde",
  "haben","hat","hatte","kann","können","muss","müssen","soll","sollen","dazu","daran","darauf",
  "dabei","bzw","etc","beispiel","also","dies","diese","dieser","diesen","dieses","beim","allen",
  "alle","alles","viele","viel","wenig","wenige","ganz","ganze","ganzen","beim","damit","dadurch",
  "sowie","sowohl","weder","jedoch","zwar","etwa","meist","meistens","oft","immer","nie","gerne",
  "eigentlich","siehe","z.b","bzw.","d.h","usw","insbesondere","typisch","typischerweise",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s-]+/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^-+|-+$/g, ""))
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function buildKeywordSet(t: {
  term: string;
  synonyms?: string[] | null;
  short_definition?: string | null;
  body?: string | null;
}): Set<string> {
  const parts = [
    t.term,
    ...(t.synonyms ?? []),
    t.short_definition ?? "",
    (t.body ?? "").slice(0, 2000),
  ];
  return new Set(tokenize(parts.join(" ")));
}

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
    if (!row)
      return {
        term: null as LexikonTerm | null,
        relatedArticles: [],
        relatedTerms: [],
        autoRelatedTerms: [] as AutoRelatedTerm[],
      };

    const term = row as LexikonTerm;

    const [{ data: articles }, { data: relTerms }, { data: allTerms }] = await Promise.all([
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
      supabaseAdmin
        .from("lexikon_terms")
        .select("slug, term, short_definition, category, synonyms, body")
        .eq("status", "published")
        .neq("slug", term.slug)
        .limit(2000),
    ]);

    // Auto-related terms via keyword overlap (Jaccard + category boost)
    const sourceKeywords = buildKeywordSet(term);
    const manuallyLinked = new Set(term.related_term_slugs ?? []);
    const scored: AutoRelatedTerm[] = [];
    if (sourceKeywords.size > 0) {
      for (const other of (allTerms ?? []) as Array<{
        slug: string;
        term: string;
        short_definition: string;
        category: string | null;
        synonyms: string[] | null;
        body: string | null;
      }>) {
        if (manuallyLinked.has(other.slug)) continue;
        const otherKw = buildKeywordSet(other);
        let overlap = 0;
        for (const k of otherKw) if (sourceKeywords.has(k)) overlap++;
        if (overlap < 2) continue;
        const union = sourceKeywords.size + otherKw.size - overlap || 1;
        let score = overlap / union;
        if (term.category && other.category && term.category === other.category) score += 0.05;
        scored.push({
          slug: other.slug,
          term: other.term,
          short_definition: other.short_definition,
          category: other.category,
          score,
        });
      }
      scored.sort((a, b) => b.score - a.score || a.term.localeCompare(b.term, "de"));
    }
    const autoRelatedTerms = scored.slice(0, 10);

    return {
      term,
      relatedArticles: (articles ?? []) as Array<{ slug: string; title: string; category: string }>,
      relatedTerms: (relTerms ?? []) as Array<{ slug: string; term: string; short_definition: string }>,
      autoRelatedTerms,
    };
  });
