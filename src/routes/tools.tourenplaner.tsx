import { createFileRoute, Link } from "@tanstack/react-router";
import { Map, MapPin, ExternalLink, Mountain, Route as RouteIcon, Compass } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/tourenplaner")({
  head: () =>
    toolHead({
      title: "Tourenplaner für Radfahrer",
      description:
        "Plane Fahrradrouten mit Höhenprofil und Karte — empfohlene Planer für Tagestouren, Pendeln und Mehrtages-Trips.",
      path: "/tools/tourenplaner",
    }),
  component: TourPage,
});

const planners = [
  {
    name: "BRouter Web",
    url: "https://brouter.de/brouter-web/",
    desc: "Kostenlos, OSM-basiert, mit dem stärksten Höhenprofil. Profile für Gravel, Trekking, MTB und Rennrad.",
    best: "Optimale Strecken & GPX-Export",
  },
  {
    name: "komoot",
    url: "https://www.komoot.com/de-de",
    desc: "Bekanntester Touren-Planer mit Community-Highlights, App und Sprachnavigation.",
    best: "Bequeme Planung & Inspiration",
  },
  {
    name: "Bikerouter",
    url: "https://bikerouter.de/",
    desc: "Kostenfreie, schnelle BRouter-Oberfläche mit erweiterten Profilen und Reverse-Routing.",
    best: "Profi-Routing ohne Account",
  },
  {
    name: "OpenStreetMap CyclOSM",
    url: "https://www.cyclosm.org/",
    desc: "Fahrrad-optimierte OSM-Kartendarstellung — Radwege, Untergrund, Hindernisse.",
    best: "Karten-Recherche",
  },
];

function TourPage() {
  return (
    <ToolShell
      eyebrow="Wetter · 04"
      title="Tourenplaner"
      description="Wir haben keine eigene Karten-Engine — und das ist Absicht. Hier findest du die besten Planer und unsere eigene Karten-Sektion."
      icon={Map}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Empfohlene Planer</h2>
          <div className="mt-5 grid gap-4">
            {planners.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-signal/50"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-card/60 text-signal">
                  <RouteIcon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold tracking-tight">{p.name}</h3>
                    <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-signal" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-signal">
                    Beste Wahl für: {p.best}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </ToolCard>

        <div className="grid gap-6">
          <ToolCard>
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card/60 text-signal">
              <MapPin className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-3 font-display text-base font-bold tracking-tight">Unsere Karte</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Schnellzugriff auf radmap.de mit Live-Wetter und kuratierten Strecken.
            </p>
            <Link
              to="/karte"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-signal px-4 py-2 text-sm font-semibold text-signal-foreground"
            >
              Zur Karte
            </Link>
          </ToolCard>

          <ToolCard>
            <Mountain className="h-5 w-5 text-signal" />
            <h3 className="mt-3 font-display text-base font-bold tracking-tight">Planungs-Tipps</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Höhenmeter realistisch:</strong> 100 hm/10 km
                ist hügelig, 200 hm/10 km bergig.
              </li>
              <li>
                <strong className="text-foreground">Untergrund prüfen:</strong> Gravel ≠ Trail.
                In OSM-Tags steht „surface=gravel" oder „surface=ground".
              </li>
              <li>
                <strong className="text-foreground">Wasser & Imbiss</strong> auf der Route
                vorab markieren — gerade auf Rundtouren.
              </li>
            </ul>
          </ToolCard>

          <ToolCard>
            <Compass className="h-5 w-5 text-signal" />
            <h3 className="mt-3 font-display text-base font-bold tracking-tight">GPX → Garmin / Wahoo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Alle empfohlenen Planer exportieren GPX. Datei via USB / Connect IQ / Wahoo-App
              aufs Gerät kopieren — fertig.
            </p>
          </ToolCard>
        </div>
      </div>

      <ToolDisclaimer>
        Kein Affiliate, keine Bezahl-Empfehlung. Die Auswahl spiegelt die Werkzeuge wider, die wir
        in der Redaktion selbst nutzen.
      </ToolDisclaimer>
    </ToolShell>
  );
}
