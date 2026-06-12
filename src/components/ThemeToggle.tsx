import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Helles Design" : "Dunkles Design"}
      title={isDark ? "Helles Design" : "Dunkles Design"}
      className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}
