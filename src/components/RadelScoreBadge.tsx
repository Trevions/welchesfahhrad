import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import { useBikeWeather } from "@/hooks/use-bike-weather";
import { computeRadelScore } from "@/lib/tools/radel-score";

// Kompakter Homepage-Badge — greift auf die bereits geladenen Wetterdaten
// aus useBikeWeather zu. Pollen bleiben hier bewusst aus (Allergiker-Modus
// lebt auf der Tool-Seite), damit der Badge sofort ohne extra Fetch zeigt.
export function RadelScoreBadge({ className = "" }: { className?: string }) {
  const { data } = useBikeWeather();

  const score = useMemo(() => {
    if (!data) return null;
    const c = data.current;
    const next3 = data.hourly.slice(0, 3);
    const precipProb =
      next3.length > 0
        ? next3.reduce((s, h) => s + (h.precipProb ?? 0), 0) / next3.length
        : c.precipProb;

    // Minuten bis Sonnenuntergang aus dem heutigen Daily-Eintrag
    let minutesToSunset: number | null = null;
    const today = data.daily[0];
    if (today?.sunset) {
      const ss = new Date(today.sunset).getTime();
      minutesToSunset = Math.round((ss - Date.now()) / 60000);
    }

    return computeRadelScore({
      precipProb,
      precipNow: c.precip,
      windSpeed: c.windSpeed,
      windGust: c.windGust,
      apparentTemp: c.apparent,
      humidity: c.humidity,
      minutesToSunset,
    });
  }, [data]);

  // Platzhalter — gleiche Größe/Form wie der Eco-Button, damit das Layout stabil bleibt
  if (!score) {
    return (
      <span
        className={`inline-flex items-center gap-2 border border-white/25 bg-white/[0.03] px-5 py-2.5 text-white/50 ${className}`}
        aria-hidden
      >
        <Activity className="h-4 w-4" strokeWidth={1.75} />
        <span className="eyebrow-sm">Radel-Score …</span>
      </span>
    );
  }

  return (
    <Link
      to="/tools/radel-score"
      aria-label={`Radel-Score ${score.score} von 100 — ${score.rating}. Details öffnen.`}
      className="group inline-flex items-center gap-2 border px-5 py-2.5 text-white transition-colors duration-300 hover:bg-white/10"
      style={{
        borderColor: score.colorHex,
        backgroundColor: `color-mix(in oklch, ${score.colorHex} 14%, transparent)`,
      }}
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: score.colorHex, boxShadow: `0 0 8px ${score.colorHex}` }}
      />
      <span className="eyebrow-sm">
        Radel-Score{" "}
        <span className="font-bold" style={{ color: score.colorHex }}>
          {score.score}
        </span>{" "}
        · {score.rating}
      </span>
    </Link>
  );
}
