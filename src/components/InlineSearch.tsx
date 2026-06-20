import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  eyebrow?: string;
  hint?: string;
  resultsCount?: number;
  autoFocus?: boolean;
};

export function InlineSearch({
  value,
  onChange,
  placeholder = "Suchen…",
  eyebrow,
  hint,
  resultsCount,
  autoFocus,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = value.trim().length > 0;

  return (
    <div className="relative">
      {/* premium glow */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-500 ${
          active ? "opacity-60" : ""
        }`}
        style={{
          background:
            "linear-gradient(120deg, color-mix(in oklch, var(--signal) 55%, transparent), transparent 60%)",
        }}
      />
      <div
        className={`group relative flex items-center gap-3 rounded-2xl border bg-card/70 px-4 py-3 backdrop-blur-md transition-all duration-300 md:px-5 md:py-4 ${
          active
            ? "border-signal/60 shadow-[0_20px_60px_-30px_color-mix(in_oklch,var(--signal)_60%,transparent)]"
            : "border-border hover:border-signal/40"
        }`}
      >
        <Search
          className={`h-5 w-5 shrink-0 transition-colors ${
            active ? "text-signal" : "text-muted-foreground group-hover:text-foreground"
          }`}
          strokeWidth={1.75}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          {eyebrow && (
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:block">
              {eyebrow}
            </span>
          )}
          <input
            ref={ref}
            type="search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-base font-medium tracking-tight text-foreground outline-none placeholder:text-muted-foreground/70 md:text-lg"
            aria-label={placeholder}
          />
        </div>

        {active ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background/60 text-muted-foreground transition-colors hover:border-signal/60 hover:text-foreground"
            aria-label="Suche zurücksetzen"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:inline-block">
            /
          </kbd>
        )}
      </div>

      {(hint || typeof resultsCount === "number") && (
        <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="truncate">{hint}</span>
          {active && typeof resultsCount === "number" && (
            <span className="shrink-0">
              <span className="text-signal">{resultsCount}</span>{" "}
              {resultsCount === 1 ? "Treffer" : "Treffer"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
