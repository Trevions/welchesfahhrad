import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { ArrowRight, Wrench, Gauge, CloudSun, Scale, Sparkles, Map } from "lucide-react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import hero from "@/assets/hero-bike.jpg";
import magazineCover from "@/assets/magazine-cover.jpg";
import { ArticleCard } from "@/components/ArticleCard";
import { getPublicArticles } from "@/lib/articles.functions";

// Heavy / client-driven components — code-split so their JS doesn't block
// initial parse/render on mobile. Each has a fixed-height fallback to keep CLS at 0.
const BikeWeatherBar = lazy(() =>
  import("@/components/BikeWeatherBar").then((m) => ({ default: m.BikeWeatherBar })),
);
const RadelScoreBadge = lazy(() =>
  import("@/components/RadelScoreBadge").then((m) => ({ default: m.RadelScoreBadge })),
);
const ForYouStrip = lazy(() =>
  import("@/components/ForYouStrip").then((m) => ({ default: m.ForYouStrip })),
);
const BikeShowcase = lazy(() =>
  import("@/components/bikes/BikeShowcase").then((m) => ({ default: m.BikeShowcase })),
);

const WEATHER_BAR_FALLBACK = (
  <div className="border-b border-border bg-card" style={{ minHeight: 56 }} aria-hidden />
);
const RADEL_BADGE_FALLBACK = <div style={{ minWidth: 90, minHeight: 40 }} aria-hidden />;
const STRIP_FALLBACK = (
  <div className="border-b border-border bg-card" style={{ minHeight: 96 }} aria-hidden />
);
const SHOWCASE_FALLBACK = (
  <div className="border-b border-border bg-background" style={{ minHeight: 360 }} aria-hidden />
);

