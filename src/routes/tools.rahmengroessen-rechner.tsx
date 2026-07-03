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
} from "@/components/tools/ToolShell";
import {
  ToolReviewedBy,
  ToolSafetyDisclaimer,
  ToolFaq,
  ToolSeoSection,
} from "@/components/tools/ToolSeo";
import { toolHead } from "@/lib/tools/seo";

const SLUG = "rahmengroessen-rechner";

const FAQ = [
  {
    question: "Welche Angabe ist wichtiger: Körpergröße oder Schrittlänge?",
    answer:
      "Die Schrittlänge. Zwei Menschen mit 180 cm Körpergröße haben oft 5–7 cm Unterschied in der Schrittlänge — und der Rahmen muss zum Bein passen, nicht zur Rumpflänge. Deshalb rechnen wir primär mit der Innenbeinlänge.",
  },
  {
    question: "Was mache ich, wenn ich zwischen zwei Größen liege?",
    answer:
      "Sportlich orientierte Fahrer wählen im Zweifel den kleineren Rahmen (kürzerer Reach, agiler), Touren-Fahrer den größeren (aufrechter, ruhiger). Bei kurzem Oberkörper und langen Beinen tendenziell kleiner, bei langem Oberkörper eher größer.",
  },
  {
    question: "Warum sagen die Marken unterschiedliche Größen?",
    answer:
      "Rahmengrößen sind bis heute nicht genormt. Trek, Specialized, Canyon und Cube messen Reach/Stack/Sitzrohr auf leicht andere Weise. Nutze unseren Rechner als Startpunkt und vergleiche dann mit dem Geometrie-Datenblatt des konkreten Modells.",
  },
  {
    question: "Ist ein Bikefitting sinnvoll?",
    answer:
      "Ab 200 € Investition oder bei täglichen Fahrten deutlich über 30 min: ja. Ein guter Bikefitter misst Beweglichkeit, Sitzknochen, Kniewinkel und passt Sattel, Vorbau und Cleats individuell an. Der Rechner ersetzt das nicht — er verhindert nur den falschen Rahmen.",
  },
];

