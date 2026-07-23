import { useEffect, type ReactNode } from "react";

// Light-only theme. The theme toggle has been removed; this provider now
// only ensures the <html> element carries the "light" class (and drops any
// stale "dark" class or persisted preference from earlier versions).
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    try {
      localStorage.removeItem("radmap-theme");
    } catch {}
  }, []);
  return <>{children}</>;
}
