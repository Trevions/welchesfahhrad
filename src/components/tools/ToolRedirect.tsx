import { Navigate, type ToPathOption } from "@tanstack/react-router";

// Shared client-side redirect für umbenannte Tool-Routen. Server-Handler
// (301) läuft davor und ist der Hauptpfad; diese Komponente ist der Fallback
// für SPA-Navigation und Preview-Umgebungen ohne Server.
export function ToolRedirect({ to }: { to: string }) {
  return <Navigate to={to as unknown as ToPathOption<never, string, string>} replace />;
}
