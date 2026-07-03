import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, MapPin, RefreshCw, AlertTriangle, Lightbulb, Wind, Droplets, Thermometer, Flower2, Sun } from "lucide-react";
import { ToolShell } from "@/components/tools/ToolShell";
import { ToolReviewedBy, ToolFaq, ToolSeoSection } from "@/components/tools/ToolSeo";
import { toolHead } from "@/lib/tools/seo";
import { useBikeWeather } from "@/hooks/use-bike-weather";
import { computeRadelScore, pollenLevelFromValues, type ScoreInputs, type ScoreResult } from "@/lib/tools/radel-score";

const SLUG = "radel-score";
const ALLERGIE_KEY = "radmap-radel-allergie";

const FAQ = [
  {
    question: "Wie wird der Radel-Score berechnet?",
    answer:
      "Wir starten bei 100 Punkten und ziehen transparente Abzüge nach fünf Faktoren ab: Niederschlag (max. −40), Wind inkl. Böen (max. −25), gefühlte Temperatur (max. −20), Pollen (max. −10, nur im Allergiker-Modus) und Tageslicht (max. −5). Bei Temperaturen ≤ 2 °C plus Feuchte greift ein Glätte-Override, der den Score auf maximal 25 deckelt. Jeder Abzug ist im Breakdown sichtbar — keine Blackbox.",
  },
  {
    question: "Welche Daten nutzt der Score?",
    answer:
      "Live-Wetter (Temperatur, gefühlte Temperatur, Niederschlagswahrscheinlichkeit, Wind, Böen, Sonnenuntergang) von Open-Meteo und optional die Pollen-Prognose aus der Open-Meteo Air-Quality-API (CAMS Europe). Standort per Geolocation, jederzeit widerrufbar.",
  },
  {
    question: "Was heißt Beste Fahrzeit heute?",
    answer:
      "Wir berechnen den Radel-Score stündlich für die nächsten 12 Stunden und markieren die Fenster mit dem höchsten Wert. Das beantwortet die eigentlich wichtige Frage: Wenn jetzt nicht — wann dann?",
  },
  {
    question: "Ersetzt der Score meine eigene Einschätzung?",
    answer:
      "Nein. Der Radel-Score ist eine Entscheidungshilfe. Sichtprüfung, lokale Warnungen (DWD-Unwetter, Straßenzustand) und die eigene Erfahrung haben immer Vorrang. Bei roter Glätte-Warnung besser gar nicht fahren.",
  },
];

export const Route = createFileRoute("/tools/radel-score")({
  head: () =>
    toolHead({
      title: "Radel-Score — Wie gut ist heute zum Radfahren?",
      description:
        "Der Radel-Score bewertet Fahrrad-Bedingungen von 0–100 nach Niederschlag, Wind, gefühlter Temperatur, Pollen und Tageslicht. Transparenter Breakdown und die besten Fahrzeiten der nächsten 12 Stunden.",
      path: "/tools/radel-score",
      slug: SLUG,
      faq: FAQ,
    }),
  component: RadelScorePage,
});

