import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Bookmark } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchOverlay } from "./SearchOverlay";
import { useBookmarks } from "@/hooks/use-bookmarks";


const nav = [
  { to: "/", label: "Startseite", exact: true },
  { to: "/nachrichten", label: "Nachrichten" },
  { to: "/ratgeber", label: "Ratgeber" },
  { to: "/e-bikes", label: "E-Bikes" },
  { to: "/tests", label: "Tests" },
];

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchOpen, setSearchOpen] = useState(false);
  const { bookmarks } = useBookmarks();


  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 hidden md:block bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="mx-auto max-w-[1400px] px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          {/* Wordmark */}
          <Link to="/" className="flex items-baseline">
            <span className="font-display text-2xl font-black italic tracking-tight leading-none">
              Radmap<span className="text-signal">.</span>
            </span>
            <span className="ml-1 font-display text-2xl font-black italic leading-none text-signal">
              DE
            </span>
          </Link>

          {/* Center nav */}
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`group relative px-4 py-2 eyebrow transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute left-4 right-4 -bottom-px h-px bg-signal transition-transform origin-left ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Suchen"
              onClick={() => setSearchOpen(true)}
              className="group flex h-9 items-center gap-2 border border-border px-3 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="eyebrow-sm hidden lg:inline">Suchen</span>
              <kbd className="hidden lg:inline-flex items-center border border-border px-1 py-0.5 text-[9px] uppercase tracking-widest">
                ⌘K
              </kbd>
            </button>
            <Link
              to="/merkliste"
              aria-label="Merkliste"
              className="relative flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center bg-signal text-[10px] font-bold text-background">
                  {bookmarks.length}
                </span>
              )}
            </Link>
            <ThemeToggle />

          </div>
        </div>
      </div>
    </header>
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
