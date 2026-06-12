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
  const [lead, ...rest] = items;
  return (
    <>
      <CategoryHero
        eyebrow="Nachrichten"
        title="Was die Radwelt bewegt"
        description="Tagesaktuelle Meldungen aus Deutschland, Europa und der Welt — kuratiert aus über 80 Fachquellen und neu aufbereitet."
      />
      {lead && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-12 border-x border-border">
            <ArticleCard article={lead} featured size="lg" index={0} />
          </div>
        </section>
      )}
      <section className="mx-auto max-w-[1400px] px-6 md:px-8 py-16 md:py-24 border-x border-border">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
