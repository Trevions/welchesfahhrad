import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
      title={isDark ? "Helles Design" : "Dunkles Design"}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full glass transition-all active:scale-95 hover:scale-105 ${className}`}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-500 ${
          isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-signal"
        }`}
        strokeWidth={2.25}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-500 ${
          isDark ? "opacity-100 rotate-0 scale-100 text-signal" : "opacity-0 rotate-90 scale-50"
        }`}
        strokeWidth={2.25}
      />
    </button>
  );
}
