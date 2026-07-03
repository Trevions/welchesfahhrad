import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Gauge, Bike, AlertTriangle } from "lucide-react";
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
import { useBikeProfile } from "@/lib/bike-profile";
import {
  calculatePressure,
  type Setup,
  type Style,
  type Surface,
  type UseCase,
  type WheelSize,
} from "@/lib/tools/reifendruck";

const SLUG = "reifendruck-rechner";

const FAQ = [
  {
    question: "Warum fährt das Vorderrad weniger Druck als das Hinterrad?",
    answer:
      "Auf dem Rad liegt typischerweise nur 40 % des Systemgewichts auf dem Vorderrad, 60 % hinten. Weniger Last = weniger Druck ist nötig, um die gleiche Reifendurchbiegung (≈ 15 % nach Frank Berto) zu erreichen. Ergebnis: mehr Grip vorne, mehr Sicherheit in Kurven und bei Nässe.",
  },
  {
    question: "Was ist der maximale Reifendruck, den ich fahren darf?",
    answer:
      "Nie höher als der niedrigere Wert von: Reifenflanke, Felgen-Maximum, Herstellerangabe. Steht widersprüchliche Zahlen auf Reifen und Felge, gilt die kleinere. Unser Rechner cappt das Ergebnis automatisch auf einen bautypisch sicheren Maximaldruck.",
  },
  {
    question: "Muss ich vor jeder Ausfahrt den Druck prüfen?",
    answer:
      "Ja — vor allem Rennrad-Butyl-Schläuche verlieren pro Tag rund 0,3–0,5 bar, Latex sogar 1 bar. Tubeless mit Dichtmilch ist stabiler, aber auch nicht druckstabil. Wer regelmäßig fährt, sollte 1× pro Woche mit einer Standpumpe mit Manometer korrigieren.",
  },
  {
    question: "Wie ändert sich der Druck bei Regen?",
    answer:
      "Bei nasser Fahrbahn 0,2–0,3 bar unter deinem Trocken-Setup fahren. Der Reifen wird weicher, die Aufstandsfläche größer, das Aquaplaning-Risiko sinkt. Wichtiger als der Druck bleibt die Reifenwahl mit ausgeprägter Mittelrille.",
  },
  {
    question: "Ist Tubeless immer besser?",
    answer:
      "Für Gravel, MTB und moderne Rennreifen ab 28 mm: klar ja. Weniger Rollwiderstand bei niedrigerem Druck, Dichtmilch verschließt kleine Löcher sofort, kein Snakebite-Risiko. Für schmale Rennreifen unter 25 mm oder alte Felgen ohne Hakenprofil bleibt Butyl-Schlauch der einfachere Weg.",
  },
];

export const Route = createFileRoute("/tools/reifendruck-rechner")({
  head: () =>
    toolHead({
      title: "Reifendruck-Rechner: Optimaler Luftdruck fürs Fahrrad",
      description:
        "Reifendruck-Rechner für Rennrad, Gravel, MTB, Trekking, E-Bike und Cargo — nach Frank-Berto- und SRAM-Methodik. Vorn und hinten getrennt in bar und psi, mit Achslast-Korrektur.",
      path: "/tools/reifendruck-rechner",
      slug: SLUG,
      faq: FAQ,
    }),
  component: ReifendruckPage,
});

