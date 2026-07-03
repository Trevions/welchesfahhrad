import { z } from "zod";

export const BIKE_TYPE_OPTIONS = [
  "road",
  "gravel",
  "mtb-hardtail",
  "mtb-fully",
  "trekking",
  "city",
  "e-trekking",
  "e-mtb",
  "e-city",
  "cargo",
] as const;
export type KbBikeType = (typeof BIKE_TYPE_OPTIONS)[number];

export const USE_OPTIONS = ["commute", "touring", "sport", "offroad", "family", "travel"] as const;
export type KbUse = (typeof USE_OPTIONS)[number];

export const TERRAIN_OPTIONS = ["flat", "hilly", "mountainous", "mixed"] as const;
export type KbTerrain = (typeof TERRAIN_OPTIONS)[number];

export const GENDER_OPTIONS = ["m", "w", "d"] as const;

export const MOTOR_OPTIONS = ["any", "bosch", "shimano", "brose", "yamaha"] as const;

export const MOTOR_POSITION_OPTIONS = ["any", "mid", "rear", "front"] as const;
export type KbMotorPosition = (typeof MOTOR_POSITION_OPTIONS)[number];

export const ASSIST_PROFILE_OPTIONS = ["economy", "balanced", "power"] as const;
export type KbAssistProfile = (typeof ASSIST_PROFILE_OPTIONS)[number];

export const SPEED_CLASS_OPTIONS = ["pedelec25", "sPedelec45"] as const;
export type KbSpeedClass = (typeof SPEED_CLASS_OPTIONS)[number];

export const FRAME_STYLE_OPTIONS = ["any", "diamond", "trapeze", "wave"] as const;
export type KbFrameStyle = (typeof FRAME_STYLE_OPTIONS)[number];

export const MEASURE_MODE_OPTIONS = ["quick", "precise"] as const;
export type KbMeasureMode = (typeof MEASURE_MODE_OPTIONS)[number];

export const SADDLE_METHOD_OPTIONS = ["holmes", "lemond", "hamley"] as const;

export const KaufberaterInputSchema = z.object({
  bodyHeightCm: z.number().min(120).max(220),
  inseamCm: z.number().min(55).max(110),
  // Erweiterte Bikefit-Maße (optional — nur im "precise"-Modus gefragt).
  measureMode: z.enum(MEASURE_MODE_OPTIONS).nullable().optional(),
  armLengthCm: z.number().min(40).max(90).nullable().optional(),
  torsoCm: z.number().min(40).max(90).nullable().optional(),
  shoulderWidthCm: z.number().min(28).max(60).nullable().optional(),
  thighCm: z.number().min(30).max(70).nullable().optional(),
  shinCm: z.number().min(25).max(60).nullable().optional(),
  sitBonesMm: z.number().min(80).max(170).nullable().optional(),
  footLengthCm: z.number().min(18).max(35).nullable().optional(),
  usesClipless: z.boolean().nullable().optional(),
  // Beweglichkeits-Tests (jeder Wert optional; "Sit and Reach" in cm ±,
  // Schulter-Rotation Grad, Hüftflex Grad). Fallback: flexibility 1..5.
  sitAndReachCm: z.number().min(-30).max(40).nullable().optional(),
  shoulderRotationDeg: z.number().min(0).max(200).nullable().optional(),
  hipFlexDeg: z.number().min(60).max(180).nullable().optional(),
  weightKg: z.number().min(30).max(200),
  gender: z.enum(GENDER_OPTIONS),
  age: z.number().min(10).max(99).nullable().optional(),
  flexibility: z.number().min(1).max(5), // 1 = sehr steif, 5 = sehr flexibel


  bikeType: z.enum(BIKE_TYPE_OPTIONS),
  use: z.enum(USE_OPTIONS),
  weeklyKm: z.number().min(0).max(1000),
  terrain: z.enum(TERRAIN_OPTIONS),
  surfaceAsphaltPct: z.number().min(0).max(100),
  surfaceGravelPct: z.number().min(0).max(100),
  surfaceTrailPct: z.number().min(0).max(100),

  // e-bike (optional)
  motorPref: z.enum(MOTOR_OPTIONS).nullable().optional(),
  motorPosition: z.enum(MOTOR_POSITION_OPTIONS).nullable().optional(),
  assistProfile: z.enum(ASSIST_PROFILE_OPTIONS).nullable().optional(),
  minTorqueNm: z.number().min(30).max(120).nullable().optional(),
  dualBattery: z.boolean().nullable().optional(),
  speedClass: z.enum(SPEED_CLASS_OPTIONS).nullable().optional(),
  frameStyle: z.enum(FRAME_STYLE_OPTIONS).nullable().optional(),
  extraLoadKg: z.number().min(0).max(120).nullable().optional(),
  desiredRangeKm: z.number().min(10).max(400).nullable().optional(),
  supportLevel: z.enum(["eco", "tour", "sport", "turbo"]).nullable().optional(),

  budgetEur: z.number().min(200).max(20000),
  priorities: z.object({
    comfort: z.number().min(1).max(5),
    sport: z.number().min(1).max(5),
    durability: z.number().min(1).max(5),
    weight: z.number().min(1).max(5),
    lowMaintenance: z.number().min(1).max(5),
    style: z.number().min(1).max(5),
  }),
  mustHave: z.array(z.string()).max(20),
});

