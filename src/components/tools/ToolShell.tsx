import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ToolShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
};

export function ToolShell({ eyebrow, title, description, icon: Icon, children }: ToolShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(800px 380px at 80% -10%, color-mix(in oklch, var(--signal) 60%, transparent), transparent 60%), radial-gradient(600px 300px at 0% 110%, color-mix(in oklch, var(--signal) 40%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-5 pt-10 pb-10 md:px-8 md:pt-14 md:pb-14">
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Alle Tools
          </Link>

          <div className="mt-6 flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-card/60 text-signal">
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-signal">
                <span className="h-px w-8 bg-signal" />
                {eyebrow}
              </div>
              <h1 className="mt-2 font-display text-3xl font-black italic leading-[1.05] tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
                {description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8 md:py-14">
        {children}
      </div>
    </div>
  );
}

export function ToolCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card/60 p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function ToolLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </label>
  );
}

export function ToolInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={
        "mt-1.5 w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-signal/60 focus:ring-2 focus:ring-signal/20 " +
        (props.className ?? "")
      }
    />
  );
}

export function ToolSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={
        "mt-1.5 w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-signal/60 focus:ring-2 focus:ring-signal/20 " +
        (props.className ?? "")
      }
    />
  );
}

export function ToolResultStat({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-black tracking-tight text-foreground">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        )}
      </div>
      {hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function ToolDisclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
