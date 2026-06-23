import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, Zap, Check, X, ArrowLeft } from "lucide-react";
import { getPublicBikeBySlug } from "@/lib/bikes.functions";
import { articleImageUrl } from "@/lib/article-image-url";
import { BikeRangeChart } from "@/components/bikes/BikeRangeChart";
import { BikeRatingRadar } from "@/components/bikes/BikeRatingRadar";

const bikeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["bike", slug],
    queryFn: () => getPublicBikeBySlug({ data: { slug } }),
    staleTime: 60_000,
  });

export const Route = createFileRoute("/fahrraeder/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(bikeQuery(params.slug));
    if (!res.bike) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const b = loaderData?.bike;
    if (!b) return { meta: [{ title: "Fahrrad — radmap.de" }] };
    const title = b.meta_title || `${b.brand} ${b.model}${b.year ? ` (${b.year})` : ""} — Test & Specs | radmap.de`;
    const desc =
      b.meta_description ||
      b.excerpt ||
      `Alle Specs, Bewertungen und Details zum ${b.brand} ${b.model}${b.year ? ` (${b.year})` : ""}.`;
    const og = articleImageUrl(b.og_image_url ?? b.image_url ?? "") || b.image_url || "/og.jpg";
    const url = `/fahrraeder/${params.slug}`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${b.brand} ${b.model}`,
      brand: { "@type": "Brand", name: b.brand },
      model: b.model,
      image: og,
      description: desc,
      category: b.category === "ebike" ? "E-Bike" : "Fahrrad",
      ...(b.price_eur
        ? {
            offers: {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: b.price_eur,
              availability: "https://schema.org/InStock",
              url: b.manufacturer_url || url,
            },
          }
        : {}),
      ...(b.ratings?.overall
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: b.ratings.overall,
              bestRating: 10,
              ratingCount: 1,
            },
          }
        : {}),
    };
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: og },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: og },
        ...(b.keywords?.length ? [{ name: "keywords", content: b.keywords.join(", ") }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  errorComponent: ({ error }) => (
    <div className="pt-32 px-6 text-center">
      <h1 className="font-display text-3xl font-black">Fehler</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="pt-32 px-6 text-center">
      <h1 className="font-display text-3xl font-black">Fahrrad nicht gefunden</h1>
      <Link to="/fahrraeder" className="mt-4 inline-block text-signal underline">
        Zur Übersicht
      </Link>
    </div>
  ),
  component: BikeDetailPage,
});

const SPEC_GROUPS: { title: string; rows: [string, string][] }[] = [
  {
    title: "Rahmen",
    rows: [
      ["frame_material", "Material"],
      ["frame_sizes", "Rahmengrößen"],
      ["fork", "Gabel"],
      ["weight_kg", "Gewicht (kg)"],
    ],
  },
  {
    title: "Antrieb",
    rows: [
      ["drivetrain", "Schaltgruppe"],
      ["gears", "Gänge"],
    ],
  },
  {
    title: "Bremsen & Räder",
    rows: [
      ["brakes", "Bremsen"],
      ["wheels", "Laufräder"],
      ["tire_brand", "Reifenmarke"],
      ["tire_size", "Reifengröße"],
      ["tire_tread", "Profil"],
    ],
  },
  {
    title: "Komfort & Ausstattung",
    rows: [
      ["saddle", "Sattel"],
      ["handlebar", "Lenker"],
      ["stem", "Vorbau"],
      ["lights", "Beleuchtung"],
      ["rack", "Gepäckträger"],
      ["fenders", "Schutzbleche"],
    ],
  },
];

function BikeDetailPage() {
  const params = Route.useParams();
  const { data } = useSuspenseQuery(bikeQuery(params.slug));
  const b = data.bike!;
  const img = articleImageUrl(b.image_url ?? "") || b.image_url || "/og.jpg";
  const specs = b.specs as Record<string, any>;
  const ebike = b.ebike;

  return (
    <article className="bg-background">
      {/* HERO */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-10 border-x border-border">
          <Link to="/fahrraeder" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-signal mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Alle Fahrräder
          </Link>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
              <img src={img} alt={`${b.brand} ${b.model}`} className="absolute inset-0 h-full w-full object-cover" />
              {b.category === "ebike" && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-signal text-[#050505] text-[10px] uppercase tracking-wider font-bold px-2 py-1">
                  <Zap className="h-3 w-3" /> E-Bike
                </span>
              )}
            </div>
            <div>
              <div className="eyebrow text-signal">{b.brand}</div>
              <h1 className="font-display font-black tracking-tight leading-[0.95] text-[clamp(2rem,6vw,4rem)] mt-2">
                {b.model}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                {b.bike_type && <span className="px-2 py-0.5 border border-border">{b.bike_type}</span>}
                {b.year && <span>Modelljahr {b.year}</span>}
              </div>
              {b.excerpt && <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">{b.excerpt}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {b.price_eur != null && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">UVP ab</div>
                    <div className="font-display text-2xl font-black tabular-nums">
                      {b.price_eur.toLocaleString("de-DE")} €
                    </div>
                  </div>
                )}
                {b.manufacturer_url && (
                  <a
                    href={b.manufacturer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-signal text-[#050505] px-4 py-2.5 text-xs uppercase tracking-wider font-bold hover:opacity-90"
                  >
                    Beim Hersteller ansehen <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                Hinweis: radmap.de verkauft keine Räder — wir verlinken zum Hersteller.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* QUICK FACTS */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 border-x border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {b.category === "ebike" && ebike?.motor_nm && (
              <Fact label="Motor" value={`${ebike.motor_nm} Nm`} />
            )}
            {b.category === "ebike" && ebike?.battery_wh && (
              <Fact label="Akku" value={`${ebike.battery_wh} Wh`} />
            )}
            {b.category === "ebike" && ebike?.range_tour_km && (
              <Fact label="Reichweite Tour" value={`${ebike.range_tour_km} km`} />
            )}
            {specs.weight_kg && <Fact label="Gewicht" value={`${specs.weight_kg} kg`} />}
            {specs.brakes && <Fact label="Bremsen" value={String(specs.brakes)} />}
            {specs.drivetrain && <Fact label="Schaltung" value={String(specs.drivetrain)} />}
            {specs.frame_material && <Fact label="Rahmen" value={String(specs.frame_material)} />}
            {specs.tire_size && <Fact label="Reifen" value={String(specs.tire_size)} />}
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      {b.description && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-[860px] px-4 md:px-8 py-12 md:py-16">
            <h2 className="font-display font-black text-2xl md:text-3xl mb-4">Im Detail</h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-base leading-relaxed whitespace-pre-wrap">
              {b.description}
            </div>
          </div>
        </section>
      )}

      {/* E-BIKE BLOCK */}
      {b.category === "ebike" && ebike && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16 border-x border-border">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-5 w-5 text-signal" />
              <h2 className="font-display font-black text-2xl md:text-3xl">Motor & Akku</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              <div className="border border-border p-5 bg-background">
                <div className="eyebrow-sm text-muted-foreground mb-2">Antrieb</div>
                <div className="font-display text-lg font-bold">
                  {ebike.motor_brand} {ebike.motor_model}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {ebike.motor_nm != null && <Spec k="Drehmoment" v={`${ebike.motor_nm} Nm`} />}
                  {ebike.motor_w != null && <Spec k="Leistung" v={`${ebike.motor_w} W`} />}
                  {ebike.assist_kmh != null && <Spec k="Unterstützung bis" v={`${ebike.assist_kmh} km/h`} />}
                  {ebike.sensor && <Spec k="Sensor" v={String(ebike.sensor)} />}
                  {ebike.display && <Spec k="Display" v={String(ebike.display)} />}
                </dl>
              </div>
              <div className="border border-border p-5 bg-background">
                <div className="eyebrow-sm text-muted-foreground mb-2">Energie</div>
                <div className="font-display text-lg font-bold">
                  {ebike.battery_wh ? `${ebike.battery_wh} Wh` : "Akku"}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {ebike.battery_removable != null && (
                    <Spec k="Abnehmbar" v={ebike.battery_removable ? "Ja" : "Nein"} />
                  )}
                  {ebike.charge_time_h != null && <Spec k="Ladezeit" v={`${ebike.charge_time_h} h`} />}
                </dl>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="eyebrow text-signal mb-3">Reichweite nach Modus</h3>
                <BikeRangeChart ebike={ebike} />
              </div>
              {Object.keys(b.ratings).length > 0 && (
                <div>
                  <h3 className="eyebrow text-signal mb-3">Bewertung</h3>
                  <BikeRatingRadar ratings={b.ratings} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SPECS */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16 border-x border-border">
          <h2 className="font-display font-black text-2xl md:text-3xl mb-8">Vollständige Spezifikationen</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {SPEC_GROUPS.map((g) => {
              const rows = g.rows.filter(([k]) => specs[k] != null && specs[k] !== "");
              if (rows.length === 0) return null;
              return (
                <div key={g.title}>
                  <h3 className="eyebrow text-signal mb-3">{g.title}</h3>
                  <dl className="divide-y divide-border border-t border-b border-border">
                    {rows.map(([k, label]) => (
                      <div key={k} className="flex items-center justify-between py-2.5 text-sm gap-4">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="text-right font-medium">{String(specs[k])}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROS / CONS */}
      {(b.highlights.pros.length > 0 || b.highlights.cons.length > 0) && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16 border-x border-border grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="eyebrow text-emerald-500 mb-4">Stärken</h3>
              <ul className="space-y-2">
                {b.highlights.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow text-rose-500 mb-4">Schwächen</h3>
              <ul className="space-y-2">
                {b.highlights.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <X className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* GALLERY */}
      {b.gallery.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 border-x border-border">
            <h2 className="font-display font-black text-2xl md:text-3xl mb-6">Galerie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {b.gallery.map((g, i) => (
                <a key={i} href={articleImageUrl(g) || g} target="_blank" rel="noreferrer" className="aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  <img src={articleImageUrl(g) || g} alt="" loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-black mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="contents">
      <dt className="text-muted-foreground text-xs uppercase tracking-wider">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}
