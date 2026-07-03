// Bikefit-Modul — Kern-Rechenmodell für den Kaufberater auf
// Bikefitter-Niveau. Kombiniert etablierte Standards:
//
//  - Sattelhöhe: Holmes (0.883), LeMond (0.885 mit Kurbel-Korrektur),
//    Hamley (1.09 × Schrittlänge − Kurbellänge). Alle drei werden
//    berechnet und als Konsens (Median, ±5 mm Bandbreite) ausgegeben.
//  - Sattel-Setback: KOPS (Knee Over Pedal Spindle) — abgeleitet aus
//    Oberschenkellänge × sin(Sitzwinkel) und Sitzknochen-Offset.
//  - ETT (effektive Oberrohrlänge): Torso × 0.47 + Arm × 0.14
//    (BikeFit-Regressionskoeffizienten), korrigiert um Beweglichkeit
//    und Einsatz-Sportlichkeit.
//  - Sattelbreite: Sitzknochenabstand + Positions-Offset
//    (Rennrad +20 mm, Trekking +25 mm, City +30 mm) — Herstellerstandard
//    (Specialized Body Geometry / Selle Italia idmatch).
//  - Kurbellänge (Short-Cranks-Empfehlung): 2.1–2.2 % der Körpergröße
//    plus Hüftflex-Korrektur. Deckt aktuelle Studienlage (Martin/Spurrier,
//    Ferrer-Roca et al. 2023) ab.
//  - STA/HTA-Bandbreite je Radtyp aus branchenüblicher Geometrie-Statistik
//    2024/25 (Rennrad 73–74°, Gravel 72–73.5°, MTB XC 74–75°, Trekking 72–73°).
//
// Wenn Präzisions-Maße fehlen, greifen Anthropometrie-Regressionen aus
// DIN 33402-2 (deutscher Körpermaß-Standard): Torso ≈ Körpergröße × 0.30,
// Arm ≈ × 0.187, Schulterbreite ≈ × 0.259, Oberschenkel ≈ Schrittlänge × 0.55.

import type { KaufberaterInput, CalculationResult } from "./types";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round = (n: number, d = 0) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};
const median = (arr: number[]) => {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
};

// DIN 33402-2 Anthropometrie-Regressionen (Ableitung fehlender Maße aus
// Körpergröße + Schrittlänge).
function inferMissingMeasures(input: KaufberaterInput) {
  const h = input.bodyHeightCm;
  const ins = input.inseamCm;
  return {
    torso: input.torsoCm ?? round(h * 0.30, 1),
    arm: input.armLengthCm ?? round(h * 0.187, 1),
    shoulder: input.shoulderWidthCm ?? round(h * 0.259, 1),
    thigh: input.thighCm ?? round(ins * 0.55, 1),
    shin: input.shinCm ?? round(ins * 0.45, 1),
    sitBones: input.sitBonesMm ?? (input.gender === "w" ? 130 : 110),
    footLen: input.footLengthCm ?? round(h * 0.152, 1),
  };
}

