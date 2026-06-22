import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sunrise, MapPin, Loader2, AlertCircle, RotateCw } from "lucide-react";
import { ToolShell, ToolCard, ToolResultStat, ToolDisclaimer, ToolLabel, ToolInput } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";
import { getLocation, hasGeoConsent } from "@/lib/geo-consent";

export const Route = createFileRoute("/tools/sonnenzeiten")({
  head: () =>
    toolHead({
      title: "Sonnenauf- und Sonnenuntergang für Radfahrer",
      description:
        "Sonnenaufgang, Sonnenuntergang, bürgerliche und nautische Dämmerung sowie die goldene Stunde — präzise für deinen Standort.",
      path: "/tools/sonnenzeiten",
    }),
  component: SunPage,
});

// NOAA Solar Calculator — clientseitig
function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function solarTimes(lat: number, lng: number, date: Date, zenith: number) {
  const N = dayOfYear(date);
  const lngHour = lng / 15;
  const tRise = N + (6 - lngHour) / 24;
  const tSet = N + (18 - lngHour) / 24;
  function calc(t: number, rising: boolean) {
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin((M * Math.PI) / 180) + 0.02 * Math.sin((2 * M * Math.PI) / 180) + 282.634;
    L = ((L % 360) + 360) % 360;
    let RA = (180 / Math.PI) * Math.atan(0.91764 * Math.tan((L * Math.PI) / 180));
    RA = ((RA % 360) + 360) % 360;
    const Lquad = Math.floor(L / 90) * 90;
    const RAquad = Math.floor(RA / 90) * 90;
    RA = (RA + (Lquad - RAquad)) / 15;
    const sinDec = 0.39782 * Math.sin((L * Math.PI) / 180);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH =
      (Math.cos((zenith * Math.PI) / 180) - sinDec * Math.sin((lat * Math.PI) / 180)) /
      (cosDec * Math.cos((lat * Math.PI) / 180));
    if (cosH > 1 || cosH < -1) return null;
    let H = rising ? 360 - (180 / Math.PI) * Math.acos(cosH) : (180 / Math.PI) * Math.acos(cosH);
    H = H / 15;
    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;
    return UT;
  }
  return { rise: calc(tRise, true), set: calc(tSet, false) };
}

function fmt(utcHours: number | null, date: Date) {
  if (utcHours === null) return "—";
  const ms = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + utcHours * 3600 * 1000;
  const d = new Date(ms);
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function SunPage() {
  const [pos, setPos] = useState<{ lat: number; lng: number; city?: string } | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Geolocation wird nicht unterstützt.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const lat = p.coords.latitude;
          const lng = p.coords.longitude;
          let city: string | undefined;
          try {
            const r = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lng}&language=de&count=1`,
            );
            const g = await r.json();
            city = g.results?.[0]?.name;
          } catch {
            /* ignore */
          }
          setPos({ lat, lng, city });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    /* user-triggered */
  }, []);

  const d = new Date(date + "T12:00:00Z");
  const sun = pos ? solarTimes(pos.lat, pos.lng, d, 90.833) : null;
  const civil = pos ? solarTimes(pos.lat, pos.lng, d, 96) : null;
  const nautical = pos ? solarTimes(pos.lat, pos.lng, d, 102) : null;

  const goldenStart = sun && sun.set !== null ? sun.set - 1 : null;
  const goldenEnd = sun?.set ?? null;
  const dayLength =
    sun && sun.rise !== null && sun.set !== null
      ? `${Math.floor(sun.set - sun.rise)} h ${Math.round(((sun.set - sun.rise) % 1) * 60)} min`
      : "—";

  return (
    <ToolShell
      eyebrow="Wetter · 03"
      title="Sonnenauf- und Untergang"
      description="Wann wird es hell, wann dunkel? Plus bürgerliche und nautische Dämmerung — entscheidend für Licht und Sichtbarkeit am Rad."
      icon={Sunrise}
    >
      {!pos && !loading && !error && (
        <ToolCard className="text-center">
          <MapPin className="mx-auto h-8 w-8 text-signal" />
          <h2 className="mt-4 font-display text-xl font-bold tracking-tight">Standort freigeben</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sonnenzeiten sind ortsabhängig. Wir nutzen deinen Standort einmalig.
          </p>
          <button
            onClick={load}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-signal-foreground hover:scale-[1.02]"
          >
            Standort verwenden
          </button>
        </ToolCard>
      )}

      {loading && (
        <ToolCard className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-signal" /> Standort wird ermittelt…
        </ToolCard>
      )}

      {error && (
        <ToolCard className="border-red-500/40">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm">{error}</p>
              <button
                onClick={load}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs"
              >
                <RotateCw className="h-3.5 w-3.5" /> Erneut
              </button>
            </div>
          </div>
        </ToolCard>
      )}

      {pos && (
        <div className="grid gap-6">
          <ToolCard>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Standort</div>
                <div className="font-display text-2xl font-black tracking-tight">
                  {pos.city ?? `${pos.lat.toFixed(2)}, ${pos.lng.toFixed(2)}`}
                </div>
              </div>
              <div className="min-w-[200px]">
                <ToolLabel>Datum</ToolLabel>
                <ToolInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          </ToolCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ToolResultStat label="Sonnenaufgang" value={fmt(sun?.rise ?? null, d)} />
            <ToolResultStat label="Sonnenuntergang" value={fmt(sun?.set ?? null, d)} />
            <ToolResultStat label="Tageslänge" value={dayLength} />
            <ToolResultStat label="Goldene Stunde" value={`${fmt(goldenStart, d)} – ${fmt(goldenEnd, d)}`} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolCard>
              <h3 className="font-display text-base font-bold tracking-tight">Bürgerliche Dämmerung</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Sonne 6° unter dem Horizont — Licht im Freien noch nutzbar.
              </p>
              <div className="mt-3 flex justify-between text-sm">
                <span>Morgens: <strong>{fmt(civil?.rise ?? null, d)}</strong></span>
                <span>Abends: <strong>{fmt(civil?.set ?? null, d)}</strong></span>
              </div>
            </ToolCard>
            <ToolCard>
              <h3 className="font-display text-base font-bold tracking-tight">Nautische Dämmerung</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Sonne 12° unter dem Horizont — ab hier brauchst du Beleuchtung.
              </p>
              <div className="mt-3 flex justify-between text-sm">
                <span>Morgens: <strong>{fmt(nautical?.rise ?? null, d)}</strong></span>
                <span>Abends: <strong>{fmt(nautical?.set ?? null, d)}</strong></span>
              </div>
            </ToolCard>
          </div>
        </div>
      )}

      <ToolDisclaimer>
        Berechnung: NOAA Solar Position Algorithm (clientseitig, keine externen Calls für die Zeiten).
        Geocoding via Open-Meteo. Genauigkeit ±1 Minute für mittlere Breiten.
      </ToolDisclaimer>
    </ToolShell>
  );
}
