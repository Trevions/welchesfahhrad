// Rahmengeometrie-Fit-Score.
//
// Vergleicht die berechneten Zielwerte (Reach/Stack aus Bikefit + Sitzwinkel-Target)
// mit der Geometrie eines echten Kandidaten-Rads aus `bikes.geometry`.
//
// Score-Modell (0–100):
//   base 100
//     − |Δ reach|  × 0.7   (10 mm zu viel/wenig = −7 Punkte)
//     − |Δ stack|  × 0.5
//   clamp [0, 100]
//
// Geometrie-lose Räder → fitScore = null (nicht bewertet, aber nicht rausgefiltert).

import type { CalculationResult, BikeFitScore } from "./types";

type CandidateInput = {
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  price_eur: number | null;
  bike_type: string | null;
  category: string;
  excerpt: string | null;
  image_url: string | null;
  availability: string | null;
  geometry: { reach_mm?: number | null; stack_mm?: number | null } | null;
};

export function scoreCandidateGeometry(
  candidate: CandidateInput,
  target: {
    reachMm: { min: number; max: number };
    stackMm: { min: number; max: number };
  },
): BikeFitScore {
  const reach = candidate.geometry?.reach_mm ?? null;
  const stack = candidate.geometry?.stack_mm ?? null;
  const reachMid = (target.reachMm.min + target.reachMm.max) / 2;
  const stackMid = (target.stackMm.min + target.stackMm.max) / 2;

  const reasons: string[] = [];
  let score: number | null = null;
  let dReach: number | null = null;
  let dStack: number | null = null;

  if (typeof reach === "number" && typeof stack === "number") {
    dReach = Math.round(reach - reachMid);
    dStack = Math.round(stack - stackMid);
    let s = 100 - Math.abs(dReach) * 0.7 - Math.abs(dStack) * 0.5;
    s = Math.max(0, Math.min(100, s));
    score = Math.round(s);

    if (Math.abs(dReach) <= 8 && Math.abs(dStack) <= 12) {
      reasons.push(`Reach & Stack sehr nah am Ideal (Δ ${dReach>0?"+":""}${dReach}/${dStack>0?"+":""}${dStack} mm).`);
    } else if (dReach > 15) {
      reasons.push(`Reach ist ${dReach} mm länger als ideal — sportlicher, gestreckter. Ausgleich per kürzerem Vorbau (~ ${Math.min(20, dReach)} mm).`);
    } else if (dReach < -15) {
      reasons.push(`Reach ist ${Math.abs(dReach)} mm kürzer als ideal — kompakter. Ausgleich per längerem Vorbau möglich.`);
    }
    if (dStack > 20) {
      reasons.push(`Stack ${dStack} mm höher — aufrechte Position, gut für Komfort/Rücken.`);
    } else if (dStack < -20) {
      reasons.push(`Stack ${Math.abs(dStack)} mm niedriger — sehr sportlich; nur wenn beweglich.`);
    }
  } else {
    reasons.push("Rahmengeometrie nicht in Datenbank — Score nicht berechnet, Größe manuell prüfen.");
  }

  return {
    slug: candidate.slug,
    brand: candidate.brand,
    model: candidate.model,
    year: candidate.year,
    price_eur: candidate.price_eur,
    bike_type: candidate.bike_type,
    category: candidate.category,
    excerpt: candidate.excerpt,
    image_url: candidate.image_url,
    availability: candidate.availability,
    geometry: candidate.geometry
      ? {
          reach_mm: candidate.geometry.reach_mm ?? undefined,
          stack_mm: candidate.geometry.stack_mm ?? undefined,
        }
      : null,
    fitScore: score,
    deltaReachMm: dReach,
    deltaStackMm: dStack,
    reasons,
  };
}

export function scoreCandidates(
  candidates: CandidateInput[],
  calc: CalculationResult,
): BikeFitScore[] {
  const scored = candidates.map((c) =>
    scoreCandidateGeometry(c, { reachMm: calc.reachMm, stackMm: calc.stackMm }),
  );
  // Sortierung: Räder mit Score zuerst (nach Score), Rest per Preis-Nähe.
  return scored.sort((a, b) => {
    if (a.fitScore !== null && b.fitScore !== null) return b.fitScore - a.fitScore;
    if (a.fitScore !== null) return -1;
    if (b.fitScore !== null) return 1;
    return 0;
  });
}
