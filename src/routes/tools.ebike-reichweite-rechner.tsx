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
} from "@/components/tools/ToolShell";
import { ToolReviewedBy, ToolFaq, ToolSeoSection } from "@/components/tools/ToolSeo";
import { toolHead } from "@/lib/tools/seo";

const SLUG = "ebike-reichweite-rechner";

const FAQ = [
  {
    question: "Warum ist die Reichweite immer geringer als vom Hersteller versprochen?",
    answer:
      "Hersteller messen unter Idealbedingungen: 20 °C, flach, Rückenwind, 70 kg Fahrer, Eco-Modus, minimal Anfahrten. In der Realität kosten Kälte, Steigungen, Gepäck und Turbo-Modus schnell 40–60 % der beworbenen Reichweite. Unser Rechner nutzt realistische Bosch-Verbrauchswerte statt Marketing-Zahlen.",
  },
  {
    question: "Wie viel Reichweite kostet Kälte?",
    answer:
      "Bei 0 °C statt 20 °C reduziert sich die nutzbare Akku-Kapazität um bis zu 25 %. Der Akku sollte im Winter bei ≥ 10 °C gelagert und erst kurz vor Fahrtantritt eingesetzt werden. Nach der Tour: Akku ins Warme, nicht bei Minusgraden laden.",
  },
  {
    question: "Was verlängert die Reichweite am effektivsten?",
    answer:
      "In der Reihenfolge: (1) niedriger Unterstützungsmodus, (2) höhere Trittfrequenz statt hoher Gang, (3) 0,3–0,5 bar weniger Reifendruck bei rauem Belag, (4) Bremsen-Schleifen prüfen, (5) Ladung nach hinten verlagern. Ein zweiter Akku bringt oft mehr als jede Fahrstil-Optimierung.",
  },
  {
    question: "Wie lange hält ein E-Bike-Akku?",
    answer:
      "Ein moderner Bosch-/Shimano-Akku hält 500–1000 Vollzyklen bei 70–80 % Rest-Kapazität. Bei einem Vielfahrer mit 5000 km/Jahr sind das 6–8 Jahre. Wichtig: nicht dauerhaft voll oder leer lagern, Ideal-Lagerstand ist 30–70 %.",
  },
];

export const Route = createFileRoute("/tools/ebike-reichweite-rechner")({
  head: () =>
    toolHead({
      title: "E-Bike Reichweiten-Rechner: realistische Prognose",
      description:
        "E-Bike-Reichweiten-Rechner mit Wh/km-Basis nach Bosch. Berücksichtigt Akku, Modus, Profil, Gewicht, Wind und Temperatur. Realistischer als jede Herstellerangabe.",
      path: "/tools/ebike-reichweite-rechner",
      slug: SLUG,
      faq: FAQ,
    }),
  component: ReichweitePage,
});

