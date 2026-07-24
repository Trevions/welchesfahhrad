// Shared geolocation consent + cached coordinates.
// Reuses the same keys as the bike-weather hook, so once the user grants
// location for the weather widget, all other tools reuse it silently.

const CONSENT_KEY = "welchesfahrrad-geo-consent";
const COORDS_KEY = "welchesfahrrad-geo-coords";
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export type GeoCoords = { lat: number; lon: number; t?: number };

export function hasGeoConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "granted";
}

export function setGeoConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
}

export function getCachedCoords(): GeoCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COORDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === "number" && typeof parsed.lon === "number") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveCoords(lat: number, lon: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    COORDS_KEY,
    JSON.stringify({ lat, lon, t: Date.now() }),
  );
}

/**
 * Get the user's location.
 * - If consent has already been granted AND we have fresh cached coords,
 *   returns them immediately (no browser prompt).
 * - If consent is granted but the cache is stale, silently refreshes via
 *   the geolocation API (browser will not re-prompt — permission is sticky).
 * - Otherwise calls getCurrentPosition once and stores the result.
 */
export function getLocation(
  options: { forceFresh?: boolean } = {},
): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Nicht im Browser verfügbar."));
      return;
    }

    const cached = getCachedCoords();
    const fresh =
      cached && cached.t && Date.now() - cached.t < MAX_AGE_MS ? cached : null;

    if (!options.forceFresh && hasGeoConsent() && fresh) {
      resolve(fresh);
      return;
    }

    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation wird vom Browser nicht unterstützt."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        saveCoords(latitude, longitude);
        setGeoConsent(true);
        resolve({ lat: latitude, lon: longitude, t: Date.now() });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGeoConsent(false);
        reject(new Error(err.message || "Standort nicht verfügbar."));
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  });
}
