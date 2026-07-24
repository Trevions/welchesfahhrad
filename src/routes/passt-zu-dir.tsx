import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, Settings2, Sparkles, Bike, EyeOff, Bookmark, BookmarkCheck, Inbox } from "lucide-react";
import { useBikeProfile, summarizeProfile } from "@/lib/bike-profile";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReadArticles, markArticleRead } from "@/lib/read-articles";
import { getPercentMatches } from "@/lib/recommendations";
import { getPublicArticles } from "@/lib/articles.functions";

const articlesQuery = queryOptions({
  queryKey: ["public-articles"],
  queryFn: () => getPublicArticles(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/passt-zu-dir")({
  head: () => ({
    meta: [
      { title: "Für dich passend — welchesfahrrad.de" },
      {
        name: "description",
        content:
          "Personalisierter Feed: Artikel und Tests, die zu mehr als 80 % zu deinem RadProfil passen.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PasstZuDirPage,
});

function PasstZuDirPage() {
  const profile = useBikeProfile();
  const { data, isPending } = useQuery({
    ...articlesQuery,
    enabled: !!profile && profile.bikeTypes.length > 0,
  });
  const { bookmarks, toggle: toggleBookmark, isBookmarked } = useBookmarks();
  const { readMap } = useReadArticles();

  const visible = useMemo(() => {
    if (!profile || profile.bikeTypes.length === 0 || !data) return [];
    const saved = new Set(bookmarks.map((b) => b.slug));
    return getPercentMatches(data.articles, profile, { minPercent: 80 }).filter(
      (m) => !readMap[m.article.slug] && !saved.has(m.article.slug),
    );
  }, [profile, data, bookmarks, readMap]);

  // No profile yet
  if (!profile || profile.bikeTypes.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-3 justify-center">
            <span className="h-px w-10 bg-signal" />
            <span className="eyebrow text-signal">Für dich</span>
            <span className="h-px w-10 bg-signal" />
          </div>
          <h1 className="mt-6 font-display text-4xl md:text-5xl font-black tracking-tight">
            Noch kein <span className="italic text-muted-foreground">RadProfil</span>.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Leg in 60 Sekunden dein Profil an. Wir zeigen dir danach genau die
            Artikel, die zu mehr als 80&nbsp;% zu deinem Rad und deinen Interessen passen.
          </p>
          <Link
            to="/mein-rad"
            className="mt-8 inline-flex items-center gap-2 bg-signal text-signal-foreground px-6 py-3 eyebrow hover:opacity-90 transition-opacity"
          >
            <Bike className="h-3.5 w-3.5" /> RadProfil anlegen
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24 pb-32">
      <div className="mx-auto max-w-4xl px-5 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-signal" />
          <span className="eyebrow text-signal">Für dich relevant</span>
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight leading-[1.05]">
              Passend zu dir.{" "}
              <span className="text-signal tabular-nums">{visible.length}</span>{" "}
              <span className="text-muted-foreground font-light italic text-2xl md:text-3xl">
                {visible.length === 1 ? "Artikel" : "Artikel"}
              </span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-muted-foreground font-light max-w-xl">
              Artikel mit einer Übereinstimmung von mindestens 80&nbsp;% zu deinem RadProfil.
              Gelesene und gemerkte Beiträge verschwinden automatisch.
            </p>
          </div>
        </div>

        {/* Profile action button — pinned at the top so the user can edit/delete criteria */}
        <Link
          to="/mein-rad"
          className="mt-8 group flex items-center justify-between gap-3 border border-border bg-card p-4 md:p-5 hover:border-foreground transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background">
              <Settings2 className="h-4 w-4 text-signal" />
            </span>
            <div className="min-w-0">
              <div className="eyebrow-sm text-muted-foreground">Dein RadProfil</div>
              <div className="text-sm md:text-base font-display font-bold truncate">
                {summarizeProfile(profile) || "Profil bearbeiten oder löschen"}
              </div>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 eyebrow-sm text-muted-foreground group-hover:text-foreground transition-colors">
            <span className="hidden sm:inline">Bearbeiten</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* List */}
        <div className="mt-8 md:mt-10">
          {isPending && (
            <div className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Lade Artikel …
            </div>
          )}

          {!isPending && visible.length === 0 && (
            <div className="border border-dashed border-border bg-card/40 p-10 md:p-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border bg-background">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="mt-5 font-display text-xl md:text-2xl font-bold">
                Aktuell nichts Neues für dich.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Sobald ein Artikel zu mehr als 80&nbsp;% zu deinem Profil passt,
                taucht er hier auf — inklusive einer Benachrichtigung im Header.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/ratgeber"
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 eyebrow-sm hover:border-foreground transition-colors"
                >
                  Alle Ratgeber <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  to="/mein-rad"
                  className="inline-flex items-center gap-2 bg-signal text-signal-foreground px-4 py-2 eyebrow-sm hover:opacity-90 transition-opacity"
                >
                  Profil anpassen
                </Link>
              </div>
            </div>
          )}

          <ul className="divide-y divide-border border border-border bg-background">
            {visible.map(({ article: a, percent, reason }) => {
              const saved = isBookmarked(a.slug);
              return (
                <li key={a.slug} className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-stretch">
                    {/* Main link area */}
                    <Link
                      to="/artikel/$slug"
                      params={{ slug: a.slug }}
                      className="group flex-1 min-w-0 flex gap-4 p-4 md:p-5 hover:bg-card transition-colors"
                    >
                      {a.image && (
                        <span className="hidden sm:block relative w-28 md:w-36 aspect-[4/3] shrink-0 overflow-hidden bg-muted">
                          <img
                            src={a.image}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        </span>
                      )}
                      <span className="flex-1 min-w-0 flex flex-col">
                        <span className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 bg-signal text-signal-foreground px-1.5 py-0.5 text-[10px] font-black tabular-nums leading-none">
                            <Sparkles className="h-2.5 w-2.5" /> {percent}%
                          </span>
                          <span className="eyebrow-sm text-signal">◆ {a.category}</span>
                          {reason && (
                            <span className="eyebrow-sm text-muted-foreground truncate">
                              · {reason}
                            </span>
                          )}
                        </span>
                        <span className="mt-2 font-display text-base md:text-lg font-bold leading-snug group-hover:text-signal transition-colors line-clamp-2">
                          {a.title}
                        </span>
                        {a.excerpt && (
                          <span className="mt-1.5 text-xs md:text-sm text-muted-foreground line-clamp-2 font-light">
                            {a.excerpt}
                          </span>
                        )}
                        <span className="mt-2 eyebrow-sm text-muted-foreground inline-flex items-center gap-1 group-hover:text-foreground transition-colors">
                          Lesen <ArrowRight className="h-3 w-3" />
                        </span>
                      </span>
                    </Link>

                    {/* Action column */}
                    <div className="flex sm:flex-col items-stretch border-t sm:border-t-0 sm:border-l border-border">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleBookmark({
                            slug: a.slug,
                            title: a.title,
                            excerpt: a.excerpt ?? "",
                            image: a.image ?? "",
                            category: a.category,
                            date: a.date ?? "",
                            readTime: a.readTime ?? "",
                          });
                        }}
                        aria-label={saved ? "Aus Merkliste entfernen" : "Merken (verschwindet aus dieser Liste)"}
                        title={saved ? "Aus Merkliste entfernen" : "Merken — wandert in deine Merkliste"}
                        className={`flex-1 sm:flex-none sm:w-14 flex items-center justify-center gap-2 px-4 py-3 sm:py-0 transition-colors ${
                          saved
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:bg-card hover:text-foreground"
                        }`}
                      >
                        {saved ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                        <span className="sm:hidden eyebrow-sm">
                          {saved ? "Gemerkt" : "Merken"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          markArticleRead(a.slug);
                        }}
                        aria-label="Aus dieser Liste ausblenden"
                        title="Aus dieser Liste ausblenden"
                        className="flex-1 sm:flex-none sm:w-14 flex items-center justify-center gap-2 px-4 py-3 sm:py-0 text-muted-foreground hover:bg-card hover:text-foreground transition-colors border-l sm:border-l-0 sm:border-t border-border"
                      >
                        <EyeOff className="h-4 w-4" />
                        <span className="sm:hidden eyebrow-sm">Ausblenden</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Berechnung läuft lokal in deinem Browser. Gelesene und gemerkte Artikel
          werden ausgeblendet, damit dein Feed sauber bleibt.
        </p>
      </div>
    </div>
  );
}
