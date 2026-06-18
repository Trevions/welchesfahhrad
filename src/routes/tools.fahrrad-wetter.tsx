import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  Sun,
  Eye,
  Gauge,
  CloudRain,
  Sunrise,
  Sunset,
  RefreshCw,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useBikeWeather, weatherCodeInfo, windDirLabel } from "@/hooks/use-bike-weather";

const TITLE = "Fahrrad-Wetter — stundengenaue Prognose für Radfahrer | radmap.de";
const DESCRIPTION =
  "Präzises Fahrrad-Wetter für deinen Standort: Temperatur, Wind, Regen, UV und Bike-Score — stundengenau aus Open-Meteo, kostenlos auf radmap.de.";
const URL = "https://radmap.de/tools/fahrrad-wetter";

export const Route = createFileRoute("/tools/fahrrad-wetter")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: FahrradWetterPage,
});

function FahrradWetterPage() {
  const { status, data, accept, decline, reload, error } = useBikeWeather();

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background))_100%)]">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 pt-10 md:pt-14 pb-8">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-signal transition"
          >
            <ArrowLeft className="h-3 w-3" /> Alle Tools
          </Link>
          <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-signal">
            <span className="h-px w-8 bg-signal" /> Wetter & Planung
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-black italic tracking-tight">
            Fahrrad-Wetter.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Stundengenaue Prognose für deinen Standort — Daten direkt aus Open-Meteo,
            aufbereitet für Radfahrer. Inkl. Wind, Regen, UV und einem Bike-Score, der
            sagt, ob sich die Tour heute lohnt.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-8 md:py-12">
        {status === "prompt" && (
          <PermissionCard accept={accept} decline={decline} />
        )}
        {(status === "idle" || status === "loading") && <LoadingCard />}
        {(status === "denied" || status === "error") && (
          <ErrorCard
            denied={status === "denied"}
            message={error}
            onRetry={reload}
          />
        )}
        {status === "ready" && data && <WeatherDashboard data={data} onReload={reload} />}
      </div>
    </div>
  );
}

function PermissionCard({ accept, decline }: { accept: () => void; decline: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-signal/40 bg-signal/10 text-signal">
        <MapPin className="h-6 w-6" />
      </div>
      <h2 className="font-display text-2xl font-black">Standort freigeben</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Damit das Fahrrad-Wetter exakt zu deiner Region passt, brauchen wir einmalig
        deinen Standort. Er wird nur lokal in deinem Browser gespeichert.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={decline}
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground px-4 py-3"
        >
          Ablehnen
        </button>
        <button
          onClick={accept}
          className="inline-flex items-center gap-2 bg-signal text-signal-foreground px-5 py-3 text-xs uppercase tracking-widest hover:opacity-90"
        >
          <MapPin className="h-3.5 w-3.5" /> Standort erlauben
        </button>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center">
      <Loader2 className="mx-auto h-6 w-6 animate-spin text-signal" />
      <p className="mt-3 text-sm text-muted-foreground">Wetterdaten werden geladen …</p>
    </div>
  );
}

