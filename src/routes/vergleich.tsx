import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { X, Plus, Trash2, Scale } from "lucide-react";
import { getPublicBikeBySlug, listPublicBikes } from "@/lib/bikes.functions";
import { articleImageUrl } from "@/lib/article-image-url";
import { compareStore, subscribeCompare } from "@/lib/bike-compare";
import type { Bike } from "@/lib/bike-types";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/vergleich")({
  head: () => ({
    meta: [
      { title: "Fahrrad-Vergleich — bis zu 4 Räder direkt vergleichen | radmap.de" },
      {
        name: "description",
        content:
          "Vergleiche bis zu vier Fahrräder Seite-an-Seite: Geometrie, Antrieb, E-Bike-System, Reichweite, Preis und Bewertung.",
      },
      { property: "og:title", content: "Fahrrad-Vergleich | radmap.de" },
      {
        property: "og:description",
        content: "Bis zu 4 Räder direkt vergleichen — mit Bestwert-Hervorhebung pro Merkmal.",
      },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/vergleich" }],
  }),
  component: ComparePage,
});

/* ─────────────────── image helper (user spec) ─────────────────── */
function resolveImage(url: string | null | undefined): string {
  const v = (url ?? "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return articleImageUrl(v) || v;
  if (v.startsWith("/")) return `https://radmap.de${v}`;
  const proxied = articleImageUrl(v);
  if (proxied) return proxied;
  return `https://radmap.de/${v}`;
}

/* ─────────────────── page ─────────────────── */
function ComparePage() {
  const [slugs, setSlugs] = useState<string[]>(() => compareStore.list());
  useEffect(() => subscribeCompare(() => setSlugs(compareStore.list())), []);

  const queries = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ["bike", slug],
      queryFn: () => getPublicBikeBySlug({ data: { slug } }),
      staleTime: 60_000,
    })),
  });
  const bikes: Bike[] = queries.map((q) => q.data?.bike).filter(Boolean) as Bike[];

  return (
    <div className="bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-12 border-x border-border">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-signal" />
            <span className="eyebrow text-signal">Vergleich</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight leading-[1.05]">
            Fahrrad-Vergleich
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
            Bis zu {compareStore.MAX} Räder Seite-an-Seite. Der beste Wert je Zeile wird
            hervorgehoben.
          </p>
          {bikes.length > 0 && (
            <button
              onClick={() => compareStore.clear()}
              className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Alle entfernen
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-0 md:px-8 py-8 md:border-x md:border-border">
        {bikes.length === 0 ? (
          <div className="px-4 md:px-0">
            <EmptyState />
          </div>
        ) : (
          <CompareTable bikes={bikes} />
        )}

        <div className="mt-10 px-4 md:px-0">
          <h2 className="eyebrow text-signal mb-3">Rad hinzufügen</h2>
          <AddBikePicker selected={slugs} full={slugs.length >= compareStore.MAX} />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border p-10 text-center">
      <Scale className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">Noch keine Räder im Vergleich.</p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Klicke auf jeder Fahrrad-Karte oder Detail-Seite auf „Vergleichen".
      </p>
      <Link
        to="/fahrraeder"
        className="mt-5 inline-flex items-center gap-1.5 bg-signal text-[#050505] px-4 py-2 text-xs uppercase tracking-widest font-bold hover:brightness-95"
      >
        Räder durchstöbern
      </Link>
    </div>
  );
}

function AddBikePicker({ selected, full }: { selected: string[]; full: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Bike[]>([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await listPublicBikes();
        if (cancel) return;
        const list = res.bikes ?? [];
        const filtered = q.trim()
          ? list.filter((b) => `${b.brand} ${b.model}`.toLowerCase().includes(q.trim().toLowerCase()))
          : list;
        setResults(filtered.slice(0, 12));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancel = true;
    };
  }, [q]);

  if (full) {
    return (
      <p className="text-xs text-muted-foreground">
        Maximum von {compareStore.MAX} Rädern erreicht. Entferne ein Rad, um ein weiteres hinzuzufügen.
      </p>
    );
  }

  return (
    <div>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Marke oder Modell suchen…"
        className="max-w-md mb-3"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {results
          .filter((b) => !selected.includes(b.slug))
          .map((b) => (
            <button
              key={b.slug}
              onClick={() => compareStore.toggle(b.slug)}
              className="flex items-center gap-2 border border-border bg-card p-2 hover:border-signal transition-colors text-left"
            >
              <img
                src={resolveImage(b.image_url)}
                alt=""
                className="h-12 w-12 object-contain bg-zinc-100 dark:bg-zinc-900 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                  {b.brand}
                </div>
                <div className="text-sm font-bold truncate">{b.model}</div>
              </div>
              <Plus className="h-4 w-4 text-signal shrink-0" />
            </button>
          ))}
      </div>
    </div>
  );
}

/* ─────────────────── table ─────────────────── */
type Extractor = (b: Bike) => number | null | undefined;
type Formatter = (n: number) => string;
type BestDir = "high" | "low" | null;
type Row = {
  label: string;
  values: (string | number | null | undefined)[];
  numeric?: number[]; // for best-value comparison
  best?: BestDir;
  fmt?: Formatter;
};

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const m = v.replace(",", ".").match(/-?\d+(\.\d+)?/);
    if (m) return Number(m[0]);
  }
  return null;
}

