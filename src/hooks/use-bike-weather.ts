import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "welchesfahrrad-geo-consent";
const COORDS_KEY = "welchesfahrrad-geo-coords";

export type WeatherCurrent = {
  temperature: number;
  apparent: number;
  windSpeed: number; // km/h
  windGust: number; // km/h
  windDir: number; // deg
  humidity: number;
  precip: number; // mm
  precipProb: number; // %
  cloud: number;
  uv: number;
  visibility: number; // m
  pressure: number; // hPa
  weatherCode: number;
  isDay: boolean;
  time: string;
};

export type WeatherHour = {
  time: string;
  temperature: number;
  precipProb: number;
  precip: number;
  windSpeed: number;
  weatherCode: number;
};

export type WeatherDaily = {
  date: string;
  tempMax: number;
  tempMin: number;
  precipSum: number;
  precipProbMax: number;
  windMax: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
};

export type BikeWeather = {
  location: { lat: number; lon: number; label: string };
  current: WeatherCurrent;
  hourly: WeatherHour[];
  daily: WeatherDaily[];
  bikeScore: { score: number; rating: string; reasons: string[] };
};

type Status = "idle" | "prompt" | "loading" | "ready" | "denied" | "error";

function loadConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "granted";
}

function saveConsent(granted: boolean) {
  localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
}

function loadCachedCoords(): { lat: number; lon: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COORDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === "number" && typeof parsed.lon === "number") return parsed;
  } catch {}
  return null;
}

