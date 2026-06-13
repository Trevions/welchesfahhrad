import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero-bike.jpg";
import magazineCover from "@/assets/magazine-cover.jpg";
import { ArticleCard } from "@/components/ArticleCard";
import { EditorialFeed } from "@/components/EditorialFeed";
import { articles } from "@/lib/articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "radmap.de — Das Magazin für Fahrräder, E-Bikes & Radsport" },
      {
        name: "description",
        content:
          "Tagesaktuelle Fahrrad-News, E-Bike-Tests und Ratgeber für Radfahrer in Deutschland. Premium-Magazin mit Leidenschaft für den Radsport.",
      },
      { property: "og:title", content: "radmap.de — Das Magazin für Fahrräder & E-Bikes" },
      {
        property: "og:description",
        content: "Tagesaktuelle Fahrrad-News, E-Bike-Tests und Ratgeber für Deutschland.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: hero },
      { name: "twitter:image", content: hero },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const featured = articles[0];
  const feed = articles.slice(1, 4);
  const broken = articles.slice(1, 7);
  const ratgeber = articles.filter((a) => a.category === "Ratgeber");
  const tests = articles.filter((a) => a.category === "Tests" || a.category === "E-Bikes");

  return (
    <>
      {/* ========================================================== */}
      {/* SPLIT HERO                                                  */}
      {/* ========================================================== */}
      {featured && (
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 border-x border-border">
          {/* LEFT — cinematic feature */}
          <Link
            to="/artikel/$slug"
            params={{ slug: featured.slug }}
            className="lg:col-span-8 relative group overflow-hidden border-b lg:border-b-0 lg:border-r border-border bg-[#050505]"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto lg:h-[78vh] min-h-[520px]">
              <img
                src={hero}
                alt={featured.title}
                width={1920}
                height={1280}
                data-reveal="mask"
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[1600ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16 text-zinc-100">
              <div className="flex items-center gap-3 mb-6 md:mb-8" data-reveal>
                <span className="h-px w-10 bg-signal" />
                <span className="eyebrow text-signal">Top-Story · {featured.category}</span>
              </div>

              <h1 className="kinetic font-display font-black tracking-tight leading-[0.88] text-4xl md:text-6xl lg:text-[5.5rem] max-w-4xl">
                {featured.title}
              </h1>

              <div className="mt-8 flex flex-col md:flex-row md:items-end gap-6 md:gap-10" data-reveal>
                <p className="text-base md:text-lg text-zinc-300 font-light leading-relaxed max-w-md">
                  {featured.excerpt}
                </p>
                <span
                  data-magnetic="0.3"
                  className="inline-flex items-center gap-3 border border-zinc-600 py-3 px-6 group-hover:border-zinc-100 group-hover:bg-zinc-100 group-hover:text-[#050505] transition-all duration-500 self-start whitespace-nowrap glow-signal"
                >
                  <span className="eyebrow">Vollständiger Bericht</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>

              <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-500">
                <span>{featured.date}</span>
                <span className="h-px w-3 bg-zinc-700" />
                <span>{featured.readTime} Lesezeit</span>
                {featured.source && (
                  <>
                    <span className="h-px w-3 bg-zinc-700" />
                    <span>Quelle · {featured.source}</span>
                  </>
                )}
              </div>
            </div>
          </Link>

          {/* RIGHT — editorial curation */}
          <aside className="lg:col-span-4 flex flex-col bg-card">
            {/* Issue header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="eyebrow-sm text-muted-foreground">Issue No. 24 · 2026</div>
                <div className="mt-1 font-display text-lg font-bold italic">
                  Diese Woche
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-signal rounded-full animate-pulse" />
                <span className="eyebrow-sm text-signal">Live</span>
              </div>
            </div>

            {/* feed items */}
            <div className="flex-1 divide-y divide-border">
              {feed.map((a, i) => (
                <Link
                  key={a.slug}
                  to="/artikel/$slug"
                  params={{ slug: a.slug }}
                  className="group block px-6 py-6 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-display text-sm font-black italic text-signal w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="eyebrow-sm text-muted-foreground group-hover:text-signal transition-colors">
                      {a.category}
                    </span>
                  </div>
                  <h3 className="font-display text-lg lg:text-xl font-bold leading-snug transition-colors group-hover:text-signal">
                    {a.title}
                  </h3>
                  <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {a.date} · {a.readTime}
                  </div>
                </Link>
              ))}
            </div>

            {/* Magazine block */}
            <div className="border-t border-border bg-background p-6">
              <div className="flex gap-5">
                <img
                  src={magazineCover}
                  alt="Radmap Magazin Ausgabe 24"
                  width={150}
                  height={225}
                  loading="lazy"
                  className="w-24 h-36 object-cover shadow-xl"
                />
                <div className="flex flex-col">
                  <span className="eyebrow text-signal">Das Magazin</span>
                  <p className="mt-3 font-display text-lg leading-tight italic">
                    Ausgabe No. 24:<br />Licht & Schatten.
                  </p>
                  <button className="mt-auto self-start eyebrow-sm border-b border-border pb-1 hover:border-foreground transition-colors">
                    Kiosk-Finder
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      )}

      {/* ========================================================== */}
      {/* LIVE TICKER                                                 */}
      {/* ========================================================== */}
      {broken.length > 0 && (
      <div className="border-b border-border bg-signal text-signal-foreground overflow-hidden">
        <div className="flex items-center">
          <div className="px-6 py-3 border-r border-signal-foreground/30 flex items-center gap-3 shrink-0">
            <span className="h-2 w-2 bg-signal-foreground rounded-full animate-pulse" />
            <span className="eyebrow">Live Ticker</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-12 animate-marquee whitespace-nowrap py-3 pl-12">
              {[...broken, ...broken].map((a, i) => (
                <span key={i} className="eyebrow-sm">
                  ◆ {a.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================== */}
      {/* BROKEN GRID — NEW EDITION                                   */}
      {/* ========================================================== */}
      {broken.length > 0 && (
      <section className="mx-auto max-w-[1400px] px-6 md:px-8 py-16 md:py-24 border-x border-border">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-signal" />
              <span className="eyebrow text-signal">Diese Ausgabe</span>
            </div>
            <h2 className="mt-5 font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.95]">
              Geschichten, die <span className="italic text-muted-foreground">bewegen.</span>
            </h2>
          </div>
          <Link
            to="/nachrichten"
            className="inline-flex items-center gap-2 eyebrow border-b border-foreground pb-1 hover:text-signal hover:border-signal transition-colors"
          >
            Alle Beiträge <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Broken grid: 1 large feature + mixed */}
        <div className="grid grid-cols-12 gap-8 md:gap-10">
          {broken[0] && (
            <div className="col-span-12 lg:col-span-7">
              <ArticleCard article={broken[0]} featured size="lg" index={0} />
            </div>
          )}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-8 md:gap-10">
            {broken[1] && <ArticleCard article={broken[1]} size="md" index={1} />}
            {broken[2] && <ArticleCard article={broken[2]} size="md" index={2} />}
          </div>
          {broken[3] && (
            <div className="col-span-12 md:col-span-4">
              <ArticleCard article={broken[3]} size="md" index={3} />
            </div>
          )}
          {broken[4] && (
            <div className="col-span-12 md:col-span-4 md:mt-12">
              <ArticleCard article={broken[4]} size="md" index={4} />
            </div>
          )}
          {broken[5] && (
            <div className="col-span-12 md:col-span-4">
              <ArticleCard article={broken[5]} size="md" index={5} />
            </div>
          )}
        </div>
      </section>

      {/* ========================================================== */}
      {/* RATGEBER STRIP                                              */}
      {/* ========================================================== */}
      {ratgeber.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-16 md:py-24 border-x border-border">
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-signal" />
                  <span className="eyebrow text-signal">Ratgeber</span>
                </div>
                <h2 className="mt-6 font-display text-4xl md:text-5xl font-black leading-[0.95]">
                  Wissen, <br />
                  <span className="italic text-muted-foreground">das fährt.</span>
                </h2>
                <p className="mt-6 text-muted-foreground font-light leading-relaxed max-w-sm">
                  Praxiserprobte Anleitungen, Checklisten und Tipps —
                  geschrieben von Mechanikern, Tourenexperten und Radprofis.
                </p>
                <Link
                  to="/ratgeber"
                  className="mt-8 inline-flex items-center gap-2 eyebrow border-b border-foreground pb-1 hover:text-signal hover:border-signal transition-colors"
                >
                  Alle Ratgeber <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="lg:col-span-8 grid sm:grid-cols-2 gap-8">
                {ratgeber.slice(0, 4).map((a, i) => (
                  <Link
                    key={a.slug}
                    to="/artikel/$slug"
                    params={{ slug: a.slug }}
                    className="group flex gap-5 border-t border-border pt-6"
                  >
                    <span className="font-display text-3xl font-black italic text-signal shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-bold leading-tight transition-colors group-hover:text-signal">
                        {a.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground font-light line-clamp-2">
                        {a.excerpt}
                      </p>
                      <div className="mt-3 eyebrow-sm text-muted-foreground">
                        {a.readTime} Lesezeit
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================== */}
      {/* TESTS HORIZONTAL                                            */}
      {/* ========================================================== */}
      {tests.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-16 md:py-24 border-x border-border">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-signal" />
                  <span className="eyebrow text-signal">Tests & E-Bikes</span>
                </div>
                <h2 className="mt-5 font-display text-4xl md:text-6xl font-black leading-[0.95]">
                  Geprüft. <span className="italic text-muted-foreground">Bewertet.</span>
                </h2>
              </div>
              <Link
                to="/tests"
                className="eyebrow border-b border-foreground pb-1 hover:text-signal hover:border-signal transition-colors"
              >
                Zur Test-Datenbank
              </Link>
            </div>

            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:overflow-visible sm:snap-none scrollbar-hide relative">
              {tests.slice(0, 4).map((a, i) => (
                <div key={a.slug} className="min-w-[280px] sm:min-w-0 snap-start">
                  <ArticleCard article={a} size="sm" index={i} />
                </div>
              ))}
              {/* Swipe hint — shown only on mobile */}
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 sm:hidden">
                <div className="swipe-hint flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
