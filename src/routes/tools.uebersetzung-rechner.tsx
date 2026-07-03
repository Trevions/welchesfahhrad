import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cog } from "lucide-react";
import {
  ToolShell,
  ToolCard,
  ToolLabel,
  ToolInput,
  ToolSelect,
} from "@/components/tools/ToolShell";
import { ToolReviewedBy, ToolFaq, ToolSeoSection } from "@/components/tools/ToolSeo";
import { toolHead } from "@/lib/tools/seo";

const SLUG = "uebersetzung-rechner";

const FAQ = [
  {
    question: "Was ist Entfaltung eigentlich?",
    answer:
      "Entfaltung ist die Strecke in Metern, die dein Rad bei einer Kurbelumdrehung zurücklegt. Bei einer 50/17-Übersetzung und 700×28C-Reifen sind das rund 6,3 Meter. Klassische Rennrad-Übersetzungen liegen zwischen 3 m (leichter Berggang) und 10 m (schnellster Gang).",
  },
  {
    question: "Welche Trittfrequenz ist optimal?",
    answer:
      "Für Alltag und Touren 80–90 U/min, im Rennsport 90–100 U/min. Höhere Kadenz schont die Knie und ermüdet die Muskulatur weniger, kostet aber Herz-Kreislauf-Leistung. Untrainierte fahren oft zu langsam bei 60–70 — meist ein Zeichen für zu schwere Gangwahl.",
  },
  {
    question: "Wie finde ich einen guten Berg-Gang?",
    answer:
      "Als Faustregel: 1:1 (Kettenblatt = Ritzel, z. B. 32×32) reicht für 8–10 %-Anstiege bei durchschnittlichem Trainingszustand. Für Alpen mit Gepäck 34×36 oder 30×34 (Gravel-Gearing). Bei E-Bikes reicht meist 38×42 dank Motor-Unterstützung.",
  },
  {
    question: "1×- oder 2×-Schaltung: was ist besser?",
    answer:
      "1× (ein Kettenblatt) ist einfacher, leichter und wartungsärmer, hat aber größere Gangsprünge. 2× (zwei Kettenblätter) bietet feinere Abstufung — Standard für Rennrad und lange Touren. MTB und Gravel gehen fast komplett auf 1×.",
  },
];

export const Route = createFileRoute("/tools/uebersetzung-rechner")({
  head: () =>
    toolHead({
      title: "Übersetzungs-Rechner: Entfaltung & Geschwindigkeit",
      description:
        "Übersetzungs-Rechner für Fahrrad: Entfaltung, Kadenz und Geschwindigkeit für jede Gangkombination. Kettenblätter, Ritzel und Reifengröße frei einstellbar.",
      path: "/tools/uebersetzung-rechner",
      slug: SLUG,
      faq: FAQ,
    }),
  component: UebersetzungPage,
});

const TIRES: Record<string, { label: string; circumference: number }> = {
  "700x23": { label: "Rennrad 700×23C", circumference: 2096 },
  "700x25": { label: "Rennrad 700×25C", circumference: 2105 },
  "700x28": { label: "700×28C", circumference: 2136 },
  "700x32": { label: "Gravel 700×32C", circumference: 2155 },
  "700x40": { label: "Gravel 700×40C", circumference: 2200 },
  "650b": { label: "650B × 47", circumference: 2090 },
  "29x2.25": { label: "MTB 29×2.25", circumference: 2270 },
  "27.5x2.25": { label: "MTB 27.5×2.25", circumference: 2150 },
  "26x2.0": { label: "MTB 26×2.0", circumference: 2055 },
};

function parseList(s: string): number[] {
  return s.split(/[,\s]+/).map((x) => +x.trim()).filter((n) => n > 0 && n < 100);
}

