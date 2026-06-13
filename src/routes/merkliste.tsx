import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";

export const Route = createFileRoute("/merkliste")({
  head: () => ({
    meta: [
      { title: "Merkliste | radmap.de" },
      { name: "description", content: "Deine gemerkten Artikel auf radmap.de." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MerklistePage,
});

function MerklistePage() {
  const { bookmarks, remove, clear } = useBookmarks();

  return (
    <div className="mx-auto max-w-[1100px] px-6 md:px-8 pt-16 md:pt-24 pb-20">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-signal" />
        <span className="eyebrow text-signal">Deine Merkliste</span>
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl md:text-6xl font-black italic tracking-tight">
          Gemerkte Artikel
        </h1>
        {bookmarks.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Merkliste komplett leeren?")) clear();
            }}
            className="inline-flex items-center gap-2 eyebrow text-muted-foreground hover:text-signal transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Alle entfernen
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="mt-16 border border-border bg-card px-8 py-20 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-6 font-display text-2xl font-bold">Noch nichts gemerkt</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Klicke bei einem Artikel auf das Lesezeichen-Symbol, um ihn für später zu
            speichern. Deine Merkliste bleibt in diesem Browser erhalten.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block eyebrow border-b border-foreground pb-1 hover:text-signal hover:border-signal transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      ) : (
        <ul className="mt-12 divide-y divide-border border-t border-b border-border">
          {bookmarks.map((b) => (
            <li key={b.slug} className="group grid grid-cols-[120px_1fr_auto] md:grid-cols-[200px_1fr_auto] gap-6 py-6 items-center">
              <Link to="/artikel/$slug" params={{ slug: b.slug }} className="block overflow-hidden bg-muted">
                <img src={b.image} alt={b.title} className="aspect-[16/10] w-full object-cover transition-transform group-hover:scale-105" />
              </Link>
              <div className="min-w-0">
                <div className="eyebrow-sm text-signal">{b.category}</div>
                <Link to="/artikel/$slug" params={{ slug: b.slug }}>
                  <h3 className="mt-2 font-display text-xl md:text-2xl font-bold leading-tight group-hover:text-signal transition-colors line-clamp-2">
                    {b.title}
                  </h3>
                </Link>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 hidden md:block">{b.excerpt}</p>
                <div className="mt-3 eyebrow-sm text-muted-foreground">
                  {b.date} · {b.readTime}
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(b.slug)}
                aria-label="Entfernen"
                className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-signal hover:border-signal transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
