import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
  updated?: string;
};

export function LegalPage({ eyebrow, title, lead, children, updated }: Props) {
  return (
    <div className="mx-auto max-w-[1100px] px-5 sm:px-6 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
      <Link
        to="/"
        className="eyebrow-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Zurück zur Startseite
      </Link>

      <div className="mt-8 flex items-center gap-3">
        <span className="h-px w-10 bg-signal" />
        <span className="eyebrow text-signal">{eyebrow}</span>
      </div>

      <h1 className="mt-5 font-display font-black tracking-tight leading-[0.95] text-3xl sm:text-5xl md:text-6xl text-foreground">
        {title}
      </h1>

      {lead && (
        <p className="mt-6 max-w-3xl text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
          {lead}
        </p>
      )}

      {updated && (
        <div className="mt-6 eyebrow-sm text-muted-foreground">
          Stand: {updated}
        </div>
      )}

      <div className="mt-10 md:mt-14 grid lg:grid-cols-[1fr_3fr] gap-10 lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24 eyebrow-sm text-muted-foreground">
            welchesfahrrad.de
            <div className="mt-2 h-px w-8 bg-signal" />
            <div className="mt-2 text-foreground">Verlag &amp; Recht</div>
          </div>
        </aside>

        <article className="prose-legal max-w-none text-foreground/90 text-[15px] sm:text-base leading-[1.75] font-light space-y-6">
          {children}
        </article>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pt-2">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 leading-tight">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pt-2">
      <h3 className="font-display text-base sm:text-lg font-bold text-foreground mt-5 mb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function InfoBox({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "signal" }) {
  return (
    <div
      className={
        "my-6 border-l-2 px-5 py-4 text-sm " +
        (tone === "signal"
          ? "border-signal bg-signal/5 text-foreground"
          : "border-border bg-card text-muted-foreground")
      }
    >
      {children}
    </div>
  );
}
