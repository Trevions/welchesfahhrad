import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Flame } from "lucide-react";
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

const SLUG = "kalorien-rechner";

const FAQ = [
  {
    question: "Wie genau sind die berechneten Kalorien?",
    answer:
      "Die MET-Methode ist wissenschaftlich fundiert, hat aber ±15 % Streuung. Trainingszustand, Effizienz, Wind und Sitzposition beeinflussen den tatsächlichen Verbrauch. Für Trainingsplanung reicht die Genauigkeit; für Ernährungsprotokolle immer den Trend über mehrere Wochen betrachten, nicht einzelne Werte.",
  },
  {
    question: "Warum verbraucht Radfahren weniger als Laufen?",
    answer:
      "Weil das Rad das Körpergewicht trägt — beim Laufen musst du bei jedem Schritt gegen die Schwerkraft arbeiten. Deshalb liegen die MET-Werte fürs Radfahren bei 4–12, fürs Laufen bei 8–18. Für den gleichen Kalorienverbrauch musst du auf dem Rad meist doppelt so lange unterwegs sein.",
  },
  {
    question: "Ab wann brauche ich unterwegs Kohlenhydrate?",
    answer:
      "Der Glykogen-Speicher reicht rund 60–90 Minuten intensiver Belastung. Ab einer Stunde Fahrt sind 30–60 g Kohlenhydrate pro Stunde sinnvoll (Riegel, Banane, Iso-Getränk), ab drei Stunden 60–90 g/h. Wer den Hungerast einmal hatte, packt beim nächsten Mal mehr ein.",
  },
  {
    question: "Wie viel Wasser sollte ich trinken?",
    answer:
      "Faustregel: 500–750 ml pro Stunde bei moderatem Wetter, bis zu 1 l/h bei Hitze über 25 °C. Wichtig ist regelmäßiges Trinken — alle 15 min ein paar Schlucke — nicht ein Liter auf einmal. Bei Touren über zwei Stunden zusätzlich Elektrolyte.",
  },
];

export const Route = createFileRoute("/tools/kalorien-rechner")({
  head: () =>
    toolHead({
      title: "Kalorien-Rechner Radfahren: Verbrauch berechnen",
      description:
        "Kalorienverbrauch beim Radfahren nach MET-Methode (Compendium of Physical Activities) — inklusive Kohlenhydrat- und Wasserempfehlung nach ACSM-Standard.",
      path: "/tools/kalorien-rechner",
      slug: SLUG,
      faq: FAQ,
    }),
  component: KalorienPage,
});

type Intensity = "easy" | "moderate" | "brisk" | "hard" | "race";
const MET: Record<Intensity, { label: string; met: number; kmh: string }> = {
  easy: { label: "Locker (< 16 km/h)", met: 4.0, kmh: "< 16" },
  moderate: { label: "Tour (16–19 km/h)", met: 6.8, kmh: "16–19" },
  brisk: { label: "Zügig (19–22 km/h)", met: 8.0, kmh: "19–22" },
  hard: { label: "Sportlich (22–25 km/h)", met: 10.0, kmh: "22–25" },
  race: { label: "Rennen / > 25 km/h", met: 12.0, kmh: "> 25" },
};

