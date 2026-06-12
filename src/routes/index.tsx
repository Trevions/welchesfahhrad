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
      <section className="relative min-h-screen overflow-hidden pt-24 md:pt-28">
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

        <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-signal animate-fade-in">
            <Sparkles className="h-3 w-3" />
            Deutschlands Fahrrad-Magazin Nr. 1
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gradient animate-fade-up">
            Alles über das Fahrrad.<br />
            <span className="text-signal">Jeden Tag neu.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground animate-fade-up" style={{ animationDelay: "100ms" }}>
            Nachrichten, Tests und Ratgeber aus der Welt der Räder — kuratiert
            von Experten, geschrieben für Menschen, die das Radfahren lieben.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Link
              to="/nachrichten"
              className="group inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-signal-foreground shadow-glow transition-all hover:scale-105"
            >
              Aktuelle Nachrichten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/e-bikes"
              className="inline-flex items-center gap-2 rounded-full glass-strong px-6 py-3 text-sm font-semibold transition-transform hover:scale-105"
            >
              E-Bike Kaufberatung
            </Link>
          </div>

          {/* stat strip */}
          <div className="mt-20 grid grid-cols-3 gap-6 max-w-2xl animate-fade-up" style={{ animationDelay: "300ms" }}>
            {[
              { v: "2.4M", l: "Leser monatlich" },
              { v: "150+", l: "Tests pro Jahr" },
              { v: "24/7", l: "Live News" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-4 md:p-6">
                <div className="font-display text-2xl md:text-4xl font-bold text-gradient">{s.v}</div>
                <div className="mt-1 text-xs md:text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-signal">Entdecken</div>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold tracking-tight text-gradient">
              Themenwelten
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { to: "/nachrichten", title: "Nachrichten", desc: "Tagesaktuell aus DE & Welt", icon: TrendingUp },
            { to: "/e-bikes", title: "E-Bikes", desc: "Tests, Kaufberatung & Trends", icon: Zap },
            { to: "/ratgeber", title: "Ratgeber", desc: "Praxiswissen vom Profi", icon: Sparkles },
            { to: "/tests", title: "Tests", desc: "Unabhängig & detailliert", icon: ArrowRight },
          ].map((c, i) => (
            <Link
              key={c.to}
              to={c.to}
              className="group glass rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-elevated animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal/10 text-signal mb-4 transition-all group-hover:bg-signal group-hover:text-signal-foreground group-hover:shadow-glow">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-signal">Top-Stories</div>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold tracking-tight text-gradient">
              Aktuell empfohlen
            </h2>
          </div>
          <Link to="/nachrichten" className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Alle ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2 md:auto-rows-fr">
          <ArticleCard article={featured} featured index={0} />
          {rest.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i + 1} />
          ))}
        </div>
      </section>
    </>
  );
}
