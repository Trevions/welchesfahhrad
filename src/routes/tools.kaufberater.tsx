import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, RotateCw } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/kaufberater")({
  head: () =>
    toolHead({
      title: "Kaufberater-Quiz: Welches Fahrrad passt zu dir?",
      description:
        "In sieben Fragen zum passenden Fahrradtyp — Citybike, Trekking, Gravel, Rennrad, MTB oder E-Bike. Mit Begründung und Artikel-Empfehlungen.",
      path: "/tools/kaufberater",
    }),
  component: QuizPage,
});

type Answer = {
  purpose: "commute" | "tour" | "sport" | "fun" | "transport";
  distance: "short" | "medium" | "long";
  surface: "city" | "mixed" | "gravel" | "trail";
  budget: "low" | "mid" | "high";
  ebike: "yes" | "no" | "maybe";
  cargo: "none" | "some" | "lots";
  fitness: "low" | "medium" | "high";
};

const QUESTIONS: { key: keyof Answer; q: string; opts: { v: string; label: string }[] }[] = [
  { key: "purpose", q: "Wofür nutzt du das Rad hauptsächlich?", opts: [
    { v: "commute", label: "Pendeln zur Arbeit / Schule" },
    { v: "tour", label: "Touren am Wochenende" },
    { v: "sport", label: "Sport & Training" },
    { v: "fun", label: "Freizeit & Familie" },
    { v: "transport", label: "Transport von Kindern / Einkauf" },
  ]},
  { key: "distance", q: "Wie viele Kilometer pro typischer Fahrt?", opts: [
    { v: "short", label: "< 10 km" },
    { v: "medium", label: "10–30 km" },
    { v: "long", label: "> 30 km" },
  ]},
  { key: "surface", q: "Auf welchem Untergrund vor allem?", opts: [
    { v: "city", label: "Asphalt in der Stadt" },
    { v: "mixed", label: "Mix aus Straße und Radweg" },
    { v: "gravel", label: "Auch Schotter und Feldwege" },
    { v: "trail", label: "Wald und Trails" },
  ]},
  { key: "budget", q: "Welches Budget hast du?", opts: [
    { v: "low", label: "< 1.500 €" },
    { v: "mid", label: "1.500 – 3.500 €" },
    { v: "high", label: "> 3.500 €" },
  ]},
  { key: "ebike", q: "Möchtest du elektrische Unterstützung?", opts: [
    { v: "yes", label: "Ja, unbedingt" },
    { v: "maybe", label: "Vielleicht" },
    { v: "no", label: "Nein, klassisch" },
  ]},
  { key: "cargo", q: "Wie viel transportierst du?", opts: [
    { v: "none", label: "Nichts" },
    { v: "some", label: "Rucksack / kleine Tasche" },
    { v: "lots", label: "Kinder / großer Einkauf / Gepäck" },
  ]},
  { key: "fitness", q: "Wie sportlich fährst du?", opts: [
    { v: "low", label: "Entspannt" },
    { v: "medium", label: "Mittel" },
    { v: "high", label: "Sportlich-ambitioniert" },
  ]},
];

type Result = { type: string; why: string; href?: string };

