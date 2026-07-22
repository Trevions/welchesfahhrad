// Client-side match score between a Bike and the user's BikeProfile.
// Runs in the browser, no network. Returns percent + human reasons.

import type { Bike } from "@/lib/bike-types";
import type { BikeProfile, BikeType, RidingStyle } from "@/lib/bike-profile";

const TYPE_MAP: Record<BikeType, { category?: "bike" | "ebike"; bikeType?: string[] }> = {
  road: { bikeType: ["Rennrad"] },
  gravel: { bikeType: ["Gravel"] },
  mtb: { bikeType: ["Mountainbike"] },
  ebike: { category: "ebike" },
  city: { bikeType: ["City"] },
  trekking: { bikeType: ["Trekking"] },
  cargo: { bikeType: ["Cargo"] },
  kids: { bikeType: ["Kinder"] },
};

const STYLE_TO_SUIT: Record<RidingStyle, string[]> = {
  commute: ["commuting", "city"],
  touring: ["touring", "bikepacking"],
  sport: ["racing", "pro"],
  offroad: ["mountain", "gravel"],
  family: ["family", "beginner"],
};

export type MatchReason = { label: string; ok: boolean; hint: string };
export type BikeMatch = { percent: number; reasons: MatchReason[]; summary: string };

export function matchBikeToProfile(b: Bike, p: BikeProfile): BikeMatch {
  const checks: { weight: number; got: number; reason: MatchReason }[] = [];

  // 1) Bike type
  if (p.bikeTypes.length > 0) {
    const ok = p.bikeTypes.some((t) => {
      const m = TYPE_MAP[t];
      if (m.category && b.category === m.category) return true;
      if (m.bikeType && b.bike_type && m.bikeType.includes(b.bike_type)) return true;
      return false;
    });
    checks.push({
      weight: 30,
      got: ok ? 30 : 0,
      reason: {
        label: "Fahrrad-Typ",
        ok,
        hint: ok
          ? `${b.bike_type ?? (b.category === "ebike" ? "E-Bike" : "Fahrrad")} passt zu deinem Profil`
          : `Anderer Typ als du bevorzugst`,
      },
    });
  }

  // 2) Riding style vs suitability
  if (p.ridingStyle && b.suitability) {
    const keys = STYLE_TO_SUIT[p.ridingStyle] ?? [];
    const vals = keys
      .map((k) => (b.suitability as Record<string, unknown>)[k])
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (vals.length > 0) {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const got = Math.round((avg / 10) * 20);
      checks.push({
        weight: 20,
        got,
        reason: {
          label: "Fahrstil",
          ok: avg >= 6,
          hint: `Eignung ${avg.toFixed(1)}/10 für deinen Fahrstil`,
        },
      });
    }
  }

  // 3) Budget
  if (p.budgetEur && b.price_eur) {
    const ratio = b.price_eur / p.budgetEur;
    const ok = ratio <= 1.0;
    const got = ratio <= 1.0 ? 20 : ratio <= 1.15 ? 10 : ratio <= 1.3 ? 5 : 0;
    checks.push({
      weight: 20,
      got,
      reason: {
        label: "Budget",
        ok,
        hint: ok
          ? `${b.price_eur.toLocaleString("de-DE")} € ≤ Budget ${p.budgetEur.toLocaleString("de-DE")} €`
          : `${b.price_eur.toLocaleString("de-DE")} € liegt ${Math.round((ratio - 1) * 100)} % über Budget`,
      },
    });
  }

  // 4) Max rider weight
  if (p.weightKg && b.geometry?.max_rider_weight_kg) {
    const ok = p.weightKg <= b.geometry.max_rider_weight_kg;
    checks.push({
      weight: 15,
      got: ok ? 15 : 0,
      reason: {
        label: "Max. Fahrergewicht",
        ok,
        hint: `Rad bis ${b.geometry.max_rider_weight_kg} kg · du: ${p.weightKg} kg`,
      },
    });
  }

  // 5) Rahmengröße / Körpergröße (heuristic — nur wenn Rahmengröße im Profil)
  if (p.frameSizeCm && b.specs?.frame_sizes) {
    const s = b.specs.frame_sizes.toLowerCase();
    const size = String(p.frameSizeCm);
    const ok = s.includes(size);
    if (ok) {
      checks.push({
        weight: 10,
        got: 10,
        reason: { label: "Rahmengröße", ok: true, hint: `${p.frameSizeCm} cm im Angebot: ${b.specs.frame_sizes}` },
      });
    }
  }

  // 6) Laufradgröße
  if (p.tire?.diameter && b.specs?.tire_size) {
    const s = b.specs.tire_size.toLowerCase();
    const d = p.tire.diameter.toLowerCase();
    const ok = s.includes(d) || (d === "700c" && s.includes("28"));
    checks.push({
      weight: 5,
      got: ok ? 5 : 0,
      reason: {
        label: "Laufradgröße",
        ok,
        hint: `Präferenz ${p.tire.diameter} · Rad: ${b.specs.tire_size}`,
      },
    });
  }

  // 7) Bremsen-Präferenz
  if (p.brakes && b.specs?.brakes) {
    const s = b.specs.brakes.toLowerCase();
    const wantsDisc = p.brakes.startsWith("disc");
    const isDisc = s.includes("scheib") || s.includes("disc");
    const ok = wantsDisc ? isDisc : !isDisc;
    checks.push({
      weight: 5,
      got: ok ? 5 : 0,
      reason: { label: "Bremsen", ok, hint: `Rad: ${b.specs.brakes}` },
    });
  }

  // 8) Antrieb
  if (p.drivetrain && b.specs?.drivetrain) {
    const s = b.specs.drivetrain.toLowerCase();
    const map: Record<string, string[]> = {
      "1x": ["1x", "1-fach"],
      "2x": ["2x", "2-fach"],
      "3x": ["3x", "3-fach"],
      internal: ["naben", "alfine", "nexus", "rohloff", "enviolo"],
      belt: ["riemen", "belt", "gates"],
    };
    const tokens = map[p.drivetrain] ?? [];
    const ok = tokens.some((t) => s.includes(t));
    if (ok) {
      checks.push({
        weight: 5,
        got: 5,
        reason: { label: "Antrieb", ok: true, hint: `${b.specs.drivetrain}` },
      });
    }
  }

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0) || 1;
  const totalGot = checks.reduce((s, c) => s + c.got, 0);
  const percent = Math.max(0, Math.min(100, Math.round((totalGot / totalWeight) * 100)));
  const reasons = checks.map((c) => c.reason);
  const positive = reasons.filter((r) => r.ok);
  const summary =
    positive.length > 0 ? positive.slice(0, 2).map((r) => r.label).join(" · ") : "Passt teilweise";
  return { percent, reasons, summary };
}
