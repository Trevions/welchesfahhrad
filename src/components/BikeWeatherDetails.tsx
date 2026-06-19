import { Wind, Droplets, Thermometer, Sun, Eye, CloudRain, MapPin, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { BikeWeather } from "@/hooks/use-bike-weather";
import { weatherCodeInfo, windDirLabel } from "@/hooks/use-bike-weather";
import { buildBikeTips, severityClasses } from "@/lib/bike-weather-tips";

export function BikeWeatherDetails({
  data,
  showFullLink = true,
}: {
  data: BikeWeather;
  showFullLink?: boolean;
}) {
  const c = data.current;
  const wc = weatherCodeInfo(c.weatherCode, c.isDay);
  const tips = buildBikeTips(c, data.hourly);

  const scoreColor =
    data.bikeScore.score >= 75
      ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/5"
      : data.bikeScore.score >= 55
        ? "text-signal border-signal/40 bg-signal/5"
        : "text-amber-400 border-amber-400/40 bg-amber-400/5";

  return (
    <div className="space-y-5">
      {/* Hero summary */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-signal">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{data.location.label}</span>
        </div>
        <div className="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <span className="text-5xl" aria-hidden>{wc.emoji}</span>
          <div className="min-w-0">
            <div className="font-display text-4xl font-black leading-none">
              {Math.round(c.temperature)}°
            </div>
            <div className="mt-1 text-xs text-muted-foreground truncate">
              {wc.label} · gefühlt {Math.round(c.apparent)}°
            </div>
          </div>
          <div className={`rounded-lg border px-3 py-2 text-center shrink-0 ${scoreColor}`}>
            <div className="text-[9px] uppercase tracking-[0.18em] opacity-80">Bike-Score</div>
            <div className="font-display text-2xl font-black leading-none">{data.bikeScore.score}</div>
            <div className="text-[10px] font-bold mt-0.5">{data.bikeScore.rating}</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <Stat icon={<Wind className="h-3.5 w-3.5" />} label="Wind">
            {Math.round(c.windSpeed)} km/h {windDirLabel(c.windDir)}
          </Stat>
          <Stat icon={<CloudRain className="h-3.5 w-3.5" />} label="Regen">
            {c.precipProb}%
          </Stat>
          <Stat icon={<Droplets className="h-3.5 w-3.5" />} label="Luft">
            {c.humidity}%
          </Stat>
          <Stat icon={<Wind className="h-3.5 w-3.5" />} label="Böen">
            {Math.round(c.windGust)} km/h
          </Stat>
          <Stat icon={<Sun className="h-3.5 w-3.5" />} label="UV">
            {c.uv.toFixed(1)}
          </Stat>
          <Stat icon={<Eye className="h-3.5 w-3.5" />} label="Sicht">
            {(c.visibility / 1000).toFixed(1)} km
          </Stat>
        </div>
      </div>

      {/* Tips */}
      <div>
        <h3 className="font-display text-lg font-black tracking-tight mb-3 flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-signal" />
          Tipps für deine Tour
        </h3>
        <ul className="space-y-2.5">
          {tips.map((t) => (
            <li
              key={t.id}
              className={`rounded-xl border p-3.5 ${severityClasses[t.severity]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0" aria-hidden>{t.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-foreground">{t.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 12h preview */}
      <div>
        <h3 className="font-display text-lg font-black tracking-tight mb-3">
          Nächste 12 Stunden
        </h3>
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <div className="flex divide-x divide-border min-w-max">
            {data.hourly.slice(0, 12).map((h) => {
              const w = weatherCodeInfo(h.weatherCode, true);
              const t = new Date(h.time);
              return (
                <div key={h.time} className="px-3 py-3 text-center min-w-[72px]">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t.getHours().toString().padStart(2, "0")}:00
                  </div>
                  <div className="text-xl my-0.5" aria-hidden>{w.emoji}</div>
                  <div className="font-display font-black text-sm">{Math.round(h.temperature)}°</div>
                  <div className="text-[10px] text-signal">{h.precipProb}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showFullLink && (
        <Link
          to="/tools/fahrrad-wetter"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-signal hover:underline"
        >
          5-Tage-Prognose öffnen <ArrowRight className="h-3 w-3" />
        </Link>
      )}
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
    <div className="rounded-lg border border-border/60 bg-background/40 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-0.5 text-foreground text-[13px]">{children}</div>
    </div>
  );
}
