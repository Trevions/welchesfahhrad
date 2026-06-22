import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cog } from "lucide-react";
import {
  ToolShell,
  ToolCard,
  ToolLabel,
  ToolInput,
  ToolSelect,
  ToolDisclaimer,
} from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/uebersetzung")({
  head: () =>
    toolHead({
      title: "Übersetzungs-Rechner",
      description:
        "Berechne Entfaltung und Geschwindigkeit für jede Gangkombination — Kettenblätter, Ritzel, Reifengröße, Trittfrequenz.",
      path: "/tools/uebersetzung",
    }),
  component: UebersetzungPage,
});

// Reifenumfang in mm (Standardwerte ETRTO)
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
  return s
    .split(/[,\s]+/)
    .map((x) => +x.trim())
    .filter((n) => n > 0 && n < 100);
}

function UebersetzungPage() {
  const [chainrings, setChainrings] = useState("50, 34");
  const [cassette, setCassette] = useState("11, 13, 15, 17, 19, 21, 24, 28, 32");
  const [tire, setTire] = useState("700x28");
  const [cadence, setCadence] = useState(90);

  const cr = parseList(chainrings);
  const cs = parseList(cassette);
  const circ = TIRES[tire].circumference / 1000; // m

  const rows = useMemo(() => {
    return cr.map((c) =>
      cs.map((r) => {
        const ratio = c / r;
        const dev = ratio * circ; // m pro Kurbelumdrehung
        const speed = dev * cadence * 60 / 1000; // km/h
        return { c, r, ratio: +ratio.toFixed(2), dev: +dev.toFixed(2), speed: +speed.toFixed(1) };
      }),
    );
  }, [cr, cs, circ, cadence]);

  return (
    <ToolShell
      eyebrow="Rechner · 03"
      title="Übersetzungs-Rechner"
      description="Wie weit kommst du mit einer Kurbelumdrehung? Wie schnell fährst du bei welcher Kadenz? Komplette Gang-Matrix."
      icon={Cog}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Antrieb</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Kettenblätter (Zähne, kommasepariert)</ToolLabel>
              <ToolInput
                value={chainrings}
                onChange={(e) => setChainrings(e.target.value)}
              />
            </div>
            <div>
              <ToolLabel>Kassette / Ritzel (Zähne, kommasepariert)</ToolLabel>
              <ToolInput value={cassette} onChange={(e) => setCassette(e.target.value)} />
            </div>
            <div>
              <ToolLabel>Reifen</ToolLabel>
              <ToolSelect value={tire} onChange={(e) => setTire(e.target.value)}>
                {Object.entries(TIRES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} ({v.circumference} mm)
                  </option>
                ))}
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Trittfrequenz (1/min)</ToolLabel>
              <ToolInput
                type="number"
                min={40}
                max={140}
                value={cadence}
                onChange={(e) => setCadence(+e.target.value || 0)}
              />
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
                {cs.map((r) => (
                  <th key={r} className="py-2 pr-3 font-mono">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 pr-3 font-mono font-bold text-signal">{cr[i]}</td>
                  {row.map((cell, j) => (
                    <td key={j} className="py-2.5 pr-3">
                      <span className="font-semibold text-foreground">{cell.speed}</span>
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        ({cell.dev})
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ToolCard>
      </div>

      <ToolDisclaimer>
        Formel: Entfaltung = (Kettenblatt / Ritzel) × Reifenumfang. Geschwindigkeit =
        Entfaltung × Trittfrequenz × 60 / 1000. Reifenumfänge nach ETRTO-Standard.
      </ToolDisclaimer>
    </ToolShell>
  );
}
