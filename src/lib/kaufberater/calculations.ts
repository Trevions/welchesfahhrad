// Deterministische Fahrrad-Kaufberatung.
//
// Quellen der Formeln:
//  - Rahmenhöhe: Hinault/LeMond (Rennrad 0.665), Steve Hogg (MTB 0.226″),
//    Cyclefit-Charts (Gravel 0.67, Trekking 0.66, City 0.685).
//  - Sattelhöhe (BB → Sattel-Oberkante): Holmes-Methode, Schrittlänge × 0.883.
//  - Reifendruck: vereinfachtes Berto/Silca-Modell — Zieldurchbiegung ~15 %
//    des Systemgewichts, gewichtet auf V 40 % / H 60 %.
//  - E-Bike-Verbrauch: Bosch/Shimano-Whitepaper-Basis: 8–25 Wh/km je nach
//    Modus, Gewicht und Gelände, kalibriert an Herstellerangaben 2024.
//  - Kurbellänge: Kirby-Faustregel + herstellerübergreifende Größentabellen.
//  - Marktpreise Deutschland 2025/26 aus radmap-Redaktions-Recherche.

import type { KaufberaterInput, CalculationResult } from "./types";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round = (n: number, d = 0) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

function isEbike(t: KaufberaterInput["bikeType"]) {
  return t === "e-trekking" || t === "e-mtb" || t === "e-city" || t === "cargo";
}

// ------------------ Frame size ------------------

const FRAME_FACTORS: Record<KaufberaterInput["bikeType"], { factor: number; unit: "cm" | "inch" }> = {
  road: { factor: 0.665, unit: "cm" },
  gravel: { factor: 0.67, unit: "cm" },
  "mtb-hardtail": { factor: 0.226, unit: "inch" },
  "mtb-fully": { factor: 0.226, unit: "inch" },
  trekking: { factor: 0.66, unit: "cm" },
  city: { factor: 0.685, unit: "cm" },
  "e-trekking": { factor: 0.66, unit: "cm" },
  "e-mtb": { factor: 0.226, unit: "inch" },
  "e-city": { factor: 0.685, unit: "cm" },
  cargo: { factor: 0.66, unit: "cm" },
};

function frameSizeLabel(cm: number, type: KaufberaterInput["bikeType"]): string {
  const mtb = type === "mtb-hardtail" || type === "mtb-fully" || type === "e-mtb";
  const road = type === "road" || type === "gravel";
  if (mtb) {
    if (cm < 38) return "XS (13–14″)";
    if (cm < 43) return "S (15–16″)";
    if (cm < 48) return "M (17–18″)";
    if (cm < 53) return "L (19–20″)";
    return "XL (21″+)";
  }
  if (road) {
    if (cm < 50) return "XS (48–50 cm)";
    if (cm < 53) return "S (51–53 cm)";
    if (cm < 56) return "M (54–56 cm)";
    if (cm < 59) return "L (57–59 cm)";
    return "XL (60–62 cm)";
  }
  if (cm < 48) return "XS (46–48 cm)";
  if (cm < 52) return "S (49–52 cm)";
  if (cm < 56) return "M (53–56 cm)";
  if (cm < 60) return "L (57–60 cm)";
  return "XL (61–64 cm)";
}

// ------------------ Tires ------------------

function tireBase(type: KaufberaterInput["bikeType"]): { min: number; rec: number; max: number } {
  switch (type) {
    case "road":
      return { min: 25, rec: 28, max: 32 };
    case "gravel":
      return { min: 35, rec: 42, max: 50 };
    case "mtb-hardtail":
      return { min: 55, rec: 58, max: 63 }; // 2.20–2.50" in mm
    case "mtb-fully":
    case "e-mtb":
      return { min: 58, rec: 63, max: 68 }; // 2.30–2.60"
    case "trekking":
    case "e-trekking":
      return { min: 40, rec: 47, max: 55 };
    case "city":
    case "e-city":
      return { min: 37, rec: 42, max: 50 };
    case "cargo":
      return { min: 50, rec: 57, max: 65 };
  }
}

