import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import {
  ToolShell,
  ToolCard,
  ToolLabel,
  ToolInput,
  ToolSelect,
  ToolResultStat,
  ToolDisclaimer,
} from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/reifendruck")({
  head: () =>
    toolHead({
      title: "Reifendruck-Rechner",
      description:
        "Optimaler Reifendruck nach Systemgewicht, Reifenbreite, Untergrund und Setup. Vorn und hinten separat — in bar und psi.",
      path: "/tools/reifendruck",
    }),
  component: ReifendruckPage,
});

type Surface = "road" | "gravel" | "mtb";
type Tube = "butyl" | "tpu" | "tubeless";

function calc(weightKg: number, widthMm: number, surface: Surface, tube: Tube) {
  // SRAM/Berthoud-orientierte Näherung: lineare Beziehung Druck zu (Gewicht / Reifenbreite²)
  // Referenz: 75 kg System, 25 mm Reifen → ~6,5 bar hinten Straße.
  const widthFactor = Math.max(23, Math.min(70, widthMm));
  const base =
    (weightKg / Math.pow(widthFactor, 2)) * 4200; // empirische Konstante
  // Gewichtsverteilung 45 % vorn / 55 % hinten
  let front = base * 0.9;
  let rear = base * 1.1;

  if (surface === "gravel") {
    front *= 0.85;
    rear *= 0.85;
  } else if (surface === "mtb") {
    front *= 0.6;
    rear *= 0.65;
  }

  if (tube === "tubeless") {
    front -= 0.3;
    rear -= 0.3;
  } else if (tube === "tpu") {
    front -= 0.1;
    rear -= 0.1;
  }

  // Begrenzen auf sinnvolle Werte
  front = Math.max(1.2, Math.min(8.5, front));
  rear = Math.max(1.3, Math.min(9.0, rear));

  return {
    front: +front.toFixed(2),
    rear: +rear.toFixed(2),
    frontPsi: Math.round(front * 14.5038),
    rearPsi: Math.round(rear * 14.5038),
  };
}

function ReifendruckPage() {
  const [weight, setWeight] = useState(85);
  const [width, setWidth] = useState(28);
  const [surface, setSurface] = useState<Surface>("road");
  const [tube, setTube] = useState<Tube>("butyl");

  const r = useMemo(
    () => calc(weight, width, surface, tube),
    [weight, width, surface, tube],
  );

  return (
    <ToolShell
      eyebrow="Rechner · 01"
      title="Reifendruck-Rechner"
      description="Berechne den optimalen Luftdruck für vorn und hinten — abgestimmt auf dein Systemgewicht, deine Reifenbreite und deinen Untergrund."
      icon={Gauge}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Eingaben</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Systemgewicht (Fahrer + Rad + Gepäck, kg)</ToolLabel>
              <ToolInput
                type="number"
                min={30}
                max={200}
                value={weight}
                onChange={(e) => setWeight(+e.target.value || 0)}
              />
            </div>
            <div>
              <ToolLabel>Reifenbreite (mm)</ToolLabel>
              <ToolInput
                type="number"
                min={20}
                max={75}
                value={width}
                onChange={(e) => setWidth(+e.target.value || 0)}
              />
            </div>
            <div>
              <ToolLabel>Untergrund</ToolLabel>
              <ToolSelect
                value={surface}
                onChange={(e) => setSurface(e.target.value as Surface)}
              >
                <option value="road">Straße / Asphalt</option>
                <option value="gravel">Schotter / Gravel</option>
                <option value="mtb">MTB / Trail</option>
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Setup</ToolLabel>
              <ToolSelect value={tube} onChange={(e) => setTube(e.target.value as Tube)}>
                <option value="butyl">Butyl-Schlauch (Standard)</option>
                <option value="tpu">TPU-Schlauch (leicht)</option>
                <option value="tubeless">Tubeless</option>
              </ToolSelect>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Empfehlung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ToolResultStat
              label="Vorderrad"
              value={r.front}
              unit="bar"
              hint={`${r.frontPsi} psi`}
            />
            <ToolResultStat
              label="Hinterrad"
              value={r.rear}
              unit="bar"
              hint={`${r.rearPsi} psi`}
            />
          </div>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Tipp:</strong> Im Nassen 0,2–0,3 bar
              weniger fahren für mehr Grip. Beim ersten Test mit dem niedrigen Wert starten
              und nur erhöhen, wenn der Reifen sich beim Wiegen oder in Kurven walkt.
            </p>
            <p>
              Niemals den am Reifen aufgedruckten Maximaldruck überschreiten — er steht
              auf der Reifenflanke (z. B. „MAX 7.5 bar").
            </p>
          </div>
        </ToolCard>
      </div>

      <ToolDisclaimer>
        Formel: empirische Näherung auf Basis SRAM/Berthoud (Druck ∝ Gewicht / Reifenbreite²)
        mit Gewichtsverteilung 45/55 vorn/hinten, Tubeless-Abschlag −0,3 bar und Off-Road-Abschlag
        bis −40 %. Richtwerte für Standard-Setups, keine Herstellerangabe.
      </ToolDisclaimer>
    </ToolShell>
  );
}
