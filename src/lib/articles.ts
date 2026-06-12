import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import ebike from "@/assets/ebike.jpg";
import ratgeber from "@/assets/ratgeber.jpg";
import hero from "@/assets/hero-bike.jpg";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Nachrichten" | "Ratgeber" | "E-Bikes" | "Tests";
  date: string;
  readTime: string;
  image: string;
  source?: string;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "neue-fahrradinfrastruktur-berlin-2026",
    title: "Berlin investiert 240 Millionen Euro in neue Radwege bis 2027",
    excerpt:
      "Der Berliner Senat hat das größte Fahrradinfrastruktur-Paket der Stadtgeschichte beschlossen. Was Pendler und Freizeitradler jetzt wissen müssen.",
    category: "Nachrichten",
    date: "12. Juni 2026",
    readTime: "4 Min.",
    image: news1,
    source: "Tagesspiegel",
    body: [
      "Berlin macht ernst: Mit einem Investitionsvolumen von 240 Millionen Euro sollen bis Ende 2027 über 180 Kilometer neuer, geschützter Radwege entstehen. Das Programm umfasst breite Protected Bike Lanes auf allen Hauptverkehrsachsen sowie eine vollständige Erneuerung des Radwegenetzes in den Innenstadtbezirken.",
      "Besonders ambitioniert: Die geplante Nord-Süd-Magistrale soll als erste deutsche »Fahrrad-Autobahn« Berlin von Pankow bis Tempelhof durchqueren – kreuzungsfrei, beleuchtet und mit Servicestationen. Verkehrssenatorin Bonde sprach von einem »Paradigmenwechsel in der Mobilitätsplanung«.",
      "Für E-Bike-Fahrer besonders interessant: Entlang der neuen Routen entstehen 1.200 öffentliche Ladepunkte sowie 45 sichere Sammelabstellanlagen mit Videoüberwachung.",
    ],
  },
  {
    slug: "shimano-di2-2027-test",
    title: "Shimano Dura-Ace Di2 2027: Die wichtigste Schaltung seit zehn Jahren",
    excerpt:
      "Wir konnten die neue 12-fach Funkschaltung exklusiv testen. Schneller, leiser, intelligenter – und überraschend günstig.",
    category: "Tests",
    date: "10. Juni 2026",
    readTime: "8 Min.",
    image: news2,
    body: [
      "Nach über zwei Wochen intensiver Tests auf deutschen Straßen und in den Alpen steht fest: Die neue Shimano Dura-Ace Di2 R9300 ist ein Quantensprung. Die Schaltvorgänge erfolgen messbar 38 % schneller als beim Vorgängermodell, die Akkulaufzeit verdoppelt sich auf rund 1.800 Kilometer.",
      "Im Vergleich zur direkten Konkurrenz von SRAM bietet Shimano nun erstmals echte App-Integration mit automatischer Schaltlogik basierend auf Trittfrequenz, Steigung und Herzfrequenz. Die Anbindung an Garmin und Wahoo funktioniert ohne Aussetzer.",
      "Preislich bleibt Shimano überraschend moderat: 4.290 Euro für die komplette Gruppe – fast 800 Euro unter dem SRAM Red AXS Setup.",
    ],
  },
  {
    slug: "mtb-trails-bayerische-alpen",
    title: "Die 10 spektakulärsten MTB-Trails in den Bayerischen Alpen",
    excerpt:
      "Von der Zugspitze bis zum Watzmann: Unsere Redaktion hat über 600 Kilometer Single Trails getestet. Das sind die Highlights.",
    category: "Nachrichten",
    date: "08. Juni 2026",
    readTime: "12 Min.",
    image: news3,
    source: "BIKE Magazin",
    body: [
      "Die bayerischen Alpen gehören zu den besten MTB-Destinationen Europas. Wir stellen die zehn lohnendsten Trails vor – von Einsteiger-freundlich bis Hardcore-Enduro.",
      "Platz 1 geht ungeschlagen an den »Geißkopf Freeride« bei Bischofsmais. 12,8 Kilometer reine Abfahrt, perfekt geshapt, mit Liftanbindung und einem der besten Bikeparks Deutschlands direkt am Einstieg.",
      "Besonders empfehlenswert für Genussbiker: Der »Karwendel-Höhenweg« mit traumhaften Ausblicken auf das Inntal.",
    ],
  },
  {
    slug: "e-bike-kaufberatung-2026",
    title: "E-Bike Kaufberatung 2026: Diese 7 Modelle lohnen sich wirklich",
    excerpt:
      "Der E-Bike-Markt ist unübersichtlich geworden. Wir zeigen, welche Bikes ihr Geld wert sind – vom City-Pendler bis zum Premium-SUV.",
    category: "E-Bikes",
    date: "07. Juni 2026",
    readTime: "10 Min.",
    image: ebike,
    body: [
      "Über 2,1 Millionen E-Bikes wurden 2025 in Deutschland verkauft – Tendenz steigend. Doch welches Modell passt zu welchem Fahrertyp? Unsere große Kaufberatung schafft Klarheit.",
      "Im City-Segment überzeugt das Riese & Müller Nevo4 mit Bosch Performance Line CX Motor und 750 Wh Akku. Reichweite im Test: 142 km bei voller Unterstützung.",
      "Wer es sportlicher mag, greift zum Specialized Turbo Vado SL – nur 14,8 kg leicht, und damit das aktuell beste leichte E-Bike auf dem Markt.",
    ],
  },
  {
    slug: "fahrrad-winterfest-machen",
    title: "Fahrrad winterfest machen: Die komplette Checkliste vom Profi",
    excerpt:
      "Schritt-für-Schritt-Anleitung, damit euer Bike den Winter unbeschadet übersteht – egal ob Garage, Keller oder Außenstellplatz.",
    category: "Ratgeber",
    date: "05. Juni 2026",
    readTime: "6 Min.",
    image: ratgeber,
    body: [
      "Frost, Streusalz und Feuchtigkeit setzen jedem Fahrrad zu. Mit der richtigen Vorbereitung übersteht euer Bike den Winter problemlos – und ist im Frühjahr sofort einsatzbereit.",
      "Schritt 1: Gründliche Reinigung mit lauwarmem Wasser und mildem Reiniger. Anschließend komplett trocknen lassen.",
      "Schritt 2: Kette entfetten, neu schmieren und mit Wachs versiegeln. Schaltung und Bremsen prüfen, Züge ggf. erneuern.",
    ],
  },
  {
    slug: "pendler-route-hamburg-test",
    title: "Hamburg per E-Bike: So fährt die neue Veloroute 2",
    excerpt:
      "Wir haben Hamburgs neueste Veloroute getestet. Verbindet sie wirklich Altona mit der City in unter 20 Minuten?",
    category: "Nachrichten",
    date: "03. Juni 2026",
    readTime: "5 Min.",
    image: hero,
    source: "Hamburger Abendblatt",
    body: [
      "Die Veloroute 2 ist Hamburgs Vorzeigeprojekt für moderne urbane Radinfrastruktur. Auf 7,2 km verbindet sie Altona-Nord mit der HafenCity – getrennt vom Autoverkehr, mit eigener Ampelschaltung und Vorrang an Kreuzungen.",
      "Im Test konnten wir die Strecke mit einem normalen E-Bike in 18:42 Minuten zurücklegen. Mit dem Auto sind es zur Rushhour rund 35 Minuten.",
      "Verbesserungspotenzial gibt es bei der Beschilderung – an drei Stellen ist die Wegführung nicht eindeutig.",
    ],
  },
  // ---------- NACHRICHTEN ----------
  {
    slug: "deutschland-radwege-rekord-2026",
    title: "Deutschland baut so viele Radwege wie nie — ADFC zieht Halbjahresbilanz",
    excerpt:
      "Über 1.400 Kilometer neue Radinfrastruktur wurden 2026 bundesweit fertiggestellt. Welche Städte führen das Ranking an?",
    category: "Nachrichten",
    date: "11. Juni 2026",
    readTime: "5 Min.",
    image: news2,
    source: "ADFC",
    body: [
      "Der Allgemeine Deutsche Fahrrad-Club (ADFC) meldet einen historischen Höchststand: In den ersten sechs Monaten 2026 wurden bundesweit 1.412 Kilometer geschützte Radwege neu eröffnet — fast doppelt so viel wie im gleichen Zeitraum 2024.",
      "Spitzenreiter ist überraschend nicht Berlin, sondern Münster mit 38 km pro 100.000 Einwohner. Es folgen Freiburg, Karlsruhe und Leipzig.",
      "Verkehrsminister kündigte zusätzliche Bundesmittel in Höhe von 600 Mio. Euro für 2027 an.",
    ],
  },
  {
    slug: "tour-de-france-2027-deutschland-start",
    title: "Tour de France 2027: Großer Start auf deutschem Boden bestätigt",
    excerpt:
      "Düsseldorf, Köln und Aachen werden die ersten drei Etappen ausrichten. Erwartet werden zwei Millionen Zuschauer.",
    category: "Nachrichten",
    date: "09. Juni 2026",
    readTime: "4 Min.",
    image: news3,
    source: "L'Équipe",
    body: [
      "Die Tour-Organisatoren ASO haben bestätigt: Der Grand Départ 2027 findet in Nordrhein-Westfalen statt. Es ist erst der vierte Start auf deutschem Boden in der Geschichte der Tour.",
      "Das Eröffnungszeitfahren startet am Rheinufer in Düsseldorf, Etappe 2 führt entlang der Rheinpromenade nach Köln, Etappe 3 endet vor dem Aachener Dom.",
      "Die wirtschaftlichen Effekte werden auf rund 220 Mio. Euro für die Region geschätzt.",
    ],
  },
  {
    slug: "eurobike-2026-highlights",
    title: "Eurobike 2026: Diese fünf Trends prägen das Fahrradjahr",
    excerpt:
      "Modulare Lastenräder, KI-Schaltungen und Diebstahlschutz per Satellit — wir fassen die Messe-Highlights zusammen.",
    category: "Nachrichten",
    date: "06. Juni 2026",
    readTime: "7 Min.",
    image: ebike,
    source: "Eurobike",
    body: [
      "Über 1.900 Aussteller, 36.000 Fachbesucher: Die Eurobike 2026 in Frankfurt bestätigt den Branchen-Aufschwung. Fünf Trends stechen heraus.",
      "Trend 1 — modulare Lastenräder mit Wechselboxen für Familie und Lieferdienst. Trend 2 — KI-gestützte Schaltsysteme. Trend 3 — Satelliten-Tracking.",
      "Trend 4 — recycelte Carbon-Rahmen. Trend 5 — Schnellladestationen mit 600 W Output für Pedelecs der nächsten Generation.",
    ],
  },

  // ---------- RATGEBER ----------
  {
    slug: "richtige-sitzposition-rennrad",
    title: "Die richtige Sitzposition aufs Rennrad: Bikefitting für jedermann",
    excerpt:
      "Knieschmerzen, tauber Po, Nackenverspannungen? Mit diesen sieben Messpunkten findet ihr eure perfekte Sitzposition.",
    category: "Ratgeber",
    date: "04. Juni 2026",
    readTime: "9 Min.",
    image: hero,
    body: [
      "Eine professionelle Bikefitting-Sitzung kostet zwischen 180 und 400 Euro. Doch 80 % der Wirkung lassen sich auch zuhause erzielen — wenn man die richtigen Messpunkte kennt.",
      "Schritt 1: Sattelhöhe. Methode nach LeMond — Schrittlänge × 0,883 = Sattelhöhe (Tretlagermitte bis Satteloberkante).",
      "Schritt 2: Sattelposition horizontal. Pedal in 3-Uhr-Stellung, Lot vom vorderen Knie muss durch die Pedalachse fallen.",
    ],
  },
  {
    slug: "fahrrad-versicherung-vergleich",
    title: "Fahrrad-Versicherung 2026: Welche lohnt sich wirklich?",
    excerpt:
      "Hausrat, Spezial- oder gar keine? Wir vergleichen 14 Tarife und zeigen, wann sich welche Police lohnt.",
    category: "Ratgeber",
    date: "02. Juni 2026",
    readTime: "8 Min.",
    image: ratgeber,
    body: [
      "Über 340.000 Fahrräder wurden 2025 in Deutschland gestohlen — Tendenz steigend. Eine passende Versicherung gehört für teure Räder zur Grundausstattung.",
      "Hausratversicherung reicht meist nur bis 1 % der Versicherungssumme. Bei einem 4.000-Euro-Rad und 50.000 Euro Hausrat sind das nur 500 Euro Schutz.",
      "Spezial-Tarife wie Wertgarantie oder Hepster decken Neuwert, Pannenhilfe und Akku-Diebstahl ab — ab ca. 5,90 Euro/Monat.",
    ],
  },
  {
    slug: "fahrradschloss-test-2026",
    title: "Das beste Fahrradschloss 2026: Stiftung-Warentest-Sieger im Praxistest",
    excerpt:
      "Wir haben sieben Top-Schlösser mit Bolzenschneider, Akkuflex und Eishammer attackiert. Nur drei haben bestanden.",
    category: "Ratgeber",
    date: "31. Mai 2026",
    readTime: "7 Min.",
    image: news1,
    body: [
      "Ein gutes Fahrradschloss muss mindestens fünf Minuten Werkzeugangriff standhalten — so die Empfehlung der Polizei. Wir haben sieben Modelle im realistischen Praxistest.",
      "Sieger: ABUS Granit XPlus 540 mit 14 mm gehärtetem Stahlbügel. Hielt allen Attacken über sieben Minuten stand.",
      "Auf Platz zwei landet Kryptonite New York Fahgettaboudit — etwas schwerer, dafür noch widerstandsfähiger gegen Bolzenschneider.",
    ],
  },

  // ---------- E-BIKES ----------
  {
    slug: "bosch-performance-line-cx-2027",
    title: "Bosch Performance Line CX 2027: 100 Nm und 30 % mehr Reichweite",
    excerpt:
      "Der neue Top-Motor von Bosch setzt neue Maßstäbe. Wir konnten ihn zwei Wochen vor Marktstart fahren.",
    category: "E-Bikes",
    date: "10. Juni 2026",
    readTime: "9 Min.",
    image: ebike,
    body: [
      "Bosch hat in Reutlingen den Nachfolger des bisherigen CX-Motors vorgestellt. Das neue Aggregat liefert 100 Nm Drehmoment — bisher Domäne von Spezialherstellern wie TQ.",
      "Im Test auf der Schwäbischen Alb erreichten wir mit einem 750-Wh-Akku rund 142 km Reichweite bei Tour-Modus und 850 Höhenmetern.",
      "Preislich liegt der neue Motor rund 200 Euro über dem Vorgängermodell — die Aufpreise dürften ab Frühjahr 2027 in den OEM-Bikes sichtbar werden.",
    ],
  },
  {
    slug: "e-mtb-vergleich-2026",
    title: "E-MTB-Vergleich 2026: Diese fünf Fullys dominieren die Trails",
    excerpt:
      "Specialized, Trek, Canyon, Cube, Haibike — wir haben die Top-Modelle der Saison auf einem 38 km langen Testparcours verglichen.",
    category: "E-Bikes",
    date: "08. Juni 2026",
    readTime: "11 Min.",
    image: news3,
    body: [
      "Der E-MTB-Markt boomt — 2025 wurden in Deutschland erstmals mehr E-MTBs als klassische MTBs verkauft. Unser Test zeigt, welches der aktuellen Top-Modelle das beste Gesamtpaket bietet.",
      "Testsieger: Specialized Turbo Levo SL 2026. Bestes Handling, leichtester Antrieb (12,3 kg Komplettgewicht ohne Akku), beste Geometrie.",
      "Preis-Leistungs-Tipp: Canyon Spectral:ON CF 8 — gleichwertige Performance bei 1.700 Euro weniger.",
    ],
  },
  {
    slug: "cargo-e-bike-familie",
    title: "Lastenrad-Test 2026: Welches E-Cargo-Bike taugt für die Familie?",
    excerpt:
      "Zwei Kinder, Wocheneinkauf, Hund — wir haben acht aktuelle E-Lastenräder im Alltag getestet.",
    category: "E-Bikes",
    date: "04. Juni 2026",
    readTime: "10 Min.",
    image: news2,
    body: [
      "Lastenräder ersetzen zunehmend das Zweitauto. Wir haben acht aktuelle Modelle vier Wochen lang im Familienalltag getestet — vom Kindergartenbringen bis zum Großeinkauf.",
      "Testsieger: Riese & Müller Load4 75 — beste Fahrdynamik, robuster Aluminiumrahmen, Bosch Cargo Line mit 85 Nm.",
      "Budget-Tipp: Tern GSD S00 — kürzer, wendiger, ideal für die Stadt. Bis zu 200 kg Zuladung trotz kompakter Bauweise.",
    ],
  },

  // ---------- TESTS ----------
  {
    slug: "canyon-aeroad-cfr-2026-test",
    title: "Canyon Aeroad CFR 2026 im Test: Schneller als die Konkurrenz?",
    excerpt:
      "6,8 kg, neue UCI-konforme Aerogeometrie, integrierter Powermeter — was kann das neue Aeroad wirklich?",
    category: "Tests",
    date: "09. Juni 2026",
    readTime: "10 Min.",
    image: hero,
    body: [
      "Mit dem neuen Aeroad CFR will Canyon den Aero-Thron zurückerobern. Im Windkanal und auf 1.800 Testkilometern muss das Bike beweisen, ob das gelingt.",
      "Aerodynamik: Bei 45 km/h misst Canyon eine Ersparnis von 4,2 Watt gegenüber dem Vorgänger — bestätigt durch unabhängige Messungen im GST-Windkanal.",
      "Gewicht: 6,82 kg in Größe M mit SRAM Red AXS. Damit gehört das Aeroad zu den leichtesten Aero-Rennrädern überhaupt.",
    ],
  },
  {
    slug: "sram-red-axs-2026-langzeittest",
    title: "SRAM Red AXS 2026 Langzeittest: 8.000 km mit der neuen Top-Gruppe",
    excerpt:
      "Wir haben die neue Funkschaltung von SRAM über ein halbes Jahr im harten Renneinsatz getestet. Unser Fazit.",
    category: "Tests",
    date: "07. Juni 2026",
    readTime: "12 Min.",
    image: news1,
    body: [
      "Nach 8.247 km auf Asphalt, Schotter und einigen verregneten Brevets ziehen wir Bilanz zur neuen SRAM Red AXS.",
      "Schaltperformance: Tadellos. Über 6 Monate keine Fehlfunktion, kein einziger Aussetzer beim Funkprotokoll.",
      "Bremsen: Das neue HRD-Bremsensystem ist messbar bissiger als zuvor. Bremsweg aus 30 km/h: 7,1 m (Vorgänger: 8,4 m).",
    ],
  },
  {
    slug: "garmin-edge-1050-test",
    title: "Garmin Edge 1050 im Test: Lohnt sich das 750-Euro-Topmodell?",
    excerpt:
      "Hellster Touchscreen aller Zeiten, Pulslautsprecher, Live-Verkehrsdaten — wir haben den neuen Navi-Boliden auf Herz und Nieren geprüft.",
    category: "Tests",
    date: "05. Juni 2026",
    readTime: "8 Min.",
    image: news2,
    body: [
      "Garmins neues Flaggschiff bringt einen 3,5-Zoll-Display mit 1.000 Nits Helligkeit, integriertem Lautsprecher und Live-Verkehrsdaten via 4G.",
      "Im Test überzeugt vor allem die Akkulaufzeit: 18 Stunden bei voller Hintergrundbeleuchtung und aktivem Tracking — fast doppelt so lang wie beim Vorgänger.",
      "Schwachpunkt bleibt das Gewicht (162 g) und der Preis. Für Gelegenheitsfahrer ist der Edge 850 die bessere Wahl.",
    ],
  },
];