function makeRow(
  bikes: Bike[],
  label: string,
  extract: Extractor,
  opts: { best?: BestDir; fmt?: Formatter; unit?: string } = {},
): Row {
  const raw = bikes.map(extract);
  const numeric = raw.map((v) => (v == null ? NaN : Number(v)));
  const values = raw.map((v) => {
    if (v == null || (typeof v === "number" && !Number.isFinite(v))) return null;
    const n = Number(v);
    if (opts.fmt) return opts.fmt(n);
    return opts.unit ? `${n.toLocaleString("de-DE")} ${opts.unit}` : n;
  });
  return { label, values, numeric, best: opts.best ?? null };
}

function textRow(bikes: Bike[], label: string, extract: (b: Bike) => string | null | undefined): Row {
  return { label, values: bikes.map((b) => extract(b) ?? null) };
}

function bestIndices(numeric: number[] | undefined, dir: BestDir): Set<number> {
  if (!numeric || !dir) return new Set();
  const finite = numeric
    .map((v, i) => ({ v, i }))
    .filter((x) => Number.isFinite(x.v));
  if (finite.length < 2) return new Set();
  const target =
    dir === "high" ? Math.max(...finite.map((x) => x.v)) : Math.min(...finite.map((x) => x.v));
  return new Set(finite.filter((x) => x.v === target).map((x) => x.i));
}

