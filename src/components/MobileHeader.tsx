import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Bookmark, Bike } from "lucide-react";
import { SearchOverlay } from "./SearchOverlay";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useBikeProfile } from "@/lib/bike-profile";
import { useMatchingArticles } from "@/lib/use-matches";


export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { bookmarks } = useBookmarks();
  const profile = useBikeProfile();
  const configured = !!profile && profile.bikeTypes.length > 0;
  const { count: matchCount } = useMatchingArticles(80);
  const hasMatches = configured && matchCount > 0;


  return (
    <>
      <header className="sticky top-0 z-40 md:hidden pt-[env(safe-area-inset-top)] bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex h-14 items-center justify-between px-5">
          <Link to="/" className="flex items-baseline">
            <span className="font-display text-xl font-black italic leading-none">
              Radmap<span className="text-signal">.</span>
            </span>
            <span className="ml-1 font-display text-xl font-black italic leading-none text-signal">
              DE
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to={hasMatches ? "/passt-zu-dir" : "/mein-rad"}
              aria-label={hasMatches ? `${matchCount} passende Artikel` : "Mein RadProfil"}
              className={`relative flex h-9 w-9 items-center justify-center transition-colors ${
                hasMatches
                  ? "text-signal"
                  : configured
                    ? "text-muted-foreground active:text-foreground"
                    : "text-signal"
              }`}
            >
              <Bike className={`h-4 w-4 ${hasMatches ? "animate-pulse-soft" : ""}`} />
              {hasMatches ? (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center bg-signal text-[9px] font-bold text-signal-foreground tabular-nums leading-none">
                  {matchCount > 99 ? "99+" : matchCount}
                </span>
              ) : (
                !configured && (
                  <span aria-hidden className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
                )
              )}
            </Link>

            <Link
              to="/merkliste"
              aria-label="Merkliste"
              className="relative flex h-9 w-9 items-center justify-center text-muted-foreground active:text-foreground transition-colors"
            >
              <Bookmark className="h-4 w-4" />
              {bookmarks.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center bg-signal text-[9px] font-bold text-background">
                  {bookmarks.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Suchen"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground active:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

          </div>
        </div>
      </header>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
