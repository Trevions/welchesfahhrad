// Radel-Score: deterministischer Index 0–100.
// Reine Funktionen — kein Fetch, kein State. Eingaben stammen aus useBikeWeather
// und (optional) Open-Meteo Air-Quality (Pollen).

export type ScoreInputs = {
  precipProb: number; // % nächste 1–3h (Mittel)
  precipNow: number; // mm/h aktuell
  windSpeed: number; // km/h
  windGust: number; // km/h
  apparentTemp: number; // °C gefühlt
  humidity: number; // %
  pollenLevel?: "low" | "medium" | "high" | "very_high"; // nur wenn Allergiker-Modus
  minutesToSunset?: number | null; // null = keine Info
};

export type Deduction = {
  key: string;
  label: string;
  value: string;
  points: number; // negative Zahl
};

export type ScoreResult = {
  score: number;
  rating: "Perfekt" | "Sehr gut" | "Okay" | "Mäßig" | "Schlecht";
  tone: "emerald" | "lime" | "amber" | "orange" | "rose";
  colorHex: string;
  deductions: Deduction[];
  glaetteWarning: boolean;
  recommendation: string;
};

function deductPrecip(i: ScoreInputs): Deduction {
  const p = i.precipProb;
  let pts = 0;
  if (p >= 70) pts = -35;
  else if (p >= 50) pts = -25;
  else if (p >= 30) pts = -15;
  else if (p >= 10) pts = -5;
  if (i.precipNow > 0.5) pts -= 5;
  pts = Math.max(-40, pts);
  return { key: "precip", label: "Niederschlag", value: `${Math.round(p)}% · ${i.precipNow.toFixed(1)} mm/h`, points: pts };
}

function deductWind(i: ScoreInputs): Deduction {
  const w = i.windSpeed;
  let pts = 0;
  if (w > 40) pts = -25;
  else if (w >= 30) pts = -18;
  else if (w >= 20) pts = -10;
  else if (w >= 10) pts = -3;
  if (i.windGust > 50) pts -= 5;
  pts = Math.max(-25, pts);
  return { key: "wind", label: "Wind", value: `${Math.round(w)} km/h${i.windGust > 50 ? ` · Böen ${Math.round(i.windGust)}` : ""}`, points: pts };
}

function deductTemp(i: ScoreInputs): Deduction {
  const t = i.apparentTemp;
  let pts = 0;
  if (t < 0 || t > 35) pts = -20;
  else if (t < 5 || t > 32) pts = -15;
  else if (t < 10 || t > 28) pts = -10;
  else if (t < 15 || t > 24) pts = -4;
  return { key: "temp", label: "Gefühlte Temperatur", value: `${Math.round(t)} °C`, points: pts };
}

function deductPollen(i: ScoreInputs): Deduction | null {
  if (!i.pollenLevel) return null;
  const map = { low: 0, medium: -4, high: -7, very_high: -10 } as const;
  const labels = { low: "niedrig", medium: "mittel", high: "hoch", very_high: "sehr hoch" } as const;
  return { key: "pollen", label: "Pollenbelastung", value: labels[i.pollenLevel], points: map[i.pollenLevel] };
}

function deductLight(i: ScoreInputs): Deduction | null {
  if (i.minutesToSunset == null) return null;
  if (i.minutesToSunset < 0) {
    return { key: "light", label: "Tageslicht", value: "nach Sonnenuntergang", points: -5 };
  }
  if (i.minutesToSunset < 120) {
    return { key: "light", label: "Tageslicht", value: `noch ${Math.round(i.minutesToSunset)} min bis Sonnenuntergang`, points: -3 };
  }
  return { key: "light", label: "Tageslicht", value: "reichlich", points: 0 };
}

export function computeRadelScore(i: ScoreInputs): ScoreResult {
  const deductions: Deduction[] = [deductPrecip(i), deductWind(i), deductTemp(i)];
  const p = deductPollen(i);
  if (p) deductions.push(p);
  const l = deductLight(i);
  if (l) deductions.push(l);

  let score = 100 + deductions.reduce((s, d) => s + d.points, 0);

  // Glätte-Override
  const glaetteWarning = i.apparentTemp <= 2 && (i.precipNow > 0.05 || i.precipProb > 40 || i.humidity > 88);
  if (glaetteWarning) score = Math.min(score, 25);

  score = Math.max(0, Math.min(100, score));

  let rating: ScoreResult["rating"];
  let tone: ScoreResult["tone"];
  let colorHex: string;
  if (score >= 85) { rating = "Perfekt"; tone = "emerald"; colorHex = "#10b981"; }
  else if (score >= 70) { rating = "Sehr gut"; tone = "lime"; colorHex = "#84cc16"; }
  else if (score >= 50) { rating = "Okay"; tone = "amber"; colorHex = "#f59e0b"; }
  else if (score >= 30) { rating = "Mäßig"; tone = "orange"; colorHex = "#f97316"; }
  else { rating = "Schlecht"; tone = "rose"; colorHex = "#ef4444"; }

  const recommendation = pickRecommendation(i, score, glaetteWarning);

  return { score, rating, tone, colorHex, deductions, glaetteWarning, recommendation };
}

function pickRecommendation(i: ScoreInputs, score: number, glaette: boolean): string {
  if (glaette) return "Glättegefahr — heute besser nicht fahren oder Spikes-Reifen und äußerste Vorsicht in Kurven.";
  if (i.windSpeed >= 25) return "Windjacke einpacken. Auf West-/Nordwest-Routen mit deutlichem Gegenwind rechnen.";
  if (i.precipProb >= 50) return "Regenjacke und Schutzbleche mitnehmen — spätestens in 1–3 Std zieht Niederschlag durch.";
  if (i.apparentTemp >= 28) return "Viel trinken, früh oder spät fahren, hellere Kleidung und Sonnenschutz.";
  if (i.apparentTemp <= 5) return "Warm anziehen: Buff, lange Handschuhe, Überschuhe. Reifendruck 0,2 bar reduzieren.";
  if (i.minutesToSunset != null && i.minutesToSunset < 120) return "Beleuchtung nach StVZO einschalten — Dämmerung setzt in weniger als 2 Std ein.";
  if (score >= 85) return "Ideale Bedingungen — perfekter Tag für die lange Tour.";
  return "Solide Bedingungen — normale Ausrüstung reicht.";
}

// -------- Pollen helper (Open-Meteo Air-Quality: Werte in Pollen/m³) --------
export function pollenLevelFromValues(v: {
  birch?: number; grass?: number; ragweed?: number; alder?: number;
}): "low" | "medium" | "high" | "very_high" {
  const max = Math.max(v.birch ?? 0, v.grass ?? 0, v.ragweed ?? 0, v.alder ?? 0);
  if (max >= 50) return "very_high";
  if (max >= 20) return "high";
  if (max >= 5) return "medium";
  return "low";
}
