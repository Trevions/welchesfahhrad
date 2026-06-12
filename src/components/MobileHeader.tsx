import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 md:hidden pt-[env(safe-area-inset-top)] bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="flex h-14 items-center justify-between px-5">
        <Link to="/" className="flex items-baseline">
          <span className="font-display text-xl font-black italic leading-none">
            Radmap<span className="text-signal">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Suchen"
            className="flex h-9 w-9 items-center justify-center text-muted-foreground active:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
