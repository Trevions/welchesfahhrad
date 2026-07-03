// Reifendruck-Berechnung — angelehnt an Frank Berto (~15 % Reifendurchbiegung
// bei Zielgewicht) und aktuelle SRAM/Silca-Empfehlungen, ergänzt um
// Achslast-Korrektur, Laufradgrößen-Faktor und Setup-Anpassung.
//
// Zielband stammt aus PRESSURE_TABLE (Referenz 75 kg Systemgewicht,
// 700C/28"). Das Band wird mit dem tatsächlichen Systemgewicht linear
// skaliert (~0,9 % pro kg), pro Achse per Achslast-Anteil verteilt, dann
// per Untergrund / Setup / Fahrstil verschoben. Sicherheits-Cap begrenzt
// jeden Wert auf den bautypischen Maximaldruck des Reifens.

export type Surface = "smooth" | "rough" | "gravel" | "mixed" | "mtb";
export type Setup = "tubeless" | "butyl" | "latex";
export type Style = "comfort" | "balanced" | "performance";
export type UseCase = "road" | "gravel" | "mtb" | "trekking" | "ebike" | "cargo";
export type WheelSize = "700c" | "650b" | "26" | "20";

type Warning = { level: "info" | "warn" | "danger"; text: string };

export type PressureResult = {
  front: number;
  rear: number;
  frontPsi: number;
  rearPsi: number;
  band: { min: number; max: number };
  hardCap: number;
  warnings: Warning[];
};

const PRESSURE_TABLE: Array<{ width: number; min: number; max: number; hardCap: number }> = [
  { width: 23, min: 6.5, max: 8.5, hardCap: 8.0 },
  { width: 25, min: 6.0, max: 8.0, hardCap: 8.0 },
  { width: 28, min: 5.0, max: 7.0, hardCap: 7.0 },
  { width: 30, min: 4.5, max: 6.5, hardCap: 6.5 },
  { width: 32, min: 4.0, max: 6.0, hardCap: 6.5 },
  { width: 35, min: 2.5, max: 4.5, hardCap: 5.5 },
  { width: 40, min: 2.0, max: 4.0, hardCap: 5.0 },
  { width: 45, min: 1.8, max: 3.5, hardCap: 4.5 },
  { width: 50, min: 1.5, max: 3.0, hardCap: 4.0 },
  { width: 55, min: 1.2, max: 2.5, hardCap: 3.5 },
  { width: 60, min: 1.1, max: 2.3, hardCap: 3.0 },
  { width: 70, min: 1.0, max: 2.0, hardCap: 2.8 },
];

function interpolate(width: number) {
  const t = PRESSURE_TABLE;
  if (width <= t[0].width) return t[0];
  if (width >= t[t.length - 1].width) return t[t.length - 1];
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i];
    const b = t[i + 1];
    if (width >= a.width && width <= b.width) {
      const f = (width - a.width) / (b.width - a.width);
      return {
        width,
        min: a.min + (b.min - a.min) * f,
        max: a.max + (b.max - a.max) * f,
        hardCap: a.hardCap + (b.hardCap - a.hardCap) * f,
      };
    }
  }
  return t[t.length - 1];
}

// Kleinere Laufräder brauchen bei gleicher Reifenbreite mehr Druck, weil das
// Luftvolumen kleiner ist und der Reifen unter gleicher Last stärker
// einfedert. Faktoren empirisch, angelehnt an Schwalbe-Empfehlungen.
const WHEEL_FACTOR: Record<WheelSize, number> = {
  "700c": 1.0,
  "650b": 1.05,
  "26": 1.08,
  "20": 1.22,
};

// Einsatzbereich-Bias auf das Druckband: E-Bike/Cargo bringen Zusatzgewicht,
// das bei der Achslast oft nicht komplett drin ist (Motor + Akku hinten,
// Ladung vorne). MTB/Gravel schon durch surface abgedeckt — hier neutral.
const USE_BIAS: Record<UseCase, number> = {
  road: 0,
  gravel: 0,
  mtb: 0,
  trekking: 0.1,
  ebike: 0.25,
  cargo: 0.35,
};