// -------- Page --------
function RadelScorePage() {
  return (
    <ToolShell
      eyebrow="Live-Bedingungen"
      title="Radel-Score"
      description="Wie gut ist heute zum Radfahren? Ein Index von 0–100, transparent aus Wetter, Wind, Temperatur, Pollen und Tageslicht — plus die beste Fahrzeit der nächsten Stunden."
      icon={Activity}
    >
      <RadelScoreLive />

      <ToolSeoSection slug={SLUG} heading="So funktioniert der Radel-Score">
        <p>
          Der <strong>Radel-Score</strong> beantwortet in einer einzigen Zahl die Frage, die
          sich Radfahrer:innen jeden Morgen stellen: <em>„Lohnt sich die Runde heute?"</em> Statt
          Wetterdaten selbst zu interpretieren, siehst du 0–100 Punkte, einen Klartext-Stempel
          („Perfekt", „Sehr gut", „Okay", „Mäßig", „Schlecht") und die Faktoren, die zum
          Ergebnis geführt haben.
        </p>
        <h3>Methodik — jeder Punkt ist nachvollziehbar</h3>
        <p>
          Wir starten bei 100 Punkten und ziehen deterministisch ab. Keine Blackbox, keine KI —
          die Formel steht offen im Code und in dieser Erklärung:
        </p>
        <ul>
          <li><strong>Niederschlag (max. −40):</strong> Regenwahrscheinlichkeit der nächsten drei Stunden staffelweise (&lt;10 % = 0, 10–30 % = −5, 30–50 % = −15, 50–70 % = −25, &gt;70 % = −35) plus zusätzlich −5 bei aktivem Regen &gt; 0,5 mm/h.</li>
          <li><strong>Wind (max. −25):</strong> Mittelwind &lt;10 km/h = 0, 10–20 = −3, 20–30 = −10, 30–40 = −18, &gt;40 = −25. Böen über 50 km/h ziehen weitere −5, gedeckelt bei −25 gesamt.</li>
          <li><strong>Gefühlte Temperatur (max. −20):</strong> Optimum 15–24 °C. Je weiter weg, desto höher der Abzug — bis −20 unter 0 °C oder über 35 °C.</li>
          <li><strong>Pollen (max. −10, opt-in):</strong> Nur wenn du den Allergiker-Modus aktivierst. Werte aus der Open-Meteo Air-Quality-API (Birke, Erle, Gräser, Ambrosia).</li>
          <li><strong>Tageslicht (max. −5):</strong> Weniger als 2 h bis Sonnenuntergang = −3, nach Sonnenuntergang = −5 mit Beleuchtungs-Hinweis.</li>
          <li><strong>Glätte-Override:</strong> Bei ≤ 2 °C plus Niederschlag oder hoher Feuchte wird der Score hart auf maximal 25 gedeckelt — rote Warnung „Glättegefahr".</li>
        </ul>
        <h3>Warum diese Faktoren?</h3>
        <p>
          Reifenphysik, Sichtverhältnisse und thermische Belastung sind die drei Größen, die die
          Sicherheit auf dem Rad wirklich bestimmen. Wind wird häufig unterschätzt: Gegenwind
          über 25 km/h kostet auf einer 30-km-Tour spürbar Energie und macht Ausweichmanöver
          instabiler. Deshalb bekommt Wind bei uns dasselbe Gewicht wie Temperatur — anders als
          bei klassischen „Freizeit-Wetter"-Indizes.
        </p>
        <h3>Für wen ist der Score sinnvoll?</h3>
        <p>
          Pendler:innen, die morgens zwischen Rad und ÖPNV entscheiden. Rennrad- und
          Gravel-Fahrer, die das Zeitfenster für die lange Runde suchen. E-Bike-Familien mit
          Kindern im Anhänger, für die Wind und Regen kritischer sind als für sportliche
          Solo-Fahrer. Und alle, die eine schnelle, ehrliche Antwort wollen, ohne fünf Apps zu
          vergleichen.
        </p>
        <h3>Grenzen des Radel-Scores</h3>
        <p>
          Der Score kennt keine lokalen Baustellen, keinen aktuellen Straßenzustand und keine
          Unwetterwarnungen des DWD. Er ersetzt keine eigene Einschätzung und keinen Blick
          aus dem Fenster. Bei der roten Glätte-Warnung ist die eindeutige Empfehlung: nicht
          fahren.
        </p>
        <p>
          Datenbasis: <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a>
          {" "}(Wetter &amp; Air-Quality / CAMS Europe). Score-Berechnung läuft komplett im Browser
          und aktualisiert sich sofort bei Standortwechsel.
        </p>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
      <ToolReviewedBy slug={SLUG} />
    </ToolShell>
  );
}

// -------- Live section --------
function RadelScoreLive() {
  const { status, data, accept, reload } = useBikeWeather();
  const [allergie, setAllergie] = useState<boolean>(false);
  const [pollen, setPollen] = useState<ReturnType<typeof pollenLevelFromValues> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAllergie(localStorage.getItem(ALLERGIE_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!allergie || !data) { setPollen(null); return; }
    const { lat, lon } = data.location;
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=birch_pollen,grass_pollen,ragweed_pollen,alder_pollen&timezone=auto`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        const c = j?.current ?? {};
        setPollen(pollenLevelFromValues({
          birch: c.birch_pollen, grass: c.grass_pollen, ragweed: c.ragweed_pollen, alder: c.alder_pollen,
        }));
      })
      .catch(() => setPollen(null));
  }, [allergie, data]);

  const toggleAllergie = () => {
    const next = !allergie;
    setAllergie(next);
    if (typeof window !== "undefined") localStorage.setItem(ALLERGIE_KEY, next ? "1" : "0");
  };

  const currentInputs = useMemo<ScoreInputs | null>(() => {
    if (!data) return null;
    const c = data.current;
    const next3 = data.hourly.slice(0, 3);
    const precipProb = next3.length ? next3.reduce((s, h) => s + (h.precipProb ?? 0), 0) / next3.length : c.precipProb;
    let minutesToSunset: number | null = null;
    const today = data.daily[0];
    if (today?.sunset) minutesToSunset = Math.round((new Date(today.sunset).getTime() - Date.now()) / 60000);
    return {
      precipProb, precipNow: c.precip, windSpeed: c.windSpeed, windGust: c.windGust,
      apparentTemp: c.apparent, humidity: c.humidity,
      pollenLevel: allergie ? (pollen ?? undefined) : undefined,
      minutesToSunset,
    };
  }, [data, allergie, pollen]);

  const result = useMemo<ScoreResult | null>(() => currentInputs ? computeRadelScore(currentInputs) : null, [currentInputs]);

  // Beste Fahrzeit: stündlich für die nächsten 12 h
  const hourly = useMemo(() => {
    if (!data) return [];
    const today = data.daily[0];
    const sunsetMs = today?.sunset ? new Date(today.sunset).getTime() : null;
    return data.hourly.slice(0, 12).map((h) => {
      const t = new Date(h.time).getTime();
      const inputs: ScoreInputs = {
        precipProb: h.precipProb, precipNow: h.precip, windSpeed: h.windSpeed,
        windGust: data.current.windGust,
        apparentTemp: h.temperature,
        humidity: data.current.humidity,
        pollenLevel: allergie ? (pollen ?? undefined) : undefined,
        minutesToSunset: sunsetMs ? Math.round((sunsetMs - t) / 60000) : null,
      };
      const r = computeRadelScore(inputs);
      const d = new Date(h.time);
      return { hour: d.getHours(), label: `${String(d.getHours()).padStart(2, "0")}:00`, score: r.score, rating: r.rating, colorHex: r.colorHex };
    });
  }, [data, allergie, pollen]);

  const bestWindows = useMemo(() => {
    if (hourly.length < 2) return [];
    const windows: Array<{ from: string; to: string; avg: number; colorHex: string }> = [];
    for (let i = 0; i <= hourly.length - 2; i++) {
      const a = hourly[i], b = hourly[i + 1];
      const avg = Math.round((a.score + b.score) / 2);
      windows.push({ from: a.label, to: `${String((b.hour + 1) % 24).padStart(2, "0")}:00`, avg, colorHex: a.colorHex });
    }
    return windows.sort((x, y) => y.avg - x.avg).slice(0, 3);
  }, [hourly]);

  if (status === "prompt") {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-8 text-center">
        <MapPin className="mx-auto h-8 w-8 text-signal" />
        <p className="mt-4 text-lg font-semibold">Standort erlauben für deinen Radel-Score</p>
        <p className="mt-2 text-sm text-muted-foreground">Wir nutzen den Standort einmalig für Live-Wetter. Keine Speicherung auf Servern.</p>
        <button onClick={accept} className="mt-5 inline-flex items-center gap-2 bg-signal px-5 py-2.5 text-signal-foreground text-sm font-semibold hover:opacity-90">
          <MapPin className="h-4 w-4" /> Standort erlauben
        </button>
      </div>
    );
  }

  if (status === "denied" || status === "error" || !result) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">Radel-Score braucht Live-Wetterdaten für deinen Standort.</p>
        <button onClick={reload} className="mt-4 inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-widest hover:bg-card">
          <RefreshCw className="h-3.5 w-3.5" /> Erneut versuchen
        </button>
      </div>
    );
  }

  const updated = data ? new Date(data.current.time) : new Date();

  return (
    <div className="space-y-8">
      {/* Score Hero */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr] items-center rounded-2xl border border-border bg-card/60 p-6 md:p-10">
        <Gauge score={result.score} colorHex={result.colorHex} />
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 flex-wrap">
            <MapPin className="h-3 w-3" /> {data!.location.label.split(",")[0]}
            <span aria-hidden>·</span>
            <span>Stand: {updated.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr</span>
          </div>
          <div className="mt-2 font-display text-3xl md:text-4xl font-black tracking-tight" style={{ color: result.colorHex }}>
            {result.rating}
          </div>
          <p className="mt-3 flex items-start gap-2 text-sm md:text-base text-foreground/90">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
            <span>{result.recommendation}</span>
          </p>
          {result.glaetteWarning && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Glättegefahr:</strong> Score gedeckelt. Kalte Nässe auf der Fahrbahn — wenn möglich nicht fahren.</span>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={allergie} onChange={toggleAllergie} className="h-4 w-4 accent-signal" />
              <span className="text-muted-foreground">Allergiker-Modus (Pollen berücksichtigen)</span>
            </label>
            <button onClick={reload} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3 w-3" /> Aktualisieren
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <section>
        <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl">Faktoren-Breakdown</h2>
        <p className="mt-2 text-sm text-muted-foreground">Volle Transparenz — so kommen die {result.score} Punkte zustande.</p>
        <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card/60">
          <li className="flex items-center gap-4 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background text-signal"><Droplets className="h-4 w-4" /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold">Niederschlag</span>
              <span className="block text-xs text-muted-foreground">{result.deductions.find(d => d.key === "precip")?.value}</span>
            </span>
            <DeductionPill points={result.deductions.find(d => d.key === "precip")?.points ?? 0} />
          </li>
          <li className="flex items-center gap-4 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background text-signal"><Wind className="h-4 w-4" /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold">Wind</span>
              <span className="block text-xs text-muted-foreground">{result.deductions.find(d => d.key === "wind")?.value}</span>
            </span>
            <DeductionPill points={result.deductions.find(d => d.key === "wind")?.points ?? 0} />
          </li>
          <li className="flex items-center gap-4 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background text-signal"><Thermometer className="h-4 w-4" /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold">Gefühlte Temperatur</span>
              <span className="block text-xs text-muted-foreground">{result.deductions.find(d => d.key === "temp")?.value}</span>
            </span>
            <DeductionPill points={result.deductions.find(d => d.key === "temp")?.points ?? 0} />
          </li>
          {result.deductions.find(d => d.key === "pollen") && (
            <li className="flex items-center gap-4 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background text-signal"><Flower2 className="h-4 w-4" /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold">Pollenbelastung</span>
                <span className="block text-xs text-muted-foreground">{result.deductions.find(d => d.key === "pollen")?.value}</span>
              </span>
              <DeductionPill points={result.deductions.find(d => d.key === "pollen")?.points ?? 0} />
            </li>
          )}
          {result.deductions.find(d => d.key === "light") && (
            <li className="flex items-center gap-4 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background text-signal"><Sun className="h-4 w-4" /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold">Tageslicht</span>
                <span className="block text-xs text-muted-foreground">
                  {result.deductions.find(d => d.key === "light")?.value}
                  {(result.deductions.find(d => d.key === "light")?.points ?? 0) < 0 && (
                    <> · <Link to="/tools/stvo" className="text-signal hover:underline">Beleuchtungspflicht (StVZO)</Link></>
                  )}
                </span>
              </span>
              <DeductionPill points={result.deductions.find(d => d.key === "light")?.points ?? 0} />
            </li>
          )}
        </ul>
      </section>

      {/* Beste Fahrzeit */}
      {bestWindows.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl">Beste Fahrzeit heute</h2>
          <p className="mt-2 text-sm text-muted-foreground">Die 2-Stunden-Fenster mit dem höchsten Score in den nächsten 12 Stunden.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {bestWindows.map((w, i) => (
              <div key={i} className="rounded-2xl border p-5" style={{ borderColor: w.colorHex, backgroundColor: `color-mix(in oklch, ${w.colorHex} 10%, transparent)` }}>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Fenster {i + 1}</div>
                <div className="mt-1 font-display text-2xl font-black tracking-tight">{w.from}–{w.to}</div>
                <div className="mt-2 text-sm">Score <span className="font-bold" style={{ color: w.colorHex }}>{w.avg}</span></div>
              </div>
            ))}
          </div>

          {/* Hourly strip */}
          <div className="mt-5 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {hourly.map((h, i) => (
                <div key={i} className="w-14 text-center">
                  <div className="text-[10px] text-muted-foreground">{h.label}</div>
                  <div
                    className="mt-1 rounded-md py-2 text-xs font-bold"
                    style={{ backgroundColor: `color-mix(in oklch, ${h.colorHex} 22%, transparent)`, color: h.colorHex, border: `1px solid ${h.colorHex}` }}
                  >
                    {h.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interne Links */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/tools/fahrrad-wetter" className="rounded-xl border border-border bg-card/60 p-4 hover:border-signal/60 hover:bg-card">
          <div className="text-[11px] uppercase tracking-[0.18em] text-signal">Detail</div>
          <div className="mt-1 text-sm font-semibold">Fahrrad-Wetter</div>
        </Link>
        <Link to="/tools/luftqualitaet" className="rounded-xl border border-border bg-card/60 p-4 hover:border-signal/60 hover:bg-card">
          <div className="text-[11px] uppercase tracking-[0.18em] text-signal">Detail</div>
          <div className="mt-1 text-sm font-semibold">Pollen &amp; Luftqualität</div>
        </Link>
        <Link to="/tools/eco-route" className="rounded-xl border border-border bg-card/60 p-4 hover:border-signal/60 hover:bg-card">
          <div className="text-[11px] uppercase tracking-[0.18em] text-signal">Route</div>
          <div className="mt-1 text-sm font-semibold">Eco Route Planner</div>
        </Link>
      </section>
    </div>
  );
}

function Gauge({ score, colorHex }: { score: number; colorHex: string }) {
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="mx-auto lg:mx-0 relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--border))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={colorHex} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 500ms ease, stroke 500ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-5xl font-black tracking-tight" style={{ color: colorHex }}>{score}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">von 100</div>
        </div>
      </div>
    </div>
  );
}

function DeductionPill({ points }: { points: number }) {
  const positive = points === 0;
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold tabular-nums ${positive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/10 text-rose-300 border border-rose-500/40"}`}>
      {positive ? "±0" : points}
    </span>
  );
}
