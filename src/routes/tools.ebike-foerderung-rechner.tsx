import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HandCoins, ExternalLink } from "lucide-react";
import {
  ToolShell,
  ToolCard,
  ToolLabel,
  ToolSelect,
} from "@/components/tools/ToolShell";
import { ToolReviewedBy, ToolFaq, ToolSeoSection } from "@/components/tools/ToolSeo";
import { toolHead } from "@/lib/tools/seo";

const SLUG = "ebike-foerderung-rechner";

const FAQ = [
  {
    question: "Gibt es 2026 noch bundesweite E-Bike-Förderung für Privatpersonen?",
    answer:
      "Nein. Das bundesweite BAFA-Programm für Lastenräder ist ausgelaufen. Aktuell fördert der Bund gewerbliche Lastenräder über die KfW und indirekt private Räder über die 0,25-%-Dienstrad-Regelung. Zuschüsse für Privatpersonen kommen aus Bundesländern und Kommunen.",
  },
  {
    question: "Muss ich vor dem Kauf einen Antrag stellen?",
    answer:
      "Fast immer ja. Die meisten Kommunen (Berlin, München, Hamburg, Stuttgart) fordern einen Antrag mit Kostenvoranschlag vor dem Kaufvertrag. Wer nach dem Kauf beantragt, verliert den Anspruch. Ausnahmen: Dienstrad-Leasing läuft ohne separaten Antrag.",
  },
  {
    question: "Kann ich mehrere Förderungen kombinieren?",
    answer:
      "In der Regel nicht. Kommunale Programme schließen eine Doppelförderung mit Bundes- oder Länderprogrammen fast immer aus. Die einzige stabile Kombination: Dienstrad-Leasing + kommunaler Zuschuss ist meist erlaubt, wenn du Restwert übernimmst.",
  },
];

type Foerderung = {
  state: string;
  title: string;
  what: string;
  amount: string;
  conditions: string;
  url: string;
};

const F: Foerderung[] = [
  { state: "Bundesweit", title: "Dienstrad-Leasing (Gehaltsumwandlung)", what: "Bis zu 40 % Ersparnis vs. Barkauf", amount: "0,25-%-Regel", conditions: "Arbeitgeber bietet Leasing an (JobRad, Bikeleasing, Eurorad u. a.).", url: "https://www.bmf.gv.at/themen/steuern.html" },
  { state: "Bundesweit", title: "KfW-Förderung für Lastenräder (gewerblich)", what: "Bis 2.500 € pro Lastenrad", amount: "max. 25 % der Anschaffungskosten", conditions: "Nur für Unternehmen, Kommunen, Vereine.", url: "https://www.bafa.de" },
  { state: "Berlin", title: "Lastenrad-Förderung", what: "Privat & gewerblich", amount: "bis 1.000 €", conditions: "Wohnsitz/Sitz in Berlin, max. 33 % der Kosten.", url: "https://www.berlin.de/sen/uvk/mobilitaet-und-verkehr/verkehrsplanung/radverkehr/foerderung-lastenraeder/" },
  { state: "Nordrhein-Westfalen", title: "NRW: Lastenfahrrad-Förderung", what: "Privatpersonen & Kleinunternehmen", amount: "bis 2.100 €", conditions: "Antrag vor Kauf, Eigenanteil mind. 30 %.", url: "https://www.bra.nrw.de/umwelt-arbeitsschutz/elektromobilitaet/foerderung-lastenfahrraeder" },
  { state: "Bayern", title: "München: Lastenrad-Zuschuss", what: "Privat & Gewerbe", amount: "bis 1.000 €", conditions: "Wohnsitz München, max. 25 % der Kosten.", url: "https://stadt.muenchen.de/infos/foerderung-lastenrad.html" },
  { state: "Baden-Württemberg", title: "Stuttgart: Lastenrad-Förderung", what: "Privat & gewerblich", amount: "bis 1.000 €", conditions: "Hauptwohnsitz/Sitz in Stuttgart.", url: "https://www.stuttgart.de/leben/mobilitaet/rad/lastenrad-foerderung.php" },
  { state: "Hamburg", title: "Hamburg: Lastenrad-Förderung", what: "Privat & Gewerbe", amount: "bis 2.000 € (gewerblich), bis 800 € privat", conditions: "Hauptwohnsitz/Sitz Hamburg, Antrag vor Kauf.", url: "https://www.hamburg.de/lastenrad-foerderung/" },
  { state: "Hessen", title: "Frankfurt: Lastenrad-Förderung", what: "Privat & gewerblich", amount: "bis 1.000 €", conditions: "Wohnsitz/Sitz in Frankfurt.", url: "https://frankfurt.de/themen/umwelt-und-gruen/aktuelles/foerderung-lastenraeder" },
  { state: "Sachsen", title: "Dresden: Lastenrad-Bonus", what: "Privat", amount: "bis 500 €", conditions: "Hauptwohnsitz Dresden, max. 25 % der Kosten.", url: "https://www.dresden.de/de/leben/mobilitaet/lastenrad-foerderung.php" },
  { state: "Rheinland-Pfalz", title: "Mainz: Lastenrad-Förderung", what: "Privat & gewerblich", amount: "bis 1.000 €", conditions: "Wohnsitz/Sitz Mainz.", url: "https://www.mainz.de/verwaltung-und-politik/foerdermittel/lastenrad-foerderung.php" },
];

const STATES = ["Alle", "Bundesweit", "Berlin", "Nordrhein-Westfalen", "Bayern", "Baden-Württemberg", "Hamburg", "Hessen", "Sachsen", "Rheinland-Pfalz"];

