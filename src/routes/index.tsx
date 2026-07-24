import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bike,
  Zap,
  Sparkles,
  Star,
  GitCompareArrows,
  MapPin,
  Wrench,
  Battery,
  ShieldCheck,
  BadgeEuro,
} from "lucide-react";
import { listPublicBikes } from "@/lib/bikes.functions";
import { getPublicArticles } from "@/lib/articles.functions";
import { articleImageUrl } from "@/lib/article-image-url";
import { useBikeProfile } from "@/lib/bike-profile";
import { matchBikeToProfile } from "@/lib/bike-match";
import { BikeCompareButton } from "@/components/bikes/BikeCompareButton";
import heroBike from "@/assets/hero-bike.jpg";
import ebikeImg from "@/assets/ebike.jpg";
import ratgeberImg from "@/assets/ratgeber.jpg";

const homeQuery = queryOptions({
  queryKey: ["home-data"],
  queryFn: async () => {
    const [bikesRes, articlesRes] = await Promise.all([
      listPublicBikes(),
      getPublicArticles(),
    ]);
    return { bikes: bikesRes.bikes, articles: articlesRes.articles };
  },
  staleTime: 60_000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: "WelchesFahrrad.de – Finde das perfekte Fahrrad. Vergleiche Tausende Modelle." },
      {
        name: "description",
        content:
          "Deutschlands größtes Fahrrad-Vergleichsportal. Vergleiche Tausende Fahrräder, E-Bikes und Marken. Finde mit wenigen Klicks das Fahrrad, das zu dir passt.",
      },
      { property: "og:title", content: "WelchesFahrrad.de – Finde das perfekte Fahrrad" },
      {
        property: "og:description",
        content: "Vergleiche Tausende Fahrräder, E-Bikes und Marken auf WelchesFahrrad.de.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: heroBike },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroBike },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "WelchesFahrrad.de",
          url: "https://welchesfahrrad.de/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://welchesfahrrad.de/fahrraeder?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "WelchesFahrrad.de",
          url: "https://welchesfahrrad.de/",
          logo: "https://welchesfahrrad.de/icons/icon-192.png",
          description:
            "Deutschlands Fahrrad- und E-Bike-Vergleichsplattform.",
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
  component: Home,
});

/* --------------- static content --------------- */

type Cat = { name: string; slug: string; hint: string; ebike?: boolean };

const POPULAR_CATEGORIES: Cat[] = [
  { name: "Mountainbike", slug: "mountainbike", hint: "Trail & Enduro" },
  { name: "Trekkingbike", slug: "trekking", hint: "Alltag & Tour" },
  { name: "Gravel Bike", slug: "gravel", hint: "Asphalt & Schotter" },
  { name: "Rennrad", slug: "rennrad", hint: "Straße & Race" },
  { name: "City Bike", slug: "city", hint: "Stadt & Pendeln" },
  { name: "Kinderfahrrad", slug: "kinder", hint: "12″–26″" },
  { name: "Lastenrad", slug: "lastenrad", hint: "Familie & Cargo" },
  { name: "SUV Bike", slug: "suv", hint: "Robust & flexibel" },
  { name: "E-Mountainbike", slug: "e-mtb", hint: "Bosch · Shimano", ebike: true },
  { name: "E-Trekkingbike", slug: "e-trekking", hint: "Bosch CX", ebike: true },
  { name: "E-Citybike", slug: "e-city", hint: "Alltag mit Boost", ebike: true },
  { name: "E-Gravel", slug: "e-gravel", hint: "Leicht & schnell", ebike: true },
];

const POPULAR_BRANDS = [
  "Cube",
  "Canyon",
  "Trek",
  "Specialized",
  "Scott",
  "Haibike",
  "Focus",
  "Ghost",
  "Cannondale",
  "Bulls",
  "KTM",
  "Riese & Müller",
  "Gazelle",
  "Orbea",
  "Bergamont",
];

