import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HandCoins, ExternalLink } from "lucide-react";
import {
  ToolShell,
  ToolCard,
  ToolLabel,
  ToolSelect,
  ToolDisclaimer,
} from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/foerderung")({
  head: () =>
    toolHead({
      title: "Förderungs-Finder für Fahrrad & E-Bike",
      description:
        "Welche Zuschüsse und Prämien gibt es in deinem Bundesland für E-Bike, Lastenrad oder JobRad? Kuratierte Übersicht.",
      path: "/tools/foerderung",
    }),
  component: FoerderungPage,
});

type Foerderung = {
  state: string;
  title: string;
  what: string;
  amount: string;
  conditions: string;
  url: string;
};

const F: Foerderung[] = [
  {
    state: "Bundesweit",
    title: "Dienstrad-Leasing (Gehaltsumwandlung)",
    what: "Bis zu 40 % Ersparnis vs. Barkauf",
    amount: "0,25-%-Regel",
    conditions: "Arbeitgeber bietet Leasing an (JobRad, Bikeleasing, Eurorad u. a.).",
    url: "https://www.bmf.gv.at/themen/steuern.html",
  },
  {
    state: "Bundesweit",
    title: "KfW-Förderung für Lastenräder (gewerblich)",
    what: "Bis 2.500 € pro Lastenrad",
    amount: "max. 25 % der Anschaffungskosten",
    conditions: "Nur für Unternehmen, Kommunen, Vereine.",
    url: "https://www.bafa.de",
  },
  {
    state: "Berlin",
    title: "Lastenrad-Förderung",
    what: "Privat & gewerblich",
    amount: "bis 1.000 €",
    conditions: "Wohnsitz/Sitz in Berlin, max. 33 % der Kosten.",
    url: "https://www.berlin.de/sen/uvk/mobilitaet-und-verkehr/verkehrsplanung/radverkehr/foerderung-lastenraeder/",
  },
  {
    state: "Nordrhein-Westfalen",
    title: "NRW: Lastenfahrrad-Förderung",
    what: "Privatpersonen & Kleinunternehmen",
    amount: "bis 2.100 €",
    conditions: "Antrag vor Kauf, Eigenanteil mind. 30 %.",
    url: "https://www.bra.nrw.de/umwelt-arbeitsschutz/elektromobilitaet/foerderung-lastenfahrraeder",
  },
  {
    state: "Bayern",
    title: "München: Lastenrad-Zuschuss",
    what: "Privat & Gewerbe",
    amount: "bis 1.000 €",
    conditions: "Wohnsitz München, max. 25 % der Kosten.",
    url: "https://stadt.muenchen.de/infos/foerderung-lastenrad.html",
  },
  {
    state: "Baden-Württemberg",
    title: "Stuttgart: Lastenrad-Förderung",
    what: "Privat & gewerblich",
    amount: "bis 1.000 €",
    conditions: "Hauptwohnsitz/Sitz in Stuttgart.",
    url: "https://www.stuttgart.de/leben/mobilitaet/rad/lastenrad-foerderung.php",
  },
  {
    state: "Hamburg",
    title: "Hamburg: Lastenrad-Förderung",
    what: "Privat & Gewerbe",
    amount: "bis 2.000 € (gewerblich), bis 800 € privat",
    conditions: "Hauptwohnsitz/Sitz Hamburg, Antrag vor Kauf.",
    url: "https://www.hamburg.de/lastenrad-foerderung/",
  },
  {
    state: "Hessen",
    title: "Frankfurt: Lastenrad-Förderung",
    what: "Privat & gewerblich",
    amount: "bis 1.000 €",
    conditions: "Wohnsitz/Sitz in Frankfurt.",
    url: "https://frankfurt.de/themen/umwelt-und-gruen/aktuelles/foerderung-lastenraeder",
  },
  {
    state: "Sachsen",
    title: "Dresden: Lastenrad-Bonus",
    what: "Privat",
    amount: "bis 500 €",
    conditions: "Hauptwohnsitz Dresden, max. 25 % der Kosten.",
    url: "https://www.dresden.de/de/leben/mobilitaet/lastenrad-foerderung.php",
  },
  {
    state: "Rheinland-Pfalz",
    title: "Mainz: Lastenrad-Förderung",
    what: "Privat & gewerblich",
    amount: "bis 1.000 €",
    conditions: "Wohnsitz/Sitz Mainz.",
    url: "https://www.mainz.de/verwaltung-und-politik/foerdermittel/lastenrad-foerderung.php",
  },
];

const STATES = ["Alle", "Bundesweit", "Berlin", "Nordrhein-Westfalen", "Bayern", "Baden-Württemberg", "Hamburg", "Hessen", "Sachsen", "Rheinland-Pfalz"];

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
      <ToolCard className="mb-6">
        <div className="max-w-sm">
          <ToolLabel>Bundesland / Region</ToolLabel>
          <ToolSelect value={state} onChange={(e) => setState(e.target.value)}>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </ToolSelect>
        </div>
      </ToolCard>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((f, i) => (
          <ToolCard key={i}>
            <div className="text-[10px] uppercase tracking-[0.18em] text-signal">{f.state}</div>
            <h2 className="mt-2 font-display text-lg font-bold tracking-tight">{f.title}</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <div>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Förderung: </span>
                <span className="font-semibold">{f.what}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Höhe: </span>
                <span className="font-mono font-bold text-signal">{f.amount}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Voraussetzung: </span>
                <span className="text-muted-foreground">{f.conditions}</span>
              </div>
            </div>
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-signal hover:underline"
            >
              Zum Antrag <ExternalLink className="h-3 w-3" />
            </a>
          </ToolCard>
        ))}
      </div>

      <ToolDisclaimer>
        Programme ändern sich häufig. Vor dem Kauf direkt beim Anbieter prüfen — viele
        Förderungen müssen <strong>vor</strong> dem Kauf beantragt werden. Stand: 2025.
        Kein Anspruch auf Vollständigkeit.
      </ToolDisclaimer>
    </ToolShell>
  );
}