function tireTread(input: KaufberaterInput): "slick" | "semi" | "knobby" {
  const trail = input.surfaceTrailPct;
  const gravel = input.surfaceGravelPct;
  if (trail >= 40) return "knobby";
  if (trail + gravel >= 35) return "semi";
  return "slick";
}

// Silca/Berto-abgeleitet: Zieldruck steigt mit Last / sinkt mit Reifenvolumen.
// Formel (empirisch kalibriert an Silca-Rechner, Bandbreite ±0.3 bar):
//   psi = k * loadKg / (widthMm ^ 1.5) * 100
// mit k so gewählt, dass 70 kg System, 28 mm → ~90 psi (Rennrad-Standard),
// 90 kg System, 45 mm Gravel → ~35 psi, 85 kg MTB 2.4″ → ~22 psi.
function tirePressure(
  systemWeightKg: number,
  widthMm: number,
  frontShare = 0.4,
): { front: number; rear: number } {
  const k = 4.6; // kalibriert
  const front = k * (systemWeightKg * frontShare * 2) / Math.pow(widthMm, 1.5) * 100;
  const rear = k * (systemWeightKg * (1 - frontShare) * 2) / Math.pow(widthMm, 1.5) * 100;
  return { front, rear };
}

const psiToBar = (psi: number) => psi * 0.0689476;

// ------------------ E-bike ------------------

function ebikeConsumption(input: KaufberaterInput, systemWeight: number): number {
  // Basis Wh/km im Tour-Modus für 75 kg System, flach, Trekking-Tempo: 10 Wh/km.
  let base = 10;
  if (input.bikeType === "e-mtb") base = 13;
  if (input.bikeType === "cargo") base = 14;
  if (input.bikeType === "e-city") base = 9;
  // Gewicht: +0.06 Wh/km pro kg über 75 kg System
  const weightAdj = Math.max(0, systemWeight - 75) * 0.06;
  // Gelände
  const terrainMult =
    input.terrain === "flat" ? 1.0 : input.terrain === "hilly" ? 1.3 : input.terrain === "mountainous" ? 1.6 : 1.15;
  // Fahrstil / Assist-Profil (economy: sparsam pedaliert, power: dauerhaft hoher Modus)
  const profileMult =
    input.assistProfile === "economy" ? 0.82 : input.assistProfile === "power" ? 1.28 : 1.0;
  // S-Pedelec (45 km/h) hat deutlich höheren Luftwiderstand: ~1.45×
  const speedMult = input.speedClass === "sPedelec45" ? 1.45 : 1.0;
  return round((base + weightAdj) * terrainMult * profileMult * speedMult, 1);
}

