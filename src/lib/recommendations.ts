// Deterministic article ranking based on the user's bike profile.
// No LLMs, no network — runs entirely in the browser on the prefetched list.

import type { Article } from "@/lib/articles";
import type { BikeProfile, BikeType, Interest } from "@/lib/bike-profile";

type Keyword = { token: string; weight: number };

const BIKE_TYPE_KEYWORDS: Record<BikeType, Keyword[]> = {
  road: [
    { token: "rennrad", weight: 4 },
    { token: "road", weight: 2 },
    { token: "aero", weight: 2 },
    { token: "carbon", weight: 1 },
    { token: "peloton", weight: 1 },
    { token: "tour de france", weight: 1 },
  ],
  gravel: [
    { token: "gravel", weight: 4 },
    { token: "schotter", weight: 3 },
    { token: "tubeless", weight: 2 },
    { token: "bikepacking", weight: 2 },
  ],
  mtb: [
    { token: "mtb", weight: 4 },
    { token: "mountainbike", weight: 4 },
    { token: "trail", weight: 3 },
    { token: "enduro", weight: 3 },
    { token: "federgabel", weight: 2 },
    { token: "fully", weight: 2 },
  ],
  ebike: [
    { token: "e-bike", weight: 4 },
    { token: "ebike", weight: 4 },
    { token: "pedelec", weight: 3 },
    { token: "akku", weight: 3 },
    { token: "reichweite", weight: 2 },
    { token: "motor", weight: 2 },
    { token: "bosch", weight: 1 },
    { token: "shimano steps", weight: 1 },
  ],
  city: [
    { token: "city", weight: 3 },
    { token: "urban", weight: 3 },
    { token: "pendeln", weight: 3 },
    { token: "alltag", weight: 2 },
    { token: "stadt", weight: 2 },
  ],
  trekking: [
    { token: "trekking", weight: 4 },
    { token: "tour", weight: 2 },
    { token: "reise", weight: 2 },
    { token: "gepäck", weight: 1 },
  ],
  cargo: [
    { token: "lastenrad", weight: 4 },
    { token: "cargo", weight: 4 },
    { token: "transport", weight: 2 },
    { token: "familie", weight: 1 },
  ],
  kids: [
    { token: "kinderrad", weight: 4 },
    { token: "kinder", weight: 3 },
    { token: "familie", weight: 2 },
  ],
};

const INTEREST_KEYWORDS: Record<Interest, Keyword[]> = {
  touren: [
    { token: "tour", weight: 3 },
    { token: "route", weight: 2 },
    { token: "radweg", weight: 2 },
    { token: "alpen", weight: 1 },
  ],
  technik: [
    { token: "technik", weight: 2 },
    { token: "setup", weight: 2 },
    { token: "geometrie", weight: 2 },
    { token: "reifendruck", weight: 3 },
    { token: "tubeless", weight: 2 },
  ],
  sicherheit: [
    { token: "sicherheit", weight: 3 },
    { token: "helm", weight: 2 },
    { token: "licht", weight: 2 },
    { token: "diebstahl", weight: 2 },
    { token: "schloss", weight: 2 },
  ],
  recht: [
    { token: "stvo", weight: 4 },
    { token: "recht", weight: 2 },
    { token: "bußgeld", weight: 3 },
    { token: "gesetz", weight: 2 },
    { token: "verkehr", weight: 1 },
  ],
  wartung: [
    { token: "wartung", weight: 4 },
    { token: "reparatur", weight: 3 },
    { token: "pannenhilfe", weight: 2 },
    { token: "schaltung", weight: 2 },
    { token: "kette", weight: 1 },
    { token: "bremse", weight: 2 },
  ],
  ernaehrung: [
    { token: "ernährung", weight: 3 },
    { token: "training", weight: 3 },
    { token: "kalorien", weight: 2 },
    { token: "regeneration", weight: 2 },
  ],
  wetter: [
    { token: "wetter", weight: 3 },
    { token: "regen", weight: 2 },
    { token: "wind", weight: 2 },
  ],
  navigation: [
    { token: "navigation", weight: 3 },
    { token: "gps", weight: 2 },
    { token: "karte", weight: 2 },
    { token: "komoot", weight: 2 },
  ],
  kaufberatung: [
    { token: "kaufberatung", weight: 4 },
    { token: "test", weight: 2 },
    { token: "vergleich", weight: 2 },
    { token: "preis", weight: 1 },
  ],
  "ebike-akku": [
    { token: "akku", weight: 4 },
    { token: "reichweite", weight: 3 },
    { token: "motor", weight: 2 },
    { token: "ladezeit", weight: 2 },
  ],
};

