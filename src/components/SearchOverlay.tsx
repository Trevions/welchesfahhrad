import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X, CornerDownLeft, ArrowRight } from "lucide-react";
import { getPublicArticles } from "@/lib/articles.functions";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus + lock scroll
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const { data } = useQuery({
    queryKey: ["public-articles"],
    queryFn: () => getPublicArticles(),
    staleTime: 60_000,
  });
  const articles = data?.articles ?? [];

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return articles.slice(0, 6);
    return articles
      .filter((a) =>
        [a.title, a.excerpt, a.category, a.source ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 8);
  }, [q, articles]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const r = results[active];
        if (r) {
          window.location.href = `/artikel/${r.slug}`;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-label="Suche"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Schließen"
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
      />

      {/* Panel */}
      <div className="relative mx-auto mt-[12vh] w-[min(720px,92vw)] animate-scale-in">
        <div className="surface-strong border border-border shadow-[0_40px_120px_-30px_oklch(0_0_0/0.7)]">
          {/* Input row */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Search className="h-4 w-4 text-signal shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              placeholder="Artikel, Tests, Ratgeber suchen …"
              className="flex-1 bg-transparent text-base md:text-lg font-display tracking-tight placeholder:text-muted-foreground outline-none border-0"
            />
            <kbd className="hidden md:inline-flex items-center gap-1 border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              Esc
            </kbd>
            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="md:hidden flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Eyebrow */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="eyebrow-sm text-muted-foreground">
              {q ? `${results.length} Ergebnisse` : "Aktuelle Artikel"}
            </span>
            <div className="hidden md:flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1">↑↓ Navigieren</span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> Öffnen
              </span>
            </div>
          </div>

          {/* Results */}
          <ul className="max-h-[55vh] overflow-y-auto pb-2">
            {results.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-muted-foreground">
                Keine Treffer für „{q}".
              </li>
            )}
            {results.map((r, i) => (
              <li key={r.slug}>
                <Link
                  to="/artikel/$slug"
                  params={{ slug: r.slug }}
                  onClick={onClose}
                  onMouseEnter={() => setActive(i)}
                  className={`group flex items-center gap-4 px-5 py-3 border-l-2 transition-all ${
                    i === active
                      ? "bg-accent/60 border-signal"
                      : "border-transparent hover:bg-accent/40"
                  }`}
                >
                  <img
                    src={r.image}
                    alt=""
                    width={64}
                    height={48}
                    className="h-12 w-16 object-cover grayscale group-hover:grayscale-0 transition-all"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="eyebrow-sm text-signal mb-1">{r.category}</div>
                    <div className="font-display text-base md:text-lg font-bold leading-snug truncate">
                      {r.title}
                    </div>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      i === active ? "translate-x-1 text-signal" : "text-muted-foreground"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