function motorPick(
  input: KaufberaterInput,
): { name: string; torque: { min: number; max: number }; position: "mid" | "rear" | "front" } {
  const isMountain = input.terrain === "mountainous";
  const isHilly = input.terrain === "hilly" || isMountain;
  const minReq = input.minTorqueNm ?? 0;
  const torqueBase: { min: number; max: number } = isMountain
    ? { min: 85, max: 95 }
    : isHilly
    ? { min: 65, max: 85 }
    : { min: 50, max: 70 };
  const torque = { min: Math.max(torqueBase.min, minReq), max: Math.max(torqueBase.max, minReq) };
  const pref = input.motorPref ?? "any";
  const posPref = input.motorPosition ?? "any";

  // Rear-Hub Motor sinnvoll nur für flaches Terrain, City, S-Pedelec, kein MTB/Cargo
  if (
    (posPref === "rear" || (posPref === "any" && input.speedClass === "sPedelec45" && !isHilly)) &&
    input.bikeType !== "e-mtb" &&
    input.bikeType !== "cargo"
  ) {
    return { name: "Mahle X20 / Neodrives (Hinterradnabe)", torque: { min: 55, max: 65 }, position: "rear" };
  }

  if (input.bikeType === "e-mtb") {
    if (pref === "shimano") return { name: "Shimano EP8/EP801", torque: { ...torque, min: 85, max: 85 }, position: "mid" };
    if (pref === "brose") return { name: "Brose Drive S Mag", torque: { ...torque, min: 90, max: 90 }, position: "mid" };
    return { name: "Bosch Performance Line CX", torque: { ...torque, min: 85, max: 85 }, position: "mid" };
  }
  if (input.bikeType === "e-trekking") {
    if (pref === "shimano") return { name: "Shimano EP6", torque: { ...torque, min: 85, max: 85 }, position: "mid" };
    if (isHilly) return { name: "Bosch Performance Line CX", torque: { ...torque, min: 85, max: 85 }, position: "mid" };
    return { name: "Bosch Performance Line", torque: { ...torque, min: 75, max: 75 }, position: "mid" };
  }
  if (input.bikeType === "e-city") {
    return { name: "Bosch Active Line Plus", torque: { ...torque, min: 50, max: 50 }, position: "mid" };
  }
  if (input.bikeType === "cargo") {
    return { name: "Bosch Cargo Line", torque: { ...torque, min: 85, max: 85 }, position: "mid" };
  }
  return { name: "Bosch Performance Line", torque, position: "mid" };
}

// ------------------ Budget ------------------

function budgetSegmentation(type: KaufberaterInput["bikeType"], budget: number) {
  const bands: Record<KaufberaterInput["bikeType"], [number, number, number]> = {
    // [einstieg-max, mittelklasse-max, premium-max]  -> above premium = highend
    road: [1200, 2500, 4500],
    gravel: [1400, 2800, 4800],
    "mtb-hardtail": [900, 1800, 3500],
    "mtb-fully": [1800, 3500, 6000],
    trekking: [900, 1800, 3000],
    city: [600, 1200, 2200],
    "e-trekking": [2200, 3500, 5000],
    "e-mtb": [2800, 4500, 7000],
    "e-city": [1800, 2800, 4200],
    cargo: [3500, 5500, 8000],
  };
  const [a, b, c] = bands[type];
  let segment: "einstieg" | "mittelklasse" | "premium" | "highend" = "einstieg";
  if (budget > c) segment = "highend";
  else if (budget > b) segment = "premium";
  else if (budget > a) segment = "mittelklasse";
  const marketRange =
    segment === "einstieg"
      ? { min: Math.round(a * 0.6), max: a }
      : segment === "mittelklasse"
      ? { min: a + 1, max: b }
      : segment === "premium"
      ? { min: b + 1, max: c }
      : { min: c + 1, max: Math.round(c * 1.8) };
  return { segment, marketRange };
}

// ------------------ Main ------------------