export function calculatePressure(input: {
  systemWeightKg: number;
  tireWidthMm: number;
  wheelSize: WheelSize;
  useCase: UseCase;
  surface: Surface;
  setup: Setup;
  style: Style;
  // Achslast-Anteil vorne in % (Rest hinten). 40 = 40 % vorne / 60 % hinten.
  frontLoadPct: number;
  maxManufacturerBar: number | null;
}): PressureResult {
  const range = interpolate(input.tireWidthMm);
  const wheelFactor = WHEEL_FACTOR[input.wheelSize];

  // Referenz-Systemgewicht 75 kg, Referenz-Verteilung 40/60 vorne/hinten.
  // Mittelwert des Druckbandes bei Referenz.
  const midRef = ((range.min + range.max) / 2) * wheelFactor;

  // Achslastfaktor: bei 40 % vorne / 60 % hinten läuft der klassische
  // 10-%-Front-Delta. Bei 50/50 sind beide gleich; bei Cargo mit 30/70
  // muss hinten deutlich mehr Druck rauf.
  const wF = input.systemWeightKg * (input.frontLoadPct / 100);
  const wR = input.systemWeightKg * (1 - input.frontLoadPct / 100);

  // Berto-Skalierung: linear ~0,9 % Druck pro kg Achslast-Abweichung vom
  // Referenz-Anteil (=75 kg × 40/60).
  const refFront = 75 * 0.4;
  const refRear = 75 * 0.6;

  let rear = midRef * (1 + (wR - refRear) * 0.009);
  let front = midRef * (1 + (wF - refFront) * 0.009);

  // Untergrund
  const surfaceAdj: Record<Surface, number> = {
    smooth: 0,
    rough: -0.25,
    gravel: -0.6,
    mixed: -0.35,
    mtb: -1.0,
  };
  rear += surfaceAdj[input.surface];
  front += surfaceAdj[input.surface];

  // Setup
  if (input.setup === "tubeless") {
    rear -= 0.3;
    front -= 0.3;
  } else if (input.setup === "latex") {
    rear -= 0.1;
    front -= 0.1;
  }

  // Fahrstil
  const styleAdj: Record<Style, number> = { comfort: -0.3, balanced: 0, performance: 0.25 };
  rear += styleAdj[input.style];
  front += styleAdj[input.style];

  // Einsatzbereich-Bias (E-Bike, Cargo, Trekking)
  const useBias = USE_BIAS[input.useCase];
  rear += useBias;
  front += useBias;

  // Sicherheits-Cap: nie über bautypischem Maximum der Reifenbreite.
  const hardCap = range.hardCap * wheelFactor;
  const warnings: Warning[] = [];

  const bandMin = Math.max(range.min * wheelFactor - 0.5, 0.8);
  const bandMax = hardCap;

  const rawRear = rear;
  const rawFront = front;

  rear = Math.min(Math.max(rear, 0.8), hardCap);
  front = Math.min(Math.max(front, 0.7), hardCap);

  if (input.maxManufacturerBar && input.maxManufacturerBar > 0) {
    if (rawRear > input.maxManufacturerBar || rawFront > input.maxManufacturerBar) {
      warnings.push({
        level: "danger",
        text: `Berechneter Druck läge über dem Hersteller-Maximum von ${input.maxManufacturerBar} bar — Reifenflanke hat Vorrang, Wert wurde gekappt.`,
      });
    }
    rear = Math.min(rear, input.maxManufacturerBar);
    front = Math.min(front, input.maxManufacturerBar);
  }

  if (rawRear < bandMin || rawFront < bandMin) {
    warnings.push({
      level: "warn",
      text: `Empfohlener Druck liegt unter dem plausiblen Minimum für ${input.tireWidthMm} mm — Snakebite- und Felgenkontakt-Gefahr. Prüfe Reifenbreite und Systemgewicht.`,
    });
  }
  if (rawRear > hardCap) {
    warnings.push({
      level: "danger",
      text: `Berechneter Hinterrad-Druck (${rawRear.toFixed(1)} bar) überschreitet den bautypischen Maximaldruck dieser Reifenbreite (${hardCap.toFixed(1)} bar) — auf die Angabe der Reifenflanke prüfen.`,
    });
  }
  if (input.useCase === "ebike" && input.tireWidthMm < 35) {
    warnings.push({
      level: "info",
      text: "E-Bikes profitieren von Reifen ≥ 40 mm — kleinere Breiten leiden bei Mehrgewicht schneller unter Snakebites.",
    });
  }

  return {
    front: +front.toFixed(1),
    rear: +rear.toFixed(1),
    frontPsi: Math.round(front * 14.5038),
    rearPsi: Math.round(rear * 14.5038),
    band: { min: +bandMin.toFixed(1), max: +bandMax.toFixed(1) },
    hardCap: +hardCap.toFixed(1),
    warnings,
  };
}
