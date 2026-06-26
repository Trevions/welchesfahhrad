import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  ZoomControl,
  useMap,
} from "react-leaflet";
import {
  Crosshair,
  Loader2,
  MapPin,
  Flag,
  Route as RouteIcon,
  Mountain,
  Clock,
  Wind,
  CloudRain,
  Thermometer,
  Sun,
  Bike,
  Sparkles,
  AlertTriangle,
  Download,
  ArrowLeftRight,
  Search,
  Leaf,
} from "lucide-react";
import { getLocation, hasGeoConsent } from "@/lib/geo-consent";
import { ToolCard } from "@/components/tools/ToolShell";

// ----------------------------- types -----------------------------

type Place = {
  label: string;
  lat: number;
  lon: number;
};

type RouteProfile = "trekking" | "fastbike" | "safety" | "shortest";

type RouteResult = {
  coords: [number, number][]; // [lat, lon]
  distanceKm: number;
  durationMin: number;
  ascent: number;
  descent: number;
  elevations: { dist: number; ele: number }[]; // dist in km, ele in m
  bounds: L.LatLngBoundsExpression;
  profile: RouteProfile;
};

type WeatherSnap = {
  temp: number;
  apparent: number;
  wind: number;
  windDir: number;
  gust: number;
  precipProb: number;
  precip: number;
  uv: number;
  code: number;
  isDay: boolean;
  time: string;
};

// --------------------------- constants ---------------------------

const PROFILE_LABELS: Record<RouteProfile, { label: string; desc: string }> = {
  trekking: { label: "Trekking", desc: "Bequeme Mischung aus Radwegen & Asphalt" },
  fastbike: { label: "Schnell", desc: "Direkter Weg, gut für Pendler & Rennrad" },
  safety: { label: "Sicher", desc: "Maximal Radwege, ruhige Strecken" },
  shortest: { label: "Kürzeste", desc: "Kompromisslos kurz" },
};

const WEATHER_LABEL: Record<number, string> = {
  0: "Klar", 1: "Heiter", 2: "Wolkig", 3: "Bedeckt",
  45: "Nebel", 48: "Nebel",
  51: "Nieselregen", 53: "Nieselregen", 55: "Starker Niesel",
  61: "Leichter Regen", 63: "Regen", 65: "Starker Regen",
  71: "Schneefall", 73: "Schneefall", 75: "Starker Schnee",
  80: "Schauer", 81: "Schauer", 82: "Heftige Schauer",
  95: "Gewitter", 96: "Gewitter", 99: "Gewitter",
};

// --------------------------- API calls ---------------------------

async function searchPlaces(q: string): Promise<Place[]> {
  if (q.trim().length < 3) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "de,at,ch");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("accept-language", "de");
  const r = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
  });
  if (!r.ok) return [];
  const j: any[] = await r.json();
  return j.map((x) => ({
    label: x.display_name as string,
    lat: parseFloat(x.lat),
    lon: parseFloat(x.lon),
  }));
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("format", "json");
    url.searchParams.set("accept-language", "de");
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error();
    const j = await r.json();
    return j.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

