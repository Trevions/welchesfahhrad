import { Link } from "@tanstack/react-router";
import { MapPin, Wind, Droplets, Thermometer, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useBikeWeather, weatherCodeInfo, windDirLabel } from "@/hooks/use-bike-weather";

export function BikeWeatherBar() {
  const { status, data, accept, decline, reload, error } = useBikeWeather();

  if (status === "idle" || status === "loading") {
    return (
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-3 flex items-center gap-3 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-signal" />
          <span className="eyebrow-sm">Fahrrad-Wetter wird geladen …</span>
        </div>
      </div>
    );
  }

  if (status === "prompt") {
    return (
      <div className="border-b border-border bg-gradient-to-r from-card via-card to-background">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl">🚴‍♂️</span>
            <div className="min-w-0">
              <div className="eyebrow-sm text-signal">Fahrrad-Wetter</div>
              <div className="text-sm text-foreground/90">
                Standort erlauben für stundengenaue Prognose in deiner Region.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={decline}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Nicht jetzt
            </button>
            <button
              onClick={accept}
              className="inline-flex items-center gap-2 bg-signal text-signal-foreground px-4 py-2 text-xs uppercase tracking-widest hover:opacity-90 transition"
            >
              <MapPin className="h-3.5 w-3.5" /> Standort erlauben
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "denied" || status === "error") {
    return (
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            {status === "denied"
              ? "Standort nicht erlaubt — Fahrrad-Wetter ist inaktiv."
              : `Wetter nicht verfügbar: ${error}`}
          </span>
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 eyebrow-sm text-signal hover:underline"
          >
            <RefreshCw className="h-3 w-3" /> Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const c = data.current;
  const wc = weatherCodeInfo(c.weatherCode, c.isDay);
  const scoreColor =
    data.bikeScore.score >= 75
      ? "text-emerald-400"
      : data.bikeScore.score >= 55
        ? "text-signal"
        : "text-amber-400";

  return (
    <div className="border-b border-border bg-[linear-gradient(90deg,hsl(var(--card))_0%,hsl(var(--background))_100%)]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:flex-nowrap md:justify-between">
          {/* Left: location + condition */}
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-3xl shrink-0" aria-hidden>{wc.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-signal">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{data.location.label}</span>
              </div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-display text-2xl md:text-3xl font-black tracking-tight">
                  {Math.round(c.temperature)}°
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {wc.label} · gefühlt {Math.round(c.apparent)}°
                </span>
              </div>
            </div>
          </div>

          {/* Middle stats (desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-xs">
            <Stat icon={<Wind className="h-3.5 w-3.5" />} label="Wind">
              {Math.round(c.windSpeed)} km/h {windDirLabel(c.windDir)}
            </Stat>
            <Stat icon={<Droplets className="h-3.5 w-3.5" />} label="Regen">
              {c.precipProb}%
            </Stat>
            <Stat icon={<Thermometer className="h-3.5 w-3.5" />} label="Luft">
              {c.humidity}% rH
            </Stat>
            <div className="flex flex-col">
              <span className="eyebrow-sm text-muted-foreground">Bike-Score</span>
              <span className={`font-display text-lg font-black ${scoreColor}`}>
                {data.bikeScore.score} · {data.bikeScore.rating}
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/tools/fahrrad-wetter"
            className="shrink-0 inline-flex items-center gap-2 border border-border hover:border-signal hover:text-signal transition-colors px-3 py-2 text-[11px] uppercase tracking-[0.18em]"
          >
            Volle Prognose <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 eyebrow-sm text-muted-foreground">
        {icon} {label}
      </span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}
