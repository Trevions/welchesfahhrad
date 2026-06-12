import { createFileRoute } from "@tanstack/react-router";
import { CategoryHero } from "@/components/CategoryHero";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticlesByCategory } from "@/lib/articles";

export const Route = createFileRoute("/nachrichten")({
  head: () => ({
    meta: [
      { title: "Fahrrad-Nachrichten aus Deutschland & der Welt | radmap.de" },
      {
        name: "description",
        content:
          "Tagesaktuelle Nachrichten rund um Fahrrad, E-Bike und Radsport aus deutschen und internationalen Quellen. Schnell, recherchiert, kompakt.",
      },
      { property: "og:title", content: "Fahrrad-Nachrichten | radmap.de" },
      { property: "og:description", content: "Tagesaktuelle Nachrichten rund um Fahrrad und Radsport." },
      { property: "og:url", content: "/nachrichten" },
    ],
    links: [{ rel: "canonical", href: "/nachrichten" }],
  }),
  component: Nachrichten,
});

function Nachrichten() {
  const items = getArticlesByCategory("Nachrichten");
  return (
    <>
      <CategoryHero
        eyebrow="Nachrichten"
        title="Was die Radwelt bewegt"
        description="Tagesaktuelle Meldungen aus Deutschland, Europa und der Welt — kuratiert aus über 80 Fachquellen und neu aufbereitet."
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