function UebersetzungPage() {
  const [chainrings, setChainrings] = useState("50, 34");
  const [cassette, setCassette] = useState("11, 13, 15, 17, 19, 21, 24, 28, 32");
  const [tire, setTire] = useState("700x28");
  const [cadence, setCadence] = useState(90);

  const cr = parseList(chainrings);
  const cs = parseList(cassette);
  const circ = TIRES[tire].circumference / 1000;

  const rows = useMemo(() => {
    return cr.map((c) =>
      cs.map((r) => {
        const ratio = c / r;
        const dev = ratio * circ;
        const speed = (dev * cadence * 60) / 1000;
        return { c, r, ratio: +ratio.toFixed(2), dev: +dev.toFixed(2), speed: +speed.toFixed(1) };
      }),
    );
  }, [cr, cs, circ, cadence]);

  return (
    <ToolShell
      eyebrow="Rechner · 03"
      title="Übersetzungs-Rechner"
      description="Wie weit kommst du mit einer Kurbelumdrehung? Wie schnell fährst du bei welcher Kadenz? Komplette Gang-Matrix für jede Kombination."
      icon={Cog}
    >
      <ToolReviewedBy slug={SLUG} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Antrieb</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Kettenblätter (Zähne, kommasepariert)</ToolLabel>
              <ToolInput value={chainrings} onChange={(e) => setChainrings(e.target.value)} />
            </div>
            <div>
              <ToolLabel>Kassette / Ritzel (Zähne, kommasepariert)</ToolLabel>
              <ToolInput value={cassette} onChange={(e) => setCassette(e.target.value)} />
            </div>
            <div>
              <ToolLabel>Reifen</ToolLabel>
              <ToolSelect value={tire} onChange={(e) => setTire(e.target.value)}>
                {Object.entries(TIRES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label} ({v.circumference} mm)</option>
                ))}
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Trittfrequenz (1/min)</ToolLabel>
              <ToolInput type="number" min={40} max={140} value={cadence} onChange={(e) => setCadence(+e.target.value || 0)} />
            </div>
          </div>
        </ToolCard>

        <ToolCard className="overflow-x-auto">
          <h2 className="font-display text-lg font-bold tracking-tight">Geschwindigkeit (km/h)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            bei {cadence} U/min · Entfaltung in Klammern (m / Umdrehung)
          </p>
          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="py-2 pr-3">KB</th>
                {cs.map((r) => (<th key={r} className="py-2 pr-3 font-mono">{r}</th>))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 pr-3 font-mono font-bold text-signal">{cr[i]}</td>
                  {row.map((cell, j) => (
                    <td key={j} className="py-2.5 pr-3">
                      <span className="font-semibold text-foreground">{cell.speed}</span>
                      <span className="ml-1 text-[10px] text-muted-foreground">({cell.dev})</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ToolCard>
      </div>

      <ToolSeoSection slug={SLUG} heading="So funktioniert der Übersetzungs-Rechner">
        <p>
          Die Übersetzung entscheidet darüber, wie schnell und wie leichtfüßig du fährst.
          Der Rechner zeigt für jede Kombination aus Kettenblatt und Ritzel die
          <strong> Entfaltung</strong> (Meter pro Kurbelumdrehung) und die
          <strong> Geschwindigkeit</strong> bei deiner Wunsch-Trittfrequenz.
        </p>

        <h3>Formel</h3>
        <p>
          <strong>Entfaltung [m] = (Kettenblatt / Ritzel) × Reifenumfang [m]</strong>. Der
          Reifenumfang stammt aus dem ETRTO-Standard — 2136 mm für 700×28C, 2270 mm für einen
          29-Zoll-MTB-Reifen mit 2,25 Zoll Breite. <strong>Geschwindigkeit [km/h] = Entfaltung ×
          Trittfrequenz × 60 / 1000</strong>.
        </p>

        <h3>Beispiel: 50/34 Kompaktkurbel mit 11–32 Kassette</h3>
        <table>
          <thead><tr><th>Gang</th><th>Übersetzung</th><th>Entfaltung</th><th>km/h bei 90 U/min</th></tr></thead>
          <tbody>
            <tr><td>50 × 11</td><td>4,55</td><td>9,7 m</td><td>52,4</td></tr>
            <tr><td>50 × 15</td><td>3,33</td><td>7,1 m</td><td>38,4</td></tr>
            <tr><td>34 × 21</td><td>1,62</td><td>3,5 m</td><td>18,7</td></tr>
            <tr><td>34 × 32</td><td>1,06</td><td>2,3 m</td><td>12,3</td></tr>
          </tbody>
        </table>

        <h3>Was der Rechner nicht berücksichtigt</h3>
        <ul>
          <li>Reifendruck und Rollwiderstand (Real-Geschwindigkeit ist meist 2–4 % niedriger).</li>
          <li>Wind, Steigung, Nabenschaltungs-Übersetzungsverhältnis.</li>
          <li>Schlupf bei Nasstfahrt und E-Bike-Motor-Unterstützung.</li>
        </ul>

        <h3>Anwendungsfälle</h3>
        <p>
          Sinnvoll ist der Rechner für die Kaufentscheidung (welche Kassette zum Rahmen?),
          zur Planung eines Berg-Setups (reicht 34 × 32 für die Alpen?) und für die Kadenz-
          Optimierung im Training. Bei Nabenschaltungen (Alfine, Rohloff) sind die Werte
          durch die Getriebe-Übersetzung zu korrigieren — Herstellerangabe beachten.
        </p>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
