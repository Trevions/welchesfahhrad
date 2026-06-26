import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { InlineSearch } from "@/components/InlineSearch";
import type { Suggestion } from "@/components/InlineSearch";
import {
  Leaf,
  ArrowRight,
  Gauge,
  Ruler,
  Cog,
  BatteryCharging,
  Flame,
  Wallet,
  CloudSun,
  Wind,
  Sunrise,
  Map,
  ShieldCheck,
  LifeBuoy,
  Wrench,
  CalendarClock,
  Scale,
  Receipt,
  Lock,
  ShieldHalf,
  Sparkles,
  GitCompare,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

type Tool = {
  title: string;
  desc: string;
  icon: LucideIcon;
  to: string;
};

type Group = {
  id: string;
  eyebrow: string;
  title: string;
  tools: Tool[];
};

const groups: Group[] = [
  {
    id: "rechner",
    eyebrow: "01",
    title: "Rechner & Tools",
    tools: [
      { title: "Eco Route Planner", desc: "Live-Routing mit Radwegen, Wetter & CO₂-Bilanz.", icon: Leaf, to: "/tools/eco-route" },
      { title: "Reifendruck-Rechner", desc: "Optimaler Luftdruck für Gewicht & Reifenbreite.", icon: Gauge, to: "/tools/reifendruck" },
      { title: "Rahmengrößen-Rechner", desc: "Passende Rahmenhöhe nach Körpermaßen.", icon: Ruler, to: "/tools/rahmengroesse" },
      { title: "Übersetzungs-Rechner", desc: "Entfaltung, Kadenz und Geschwindigkeit.", icon: Cog, to: "/tools/uebersetzung" },
      { title: "E-Bike Reichweite", desc: "Reichweite nach Akku, Profil und Modus.", icon: BatteryCharging, to: "/tools/ebike-reichweite" },
      { title: "Kalorien-Rechner", desc: "Energieverbrauch auf der Tour bestimmen.", icon: Flame, to: "/tools/kalorien" },
      { title: "JobRad / Leasing", desc: "Monatsrate und Ersparnis kalkulieren.", icon: Wallet, to: "/tools/jobrad-leasing" },
    ],
  },
  {
    id: "wetter",
    eyebrow: "02",
    title: "Wetter & Planung",
    tools: [
      { title: "Fahrrad-Wetter", desc: "Stundengenaue Prognose über Open-Meteo.", icon: CloudSun, to: "/tools/fahrrad-wetter" },
      { title: "Pollen & Luftqualität", desc: "AQI, Feinstaub und Pollenflug live.", icon: Wind, to: "/tools/luftqualitaet" },
      { title: "Sonnenauf-/untergang", desc: "Lichtzeiten und Dämmerung für deine Tour.", icon: Sunrise, to: "/tools/sonnenzeiten" },
      
      { title: "Tourenplaner", desc: "Empfohlene externe Planer im Vergleich.", icon: Map, to: "/tools/tourenplaner" },
    ],
  },
  {
    id: "wartung",
    eyebrow: "03",
    title: "Wartung & Sicherheit",
    tools: [
      { title: "Sicherheits-Check", desc: "Checkliste vor jeder längeren Ausfahrt.", icon: ShieldCheck, to: "/tools/sicherheits-check" },
      { title: "Pannenhilfe-Guide", desc: "Schritt für Schritt durch häufige Pannen.", icon: LifeBuoy, to: "/tools/pannenhilfe" },
      { title: "Werkzeug-Liste", desc: "Was wirklich in Werkstatt und Satteltasche gehört.", icon: Wrench, to: "/tools/werkzeug-liste" },
      { title: "Wartungs-Intervalle", desc: "Service-Plan nach Kilometern und Saison.", icon: CalendarClock, to: "/tools/wartungsintervalle" },
    ],
  },
  {
    id: "recht",
    eyebrow: "04",
    title: "Ratgeber & Recht",
    tools: [
      { title: "StVO für Radfahrer", desc: "Die wichtigsten Regeln auf einen Blick.", icon: Scale, to: "/tools/stvo" },
      { title: "Bußgeld-Tabelle", desc: "Aktuelle Bußgelder und Punkte für Radfahrer.", icon: Receipt, to: "/tools/bussgeld" },
      { title: "Diebstahlschutz", desc: "Schloss, Codierung und richtiges Abstellen.", icon: Lock, to: "/tools/diebstahlschutz" },
      { title: "Versicherungs-Vergleich", desc: "Fahrrad- und E-Bike-Policen objektiv vergleichen.", icon: ShieldHalf, to: "/tools/versicherung" },
    ],
  },
  {
    id: "kaufberatung",
    eyebrow: "05",
    title: "Kaufberatung",
    tools: [
      { title: "Kaufberater-Quiz", desc: "In wenigen Fragen zum passenden Rad.", icon: Sparkles, to: "/tools/kaufberater" },
      { title: "Vergleichstool", desc: "Modelle nach Ausstattung und Preis vergleichen.", icon: GitCompare, to: "/tools/vergleich" },
      { title: "Förderungs-Finder", desc: "Zuschüsse und Prämien in deiner Region.", icon: HandCoins, to: "/tools/foerderung" },
    ],
  },
];

const TITLE = "Tools & Rechner für Radfahrer | radmap.de";
const DESCRIPTION =
  "Professionelle Fahrrad-Tools: Reifendruck, Rahmengröße, Übersetzung, E-Bike Reichweite, Wetter, Wartung, Recht und Kaufberatung — kostenlos auf radmap.de.";
const URL = "https://radmap.de/tools";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Fahrrad Tools, Reifendruck Rechner, Rahmengrößen Rechner, Übersetzung, E-Bike Reichweite, Fahrrad Wetter, Bußgeld Fahrrad, Kaufberatung",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: URL,
          isPartOf: { "@type": "WebSite", name: "radmap.de", url: "https://radmap.de" },
          hasPart: groups.flatMap((g) =>
            g.tools.map((t) => ({
              "@type": "SoftwareApplication",
              name: t.title,
              description: t.desc,
              applicationCategory: g.title,
              operatingSystem: "Web",
              url: `https://radmap.de${t.to}`,
            })),
          ),
        }),
      },
    ],
  }),
  component: ToolsPage,
});

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link to={tool.to} className="block h-full">
      <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/60 p-5 transition-all duration-300 hover:border-signal/60 hover:bg-card hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/2 left-0 h-[200%] w-px bg-gradient-to-b from-transparent via-signal/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-background/50 text-signal transition-colors group-hover:border-signal/50">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <span className="rounded-full border border-signal/40 bg-signal/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-signal">
            Live
          </span>
        </div>
        <h3 className="mt-4 font-display text-base font-bold tracking-tight text-foreground">
          {tool.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {tool.desc}
        </p>
      </div>
    </Link>
  );
}

function ToolsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const norm = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!norm) return groups;
    return groups
      .map((g) => ({
        ...g,
        tools: g.tools.filter(
          (t) =>
            t.title.toLowerCase().includes(norm) ||
            t.desc.toLowerCase().includes(norm) ||
            g.title.toLowerCase().includes(norm),
        ),
      }))
      .filter((g) => g.tools.length > 0);
  }, [norm]);

  const totalHits = filtered.reduce((n, g) => n + g.tools.length, 0);

  const suggestions: Suggestion[] = useMemo(() => {
    if (!norm) return [];
    return filtered.flatMap((g) =>
      g.tools.map((t) => ({
        id: t.title,
        label: t.title,
        subtitle: t.desc,
        href: t.to,
        category: g.title,
        icon: <t.icon className="h-4 w-4" strokeWidth={1.75} />,
      })),
    );
  }, [filtered, norm]);

  const handleSelect = (s: Suggestion) => {
    if (s.href) navigate({ to: s.href });
    setQ(s.label);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(800px 380px at 80% -10%, color-mix(in oklch, var(--signal) 60%, transparent), transparent 60%), radial-gradient(600px 300px at 0% 110%, color-mix(in oklch, var(--signal) 40%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-5 pt-14 pb-12 md:px-8 md:pt-20 md:pb-16">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-signal">
            <span className="h-px w-8 bg-signal" />
            Werkzeuge
          </div>
          <h1 className="mt-4 font-display text-4xl font-black italic leading-[1.05] tracking-tight md:text-6xl">
            Tools für Radfahrer.
            <br className="hidden md:block" />
            <span className="text-signal">Präzise.</span> Schnell. Kostenlos.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Rechner, Planungs- und Wartungs-Tools — entwickelt von der radmap.de Redaktion.
            Alles, was du für die nächste Tour, den nächsten Service oder den nächsten Kauf brauchst.
          </p>

          <div className="mt-8 max-w-2xl">
            <InlineSearch
              value={q}
              onChange={setQ}
              onSelect={handleSelect}
              suggestions={suggestions}
              eyebrow="Tools durchsuchen"
              placeholder="Suche: Reifendruck, Wetter, Bußgeld, Reichweite…"
              hint="Filtere alle Rechner, Planer und Ratgeber-Tools"
              resultsCount={totalHits}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/60 p-10 text-center">
            <p className="font-display text-xl font-black tracking-tight">
              Keine Tools gefunden für „{q}"
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Probiere einen anderen Begriff oder lösche die Suche.
            </p>
          </div>
        ) : (
          <div>
            {/* FEATURED — Eco Route Planner */}
            <section className="mb-10 md:mb-14">
              <Link to="/tools/eco-route" className="group block">
                <div className="relative overflow-hidden rounded-2xl border border-signal/40 bg-[#050505] p-6 md:p-8 transition-all duration-300 hover:border-signal hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-20"
                  />
                  <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-signal/50 bg-signal/10 text-signal">
                      <Leaf className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-signal">
                        <span className="h-px w-6 bg-signal" />
                        Neu · Empfohlen
                      </div>
                      <h2 className="mt-2 font-display text-2xl md:text-3xl font-black italic tracking-tight text-zinc-100">
                        Eco Route Planner
                      </h2>
                      <p className="mt-2 text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl">
                        Plane echte Fahrradrouten in Deutschland — mit Live-Wetter, Höhenprofil,
                        CO₂-Bilanz und GPX-Export. Kostenlos und ohne Account.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-2 border border-signal/60 bg-signal/10 px-5 py-2.5 text-signal transition-all duration-300 group-hover:bg-signal group-hover:text-[#050505] group-hover:border-signal">
                        <span className="eyebrow-sm">Route planen</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </section>

            {filtered.map((g, gi) => (
            <section key={g.id} className={gi > 0 ? "mt-14 md:mt-20" : ""}>
              <header className="mb-6 flex items-end justify-between gap-4 md:mb-8">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-signal">
                    <span className="font-mono">{g.eyebrow}</span>
                    <span className="h-px w-6 bg-signal/60" />
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-black tracking-tight md:text-3xl">
                    {g.title}
                  </h2>
                </div>
                <div className="hidden text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:block">
                  {g.tools.length} Tools
                </div>
              </header>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {g.tools.map((t) => (
                  <ToolCard key={t.title} tool={t} />
                ))}
              </div>
            </section>
          ))
          </div>
        )}

        <p className="mt-16 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Alle Tools kuratiert von der radmap.de Redaktion
        </p>
      </div>
    </div>
  );
}
