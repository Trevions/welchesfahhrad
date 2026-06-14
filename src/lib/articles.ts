
export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Nachrichten" | "Ratgeber" | "E-Bikes" | "Tests";
  date: string;
  readTime: string;
  image: string;
  source?: string;
  imageCaption?: string;
  imageCredit?: string;
  imageIsAi?: boolean;
  body: string[];
};

export const articles: Article[] = [];

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
