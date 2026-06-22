import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2, Bike } from "lucide-react";

const InteractiveMap = lazy(() => import("@/components/karte/InteractiveMap"));

export const Route = createFileRoute("/karte")({
  head: () => ({
    meta: [
      { title: "Fahrradkarte Deutschland — Live-Karte mit POIs in deiner Nähe | RADMAP" },
      {
        name: "description",
        content:
          "Professionelle interaktive Fahrradkarte für Deutschland: CyclOSM, MTB-Trails, Radwege, Fahrradläden, Reparaturstationen, Trinkwasser, Bahnhöfe und mehr — live aus OpenStreetMap.",
      },
      { property: "og:title", content: "Fahrradkarte Deutschland — Live-Karte mit POIs | RADMAP" },
      {
        property: "og:description",
        content:
          "Interaktive Fahrradkarte mit CyclOSM, MTB-Trails und Live-POIs (Werkstätten, Wasser, Cafés) in deiner Nähe.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://radmap.de/karte" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Fahrradkarte Deutschland — Live-Karte | RADMAP" },
      {
        name: "twitter:description",
        content:
          "Interaktive Fahrradkarte mit CyclOSM, MTB-Trails und Live-POIs in deiner Nähe.",
      },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/karte" }],
    scripts: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Fahrradkarte Deutschland",
          description:
            "Interaktive Fahrradkarte für Deutschland mit Radwegen, MTB-Strecken, Service-POIs und Live-Daten aus OpenStreetMap.",
          url: "https://radmap.de/karte",
          mainEntity: {
            "@type": "Map",
            name: "RADMAP Fahrradkarte",
            url: "https://radmap.de/karte",
          },
        }),
      },
    ],
  }),
  component: KartePage,
});

function MapFallback() {
  return (
    <div className="w-full h-[65vh] md:h-[78vh] border-y border-border bg-card flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-signal" />
        <span className="text-sm">Karte wird geladen …</span>
      </div>
    </div>
  );
}

function KartePage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grain opacity-50" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="eyebrow text-muted-foreground mb-4">
                <span className="editorial-rule mr-3" />
                LIVE · OPENSTREETMAP · KOSTENLOS
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-black italic tracking-tight leading-[0.95]">
                Fahrrad<span className="text-signal">karte</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                Professionelle Karte mit CyclOSM, MTB-Trails und Radwegen. Erlaube
                Standort und sieh Werkstätten, Trinkwasser, Cafés und Bahnhöfe live
                in deiner Nähe.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bike className="h-4 w-4 text-signal" />
              CyclOSM · OpenTopoMap · Waymarked Trails · Overpass
            </div>
          </div>
        </div>
      </section>

      <ClientOnly fallback={<MapFallback />}>
        <Suspense fallback={<MapFallback />}>
          <InteractiveMap />
        </Suspense>
      </ClientOnly>

      {/* Data credits */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-8 text-xs text-muted-foreground leading-relaxed">
          Kartendaten © OpenStreetMap-Mitwirkende (ODbL). Tiles: CyclOSM,
          OpenStreetMap, OpenTopoMap (CC-BY-SA), Esri World Imagery, Waymarked
          Trails. POI-Abfragen live über die Overpass API. Alle Datenquellen sind
          frei und ohne Tracking eingebunden.
        </div>
      </section>
    </div>
  );
}
