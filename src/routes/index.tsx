import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import hero from "@/assets/hero-bike.jpg";
import { ArticleCard } from "@/components/ArticleCard";
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
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const featured = articles[0];
  const rest = articles.slice(1, 5);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-4 md:pt-28 min-h-[80vh] md:min-h-screen">
        <div className="absolute inset-0 -z-10">
          <img
            src={hero}
            alt=""
            className="h-full w-full object-cover opacity-40"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="mx-auto max-w-6xl px-5 md:px-6 pt-8 md:pt-24">
          <div className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[10px] md:text-xs font-semibold tracking-widest uppercase text-signal animate-fade-in">
            <Sparkles className="h-3 w-3" />
            <span className="md:hidden">Magazin Nr. 1</span>
            <span className="hidden md:inline">Deutschlands Fahrrad-Magazin Nr. 1</span>
          </div>

          <h1 className="mt-5 max-w-4xl font-display text-[2.5rem] leading-[1.05] md:text-7xl lg:text-8xl font-bold tracking-tight text-gradient animate-fade-up">
            Alles über das Fahrrad.<br />
            <span className="text-signal">Jeden Tag neu.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base md:text-xl text-muted-foreground animate-fade-up" style={{ animationDelay: "100ms" }}>
            Nachrichten, Tests und Ratgeber aus der Welt der Räder — kuratiert
            von Experten, geschrieben für Menschen, die das Radfahren lieben.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Link
              to="/nachrichten"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3.5 text-sm font-semibold text-signal-foreground shadow-glow transition-all active:scale-95 md:hover:scale-105"
            >
              Aktuelle Nachrichten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/e-bikes"
              className="inline-flex items-center justify-center gap-2 rounded-full glass-strong px-6 py-3.5 text-sm font-semibold transition-transform active:scale-95 md:hover:scale-105"
            >
              E-Bike Kaufberatung
            </Link>
          </div>

          {/* stat strip */}
          <div className="mt-12 md:mt-20 grid grid-cols-3 gap-3 md:gap-6 max-w-2xl animate-fade-up" style={{ animationDelay: "300ms" }}>
            {[
              { v: "2.4M", l: "Leser monatlich" },
              { v: "150+", l: "Tests pro Jahr" },
              { v: "24/7", l: "Live News" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-3 md:p-6">
                <div className="font-display text-xl md:text-4xl font-bold text-gradient">{s.v}</div>
                <div className="mt-1 text-[10px] md:text-sm text-muted-foreground leading-tight">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-5 md:px-6 py-8 md:py-12">
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-10">
          <div>
            <div className="text-[10px] md:text-xs font-semibold tracking-widest uppercase text-signal">Top-Stories</div>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold tracking-tight text-gradient">
              Aktuell empfohlen
            </h2>
          </div>
          <Link to="/nachrichten" className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Alle ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3 md:auto-rows-fr">
          <ArticleCard article={featured} featured index={0} />
          {rest.slice(0, 2).map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i + 1} />
          ))}
        </div>
        <div className="mt-4 md:mt-6 grid gap-4 md:gap-6 md:grid-cols-3">
          {rest.slice(2).map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i + 3} />
          ))}
        </div>
      </section>
    </>
  );
}