function saveCoords(lat: number, lon: number) {
  localStorage.setItem(COORDS_KEY, JSON.stringify({ lat, lon, t: Date.now() }));
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=de`,
    );
    if (!r.ok) throw new Error();
    const j = await r.json();
    const city = j.city || j.locality || j.principalSubdivision || "";
    const country = j.countryName || "";
    return [city, country].filter(Boolean).join(", ") || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }
}

function computeBikeScore(c: WeatherCurrent, h: WeatherHour[]): BikeWeather["bikeScore"] {
  let score = 100;
  const reasons: string[] = [];

  if (c.temperature < 0) { score -= 35; reasons.push("Frostgefahr"); }
  else if (c.temperature < 5) { score -= 20; reasons.push("Sehr kalt"); }
  else if (c.temperature < 10) { score -= 8; reasons.push("Kühl — warm anziehen"); }
  else if (c.temperature > 32) { score -= 25; reasons.push("Sehr heiß"); }
  else if (c.temperature > 28) { score -= 12; reasons.push("Heiß — viel trinken"); }

  if (c.precip > 0.5 || c.precipProb > 70) { score -= 35; reasons.push("Regen wahrscheinlich"); }
  else if (c.precipProb > 40) { score -= 15; reasons.push("Regenrisiko"); }

  if (c.windSpeed > 40) { score -= 30; reasons.push("Sehr windig"); }
  else if (c.windSpeed > 25) { score -= 15; reasons.push("Windig"); }
  if (c.windGust > 60) { score -= 15; reasons.push("Sturmböen"); }

  if (c.visibility < 1000) { score -= 20; reasons.push("Schlechte Sicht"); }
  if (c.uv > 8) { score -= 5; reasons.push("Hohe UV — Sonnenschutz"); }

  // Next 3h precip
  const next3 = h.slice(0, 3);
  if (next3.some((x) => x.precip > 0.5)) {
    score -= 10;
    if (!reasons.includes("Regen wahrscheinlich")) reasons.push("Niederschlag in 3h");
  }

  score = Math.max(0, Math.min(100, score));
  let rating = "Perfekt";
  if (score < 35) rating = "Ungeeignet";
  else if (score < 55) rating = "Schwierig";
  else if (score < 75) rating = "Akzeptabel";
  else if (score < 90) rating = "Gut";

  if (reasons.length === 0) reasons.push("Ideale Bedingungen");
  return { score, rating, reasons };
}

async function fetchWeather(lat: number, lon: number): Promise<BikeWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,uv_index",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("wind_speed_unit", "kmh");

  const r = await fetch(url.toString());
  if (!r.ok) throw new Error("Wetter konnte nicht geladen werden");
  const j = await r.json();

  const cu = j.current;
  const current: WeatherCurrent = {
    temperature: cu.temperature_2m,
    apparent: cu.apparent_temperature,
    windSpeed: cu.wind_speed_10m,
    windGust: cu.wind_gusts_10m,
    windDir: cu.wind_direction_10m,
    humidity: cu.relative_humidity_2m,
    precip: cu.precipitation,
    precipProb: 0,
    cloud: cu.cloud_cover,
    uv: cu.uv_index ?? 0,
    visibility: cu.visibility ?? 10000,
    pressure: cu.pressure_msl,
    weatherCode: cu.weather_code,
    isDay: cu.is_day === 1,
    time: cu.time,
  };

  const h = j.hourly;
  const nowIdx = Math.max(
    0,
    h.time.findIndex((t: string) => new Date(t).getTime() >= Date.now() - 30 * 60 * 1000),
  );
  const hourly: WeatherHour[] = [];
  for (let i = nowIdx; i < Math.min(nowIdx + 24, h.time.length); i++) {
    hourly.push({
      time: h.time[i],
      temperature: h.temperature_2m[i],
      precipProb: h.precipitation_probability?.[i] ?? 0,
      precip: h.precipitation?.[i] ?? 0,
      windSpeed: h.wind_speed_10m[i],
      weatherCode: h.weather_code[i],
    });
  }
  if (hourly[0]) current.precipProb = hourly[0].precipProb;

  const d = j.daily;
  const daily: WeatherDaily[] = d.time.map((t: string, i: number) => ({
    date: t,
    tempMax: d.temperature_2m_max[i],
    tempMin: d.temperature_2m_min[i],
    precipSum: d.precipitation_sum[i],
    precipProbMax: d.precipitation_probability_max[i] ?? 0,
    windMax: d.wind_speed_10m_max[i],
    uvMax: d.uv_index_max[i] ?? 0,
    sunrise: d.sunrise[i],
    sunset: d.sunset[i],
    weatherCode: d.weather_code[i],
  }));

  const label = await reverseGeocode(lat, lon);

  return {
    location: { lat, lon, label },
    current,
    hourly,
    daily,
    bikeScore: computeBikeScore(current, hourly),
  };
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation nicht verfügbar"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 10 * 60 * 1000,
      timeout: 15_000,
    });
  });
}

export function useBikeWeather() {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<BikeWeather | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { skipPermissionPrompt?: boolean }) => {
    setError(null);
    try {
      const cached = loadCachedCoords();
      const consent = loadConsent();
      if (cached && consent) {
        setStatus("loading");
        const w = await fetchWeather(cached.lat, cached.lon);
        setData(w);
        setStatus("ready");
        // refresh coords in background
        getPosition().then((p) => {
          const { latitude, longitude } = p.coords;
          if (Math.abs(latitude - cached.lat) > 0.05 || Math.abs(longitude - cached.lon) > 0.05) {
            saveCoords(latitude, longitude);
            fetchWeather(latitude, longitude).then(setData).catch(() => {});
          }
        }).catch(() => {});
        return;
      }
      if (!consent && !opts?.skipPermissionPrompt) {
        setStatus("prompt");
        return;
      }
      setStatus("loading");
      const pos = await getPosition();
      const { latitude, longitude } = pos.coords;
      saveCoords(latitude, longitude);
      saveConsent(true);
      const w = await fetchWeather(latitude, longitude);
      setData(w);
      setStatus("ready");
    } catch (e: any) {
      if (e?.code === 1) {
        saveConsent(false);
        setStatus("denied");
      } else {
        setError(e?.message || "Fehler");
        setStatus("error");
      }
    }
  }, []);

  const accept = useCallback(() => load({ skipPermissionPrompt: true }), [load]);
  const decline = useCallback(() => {
    saveConsent(false);
    setStatus("denied");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { status, data, error, accept, decline, reload: () => load({ skipPermissionPrompt: true }) };
}

export function weatherCodeInfo(code: number, isDay = true): { label: string; emoji: string } {
  const map: Record<number, { label: string; emoji: string; nightEmoji?: string }> = {
    0: { label: "Klar", emoji: "☀️", nightEmoji: "🌙" },
    1: { label: "Überwiegend klar", emoji: "🌤️", nightEmoji: "🌙" },
    2: { label: "Teilweise bewölkt", emoji: "⛅", nightEmoji: "☁️" },
    3: { label: "Bedeckt", emoji: "☁️" },
    45: { label: "Nebel", emoji: "🌫️" },
    48: { label: "Reifnebel", emoji: "🌫️" },
    51: { label: "Leichter Nieselregen", emoji: "🌦️" },
    53: { label: "Nieselregen", emoji: "🌦️" },
    55: { label: "Starker Nieselregen", emoji: "🌧️" },
    61: { label: "Leichter Regen", emoji: "🌦️" },
    63: { label: "Regen", emoji: "🌧️" },
    65: { label: "Starker Regen", emoji: "🌧️" },
    71: { label: "Leichter Schneefall", emoji: "🌨️" },
    73: { label: "Schneefall", emoji: "🌨️" },
    75: { label: "Starker Schneefall", emoji: "❄️" },
    77: { label: "Schneegriesel", emoji: "❄️" },
    80: { label: "Regenschauer", emoji: "🌦️" },
    81: { label: "Starke Regenschauer", emoji: "🌧️" },
    82: { label: "Heftige Regenschauer", emoji: "⛈️" },
    85: { label: "Schneeschauer", emoji: "🌨️" },
    86: { label: "Starke Schneeschauer", emoji: "❄️" },
    95: { label: "Gewitter", emoji: "⛈️" },
    96: { label: "Gewitter mit Hagel", emoji: "⛈️" },
    99: { label: "Schweres Gewitter", emoji: "⛈️" },
  };
  const e = map[code] || { label: "Unbekannt", emoji: "❓" };
  return { label: e.label, emoji: !isDay && e.nightEmoji ? e.nightEmoji : e.emoji };
}

export function windDirLabel(deg: number): string {
  const dirs = ["N", "NNO", "NO", "ONO", "O", "OSO", "SO", "SSO", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}
