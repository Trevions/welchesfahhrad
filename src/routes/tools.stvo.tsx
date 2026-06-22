import { createFileRoute } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/stvo")({
  head: () =>
    toolHead({
      title: "StVO für Radfahrer — die wichtigsten Regeln",
      description:
        "Radwegpflicht, Ampeln, Einbahnstraßen, Promille, Beleuchtung, Handy — die wichtigsten StVO- und StVZO-Regeln für Radfahrer auf einen Blick.",
      path: "/tools/stvo",
    }),
  component: StvoPage,
});

const sections: { id: string; title: string; rule: string; source: string }[] = [
  {
    id: "radweg",
    title: "Radwegpflicht — wann musst du, wann darfst du?",
    rule:
      "Pflicht nur, wenn Radwegschild (Zeichen 237, 240 oder 241) steht. Sonst freie Wahl zwischen Fahrbahn und Radweg, sofern dieser für deine Richtung benutzbar ist. Bordstein-Radwege ohne Schild sind freiwillig.",
    source: "§ 2 Abs. 4 StVO",
  },
  {
    id: "ampel",
    title: "Welche Ampel gilt für mich?",
    rule:
      "Seit 2017: Radfahrer auf der Fahrbahn richten sich nach der Auto-Ampel. Auf separatem Radweg gilt — falls vorhanden — die Radampel, sonst die Fußgängerampel. Eine reine Fußgängerampel bindet auch dich, wenn du den Gehweg/Radweg querst.",
    source: "§ 37 Abs. 2 StVO",
  },
  {
    id: "einbahn",
    title: "Einbahnstraße in Gegenrichtung",
    rule:
      "Nur erlaubt mit Zusatzschild „Radfahrer frei" (Z 1000-32) unter dem Einbahnstraßen-Schild. Schritttempo nicht vorgeschrieben, aber vorausschauend fahren — Autofahrer rechnen nicht mit dir.",
    source: "§ 41 StVO Anlage 2",
  },
  {
    id: "gehweg",
    title: "Gehweg & Fußgängerzone",
    rule:
      "Grundsätzlich verboten. Ausnahmen: Kinder bis 8 Jahre müssen, bis 10 dürfen den Gehweg nutzen; eine Begleitperson ab 16 darf seit 2016 ebenfalls mit. „Fahrrad frei" in der Fußgängerzone heißt: Schritttempo und Fußgänger haben Vorrang.",
    source: "§ 2 Abs. 5 StVO",
  },
  {
    id: "licht",
    title: "Beleuchtung — was ist Pflicht?",
    rule:
      "Frontscheinwerfer (weiß, mind. 10 Lux), Rücklicht (rot), Reflektoren vorn (weiß), hinten (rot Z), an den Pedalen (gelb) und entweder Speichenreflektoren oder reflektierende Reifen/Speichen-Aufkleber. Batterie- und Akkulampen sind erlaubt, müssen aber StVZO-Zulassung haben (K-Nummer).",
    source: "§ 67 StVZO",
  },
  {
    id: "klingel",
    title: "Klingel",
    rule:
      "Pflicht. Eine helltönende Glocke; Hupen und Pfeifen sind nicht zulässig. Bei E-Bikes mit Pedelec-Status ändert sich daran nichts.",
    source: "§ 64a StVZO",
  },
  {
    id: "promille",
    title: "Alkohol am Rad",
    rule:
      "0,3 ‰ relative Fahruntüchtigkeit bei Auffälligkeiten (Schlangenlinien, Unfall). 1,6 ‰ absolute Fahruntüchtigkeit — Straftat, oft inklusive MPU und Führerschein-Entzug. Auch ohne Auto-Führerschein wird geahndet.",
    source: "§§ 315c, 316 StGB",
  },
  {
    id: "handy",
    title: "Handy & Kopfhörer",
    rule:
      "Handy in der Hand: 55 € Bußgeld. Kopfhörer sind erlaubt, sofern Lautstärke das Hören von Verkehrsgeräuschen nicht beeinträchtigt — sonst Verwarnung möglich.",
    source: "§ 23 Abs. 1a StVO",
  },
  {
    id: "kinder",
    title: "Kinder & Anhänger",
    rule:
      "Kindertransport bis 7 Jahre nur in geeigneten Sitzen oder Anhängern, mit Fahrer ab 16 Jahren. Kindersitz braucht Speichenschutz und feste Rückenlehne.",
    source: "§ 21 Abs. 3 StVO",
  },
  {
    id: "nebeneinander",
    title: "Nebeneinander fahren",
    rule:
      "Seit 2020 ausdrücklich erlaubt, wenn der Verkehr dadurch nicht behindert wird. Auf engen Straßen oder bei Überholern hintereinander fahren.",
    source: "§ 2 Abs. 4 Satz 2 StVO",
  },
];

function StvoPage() {
  return (
    <ToolShell
      eyebrow="Recht · 01"
      title="StVO für Radfahrer"
      description="Die wichtigsten Regeln auf einen Blick — mit Quelle aus StVO und StVZO. Stand: aktuelle Fassung."
      icon={Scale}
    >
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="lg:sticky lg:top-24 lg:self-start">
          <ToolCard>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Sprungmarken
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-muted-foreground transition-colors hover:text-signal"
                  >
                    {s.title.split(" — ")[0]}
                  </a>
                </li>
              ))}
            </ul>
          </ToolCard>
        </nav>

        <div className="grid gap-4">
          {sections.map((s) => (
            <ToolCard key={s.id}>
              <div id={s.id} className="scroll-mt-24">
                <h2 className="font-display text-lg font-bold tracking-tight">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.rule}</p>
                <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-signal">
                  Quelle: {s.source}
                </div>
              </div>
            </ToolCard>
          ))}
        </div>
      </div>

      <ToolDisclaimer>
        Diese Übersicht ersetzt keine Rechtsberatung. Bei Unfall oder Anzeige immer einen
        Anwalt für Verkehrsrecht hinzuziehen. Volltexte: gesetze-im-internet.de/stvo und stvzo.
      </ToolDisclaimer>
    </ToolShell>
  );
}
