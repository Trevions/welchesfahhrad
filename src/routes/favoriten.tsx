import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Trash2, Scale, Zap } from "lucide-react";
import { useBikeFavorites } from "@/hooks/use-bike-favorites";
import { articleImageUrl } from "@/lib/article-image-url";

export const Route = createFileRoute("/favoriten")({
  head: () => ({
    meta: [
      { title: "Favoriten | radmap.de" },
      { name: "description", content: "Deine gespeicherten Fahrräder auf radmap.de." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritenPage,
});

function FavoritenPage() {
  const { favorites, remove, clear } = useBikeFavorites();

  return (
    <div className="mx-auto max-w-[1200px] px-6 md:px-8 pt-16 md:pt-24 pb-20">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-signal" />
        <span className="eyebrow text-signal">Deine Favoriten</span>
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl md:text-6xl font-black italic tracking-tight">
          Gespeicherte Fahrräder
        </h1>
        <div className="flex items-center gap-4">
          {favorites.length >= 2 && (
            <Link
              to="/vergleich"
              className="inline-flex items-center gap-2 eyebrow text-foreground hover:text-signal transition-colors"
            >
              <Scale className="h-3.5 w-3.5" /> Vergleichen
            </Link>
          )}
          {favorites.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Alle Favoriten entfernen?")) clear();
              }}
              className="inline-flex items-center gap-2 eyebrow text-muted-foreground hover:text-signal transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Alle entfernen
            </button>
          )}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="mt-16 border border-border bg-card px-8 py-20 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-6 font-display text-2xl font-bold">Noch keine Favoriten</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Tippe bei einem Fahrrad auf das Herz-Symbol, um es zu speichern. Deine Favoriten
            bleiben in diesem Browser erhalten.
          </p>
          <Link
            to="/fahrraeder"
            className="mt-8 inline-block eyebrow border-b border-foreground pb-1 hover:text-signal hover:border-signal transition-colors"
          >
            Fahrräder entdecken
          </Link>
        </div>
      ) : (
        <ul className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {favorites.map((b) => {
            const img = articleImageUrl(b.image ?? "") || b.image || "/og.jpg";
            return (
              <li key={b.slug} className="group relative bg-card border border-border overflow-hidden hover:border-signal transition-colors">
                <button
                  type="button"
                  onClick={() => remove(b.slug)}
                  aria-label="Aus Favoriten entfernen"
                  className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center bg-signal/95 text-[#050505] backdrop-blur hover:bg-signal transition-colors"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
                <Link to="/fahrraeder/$slug" params={{ slug: b.slug }} className="block">
                  <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    <img
                      src={img}
                      alt={`${b.brand} ${b.model}`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {b.category === "ebike" && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-signal text-[#050505] text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5">
                        <Zap className="h-2.5 w-2.5" /> E-Bike
                      </span>
                    )}
                    {b.priceEur != null && (
                      <span className="absolute bottom-2 right-2 bg-background/90 backdrop-blur text-foreground text-[10px] font-mono tabular-nums px-2 py-0.5 border border-border">
                        ab {b.priceEur.toLocaleString("de-DE")} €
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="eyebrow-sm text-muted-foreground truncate">{b.brand}</div>
                    <div className="font-display font-bold text-base md:text-lg leading-tight mt-0.5 line-clamp-2 group-hover:text-signal transition-colors">
                      {b.model}
                    </div>
                    {b.bikeType && (
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                        {b.bikeType}
                        {b.year ? ` · ${b.year}` : ""}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
