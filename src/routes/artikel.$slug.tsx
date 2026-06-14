import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPublicArticleBySlug, getPublicArticles } from "@/lib/articles.functions";
import { ShareMenu } from "@/components/ShareMenu";
import { BookmarkButton } from "@/components/BookmarkButton";

const SITE = "https://radmap.de";
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
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    const seo = loaderData?.seo;
    if (!a) return { meta: [] };
    const title = seo?.seo_title || a.title;
    const description = seo?.seo_description || a.excerpt;
    const image = abs(seo?.og_image || a.image);
    return {
      meta: [
        { title: `${title} | radmap.de` },
        { name: "description", content: description },
        ...(seo?.seo_keywords ? [{ name: "keywords", content: seo.seo_keywords }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "radmap.de" },
        { property: "og:locale", content: "de_DE" },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: a.title },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: abs(`/artikel/${a.slug}`) },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "twitter:image:alt", content: a.title },
      ],
      links: [{ rel: "canonical", href: abs(`/artikel/${a.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.excerpt,
            image: [image],
            datePublished: a.date,
            author: { "@type": "Organization", name: "radmap.de" },
            publisher: { "@type": "Organization", name: "radmap.de" },
          }),
        },
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
          <span className="text-foreground font-semibold">Von Redaktion radmap.de</span>
          <span className="h-px w-3 bg-muted-foreground/40" />
          <span>{a.date}</span>
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
                <div className="mt-2 font-display text-base font-bold">Redaktion radmap.de</div>
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
