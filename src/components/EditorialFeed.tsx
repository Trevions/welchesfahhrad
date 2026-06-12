import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/articles";

interface Props {
  items: Article[];
  title?: string;
}

export function EditorialFeed({ items, title = "Aktuell im Fokus" }: Props) {
  return (
    <div className="flex flex-col border border-border bg-card">
      {/* head */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 bg-signal" />
          <span className="eyebrow text-foreground">{title}</span>
        </div>
        <span className="eyebrow-sm text-muted-foreground hidden sm:inline">Live</span>
      </div>

      <ul className="flex-1 divide-y divide-border">
        {items.map((a, i) => (
          <li key={a.slug}>
            <Link
              to="/artikel/$slug"
              params={{ slug: a.slug }}
              className="group block px-6 py-5 hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display text-xs font-black italic text-signal w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="eyebrow-sm text-muted-foreground group-hover:text-signal transition-colors">
                  {a.category}
                </span>
              </div>
              <h3 className="font-display text-lg md:text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-signal">
                {a.title}
              </h3>
              <div className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                {a.date} · {a.readTime}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
