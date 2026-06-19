import { createFileRoute, Link } from "@tanstack/react-router";
import {
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
  to?: string;
  soon?: boolean;
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
      { title: "Reifendruck-Rechner", desc: "Optimaler Luftdruck für Gewicht & Reifenbreite.", icon: Gauge, soon: true },
      { title: "Rahmengrößen-Rechner", desc: "Passende Rahmenhöhe nach Körpermaßen.", icon: Ruler, soon: true },
      { title: "Übersetzungs-Rechner", desc: "Entfaltung, Kadenz und Geschwindigkeit.", icon: Cog, soon: true },
      { title: "E-Bike Reichweite", desc: "Reichweite nach Akku, Profil und Modus.", icon: BatteryCharging, soon: true },
      { title: "Kalorien-Rechner", desc: "Energieverbrauch auf der Tour bestimmen.", icon: Flame, soon: true },
      { title: "JobRad / Leasing", desc: "Monatsrate und Ersparnis kalkulieren.", icon: Wallet, soon: true },
    ],
  },
  {
    id: "wetter",
    eyebrow: "02",
    title: "Wetter & Planung",
    tools: [
      { title: "Fahrrad-Wetter", desc: "Stundengenaue Prognose über Open-Meteo.", icon: CloudSun, to: "/tools/fahrrad-wetter" },
      { title: "Pollen & Luftqualität", desc: "AQI, Feinstaub und Pollenflug live.", icon: Wind, soon: true },
      { title: "Sonnenauf-/untergang", desc: "Lichtzeiten und Dämmerung für deine Tour.", icon: Sunrise, soon: true },
      { title: "Tourenplaner", desc: "Routen planen mit Höhenprofil und Karte.", icon: Map, soon: true },
    ],
  },
  {
    id: "wartung",
    eyebrow: "03",
    title: "Wartung & Sicherheit",
    tools: [
      { title: "Sicherheits-Check", desc: "Checkliste vor jeder längeren Ausfahrt.", icon: ShieldCheck, soon: true },
      { title: "Pannenhilfe-Guide", desc: "Schritt für Schritt durch häufige Pannen.", icon: LifeBuoy, soon: true },
      { title: "Werkzeug-Liste", desc: "Was wirklich in Werkstatt und Satteltasche gehört.", icon: Wrench, soon: true },
      { title: "Wartungs-Intervalle", desc: "Service-Plan nach Kilometern und Saison.", icon: CalendarClock, soon: true },
    ],
  },
  {
    id: "recht",
    eyebrow: "04",
    title: "Ratgeber & Recht",
    tools: [
      { title: "StVO für Radfahrer", desc: "Die wichtigsten Regeln auf einen Blick.", icon: Scale, soon: true },
      { title: "Bußgeld-Tabelle", desc: "Aktuelle Bußgelder und Punkte für Radfahrer.", icon: Receipt, soon: true },
      { title: "Diebstahlschutz", desc: "Schloss, Codierung und richtiges Abstellen.", icon: Lock, soon: true },
      { title: "Versicherungs-Vergleich", desc: "Fahrrad- und E-Bike-Policen objektiv vergleichen.", icon: ShieldHalf, soon: true },
    ],
  },
  {
    id: "kaufberatung",
    eyebrow: "05",
    title: "Kaufberatung",
    tools: [
      { title: "Kaufberater-Quiz", desc: "In wenigen Fragen zum passenden Rad.", icon: Sparkles, soon: true },
      { title: "Vergleichstool", desc: "Modelle nach Ausstattung und Preis vergleichen.", icon: GitCompare, soon: true },
      { title: "Förderungs-Finder", desc: "Zuschüsse und Prämien in deiner Region.", icon: HandCoins, soon: true },
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
  const inner = (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/60 p-5 transition-all duration-300 hover:border-signal/60 hover:bg-card hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]">
      {/* soft sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 left-0 h-[200%] w-px bg-gradient-to-b from-transparent via-signal/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-background/50 text-signal transition-colors group-hover:border-signal/50">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        {tool.soon && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Bald
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-base font-bold tracking-tight text-foreground">
        {tool.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
        {tool.desc}
      </p>
    </div>
  );

  if (tool.to && !tool.soon) {
    return (
      <Link to={tool.to} className="block h-full">
        {inner}
      </Link>
    );
  }
  return <div className="h-full cursor-default">{inner}</div>;
}

function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
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
        </div>
      </section>

      {/* Groups */}
      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        {groups.map((g, gi) => (
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
        ))}

        <p className="mt-16 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Weitere Tools folgen — kuratiert von der radmap.de Redaktion
        </p>
      </div>
    </div>
  );
}
