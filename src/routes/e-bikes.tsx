import { createFileRoute } from "@tanstack/react-router";
import { CategoryHero } from "@/components/CategoryHero";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticlesByCategory } from "@/lib/articles";

export const Route = createFileRoute("/e-bikes")({
  head: () => ({
    meta: [
      { title: "E-Bike News, Tests & Kaufberatung 2026 | radmap.de" },
      {
        name: "description",
        content:
          "Alles rund um E-Bikes: aktuelle Modelle, Tests, Akku-Technik, Motoren und Kaufberatung für Deutschland. Unabhängig & detailliert.",
      },
      { property: "og:title", content: "E-Bike News & Tests | radmap.de" },
      { property: "og:description", content: "E-Bike Tests, Modelle, Akku-Technik und Kaufberatung." },
      { property: "og:url", content: "/e-bikes" },
    ],
    links: [{ rel: "canonical", href: "/e-bikes" }],
  }),
  component: EBikes,
});

function EBikes() {
  const items = getArticlesByCategory("E-Bikes");
  return (
    <>
      <CategoryHero
        eyebrow="E-Bikes"
        title="Elektrisch unterwegs"
        description="Die wichtigsten E-Bike-Trends, Tests und Kaufempfehlungen — vom City-Pendler bis zum Premium-SUV."
      />
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
