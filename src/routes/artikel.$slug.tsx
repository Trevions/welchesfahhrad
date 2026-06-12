import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { getArticleBySlug } from "@/lib/articles";

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
    <div className="pt-40 text-center">
      <h1 className="font-display text-3xl">Artikel nicht gefunden</h1>
      <Link to="/" className="mt-4 inline-block text-signal">Zur Startseite</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="pt-40 text-center">
      <h1 className="font-display text-3xl">Fehler beim Laden</h1>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const a = Route.useLoaderData();

  return (
    <article className="pt-24 md:pt-32">
      <div className="mx-auto max-w-4xl px-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>

        <div className="mt-6">
          <span className="rounded-full glass px-3 py-1 text-xs font-semibold tracking-wide uppercase text-signal">
            {a.category}
          </span>
        </div>

        <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold tracking-tight text-gradient animate-fade-up">
          {a.title}
        </h1>

        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{a.date}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.readTime}</span>
          {a.source && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>Quelle: {a.source}</span>
            </>
          )}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl glass shadow-glass animate-scale-in">
          <img src={a.image} alt={a.title} className="aspect-[16/9] w-full object-cover" />
        </div>

        <div className="mt-10 max-w-3xl text-lg leading-relaxed text-foreground/90 space-y-6">
          <p className="text-xl text-foreground font-medium">{a.excerpt}</p>
          {a.body.map((p: string, i: number) => (
            <p key={i} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
