import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { listFeaturedBikes } from "@/lib/bikes.functions";
import { BikeCard } from "./BikeCard";

export const featuredBikesQuery = queryOptions({
  queryKey: ["featured-bikes"],
  queryFn: () => listFeaturedBikes(),
  staleTime: 60_000,
});

export function BikeShowcase() {
  const { data } = useSuspenseQuery(featuredBikesQuery);
  const bikes = data.bikes;

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-20 border-x border-border">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-10 bg-signal" />
              <span className="eyebrow text-signal">Räder & E-Bikes</span>
            </div>
            <h2 className="font-display font-black tracking-tight leading-[0.95] text-[clamp(2rem,5vw,3.75rem)]">
              Fahrräder <span className="italic font-light text-muted-foreground">im Fokus</span>
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-lg">
              Handverlesene Modelle mit allen Specs, geprüft und transparent dokumentiert.
            </p>
          </div>
          <Link
            to="/fahrraeder"
            className="group inline-flex items-center gap-2 self-start border-b-2 border-signal pb-1 eyebrow text-signal whitespace-nowrap"
          >
            Alle Fahrräder
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {bikes.length === 0 ? (
          <div className="border border-dashed border-border rounded-sm p-12 text-center text-sm text-muted-foreground">
            Noch keine Fahrräder veröffentlicht.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {bikes.map((b) => (
              <BikeCard key={b.id} bike={b} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
