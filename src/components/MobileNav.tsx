import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Newspaper, BookOpen, Zap, Wrench, Map } from "lucide-react";

const items = [
  { to: "/", label: "Start", Icon: Home },
  { to: "/nachrichten", label: "News", Icon: Newspaper },
  { to: "/ratgeber", label: "Ratgeber", Icon: BookOpen },
  { to: "/e-bikes", label: "E-Bikes", Icon: Zap },
  { to: "/karte", label: "Karte", Icon: Map, featured: true },
  { to: "/tools", label: "Tools", Icon: Wrench },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around px-1 pt-1 pb-1">
        {items.map(({ to, label, Icon, featured }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          if (featured) {
            return (
              <Link
                key={to}
                to={to}
                className="group relative flex flex-col items-center justify-center -mt-5 mx-1"
              >
                {/* Floating pill background */}
                <div
                  className={`relative flex items-center justify-center w-[52px] h-[52px] rounded-full border-2 transition-all duration-300 shadow-lg ${
                    active
                      ? "bg-signal border-signal shadow-signal/30"
                      : "bg-background border-signal/60 shadow-signal/10 group-active:scale-95"
                  }`}
                  style={{
                    boxShadow: active
                      ? "0 8px 32px -8px oklch(0.7 0.2 45 / 0.45), 0 0 0 1px oklch(0.7 0.2 45 / 0.3)"
                      : "0 8px 24px -8px oklch(0.7 0.2 45 / 0.25)",
                  }}
                >
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors ${
                      active ? "text-signal-foreground" : "text-signal"
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span
                  className={`mt-1.5 text-[9px] tracking-wider uppercase font-bold transition-colors ${
                    active ? "text-signal" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {/* Active dot */}
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full bg-signal transition-all ${
                    active ? "opacity-100 scale-100" : "opacity-0 scale-0"
                  }`}
                />
              </Link>
            );
          }
          return (
            <Link
              key={to}
              to={to}
              className="group relative flex flex-1 flex-col items-center justify-center gap-1 py-2 active:opacity-70 transition-opacity"
            >
              {/* active top rule */}
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-signal transition-all ${
                  active ? "w-8" : "w-0"
                }`}
              />
              <Icon
                className={`h-[20px] w-[20px] transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span
                className={`text-[10px] tracking-wider uppercase font-semibold transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