async function fetchRoute(
  start: Place,
  end: Place,
  profile: RouteProfile,
): Promise<RouteResult> {
  // BRouter expects lon,lat pairs separated by |
  const lonlats = `${start.lon},${start.lat}|${end.lon},${end.lat}`;
  const url = new URL("https://brouter.de/brouter");
  url.searchParams.set("lonlats", lonlats);
  url.searchParams.set("profile", profile);
  url.searchParams.set("alternativeidx", "0");
  url.searchParams.set("format", "geojson");

  const r = await fetch(url.toString());
  if (!r.ok) {
    throw new Error(
      `Route konnte nicht berechnet werden (HTTP ${r.status}). Versuche es mit einem anderen Ziel.`,
    );
  }
  const text = await r.text();
  let j: any;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error(text.slice(0, 200) || "BRouter antwortete unerwartet.");
  }
  const feature = j.features?.[0];
  if (!feature) throw new Error("Keine Route gefunden.");

  const props = feature.properties ?? {};
  const distanceKm = Number(props["track-length"] ?? 0) / 1000;
  const durationMin = Number(props["total-time"] ?? 0) / 60;
  const ascent = Number(props["filtered ascend"] ?? props["plain-ascend"] ?? 0);
  const descent = Math.max(0, Number(props["plain-descend"] ?? 0));

  const rawCoords: [number, number, number?][] = feature.geometry?.coordinates ?? [];
  const coords: [number, number][] = rawCoords.map(([lon, lat]) => [lat, lon]);

  // Elevation profile from coordinates (every Nth point to keep it light)
  const step = Math.max(1, Math.floor(rawCoords.length / 80));
  const elevations: { dist: number; ele: number }[] = [];
  let prev: [number, number, number?] | null = null;
  let runKm = 0;
  for (let i = 0; i < rawCoords.length; i++) {
    const c = rawCoords[i];
    if (prev) {
      runKm += haversine(prev[1], prev[0], c[1], c[0]);
    }
    if (i % step === 0 || i === rawCoords.length - 1) {
      elevations.push({ dist: runKm, ele: c[2] ?? 0 });
    }
    prev = c;
  }

  const lats = coords.map((c) => c[0]);
  const lons = coords.map((c) => c[1]);
  const bounds: L.LatLngBoundsExpression = [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ];

  return {
    coords,
    distanceKm,
    durationMin,
    ascent,
    descent,
    elevations,
    bounds,
    profile,
  };
}

async function fetchWeather(lat: number, lon: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,apparent_temperature,uv_index,wind_direction_10m,wind_gusts_10m,is_day",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("wind_speed_unit", "kmh");
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error("Wetter nicht verfügbar");
  const j = await r.json();
  const cu = j.current;
  const now: WeatherSnap = {
    temp: cu.temperature_2m,
    apparent: cu.apparent_temperature,
    wind: cu.wind_speed_10m,
    windDir: cu.wind_direction_10m,
    gust: cu.wind_gusts_10m,
    precipProb: 0,
    precip: cu.precipitation ?? 0,
    uv: cu.uv_index ?? 0,
    code: cu.weather_code,
    isDay: cu.is_day === 1,
    time: cu.time,
  };
  const h = j.hourly;
  const nowMs = Date.now();
  const idxNow = h.time.findIndex((t: string) => new Date(t).getTime() >= nowMs - 30 * 60_000);
  if (idxNow >= 0) now.precipProb = h.precipitation_probability?.[idxNow] ?? 0;
  return { now, hourly: h, idxNow: Math.max(0, idxNow) };
}

