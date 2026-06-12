import { createFileRoute } from "@tanstack/react-router";
import { CategoryHero } from "@/components/CategoryHero";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticlesByCategory } from "@/lib/articles";

export const Route = createFileRoute("/tests")({
  head: () => ({
    meta: [
      { title: "Fahrrad- & E-Bike-Tests 2026 | radmap.de" },
      {
        name: "description",
        content:
          "Detaillierte und unabhängige Tests aktueller Fahrräder, E-Bikes und Komponenten. Mit Bewertung, Stärken und Schwächen.",
      },
      { property: "og:title", content: "Fahrrad-Tests | radmap.de" },
      { property: "og:description", content: "Unabhängige Tests von Fahrrädern, E-Bikes und Komponenten." },
      { property: "og:url", content: "/tests" },
    ],
    links: [{ rel: "canonical", href: "/tests" }],
  }),
  component: Tests,
});

function Tests() {
  const items = getArticlesByCategory("Tests");
  return (
    <>
      <CategoryHero
        eyebrow="Tests & Reviews"
        title="Geprüft Bewertet Empfohlen"
        description="Wir testen über 150 Räder, E-Bikes und Komponenten pro Jahr — auf deutschen Straßen, in den Alpen und im Labor."
      />
      <section className="mx-auto max-w-[1400px] px-6 md:px-8 py-16 md:py-24 border-x border-border">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