function KalorienPage() {
  const [weight, setWeight] = useState(80);
  const [minutes, setMinutes] = useState(90);
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [climb, setClimb] = useState(300);

  const result = useMemo(() => {
    const hours = minutes / 60;
    const base = MET[intensity].met * weight * hours;
    const climbKcal = (climb / 100) * 9 * (weight / 70);
    const kcal = Math.round(base + climbKcal);
    const kj = Math.round(kcal * 4.184);
    const carbs = Math.round(Math.max(0, hours - 0.5) * 60);
    const water = Math.round(hours * 500);
    return { kcal, kj, carbs, water };
  }, [weight, minutes, intensity, climb]);

  return (
    <ToolShell
      eyebrow="Rechner · 05"
      title="Kalorien-Rechner"
      description="Wie viel Energie kostet deine Tour wirklich? Wissenschaftlich auf Basis von MET-Werten — inklusive Empfehlung für Verpflegung und Trinken."
      icon={Flame}
    >
      <ToolReviewedBy slug={SLUG} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Deine Tour</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Körpergewicht (kg)</ToolLabel>
              <ToolInput type="number" value={weight} onChange={(e) => setWeight(+e.target.value || 0)} />
            </div>
            <div>
              <ToolLabel>Dauer (Minuten)</ToolLabel>
              <ToolInput type="number" value={minutes} onChange={(e) => setMinutes(+e.target.value || 0)} />
            </div>
            <div>
              <ToolLabel>Intensität</ToolLabel>
              <ToolSelect value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)}>
                {(Object.keys(MET) as Intensity[]).map((k) => (
                  <option key={k} value={k}>{MET[k].label}</option>
                ))}
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Höhenmeter (gesamt)</ToolLabel>
              <ToolInput type="number" value={climb} onChange={(e) => setClimb(+e.target.value || 0)} />
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Energie & Verpflegung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ToolResultStat label="Verbrauch" value={result.kcal} unit="kcal" />
            <ToolResultStat label="In Kilojoule" value={result.kj} unit="kJ" />
            <ToolResultStat label="Kohlenhydrate" value={result.carbs} unit="g" hint="ab 60 min · 60 g/h" />
            <ToolResultStat label="Wasser" value={result.water} unit="ml" hint="500 ml/h Faustregel" />
          </div>
        </ToolCard>
      </div>

      <ToolSeoSection slug={SLUG} heading="So funktioniert der Kalorien-Rechner">
        <p>
          Der Rechner nutzt die <strong>MET-Methode</strong> (Metabolic Equivalent of Task) aus
          dem Compendium of Physical Activities (Ainsworth et al., 2011) — der wissenschaftliche
          Standard zur Schätzung des Energieverbrauchs bei körperlicher Aktivität. Ein MET
          entspricht dem Ruheumsatz von ca. 1 kcal pro kg Körpergewicht und Stunde.
        </p>

        <h3>Formel</h3>
        <p>
          <strong>kcal = MET × Körpergewicht [kg] × Dauer [h]</strong>. MET-Werte für Radfahren:
          4,0 (locker &lt; 16 km/h), 6,8 (Tour 16–19), 8,0 (zügig 19–22), 10,0 (sportlich 22–25),
          12,0 (Rennen &gt; 25). Zusätzlich kalkulieren wir einen <strong>Höhenmeter-Zuschlag</strong>
          {" "}nach der Pendel-Näherung: ~9 kcal pro 100 hm und 70 kg Fahrer.
        </p>

        <h3>Beispiel-Werte (80 kg Fahrer)</h3>
        <table>
          <thead><tr><th>Tour</th><th>Dauer</th><th>hm</th><th>kcal</th></tr></thead>
          <tbody>
            <tr><td>Pendelfahrt locker</td><td>30 min</td><td>50</td><td>170</td></tr>
            <tr><td>Feierabend-Runde</td><td>90 min</td><td>300</td><td>844</td></tr>
            <tr><td>Sonntags-Rennrad</td><td>3 h</td><td>800</td><td>2482</td></tr>
            <tr><td>Alpen-Tagestour</td><td>6 h</td><td>2000</td><td>4685</td></tr>
          </tbody>
        </table>

        <h3>Verpflegung und Trinken (ACSM-Standard)</h3>
        <ul>
          <li><strong>Kohlenhydrate:</strong> ab 60 min Belastung 30–60 g/h, ab 3 h 60–90 g/h.</li>
          <li><strong>Wasser:</strong> 500–750 ml/h moderat, bis 1 l/h bei Hitze &gt; 25 °C.</li>
          <li><strong>Elektrolyte:</strong> ab 90 min Fahrt oder starkem Schwitzen — Na, K, Mg über Iso-Getränke oder Salztabletten.</li>
          <li><strong>Nach der Fahrt:</strong> innerhalb 30 min Kohlenhydrate + 20 g Protein zur Regeneration.</li>
        </ul>

        <h3>Was der Rechner nicht kann</h3>
        <p>
          Kein Ersatz für ein Wattmess-System oder einen Herzfrequenz-Messer. Trainingszustand,
          Fahrposition, Windschatten und Rollwiderstand verändern den Energieverbrauch
          erheblich. Für seriöse Trainings- oder Ernährungsplanung eignet sich der Rechner als
          Näherung — für Wettkampf-Ernährung führt kein Weg an gemessenen Werten vorbei.
        </p>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