// --------------------------- helpers ---------------------------

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function fmtTime(min: number) {
  if (!isFinite(min) || min < 1) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function windDirLabel(deg: number) {
  const d = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
  return d[Math.round(deg / 45) % 8];
}

function co2Saved(km: number) {
  // Avg German passenger car emits ~140 g CO₂/km (UBA 2024)
  return Math.round(km * 140);
}

function kcalBurned(km: number, min: number) {
  // Avg ~33 kcal/km moderate cycling, scaled lightly by duration
  return Math.round(km * 33 + min * 0.5);
}

function buildTips(r: RouteResult, w: WeatherSnap | null): string[] {
  const tips: string[] = [];
  if (r.ascent > 400) tips.push(`${Math.round(r.ascent)} Höhenmeter — kleiner Gang & frühes Aufwärmen.`);
  if (r.distanceKm > 40) tips.push("Lange Tour — mindestens 500 ml Wasser pro Stunde, Riegel/Banane mit.");
  if (r.profile === "fastbike") tips.push("Schnell-Profil: Route nutzt auch Hauptstraßen — Helm & Licht prüfen.");
  if (w) {
    if (w.precipProb >= 60 || w.precip > 0.5) tips.push("Hohe Regenwahrscheinlichkeit — Regenjacke einpacken, Schutzbleche helfen.");
    if (w.wind > 25) tips.push(`Wind ${Math.round(w.wind)} km/h aus ${windDirLabel(w.windDir)} — Hinweg & Rückweg planen.`);
    if (w.gust > 50) tips.push("Sturmböen über 50 km/h — Tour eher verschieben.");
    if (w.temp < 5) tips.push("Kalt — Langfinger-Handschuhe, Buff und winddichte Jacke.");
    if (w.temp > 28) tips.push("Hitze — Sonnencreme, früher Start, viel trinken.");
    if (w.uv > 6) tips.push(`UV-Index ${w.uv.toFixed(1)} — Sonnenschutz nicht vergessen.`);
    if (!w.isDay) tips.push("Dämmerung/Nacht — Front- und Rücklicht Pflicht (StVZO).");
  }
  if (tips.length === 0) tips.push("Ideale Bedingungen — viel Spaß auf der Tour!");
  return tips;
}

function toGpx(r: RouteResult, start: Place, end: Place): string {
  const trkpts = r.coords
    .map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"/>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="radmap.de Eco Route Planner" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>radmap Route</name>
    <desc>${start.label} → ${end.label}</desc>
  </metadata>
  <trk>
    <name>${start.label.split(",")[0]} → ${end.label.split(",")[0]}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

// ------------------------- subcomponents -------------------------

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);
  return null;
}

