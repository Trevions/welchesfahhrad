import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Newspaper, BookOpen, Zap, Award } from "lucide-react";

const items = [
  { to: "/", label: "Start", Icon: Home },
  { to: "/nachrichten", label: "News", Icon: Newspaper },
  { to: "/ratgeber", label: "Ratgeber", Icon: BookOpen },
  { to: "/e-bikes", label: "E-Bikes", Icon: Zap },
  { to: "/tests", label: "Tests", Icon: Award },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="glass-strong shadow-glass flex items-center justify-around rounded-3xl px-2 py-2">
          {items.map(({ to, label, Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all active:scale-95"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    active
                      ? "bg-signal text-signal-foreground shadow-glow"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </div>
                <span
                  className={`text-[10px] font-medium tracking-tight transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
