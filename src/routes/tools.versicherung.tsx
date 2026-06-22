import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldHalf, ArrowUpDown } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/versicherung")({
  head: () =>
    toolHead({
      title: "Fahrrad- und E-Bike-Versicherungen im Vergleich",
      description:
        "Diebstahl, Akkudefekt, Verschleiß, Pannenhilfe — die wichtigsten Fahrrad- und E-Bike-Versicherungen im redaktionellen Vergleich.",
      path: "/tools/versicherung",
    }),
  component: VersicherungPage,
});

type Row = {
  name: string;
  monthly: number;
  theft: boolean;
  battery: boolean;
  wear: boolean;
  assist: boolean;
  selfRisk: string;
  pro: string;
  con: string;
};

const PROVIDERS: Row[] = [
  {
    name: "Wertgarantie",
    monthly: 4.9,
    theft: true,
    battery: true,
    wear: true,
    assist: true,
    selfRisk: "0–150 €",
    pro: "Marktführer, breite Deckung inkl. Verschleiß und Reparaturen.",
    con: "Höhere Beiträge bei E-Bikes über 5.000 €.",
  },
  {
    name: "Ammerländer",
    monthly: 3.5,
    theft: true,
    battery: true,
    wear: false,
    assist: true,
    selfRisk: "0 €",
    pro: "Sehr gutes Preis-/Leistungsverhältnis, keine SB.",
    con: "Kein Verschleißschutz inklusive.",
  },
  {
    name: "Hepster",
    monthly: 4.2,
    theft: true,
    battery: true,
    wear: true,
    assist: true,
    selfRisk: "0–100 €",
    pro: "Flexible Laufzeit, monatlich kündbar, gute App.",
    con: "Verschleiß nur in Premium-Tarif.",
  },
  {
    name: "Bikmo",
    monthly: 5.5,
    theft: true,
    battery: true,
    wear: false,
    assist: true,
    selfRisk: "100 €",
    pro: "Weltweite Deckung, beliebt bei Sportradfahrern.",
    con: "Höherer Beitrag, SB im Schadensfall.",
  },
  {
    name: "DEVK / Allianz Zusatzbaustein",
    monthly: 2.5,
    theft: true,
    battery: false,
    wear: false,
    assist: false,
    selfRisk: "150 €",
    pro: "Günstig als Baustein zur Hausrat.",
    con: "Eingeschränkter Schutz, kein Akku-Schaden.",
  },
];

type SortKey = "monthly" | "selfRisk" | "name";

function VersicherungPage() {
  const [sort, setSort] = useState<SortKey>("monthly");
  const sorted = [...PROVIDERS].sort((a, b) => {
    if (sort === "monthly") return a.monthly - b.monthly;
    if (sort === "name") return a.name.localeCompare(b.name);
    return parseInt(a.selfRisk) - parseInt(b.selfRisk);
  });

  return (
    <ToolShell
      eyebrow="Recht · 04"
      title="Versicherungs-Vergleich"
      description="Welche Police passt zu deinem Rad? Wir vergleichen Marktführer und Spezialisten objektiv — Stand 2025."
      icon={ShieldHalf}
    >
      <ToolCard className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Sortierung:
          </span>
          {(
            [
              { id: "monthly", label: "Preis" },
              { id: "selfRisk", label: "Selbstbeteiligung" },
              { id: "name", label: "Name" },
            ] as { id: SortKey; label: string }[]
          ).map((o) => (
            <button
              key={o.id}
              onClick={() => setSort(o.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                sort === o.id
                  ? "border-signal bg-signal/10 text-signal"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpDown className="h-3 w-3" />
              {o.label}
            </button>
          ))}
        </div>
      </ToolCard>

      <div className="grid gap-4">
        {sorted.map((p) => (
          <ToolCard key={p.name}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold tracking-tight">{p.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em]">
                  <Badge ok={p.theft} label="Diebstahl" />
                  <Badge ok={p.battery} label="Akkuschaden" />
                  <Badge ok={p.wear} label="Verschleiß" />
                  <Badge ok={p.assist} label="Pannenhilfe" />
                </div>
                <div className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                  <p><strong className="text-foreground">Pro:</strong> {p.pro}</p>
                  <p><strong className="text-foreground">Contra:</strong> {p.con}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  ab pro Monat
                </div>
                <div className="font-display text-3xl font-black text-signal">
                  {p.monthly.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </div>
                <div className="mt-1 text-xs text-muted-foreground">SB: {p.selfRisk}</div>
              </div>
            </div>
          </ToolCard>
        ))}
      </div>

      <ToolDisclaimer>
        Preise sind durchschnittliche Einstiegsbeiträge für ein E-Bike bis 3.000 € und können
        je nach Wohnort, Versicherungssumme und Selbstbeteiligung variieren. Keine Versicherungsberatung.
        Stand: 2025. Empfehlung: vor Abschluss 2–3 individuelle Angebote einholen.
      </ToolDisclaimer>
    </ToolShell>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 ${
        ok
          ? "border-signal/40 bg-signal/10 text-signal"
          : "border-border bg-background/40 text-muted-foreground line-through"
      }`}
    >
      {label}
    </span>
  );
}
