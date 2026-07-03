import { Link } from "@tanstack/react-router";
import { ShieldAlert, BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { Faq } from "@/lib/tools/seo";
import { formatReviewedDe, reviewedAt } from "@/lib/tools/reviewed";
import { relatedFor } from "@/lib/tools/related";

export function ToolReviewedBy({ slug }: { slug: string }) {
  const iso = reviewedAt(slug);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-xs text-muted-foreground">
      <BadgeCheck className="h-4 w-4 text-signal" strokeWidth={2} />
      <span>
        Geprüft von der{" "}
        <Link to="/redaktion" className="text-foreground underline decoration-dotted underline-offset-2 hover:text-signal">
          radmap.de Redaktion
        </Link>
      </span>
      <span aria-hidden>·</span>
      <span>
        Zuletzt aktualisiert:{" "}
        <time dateTime={iso} className="text-foreground">
          {formatReviewedDe(iso)}
        </time>
      </span>
    </div>
  );
}

export function ToolSafetyDisclaimer({ children }: { children?: ReactNode }) {
  return (
    <aside
      role="note"
      className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100"
    >
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" strokeWidth={2} />
      <div className="leading-relaxed">
        {children ?? (
          <>
            <strong className="font-semibold">Sicherheitshinweis:</strong> Die Herstellerangaben auf
            Reifenflanke, Rahmenaufkleber oder in der Betriebsanleitung haben immer Vorrang. Dieser
            Rechner liefert Startwerte und ersetzt keine fachkundige Werkstatt-Prüfung.
          </>
        )}
      </div>
    </aside>
  );
}

export function ToolFaq({ items, slug: _slug }: { items: Faq[]; slug?: string }) {
  if (!items.length) return null;
  return (
    <section className="mt-12" aria-labelledby="tool-faq-heading">
      <h2 id="tool-faq-heading" className="font-display text-2xl font-black tracking-tight md:text-3xl">
        Häufige Fragen
      </h2>
      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card/60">
        {items.map((f, i) => (
          <details key={i} className="group p-5 open:bg-background/40">
            <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:hidden">
              <span className="flex items-start justify-between gap-4">
                <span>{f.question}</span>
                <span aria-hidden className="mt-1 shrink-0 text-signal transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ToolRelatedArticles({ slug }: { slug: string }) {
  const items = relatedFor(slug);
  if (!items.length) return null;
  return (
    <section className="mt-10" aria-labelledby="tool-related-heading">
      <h2 id="tool-related-heading" className="font-display text-xl font-bold tracking-tight md:text-2xl">
        Passende Ratgeber
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <li key={r.slug}>
            <Link
              to="/artikel/$slug"
              params={{ slug: r.slug }}
              className="group flex h-full flex-col rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-signal/60 hover:bg-card"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-signal">Ratgeber</span>
              <span className="mt-2 text-sm font-semibold leading-snug text-foreground group-hover:text-signal">
                {r.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ToolSeoSection({
  slug,
  heading,
  children,
}: {
  slug: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <article className="mt-12 rounded-2xl border border-border bg-card/40 p-6 md:p-10">
      <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl">{heading}</h2>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground md:[&_h3]:text-xl [&_p]:leading-relaxed [&_strong]:text-foreground [&_a]:text-signal [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_table]:w-full [&_table]:text-sm [&_th]:bg-card/60 [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_td]:border-t [&_td]:border-border [&_td]:p-2">
        {children}
      </div>
      <ToolRelatedArticles slug={slug} />
    </article>
  );
}
