import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CategoryPage, buildCategoryJsonLd } from "@/components/CategoryPage";
import { categoryMeta } from "@/lib/articles";
import { getPublicArticles } from "@/lib/articles.functions";

const cat = "Nachrichten" as const;
const meta = categoryMeta[cat];

const articlesQuery = queryOptions({
  queryKey: ["public-articles"],
  queryFn: () => getPublicArticles(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/nachrichten")({
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery),
  head: () => ({
    meta: [
      { title: `${meta.title} | radmap.de` },
      { name: "description", content: meta.description },
      { name: "keywords", content: "Fahrrad Nachrichten, E-Bike News, Radsport, ADFC, Radwege Deutschland" },
      { property: "og:title", content: `${meta.title} | radmap.de` },
      { property: "og:description", content: meta.description },
      { property: "og:url", content: meta.slug },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: meta.slug }],
    scripts: buildCategoryJsonLd(cat),
  }),
  errorComponent: ({ error }) => (
    <div className="pt-32 px-6 text-center">
      <h1 className="font-display text-3xl font-black">Fehler beim Laden</h1>
      <p className="mt-3 text-muted-foreground text-sm">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => null,
  component: NachrichtenPage,
});

function NachrichtenPage() {
  const { data } = useSuspenseQuery(articlesQuery);
  return <CategoryPage category={cat} articles={data.articles} />;
}
