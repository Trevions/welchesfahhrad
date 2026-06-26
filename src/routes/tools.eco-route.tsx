import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Leaf, Loader2 } from "lucide-react";
import { ToolShell } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

const EcoRoutePlanner = lazy(() => import("@/components/tools/EcoRoutePlanner"));

export const Route = createFileRoute("/tools/eco-route")({
  head: () =>
    toolHead({
      title: "Eco Route Planner — Fahrradrouten in Deutschland",
      description:
        "Plane Fahrradtouren mit echten Radwegen, Live-Wetter, Höhenprofil und CO₂-Ersparnis. Kostenlos, OSM-basiert, ohne Account — von radmap.de.",
      path: "/tools/eco-route",
    }),
  component: EcoRoutePage,
});

function Fallback() {
  return (
    <div className="grid h-[60vh] place-items-center text-muted-foreground">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-signal" />
        Lade Planer …
      </div>
    </div>
  );
}

function EcoRoutePage() {
  return (
    <ToolShell
      eyebrow="Wetter · Routing · Karte"
      title="Eco Route Planner"
      description="Von A nach B mit echten Radwegen, Live-Wetter, Höhenprofil und CO₂-Bilanz. Powered by OpenStreetMap, BRouter und Open-Meteo — alles kostenlos und ohne Account."
      icon={Leaf}
    >
      <ClientOnly fallback={<Fallback />}>
        <Suspense fallback={<Fallback />}>
          <EcoRoutePlanner />
        </Suspense>
      </ClientOnly>

      <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
        Routen über{" "}
        <a href="https://brouter.de" className="underline hover:text-signal" target="_blank" rel="noreferrer">
          BRouter
        </a>{" "}
        (Norbert Renner) · Adressen über{" "}
        <a href="https://nominatim.openstreetmap.org" className="underline hover:text-signal" target="_blank" rel="noreferrer">
          Nominatim
        </a>{" "}
        · Wetter über{" "}
        <a href="https://open-meteo.com" className="underline hover:text-signal" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
        . Alle Dienste sind kostenfrei und ohne Tracking eingebunden. Kartendaten © OpenStreetMap-Mitwirkende (ODbL).
      </p>
    </ToolShell>
  );
}
