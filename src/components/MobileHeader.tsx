import { Link } from "@tanstack/react-router";
import { Bike, Search } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 md:hidden pt-[env(safe-area-inset-top)]">
      <div className="glass-strong border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-signal/15">
              <Bike className="h-4 w-4 text-signal" strokeWidth={2.5} />
            </div>
            <span className="font-display text-base font-bold tracking-tight">
              radmap<span className="text-signal">.</span>de
            </span>
          </Link>
          <button
            type="button"
            aria-label="Suchen"
            className="flex h-9 w-9 items-center justify-center rounded-full glass active:scale-95 transition-transform"
          >
            <Search className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </header>
  );
}
