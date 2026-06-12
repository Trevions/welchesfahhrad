import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { CategoryHero } from "@/components/CategoryHero";
import {
  articles,
  categoryMeta,
  getArticlesByCategory,
  type Article,
} from "@/lib/articles";

type Props = {
  category: Article["category"];
};

export function CategoryPage({ category }: Props) {
  const meta = categoryMeta[category];
  const items = getArticlesByCategory(category);
  const [lead, ...rest] = items;
  const featured = rest.slice(0, 2);
  const grid = rest.slice(2);

  // Sidebar: other categories
  const otherCats = (Object.keys(categoryMeta) as Article["category"][]).filter(
    (c) => c !== category,
  );

  // Most read = articles from other categories (first 4)
  const moreReads = articles.filter((a) => a.category !== category).slice(0, 4);

  return (
    <>
      {/* Breadcrumb */}
      <nav
        aria-label="Brotkrumen-Navigation"
        className="border-b border-border bg-background/50"
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-3 border-x border-border flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Start
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{meta.eyebrow}</span>
          <span className="ml-auto hidden md:inline">
            {items.length} {items.length === 1 ? "Artikel" : "Artikel"}
          </span>
        </div>
      </nav>

      <CategoryHero
        eyebrow={meta.eyebrow}
        title={meta.tagline}
        description={meta.description}
      />

      {/* Lead article */}
      {lead && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-10 md:py-14 border-x border-border">
            <ArticleCard article={lead} featured size="lg" index={0} />
          </div>
        </section>
      )}

      {/* Main grid + sidebar */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-12 md:py-20 border-x border-border">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Main */}
            <div className="lg:col-span-8">
              {featured.length > 0 && (
                <>
                  <div className="flex items-baseline justify-between mb-8">
                    <h2 className="font-display text-2xl md:text-3xl font-black">
                      Aktuell <span className="italic text-muted-foreground">empfohlen</span>
                    </h2>
                    <span className="eyebrow-sm text-muted-foreground">
                      {meta.eyebrow}
                    </span>
                  </div>
                  <div className="grid gap-10 md:grid-cols-2 mb-16">
                    {featured.map((a, i) => (
                      <ArticleCard key={a.slug} article={a} index={i} />
                    ))}
                  </div>
                </>
              )}

              {grid.length > 0 && (
                <>
                  <div className="flex items-baseline justify-between mb-8">
                    <h2 className="font-display text-2xl md:text-3xl font-black">
                      Alle <span className="italic text-muted-foreground">Beiträge</span>
                    </h2>
                  </div>
                  <div className="grid gap-10 sm:grid-cols-2">
                    {grid.map((a, i) => (
                      <ArticleCard key={a.slug} article={a} index={i} />
                    ))}
                  </div>
                </>
              )}

              {items.length === 0 && (
                <p className="text-muted-foreground">
                  Noch keine Artikel in dieser Kategorie.
                </p>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-24 self-start">
              <div className="border border-border p-6 bg-card">
                <div className="eyebrow-sm text-signal mb-3">Themenbereiche</div>
                <h3 className="font-display text-xl font-black mb-5">
                  Weitere Rubriken
                </h3>
                <ul className="space-y-3">
                  {otherCats.map((c) => {
                    const m = categoryMeta[c];
                    return (
                      <li key={c}>
                        <Link
                          to={m.slug}
                          className="group flex items-center justify-between border-b border-border pb-3 hover:text-signal transition-colors"
                        >
                          <span className="font-display text-lg font-bold">
                            {c}
                          </span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border border-border p-6">
                <div className="eyebrow-sm text-signal mb-3">Meistgelesen</div>
                <h3 className="font-display text-xl font-black mb-5">
                  Auch interessant
                </h3>
                <ul className="space-y-5">
                  {moreReads.map((a, i) => (
                    <li key={a.slug} className="flex gap-3">
                      <span className="font-display text-2xl font-black text-signal leading-none w-6 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Link
                        to="/artikel/$slug"
                        params={{ slug: a.slug }}
                        className="text-sm font-medium leading-snug hover:text-signal transition-colors"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-signal/40 bg-signal/5 p-6">
                <div className="eyebrow-sm text-signal mb-2">Newsletter</div>
                <h3 className="font-display text-xl font-black mb-3 leading-tight">
                  Die {meta.eyebrow}-Woche direkt ins Postfach
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Jeden Freitag: die wichtigsten Meldungen, Tests und Tipps der Woche.
                </p>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    required
                    placeholder="E-Mail"
                    className="flex-1 bg-background border border-border px-3 py-2 text-sm outline-none focus:border-signal"
                  />
                  <button
                    type="submit"
                    className="bg-signal text-signal-foreground px-4 py-2 eyebrow-sm hover:bg-signal/90"
                  >
                    Los
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------- JSON-LD helper ------- */
export function buildCategoryJsonLd(category: Article["category"]) {
  const meta = categoryMeta[category];
  const items = getArticlesByCategory(category);
  return [
    {
      type: "application/ld+json" as const,
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: meta.title,
        description: meta.description,
        url: meta.slug,
        isPartOf: { "@type": "WebSite", name: "radmap.de" },
      }),
    },
    {
      type: "application/ld+json" as const,
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: "/" },
          { "@type": "ListItem", position: 2, name: meta.eyebrow, item: meta.slug },
        ],
      }),
    },
    {
      type: "application/ld+json" as const,
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `/artikel/${a.slug}`,
          name: a.title,
        })),
      }),
    },
  ];
}
