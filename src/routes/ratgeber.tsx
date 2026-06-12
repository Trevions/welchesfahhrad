import { createFileRoute } from "@tanstack/react-router";
import { CategoryHero } from "@/components/CategoryHero";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticlesByCategory } from "@/lib/articles";

export const Route = createFileRoute("/ratgeber")({
  head: () => ({
    meta: [
      { title: "Fahrrad-Ratgeber: Wartung, Tipps & Know-how | radmap.de" },
      {
        name: "description",
        content:
          "Praktische Ratgeber rund um Fahrrad-Wartung, Pflege, Sicherheit und Zubehör. Schritt-für-Schritt-Anleitungen vom Profi.",
      },
      { property: "og:title", content: "Fahrrad-Ratgeber | radmap.de" },
      { property: "og:description", content: "Praktische Ratgeber rund um Wartung, Pflege und Zubehör." },
      { property: "og:url", content: "/ratgeber" },
    ],
    links: [{ rel: "canonical", href: "/ratgeber" }],
  }),
  component: Ratgeber,
});

function Ratgeber() {
  const items = getArticlesByCategory("Ratgeber");
  return (
    <>
      <CategoryHero
        eyebrow="Ratgeber & Tipps"
        title="Wissen das fährt"
        description="Praxiserprobte Anleitungen, Checklisten und Tipps — geschrieben von Mechanikern, Tourenexperten und Radprofis."
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