const RATGEBER_ITEMS = [
  { title: "Welches Fahrrad passt zu mir?", tag: "Kaufberatung", icon: Sparkles },
  { title: "Welche Rahmengröße brauche ich?", tag: "Passform", icon: Wrench },
  { title: "Bosch oder Shimano?", tag: "E-Bike Motor", icon: Battery },
  { title: "Hardtail oder Fully?", tag: "MTB", icon: MapPin },
  { title: "E-Bike kaufen 2026", tag: "Ratgeber", icon: Zap },
  { title: "Gravel oder Rennrad?", tag: "Road", icon: Bike },
];

/* --------------- helpers --------------- */

/** Custom bike SVG with independently-spinnable wheels for the hero search. */
function BikeIcon({ spin = false, fast = false, className = "" }: { spin?: boolean; fast?: boolean; className?: string }) {
  const wheel = spin
    ? fast
      ? "animate-wheel-spin-fast"
      : "animate-wheel-spin"
    : "";
  return (
    <svg
      viewBox="0 0 32 20"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* frame */}
      <path d="M7 14 L14 14 L20 6 L25 14" />
      <path d="M14 14 L18 6 L22 6" />
      <path d="M20 6 L20 4" />
      {/* seat + bar */}
      <path d="M12.5 14 L14.5 14" />
      <path d="M22 6 L23.5 6" />
      {/* wheels — spin group */}
      <g className={wheel} style={{ transformOrigin: "7px 14px", transformBox: "fill-box" as any }}>
        <circle cx="7" cy="14" r="4.6" />
        <path d="M7 9.4 L7 18.6 M2.4 14 L11.6 14 M3.7 10.7 L10.3 17.3 M3.7 17.3 L10.3 10.7" strokeWidth="0.7" opacity="0.6" />
      </g>
      <g className={wheel} style={{ transformOrigin: "25px 14px", transformBox: "fill-box" as any }}>
        <circle cx="25" cy="14" r="4.6" />
        <path d="M25 9.4 L25 18.6 M20.4 14 L29.6 14 M21.7 10.7 L28.3 17.3 M21.7 17.3 L28.3 10.7" strokeWidth="0.7" opacity="0.6" />
      </g>
    </svg>
  );
}

