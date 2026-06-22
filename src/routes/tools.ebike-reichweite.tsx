import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BatteryCharging } from "lucide-react";
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

export const Route = createFileRoute("/tools/ebike-reichweite")({
  head: () =>
    toolHead({
      title: "E-Bike Reichweite",
      description:
        "Realistische Reichweiten-Prognose für dein E-Bike — abhängig von Akku, Unterstützungsstufe, Profil, Wind und Temperatur.",
      path: "/tools/ebike-reichweite",
    }),
  component: ReichweitePage,
});

type Mode = "eco" | "tour" | "sport" | "turbo";
type Profile = "flat" | "hilly" | "mountain";

// Wh/km Basis (Bosch-typische Werte)
const MODE_WH: Record<Mode, number> = { eco: 6, tour: 8.5, sport: 11.5, turbo: 16 };
const PROFILE_FACTOR: Record<Profile, number> = { flat: 1, hilly: 1.25, mountain: 1.55 };

function ReichweitePage() {
  const [wh, setWh] = useState(625);
  const [mode, setMode] = useState<Mode>("tour");
  const [profile, setProfile] = useState<Profile>("hilly");
  const [weight, setWeight] = useState(85);
  const [wind, setWind] = useState(10);
  const [temp, setTemp] = useState(18);

  const result = useMemo(() => {
    let whPerKm = MODE_WH[mode] * PROFILE_FACTOR[profile];
    // Gewichtskorrektur: Referenz 80 kg, +1,2 % je kg
    whPerKm *= 1 + (weight - 80) * 0.012;
    // Wind: +1,5 % je km/h Gegenwind über 5
    whPerKm *= 1 + Math.max(0, wind - 5) * 0.015;
    // Temperatur: unter 10 °C bis +25 % bei 0 °C, linear
    if (temp < 10) whPerKm *= 1 + (10 - temp) * 0.025;
    whPerKm = Math.max(3, whPerKm);

    const km = wh / whPerKm;
    const low = km * 0.85;
    const high = km * 1.1;
    return {
      km: Math.round(km),
      low: Math.round(low),
      high: Math.round(high),
      whPerKm: +whPerKm.toFixed(1),
    };
  }, [wh, mode, profile, weight, wind, temp]);

  return (
    <ToolShell
      eyebrow="Rechner · 04"
      title="E-Bike Reichweite"
      description="Reichweite ist keine Glückssache. Wir rechnen mit realistischen Bosch-/Shimano-Werten und den Faktoren, die wirklich zählen."
      icon={BatteryCharging}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Setup</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Akku-Kapazität (Wh)</ToolLabel>
              <ToolInput
                type="number"
                min={200}
                max={1500}
                value={wh}
                onChange={(e) => setWh(+e.target.value || 0)}
              />
            </div>
            <div>
              <ToolLabel>Unterstützungsmodus</ToolLabel>
              <ToolSelect value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                <option value="eco">Eco (sparsam)</option>
                <option value="tour">Tour (Standard)</option>
                <option value="sport">Sport / eMTB</option>
                <option value="turbo">Turbo</option>
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Profil</ToolLabel>
              <ToolSelect
                value={profile}
                onChange={(e) => setProfile(e.target.value as Profile)}
              >
                <option value="flat">Flach (&lt; 200 hm/100 km)</option>
                <option value="hilly">Hügelig (200–800 hm/100 km)</option>
                <option value="mountain">Bergig (&gt; 800 hm/100 km)</option>
              </ToolSelect>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <ToolLabel>System-kg</ToolLabel>
                <ToolInput
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(+e.target.value || 0)}
                />
              </div>
              <div>
                <ToolLabel>Wind km/h</ToolLabel>
                <ToolInput
                  type="number"
                  value={wind}
                  onChange={(e) => setWind(+e.target.value || 0)}
                />
              </div>
              <div>
                <ToolLabel>Temp °C</ToolLabel>
                <ToolInput
                  type="number"
                  value={temp}
                  onChange={(e) => setTemp(+e.target.value || 0)}
                />
              </div>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Prognose</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ToolResultStat label="Reichweite" value={result.km} unit="km" />
            <ToolResultStat label="Min." value={result.low} unit="km" hint="zügig, voll beladen" />
            <ToolResultStat label="Max." value={result.high} unit="km" hint="entspannt, leicht" />
          </div>
          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Verbrauch:</strong> ca. {result.whPerKm} Wh/km.
              In der Praxis bestimmen Reifenwahl, Bremsen-Schleifen und die Gangwahl mehr
              als jede Akku-Marketingangabe.
            </p>
          </div>
        </ToolCard>
      </div>

      <ToolDisclaimer>
        Formel: km = Akku-Wh / Verbrauch. Verbrauchsbasis: Bosch Performance-Range
        (Eco 6, Tour 8,5, Sport 11,5, Turbo 16 Wh/km). Profile, Gewicht, Wind und Temperatur
        werden als Korrekturfaktoren multipliziert. Bei Bosch/Shimano echte Werte aus deinem
        Display können abweichen.
      </ToolDisclaimer>
    </ToolShell>
  );
}
