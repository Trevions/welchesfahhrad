import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getLexikonTermBySlug } from "@/lib/lexikon.functions";

const SITE = "https://radmap.de";

const CATEGORY_ARTICLE_SLUG: Record<string, string> = {
  Nachrichten: "/",
  Ratgeber: "/ratgeber",
  "E-Bikes": "/e-bikes",
  Tests: "/tests",
};

const termQuery = (slug: string) =>
  queryOptions({
    queryKey: ["lexikon-term", slug],
    queryFn: () => getLexikonTermBySlug({ data: { slug } }),
    staleTime: 5 * 60_000,
  });

export const Route = createFileRoute("/lexikon/$slug")({
  loader: async ({ params, context }) => {
    const res = await context.queryClient.ensureQueryData(termQuery(params.slug));
    if (!res.term) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    const t = loaderData?.term;
    if (!t) {
      return {
        meta: [
          { title: "Begriff nicht gefunden | radmap.de" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const url = `${SITE}/lexikon/${params.slug}`;
    const title = t.seo_title || `${t.term} – Definition & Erklärung`;
    const description =
      t.seo_description ||
      t.short_definition ||
      `${t.term} einfach erklärt im Fahrrad-Lexikon von radmap.de.`;
    const published = t.created_at ?? t.updated_at ?? undefined;
    const modified = t.updated_at ?? t.created_at ?? undefined;
    const keywords = [
      t.term,
      ...(t.synonyms ?? []),
      ...(t.category ? [t.category] : []),
      "Fahrrad-Lexikon",
    ];
    const wordCount = t.body ? t.body.trim().split(/\s+/).length : undefined;

    const definedTerm = {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "@id": `${url}#term`,
      name: t.term,
      description: t.short_definition,
      url,
      inLanguage: "de-DE",
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: "Fahrrad-Lexikon von radmap.de",
        url: `${SITE}/lexikon`,
        inLanguage: "de-DE",
      },
      ...(t.synonyms?.length ? { alternateName: t.synonyms } : {}),
      ...(t.category ? { termCode: t.category } : {}),
      ...(published ? { datePublished: published } : {}),
      ...(modified ? { dateModified: modified } : {}),
    };

    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#article`,
      headline: title,
      name: t.term,
      description,
      url,
      inLanguage: "de-DE",
      isPartOf: { "@type": "WebSite", "@id": `${SITE}#website`, name: "radmap.de", url: SITE },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      mainEntity: { "@id": `${url}#term` },
      about: { "@id": `${url}#term` },
      keywords: keywords.join(", "),
      ...(t.category ? { articleSection: t.category } : {}),
      ...(wordCount ? { wordCount } : {}),
      author: {
        "@type": "Organization",
        name: "Redaktion radmap.de",
        url: `${SITE}/redaktion`,
      },
      publisher: {
        "@type": "Organization",
        name: "radmap.de",
        url: SITE,
        logo: {
          "@type": "ImageObject",
          url: `${SITE}/icons/icon-192.png`,
          width: 192,
          height: 192,
        },
      },
      ...(published ? { datePublished: published } : {}),
      ...(modified ? { dateModified: modified } : {}),
    };


    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Lexikon", item: `${SITE}/lexikon` },
        { "@type": "ListItem", position: 3, name: t.term, item: url },
      ],
    };

    return {
      meta: [
        { title: `${title} | radmap.de` },
        { name: "description", content: description },
        { name: "author", content: "Redaktion radmap.de" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "radmap.de" },
        { property: "og:locale", content: "de_DE" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "de", href: url },
        { rel: "alternate", hrefLang: "de-DE", href: url },
        { rel: "alternate", hrefLang: "x-default", href: url },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(definedTerm) },
        { type: "application/ld+json", children: JSON.stringify(article) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
      ],
    };
  },
  notFoundComponent: TermNotFound,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Fehler beim Laden</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button onClick={reset} className="px-4 py-2 rounded bg-signal text-signal-foreground">
          Neu versuchen
        </button>
      </div>
    </div>
  ),
  component: LexikonTermPage,
});

function TermNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-black mb-3">Begriff nicht gefunden</h1>
        <p className="text-muted-foreground mb-6">
          Diesen Fachbegriff haben wir (noch) nicht im Lexikon.
        </p>
        <Link
          to="/lexikon"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-signal text-signal-foreground font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Zum Lexikon
        </Link>
      </div>
    </div>
  );
}

function bodyToParagraphs(md: string | null | undefined): string[] {
  if (!md) return [];
  return md
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .map((b) =>
      b
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s*[-*]\s+/gm, "• ")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, "$1")
        .replace(/__(.+?)__/g, "$1"),
    )
    .filter(Boolean);
}

function formatDate(iso?: string | null): string {
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

function LexikonTermPage() {
  const { data } = useSuspenseQuery(termQuery(Route.useParams().slug));
  const { term, relatedArticles, relatedTerms, autoRelatedTerms } = data;
  if (!term) return null;
  const paragraphs = bodyToParagraphs(term.body);
  const modified = formatDate(term.updated_at ?? term.created_at);

  return (
    <div className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-4 pt-8 pb-16 md:pt-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground">
                Start
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link to="/lexikon" className="hover:text-foreground">
                Lexikon
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li className="text-foreground font-medium line-clamp-1">{term.term}</li>
          </ol>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-signal eyebrow mb-3">
            <BookOpen className="h-4 w-4" />
            <span>Lexikon{term.category ? ` · ${term.category}` : ""}</span>
          </div>
          <h1 className="font-display font-black tracking-tight text-4xl md:text-6xl leading-[0.95]">
            {term.term}
          </h1>
          {term.synonyms?.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Auch bekannt als:{" "}
              <span className="text-foreground">{term.synonyms.join(", ")}</span>
            </p>
          )}
          <p className="mt-5 text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            {term.short_definition}
          </p>
        </header>

        <div className="prose prose-invert max-w-none space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
        </div>

        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display font-bold text-2xl mb-4">Passende Artikel</h2>
            <ul className="space-y-3">
              {relatedArticles.map((a) => (
                <li key={a.slug}>
                  <Link
                    to="/artikel/$slug"
                    params={{ slug: a.slug }}
                    className="group flex items-baseline gap-3"
                  >
                    <span className="eyebrow text-signal shrink-0">{a.category}</span>
                    <span className="font-semibold group-hover:text-signal transition-colors">
                      {a.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedTerms.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display font-bold text-2xl mb-4">Verwandte Begriffe</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTerms.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/lexikon/$slug"
                    params={{ slug: r.slug }}
                    className="group block p-4 rounded-md border border-border hover:border-signal transition-colors"
                  >
                    <span className="font-semibold group-hover:text-signal transition-colors">
                      {r.term}
                    </span>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {r.short_definition}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {autoRelatedTerms.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display font-bold text-2xl mb-1">Ähnliche Begriffe</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Automatisch vorgeschlagen auf Basis thematischer Überschneidungen im Lexikon.
            </p>
            <ul className="flex flex-wrap gap-2">
              {autoRelatedTerms.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/lexikon/$slug"
                    params={{ slug: r.slug }}
                    title={r.short_definition}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:border-signal hover:text-signal transition-colors text-sm"
                  >
                    <span className="font-semibold">{r.term}</span>
                    {r.category && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {r.category}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {term.category && CATEGORY_ARTICLE_SLUG[term.category] && (
          <div className="mt-10 text-sm text-muted-foreground">
            Alle Artikel zum Thema{" "}
            <Link
              to={CATEGORY_ARTICLE_SLUG[term.category] as any}
              className="text-signal hover:underline font-semibold"
            >
              {term.category}
            </Link>
            .
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Redaktionell geprüft von der radmap.de-Redaktion</span>
          {modified && <span>Zuletzt aktualisiert: {modified}</span>}
        </footer>
      </article>
    </div>
  );
}
