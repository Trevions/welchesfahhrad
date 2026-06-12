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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1.5">
          {items.map(({ to, label, Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 active:scale-[0.92] transition-transform"
              >
                <Icon
                  className={`h-[22px] w-[22px] transition-colors ${
                    active ? "text-signal" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-medium tracking-tight transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute -top-1.5 h-0.5 w-6 rounded-full bg-signal shadow-glow" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