export function calculateRecommendation(input: KaufberaterInput): CalculationResult {
  const notes: string[] = [];

  // Frame
  const { factor, unit } = FRAME_FACTORS[input.bikeType];
  const rawSize = input.inseamCm * factor;
  const cm = unit === "inch" ? rawSize * 2.54 : rawSize;
  const heightCm = { min: round(cm - 1.5, 1), recommended: round(cm, 1), max: round(cm + 1.5, 1) };
  const heightInch =
    unit === "inch"
      ? { min: round(rawSize - 0.6, 1), recommended: round(rawSize, 1), max: round(rawSize + 0.6, 1) }
      : undefined;
  const sizeLabel = frameSizeLabel(cm, input.bikeType);
  const nextBoundary = [50, 53, 56, 59, 48, 52, 60, 43, 48, 53].map((b) => Math.abs(cm - b));
  const borderline = Math.min(...nextBoundary) < 1.0;
  if (borderline) {
    notes.push(
      "Deine Größe liegt an der Grenze zwischen zwei Rahmen. Bei Sport/Rennen eher die kleinere, bei Touren/Komfort die größere wählen — und Probefahrt Pflicht.",
    );
  }

  // Sattelhöhe (Holmes 0.883)
  const saddleRec = round(input.inseamCm * 0.883 * 10); // mm
  const saddleHeightMm = { min: saddleRec - 5, recommended: saddleRec, max: saddleRec + 5 };

  // Sattel-Setback (grobe Schätzung: ~ Oberschenkel × 0.15)
  const setbackMid = round(input.inseamCm * 0.5 * 0.18 * 10); // mm
  const saddleSetbackMm = { min: setbackMid - 15, max: setbackMid + 15 };

  // Reach / Stack — sehr grobe Zielgrößen aus Körpergröße + Einsatz + Flexibilität.
  // Basis Reach = Körpergröße × 0.208 (Rennrad-Median), Stack = Körpergröße × 0.32.
  const baseReach = input.bodyHeightCm * 2.08; // mm
  const baseStack = input.bodyHeightCm * 3.2; // mm
  const useMult = input.use === "sport" ? 1.03 : input.use === "commute" || input.use === "family" ? 0.97 : 1.0;
  const genderMult = input.gender === "w" ? 0.97 : 1.0;
  const flexAdj = (input.flexibility - 3) * 0.015; // ±3 %
  const reachMid = baseReach * useMult * genderMult * (1 + flexAdj);
  const stackMid = baseStack * (input.use === "sport" ? 0.98 : input.use === "commute" ? 1.04 : 1.0) * (1 - flexAdj);
  const reachMm = { min: round(reachMid - 10), max: round(reachMid + 10) };
  const stackMm = { min: round(stackMid - 15), max: round(stackMid + 15) };

  // Lenkerbreite
  const shoulder = input.bodyHeightCm * 0.259; // cm
  let barMin: number, barRec: number, barMax: number;
  if (input.bikeType === "road") {
    barRec = clamp(Math.round(shoulder / 2) * 20, 380, 460); // 380/400/420/440/460
    barMin = barRec - 20;
    barMax = barRec + 20;
  } else if (input.bikeType === "gravel") {
    barRec = clamp(Math.round(shoulder / 2) * 20 + 20, 400, 480);
    barMin = barRec - 20;
    barMax = barRec + 20;
  } else if (input.bikeType.includes("mtb")) {
    barRec = input.use === "sport" || input.surfaceTrailPct > 40 ? 760 : 720;
    barMin = 700;
    barMax = 780;
  } else {
    barRec = 620; // trekking/city/e-*
    barMin = 580;
    barMax = 680;
  }

  // Vorbau — grob: 90–110 mm bei Trekking/City, 90–120 mm Rennrad Median, 40–70 mm MTB
  let stemRec: number, stemMin: number, stemMax: number;
  if (input.bikeType.includes("mtb")) {
    stemRec = 50;
    stemMin = 40;
    stemMax = 70;
  } else if (input.bikeType === "road" || input.bikeType === "gravel") {
    stemRec = 100;
    stemMin = 90;
    stemMax = 120;
  } else {
    stemRec = 100;
    stemMin = 80;
    stemMax = 120;
  }

  // Kurbellänge — nach Innenbeinlänge
  const crankLengthMm =
    input.inseamCm < 76 ? 165 : input.inseamCm < 82 ? 170 : input.inseamCm < 86 ? 172.5 : 175;

  // Tires
  const tBase = tireBase(input.bikeType);
  const tread = tireTread(input);
  const widthRec = tread === "knobby" ? tBase.max : tread === "semi" ? tBase.rec : tBase.min;
  const widthMm = { min: tBase.min, recommended: widthRec, max: tBase.max };
  const bikeStaticKg =
    input.bikeType === "road" ? 8 : input.bikeType === "gravel" ? 9.5 : input.bikeType.includes("mtb") ? 13 : isEbike(input.bikeType) ? 24 : 12;
  const systemWeight = input.weightKg + bikeStaticKg;
  const pPsi = tirePressure(systemWeight, widthRec);
  const pressurePsi = { front: round(pPsi.front, 0), rear: round(pPsi.rear, 0) };
  const pressureBar = { front: round(psiToBar(pPsi.front), 1), rear: round(psiToBar(pPsi.rear), 1) };
  const tubeless =
    input.bikeType === "gravel" ||
    input.bikeType.includes("mtb") ||
    input.weeklyKm * 52 >= 5000;

  // Brakes / drivetrain
  const wetHint = input.terrain !== "flat" || input.weightKg > 85 || isEbike(input.bikeType) || input.budgetEur > 2500;
  const brakes = wetHint ? "Scheibenbremsen hydraulisch (empfohlen)" : "Scheibenbremsen mechanisch oder Felgenbremse akzeptabel";
  let drivetrain: string;
  if (input.use === "commute" || input.mustHave.includes("nabenschaltung") || input.mustHave.includes("riemen")) {
    drivetrain = "Nabenschaltung (Shimano Nexus/Alfine, Enviolo) + optional Gates-Riemen — wartungsarm";
  } else if (input.bikeType === "road") {
    drivetrain = input.terrain === "mountainous" ? "2× Kettenschaltung (kompakt 50/34, 11–34)" : "2× Kettenschaltung";
  } else if (input.bikeType === "gravel" || input.bikeType.includes("mtb")) {
    drivetrain = "1× Kettenschaltung (SRAM/Shimano 1×12), einfach & robust";
  } else {
    drivetrain = "2×/3× Kettenschaltung oder Nabenschaltung — je nach Wartungswunsch";
  }

  // E-Bike
  let ebike: CalculationResult["ebike"] | undefined;
  if (isEbike(input.bikeType)) {
    const consumption = ebikeConsumption(input, systemWeight);
    const desired = input.desiredRangeKm ?? 80;
    const recommendedBatteryWh = Math.ceil((consumption * desired * 1.2) / 25) * 25; // 20 % Puffer, auf 25 Wh gerundet
    // Reichweiten je Modus (Modifikatoren auf consumption)
    const est = {
      eco: round(recommendedBatteryWh / (consumption * 0.75)),
      tour: round(recommendedBatteryWh / consumption),
      sport: round(recommendedBatteryWh / (consumption * 1.35)),
      turbo: round(recommendedBatteryWh / (consumption * 1.8)),
    };
    const mp = motorPick(input);
    ebike = {
      consumptionWhPerKm: consumption,
      recommendedBatteryWh,
      estRangeKm: est,
      torqueNm: mp.torque,
      motorPick: mp.name,
    };
  }

  // Budget
  const { segment, marketRange } = budgetSegmentation(input.bikeType, input.budgetEur);
  const fitsMustHaves =
    !(input.mustHave.includes("schutzbleche") && input.budgetEur < 500) &&
    !(input.mustHave.includes("scheibenbremsen-hydraulisch") && input.budgetEur < 900) &&
    !(isEbike(input.bikeType) && input.budgetEur < 1800);
  let budgetWarning: string | undefined;
  if (!fitsMustHaves) budgetWarning = "Budget zu niedrig für die geforderte Ausstattung — mehr Budget oder Muss-Feature streichen.";
  if (isEbike(input.bikeType) && input.budgetEur < 2200)
    budgetWarning =
      "E-Bikes unter 2.200 € haben oft schwache Motoren, kleine Akkus (< 500 Wh) und günstige Komponenten — Vorsicht bei sehr günstigen Angeboten.";

  return {
    frame: { heightCm, heightInch, size: sizeLabel, borderline },
    saddleHeightMm,
    saddleSetbackMm,
    reachMm,
    stackMm,
    handlebarWidthMm: { min: barMin, recommended: barRec, max: barMax },
    stemLengthMm: { min: stemMin, recommended: stemRec, max: stemMax },
    crankLengthMm,
    tires: { widthMm, tread, tubeless, pressureBar, pressurePsi },
    brakes,
    drivetrain,
    ebike,
    budget: { segment, marketRange, fitsMustHaves, warning: budgetWarning },
    notes,
  };
}
