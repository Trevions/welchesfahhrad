// Redaktionell kuratierte Verlinkung von Tool-Seiten auf 2–3 passende
// Ratgeber-Artikel. Slugs müssen in der `articles`-Tabelle existieren; wenn
// nicht, zeigt <ToolSeoSection> den Link mit dem hier hinterlegten Titel und
// führt ins Leere — das ist im Zweifel besser als kein Signal für Google.

export type RelatedLink = { slug: string; title: string };

export const RELATED: Record<string, RelatedLink[]> = {
  "reifendruck-rechner": [
    { slug: "reifendruck-rennrad-gravel-mtb-richtig-einstellen", title: "Reifendruck richtig einstellen: Rennrad, Gravel & MTB" },
    { slug: "tubeless-umruesten-anleitung", title: "Tubeless umrüsten — Schritt-für-Schritt-Anleitung" },
    { slug: "reifenpannen-vermeiden", title: "Reifenpannen vermeiden: 7 Regeln aus der Werkstatt" },
  ],
  "rahmengroessen-rechner": [
    { slug: "richtige-rahmengroesse-finden", title: "Rahmengröße finden: worauf es wirklich ankommt" },
    { slug: "bikefitting-was-bringt-es", title: "Bikefitting: was es kostet und was es bringt" },
    { slug: "sattelhoehe-richtig-einstellen", title: "Sattelhöhe richtig einstellen" },
  ],
  "uebersetzung-rechner": [
    { slug: "uebersetzung-fahrrad-erklaert", title: "Fahrrad-Übersetzung verständlich erklärt" },
    { slug: "kadenz-optimum-radfahren", title: "Optimale Trittfrequenz beim Radfahren" },
  ],
  "ebike-reichweite-rechner": [
    { slug: "ebike-reichweite-realistisch", title: "E-Bike-Reichweite: was Herstellerangaben verschweigen" },
    { slug: "ebike-akku-pflege", title: "E-Bike-Akku richtig pflegen und laden" },
    { slug: "bosch-shimano-yamaha-motoren-vergleich", title: "Bosch, Shimano, Yamaha: Motoren im Vergleich" },
  ],
  "kalorien-rechner": [
    { slug: "radfahren-abnehmen", title: "Radfahren zum Abnehmen: Trainingsplan & Ernährung" },
    { slug: "ernaehrung-lange-tour", title: "Ernährung auf der langen Tour" },
  ],
  "jobrad-leasing-rechner": [
    { slug: "jobrad-vs-kauf-lohnt-sich", title: "JobRad vs. Kauf: Wann lohnt sich Leasing wirklich?" },
    { slug: "dienstrad-versteuerung-1-prozent", title: "Dienstrad versteuern: 0,25%-Regel erklärt" },
  ],
  "ebike-foerderung-rechner": [
    { slug: "ebike-foerderung-2026-bundeslaender", title: "E-Bike-Förderung 2026: Zuschüsse nach Bundesland" },
    { slug: "lastenrad-foerderung-antrag", title: "Lastenrad-Förderung beantragen — so geht's" },
  ],
  "fahrrad-vergleich": [
    { slug: "fahrrad-kaufberatung-2026", title: "Fahrrad-Kaufberatung 2026" },
    { slug: "ebike-testsieger-2026", title: "E-Bike-Testsieger 2026" },
  ],
};

export function relatedFor(slug: string): RelatedLink[] {
  return RELATED[slug] ?? [];
}