function CompareTable({ bikes }: { bikes: Bike[] }) {
  const groups = useMemo(() => buildRows(bikes), [bikes]);
  const cols = bikes.length;
  const cellMin = "min-w-[180px] sm:min-w-[220px]";
  const labelSticky =
    "sticky left-0 z-20 bg-card border-r border-border shadow-[2px_0_0_0_var(--border)]";

  return (
    <div className="border-y md:border md:border-border border-border bg-card">
      {/* Horizontally scrollable region with sticky first column */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th
                className={`${labelSticky} w-32 md:w-44 text-left text-[10px] uppercase tracking-widest text-muted-foreground p-3`}
              />
              {bikes.map((b) => (
                <th
                  key={b.slug}
                  className={`${cellMin} border-l border-border p-3 align-top bg-card`}
                >
                  <div className="relative">
                    <button
                      onClick={() => compareStore.remove(b.slug)}
                      aria-label="Entfernen"
                      className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center bg-background/80 border border-border text-muted-foreground hover:text-rose-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="aspect-[4/3] bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black overflow-hidden mb-3 flex items-center justify-center p-2">
                      <img
                        src={resolveImage(b.image_url)}
                        alt={`${b.brand} ${b.model}`}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                      {b.brand}
                    </div>
                    <Link
                      to="/fahrraeder/$slug"
                      params={{ slug: b.slug }}
                      className="mt-0.5 block font-display font-bold text-sm md:text-base leading-tight hover:text-signal line-clamp-2"
                    >
                      {b.model}
                    </Link>
                    {b.price_eur != null && (
                      <div className="mt-1.5 text-[11px] font-mono tabular-nums text-foreground/80">
                        ab {b.price_eur.toLocaleString("de-DE")} €
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <>
                <tr key={g.group}>
                  <td
                    colSpan={cols + 1}
                    className="bg-muted/40 dark:bg-zinc-900/50 text-[10px] uppercase tracking-[0.18em] text-signal font-bold px-3 py-2 border-y border-border"
                  >
                    {g.group}
                  </td>
                </tr>
                {g.rows.map((r, i) => {
                  const best = bestIndices(r.numeric, r.best ?? null);
                  return (
                    <tr key={`${g.group}-${i}`} className="border-b border-border/60">
                      <th
                        className={`${labelSticky} w-32 md:w-44 text-left text-[11px] md:text-xs text-muted-foreground font-medium p-3 align-top capitalize`}
                      >
                        {r.label}
                      </th>
                      {r.values.map((v, j) => {
                        const isBest = best.has(j);
                        const empty = v == null || v === "" || v === "—";
                        return (
                          <td
                            key={j}
                            className={`${cellMin} border-l border-border p-3 text-xs md:text-sm align-top ${
                              isBest
                                ? "bg-signal/10 dark:bg-signal/15 font-bold text-signal"
                                : ""
                            }`}
                          >
                            {empty ? (
                              <span className="text-muted-foreground/50">—</span>
                            ) : (
                              <span>{String(v)}</span>
                            )}
                            {isBest && (
                              <span className="ml-1 inline-block align-middle text-[9px] uppercase tracking-widest">
                                ✓ Best
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground px-3 py-2 md:hidden">
        Nach rechts wischen für weitere Räder →
      </p>
    </div>
  );
}

function buildRows(bikes: Bike[]) {
  return [
    {
      group: "Basis",
      rows: [
        textRow(bikes, "Kategorie", (b) => b.bike_type ?? (b.category === "ebike" ? "E-Bike" : "Fahrrad")),
        makeRow(bikes, "Modelljahr", (b) => b.year, {}),
        makeRow(bikes, "Preis (UVP)", (b) => b.price_eur, { best: "low", unit: "€" }),
        makeRow(bikes, "Experten-Note", (b) => b.expert_rating ?? b.ratings?.overall ?? null, {
          best: "high",
          fmt: (n) => `${n.toFixed(1)} / 10`,
        }),
        textRow(bikes, "Verfügbarkeit", (b) => b.availability),
      ],
    },
    {
      group: "Rahmen & Komponenten",
      rows: [
        textRow(bikes, "Rahmen", (b) => b.specs?.frame_material),
        makeRow(bikes, "Gewicht", (b) => b.specs?.weight_kg, { best: "low", unit: "kg" }),
        textRow(bikes, "Reifen", (b) => b.specs?.tire_size),
        textRow(bikes, "Bremsen", (b) => b.specs?.brakes),
        textRow(bikes, "Schaltung", (b) => b.specs?.drivetrain),
        textRow(bikes, "Gänge", (b) => b.specs?.gears),
      ],
    },
    {
      group: "Geometrie",
      rows: [
        makeRow(bikes, "Radstand", (b) => b.geometry?.wheelbase_mm, { unit: "mm" }),
        makeRow(bikes, "Stack", (b) => b.geometry?.stack_mm, { unit: "mm" }),
        makeRow(bikes, "Reach", (b) => b.geometry?.reach_mm, { unit: "mm" }),
        makeRow(bikes, "Max. Fahrergewicht", (b) => b.geometry?.max_rider_weight_kg, {
          best: "high",
          unit: "kg",
        }),
      ],
    },
    {
      group: "E-Bike System",
      rows: [
        textRow(bikes, "Motor", (b) =>
          b.ebike ? `${b.ebike.motor_brand ?? ""} ${b.ebike.motor_model ?? ""}`.trim() || null : null,
        ),
        makeRow(bikes, "Drehmoment", (b) => b.ebike?.motor_nm ?? null, { best: "high", unit: "Nm" }),
        makeRow(bikes, "Akku", (b) => b.ebike?.battery_wh ?? null, { best: "high", unit: "Wh" }),
        makeRow(
          bikes,
          "Reichweite Eco",
          (b) => num(b.range_matrix?.eco_km) ?? b.ebike?.range_eco_km ?? null,
          { best: "high", unit: "km" },
        ),
        makeRow(
          bikes,
          "Reichweite Tour",
          (b) => num(b.range_matrix?.tour_km) ?? b.ebike?.range_tour_km ?? null,
          { best: "high", unit: "km" },
        ),
        makeRow(
          bikes,
          "Reichweite Turbo",
          (b) => num(b.range_matrix?.turbo_km) ?? b.ebike?.range_turbo_km ?? null,
          { best: "high", unit: "km" },
        ),
        // Ladezeit: entweder als Text in maintenance.charge_time, sonst numerisch aus ebike
        {
          label: "Ladezeit",
          values: bikes.map((b) => {
            const t = (b.maintenance as any)?.charge_time;
            if (typeof t === "string" && t.trim()) return t;
            if (typeof t === "number" && Number.isFinite(t)) return `${t} h`;
            if (b.ebike?.charge_time_h != null) return `${b.ebike.charge_time_h} h`;
            return null;
          }),
        },
        textRow(bikes, "Display", (b) => b.ebike?.display),
      ],
    },
    {
      group: "Zielgruppen (0–10)",
      rows: [
        makeRow(bikes, "Einsteiger", (b) => suitVal(b, ["einsteiger", "beginner"]), { best: "high" }),
        makeRow(bikes, "Pendeln", (b) => suitVal(b, ["pendeln", "commuting"]), { best: "high" }),
        makeRow(bikes, "Touren", (b) => suitVal(b, ["touren", "touring"]), { best: "high" }),
        makeRow(bikes, "Gravel", (b) => suitVal(b, ["gravel"]), { best: "high" }),
        makeRow(bikes, "MTB", (b) => suitVal(b, ["mtb", "mountain"]), { best: "high" }),
        makeRow(bikes, "Stadt", (b) => suitVal(b, ["stadt", "city"]), { best: "high" }),
        makeRow(bikes, "Gelände", (b) => suitVal(b, ["gelaende", "gelände", "offroad"]), { best: "high" }),
        makeRow(bikes, "Vielfahrer", (b) => suitVal(b, ["vielfahrer", "longdistance", "bikepacking"]), { best: "high" }),
      ],
    },
  ];
}

function suitVal(b: Bike, keys: string[]): number | null {
  const s = (b.suitability ?? {}) as Record<string, unknown>;
  for (const k of keys) {
    const v = s[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}
