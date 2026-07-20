import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Scale, X, ArrowRight } from "lucide-react";
import { useCompare } from "@/hooks/use-compare";
import { getPublicBikeBySlug } from "@/lib/bikes.functions";
import { articleImageUrl } from "@/lib/article-image-url";

export function CompareFloatingBar() {
  const { slugs, count, max, remove, clear } = useCompare();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const queries = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ["bike", slug],
      queryFn: () => getPublicBikeBySlug({ data: { slug } }),
      staleTime: 60_000,
    })),
  });
  const bikes = queries.map((q) => q.data?.bike).filter(Boolean) as Array<{
    slug: string; brand: string; model: string; image_url: string | null;
  }>;

  if (!mounted || count === 0 || pathname === "/vergleich") return null;

  return (
    <div
      className="fixed inset-x-0 z-40 pointer-events-none px-3 sm:px-6"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 4.5rem)" }}
    >
      <div className="md:!bottom-4 pointer-events-auto mx-auto max-w-[1100px] bg-background/95 backdrop-blur-xl border border-border shadow-2xl">
        <div className="flex items-center gap-3 p-3">
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Scale className="h-4 w-4 text-signal" />
            <span className="text-[11px] uppercase tracking-widest font-bold">
              Vergleich <span className="text-signal">{count}/{max}</span>
            </span>
          </div>

          <div className="flex -space-x-2 min-w-0 flex-1 overflow-x-auto sm:overflow-visible">
            {bikes.map((b) => (
              <div key={b.slug} className="relative shrink-0 group">
                <div className="h-11 w-11 border-2 border-background bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  <img
                    src={articleImageUrl(b.image_url ?? "") || b.image_url || ""}
                    alt={`${b.brand} ${b.model}`}
                    className="h-full w-full object-contain p-0.5"
                    loading="lazy"
                  />
                </div>
                <button
                  onClick={() => remove(b.slug)}
                  aria-label={`${b.brand} ${b.model} entfernen`}
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background opacity-80 hover:opacity-100"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={clear}
            className="hidden sm:inline text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground shrink-0"
          >
            Leeren
          </button>

          <Link
            to="/vergleich"
            className="inline-flex items-center gap-1.5 bg-signal text-[#050505] px-3 sm:px-4 py-2 text-[11px] uppercase tracking-widest font-bold shrink-0 hover:brightness-95"
          >
            <span className="hidden sm:inline">Vergleich ansehen</span>
            <span className="sm:hidden">Vergleich</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
