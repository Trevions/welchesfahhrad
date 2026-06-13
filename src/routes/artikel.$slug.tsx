import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Bookmark } from "lucide-react";
import { getArticleBySlug, articles } from "@/lib/articles";
import { ShareMenu } from "@/components/ShareMenu";

const SITE = "https://radmap.de";
const abs = (u: string) => (/^https?:\/\//i.test(u) ? u : SITE + (u.startsWith("/") ? u : "/" + u));

export const Route = createFileRoute("/artikel/$slug")({
  loader: ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | radmap.de` },
          { name: "description", content: loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
          { property: "og:type", content: "article" },
          { property: "og:image", content: loaderData.image },
          { property: "og:url", content: `/artikel/${loaderData.slug}` },
          { name: "twitter:image", content: loaderData.image },
        ]
      : [],
    links: loaderData
      ? [{ rel: "canonical", href: `/artikel/${loaderData.slug}` }]
      : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: loaderData.title,
              description: loaderData.excerpt,
              image: [loaderData.image],
              datePublished: loaderData.date,
              author: { "@type": "Organization", name: "radmap.de" },
              publisher: { "@type": "Organization", name: "radmap.de" },
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="pt-32 px-6 text-center">
      <div className="eyebrow text-signal">Fehler</div>
      <h1 className="mt-4 font-display text-4xl font-black italic">Artikel nicht gefunden</h1>
      <Link to="/" className="mt-6 inline-block eyebrow border-b border-foreground pb-1">
        Zur Startseite
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="pt-32 px-6 text-center">
      <h1 className="font-display text-3xl font-black">Fehler beim Laden</h1>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const a = Route.useLoaderData();
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3);

  return (
    <article>
      {/* Top meta bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 eyebrow text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Zurück
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Teilen"
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <Share2 className="h-3 w-3" />
            </button>
            <button
              type="button"
              aria-label="Merken"
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <Bookmark className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Title block */}
      <header className="mx-auto max-w-[1100px] px-6 md:px-8 pt-10 md:pt-20 pb-10">
        <div className="flex items-center gap-3 animate-fade-in">
          <span className="h-px w-10 bg-signal animate-rule-grow" />
          <span className="eyebrow text-signal">{a.category}</span>
        </div>

        <h1 className="mt-6 font-display font-black tracking-tight leading-[0.95] text-4xl md:text-6xl lg:text-7xl text-foreground animate-fade-up">
          {a.title.split(" ").slice(0, -2).join(" ")}{" "}
          <span className="italic text-muted-foreground">
            {a.title.split(" ").slice(-2).join(" ")}
          </span>
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

      {/* Cover image */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="relative overflow-hidden bg-card border border-border animate-scale-in">
          <img
            src={a.image}
            alt={a.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1100px] px-6 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_2.5fr] gap-12">
          {/* Side rail (desktop) */}
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

          {/* Prose */}
          <div className="text-lg md:text-xl leading-[1.7] text-foreground/90 space-y-7 font-light">
            {a.body.map((p: string, i: number) =>
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
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {p}
                </p>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Related */}
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
    </article>
  );
}
