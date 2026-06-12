import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, buildCategoryJsonLd } from "@/components/CategoryPage";
import { categoryMeta, getArticlesByCategory } from "@/lib/articles";

const cat = "Tests" as const;
const meta = categoryMeta[cat];

export const Route = createFileRoute("/tests")({
  head: () => {
    const lead = getArticlesByCategory(cat)[0];
    return {
      meta: [
        { title: `${meta.title} | radmap.de` },
        { name: "description", content: meta.description },
        { name: "keywords", content: "Fahrrad Test, Rennrad Test, Canyon Aeroad, Shimano Dura-Ace, SRAM Red AXS, Garmin Edge, Komponenten Test" },
        { property: "og:title", content: `${meta.title} | radmap.de` },
        { property: "og:description", content: meta.description },
        { property: "og:url", content: meta.slug },
        { property: "og:type", content: "website" },
        ...(lead ? [{ property: "og:image", content: lead.image } as const] : []),
        ...(lead ? [{ name: "twitter:image", content: lead.image } as const] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: meta.slug }],
      scripts: buildCategoryJsonLd(cat),
    };
  },
  component: () => <CategoryPage category={cat} />,
});