export const getArticlesByCategory = (cat: Article["category"]) =>
  articles.filter((a) => a.category === cat);

export const getArticleBySlug = (slug: string) =>
  articles.find((a) => a.slug === slug);

export const categoryMeta: Record<
  Article["category"],
  { slug: string; title: string; description: string; eyebrow: string; tagline: string }
> = {
  Nachrichten: {
    slug: "/nachrichten",
    title: "Fahrrad-Nachrichten aus Deutschland & der Welt",
    description:
      "Tagesaktuelle Meldungen, Politik, Infrastruktur und Branchenneuigkeiten rund um Fahrrad, E-Bike und Radsport — kuratiert aus über 80 Fachquellen.",
    eyebrow: "Nachrichten",
    tagline: "Was die Radwelt bewegt",
  },
  Ratgeber: {
    slug: "/ratgeber",
    title: "Fahrrad-Ratgeber: Wartung, Kaufberatung & Tipps",
    description:
      "Praxis-Ratgeber von Werkstattprofis und Bikefittern. Wartung, Sicherheit, Versicherung, Sitzposition, Reparatur — verständlich erklärt und sofort anwendbar.",
    eyebrow: "Ratgeber",
    tagline: "Wissen, das fährt",
  },
  "E-Bikes": {
    slug: "/e-bikes",
    title: "E-Bike Tests, Kaufberatung & Motoren-Vergleich",
    description:
      "Aktuelle E-Bike-Tests, Motorenvergleiche, Akku-Reichweiten und Kaufberatung — von City-Pedelec bis Premium-E-MTB und Lastenrad.",
    eyebrow: "E-Bikes",
    tagline: "Strom auf zwei Rädern",
  },
  Tests: {
    slug: "/tests",
    title: "Fahrrad-Tests & Komponenten-Reviews",
    description:
      "Unabhängige Langzeittests von Rennrädern, MTBs, Komponenten, Navigationsgeräten und Zubehör. Mit Messdaten, Praxis-Kilometern und ehrlichen Urteilen.",
    eyebrow: "Tests",
    tagline: "Geprüft. Gefahren. Beurteilt.",
  },
};