export const Route = createFileRoute("/tools/ebike-foerderung-rechner")({
  head: () =>
    toolHead({
      title: "E-Bike & Lastenrad-Förderung 2026: Zuschüsse nach Bundesland",
      description:
        "Aktuelle Übersicht der Förderprogramme für E-Bikes, Lastenräder und Dienstrad-Leasing — Berlin, NRW, Bayern, Hamburg u. a. Kuratiert von der radmap.de-Redaktion.",
      path: "/tools/ebike-foerderung-rechner",
      slug: SLUG,
      faq: FAQ,
    }),
  component: FoerderungPage,
});

function FoerderungPage() {
  const [state, setState] = useState("Alle");
  const filtered = useMemo(
    () => (state === "Alle" ? F : F.filter((x) => x.state === state || x.state === "Bundesweit")),
    [state],
  );

  return (
    <ToolShell
      eyebrow="Kaufberatung · 03"
      title="Förderungs-Finder"
      description="Lastenrad-Prämien, JobRad-Vorteile und Bundesländer-Zuschüsse. Wer suchen kann, spart oft vierstellig."
      icon={HandCoins}
    >
      <ToolReviewedBy slug={SLUG} />

      <ToolCard className="mt-6 mb-6">
        <div className="max-w-sm">
          <ToolLabel>Bundesland / Region</ToolLabel>
          <ToolSelect value={state} onChange={(e) => setState(e.target.value)}>
            {STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </ToolSelect>
        </div>
      </ToolCard>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((f, i) => (
          <ToolCard key={i}>
            <div className="text-[10px] uppercase tracking-[0.18em] text-signal">{f.state}</div>
            <h2 className="mt-2 font-display text-lg font-bold tracking-tight">{f.title}</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <div><span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Förderung: </span><span className="font-semibold">{f.what}</span></div>
              <div><span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Höhe: </span><span className="font-mono font-bold text-signal">{f.amount}</span></div>
              <div><span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Voraussetzung: </span><span className="text-muted-foreground">{f.conditions}</span></div>
            </div>
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-signal hover:underline">
              Zum Antrag <ExternalLink className="h-3 w-3" />
            </a>
          </ToolCard>
        ))}
      </div>

      <ToolSeoSection slug={SLUG} heading="E-Bike- und Lastenrad-Förderung in Deutschland 2026">
        <p>
          Die Förderlandschaft für Fahrräder in Deutschland ist zersplittert: der Bund
          konzentriert sich seit 2024 auf gewerbliche Lastenräder und die Dienstrad-Leasing-
          Steuerregel, während private E-Bike- und Cargo-Zuschüsse fast ausschließlich von
          Bundesländern und Kommunen kommen. Die Programme laufen oft nur wenige Monate und
          werden ohne Vorankündigung überzeichnet.
        </p>

        <h3>Bundesweite Programme</h3>
        <ul>
          <li><strong>Dienstrad-Leasing (0,25-%-Regel):</strong> für alle Angestellten mit
          Rahmenvertrag beim Arbeitgeber. Ersparnis 25–40 % vs. Barkauf. Kein Antrag nötig.</li>
          <li><strong>KfW-Förderung für gewerbliche Lastenräder:</strong> bis 2.500 € pro Rad,
          nur Unternehmen, Kommunen, Vereine.</li>
          <li><strong>Umsatzsteuer-Rückerstattung:</strong> Selbstständige können die MwSt auf
          betrieblich genutzte Räder abziehen.</li>
        </ul>

        <h3>Kommunale Lastenrad-Prämien (Auswahl)</h3>
        <table>
          <thead><tr><th>Stadt/Region</th><th>Höhe</th><th>Zielgruppe</th></tr></thead>
          <tbody>
            <tr><td>NRW</td><td>bis 2.100 €</td><td>privat + gewerblich</td></tr>
            <tr><td>Hamburg</td><td>bis 2.000 € gew. / 800 € privat</td><td>privat + gewerblich</td></tr>
            <tr><td>Berlin</td><td>bis 1.000 €</td><td>privat + gewerblich</td></tr>
            <tr><td>München</td><td>bis 1.000 €</td><td>privat + gewerblich</td></tr>
            <tr><td>Stuttgart</td><td>bis 1.000 €</td><td>privat + gewerblich</td></tr>
            <tr><td>Frankfurt</td><td>bis 1.000 €</td><td>privat + gewerblich</td></tr>
            <tr><td>Dresden</td><td>bis 500 €</td><td>privat</td></tr>
          </tbody>
        </table>

        <h3>So gehst du vor</h3>
        <ol>
          <li>Prüfe die Website deiner Stadt/deines Bundeslandes auf aktuelle Programme.</li>
          <li>Fordere beim Händler einen schriftlichen Kostenvoranschlag an.</li>
          <li>Stelle den Antrag <strong>vor</strong> dem Kauf und warte die Bewilligung ab.</li>
          <li>Nach Bewilligung: Kauf tätigen, Rechnung einreichen, Auszahlung erfolgt meist 4–8 Wochen später.</li>
        </ol>

        <h3>Typische Fehler</h3>
        <ul>
          <li>Antrag nach dem Kauf → automatischer Ausschluss.</li>
          <li>Doppelförderung → in fast allen Programmen verboten.</li>
          <li>Rad nicht förderfähig (z. B. S-Pedelec statt Pedelec 25).</li>
          <li>Wohnsitz-Nachweis fehlt oder Zweitwohnsitz statt Hauptwohnsitz.</li>
        </ul>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
