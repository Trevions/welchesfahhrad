import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Activity, CloudSun, ArrowRight } from "lucide-react";
import { ToolShell, ToolCard } from "@/components/tools/ToolShell";
import { ToolFaq, ToolSeoSection } from "@/components/tools/ToolSeo";
import { toolHead } from "@/lib/tools/seo";

const SLUG = "radel-score-guide";

const FAQ = [
  {
    question: "Warum zeigt die Wetter-Leiste jetzt die gleiche Zahl wie der Radel-Score-Badge?",
    answer:
      "Beide nutzen dieselbe Formel (computeRadelScore) mit identischen Eingaben aus useBikeWeather — Niederschlag der nächsten 1–3 Stunden, Wind, Böen, gefühlte Temperatur, Feuchte, Minuten bis Sonnenuntergang. Die Zahl in der Leiste und im Badge sind deshalb immer identisch.",
  },
  {
    question: "Was bedeuten die Farben?",
    answer:
      "Grün (85–100) Perfekt, Limette (70–84) Sehr gut, Bernstein (50–69) Okay, Orange (30–49) Mäßig, Rot (0–29) Schlecht. Bei ≤ 2 °C mit Regen/Feuchte wird der Score automatisch auf max. 25 gedeckelt (Glätte-Override).",
  },
  {
    question: "Wo sehe ich die genauen Abzüge?",
    answer:
      "Auf der Tool-Seite /tools/radel-score. Dort listet der Breakdown jeden Abzug einzeln (z. B. „Wind 26 km/h → −10“) und schlägt die besten Fahrzeiten der nächsten 12 Stunden vor.",
  },
];

export const Route = createFileRoute("/tools/radel-score-guide")({
  head: () =>
    toolHead({
      title: "Radel-Score & Wetter-Badge richtig nutzen",
      description:
        "Anleitung: Wie du den Radel-Score und die Wetter-Leiste auf radmap.de zusammen liest — mit Farb-Legende, konkreten Beispielen und typischen Fahr-Entscheidungen.",
      path: "/tools/radel-score-guide",
      slug: SLUG,
      faq: FAQ,
    }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <ToolShell
      eyebrow="Anleitung"
      title="Radel-Score & Wetter-Badge nutzen"
      description="So liest du die beiden Anzeigen auf der Startseite zusammen — und triffst in 3 Sekunden die richtige Entscheidung: fahren, warten oder umplanen."
      icon={BookOpen}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <ToolCard>
          <div className="flex items-center gap-2 text-signal">
            <CloudSun className="h-4 w-4" />
            <span className="eyebrow-sm">Wetter-Leiste</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-black tracking-tight">
            Was oben in der Leiste steht
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>· Emoji + aktuelle Temperatur</li>
            <li>· Ort (dein Standort, gekürzt)</li>
            <li>· Wind & Regenwahrscheinlichkeit (Desktop)</li>
            <li>· Der Radel-Score (identisch mit dem Badge)</li>
          </ul>
          <p className="mt-4 text-sm text-foreground/90">
            Tippe auf die Leiste, um die 12-Stunden-Vorschau und ausführliche Tipps zu öffnen.
          </p>
        </ToolCard>

        <ToolCard>
          <div className="flex items-center gap-2 text-signal">
            <Activity className="h-4 w-4" />
            <span className="eyebrow-sm">Radel-Score-Badge</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-black tracking-tight">
            Der Ein-Blick-Indikator
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>· Farbpunkt zeigt die Kategorie (grün → rot)</li>
            <li>· Zahl 0–100 fasst alle Faktoren zusammen</li>
            <li>· Steht direkt neben „Eco Route Planner“</li>
          </ul>
          <Link
            to="/tools/radel-score"
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-signal hover:underline"
          >
            Score-Breakdown öffnen <ArrowRight className="h-3 w-3" />
          </Link>
        </ToolCard>
      </div>

      <ToolSeoSection slug={SLUG} heading="Drei Beispiele aus dem Alltag">
        <h3>Beispiel 1 — „88 · Sehr gut“ bei 22 °C, leichter Wind, 10 % Regen</h3>
        <p>
          Wetter-Leiste zeigt <strong>22°</strong>, Badge zeigt <strong>88</strong> (grün).
          Entscheidung: <strong>losfahren</strong>. Normale Ausrüstung reicht, keine
          Schutzbleche nötig. Wenn du eine lange Tour planst — perfekter Tag.
        </p>

        <h3>Beispiel 2 — „54 · Okay“ bei 18 °C, 28 km/h Wind, 45 % Regen</h3>
        <p>
          Der Score fällt in den bernsteinfarbenen Bereich. Öffne die Wetter-Leiste
          (12-Stunden-Vorschau) oder die Radel-Score-Seite, um zu prüfen, wann sich das
          Wetter beruhigt. Regenjacke einpacken und Route so wählen, dass der Wind
          auf dem Hinweg gegen dich läuft — auf dem Rückweg bist du müder.
        </p>

        <h3>Beispiel 3 — „22 · Schlecht“ bei 1 °C, 60 % Regen, 92 % Feuchte</h3>
        <p>
          Glätte-Override greift: Score ist auf max. 25 begrenzt, auch wenn andere
          Faktoren gut wären. Rot bedeutet hier <strong>nicht fahren</strong> — oder
          nur mit Spikes-Reifen und äußerster Vorsicht in Kurven. Ideal für einen
          Wartungstag: siehe <Link to="/tools/wartungsintervalle">Wartungsintervalle</Link>.
        </p>

        <h3>So arbeiten Leiste und Badge zusammen</h3>
        <ol>
          <li>
            <strong>Badge zuerst lesen</strong> — Farbe + Zahl geben in unter einer
            Sekunde die Grundrichtung.
          </li>
          <li>
            <strong>Bei Gelb/Orange die Leiste antippen</strong> — dort siehst du,
            welcher Faktor stört (Wind? Regenschauer in 2 Std?).
          </li>
          <li>
            <strong>Bei Bedarf zum Breakdown springen</strong> — die
            <Link to="/tools/radel-score"> Radel-Score-Seite </Link> zeigt jeden
            einzelnen Abzug und die besten Fahrzeiten der nächsten 12 Stunden.
          </li>
        </ol>

        <h3>Warum die Zahlen jetzt identisch sind</h3>
        <p>
          Früher zeigte die Wetter-Leiste einen einfacheren „Bike-Score“, während der
          neue Radel-Score-Badge eine feinere Formel benutzte — die Zahlen konnten sich
          um 3–5 Punkte unterscheiden. Seit dem letzten Update rechnen beide mit
          derselben Funktion (<code>computeRadelScore</code>), aus denselben
          Wetterdaten. Ein Blick, eine Zahl, eine Aussage.
        </p>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
