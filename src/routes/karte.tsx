import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Navigation, Route as RouteIcon, Layers, Info, Bike, Mountain, TreePine, Waves } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/karte")({
  head: () => ({
    meta: [
      { title: "Fahrradkarte Deutschland — Strecken, Routen & POIs | RADMAP" },
      { name: "description", content: "Interaktive Fahrradkarte für Deutschland. Finde Radwege, Mountainbike-Strecken, Rennrad-Routen und Sehenswürdigkeiten entlang der Strecke." },
      { property: "og:title", content: "Fahrradkarte Deutschland — Strecken, Routen & POIs | RADMAP" },
      { property: "og:description", content: "Interaktive Fahrradkarte für Deutschland. Finde Radwege, Mountainbike-Strecken, Rennrad-Routen und Sehenswürdigkeiten entlang der Strecke." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://radmap.de/karte" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Fahrradkarte Deutschland — Strecken, Routen & POIs | RADMAP" },
      { name: "twitter:description", content: "Interaktive Fahrradkarte für Deutschland. Finde Radwege, Mountainbike-Strecken, Rennrad-Routen und Sehenswürdigkeiten entlang der Strecke." },
    ],
    links: [
      { rel: "canonical", href: "https://radmap.de/karte" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Fahrradkarte Deutschland",
          description: "Interaktive Fahrradkarte für Deutschland mit Radwegen, MTB-Strecken, Rennrad-Routen und POIs.",
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

const mapLayers = [
  {
    id: "cycle",
    label: "Radwege",
    icon: Bike,
    url: "https://www.openstreetmap.org/export/embed.html?bbox=5.5%2C47.0%2C15.5%2C55.0&layer=cyclemap",
    desc: "Fahrradwege & Radnetze",
  },
  {
    id: "standard",
    label: "Standard",
    icon: MapPin,
    url: "https://www.openstreetmap.org/export/embed.html?bbox=5.5%2C47.0%2C15.5%2C55.0&layer=mapnik",
    desc: "Standardkarte",
  },
  {
    id: "terrain",
    label: "Terrain",
    icon: Mountain,
    url: "https://www.openstreetmap.org/export/embed.html?bbox=5.5%2C47.0%2C15.5%2C55.0&layer=hot",
    desc: "Topografie & Höhen",
  },
];

const poiCategories = [
  { icon: Bike, label: "Fahrradläden", color: "text-signal" },
  { icon: TreePine, label: "Erholung", color: "text-emerald-400" },
  { icon: Waves, label: "Gewässer", color: "text-sky-400" },
  { icon: RouteIcon, label: "Routen", color: "text-amber-400" },
];

function KartePage() {
  const [activeLayer, setActiveLayer] = useState(mapLayers[0]);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grain opacity-50" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="eyebrow text-muted-foreground mb-4">
                <span className="editorial-rule mr-3" />
                INTERAKTIV
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-black italic tracking-tight leading-[0.95]">
                Fahrrad<span className="text-signal">karte</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                Entdecke Deutschland auf zwei Rädern. Interaktive Karte mit Radwegen, 
                MTB-Strecken, Service-Points und Sehenswürdigkeiten.
              </p>
            </div>

            {/* Layer Switcher */}
            <div className="flex flex-wrap gap-2">
              {mapLayers.map((layer) => {
                const Icon = layer.icon;
                const active = activeLayer.id === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayer(layer)}
                    className={`flex items-center gap-2 px-4 py-2.5 border transition-all duration-300 font-sans text-sm font-medium ${
                      active
                        ? "bg-signal/10 border-signal text-signal"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 1.5} />
                    {layer.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Map Container */}
      <section className="relative">
        <div className="relative w-full h-[60vh] md:h-[70vh] border-y border-border">
          <iframe
            key={activeLayer.id}
            title="Fahrradkarte"
            src={activeLayer.url}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating overlay controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`w-10 h-10 flex items-center justify-center border backdrop-blur-xl transition-all duration-300 ${
                showInfo
                  ? "bg-signal/20 border-signal text-signal"
                  : "bg-background/90 border-border text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Karteninfo"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="absolute top-16 right-4 w-72 bg-background/95 backdrop-blur-xl border border-border p-5 shadow-elevated animate-scale-in">
              <h3 className="font-display text-lg font-bold italic mb-3">Kartenlegende</h3>
              <div className="space-y-2.5">
                {poiCategories.map((poi) => {
                  const Icon = poi.icon;
                  return (
                    <div key={poi.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-card border border-border">
                        <Icon className={`h-4 w-4 ${poi.color}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{poi.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kartenbasis: © OpenStreetMap-Mitwirkende. 
                  Die Karte zeigt dedizierte Radwege, Fahrradstraßen und 
                  weitere cycling-relevante Daten.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions / POI Grid */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-8 py-12 md:py-16">
        <div className="eyebrow text-muted-foreground mb-6">
          <span className="editorial-rule mr-3" />
          ENTDECKEN
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-black italic tracking-tight mb-8">
          Was auf der Karte <span className="text-signal">wartet</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: RouteIcon,
              title: "Radrouten",
              desc: "Über 200.000 km markierte Radwege in Deutschland — vom Alltagsweg bis zur Fernroute.",
              stat: "200.000+ km",
            },
            {
              icon: Mountain,
              title: "MTB-Strecken",
              desc: "Singletrails, Downhill-Parks und naturverbundene Offroad-Strecken für jeden Level.",
              stat: "15.000+ Trails",
            },
            {
              icon: Navigation,
              title: "Service-Points",
              desc: "Fahrradläden, Reparaturstationen, Luftstationen und Rastplätze entlang der Route.",
              stat: "50.000+ POIs",
            },
            {
              icon: Layers,
              title: "Ebikes-Ladung",
              desc: "Ladestationen für E-Bikes und Pedelecs auf deiner geplanten Route.",
              stat: "10.000+ Stationen",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group surface p-6 hover-lift cursor-default"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 flex items-center justify-center border border-border mb-4 group-hover:border-signal/50 transition-colors">
                  <Icon className="h-5 w-5 text-signal" strokeWidth={1.5} />
                </div>
                <div className="eyebrow text-signal mb-2">{item.stat}</div>
                <h3 className="font-display text-lg font-bold italic mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to action / Future features teaser */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 surface p-8 md:p-10">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-black italic">
                Routenplanung kommt <span className="text-signal">bald</span>
              </h3>
              <p className="mt-2 text-muted-foreground text-sm md:text-base max-w-lg">
                BALD: GPX-Import, Höhenprofile, individuelle Routenberechnung 
                mit Fahrrad-Optimierung und Export für dein Navi.
              </p>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-card border border-border">
              <Navigation className="h-4 w-4 text-signal animate-pulse" />
              <span className="eyebrow-sm text-muted-foreground">IN ENTWICKLUNG</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
