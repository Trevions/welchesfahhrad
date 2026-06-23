import { Link } from "@tanstack/react-router";
import type { Bike } from "@/lib/bike-types";
import { articleImageUrl } from "@/lib/article-image-url";
import { Zap } from "lucide-react";

export function BikeCard({ bike }: { bike: Bike }) {
  const img = articleImageUrl(bike.image_url ?? "") || bike.image_url || "/og.jpg";
  return (
    <Link
      to="/fahrraeder/$slug"
      params={{ slug: bike.slug }}
      className="group block bg-card border border-border overflow-hidden hover:border-signal transition-colors"
    >
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <img
          src={img}
          alt={`${bike.brand} ${bike.model}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {bike.category === "ebike" && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-signal text-[#050505] text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5">
            <Zap className="h-2.5 w-2.5" /> E-Bike
          </span>
        )}
        {bike.price_eur != null && (
          <span className="absolute bottom-2 right-2 bg-background/90 backdrop-blur text-foreground text-[10px] font-mono tabular-nums px-2 py-0.5 border border-border">
            ab {bike.price_eur.toLocaleString("de-DE")} €
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="eyebrow-sm text-muted-foreground truncate">{bike.brand}</div>
        <div className="font-display font-bold text-base md:text-lg leading-tight mt-0.5 line-clamp-2 group-hover:text-signal transition-colors">
          {bike.model}
        </div>
        {bike.bike_type && (
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            {bike.bike_type}
            {bike.year ? ` · ${bike.year}` : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
