import { Link, useRouterState } from "@tanstack/react-router";
import { Bike } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { to: "/", label: "Start" },
  { to: "/nachrichten", label: "Nachrichten" },
  { to: "/ratgeber", label: "Ratgeber" },
  { to: "/e-bikes", label: "E-Bikes" },
  { to: "/tests", label: "Tests" },
];

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="mx-auto mt-4 max-w-6xl px-6">
        <nav className="glass-strong shadow-glass flex items-center justify-between rounded-full px-6 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Bike className="h-6 w-6 text-signal transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-signal blur-xl opacity-40 -z-10" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              radmap<span className="text-signal">.</span>de
            </span>
          </Link>

          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-white/10" />
                    )}
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/admin"
              className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-signal-foreground transition-transform hover:scale-105"
            >
              Admin
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
