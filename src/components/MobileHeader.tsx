import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchOverlay } from "./SearchOverlay";

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 md:hidden pt-[env(safe-area-inset-top)] bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex h-14 items-center justify-between px-5">
          <Link to="/" className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-black italic leading-none">
              Radmap<span className="text-signal">.</span>
            </span>
            <span className="font-display text-xl font-black italic leading-none text-signal">
              DE
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
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
