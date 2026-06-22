import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Wind, MapPin, Loader2, AlertCircle, RotateCw } from "lucide-react";
import { ToolShell, ToolCard, ToolResultStat, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";
import { getLocation, hasGeoConsent } from "@/lib/geo-consent";

export const Route = createFileRoute("/tools/luftqualitaet")({
  head: () =>
    toolHead({
      title: "Luftqualität & Pollen für Radfahrer",
      description:
        "Aktuelle Luftqualität (European AQI), Feinstaub (PM2.5/PM10), Ozon, NO₂ und Pollenflug für deinen Standort — direkt von Open-Meteo.",
      path: "/tools/luftqualitaet",
    }),
  component: AirPage,
});

type AirData = {
  city?: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  pollen: { birch: number; grass: number; ragweed: number; alder: number };
};

function aqiLabel(aqi: number) {
  if (aqi <= 20) return { label: "Sehr gut", color: "text-emerald-500", advice: "Perfekt für lange Touren und intensive Belastung." };
  if (aqi <= 40) return { label: "Gut", color: "text-green-500", advice: "Sehr gute Bedingungen für jede Fahrt." };
  if (aqi <= 60) return { label: "Mäßig", color: "text-yellow-500", advice: "Unauffällig. Empfindliche Personen: Hauptverkehrsachsen meiden." };
  if (aqi <= 80) return { label: "Schlecht", color: "text-orange-500", advice: "Intensive Belastung reduzieren. Nebenstrecken bevorzugen." };
  if (aqi <= 100) return { label: "Sehr schlecht", color: "text-red-500", advice: "Asthmatiker und Kinder sollten verzichten." };
  return { label: "Extrem schlecht", color: "text-purple-500", advice: "Sport im Freien nicht empfohlen." };
}

function pollenLabel(v: number) {
  if (v < 1) return "keine";
  if (v < 10) return "gering";
  if (v < 50) return "mäßig";
  return "stark";
}

function AirPage() {
  const [data, setData] = useState<AirData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [askedPermission, setAskedPermission] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Geolocation wird vom Browser nicht unterstützt.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5,ozone,nitrogen_dioxide,birch_pollen,grass_pollen,ragweed_pollen,alder_pollen&timezone=auto`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Open-Meteo Air-Quality nicht erreichbar.");
          const json = await res.json();
          const c = json.current;
          let city: string | undefined;
          try {
            const geo = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=de&count=1`,
            );
            const g = await geo.json();
            city = g.results?.[0]?.name;
          } catch {
            /* ignore */
          }
          setData({
            city,
            aqi: c.european_aqi,
            pm25: c.pm2_5,
            pm10: c.pm10,
            o3: c.ozone,
            no2: c.nitrogen_dioxide,
            pollen: {
              birch: c.birch_pollen ?? 0,
              grass: c.grass_pollen ?? 0,
              ragweed: c.ragweed_pollen ?? 0,
              alder: c.alder_pollen ?? 0,
            },
          });
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unbekannter Fehler");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message || "Standort konnte nicht ermittelt werden.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  };

  useEffect(() => {
    if (askedPermission) return;
    setAskedPermission(true);
  }, [askedPermission]);

  return (
    <ToolShell
      eyebrow="Wetter · 02"
      title="Luftqualität & Pollen"
      description="Bevor du losfährst: Wie sauber ist die Luft auf deiner Strecke? Live-Daten direkt für deinen Standort."
      icon={Wind}
    >
      {!data && !loading && !error && (
        <ToolCard className="text-center">
          <MapPin className="mx-auto h-8 w-8 text-signal" />
          <h2 className="mt-4 font-display text-xl font-bold tracking-tight">
            Standort freigeben
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Wir verwenden deinen Standort einmalig, um Luftqualität und Pollenflug für deinen
            Ort abzufragen. Es werden keine Daten gespeichert.
          </p>
          <button
            onClick={load}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-signal-foreground transition-transform hover:scale-[1.02]"
          >
            Standort verwenden
          </button>
        </ToolCard>
      )}

      {loading && (
        <ToolCard className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-signal" />
          Lade Luftqualitätsdaten…
        </ToolCard>
      )}

      {error && (
        <ToolCard className="border-red-500/40">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
            <div>
              <h2 className="font-display text-base font-bold">Fehler</h2>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={load}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-card"
              >
                <RotateCw className="h-3.5 w-3.5" /> Erneut versuchen
              </button>
            </div>
          </div>
        </ToolCard>
      )}

      {data && (
        <div className="grid gap-6">
          <ToolCard>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Standort
                </div>
                <div className="font-display text-2xl font-black tracking-tight">
                  {data.city ?? "Aktueller Standort"}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-display text-4xl font-black ${aqiLabel(data.aqi).color}`}>
                  {Math.round(data.aqi)}
                </div>
                <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${aqiLabel(data.aqi).color}`}>
                  {aqiLabel(data.aqi).label}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Empfehlung:</strong> {aqiLabel(data.aqi).advice}
            </p>
          </ToolCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ToolResultStat label="PM2.5" value={data.pm25?.toFixed(1)} unit="µg/m³" hint="Feinstaub" />
            <ToolResultStat label="PM10" value={data.pm10?.toFixed(1)} unit="µg/m³" />
            <ToolResultStat label="Ozon" value={data.o3?.toFixed(0)} unit="µg/m³" />
            <ToolResultStat label="NO₂" value={data.no2?.toFixed(0)} unit="µg/m³" hint="Verkehrsbelastung" />
          </div>

          <ToolCard>
            <h2 className="font-display text-lg font-bold tracking-tight">Pollenflug</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              {[
                { label: "Birke", v: data.pollen.birch },
                { label: "Erle", v: data.pollen.alder },
                { label: "Gräser", v: data.pollen.grass },
                { label: "Ambrosia", v: data.pollen.ragweed },
              ].map((p) => (
                <ToolResultStat
                  key={p.label}
                  label={p.label}
                  value={pollenLabel(p.v)}
                  hint={`${p.v?.toFixed(0)} Pollen/m³`}
                />
              ))}
            </div>
          </ToolCard>
        </div>
      )}

      <ToolDisclaimer>
        Datenquelle: Open-Meteo Air-Quality-API (CAMS Europe / ECMWF). European AQI nach
        EEA-Skala. Pollendaten sind Modellprognosen und können regional abweichen.
      </ToolDisclaimer>
    </ToolShell>
  );
}