function AddressInput({
  label,
  icon,
  value,
  place,
  onChange,
  onPick,
  onUseLocation,
  loadingLocation,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  place: Place | null;
  onChange: (v: string) => void;
  onPick: (p: Place) => void;
  onUseLocation?: () => void;
  loadingLocation?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!value || place?.label === value) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      setBusy(true);
      try {
        const res = await searchPlaces(value);
        setSuggestions(res);
        setOpen(true);
      } finally {
        setBusy(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value, place]);

  return (
    <div className="relative">
      <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 focus-within:border-signal/60 focus-within:ring-2 focus-within:ring-signal/20">
        <span className="text-signal">{icon}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 180)}
          placeholder="Adresse, Stadt oder PLZ"
          className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {onUseLocation && (
          <button
            type="button"
            onClick={onUseLocation}
            disabled={loadingLocation}
            title="Aktueller Standort"
            className="shrink-0 rounded-lg border border-border bg-card/60 p-1.5 text-signal transition-colors hover:border-signal/60 disabled:opacity-50"
          >
            {loadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {suggestions.map((s, i) => (
            <button
              key={`${s.lat}-${s.lon}-${i}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(s);
                setOpen(false);
              }}
              className="block w-full border-b border-border/60 px-3 py-2.5 text-left text-xs hover:bg-background/60"
            >
              <div className="font-medium text-foreground line-clamp-1">{s.label.split(",")[0]}</div>
              <div className="mt-0.5 text-muted-foreground line-clamp-1">{s.label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ElevationChart({ data }: { data: { dist: number; ele: number }[] }) {
  if (data.length < 2) return null;
  const W = 600;
  const H = 120;
  const padX = 8;
  const padY = 10;
  const xs = data.map((d) => d.dist);
  const ys = data.map((d) => d.ele);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yRange = Math.max(20, yMax - yMin);
  const toX = (v: number) => padX + (v / xMax) * (W - padX * 2);
  const toY = (v: number) => H - padY - ((v - yMin) / yRange) * (H - padY * 2);
  const linePath =
    "M " +
    data.map((d) => `${toX(d.dist).toFixed(1)} ${toY(d.ele).toFixed(1)}`).join(" L ");
  const areaPath = linePath + ` L ${toX(xMax).toFixed(1)} ${H - padY} L ${toX(0).toFixed(1)} ${H - padY} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" role="img" aria-label="Höhenprofil">
      <path d={areaPath} fill="color-mix(in oklch, var(--signal) 18%, transparent)" />
      <path d={linePath} fill="none" stroke="var(--signal)" strokeWidth="1.6" />
      <text x={padX} y={12} fontSize="10" fill="currentColor" opacity="0.6">{Math.round(yMax)} m</text>
      <text x={padX} y={H - 2} fontSize="10" fill="currentColor" opacity="0.6">{Math.round(yMin)} m</text>
      <text x={W - padX} y={H - 2} fontSize="10" fill="currentColor" opacity="0.6" textAnchor="end">{xMax.toFixed(1)} km</text>
    </svg>
  );
}

// --------------------------- main UI ---------------------------

export default function EcoRoutePlanner() {
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [startPlace, setStartPlace] = useState<Place | null>(null);
  const [endPlace, setEndPlace] = useState<Place | null>(null);
  const [profile, setProfile] = useState<RouteProfile>("trekking");
  const [locating, setLocating] = useState(false);
  const [computing, setComputing] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [weather, setWeather] = useState<WeatherSnap | null>(null);
  const [arrivalWeather, setArrivalWeather] = useState<WeatherSnap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const center: [number, number] = useMemo(() => {
    if (startPlace) return [startPlace.lat, startPlace.lon];
    return [51.1657, 10.4515]; // Germany center
  }, [startPlace]);

  // Auto-fill start with cached location if consent already granted
  useEffect(() => {
    if (startPlace || !hasGeoConsent()) return;
    (async () => {
      try {
        const { lat, lon } = await getLocation();
        const label = await reverseGeocode(lat, lon);
        setStartPlace({ lat, lon, label });
        setStartInput(label);
      } catch {/* ignore */}
    })();
  }, [startPlace]);

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    setError(null);
    try {
      const { lat, lon } = await getLocation({ forceFresh: true });
      const label = await reverseGeocode(lat, lon);
      setStartPlace({ lat, lon, label });
      setStartInput(label);
    } catch (e: any) {
      setError(e?.message || "Standort nicht verfügbar.");
    } finally {
      setLocating(false);
    }
  }, []);

  const swap = useCallback(() => {
    setStartPlace(endPlace);
    setEndPlace(startPlace);
    setStartInput(endPlace?.label ?? "");
    setEndInput(startPlace?.label ?? "");
    setRoute(null);
  }, [startPlace, endPlace]);

  const compute = useCallback(async () => {
    if (!startPlace || !endPlace) {
      setError("Bitte Start- und Zielort wählen.");
      return;
    }
    setComputing(true);
    setError(null);
    setRoute(null);
    try {
      const [r, w] = await Promise.all([
        fetchRoute(startPlace, endPlace, profile),
        fetchWeather(startPlace.lat, startPlace.lon).catch(() => null),
      ]);
      setRoute(r);
      if (w) {
        setWeather(w.now);
        // Estimate arrival weather from hourly array
        const arrivalMs = Date.now() + r.durationMin * 60_000;
        const arrIdx = w.hourly.time.findIndex(
          (t: string) => new Date(t).getTime() >= arrivalMs,
        );
        if (arrIdx >= 0) {
          setArrivalWeather({
            temp: w.hourly.temperature_2m[arrIdx],
            apparent: w.hourly.apparent_temperature[arrIdx],
            wind: w.hourly.wind_speed_10m[arrIdx],
            windDir: w.hourly.wind_direction_10m[arrIdx],
            gust: w.hourly.wind_gusts_10m[arrIdx],
            precipProb: w.hourly.precipitation_probability[arrIdx] ?? 0,
            precip: w.hourly.precipitation[arrIdx] ?? 0,
            uv: w.hourly.uv_index[arrIdx] ?? 0,
            code: w.hourly.weather_code[arrIdx],
            isDay: w.hourly.is_day[arrIdx] === 1,
            time: w.hourly.time[arrIdx],
          });
        } else {
          setArrivalWeather(null);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Berechnung fehlgeschlagen.");
    } finally {
      setComputing(false);
    }
  }, [startPlace, endPlace, profile]);

  const downloadGpx = useCallback(() => {
    if (!route || !startPlace || !endPlace) return;
    const blob = new Blob([toGpx(route, startPlace, endPlace)], {
      type: "application/gpx+xml",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `radmap-route-${Date.now()}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [route, startPlace, endPlace]);

  const tips = useMemo(() => (route ? buildTips(route, weather) : []), [route, weather]);

  // Custom DivIcons for start/end markers
  const startIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:50%;background:var(--signal);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4);display:grid;place-items:center;color:white;font-weight:900;font-size:12px">A</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    [],
  );
  const endIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4);display:grid;place-items:center;color:white;font-weight:900;font-size:12px">B</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    [],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      {/* Left column: form + results */}
      <div className="space-y-5">
        <ToolCard>
          <div className="space-y-4">
            <AddressInput
              label="Start"
              icon={<MapPin className="h-4 w-4" />}
              value={startInput}
              place={startPlace}
              onChange={(v) => {
                setStartInput(v);
                if (startPlace && v !== startPlace.label) setStartPlace(null);
              }}
              onPick={(p) => {
                setStartPlace(p);
                setStartInput(p.label);
              }}
              onUseLocation={useMyLocation}
              loadingLocation={locating}
            />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={swap}
                title="Tauschen"
                className="rounded-full border border-border bg-card/60 p-1.5 text-muted-foreground transition-colors hover:border-signal/60 hover:text-signal"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            <AddressInput
              label="Ziel"
              icon={<Flag className="h-4 w-4" />}
              value={endInput}
              place={endPlace}
              onChange={(v) => {
                setEndInput(v);
                if (endPlace && v !== endPlace.label) setEndPlace(null);
              }}
              onPick={(p) => {
                setEndPlace(p);
                setEndInput(p.label);
              }}
            />

            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Routing-Profil
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(Object.keys(PROFILE_LABELS) as RouteProfile[]).map((p) => {
                  const meta = PROFILE_LABELS[p];
                  const active = profile === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProfile(p)}
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                        active
                          ? "border-signal bg-signal/10 text-foreground"
                          : "border-border bg-background/40 text-muted-foreground hover:border-signal/40"
                      }`}
                    >
                      <div className="font-bold text-[13px] text-foreground">{meta.label}</div>
                      <div className="mt-0.5 leading-snug">{meta.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={compute}
              disabled={computing || !startPlace || !endPlace}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-3 text-sm font-bold uppercase tracking-wider text-signal-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {computing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {computing ? "Berechne Route…" : "Route berechnen"}
            </button>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </ToolCard>

        {route && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatBox icon={<RouteIcon className="h-4 w-4" />} label="Distanz" value={`${route.distanceKm.toFixed(1)} km`} />
              <StatBox icon={<Clock className="h-4 w-4" />} label="Fahrzeit" value={fmtTime(route.durationMin)} />
              <StatBox icon={<Mountain className="h-4 w-4" />} label="Anstieg" value={`${Math.round(route.ascent)} m`} />
              <StatBox icon={<Mountain className="h-4 w-4 rotate-180" />} label="Abfahrt" value={`${Math.round(route.descent)} m`} />
            </div>

            {/* Eco / kcal */}
            <ToolCard>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                    <Leaf className="h-3.5 w-3.5" /> CO₂ gespart
                  </div>
                  <div className="mt-1 font-display text-2xl font-black">
                    {(co2Saved(route.distanceKm) / 1000).toFixed(2)} kg
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    vs. Auto-Fahrt (140 g/km)
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-signal">
                    <Bike className="h-3.5 w-3.5" /> Kalorien
                  </div>
                  <div className="mt-1 font-display text-2xl font-black">
                    {kcalBurned(route.distanceKm, route.durationMin)} kcal
                  </div>
                  <div className="text-[11px] text-muted-foreground">moderate Intensität</div>
                </div>
              </div>
            </ToolCard>

            {/* Weather */}
            {weather && (
              <ToolCard>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-signal">
                    Wetter am Start
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {WEATHER_LABEL[weather.code] ?? "Wetter"}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  <WBox icon={<Thermometer className="h-3 w-3" />} v={`${Math.round(weather.temp)}°`} l="Temp" />
                  <WBox icon={<Wind className="h-3 w-3" />} v={`${Math.round(weather.wind)}`} l={`km/h ${windDirLabel(weather.windDir)}`} />
                  <WBox icon={<CloudRain className="h-3 w-3" />} v={`${weather.precipProb}%`} l="Regen" />
                  <WBox icon={<Sun className="h-3 w-3" />} v={weather.uv.toFixed(1)} l="UV" />
                </div>
                {arrivalWeather && (
                  <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-2.5 text-xs">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Bei Ankunft (~{new Date(arrivalWeather.time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })})
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-foreground">
                      <span>{Math.round(arrivalWeather.temp)}°</span>
                      <span className="text-muted-foreground">·</span>
                      <span>{WEATHER_LABEL[arrivalWeather.code] ?? "—"}</span>
                      <span className="text-muted-foreground">·</span>
                      <span>{arrivalWeather.precipProb}% Regen</span>
                    </div>
                  </div>
                )}
              </ToolCard>
            )}

            {/* Tips */}
            <ToolCard>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-signal">
                <Sparkles className="h-3.5 w-3.5" /> Tipps für deine Tour
              </div>
              <ul className="mt-3 space-y-2">
                {tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                    {t}
                  </li>
                ))}
              </ul>
            </ToolCard>

            {/* Elevation */}
            {route.elevations.length > 2 && (
              <ToolCard>
                <div className="text-[10px] uppercase tracking-[0.18em] text-signal">Höhenprofil</div>
                <div className="mt-2 text-foreground">
                  <ElevationChart data={route.elevations} />
                </div>
              </ToolCard>
            )}

            <button
              type="button"
              onClick={downloadGpx}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-signal/60 hover:text-signal"
            >
              <Download className="h-4 w-4" />
              GPX herunterladen
            </button>
          </>
        )}
      </div>

      {/* Right column: map */}
      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border bg-card lg:h-[78vh] lg:sticky lg:top-20">
        <MapContainer
          center={center}
          zoom={startPlace ? 11 : 6}
          zoomControl={false}
          className="h-full w-full"
          style={{ background: "#0b1118" }}
        >
          <TileLayer
            url="https://tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap, CyclOSM'
            maxZoom={19}
          />
          <ZoomControl position="topright" />
          {startPlace && <Marker position={[startPlace.lat, startPlace.lon]} icon={startIcon} />}
          {endPlace && <Marker position={[endPlace.lat, endPlace.lon]} icon={endIcon} />}
          {route && (
            <>
              <Polyline
                positions={route.coords}
                pathOptions={{ color: "#000", weight: 7, opacity: 0.45 }}
              />
              <Polyline
                positions={route.coords}
                pathOptions={{ color: "var(--signal)", weight: 4, opacity: 0.95 }}
              />
              <FitBounds bounds={route.bounds} />
            </>
          )}
        </MapContainer>
        {computing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-signal" />
              Berechne optimale Route…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="text-signal">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-black tracking-tight">{value}</div>
    </div>
  );
}

function WBox({
  icon,
  v,
  l,
}: {
  icon: React.ReactNode;
  v: string;
  l: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {icon} {l}
      </div>
      <div className="mt-0.5 text-foreground text-[13px] font-bold">{v}</div>
    </div>
  );
}