function BikeProductCard({
  bike,
  match,
}: {
  bike: any;
  match: number | null;
}) {
  const img = articleImageUrl(bike.image_url ?? "") || bike.image_url || "/og.jpg";
  const rating =
    bike.expert_rating != null
      ? Number(bike.expert_rating).toFixed(1)
      : null;
  return (
    <article className="group relative flex flex-col bg-card border border-border rounded-3xl overflow-hidden hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="absolute top-3 right-3 z-10">
        <BikeCompareButton slug={bike.slug} variant="card" />
      </div>
      {match != null && (
        <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-signal text-signal-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1 tabular-nums shadow-sm">
          <Sparkles className="h-2.5 w-2.5" />
          {match}% passend
        </span>
      )}
      <Link
        to="/fahrraeder/$slug"
        params={{ slug: bike.slug }}
        className="block"
      >
        <div className="relative aspect-[4/3] bg-gradient-to-br from-zinc-50 via-white to-zinc-100 overflow-hidden">
          <img
            src={img}
            alt={`${bike.brand} ${bike.model}${bike.year ? ` (${bike.year})` : ""}`}
            loading="lazy"
            decoding="async"
            width={720}
            height={540}
            className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </div>
        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {bike.brand}
            </span>
            {bike.bike_type && (
              <span className="text-[10px] font-medium text-muted-foreground rounded-full border border-border px-2 py-0.5">
                {bike.bike_type}
              </span>
            )}
          </div>
          <h3 className="font-display text-xl leading-tight font-bold line-clamp-2 min-h-[3.2rem] group-hover:text-signal transition-colors">
            {bike.model}
          </h3>
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="min-w-0">
              {bike.price_eur != null ? (
                <div className="font-mono font-bold text-lg tabular-nums">
                  {bike.price_eur.toLocaleString("de-DE")} €
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Preis auf Anfrage</div>
              )}
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {bike.category === "ebike" ? "E-Bike" : "Fahrrad"}
                {bike.year ? ` · ${bike.year}` : ""}
              </div>
            </div>
            {rating && (
              <div className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1">
                <Star className="h-3 w-3 fill-signal text-signal" strokeWidth={0} />
                <span className="text-xs font-bold tabular-nums">{rating}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
      <div className="flex gap-2 px-5 pb-5">
        <Link
          to="/fahrraeder/$slug"
          params={{ slug: bike.slug }}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-foreground text-background text-[11px] uppercase tracking-wider font-bold py-2.5 hover:bg-signal hover:text-signal-foreground transition-colors"
        >
          Details
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          to="/vergleich"
          className="inline-flex items-center justify-center gap-1 rounded-full border border-border text-[11px] uppercase tracking-wider font-bold py-2.5 px-4 hover:border-foreground transition-colors"
        >
          <GitCompareArrows className="h-3 w-3" />
          Vergleichen
        </Link>
      </div>
    </article>
  );
}

function CategoryCard({ cat }: { cat: Cat }) {
  return (
    <Link
      to="/fahrraeder"
      className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-5 md:p-6 aspect-[4/5] overflow-hidden hover:border-foreground hover:shadow-[0_20px_50px_-25px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "radial-gradient(120% 80% at 80% 100%, color-mix(in oklab, var(--signal) 20%, transparent), transparent 60%)",
        }}
      />
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            cat.ebike
              ? "bg-signal text-signal-foreground"
              : "border border-border bg-background text-foreground"
          }`}
        >
          {cat.ebike ? <Zap className="h-3 w-3" /> : <Bike className="h-3 w-3" />}
          {cat.ebike ? "E-Bike" : "Fahrrad"}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
      </div>
      <div>
        <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight tracking-tight">
          {cat.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{cat.hint}</p>
      </div>
    </Link>
  );
}

/* --------------- page --------------- */

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const profile = useBikeProfile();
  const hasProfile = !!profile && (profile as any).bikeTypes?.length > 0;

  const topBikes = useMemo(() => {
    const list = data.bikes.slice(0, 40);
    const scored = list.map((b) => ({
      bike: b,
      match: hasProfile ? matchBikeToProfile(b as any, profile as any).percent : null,
    }));
    if (hasProfile) scored.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    return scored.slice(0, 8);
  }, [data.bikes, hasProfile, profile]);

  const [q, setQ] = useState("");

  const ratgeberArticles = useMemo(
    () => data.articles.filter((a: any) => a.category === "Ratgeber").slice(0, 6),
    [data.articles],
  );

  const totalBikes = data.bikes.length;
  const totalEbikes = data.bikes.filter((b) => b.category === "ebike").length;

  return (
    <>
      {/* ============== HERO ============== */}
      <section
        aria-labelledby="hero-heading"
        className="relative bg-background pt-8 md:pt-16 pb-10 md:pb-16"
      >
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          {/* Trust ribbon */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
              Deutschlands Fahrrad-Vergleichsportal
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> 100 % unabhängig
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <BadgeEuro className="h-3.5 w-3.5" /> Preisvergleich in Echtzeit
            </span>
          </div>

          <h1
            id="hero-heading"
            className="mt-5 font-display font-black tracking-tight leading-[1] text-[clamp(2.5rem,7.5vw,5.5rem)]"
          >
            Finde das perfekte
            <span className="block">
              <span className="relative inline-block">
                <span className="relative z-10 px-1">Fahrrad</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 md:bottom-2 h-3 md:h-5 bg-signal -z-0"
                />
              </span>
              .
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Vergleiche Tausende Fahrräder, E-Bikes und Marken. Finde mit wenigen
            Klicks das Fahrrad, das wirklich zu dir passt.
          </p>

          {/* Search */}
          <form
            role="search"
            aria-label="Fahrrad-Suche"
            className="mt-8 flex w-full items-stretch rounded-full border border-border bg-card shadow-[0_20px_50px_-25px_rgba(0,0,0,0.25)] overflow-hidden focus-within:border-foreground focus-within:shadow-[0_25px_60px_-25px_rgba(0,0,0,0.35)] transition-shadow"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="hero-search" className="sr-only">
              Nach Fahrrad, Marke oder Modell suchen
            </label>
            <span className="flex items-center pl-5 pr-2 text-muted-foreground">
              <Search className="h-5 w-5" />
            </span>
            <input
              id="hero-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nach Fahrrad, Marke oder Modell suchen..."
              className="flex-1 min-w-0 bg-transparent py-4 md:py-5 text-base outline-none placeholder:text-muted-foreground/70"
              autoComplete="off"
            />
            <Link
              to="/fahrraeder"
              className="hidden sm:inline-flex items-center gap-2 bg-foreground text-background px-6 md:px-8 my-1.5 mr-1.5 rounded-full text-sm font-bold hover:bg-signal hover:text-signal-foreground transition-colors"
            >
              Suchen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </form>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>
              <span className="font-bold text-foreground tabular-nums">
                {totalBikes.toLocaleString("de-DE")}
              </span>{" "}
              Modelle
            </span>
            <span>
              <span className="font-bold text-foreground tabular-nums">
                {totalEbikes.toLocaleString("de-DE")}
              </span>{" "}
              E-Bikes
            </span>
            <span>
              <span className="font-bold text-foreground">{POPULAR_BRANDS.length}+</span>{" "}
              Marken
            </span>
          </div>

          {/* Two hero category cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Link
              to="/fahrraeder"
              className="group relative flex flex-col justify-between rounded-3xl overflow-hidden border border-border bg-card min-h-[320px] md:min-h-[380px] hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all"
            >
              <img
                src={heroBike}
                alt="Mountainbike auf einem Alpentrail — Kategorie Fahrräder"
                width={1200}
                height={900}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
              />
              <div className="relative p-6 md:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur text-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                  <Bike className="h-3 w-3" /> Kategorie
                </span>
              </div>
              <div className="relative p-6 md:p-8 text-white">
                <h2 className="font-display text-3xl md:text-5xl font-black leading-none tracking-tight">
                  Fahrräder
                </h2>
                <p className="mt-2 text-sm md:text-base text-white/85 max-w-md">
                  MTB, Gravel, Rennrad, City, Trekking, Kinder & mehr.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-signal text-signal-foreground text-sm font-bold px-5 py-3 group-hover:gap-3 transition-all">
                  Alle Fahrräder
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link
              to="/e-bikes"
              className="group relative flex flex-col justify-between rounded-3xl overflow-hidden border border-border bg-card min-h-[320px] md:min-h-[380px] hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all"
            >
              <img
                src={ebikeImg}
                alt="Premium E-Bike mit Bosch Antrieb — Kategorie E-Bikes"
                width={1200}
                height={900}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
              />
              <div className="relative p-6 md:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-signal text-signal-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                  <Zap className="h-3 w-3" /> E-Bike
                </span>
              </div>
              <div className="relative p-6 md:p-8 text-white">
                <h2 className="font-display text-3xl md:text-5xl font-black leading-none tracking-tight">
                  E-Bikes
                </h2>
                <p className="mt-2 text-sm md:text-base text-white/85 max-w-md">
                  Bosch, Shimano & Co. – vom City-Pedelec bis Premium-E-MTB.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white text-foreground text-sm font-bold px-5 py-3 group-hover:gap-3 transition-all">
                  Alle E-Bikes
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============== POPULAR CATEGORIES ============== */}
      <section aria-labelledby="cats-heading" className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-12">
            <div>
              <span className="eyebrow text-muted-foreground">Kategorien</span>
              <h2
                id="cats-heading"
                className="mt-2 font-display text-3xl md:text-5xl font-black tracking-tight"
              >
                Beliebte Kategorien
              </h2>
            </div>
            <Link
              to="/fahrraeder"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-foreground transition-colors"
            >
              Alle Kategorien <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {POPULAR_CATEGORIES.map((c) => (
              <CategoryCard key={c.slug} cat={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ============== POPULAR BRANDS ============== */}
      <section aria-labelledby="brands-heading" className="py-16 md:py-24 bg-secondary/50">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-12">
            <div>
              <span className="eyebrow text-muted-foreground">Marken</span>
              <h2
                id="brands-heading"
                className="mt-2 font-display text-3xl md:text-5xl font-black tracking-tight"
              >
                Beliebte Marken
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Von Premium-Herstellern bis zu Direct-to-Consumer-Marken – alle
                führenden Namen an einem Ort.
              </p>
            </div>
          </div>
          <ul
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
            role="list"
          >
            {POPULAR_BRANDS.map((b) => (
              <li key={b}>
                <Link
                  to="/fahrraeder"
                  className="group flex items-center justify-center rounded-2xl bg-card border border-border h-20 md:h-24 px-4 hover:border-foreground hover:shadow-[0_15px_40px_-25px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  <span className="font-display text-xl md:text-2xl font-bold tracking-tight group-hover:text-signal transition-colors">
                    {b}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============== TOP FAHRRÄDER ============== */}
      {topBikes.length > 0 && (
        <section aria-labelledby="top-heading" className="py-16 md:py-24">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-12">
              <div>
                <span className="eyebrow text-muted-foreground">Bestenliste</span>
                <h2
                  id="top-heading"
                  className="mt-2 font-display text-3xl md:text-5xl font-black tracking-tight"
                >
                  Top Fahrräder
                </h2>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                  {hasProfile
                    ? "Sortiert nach deinem RadProfil."
                    : "Ausgewählte Modelle mit den besten Bewertungen und Testergebnissen."}
                </p>
              </div>
              <Link
                to="/fahrraeder"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-foreground transition-colors"
              >
                Alle ansehen <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {topBikes.map(({ bike, match }) => (
                <BikeProductCard key={bike.id} bike={bike} match={match} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============== BIKE FINDER CTA ============== */}
      <section aria-labelledby="finder-heading" className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-8 md:p-16">
            <div
              aria-hidden
              className="absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-30"
              style={{
                background:
                  "radial-gradient(closest-side, var(--signal), transparent 70%)",
              }}
            />
            <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-8">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-signal text-signal-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1">
                  <Sparkles className="h-3 w-3" /> Bike Finder
                </span>
                <h2
                  id="finder-heading"
                  className="mt-4 font-display text-3xl md:text-5xl font-black tracking-tight leading-[1.05]"
                >
                  Welches Fahrrad passt zu dir?
                </h2>
                <p className="mt-4 max-w-xl text-base md:text-lg text-background/75 leading-relaxed">
                  Beantworte ein paar kurze Fragen zu Fahrstil, Budget und Körpergröße
                  – wir finden dein perfektes Fahrrad in unter 60 Sekunden.
                </p>
              </div>
              <Link
                to="/mein-rad"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-signal text-signal-foreground px-8 py-4 text-base font-black uppercase tracking-wider hover:gap-3 transition-all shadow-[0_20px_50px_-15px_rgba(200,255,0,0.5)]"
              >
                Jetzt Fahrrad finden
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============== RATGEBER ============== */}
      <section aria-labelledby="guide-heading" className="py-16 md:py-24 bg-secondary/50">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-12">
            <div>
              <span className="eyebrow text-muted-foreground">Ratgeber</span>
              <h2
                id="guide-heading"
                className="mt-2 font-display text-3xl md:text-5xl font-black tracking-tight"
              >
                Aktuelle Kaufberatung
              </h2>
            </div>
            <Link
              to="/ratgeber"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-foreground transition-colors"
            >
              Alle Ratgeber <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(ratgeberArticles.length >= 6
              ? ratgeberArticles.map((a: any, i) => ({
                  key: a.slug,
                  title: a.title,
                  tag: a.category,
                  image: a.image,
                  href: `/artikel/${a.slug}` as const,
                  icon: RATGEBER_ITEMS[i]?.icon ?? Sparkles,
                }))
              : RATGEBER_ITEMS.map((r) => ({
                  key: r.title,
                  title: r.title,
                  tag: r.tag,
                  image: ratgeberImg as string,
                  href: "/ratgeber" as const,
                  icon: r.icon,
                }))
            ).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={item.href as any}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      width={800}
                      height={450}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white text-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                      <Icon className="h-3 w-3" /> {item.tag}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl md:text-2xl font-bold leading-tight tracking-tight line-clamp-2 group-hover:text-signal transition-colors">
                      {item.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                      Lesen <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}