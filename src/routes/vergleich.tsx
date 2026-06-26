import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { X, Plus, Check, Minus } from "lucide-react";
import { getPublicBikeBySlug, listPublicBikes } from "@/lib/bikes.functions";
import { articleImageUrl } from "@/lib/article-image-url";
import { compareStore, subscribeCompare } from "@/lib/bike-compare";
import type { Bike } from "@/lib/bike-types";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/vergleich")({
  head: () => ({
    meta: [
      { title: "Fahrrad-Vergleich — bis zu 4 Räder direkt vergleichen | radmap.de" },
      { name: "description", content: "Vergleiche bis zu vier Fahrräder Seite-an-Seite: Geometrie, Antrieb, E-Bike-System, Reichweite, Preis und Bewertung." },
      { property: "og:title", content: "Fahrrad-Vergleich | radmap.de" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/vergleich" }],
  }),
  component: ComparePage,
});

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
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10 border-x border-border">
          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight">Fahrrad-Vergleich</h1>
          <p className="mt-2 text-sm text-muted-foreground">Bis zu {compareStore.MAX} Räder Seite-an-Seite — Specs, Geometrie, E-Bike-System, Preis.</p>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 border-x border-border">
        {bikes.length === 0 ? (
          <EmptyState />
        ) : (
          <CompareTable bikes={bikes} />
        )}

        <div className="mt-10">
          <h2 className="eyebrow text-signal mb-3">Rad hinzufügen</h2>
          <AddBikePicker selected={slugs} />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border p-10 text-center">
      <p className="text-sm text-muted-foreground">Noch keine Räder im Vergleich.</p>
      <Link to="/fahrraeder" className="mt-4 inline-flex items-center gap-1.5 text-signal text-sm font-bold underline">
        Räder durchstöbern
      </Link>
    </div>
  );
}

function AddBikePicker({ selected }: { selected: string[] }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Bike[]>([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await listPublicBikes({ data: { search: q || undefined, limit: 12 } });
        if (!cancel) setResults(res.bikes);
      } catch { /* ignore */ }
    })();
    return () => { cancel = true; };
  }, [q]);

  const add = (slug: string) => {
    const res = compareStore.toggle(slug);
    if (res.full) {
      // not added
    }
  };

  return (
    <div>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Marke oder Modell suchen…" className="max-w-md mb-3" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {results.filter((b) => !selected.includes(b.slug)).map((b) => (
          <button key={b.slug} onClick={() => add(b.slug)}
            className="flex items-center gap-2 border border-border bg-card p-2 hover:border-signal transition-colors text-left">
            <img src={articleImageUrl(b.image_url ?? "") || b.image_url || ""} alt="" className="h-12 w-12 object-cover bg-zinc-100 dark:bg-zinc-900" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{b.brand}</div>
              <div className="text-sm font-bold truncate">{b.model}</div>
            </div>
            <Plus className="h-4 w-4 ml-auto text-signal shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

type Row = { label: string; values: (string | number | boolean | null | undefined)[] };

function CompareTable({ bikes }: { bikes: Bike[] }) {
  const rows: { group: string; rows: Row[] }[] = [
    {
      group: "Basis",
      rows: [
        { label: "Modelljahr", values: bikes.map((b) => b.year ?? "—") },
        { label: "Kategorie", values: bikes.map((b) => b.bike_type ?? (b.category === "ebike" ? "E-Bike" : "Fahrrad")) },
        { label: "Preis (UVP)", values: bikes.map((b) => b.price_eur ? `${b.price_eur.toLocaleString("de-DE")} €` : "—") },
        { label: "Experten-Note", values: bikes.map((b) => b.expert_rating ?? b.ratings?.overall ?? "—") },
        { label: "Verfügbarkeit", values: bikes.map((b) => b.availability ?? "—") },
      ],
    },
    {
      group: "Rahmen & Komponenten",
      rows: [
        { label: "Rahmen", values: bikes.map((b) => b.specs?.frame_material ?? "—") },
        { label: "Gewicht", values: bikes.map((b) => b.specs?.weight_kg ? `${b.specs.weight_kg} kg` : "—") },
        { label: "Reifen", values: bikes.map((b) => b.specs?.tire_size ?? "—") },
        { label: "Bremsen", values: bikes.map((b) => b.specs?.brakes ?? "—") },
        { label: "Schaltung", values: bikes.map((b) => b.specs?.drivetrain ?? "—") },
      ],
    },
    {
      group: "Geometrie",
      rows: ["wheelbase_mm", "stack_mm", "reach_mm", "seat_tube_mm", "head_tube_mm", "max_rider_weight_kg"].map((k) => ({
        label: k.replace(/_/g, " "),
        values: bikes.map((b) => (b.geometry as any)?.[k] ?? "—"),
      })),
    },
    {
      group: "E-Bike System",
      rows: [
        { label: "Motor", values: bikes.map((b) => b.ebike ? `${b.ebike.motor_brand ?? ""} ${b.ebike.motor_model ?? ""}`.trim() || "—" : "—") },
        { label: "Drehmoment", values: bikes.map((b) => b.ebike?.motor_nm ? `${b.ebike.motor_nm} Nm` : "—") },
        { label: "Akku", values: bikes.map((b) => b.ebike?.battery_wh ? `${b.ebike.battery_wh} Wh` : "—") },
        { label: "Reichweite (Tour)", values: bikes.map((b) => b.ebike?.range_tour_km ? `${b.ebike.range_tour_km} km` : "—") },
        { label: "Display", values: bikes.map((b) => b.ebike?.display ?? "—") },
      ],
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr>
            <th className="w-44 text-left text-xs uppercase tracking-wider text-muted-foreground p-3"></th>
            {bikes.map((b) => (
              <th key={b.slug} className="border border-border p-3 align-top bg-card min-w-[200px]">
                <div className="relative">
                  <button onClick={() => compareStore.remove(b.slug)} className="absolute -top-1 -right-1 text-muted-foreground hover:text-rose-400">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 overflow-hidden mb-3">
                    <img src={articleImageUrl(b.image_url ?? "") || b.image_url || ""} alt={b.model} className="h-full w-full object-cover" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-signal">{b.brand}</div>
                  <Link to="/fahrraeder/$slug" params={{ slug: b.slug }} className="block font-bold text-sm hover:text-signal">{b.model}</Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <>
              <tr key={g.group}>
                <td colSpan={bikes.length + 1} className="bg-zinc-900/30 text-[11px] uppercase tracking-widest text-signal font-bold px-3 py-2 border border-border">{g.group}</td>
              </tr>
              {g.rows.map((r, i) => (
                <tr key={`${g.group}-${i}`}>
                  <th className="text-left text-xs text-muted-foreground p-3 border border-border align-top w-44 capitalize">{r.label}</th>
                  {r.values.map((v, j) => (
                    <td key={j} className="p-3 border border-border text-sm align-top">
                      {v == null || v === "" || v === "—"
                        ? <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                        : typeof v === "boolean"
                          ? (v ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-muted-foreground" />)
                          : String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
