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
        "Professioneller Reifendruck-Rechner nach SRAM, Silca & Schwalbe — Rennrad, Gravel, MTB. Vorn und hinten separat in bar und psi.",
      path: "/tools/reifendruck",
    }),
  component: ReifendruckPage,
});

type Surface = "smooth" | "rough" | "gravel" | "mixed" | "mtb";
type Setup = "tubeless" | "butyl" | "latex";
type Style = "comfort" | "balanced" | "performance";

// Referenz-Tabelle: Reifenbreite (mm) → [min bar, max bar] für 75 kg Systemgewicht
// Basis: SRAM Tire Pressure Guide, Silca, Schwalbe
const PRESSURE_TABLE: Array<{ width: number; min: number; max: number; hardCap: number }> = [
  { width: 23, min: 6.5, max: 8.5, hardCap: 8.0 },
  { width: 25, min: 6.0, max: 8.0, hardCap: 8.0 },
  { width: 28, min: 5.0, max: 7.0, hardCap: 7.0 },
  { width: 30, min: 4.5, max: 6.5, hardCap: 6.5 },
  { width: 32, min: 4.0, max: 6.0, hardCap: 6.5 },
  { width: 35, min: 2.5, max: 4.5, hardCap: 5.5 },
  { width: 40, min: 2.0, max: 4.0, hardCap: 5.0 },
  { width: 45, min: 1.8, max: 3.5, hardCap: 4.5 },
  { width: 50, min: 1.5, max: 3.0, hardCap: 4.0 },
  { width: 55, min: 1.2, max: 2.5, hardCap: 3.5 },
  { width: 60, min: 1.1, max: 2.3, hardCap: 3.0 },
  { width: 70, min: 1.0, max: 2.0, hardCap: 2.8 },
];

function interpolate(width: number) {
  const t = PRESSURE_TABLE;
  if (width <= t[0].width) return t[0];
  if (width >= t[t.length - 1].width) return t[t.length - 1];
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i];
    const b = t[i + 1];
    if (width >= a.width && width <= b.width) {
      const f = (width - a.width) / (b.width - a.width);
      return {
        width,
        min: a.min + (b.min - a.min) * f,
        max: a.max + (b.max - a.max) * f,
        hardCap: a.hardCap + (b.hardCap - a.hardCap) * f,
      };
    }
  }
  return t[t.length - 1];
}

function calc(
  weight: number,
  width: number,
  surface: Surface,
  setup: Setup,
  style: Style,
  maxPressure: number | null,
) {
  const range = interpolate(width);

  // Gewichtsskalierung: Referenz 75 kg, lineare Skalierung des Druckbandes
  // ~0,9 % Druck pro kg Abweichung (entspricht SRAM/Silca-Empfehlungen)
  const weightFactor = 1 + (weight - 75) * 0.009;
  const minP = range.min * weightFactor;
  const maxP = range.max * weightFactor;

  // Startwert: Mitte des empfohlenen Bandes (Hinterrad)
  let rear = (minP + maxP) / 2;

  // Untergrund-Anpassung
  if (surface === "rough") rear -= 0.25;
  else if (surface === "gravel") rear *= 0.80;        // −20 %
  else if (surface === "mixed") rear *= 0.90;         // −10 %
  else if (surface === "mtb") rear *= 0.675;          // −32,5 %

  // Setup-Anpassung
  if (setup === "tubeless") rear -= 0.3;
  else if (setup === "latex") rear -= 0.1;
  // butyl: keine Anpassung

  // Fahrstil
  if (style === "comfort") rear -= 0.3;
  else if (style === "performance") rear += 0.25;

  // Vorderrad: 10 % weniger als hinten
  let front = rear * 0.90;

  // Sicherheits-Cap: nie über hardCap der Breitenkategorie
  rear = Math.min(rear, range.hardCap);
  front = Math.min(front, range.hardCap);

  // Hersteller-Max
  if (maxPressure && maxPressure > 0) {
    rear = Math.min(rear, maxPressure);
    front = Math.min(front, maxPressure);
  }

  // Absolute Untergrenze
  rear = Math.max(rear, 0.8);
  front = Math.max(front, 0.7);

  return {
    front: +front.toFixed(1),
    rear: +rear.toFixed(1),
    frontPsi: Math.round(front * 14.5038),
    rearPsi: Math.round(rear * 14.5038),
    band: {
      min: +Math.max(minP, 0.8).toFixed(1),
      max: +Math.min(maxP, range.hardCap).toFixed(1),
    },
  };
}

function ReifendruckPage() {
  const [weight, setWeight] = useState(85);
  const [width, setWidth] = useState(28);
  const [surface, setSurface] = useState<Surface>("smooth");
  const [setup, setSetup] = useState<Setup>("butyl");
  const [style, setStyle] = useState<Style>("balanced");
  const [maxP, setMaxP] = useState<number>(0);

  const r = useMemo(
    () => calc(weight, width, surface, setup, style, maxP || null),
    [weight, width, surface, setup, style, maxP],
  );

  return (
    <ToolShell
      eyebrow="Rechner · 01"
      title="Reifendruck-Rechner"
      description="Professionelle Druckempfehlung nach SRAM, Silca und Schwalbe — für Rennrad, Gravel und MTB. Vorn und hinten getrennt, abgestimmt auf Systemgewicht, Untergrund, Setup und Fahrstil."
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
                <option value="smooth">Glatter Asphalt</option>
                <option value="rough">Rauer Asphalt</option>
                <option value="gravel">Schotter / Gravel</option>
                <option value="mixed">Gemischtes Terrain</option>
                <option value="mtb">MTB Trail</option>
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Setup</ToolLabel>
              <ToolSelect value={setup} onChange={(e) => setSetup(e.target.value as Setup)}>
                <option value="tubeless">Tubeless</option>
                <option value="butyl">Butyl-Schlauch</option>
                <option value="latex">Latex-Schlauch</option>
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Fahrstil</ToolLabel>
              <ToolSelect value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                <option value="comfort">Komfort</option>
                <option value="balanced">Ausgewogen</option>
                <option value="performance">Performance</option>
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Hersteller-Maximaldruck (bar, optional)</ToolLabel>
              <ToolInput
                type="number"
                min={0}
                max={12}
                step={0.1}
                value={maxP || ""}
                placeholder="z. B. 7.5 (steht auf der Reifenflanke)"
                onChange={(e) => setMaxP(+e.target.value || 0)}
              />
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
              <strong className="text-foreground">Empfohlenes Druckband</strong> für deine
              Reifenbreite ({width} mm) bei {weight} kg Systemgewicht: {r.band.min}–{r.band.max} bar.
              Das Vorderrad läuft bewusst ~10 % weicher als hinten — für mehr Grip und Komfort.
            </p>
            <p>
              <strong className="text-foreground">Tipp:</strong> Start mit dem unteren Wert.
              Walkt der Reifen in Kurven oder fühlt sich der Lenker schwammig an, in 0,2-bar-Schritten
              erhöhen. Im Nassen 0,2–0,3 bar weniger fahren.
            </p>
          </div>
        </ToolCard>
      </div>

      <ToolDisclaimer>
        Diese Werte sind Startempfehlungen auf Basis moderner Reifendruck-Forschung
        (SRAM Tire Pressure Guide, Silca Tire Pressure Calculator, Schwalbe). Berechnet wird
        über ein breitenabhängiges Druckband mit Gewichtsskalierung, Untergrund-, Setup- und
        Fahrstil-Anpassung. Befolge immer den auf Reifen und Felge angegebenen Maximaldruck.
      </ToolDisclaimer>
    </ToolShell>
  );
}
