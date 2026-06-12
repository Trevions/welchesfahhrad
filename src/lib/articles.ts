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
      "Besonders ambitioniert: Die geplante Nord-Süd-Magistrale soll als erste deutsche „Fahrrad-Autobahn" Berlin von Pankow bis Tempelhof durchqueren – kreuzungsfrei, beleuchtet und mit Servicestationen. Verkehrssenatorin Bonde sprach von einem „Paradigmenwechsel in der Mobilitätsplanung".",
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
      "Platz 1 geht ungeschlagen an den „Geißkopf Freeride" bei Bischofsmais. 12,8 Kilometer reine Abfahrt, perfekt geshapt, mit Liftanbindung und einem der besten Bikeparks Deutschlands direkt am Einstieg.",
      "Besonders empfehlenswert für Genussbiker: Der „Karwendel-Höhenweg" mit traumhaften Ausblicken auf das Inntal.",
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
];

export const getArticlesByCategory = (cat: Article["category"]) =>
  articles.filter((a) => a.category === cat);

export const getArticleBySlug = (slug: string) =>
  articles.find((a) => a.slug === slug);