function ErrorCard({
  denied,
  message,
  onRetry,
}: {
  denied: boolean;
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
      <h2 className="font-display text-xl font-black">
        {denied ? "Standort nicht erlaubt" : "Wetter nicht verfügbar"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {denied
          ? "Erlaube den Standortzugriff in den Browser-Einstellungen, um das Fahrrad-Wetter zu nutzen."
          : message || "Bitte erneut versuchen."}
      </p>
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-signal hover:text-signal"
      >
        <RefreshCw className="h-3 w-3" /> Erneut versuchen
      </button>
    </div>
  );
}

function WeatherDashboard({
  data,
  onReload,
}: {
  data: NonNullable<ReturnType<typeof useBikeWeather>["data"]>;
  onReload: () => void;
}) {
  const c = data.current;
  const wc = weatherCodeInfo(c.weatherCode, c.isDay);
  const scoreColor =
    data.bikeScore.score >= 75
      ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/5"
      : data.bikeScore.score >= 55
        ? "text-signal border-signal/40 bg-signal/5"
        : "text-amber-400 border-amber-400/40 bg-amber-400/5";

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 md:p-8 grid gap-8 md:grid-cols-[1fr_auto] items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-signal">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{data.location.label}</span>
              <span className="text-muted-foreground normal-case tracking-normal">
                · {data.location.lat.toFixed(3)}, {data.location.lon.toFixed(3)}
              </span>
            </div>
            <div className="mt-3 flex items-end gap-4">
              <span className="text-6xl md:text-7xl" aria-hidden>{wc.emoji}</span>
              <div>
                <div className="font-display text-6xl md:text-7xl font-black leading-none">
                  {Math.round(c.temperature)}°
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {wc.label} · gefühlt {Math.round(c.apparent)}°
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border px-6 py-5 text-center ${scoreColor}`}>
            <div className="eyebrow-sm opacity-80">Bike-Score</div>
            <div className="mt-1 font-display text-5xl font-black">{data.bikeScore.score}</div>
            <div className="mt-1 text-sm font-bold">{data.bikeScore.rating}</div>
            <ul className="mt-3 space-y-1 text-[11px] text-left">
              {data.bikeScore.reasons.slice(0, 3).map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-border divide-x divide-border text-sm">
          <Metric icon={<Wind className="h-4 w-4" />} label="Wind">
            {Math.round(c.windSpeed)} km/h <span className="text-muted-foreground">{windDirLabel(c.windDir)}</span>
          </Metric>
          <Metric icon={<Wind className="h-4 w-4" />} label="Böen">
            {Math.round(c.windGust)} km/h
          </Metric>
          <Metric icon={<CloudRain className="h-4 w-4" />} label="Regen">
            {c.precipProb}% · {c.precip.toFixed(1)} mm
          </Metric>
          <Metric icon={<Droplets className="h-4 w-4" />} label="Luftfeuchte">
            {c.humidity}%
          </Metric>
          <Metric icon={<Sun className="h-4 w-4" />} label="UV-Index">
            {c.uv.toFixed(1)}
          </Metric>
          <Metric icon={<Eye className="h-4 w-4" />} label="Sicht">
            {(c.visibility / 1000).toFixed(1)} km
          </Metric>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Aktualisiert {new Date(c.time).toLocaleString("de-DE")}</span>
          <button
            onClick={onReload}
            className="inline-flex items-center gap-2 hover:text-signal"
          >
            <RefreshCw className="h-3 w-3" /> Aktualisieren
          </button>
        </div>
      </div>

      {/* Hourly */}
      <section>
        <h2 className="font-display text-2xl font-black tracking-tight mb-4">
          Nächste 24 Stunden
        </h2>
        <div className="rounded-2xl border border-border bg-card overflow-x-auto">
          <div className="flex divide-x divide-border min-w-max">
            {data.hourly.map((h) => {
              const w = weatherCodeInfo(h.weatherCode, true);
              const t = new Date(h.time);
              return (
                <div key={h.time} className="px-4 py-4 text-center min-w-[88px]">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {t.getHours().toString().padStart(2, "0")}:00
                  </div>
                  <div className="text-2xl my-1" aria-hidden>{w.emoji}</div>
                  <div className="font-display font-black">{Math.round(h.temperature)}°</div>
                  <div className="mt-1 text-[11px] text-signal">{h.precipProb}%</div>
                  <div className="text-[10px] text-muted-foreground">{Math.round(h.windSpeed)} km/h</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily */}
      <section>
        <h2 className="font-display text-2xl font-black tracking-tight mb-4">
          5-Tage-Prognose
        </h2>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {data.daily.map((d, i) => {
            const w = weatherCodeInfo(d.weatherCode, true);
            const date = new Date(d.date);
            const dayLabel =
              i === 0 ? "Heute" : date.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" });
            return (
              <div
                key={d.date}
                className="grid grid-cols-2 md:grid-cols-[1.2fr_auto_1fr_1fr_1fr_1fr] items-center gap-3 px-5 py-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0" aria-hidden>{w.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{dayLabel}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{w.label}</div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Sunrise className="h-3 w-3" />{formatTime(d.sunrise)}</span>
                  <span className="inline-flex items-center gap-1"><Sunset className="h-3 w-3" />{formatTime(d.sunset)}</span>
                </div>
                <DayCell icon={<Thermometer className="h-3 w-3" />}>
                  {Math.round(d.tempMin)}° / <span className="font-bold">{Math.round(d.tempMax)}°</span>
                </DayCell>
                <DayCell icon={<CloudRain className="h-3 w-3" />}>
                  {d.precipProbMax}% · {d.precipSum.toFixed(1)} mm
                </DayCell>
                <DayCell icon={<Wind className="h-3 w-3" />}>
                  {Math.round(d.windMax)} km/h
                </DayCell>
                <DayCell icon={<Sun className="h-3 w-3" />}>
                  UV {d.uvMax.toFixed(1)}
                </DayCell>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Datenquelle: <a href="https://open-meteo.com" target="_blank" rel="noopener" className="underline hover:text-signal">Open-Meteo</a>
        {" · "}Reverse-Geocoding: BigDataCloud
      </p>
    </div>
  );
}

function Metric({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-1.5 eyebrow-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

function DayCell({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}
