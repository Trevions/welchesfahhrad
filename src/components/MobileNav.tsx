import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Newspaper, BookOpen, Zap, Wrench, Map } from "lucide-react";

const items = [
  { to: "/", label: "Start", Icon: Home },
  { to: "/nachrichten", label: "News", Icon: Newspaper },
  { to: "/ratgeber", label: "Ratgeber", Icon: BookOpen },
  { to: "/karte", label: "Karte", Icon: Map, featured: true },
  { to: "/e-bikes", label: "E-Bikes", Icon: Zap },
  { to: "/tools", label: "Tools", Icon: Wrench },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-1 pt-1 pb-1">
        {items.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
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
