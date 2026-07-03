import { useMemo, useState } from "react";
import { MapPin, Wind, Droplets, Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { useBikeWeather, weatherCodeInfo, windDirLabel } from "@/hooks/use-bike-weather";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BikeWeatherDetails } from "@/components/BikeWeatherDetails";
import { computeRadelScore } from "@/lib/tools/radel-score";


export function BikeWeatherBar() {
  const { status, data, accept, decline, reload, error } = useBikeWeather();
  const [open, setOpen] = useState(false);

  // Hooks MUST run in the same order every render — compute before any early return.
  const radel = useMemo(() => {
    if (!data) return null;
    const c = data.current;
    const next3 = data.hourly.slice(0, 3);
    const precipProb =
      next3.length > 0
        ? next3.reduce((s, h) => s + (h.precipProb ?? 0), 0) / next3.length
        : c.precipProb;
    let minutesToSunset: number | null = null;
    const today = data.daily[0];
    if (today?.sunset) {
      minutesToSunset = Math.round((new Date(today.sunset).getTime() - Date.now()) / 60000);
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


  if (status === "idle" || status === "loading") {
    return (
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-2 flex items-center gap-3 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-signal" />
          <span className="eyebrow-sm">Fahrrad-Wetter wird geladen …</span>
        </div>
      </div>
    );
  }

  if (status === "prompt") {
    return (
      <div className="border-b border-border bg-gradient-to-r from-card via-card to-background">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl">🚴‍♂️</span>
            <div className="min-w-0 text-sm text-foreground/90">
              Standort erlauben für stundengenaues Fahrrad-Wetter
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={decline}
              className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground px-2 py-1.5"
            >
              Nicht jetzt
            </button>
            <button
              onClick={accept}
              className="inline-flex items-center gap-1.5 bg-signal text-signal-foreground px-3 py-1.5 text-[11px] uppercase tracking-widest hover:opacity-90"
            >
              <MapPin className="h-3 w-3" /> Erlauben
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "denied" || status === "error") {
    return (
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
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

  // Same score as der Radel-Score-Badge — identische Formel, identische Zahl
  const radel = useMemo(() => {
    const next3 = data.hourly.slice(0, 3);
    const precipProb =
      next3.length > 0
        ? next3.reduce((s, h) => s + (h.precipProb ?? 0), 0) / next3.length
        : c.precipProb;
    let minutesToSunset: number | null = null;
    const today = data.daily[0];
    if (today?.sunset) {
      minutesToSunset = Math.round((new Date(today.sunset).getTime() - Date.now()) / 60000);
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
  }, [data, c]);


  return (
    <>
      <div className="border-b border-border bg-[linear-gradient(90deg,hsl(var(--card))_0%,hsl(var(--background))_100%)]">
        <button
          onClick={() => setOpen(true)}
          aria-label="Fahrrad-Wetter Details öffnen"
          className="w-full text-left hover:bg-card/40 transition-colors"
        >
          <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-2 flex items-center gap-3">
            <span className="text-xl md:text-2xl shrink-0" aria-hidden>{wc.emoji}</span>

            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-display text-lg md:text-xl font-black tracking-tight">
                {Math.round(c.temperature)}°
              </span>
              <span className="hidden sm:inline text-[11px] text-muted-foreground truncate">
                {wc.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground truncate">
                <MapPin className="h-2.5 w-2.5" />
                <span className="truncate max-w-[100px] sm:max-w-[180px]">{data.location.label.split(",")[0]}</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4 ml-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Wind className="h-3 w-3" />{Math.round(c.windSpeed)} km/h {windDirLabel(c.windDir)}</span>
              <span className="inline-flex items-center gap-1"><Droplets className="h-3 w-3" />{c.precipProb}%</span>
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold" style={{ color: radel.colorHex }}>
                {radel.score} · <span className="hidden sm:inline">{radel.rating}</span>
              </span>

              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground">
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[90vh] overflow-y-auto bg-background border-border"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-2xl font-black tracking-tight">
              Fahrrad-Wetter
            </SheetTitle>
            <SheetDescription>
              Aktuelle Bedingungen und Sicherheits-Tipps für deine Tour.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5">
            <BikeWeatherDetails data={data} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