export const Route = createFileRoute("/tools/rahmengroessen-rechner")({
  head: () =>
    toolHead({
      title: "Rahmengrößen-Rechner: passende Rahmenhöhe berechnen",
      description:
        "Rahmengrößen-Rechner nach Schrittlänge — Rennrad, MTB, Trekking, Gravel, City. Ergebnis in cm, Zoll und Konfektionsgröße. Angelehnt an Hinault/LeMond und Steve Hogg.",
      path: "/tools/rahmengroessen-rechner",
      slug: SLUG,
      faq: FAQ,
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
      description="Die richtige Rahmenhöhe entscheidet über Komfort, Effizienz und Sicherheit. Wir berechnen sie aus deiner Schrittlänge und dem Radtyp."
      icon={Ruler}
    >
      <ToolReviewedBy slug={SLUG} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Deine Maße</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Körpergröße (cm)</ToolLabel>
              <ToolInput type="number" min={140} max={220} value={height} onChange={(e) => setHeight(+e.target.value || 0)} />
            </div>
            <div>
              <ToolLabel>Schrittlänge / Innenbeinlänge (cm)</ToolLabel>
              <ToolInput type="number" min={60} max={110} value={inseam} onChange={(e) => setInseam(+e.target.value || 0)} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Barfuß an die Wand, Buch bis zum Schritt drücken — vom Boden bis zur Buchoberkante messen.
              </p>
            </div>
            <div>
              <ToolLabel>Radtyp</ToolLabel>
              <ToolSelect value={type} onChange={(e) => setType(e.target.value as Type)}>
                {(Object.keys(FACTORS) as Type[]).map((k) => (
                  <option key={k} value={k}>{FACTORS[k].label}</option>
                ))}
              </ToolSelect>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Empfehlung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ToolResultStat label="Rahmenhöhe" value={result.primary} unit={result.primaryUnit} />
            <ToolResultStat label="In cm" value={result.cm} unit="cm" />
            <ToolResultStat label="Konfektion" value={result.size} />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Faktoren angelehnt an Hinault/LeMond (Rennrad) und Steve Hogg (MTB). Formel:
            Schrittlänge × {FACTORS[type].factor} ({FACTORS[type].label}). Konfektionsgröße
            ist markenübergreifende Näherung.
          </p>
        </ToolCard>
      </div>

      <ToolSafetyDisclaimer>
        <strong className="font-semibold">Wichtig:</strong> Rahmengeometrien unterscheiden sich
        zwischen Marken erheblich. Vor dem Kauf immer das konkrete Geometrie-Datenblatt prüfen
        und im Zweifel Probe fahren. Hersteller-Empfehlung hat Vorrang.
      </ToolSafetyDisclaimer>

      <ToolSeoSection slug={SLUG} heading="So funktioniert der Rahmengrößen-Rechner">
        <p>
          Ein zu großer Rahmen führt zu Rückenschmerzen und unsauberer Kraftübertragung, ein zu
          kleiner Rahmen zu instabilem Lenkverhalten und Knieproblemen. Die Rahmenhöhe ist die
          Grundlage — Sattel, Vorbau und Lenker lassen sich nachträglich anpassen, der Rahmen
          nicht. Deshalb ist die richtige Größe die wichtigste Kaufentscheidung.
        </p>

        <h3>Formel und Methodik</h3>
        <p>
          Wir rechnen nach der klassischen Formel <strong>Rahmenhöhe = Schrittlänge × Faktor</strong>.
          Der Faktor stammt aus jahrzehntelanger Bikefit-Praxis: 0,665 für Rennrad (Bernard Hinault
          & Greg LeMond), 0,226 für MTB in Zoll (Steve Hogg), 0,66 für Trekking, 0,67 für Gravel,
          0,685 für aufrechte City-Rahmen. Das Ergebnis ist ein sinnvoller Startpunkt — nicht mehr.
        </p>

        <h3>Beispieltabelle (Rennrad, Faktor 0,665)</h3>
        <table>
          <thead>
            <tr><th>Körpergröße</th><th>Schrittlänge (typisch)</th><th>Rahmenhöhe</th><th>Konfektion</th></tr>
          </thead>
          <tbody>
            <tr><td>165 cm</td><td>76 cm</td><td>50,5 cm</td><td>XS/S</td></tr>
            <tr><td>172 cm</td><td>80 cm</td><td>53,2 cm</td><td>S</td></tr>
            <tr><td>178 cm</td><td>83 cm</td><td>55,2 cm</td><td>M</td></tr>
            <tr><td>184 cm</td><td>86 cm</td><td>57,2 cm</td><td>M/L</td></tr>
            <tr><td>190 cm</td><td>90 cm</td><td>59,9 cm</td><td>L</td></tr>
            <tr><td>195 cm</td><td>93 cm</td><td>61,8 cm</td><td>XL</td></tr>
          </tbody>
        </table>

        <h3>Warum die Konfektionsgröße nur eine Näherung ist</h3>
        <p>
          Ein „Medium"-Rennrad hat bei Trek 54 cm Sitzrohr, bei Cervélo 56 cm, bei Canyon werden
          Rahmen inzwischen fast nur noch nach <strong>Reach</strong> und <strong>Stack</strong>
          klassifiziert. Reach beschreibt die horizontale, Stack die vertikale Distanz vom
          Tretlager zur Oberkante Steuersatz — moderne Bikefits arbeiten fast ausschließlich mit
          diesen zwei Werten, weil sie unabhängig von Sattelrohr-Länge und Rahmenform sind.
        </p>

        <h3>Was der Rechner nicht kann</h3>
        <ul>
          <li>Beweglichkeit und Rumpflänge messen (dafür Bikefitting).</li>
          <li>Sitzknochen-Abstand für die Sattelbreite bestimmen.</li>
          <li>Cleat-Position und Kniewinkel prüfen.</li>
          <li>Marken-spezifische Geometrien vergleichen (dafür Reach/Stack-Vergleich).</li>
        </ul>

        <h3>Fazit</h3>
        <p>
          Der Rechner liefert die Rahmenhöhe, mit der du bei einer Testfahrt starten solltest.
          Bei Sportlern eher kleinerer Rahmen (sportlich, agil), bei Tourenfahrern eher größerer
          Rahmen (aufrecht, ruhig). Der letzte Schritt bleibt: <strong>Probefahrt</strong>.
        </p>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