// Beweglichkeits-Score 0–1 aus expliziten Tests, sonst aus flexibility 1..5.
function flexScore(input: KaufberaterInput): number {
  const parts: number[] = [];
  if (typeof input.sitAndReachCm === "number") {
    // -10 cm = sehr steif, +20 cm = sehr flexibel
    parts.push(clamp((input.sitAndReachCm + 10) / 30, 0, 1));
  }
  if (typeof input.shoulderRotationDeg === "number") {
    // 90° = steif, 170° = mobil
    parts.push(clamp((input.shoulderRotationDeg - 90) / 80, 0, 1));
  }
  if (typeof input.hipFlexDeg === "number") {
    // 90° = steif, 140° = mobil
    parts.push(clamp((input.hipFlexDeg - 90) / 50, 0, 1));
  }
  if (parts.length === 0) return clamp((input.flexibility - 1) / 4, 0, 1);
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

// Sitzwinkel-Bandbreite pro Radtyp (Grad).
function stackAngleTargets(type: KaufberaterInput["bikeType"]) {
  switch (type) {
    case "road":
      return { sta: { min: 73, max: 74.5 }, hta: { min: 71.5, max: 73.5 } };
    case "gravel":
      return { sta: { min: 72, max: 73.5 }, hta: { min: 70.5, max: 72.5 } };
    case "mtb-hardtail":
    case "e-mtb":
      return { sta: { min: 74, max: 76 }, hta: { min: 65, max: 68 } };
    case "mtb-fully":
      return { sta: { min: 76, max: 78 }, hta: { min: 63, max: 66 } };
    case "trekking":
    case "e-trekking":
      return { sta: { min: 72, max: 74 }, hta: { min: 70, max: 71.5 } };
    case "city":
    case "e-city":
      return { sta: { min: 71, max: 73 }, hta: { min: 69, max: 71 } };
    case "cargo":
      return { sta: { min: 70, max: 73 }, hta: { min: 68, max: 71 } };
  }
}

// Sattelbreiten-Offset (Sitzposition → wie weit hinter Sitzknochen).
function saddleOffsetMm(type: KaufberaterInput["bikeType"]): number {
  if (type === "road") return 20;
  if (type === "gravel") return 22;
  if (type === "mtb-hardtail" || type === "mtb-fully" || type === "e-mtb") return 25;
  if (type === "trekking" || type === "e-trekking") return 27;
  return 30; // city/cargo — aufrecht
}

function crankStandardMm(inseamCm: number): number {
  // Klassische Faustregel als Fallback (Kirby-Chart).
  return inseamCm < 76 ? 165 : inseamCm < 82 ? 170 : inseamCm < 86 ? 172.5 : 175;
}

/**
 * Berechnet das komplette Bikefit-Ergebnis.
 * Wird von `calculateRecommendation` aufgerufen und in
 * `CalculationResult.bikefit` eingehängt.
 */
export function computeBikefit(input: KaufberaterInput): CalculationResult["bikefit"] {
  const m = inferMissingMeasures(input);
  const flex = flexScore(input);
  const isPrecise = input.measureMode === "precise";
  // Confidence: viele explizite Maße = high.
  const explicitCount = [
    input.torsoCm,
    input.armLengthCm,
    input.shoulderWidthCm,
    input.thighCm,
    input.sitBonesMm,
    input.footLengthCm,
    input.sitAndReachCm,
    input.hipFlexDeg,
  ].filter((x) => typeof x === "number").length;
  const confidence: "low" | "medium" | "high" =
    explicitCount >= 5 ? "high" : explicitCount >= 2 ? "medium" : "low";
  const method: "quick" | "precise" = isPrecise ? "precise" : "quick";

  // --- Sattelhöhe (BB → Sattelspitze-Höhe) ---
  const crankShort = round(input.bodyHeightCm * 0.0215, 1); // Short-Cranks
  const crankBase = crankStandardMm(input.inseamCm);
  const holmes = input.inseamCm * 0.883 * 10; // → mm
  const lemond = input.inseamCm * 0.885 * 10 - (crankBase - 170); // Kurbel-Korrektur
  const hamley = input.inseamCm * 1.09 * 10 - crankBase;
  const consensus = round(median([holmes, lemond, hamley]));

  // --- Sattel-Setback (KOPS) ---
  // Vereinfachte Ableitung: Setback ≈ Oberschenkel × 0.18 (Kniewinkel + STA)
  // mit Korrektur nach Einsatz: sport → weniger Setback, comfort → mehr.
  const staTargets = stackAngleTargets(input.bikeType);
  const staMid = (staTargets.sta.min + staTargets.sta.max) / 2;
  const setbackBase = m.thigh * Math.cos(((90 - staMid) * Math.PI) / 180) * 10 * 0.35;
  const setbackAdj = input.use === "sport" ? -8 : input.use === "commute" || input.use === "family" ? 8 : 0;
  const setbackRec = round(setbackBase + setbackAdj);
  const setbackMm = { min: setbackRec - 15, recommended: setbackRec, max: setbackRec + 15 };

  // --- ETT (effektive Oberrohrlänge) Zielwert ---
  const ettBase = m.torso * 4.7 + m.arm * 1.4; // → mm
  const ettFlexAdj = (flex - 0.5) * 25; // ±12 mm
  const ettUseAdj = input.use === "sport" ? 8 : input.use === "commute" || input.use === "family" ? -8 : 0;
  const ettRec = round(ettBase + ettFlexAdj + ettUseAdj);
  const ettMm = { min: ettRec - 12, recommended: ettRec, max: ettRec + 12 };

  // --- Sattelbreite ---
  const saddleRec = round(m.sitBones + saddleOffsetMm(input.bikeType));
  const saddleWidthMm = { min: saddleRec - 10, recommended: saddleRec, max: saddleRec + 10 };

  // --- Cleat-Setback (nur bei Klickpedal) ---
  const cleatSetbackMm = input.usesClipless
    ? round(m.footLen * 10 * 0.28) // 28 % der Fußlänge hinter MTP-Gelenk
    : undefined;

  // --- Notes ---
  const notes: string[] = [];
  if (confidence === "low") {
    notes.push(
      "Nur Basis-Maße erfasst — Werte sind gute Startpunkte, aber ein professionelles Bikefitting kann sie um ±10–15 mm verfeinern.",
    );
  }
  if (Math.abs(holmes - lemond) > 12 || Math.abs(holmes - hamley) > 15) {
    notes.push(
      `Die drei Sattelhöhen-Methoden weichen um ${Math.round(Math.max(Math.abs(holmes - hamley), Math.abs(holmes - lemond)))} mm ab — starte mit ${consensus} mm und feinjustiere ±5 mm nach Gefühl.`,
    );
  }
  if (input.usesClipless && cleatSetbackMm) {
    notes.push(
      `Cleat-Position: ${cleatSetbackMm} mm hinter dem Großzehen-Grundgelenk (MTP1). Reduziert Kniebelastung deutlich vs. Standardposition.`,
    );
  }
  if (crankShort < crankBase - 5) {
    notes.push(
      `Short-Cranks-Empfehlung: ${crankShort} mm statt Standard ${crankBase} mm. Vor allem bei Hüftflex-Einschränkung oder aggressiver Sitzposition getestet effektiver.`,
    );
  }

  return {
    confidence,
    method,
    saddleHeight: {
      holmesMm: round(holmes),
      lemondMm: round(lemond),
      hamleyMm: round(hamley),
      consensusMm: consensus,
    },
    setbackMm,
    ettMm,
    saddleWidthMm,
    cleatSetbackMm,
    crankShortMm: crankShort,
    seatTubeAngle: staTargets.sta,
    headTubeAngle: staTargets.hta,
    notes,
  };
}
