import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ruler } from "lucide-react";
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

export const Route = createFileRoute("/tools/rahmengroesse")({
  head: () =>
    toolHead({
      title: "Rahmengrößen-Rechner",
      description:
        "Ermittle die passende Rahmenhöhe nach Schrittlänge und Radtyp — Rennrad, MTB, Trekking, Gravel oder City.",
      path: "/tools/rahmengroesse",
    }),
  component: RahmenPage,
});

type Type = "road" | "mtb" | "trekking" | "gravel" | "city";

const FACTORS: Record<Type, { factor: number; unit: "cm" | "inch"; label: string }> = {
  road: { factor: 0.665, unit: "cm", label: "Rennrad" },
  mtb: { factor: 0.226, unit: "inch", label: "MTB" },
  trekking: { factor: 0.66, unit: "cm", label: "Trekking" },
  gravel: { factor: 0.67, unit: "cm", label: "Gravel" },
  city: { factor: 0.685, unit: "cm", label: "City" },
};

function sizeLabel(cm: number, type: Type) {
  if (type === "mtb") return cm < 16 ? "XS" : cm < 17.5 ? "S" : cm < 19 ? "M" : cm < 20.5 ? "L" : "XL";
  if (type === "road")
    return cm < 50 ? "XS" : cm < 53 ? "S" : cm < 56 ? "M" : cm < 59 ? "L" : "XL";
  return cm < 48 ? "XS" : cm < 52 ? "S" : cm < 56 ? "M" : cm < 60 ? "L" : "XL";
}

function RahmenPage() {
  const [height, setHeight] = useState(180);
  const [inseam, setInseam] = useState(84);
  const [type, setType] = useState<Type>("road");

  const result = useMemo(() => {
    const { factor, unit } = FACTORS[type];
    const value = inseam * factor;
    const cm = unit === "inch" ? value * 2.54 : value;
    return {
      primary: +value.toFixed(1),
      primaryUnit: unit,
      cm: +cm.toFixed(1),
      size: sizeLabel(cm, type),
    };
  }, [inseam, type]);

  return (
    <ToolShell
      eyebrow="Rechner · 02"
      title="Rahmengrößen-Rechner"
      description="Die richtige Rahmenhöhe entscheidet über Komfort, Effizienz und Sicherheit. Wir berechnen sie aus Schrittlänge und Radtyp."
      icon={Ruler}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Deine Maße</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Körpergröße (cm)</ToolLabel>
              <ToolInput
                type="number"
                min={140}
                max={220}
                value={height}
                onChange={(e) => setHeight(+e.target.value || 0)}
              />
            </div>
            <div>
              <ToolLabel>Schrittlänge / Innenbeinlänge (cm)</ToolLabel>
              <ToolInput
                type="number"
                min={60}
                max={110}
                value={inseam}
                onChange={(e) => setInseam(+e.target.value || 0)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Barfuß an die Wand stellen, Buch zwischen die Beine bis zum Schritt —
                vom Boden bis zur Buchoberkante messen.
              </p>
            </div>
            <div>
              <ToolLabel>Radtyp</ToolLabel>
              <ToolSelect value={type} onChange={(e) => setType(e.target.value as Type)}>
                {(Object.keys(FACTORS) as Type[]).map((k) => (
                  <option key={k} value={k}>
                    {FACTORS[k].label}
                  </option>
                ))}
              </ToolSelect>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Empfehlung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ToolResultStat
              label="Rahmenhöhe"
              value={result.primary}
              unit={result.primaryUnit}
            />
            <ToolResultStat label="In cm" value={result.cm} unit="cm" />
            <ToolResultStat label="Konfektion" value={result.size} />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Die Faktoren stammen aus der klassischen Bike-Geometrie (Hinault/LeMond für Rennrad,
            Steve Hogg für MTB). Bei Sportlern eher kleinerer Rahmen, bei Touren-Fokus eher
            größerer Rahmen. Probefahren bleibt Pflicht.
          </p>
        </ToolCard>
      </div>

      <ToolDisclaimer>
        Formel: Schrittlänge × {FACTORS[type].factor} ({FACTORS[type].label}). Die Konfektionsgröße
        ist eine Marken-übergreifende Näherung — konkrete Rahmengrößen unterscheiden sich je
        Hersteller.
      </ToolDisclaimer>
    </ToolShell>
  );
}
