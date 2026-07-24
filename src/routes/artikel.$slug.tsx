import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { useEffect } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPublicArticleBySlug, getPublicArticles } from "@/lib/articles.functions";
import { ShareMenu } from "@/components/ShareMenu";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ReportArticleDialog } from "@/components/ReportArticleDialog";
import { markArticleRead } from "@/lib/read-articles";


const SITE = "https://welchesfahrrad.de";
const abs = (u: string) => (/^https?:\/\//i.test(u) ? u : SITE + (u.startsWith("/") ? u : "/" + u));

const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-article", slug],
    queryFn: () => getPublicArticleBySlug({ data: { slug } }),
    staleTime: 60_000,
  });

const relatedQuery = queryOptions({
  queryKey: ["public-articles"],
  queryFn: () => getPublicArticles(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/artikel/$slug")({
  loader: async ({ params, context }) => {
    const res = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!res.article) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    const a = loaderData?.article;
    const seo = loaderData?.seo;
    if (!a) return { meta: [] };
    const title = seo?.seo_title || a.title;
    const description = seo?.seo_description || a.excerpt;
    const image = abs(seo?.og_image || a.image);
    const url = abs(`/artikel/${a.slug}`);
    const published = seo?.published_at ?? seo?.created_at ?? undefined;
    const modified = seo?.updated_at ?? published;
    const categorySlugMap: Record<string, string> = {
      Nachrichten: "/",
      Ratgeber: "/ratgeber",
      "E-Bikes": "/e-bikes",
      Tests: "/fahrraeder",
    };
    const catUrl = abs(categorySlugMap[a.category] ?? "/");
    const wordCount = (a.body ?? []).reduce(
      (n, p) => n + (typeof p === "string" ? p.trim().split(/\s+/).length : 0),
      0,
    );

    const articleJsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      headline: a.title,
      description: a.excerpt,
      image: [image],
      inLanguage: "de-DE",
      articleSection: a.category,
      isAccessibleForFree: true,
      ...(wordCount ? { wordCount } : {}),
      ...(published ? { datePublished: published } : {}),
      ...(modified ? { dateModified: modified } : {}),
      ...(seo?.seo_keywords ? { keywords: seo.seo_keywords } : {}),
      author: {
        "@type": "Organization",
        name: "Redaktion welchesfahrrad.de",
        url: `${SITE}/redaktion`,
      },
      publisher: {
        "@type": "Organization",
        name: "welchesfahrrad.de",
        url: SITE,
        logo: {
          "@type": "ImageObject",
          url: `${SITE}/icons/icon-192.png`,
          width: 192,
          height: 192,
        },
      },
      isPartOf: { "@type": "WebSite", "@id": `${SITE}#website`, name: "welchesfahrrad.de", url: SITE },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".drop-cap"],
      },
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: a.category, item: catUrl },
        { "@type": "ListItem", position: 3, name: a.title, item: url },
      ],
    };

    return {
      meta: [
        { title: `${title} | welchesfahrrad.de` },
        { name: "description", content: description },
        ...(seo?.seo_keywords ? [{ name: "keywords", content: seo.seo_keywords }] : []),
        { name: "author", content: "Redaktion welchesfahrrad.de" },

        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "welchesfahrrad.de" },
        { property: "og:locale", content: "de_DE" },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: a.title },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: url },
        ...(published ? [{ property: "article:published_time", content: published }] : []),
        ...(modified ? [{ property: "article:modified_time", content: modified }] : []),
        { property: "article:section", content: a.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@welchesfahrrad_de" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "twitter:image:alt", content: a.title },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "de-DE", href: url },
        { rel: "alternate", hrefLang: "x-default", href: url },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleJsonLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd) },
      ],
    };
  },

  notFoundComponent: () => (
    <div className="pt-32 px-6 text-center">
      <div className="eyebrow text-signal">Fehler</div>
      <h1 className="mt-4 font-display text-4xl font-black italic">Artikel nicht gefunden</h1>
      <Link to="/" className="mt-6 inline-block eyebrow border-b border-foreground pb-1">
        Zur Startseite
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="pt-32 px-6 text-center">
      <h1 className="font-display text-3xl font-black">Fehler beim Laden</h1>
      <p className="mt-3 text-muted-foreground text-sm">{error.message}</p>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const params = Route.useParams();
  const { data } = useSuspenseQuery(articleQuery(params.slug));
  const { data: relData } = useSuspenseQuery(relatedQuery);
  const a = data.article!;
  const related = relData.articles.filter((x) => x.slug !== a.slug).slice(0, 3);

  // Mark article as read once visible (removes it from the "Für dich" feed).
  useEffect(() => {
    markArticleRead(a.slug);
  }, [a.slug]);

  return (

    <article>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 eyebrow text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Zurück
          </Link>
          <div className="flex items-center gap-3">
            <ShareMenu
              url={`/artikel/${a.slug}`}
              title={a.title}
              text={a.excerpt}
              image={a.image}
            />
            <BookmarkButton
              article={{
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt,
                image: a.image,
                category: a.category,
                date: a.date,
                readTime: a.readTime,
              }}
            />
          </div>
        </div>
      </div>

      <header className="mx-auto max-w-[1100px] px-6 md:px-8 pt-10 md:pt-20 pb-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li><Link to="/" className="hover:text-foreground">Start</Link></li>
            <li aria-hidden>›</li>
            <li>
              <Link
                to={
                  a.category === "Ratgeber" ? "/ratgeber"
                  : a.category === "E-Bikes" ? "/e-bikes"
                  : a.category === "Tests" ? "/fahrraeder"
                  : "/"
                }
                className="hover:text-foreground"
              >
                {a.category}
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li className="text-foreground/70 truncate max-w-[60vw]" title={a.title}>{a.title}</li>
          </ol>
        </nav>

        <div className="flex items-center gap-3 animate-fade-in">
          <span className="h-px w-10 bg-signal animate-rule-grow" />
          <span className="eyebrow text-signal">{a.category}</span>
        </div>

        <h1 className="mt-6 font-display font-black tracking-tight leading-[0.95] text-4xl md:text-6xl lg:text-7xl text-foreground animate-fade-up">
          {a.title}
        </h1>

        <p
          className="mt-8 max-w-3xl text-lg md:text-2xl text-muted-foreground font-light leading-relaxed animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {a.excerpt}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="text-foreground font-semibold">Von Redaktion welchesfahrrad.de</span>
          <span className="h-px w-3 bg-muted-foreground/40" />
          <span>{a.date}</span>
          {data.seo?.updated_at && data.seo?.published_at && data.seo.updated_at.slice(0, 10) !== data.seo.published_at.slice(0, 10) && (
            <>
              <span className="h-px w-3 bg-muted-foreground/40" />
              <span>
                Zuletzt aktualisiert:{" "}
                <time dateTime={data.seo.updated_at} className="text-foreground/80">
                  {new Date(data.seo.updated_at).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                </time>
              </span>
            </>
          )}
          <span className="h-px w-3 bg-muted-foreground/40" />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {a.readTime}
          </span>
          {a.source && (
            <>
              <span className="h-px w-3 bg-muted-foreground/40" />
              <span>Quelle · {a.source}</span>
            </>
          )}
        </div>
      </header>

      {a.image && (
        <div className="mx-auto max-w-[1400px] px-6 md:px-8">
          <figure className="relative overflow-hidden bg-card border border-border animate-scale-in">
            <img
              src={a.image}
              alt={a.imageCaption || a.title}
              className="aspect-[16/9] w-full object-cover"
            />
            {a.imageIsAi && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground border border-border">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                KI-generiert
              </span>
            )}
            {(a.imageCaption || a.imageCredit) && (
              <figcaption className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border bg-card/60 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
                {a.imageCaption && <span className="text-foreground/80">{a.imageCaption}</span>}
                {a.imageCredit && (
                  <span className="uppercase tracking-widest text-[10px] text-muted-foreground/80">
                    {a.imageCredit}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      <div className="mx-auto max-w-[1100px] px-6 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_2.5fr] gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div>
                <div className="eyebrow-sm text-muted-foreground">Autor</div>
                <div className="mt-2 font-display text-base font-bold">Redaktion welchesfahrrad.de</div>
              </div>
              <div>
                <div className="eyebrow-sm text-muted-foreground">Veröffentlicht</div>
                <div className="mt-2 text-sm">{a.date}</div>
              </div>
              <div>
                <div className="eyebrow-sm text-muted-foreground">Rubrik</div>
                <div className="mt-2 text-sm">{a.category}</div>
              </div>
            </div>
          </aside>

          <div className="text-lg md:text-xl leading-[1.7] text-foreground/90 space-y-7 font-light">
            {a.body.map((p, i) =>
              i === 0 ? (
                <p
                  key={i}
                  className="drop-cap text-xl md:text-2xl font-normal text-foreground animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {p}
                </p>
              ) : (
                <p
                  key={i}
                  className="animate-fade-up whitespace-pre-line"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {p}
                </p>
              ),
            )}

            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Etwas stimmt nicht mit diesem Artikel?
              </p>
              <ReportArticleDialog articleSlug={a.slug} articleTitle={a.title} />
            </div>
          </div>
        </div>
      </div>


      {related.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-16">
            <div className="flex items-center gap-3 mb-10">
              <span className="h-px w-10 bg-signal" />
              <span className="eyebrow text-signal">Weiterlesen</span>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {related.map((r, i) => (
                <Link
                  key={r.slug}
                  to="/artikel/$slug"
                  params={{ slug: r.slug }}
                  className="group block border-t border-border pt-6"
                >
                  <div className="eyebrow-sm text-signal">{r.category}</div>
                  <h3 className="mt-3 font-display text-2xl font-bold leading-tight transition-colors group-hover:text-signal">
                    {r.title}
                  </h3>
                  <div className="mt-4 eyebrow-sm text-muted-foreground">
                    {r.date} · {r.readTime}
                  </div>
                  <span
                    className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest group-hover:underline"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    Artikel lesen →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