const CATEGORY_INTEREST_BOOST: Partial<
  Record<Article["category"], Interest[]>
> = {
  Ratgeber: ["wartung", "technik", "sicherheit", "recht"],
  Tests: ["kaufberatung", "technik"],
  "E-Bikes": ["ebike-akku", "kaufberatung"],
  Nachrichten: ["recht", "sicherheit"],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss");
}

function countMatches(haystack: string, needle: string): number {
  if (!needle) return 0;
  const n = normalize(needle);
  const h = haystack;
  let count = 0;
  let idx = h.indexOf(n);
  while (idx !== -1) {
    count++;
    idx = h.indexOf(n, idx + n.length);
    if (count > 4) break;
  }
  return count;
}

export type MatchResult = {
  article: Article;
  score: number;
  reason: string;
};

export function scoreArticle(
  article: Article,
  profile: BikeProfile,
): MatchResult {
  const hay = normalize(
    `${article.title} \n ${article.excerpt} \n ${article.body?.join(" ") ?? ""}`,
  );

  let score = 0;
  const reasons: string[] = [];

  // Bike types
  for (const t of profile.bikeTypes) {
    let typeScore = 0;
    for (const kw of BIKE_TYPE_KEYWORDS[t] ?? []) {
      typeScore += countMatches(hay, kw.token) * kw.weight;
    }
    if (typeScore > 0) {
      score += typeScore;
      reasons.push(
        t === "ebike" ? "E-Bike" : t.charAt(0).toUpperCase() + t.slice(1),
      );
    }
  }

  // Interests
  for (const i of profile.interests) {
    let iScore = 0;
    for (const kw of INTEREST_KEYWORDS[i] ?? []) {
      iScore += countMatches(hay, kw.token) * kw.weight;
    }
    if (iScore > 0) {
      score += iScore;
    }
  }

  // Category-driven interest boost
  const catBoost = CATEGORY_INTEREST_BOOST[article.category] ?? [];
  for (const i of catBoost) {
    if (profile.interests.includes(i)) score += 1.5;
  }

  // Tire width hint → boosts Reifen / Reifendruck articles
  if (profile.tire?.widthMm) {
    if (countMatches(hay, "reifen") > 0 || countMatches(hay, "druck") > 0) {
      score += 2;
      reasons.push(`${profile.tire.widthMm} mm Reifen`);
    }
  }

  // Frame size hint
  if (
    profile.frameSizeCm &&
    (countMatches(hay, "rahmen") > 0 || countMatches(hay, "geometrie") > 0)
  ) {
    score += 1.5;
  }

  // Recency bonus (parse the formatted date back is fragile — skip; rely on
  // input ordering for tie-breaking)

  const reason = Array.from(new Set(reasons)).slice(0, 2).join(" · ");
  return { article, score, reason };
}

export function getTopMatches(
  articles: Article[],
  profile: BikeProfile | null,
  opts: { limit?: number; minScore?: number } = {},
): MatchResult[] {
  if (!profile || profile.bikeTypes.length === 0) return [];
  const min = opts.minScore ?? 3;
  const limit = opts.limit ?? 8;
  const ranked = articles
    .map((a) => scoreArticle(a, profile))
    .filter((r) => r.score >= min)
    .sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
}

export type PercentMatch = MatchResult & { percent: number };

/**
 * Profile-aware match percentage. Denominator is a synthetic "ideal" score
 * derived from the user's selected bike types and interests, so a denser
 * profile needs a denser article to reach 80%. Clipped to [0, 100].
 */
export function profileDenominator(profile: BikeProfile): number {
  const types = Math.max(1, profile.bikeTypes.length);
  const interests = profile.interests.length;
  // Average top-keyword weight per bike type ≈ 6, per interest ≈ 4.
  // We deliberately keep the denominator modest so a deeply on-topic article
  // can reach 100%, while generic news stays well below 80%.
  return types * 6 + interests * 3 + 4;
}

export function getPercentMatches(
  articles: Article[],
  profile: BikeProfile | null,
  opts: { minPercent?: number; limit?: number } = {},
): PercentMatch[] {
  if (!profile || profile.bikeTypes.length === 0) return [];
  const denom = profileDenominator(profile);
  const min = opts.minPercent ?? 80;
  const ranked = articles
    .map((a) => {
      const r = scoreArticle(a, profile);
      const percent = Math.min(100, Math.round((r.score / denom) * 100));
      return { ...r, percent };
    })
    .filter((r) => r.percent >= min)
    .sort((a, b) => b.percent - a.percent || b.score - a.score);
  return opts.limit ? ranked.slice(0, opts.limit) : ranked;
}

