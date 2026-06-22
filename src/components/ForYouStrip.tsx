import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, Settings2 } from "lucide-react";
import { useBikeProfile, summarizeProfile } from "@/lib/bike-profile";
import { getTopMatches } from "@/lib/recommendations";
import { getPublicArticles } from "@/lib/articles.functions";

const articlesQuery = queryOptions({
  queryKey: ["public-articles"],
  queryFn: () => getPublicArticles(),
  staleTime: 60_000,
});

export function ForYouStrip() {
  const profile = useBikeProfile();
  const { data } = useSuspenseQuery(articlesQuery);

  const matches = useMemo(
    () => getTopMatches(data.articles, profile, { limit: 6, minScore: 3 }),
    [data.articles, profile],
  );

  // No profile yet → soft CTA strip
  if (!profile || profile.bikeTypes.length === 0) {
    return (
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-6 border-x border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-signal" />
              <span className="eyebrow text-signal">Für dich</span>
            </div>
            <p className="mt-2 text-sm md:text-base">
              <span className="font-display font-bold">In 60 Sekunden zu persönlichen Empfehlungen.</span>{" "}
              <span className="text-muted-foreground">
                Sag uns, was du fährst — wir zeigen dir genau die Artikel, Tests und Tools, die zu dir passen.
              </span>
            </p>
          </div>
          <Link
            to="/mein-rad"
            className="shrink-0 inline-flex items-center gap-2 bg-signal text-signal-foreground px-5 py-3 eyebrow hover:opacity-90 transition-opacity"
          >
            RadProfil anlegen <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  // Profile but no strong matches → keep it quiet
  if (matches.length < 2) return null;

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-10 md:py-14 border-x border-border">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-signal" />
              <span className="eyebrow text-signal">Für dich relevant</span>
            </div>
            <h2 className="mt-3 font-display text-2xl md:text-3xl font-black leading-tight">
              Auf dein Rad zugeschnitten.{" "}
              <span className="text-muted-foreground font-light italic">
                {summarizeProfile(profile)}
              </span>
            </h2>
          </div>
          <Link
            to="/mein-rad"
            className="inline-flex items-center gap-2 eyebrow-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" /> Profil bearbeiten
          </Link>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {matches.map(({ article, reason }) => (
            <li key={article.slug} className="bg-background">
              <Link
                to="/artikel/$slug"
                params={{ slug: article.slug }}
                className="group flex h-full flex-col p-5 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="eyebrow-sm text-signal">◆ {article.category}</span>
                  {reason && (
                    <span className="eyebrow-sm text-muted-foreground truncate">
                      · {reason}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold leading-snug group-hover:text-signal transition-colors">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 font-light">
                    {article.excerpt}
                  </p>
                )}
                <span className="mt-auto pt-4 eyebrow-sm text-muted-foreground inline-flex items-center gap-1 group-hover:text-foreground transition-colors">
                  Lesen <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