export type KaufberaterInput = z.infer<typeof KaufberaterInputSchema>;

export type CalculationResult = {
  frame: {
    heightCm: { min: number; recommended: number; max: number };
    heightInch?: { min: number; recommended: number; max: number };
    size: string; // XS..XXL with cm range
    borderline: boolean;
    styleRecommendation?: "diamond" | "trapeze" | "wave" | "any";
    styleReason?: string;
  };
  saddleHeightMm: { min: number; recommended: number; max: number }; // BB → saddle top
  saddleSetbackMm: { min: number; max: number };
  reachMm: { min: number; max: number };
  stackMm: { min: number; max: number };
  handlebarWidthMm: { min: number; recommended: number; max: number };
  stemLengthMm: { min: number; recommended: number; max: number };
  crankLengthMm: number;
  tires: {
    widthMm: { min: number; recommended: number; max: number };
    tread: "slick" | "semi" | "knobby";
    tubeless: boolean;
    pressureBar: { front: number; rear: number };
    pressurePsi: { front: number; rear: number };
  };
  brakes: string;
  drivetrain: string;
  ebike?: {
    consumptionWhPerKm: number;
    recommendedBatteryWh: number;
    dualBatteryRecommended: boolean;
    estRangeKm: { eco: number; tour: number; sport: number; turbo: number };
    torqueNm: { min: number; max: number };
    motorPick: string;
    motorPosition: "mid" | "rear" | "front";
    speedClass: "pedelec25" | "sPedelec45";
    assistProfile: "economy" | "balanced" | "power";
    notes: string[];
  };
  budget: {
    segment: "einstieg" | "mittelklasse" | "premium" | "highend";
    marketRange: { min: number; max: number };
    fitsMustHaves: boolean;
    warning?: string;
  };
  /** Erweiterter Bikefit-Report — nur befüllt wenn measureMode = "precise" oder
   *  wenn genügend Zusatzmaße vorhanden sind. Basis: Retül/Steve Hogg/BikeFit-Standards. */
  bikefit: {
    confidence: "low" | "medium" | "high";
    method: "quick" | "precise";
    /** Sattelhöhe nach 3 gängigen Methoden — als Bandbreite. */
    saddleHeight: {
      holmesMm: number; // Inseam × 0.883
      lemondMm: number; // Inseam × 0.883–0.885 (variant)
      hamleyMm: number; // Inseam × 1.09 minus Kurbel
      consensusMm: number;
    };
    /** Sattel-Setback (KOPS: Knee Over Pedal Spindle). */
    setbackMm: { min: number; recommended: number; max: number };
    /** Effektive Oberrohrlänge (ETT) Ziel. */
    ettMm: { min: number; recommended: number; max: number };
    /** Sattelbreite aus Sitzknochenabstand + Sitzposition-Offset. */
    saddleWidthMm: { min: number; recommended: number; max: number };
    /** Cleat-Setback (mm hinter Großzehen-Grundgelenk) — nur bei Klickpedal. */
    cleatSetbackMm?: number;
    /** Moderne "Short-Cranks"-Empfehlung. */
    crankShortMm: number;
    /** Cockpit-Ziel: STA (Sitzwinkel) und HTA (Steuerkopfwinkel) ideal. */
    seatTubeAngle: { min: number; max: number };
    headTubeAngle: { min: number; max: number };
    /** Erklärender Prosa-Hinweis pro Wert. */
    notes: string[];
  };
  notes: string[];
};

export type BikeFitScore = {
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
  geometry: { reach_mm?: number; stack_mm?: number } | null;
  /** 0–100. 100 = perfekter Match zu Ziel-Reach/Stack. */
  fitScore: number | null;
  deltaReachMm: number | null;
  deltaStackMm: number | null;
  reasons: string[];
};

export type AiAnalysis = {
  summary: string;
  frameRecommendation: string;
  alternativeSizes: string;
  topPicks: Array<{
    slug?: string | null;
    label: string;
    reason: string;
    priceHint?: string;
  }>;
  warnings: string[];
  checklistBeforeBuy: string[];
  financing?: string;
};