function decide(a: Partial<Answer>): Result {
  const wantsEbike = a.ebike === "yes" || (a.ebike === "maybe" && (a.fitness === "low" || a.cargo === "lots"));
  if (a.purpose === "transport" || a.cargo === "lots") {
    return {
      type: wantsEbike ? "Cargo-E-Bike (Lastenrad)" : "Lastenrad",
      why: "Du transportierst viel oder Kinder — ein Lastenrad oder Cargo-E-Bike ist hier alternativlos.",
    };
  }
  if (a.surface === "trail") {
    return {
      type: wantsEbike ? "E-MTB (Fully oder Hardtail)" : "Mountainbike",
      why: "Wald und Trail brauchen breite Reifen und Federung. Bei Höhenmetern und Anstiegen lohnt sich E-MTB.",
    };
  }
  if (a.purpose === "sport" && a.surface === "city") {
    return {
      type: "Rennrad",
      why: "Sportliche Asphalt-Kilometer sind die Domäne des Rennrads.",
    };
  }
  if (a.surface === "gravel" || (a.purpose === "tour" && a.distance === "long")) {
    return {
      type: wantsEbike ? "E-Gravel oder E-Trekking" : "Gravelbike",
      why: "Asphalt plus Schotter, längere Strecken — der vielseitigste Allrounder ist ein Gravelbike.",
    };
  }
  if (a.purpose === "tour" || a.distance === "long") {
    return {
      type: wantsEbike ? "E-Trekkingrad" : "Trekkingrad",
      why: "Komfort, Gepäckträger, Beleuchtung — Trekkingräder sind die robusten Allrounder für Touren.",
    };
  }
  if (a.purpose === "commute" || a.purpose === "fun") {
    return {
      type: wantsEbike ? "E-Citybike / Urban-E-Bike" : "Citybike / Urban Bike",
      why: "Aufrechte Sitzposition, alltagstauglich, ohne Schnickschnack. Für Wege bis 15 km perfekt.",
    };
  }
  return { type: "Trekkingrad", why: "Vielseitig und alltagstauglich." };
}

function QuizPage() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Partial<Answer>>({});

  const result = useMemo(
    () => (step >= QUESTIONS.length ? decide(ans) : null),
    [step, ans],
  );

  const reset = () => {
    setAns({});
    setStep(0);
  };

  if (result) {
    return (
      <ToolShell
        eyebrow="Kaufberatung · 01"
        title="Kaufberater-Quiz"
        description="Dein Ergebnis"
        icon={Sparkles}
      >
        <ToolCard>
          <div className="text-[10px] uppercase tracking-[0.18em] text-signal">Empfehlung</div>
          <h2 className="mt-2 font-display text-4xl font-black italic leading-[1.05] tracking-tight">
            {result.type}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{result.why}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/ratgeber"
              className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-signal-foreground"
            >
              Passende Artikel ansehen
            </Link>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm hover:bg-card"
            >
              <RotateCw className="h-4 w-4" /> Quiz wiederholen
            </button>
          </div>
        </ToolCard>
        <ToolDisclaimer>
          Empfehlungen basieren auf typischen Einsatzprofilen. Probefahrt vor dem Kauf bleibt
          unverzichtbar — Geometrie und Sitzposition entscheiden über den Spaß.
        </ToolDisclaimer>
      </ToolShell>
    );
  }

  const current = QUESTIONS[step];
  const pct = Math.round((step / QUESTIONS.length) * 100);

  return (
    <ToolShell
      eyebrow="Kaufberatung · 01"
      title="Kaufberater-Quiz"
      description="Sieben Fragen. Eine Empfehlung."
      icon={Sparkles}
    >
      <ToolCard className="mb-6">
        <div className="flex items-end justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Frage {step + 1} von {QUESTIONS.length}</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background/60">
          <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${pct}%` }} />
        </div>
      </ToolCard>

      <ToolCard>
        <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">{current.q}</h2>
        <div className="mt-5 grid gap-2">
          {current.opts.map((o) => (
            <button
              key={o.v}
              onClick={() => {
                setAns((a) => ({ ...a, [current.key]: o.v as never }));
                setStep((s) => s + 1);
              }}
              className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background/40 px-4 py-3.5 text-left text-sm transition-colors hover:border-signal/60 hover:bg-card"
            >
              <span>{o.label}</span>
              <span className="text-signal opacity-0 transition-opacity group-hover:opacity-100">→</span>
            </button>
          ))}
        </div>
        {step > 0 && (
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground"
          >
            ← Zurück
          </button>
        )}
      </ToolCard>
    </ToolShell>
  );
}