type Mode = "eco" | "tour" | "sport" | "turbo";
type Profile = "flat" | "hilly" | "mountain";

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
    whPerKm *= 1 + (weight - 80) * 0.012;
    whPerKm *= 1 + Math.max(0, wind - 5) * 0.015;
    if (temp < 10) whPerKm *= 1 + (10 - temp) * 0.025;
    whPerKm = Math.max(3, whPerKm);
    const km = wh / whPerKm;
    return {
      km: Math.round(km),
      low: Math.round(km * 0.85),
      high: Math.round(km * 1.1),
      whPerKm: +whPerKm.toFixed(1),
    };
  }, [wh, mode, profile, weight, wind, temp]);

  return (
    <ToolShell
      eyebrow="Rechner · 04"
      title="E-Bike Reichweiten-Rechner"
      description="Reichweite ist keine Glückssache. Wir rechnen mit realistischen Bosch-Verbrauchswerten und allen Faktoren, die wirklich zählen."
      icon={BatteryCharging}
    >
      <ToolReviewedBy slug={SLUG} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Setup</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Akku-Kapazität (Wh)</ToolLabel>
              <ToolInput type="number" min={200} max={1500} value={wh} onChange={(e) => setWh(+e.target.value || 0)} />
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
              <ToolSelect value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>
                <option value="flat">Flach (&lt; 200 hm/100 km)</option>
                <option value="hilly">Hügelig (200–800 hm/100 km)</option>
                <option value="mountain">Bergig (&gt; 800 hm/100 km)</option>
              </ToolSelect>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <ToolLabel>System-kg</ToolLabel>
                <ToolInput type="number" value={weight} onChange={(e) => setWeight(+e.target.value || 0)} />
              </div>
              <div>
                <ToolLabel>Wind km/h</ToolLabel>
                <ToolInput type="number" value={wind} onChange={(e) => setWind(+e.target.value || 0)} />
              </div>
              <div>
                <ToolLabel>Temp °C</ToolLabel>
                <ToolInput type="number" value={temp} onChange={(e) => setTemp(+e.target.value || 0)} />
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
              In der Praxis bestimmen Reifenwahl, schleifende Bremsen und Gangwahl mehr als
              jede Akku-Marketingangabe.
            </p>
          </div>
        </ToolCard>
      </div>

      <ToolSeoSection slug={SLUG} heading="So funktioniert der E-Bike-Reichweiten-Rechner">
        <p>
          Kein Wert an einem E-Bike wird so oft schöngerechnet wie die Reichweite. Bosch,
          Shimano und Yamaha nennen Zahlen von 100 bis 250 km — gemessen in Eco-Modus, auf
          flacher Strecke, bei 20 °C mit 70 kg Fahrer. In der Realität kommen selten mehr als
          40–60 % davon an.
        </p>

        <h3>Formel</h3>
        <p>
          <strong>km = Akku-Wh / Verbrauch [Wh/km]</strong>. Der Verbrauch startet bei
          Bosch-typischen Werten (Eco 6, Tour 8,5, Sport 11,5, Turbo 16 Wh/km) und wird
          multiplikativ korrigiert: Profilfaktor (flach 1,0 · hügelig 1,25 · bergig 1,55),
          Gewichtsfaktor (~1,2 % pro kg Abweichung von 80 kg), Wind (~1,5 % pro km/h Gegenwind
          über 5), Temperatur (bei 0 °C bis +25 %).
        </p>

        <h3>Beispieltabelle (500 Wh Akku, 85 kg Systemgewicht)</h3>
        <table>
          <thead><tr><th>Modus</th><th>Flach</th><th>Hügelig</th><th>Bergig</th></tr></thead>
          <tbody>
            <tr><td>Eco</td><td>78 km</td><td>62 km</td><td>50 km</td></tr>
            <tr><td>Tour</td><td>55 km</td><td>44 km</td><td>36 km</td></tr>
            <tr><td>Sport</td><td>41 km</td><td>33 km</td><td>26 km</td></tr>
            <tr><td>Turbo</td><td>29 km</td><td>23 km</td><td>19 km</td></tr>
          </tbody>
        </table>

        <h3>Was der Rechner nicht abbildet</h3>
        <ul>
          <li>Akku-Alter (nach 500 Vollzyklen ~85 %, nach 1000 ~70 % Rest-Kapazität).</li>
          <li>Reifen-Rollwiderstand (leichtlaufender Marathon spart ca. 5 % gegenüber Ballon-Reifen).</li>
          <li>Stop-and-Go im Stadtverkehr (jeder Neustart aus dem Stand kostet ~5 Wh).</li>
          <li>Motorspezifische Effizienz-Unterschiede (Bosch CX vs. Shimano EP8 vs. Yamaha PW-X3).</li>
        </ul>

        <h3>Tipps für mehr Reichweite</h3>
        <p>
          Die einfachsten Hebel: niedrigerer Modus (Eco statt Tour spart ~30 %), höhere
          Trittfrequenz (90 U/min statt 70 spart 10–15 %), 0,3 bar weniger Reifendruck auf
          rauem Belag, saubere Antriebs-Wartung. Ein Zweit-Akku bringt in der Praxis mehr als
          jede Fahrstil-Optimierung — bei Tages­touren über 100 km ohne Steckdose führt kein
          Weg daran vorbei.
        </p>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
