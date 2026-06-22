// Personalized bike profile — stored locally, no login required.
// Used by the recommendation engine, the homepage "Für dich" strip and the
// tools (Reifendruck, Rahmengröße, Kaufberater …) to pre-fill known values.

import { useEffect, useState } from "react";

export const STORAGE_KEY = "radmap.bikeProfile.v1";
const CHANGE_EVENT = "radmap:bikeProfile:changed";

export type BikeType =
  | "road"
  | "gravel"
  | "mtb"
  | "ebike"
  | "city"
  | "trekking"
  | "cargo"
  | "kids";

export type RidingStyle =
  | "commute"
  | "touring"
  | "sport"
  | "offroad"
  | "family";

export type Interest =
  | "touren"
  | "technik"
  | "sicherheit"
  | "recht"
  | "wartung"
  | "ernaehrung"
  | "wetter"
  | "navigation"
  | "kaufberatung"
  | "ebike-akku";

export type TireDiameter = "700c" | "650b" | "29" | "27.5" | "26";
export type TireTread = "slick" | "semi" | "knobby";
export type BrakeType = "rim" | "disc-mech" | "disc-hydraulic";
export type Drivetrain = "1x" | "2x" | "3x" | "internal" | "belt";

export type BikeProfile = {
  bikeTypes: BikeType[];
  ridingStyle?: RidingStyle | null;
  frameSizeCm?: number | null;
  bodyHeightCm?: number | null;
  inseamCm?: number | null;
  weightKg?: number | null;
  tire?: {
    widthMm?: number | null;
    diameter?: TireDiameter | null;
    type?: TireTread | null;
  };
  brakes?: BrakeType | null;
  drivetrain?: Drivetrain | null;
  interests: Interest[];
  budgetEur?: number | null;
  region?: string | null;
  updatedAt: string;
};

export const BIKE_TYPE_LABELS: Record<BikeType, string> = {
  road: "Rennrad",
  gravel: "Gravel",
  mtb: "Mountainbike",
  ebike: "E-Bike",
  city: "City / Urban",
  trekking: "Trekking",
  cargo: "Lastenrad",
  kids: "Kinderrad",
};

export const RIDING_STYLE_LABELS: Record<RidingStyle, string> = {
  commute: "Alltag & Pendeln",
  touring: "Touren & Reisen",
  sport: "Sportlich / Training",
  offroad: "Offroad / Trail",
  family: "Familie & Freizeit",
};

export const INTEREST_LABELS: Record<Interest, string> = {
  touren: "Touren & Routen",
  technik: "Technik & Setup",
  sicherheit: "Sicherheit",
  recht: "Recht & StVO",
  wartung: "Wartung & Reparatur",
  ernaehrung: "Ernährung & Training",
  wetter: "Wetter",
  navigation: "Navigation",
  kaufberatung: "Kaufberatung",
  "ebike-akku": "E-Bike & Akku",
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getBikeProfile(): BikeProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BikeProfile;
    if (!parsed || !Array.isArray(parsed.bikeTypes)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveBikeProfile(
  patch: Partial<BikeProfile>,
): BikeProfile {
  const current = getBikeProfile();
  const next: BikeProfile = {
    bikeTypes: patch.bikeTypes ?? current?.bikeTypes ?? [],
    ridingStyle: patch.ridingStyle ?? current?.ridingStyle ?? null,
    frameSizeCm: patch.frameSizeCm ?? current?.frameSizeCm ?? null,
    bodyHeightCm: patch.bodyHeightCm ?? current?.bodyHeightCm ?? null,
    inseamCm: patch.inseamCm ?? current?.inseamCm ?? null,
    weightKg: patch.weightKg ?? current?.weightKg ?? null,
    tire: {
      widthMm: patch.tire?.widthMm ?? current?.tire?.widthMm ?? null,
      diameter: patch.tire?.diameter ?? current?.tire?.diameter ?? null,
      type: patch.tire?.type ?? current?.tire?.type ?? null,
    },
    brakes: patch.brakes ?? current?.brakes ?? null,
    drivetrain: patch.drivetrain ?? current?.drivetrain ?? null,
    interests: patch.interests ?? current?.interests ?? [],
    budgetEur: patch.budgetEur ?? current?.budgetEur ?? null,
    region: patch.region ?? current?.region ?? null,
    updatedAt: new Date().toISOString(),
  };
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
  return next;
}

export function clearBikeProfile() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function hasBikeProfile(): boolean {
  const p = getBikeProfile();
  return !!p && p.bikeTypes.length > 0;
}

export function summarizeProfile(p: BikeProfile | null): string {
  if (!p) return "";
  const parts: string[] = [];
  if (p.frameSizeCm) parts.push(`${p.frameSizeCm} cm`);
  if (p.bikeTypes[0]) parts.push(BIKE_TYPE_LABELS[p.bikeTypes[0]]);
  if (p.tire?.widthMm) parts.push(`${p.tire.widthMm} mm`);
  if (p.weightKg) parts.push(`${p.weightKg} kg`);
  return parts.join(" · ");
}

/** React hook that re-renders on profile changes (this tab and others). */
export function useBikeProfile(): BikeProfile | null {
  const [profile, setProfile] = useState<BikeProfile | null>(() =>
    getBikeProfile(),
  );
  useEffect(() => {
    const sync = () => setProfile(getBikeProfile());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return profile;
}
