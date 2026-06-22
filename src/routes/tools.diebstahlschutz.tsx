import { createFileRoute } from "@tanstack/react-router";
import { Lock, ShieldCheck, MapPin, Tag, AlertTriangle } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/diebstahlschutz")({
  head: () =>
    toolHead({
      title: "Diebstahlschutz fürs Fahrrad",
      description:
        "Welches Schloss schützt wirklich? Wie stellst du dein Rad richtig ab? Codierung, Versicherung und die Sicherheitsstufen von ART, Sold Secure und VdS erklärt.",
      path: "/tools/diebstahlschutz",
    }),
  component: DiebstahlPage,
});

const locks = [
  {
    type: "Bügelschloss",
    pro: "Höchster mechanischer Widerstand, kompakt, schwer zu knacken.",
    con: "Wenig Bewegungsspielraum beim Anschließen.",
    score: "★★★★★",
    best: "Stadt, Pendeln, hochwertige Räder",
  },
  {
    type: "Faltschloss",
    pro: "Flexibel, leicht transportierbar, gute Sicherheit.",
    con: "Gelenke können angegriffen werden.",
    score: "★★★★",
    best: "Tagestour, mittlere Räder",
  },
  {
    type: "Kettenschloss",
    pro: "Großer Anschluss-Radius, hohes Gewicht = Abschreckung.",
    con: "Schwer (2–3 kg), unhandlich.",
    score: "★★★★",
    best: "Stehen über Nacht, Cargo-Bikes",
  },
  {
    type: "Rahmenschloss",
    pro: "Immer am Rad, schnell verschließbar.",
    con: "Nur Blockade — Rad lässt sich tragen.",
    score: "★★",
    best: "Nur als Ergänzung",
  },
  {
    type: "Spiralkabel",
    pro: "Leicht, billig.",
    con: "In Sekunden durchtrennt — kein echter Schutz.",
    score: "★",
    best: "Niemals als Hauptschloss",
  },
];

const ratings = [
  { org: "ART", scale: "1–5 Sterne", note: "Niederländischer Standard, gilt in DE als Versicherer-Maßstab. Ab 2 Sterne empfehlenswert, ab 3 Pflicht für teure Räder." },
  { org: "Sold Secure", scale: "Bronze / Silver / Gold / Diamond", note: "UK-Standard, in DE zunehmend verbreitet." },
  { org: "VdS", scale: "Klasse A1–A3", note: "Deutscher VdS-Standard, primär für Versicherer." },
];

function DiebstahlPage() {
  return (
    <ToolShell
      eyebrow="Recht · 03"
      title="Diebstahlschutz"
      description="In Deutschland werden über 250.000 Fahrräder pro Jahr gestohlen. Das richtige Schloss und die richtige Abstell-Technik halbieren dein Risiko."
      icon={Lock}
    >
      <div className="grid gap-6">
        <ToolCard>
          <h2 className="font-display text-xl font-bold tracking-tight">Schlossarten im Vergleich</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="py-2 pr-3">Typ</th>
                  <th className="py-2 pr-3">Sicherheit</th>
                  <th className="py-2 pr-3">Vorteil</th>
                  <th className="py-2 pr-3">Nachteil</th>
                  <th className="py-2 pr-3">Empfehlung</th>
                </tr>
              </thead>
              <tbody>
                {locks.map((l) => (
                  <tr key={l.type} className="border-b border-border/50">
                    <td className="py-3 pr-3 font-bold">{l.type}</td>
                    <td className="py-3 pr-3 text-signal">{l.score}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{l.pro}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{l.con}</td>
                    <td className="py-3 pr-3">{l.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ToolCard>

        <div className="grid gap-6 md:grid-cols-2">
          <ToolCard>
            <ShieldCheck className="h-5 w-5 text-signal" />
            <h2 className="mt-3 font-display text-lg font-bold tracking-tight">Sicherheitsstufen</h2>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              {ratings.map((r) => (
                <li key={r.org}>
                  <div className="font-semibold text-foreground">{r.org} — {r.scale}</div>
                  <div>{r.note}</div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              <strong className="text-foreground">Faustregel:</strong> Schloss = 10 % vom Radwert.
            </p>
          </ToolCard>

          <ToolCard>
            <MapPin className="h-5 w-5 text-signal" />
            <h2 className="mt-3 font-display text-lg font-bold tracking-tight">Richtig abstellen</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. <strong className="text-foreground">Rahmen + Vorderrad</strong> an einen festen, dicken Pfosten anschließen.</li>
              <li>2. Schloss <strong className="text-foreground">möglichst hoch</strong> anbringen (kein Hebel am Boden).</li>
              <li>3. Schloss <strong className="text-foreground">möglichst eng</strong> (keine Lücke für Werkzeug).</li>
              <li>4. <strong className="text-foreground">Sichtbarer Ort</strong> mit Publikumsverkehr.</li>
              <li>5. <strong className="text-foreground">Sattel & Quick-Release</strong> sichern (Klemmschrauben mit Spezialkopf).</li>
            </ul>
          </ToolCard>

          <ToolCard>
            <Tag className="h-5 w-5 text-signal" />
            <h2 className="mt-3 font-display text-lg font-bold tracking-tight">Codierung</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ADFC und Polizei codieren Räder mit einem persönlichen Code in den Rahmen (gravieren oder lasern).
              Gestohlene Räder lassen sich so eindeutig zuordnen — und schrecken Hehler ab.
              Termine bei ADFC-Landesverband oder bei Polizei-Aktionstagen.
            </p>
          </ToolCard>

          <ToolCard>
            <AlertTriangle className="h-5 w-5 text-signal" />
            <h2 className="mt-3 font-display text-lg font-bold tracking-tight">Versicherung</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hausratversicherung deckt Diebstahl nur „aus verschlossenen Räumen". Fahrräder draußen
              brauchen die Klausel „Fahrraddiebstahl" (oft 1–3 % der Versicherungssumme) oder
              eine eigenständige Fahrradversicherung. Bei E-Bikes über 3.000 € meist Pflicht.
            </p>
          </ToolCard>
        </div>
      </div>

      <ToolDisclaimer>
        Quellen: ADFC, GDV-Studie 2023, ART-/VdS-Prüfberichte. Keine Versicherungs- oder
        Rechtsberatung.
      </ToolDisclaimer>
    </ToolShell>
  );
}