const publicArticlesQuery = queryOptions({
  queryKey: ["public-articles"],
  queryFn: () => getPublicArticles(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicArticlesQuery),
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
      { property: "og:url", content: "https://radmap.de/" },
      { property: "og:image", content: `https://radmap.de${hero}` },
      { name: "twitter:image", content: `https://radmap.de${hero}` },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "radmap.de",
          url: "https://radmap.de/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://radmap.de/nachrichten?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "radmap.de",
          url: "https://radmap.de/",
          logo: "https://radmap.de/icons/icon-192.png",
        }),
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="pt-32 px-6 text-center">
      <h2 className="font-display text-3xl font-black">Fehler beim Laden</h2>
      <p className="mt-3 text-muted-foreground text-sm">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => null,
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(publicArticlesQuery);
  const articles = data.articles;
  const featured = articles[0];
  const feed = articles.slice(1, 4);
  // start broken grid AFTER the aside feed to avoid repeating the same stories
  const broken = articles.slice(4, 10);
  // ticker pulls from a wider pool so it doesn't mirror the grid 1:1
  const ticker = articles.slice(0, 12);
  const ratgeber = articles.filter((a) => a.category === "Ratgeber");
  const tests = articles.filter((a) => a.category === "Tests" || a.category === "E-Bikes");

  return (
    <>
      {/* FAHRRAD-WETTER BAR */}
      <BikeWeatherBar />

      {/* ECO ROUTE PLANNER PROMO — button only */}
      <section className="border-b border-border bg-[#050505] relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(700px 300px at 20% -20%, color-mix(in oklch, var(--signal) 40%, transparent), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-8 py-5 md:py-6 flex items-center justify-end gap-2 md:gap-3 flex-nowrap">
          <RadelScoreBadge />
          <Link
            to="/tools/eco-route"
            className="inline-flex items-center gap-2 border border-white/60 bg-signal/10 px-5 py-2.5 text-white transition-colors duration-300 hover:bg-white/10 hover:border-white/60"
          >
            <Map className="h-4 w-4" strokeWidth={1.75} />
            <span className="eyebrow-sm">Eco Route Planner</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* SPLIT HERO */}
      {featured && (
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 border-x border-border">
          <Link
            to="/artikel/$slug"
            params={{ slug: featured.slug }}
            className="lg:col-span-8 relative group overflow-hidden border-b lg:border-b-0 lg:border-r border-border bg-[#050505] isolate"
          >
            {/* Premium black background layers */}
            <div aria-hidden className="absolute inset-0 -z-10">
              {/* signal radial glow top-right */}
              <div className="absolute -top-32 -right-32 h-[60%] w-[60%] rounded-full opacity-[0.22] blur-3xl"
                   style={{ background: "radial-gradient(closest-side, var(--signal), transparent 70%)" }} />
              {/* subtle cool glow bottom-left for depth */}
              <div className="absolute -bottom-40 -left-32 h-[55%] w-[55%] rounded-full opacity-[0.10] blur-3xl"
                   style={{ background: "radial-gradient(closest-side, #6ea8ff, transparent 70%)" }} />
              {/* grain */}
              <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
                   style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")" }} />
              {/* hairline accents */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[color-mix(in_oklab,var(--signal)_70%,transparent)] to-transparent" />
              <div className="absolute right-6 top-6 bottom-6 w-px bg-zinc-800/60" />
              {/* huge ghost editorial numeral */}
              <div className="absolute -right-6 -bottom-16 md:-bottom-24 select-none pointer-events-none font-display font-black leading-none text-[14rem] md:text-[22rem] lg:text-[28rem] tracking-tighter text-white/[0.035]">
                N°24
              </div>
            </div>

            <div className="relative flex min-h-[78vh] flex-col justify-end p-6 md:p-12 lg:p-16 text-zinc-100">
              <div className="flex items-center gap-3 mb-6 md:mb-8 animate-fade-up" style={{ animationDelay: "60ms", animationFillMode: "both" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
                </span>
                <span className="h-px w-10 bg-signal" />
                <span className="eyebrow text-signal">Top-Story · {featured.category}</span>
              </div>

              <h1
                className="font-display font-black tracking-tight leading-[0.92] text-[clamp(2rem,7vw,5.25rem)] animate-fade-up break-words hyphens-auto"
                style={{ animationDelay: "140ms", animationFillMode: "both" }}
              >
                {featured.title}
              </h1>

              <div
                className="mt-8 flex flex-col md:flex-row md:items-end gap-6 md:gap-10 animate-fade-up"
                style={{ animationDelay: "260ms", animationFillMode: "both" }}
              >
                <p className="text-base md:text-lg text-zinc-300 font-light leading-relaxed max-w-md">
                  {featured.excerpt}
                </p>
                <span
                  className="relative inline-flex items-center gap-3 self-start whitespace-nowrap border border-signal/70 py-3 px-6 text-zinc-100 transition-all duration-500 overflow-hidden group-hover:bg-signal group-hover:text-[#050505] group-hover:border-signal"
                  style={{ boxShadow: "0 0 0 1px color-mix(in oklab, var(--signal) 25%, transparent), 0 18px 50px -20px color-mix(in oklab, var(--signal) 55%, transparent)" }}
                >
                  {/* always-on shimmer underline */}
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
                    <span className="block h-full w-1/3 bg-gradient-to-r from-transparent via-signal to-transparent animate-[shimmer-slide_2.4s_linear_infinite]" />
                  </span>
                  <span className="eyebrow relative">Vollständiger Bericht</span>
                  <ArrowRight className="h-3.5 w-3.5 relative transition-transform group-hover:translate-x-1.5" />
                </span>
              </div>

              <div
                className="mt-8 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono animate-fade-up"
                style={{ animationDelay: "360ms", animationFillMode: "both" }}
              >
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

          <aside className="lg:col-span-4 flex flex-col bg-card">
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

            <div className="flex-1 divide-y divide-border">
              {feed.map((a, i) => (
                <Link
                  key={a.slug}
                  to="/artikel/$slug"
                  params={{ slug: a.slug }}
                  className={`group block px-6 py-6 hover:bg-accent/50 transition-colors ${i >= 2 ? "hidden lg:block" : ""}`}
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
                  <button
                    type="button"
                    aria-label="Kiosk-Finder öffnen"
                    className="mt-auto self-start eyebrow-sm border-b border-border pb-1 hover:border-foreground transition-colors"
                  >
                    Kiosk-Finder
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      )}

      {/* LIVE TICKER */}
      {ticker.length > 0 && (
      <div className="border-b border-border bg-signal text-signal-foreground overflow-hidden">
        <div className="flex items-center">
          <div className="px-6 py-3 border-r border-signal-foreground/30 flex items-center gap-3 shrink-0">
            <span className="h-2 w-2 bg-signal-foreground rounded-full animate-pulse" />
            <span className="eyebrow">Live Ticker</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-12 animate-marquee whitespace-nowrap py-3 pl-12">
              {[...ticker, ...ticker].map((a, i) => (
                <span key={i} className="eyebrow-sm">
                  ◆ {a.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* PERSONALIZED — appears right under the live ticker */}
      <ForYouStrip />

      {/* BROKEN GRID */}
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
            <div className="hidden md:block col-span-12 md:col-span-4">
              <ArticleCard article={broken[3]} size="md" index={3} />
            </div>
          )}
          {broken[4] && (
            <div className="hidden md:block col-span-12 md:col-span-4 md:mt-12">
              <ArticleCard article={broken[4]} size="md" index={4} />
            </div>
          )}
          {broken[5] && (
            <div className="hidden md:block col-span-12 md:col-span-4">
              <ArticleCard article={broken[5]} size="md" index={5} />
            </div>
          )}
        </div>
      </section>
      )}

      {/* RATGEBER STRIP */}
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
                    className={`group flex gap-5 border-t border-border pt-6 ${i >= 3 ? "hidden sm:flex" : ""}`}
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

      {/* TOOLS TEASER — premium hub showcase */}
      <section className="relative border-t border-border bg-[#050505] text-zinc-100 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "radial-gradient(900px 420px at 85% -10%, color-mix(in oklch, var(--signal) 70%, transparent), transparent 60%), radial-gradient(700px 360px at -5% 110%, color-mix(in oklch, var(--signal) 50%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-8 py-16 md:py-24 border-x border-border/40">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-signal" />
                <span className="eyebrow text-signal">Neu · Werkzeuge</span>
              </div>
              <h2 className="mt-5 font-display text-4xl md:text-6xl font-black italic leading-[0.92] tracking-tight">
                Tools, die <br />
                <span className="text-signal">mitfahren.</span>
              </h2>
              <p className="mt-6 text-zinc-400 font-light leading-relaxed max-w-md">
                Rechner, Planungs- und Wartungs-Tools — entwickelt von der radmap.de Redaktion.
                Vom Reifendruck bis zur Reichweite, vom Wetter bis zur Bußgeld-Tabelle.
              </p>
              <Link
                to="/tools"
                className="mt-8 inline-flex items-center gap-3 border border-zinc-700 px-6 py-3 hover:border-zinc-100 hover:bg-zinc-100 hover:text-[#050505] transition-all duration-500 glow-signal"
              >
                <Wrench className="h-4 w-4" strokeWidth={1.75} />
                <span className="eyebrow">Alle Tools öffnen</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: Gauge, label: "Reifendruck", sub: "Rechner", to: "/tools/reifendruck" },
                { icon: CloudSun, label: "Fahrrad-Wetter", sub: "Planung", to: "/tools/fahrrad-wetter" },
                { icon: Scale, label: "StVO & Bußgeld", sub: "Recht", to: "/tools/bussgeld" },
                { icon: Sparkles, label: "Kaufberater", sub: "Quiz", to: "/tools/kaufberater" },
              ].map(({ icon: Icon, label, sub, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 transition-all duration-300 hover:border-signal/60 hover:-translate-y-0.5 hover:bg-zinc-900/80"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-zinc-800 bg-black/40 text-signal transition-colors group-hover:border-signal/50">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="mt-5 font-display text-base font-bold tracking-tight text-zinc-100">
                    {label}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {sub}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BIKE SHOWCASE — replaces old Tests block */}
      <BikeShowcase />

    </>
  );
}