function ReifendruckPage() {
  const profile = useBikeProfile();
  const [weight, setWeight] = useState<number>(profile?.weightKg ?? 85);
  const [width, setWidth] = useState<number>(profile?.tire?.widthMm ?? 32);
  const [wheelSize, setWheelSize] = useState<WheelSize>("700c");
  const [useCase, setUseCase] = useState<UseCase>("gravel");
  const [surface, setSurface] = useState<Surface>("mixed");
  const [setup, setSetup] = useState<Setup>("tubeless");
  const [style, setStyle] = useState<Style>("balanced");
  const [frontLoad, setFrontLoad] = useState<number>(40);
  const [maxP, setMaxP] = useState<number>(0);

  const prefilled = !!profile && (profile.weightKg != null || profile.tire?.widthMm != null);

  const r = useMemo(
    () =>
      calculatePressure({
        systemWeightKg: weight,
        tireWidthMm: width,
        wheelSize,
        useCase,
        surface,
        setup,
        style,
        frontLoadPct: frontLoad,
        maxManufacturerBar: maxP || null,
      }),
    [weight, width, wheelSize, useCase, surface, setup, style, frontLoad, maxP],
  );

  return (
    <ToolShell
      eyebrow="Rechner · 01"
      title="Reifendruck-Rechner"
      description="Der optimale Luftdruck für dein Fahrrad — vorn und hinten getrennt, angelehnt an Frank Berto (15 %-Regel) und SRAM-Empfehlungen. Für Rennrad, Gravel, MTB, Trekking, E-Bike und Cargo."
      icon={Gauge}
    >
      <ToolReviewedBy slug={SLUG} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Eingaben</h2>
          {prefilled && (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Bike className="h-3 w-3 text-signal" />
              Vorausgefüllt aus deinem{" "}
              <Link to="/mein-rad" className="underline hover:text-foreground">
                RadProfil
              </Link>
            </p>
          )}
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>Systemgewicht (Fahrer + Rad + Gepäck, kg)</ToolLabel>
              <ToolInput type="number" min={30} max={250} value={weight} onChange={(e) => setWeight(+e.target.value || 0)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <ToolLabel>Reifenbreite (mm)</ToolLabel>
                <ToolInput type="number" min={20} max={75} value={width} onChange={(e) => setWidth(+e.target.value || 0)} />
              </div>
              <div>
                <ToolLabel>Laufradgröße</ToolLabel>
                <ToolSelect value={wheelSize} onChange={(e) => setWheelSize(e.target.value as WheelSize)}>
                  <option value="700c">28" / 700C</option>
                  <option value="650b">27,5" / 650B</option>
                  <option value="26">26"</option>
                  <option value="20">20" (Kompakt/Cargo)</option>
                </ToolSelect>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <ToolLabel>Einsatzbereich</ToolLabel>
                <ToolSelect value={useCase} onChange={(e) => setUseCase(e.target.value as UseCase)}>
                  <option value="road">Straße / Rennrad</option>
                  <option value="gravel">Gravel</option>
                  <option value="mtb">MTB</option>
                  <option value="trekking">Trekking</option>
                  <option value="ebike">E-Bike</option>
                  <option value="cargo">Lastenrad</option>
                </ToolSelect>
              </div>
              <div>
                <ToolLabel>Untergrund</ToolLabel>
                <ToolSelect value={surface} onChange={(e) => setSurface(e.target.value as Surface)}>
                  <option value="smooth">Glatter Asphalt</option>
                  <option value="rough">Rauer Asphalt</option>
                  <option value="gravel">Schotter</option>
                  <option value="mixed">Gemischt</option>
                  <option value="mtb">Trail</option>
                </ToolSelect>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <div>
              <ToolLabel>Achslast vorne ({frontLoad} % / hinten {100 - frontLoad} %)</ToolLabel>
              <input
                type="range"
                min={25}
                max={55}
                step={1}
                value={frontLoad}
                onChange={(e) => setFrontLoad(+e.target.value)}
                className="mt-3 w-full accent-signal"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Default 40/60 (Standard Rennrad/Trekking). Cargo mit Front-Ladung eher 45/55, MTB mit
                weit hinten sitzendem Fahrer 35/65.
              </p>
            </div>
            <div>
              <ToolLabel>Hersteller-Maximaldruck (bar, optional)</ToolLabel>
              <ToolInput
                type="number"
                min={0}
                max={12}
                step={0.1}
                value={maxP || ""}
                placeholder="z. B. 6.0 (steht auf der Reifenflanke)"
                onChange={(e) => setMaxP(+e.target.value || 0)}
              />
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Empfehlung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ToolResultStat label="Vorderrad" value={r.front} unit="bar" hint={`${r.frontPsi} psi`} />
            <ToolResultStat label="Hinterrad" value={r.rear} unit="bar" hint={`${r.rearPsi} psi`} />
          </div>

          {r.warnings.length > 0 && (
            <div className="mt-5 space-y-2">
              {r.warnings.map((w, i) => (
                <div
                  key={i}
                  className={
                    "flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed " +
                    (w.level === "danger"
                      ? "border-red-500/50 bg-red-500/10 text-red-800 dark:text-red-200"
                      : w.level === "warn"
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                      : "border-border bg-background/40 text-muted-foreground")
                  }
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>{w.text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Empfohlenes Druckband</strong> für {width} mm bei
              {" "}{weight} kg: {r.band.min}–{r.band.max} bar (Sicherheits-Cap: {r.hardCap} bar).
            </p>
            <p>
              <strong className="text-foreground">So testest du:</strong> mit dem unteren Wert
              starten. Walkt der Reifen in Kurven oder fühlt sich der Lenker schwammig an, in
              0,2-bar-Schritten erhöhen. Bei Nässe 0,2–0,3 bar weniger fahren.
            </p>
          </div>

          <details className="mt-6 rounded-xl border border-border bg-background/40 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Methodik & Quellen
            </summary>
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                Basis: <strong className="text-foreground">Frank Berto</strong> (15 %-Reifen­durch­biegung
                bei Zielgewicht) und Druckempfehlungen aus dem SRAM Tire Pressure Guide sowie
                Silca-Tabellen. Ausgangs­band pro Reifenbreite kommt aus der internen Tabelle
                (Referenz 75 kg, 700C).
              </p>
              <p>
                Schritte: (1) Bandmitte aus Reifenbreite, (2) Laufrad-Faktor (kleiner = mehr Druck),
                (3) Achslast-Verteilung ergibt Front- und Rear-Basis, (4) linearer Berto-Faktor
                ~0,9 % pro kg Achslast-Abweichung von der Referenz, (5) Untergrund-, Setup- und
                Fahrstil-Bias, (6) Einsatz-Bias (E-Bike/Cargo/Trekking), (7) Cap auf bautypisches
                Maximum und Hersteller-Grenze.
              </p>
              <p>
                Die Reifenflanken-Angabe und die Felgen-Freigabe haben immer Vorrang. Zuletzt
                fachlich geprüft: siehe Redaktions-Datum oben.
              </p>
            </div>
          </details>
        </ToolCard>
      </div>

      <ToolSafetyDisclaimer />

      <ToolSeoSection slug={SLUG} heading="So funktioniert der Reifendruck-Rechner">
        <p>
          Der richtige Reifendruck ist der billigste Tuning-Hebel am Fahrrad. Zu hoher Druck macht
          den Reifen schnell, aber hart, unruhig und rutschig — vor allem in Kurven und bei
          Nässe. Zu niedriger Druck kostet Rollwiderstand, riskiert Snakebites und beschädigt bei
          Aufsetzern die Felge. Der Sweet-Spot liegt genau dort, wo der Reifen bei deinem
          Systemgewicht rund 15 % einfedert — das ist die klassische Faustformel von Frank Berto,
          die auch die SRAM-Tabellen und der Silca-Rechner verwenden.
        </p>

        <h3>Was in die Berechnung einfließt</h3>
        <p>
          Der Rechner nimmt dein <strong>Systemgewicht</strong> (Fahrer + Rad + Gepäck),
          {" "}<strong>Reifenbreite</strong> in mm, <strong>Laufradgröße</strong>,
          {" "}<strong>Einsatzbereich</strong>, den <strong>Untergrund</strong>, das
          {" "}<strong>Reifen-Setup</strong> (Tubeless, Butyl-Schlauch oder Latex-Schlauch), deinen
          {" "}<strong>Fahrstil</strong> und die <strong>Gewichtsverteilung</strong> vorne/hinten.
          Der Achslast-Anteil ersetzt den früher üblichen Pauschal-Delta von 10 % zwischen vorne
          und hinten — bei einem MTB-Fahrer, der weit hinten sitzt, kann der reale Unterschied
          deutlich größer werden, bei einem Front-Loader-Cargo dagegen fast verschwinden.
        </p>

        <h3>Beispiel-Empfehlungen (75 kg Systemgewicht, Tubeless, gemischter Untergrund)</h3>
        <table>
          <thead>
            <tr>
              <th>Reifenbreite</th>
              <th>Vorderrad</th>
              <th>Hinterrad</th>
              <th>Anwendung</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>25 mm</td><td>5,4 bar</td><td>6,0 bar</td><td>Rennrad Straße</td></tr>
            <tr><td>28 mm</td><td>4,4 bar</td><td>5,0 bar</td><td>Rennrad Endurance</td></tr>
            <tr><td>32 mm</td><td>3,6 bar</td><td>4,2 bar</td><td>Rennrad rauer Belag</td></tr>
            <tr><td>40 mm</td><td>2,3 bar</td><td>2,8 bar</td><td>Gravel</td></tr>
            <tr><td>50 mm</td><td>1,7 bar</td><td>2,1 bar</td><td>MTB XC / Trekking</td></tr>
            <tr><td>60 mm</td><td>1,4 bar</td><td>1,7 bar</td><td>MTB Trail / All-Mountain</td></tr>
          </tbody>
        </table>

        <h3>Warum das Vorderrad weniger Druck bekommt</h3>
        <p>
          Auf einem klassischen Sitz-Setup ruhen etwa 40 % des Systemgewichts auf dem Vorderrad
          und 60 % hinten. Damit beide Reifen die gleiche Einfederung erreichen, muss der weniger
          belastete Reifen weicher gefahren werden. Ein Vorderrad mit dem gleichen Druck wie hinten
          fühlt sich hart und untersteuernd an, verliert bei Nässe früh Grip und übersetzt jede
          Fahrbahnwelle in den Lenker.
        </p>

        <h3>Tubeless, Latex, Butyl — was macht das aus?</h3>
        <p>
          <strong>Tubeless</strong> kommt ohne Schlauch aus. Damit fällt der reibungserhöhende
          Schlauch weg, und der Reifen kann 0,3–0,5 bar weniger fahren als mit Butyl — mehr Grip
          und weniger Rollwiderstand gleichzeitig. Auch das Snakebite-Risiko entfällt. Dichtmilch
          verschließt Löcher bis rund 3 mm sofort. <strong>Latex-Schläuche</strong> sind
          reibungsärmer als Butyl, verlieren aber schnell Druck (bis 1 bar pro Tag) und sind
          empfindlicher gegen scharfe Kanten. <strong>Butyl-Schläuche</strong> sind der robuste,
          druckstabile Standard — die einzige echte Empfehlung für Alltag ohne Prüf-Ritual.
        </p>

        <h3>E-Bike und Cargo: warum mehr Druck nötig ist</h3>
        <p>
          Ein Bosch-Antrieb wiegt mit Akku und Displayeinheit rund 5–8 kg, ein Lastenrad-Rahmen
          samt Kiste weitere 15–25 kg. Diese Massen belasten den Reifen dauerhaft, auch wenn du
          nicht draufsitzt. Der Rechner fügt für diese Einsatz­bereiche 0,25 bzw. 0,35 bar Bias
          hinzu — ein E-Bike mit 32 mm Reifen und 90 kg Fahrer läuft dadurch nicht wie ein
          klassisches Trekkingrad, sondern etwas härter, was Snakebites vermeidet.
        </p>

        <h3>Typische Fehler</h3>
        <ul>
          <li>Immer den Maximaldruck der Reifenflanke fahren — verschenkt Grip und Komfort komplett.</li>
          <li>Vorne und hinten den gleichen Druck — führt zu ungleichmäßigem Verschleiß und wenig Vorderrad-Grip.</li>
          <li>Druck nur einmal pro Monat kontrollieren — Butyl verliert 0,3 bar am Tag, Latex 1 bar.</li>
          <li>Bei Nässe unverändert weiterfahren — 0,2–0,3 bar weniger machen den Unterschied.</li>
          <li>Herstellerangabe ignorieren — das bautypische Reifenmaximum steht auf der Flanke und hat Vorrang.</li>
        </ul>

        <h3>Quellenlage und Methodik</h3>
        <p>
          Die Formel ist angelehnt an Frank Bertos „15 %-Regel" (siehe Bicycle Quarterly, 2006),
          den <a href="https://sram.com" rel="noopener">SRAM Tire Pressure Guide</a> und das
          Silca-Modell. Die Achslast-Korrektur ist ein linearer Berto-Term (~0,9 % Druck pro kg
          Abweichung von der Referenz), das Laufradgrößen-Delta stammt aus den
          Schwalbe-Empfehlungen. Sicherheits-Caps aus einer internen Tabelle bautypischer
          Maximaldrücke pro Reifenbreite.
        </p>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
