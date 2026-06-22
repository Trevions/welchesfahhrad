import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
  Circle,
  ZoomControl,
  useMap,
} from "react-leaflet";
import {
  Bike,
  Wrench,
  Droplets,
  ParkingSquare,
  TreePine,
  Mountain,
  Coffee,
  Train,
  Crosshair,
  Loader2,
  AlertTriangle,
  Navigation as NavIcon,
  ExternalLink,
} from "lucide-react";
import { getLocation, hasGeoConsent } from "@/lib/geo-consent";

type PoiKind =
  | "shop"
  | "repair"
  | "rental"
  | "parking"
  | "water"
  | "viewpoint"
  | "park"
  | "cafe"
  | "train";

type Poi = {
  id: string;
  kind: PoiKind;
  name: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  distance: number;
};

const KIND_META: Record<
  PoiKind,
  { label: string; color: string; bg: string; icon: typeof Bike }
> = {
  shop: { label: "Fahrradladen", color: "#f97316", bg: "#f97316", icon: Bike },
  repair: { label: "Reparaturstation", color: "#ef4444", bg: "#ef4444", icon: Wrench },
  rental: { label: "Verleih", color: "#a855f7", bg: "#a855f7", icon: Bike },
  parking: { label: "Abstellplatz", color: "#3b82f6", bg: "#3b82f6", icon: ParkingSquare },
  water: { label: "Trinkwasser", color: "#06b6d4", bg: "#06b6d4", icon: Droplets },
  viewpoint: { label: "Aussichtspunkt", color: "#eab308", bg: "#eab308", icon: Mountain },
  park: { label: "Park / Erholung", color: "#22c55e", bg: "#22c55e", icon: TreePine },
  cafe: { label: "Café / Rast", color: "#d97706", bg: "#d97706", icon: Coffee },
  train: { label: "Bahnhof", color: "#64748b", bg: "#64748b", icon: Train },
};

const ALL_KINDS = Object.keys(KIND_META) as PoiKind[];

function makeIcon(kind: PoiKind) {
  const meta = KIND_META[kind];
  const html = `<div style="
    width:30px;height:30px;border-radius:50% 50% 50% 0;
    background:${meta.bg};transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 12px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.9);
  "><div style="transform:rotate(45deg);color:#fff;font:700 12px system-ui;">${meta.label.charAt(0)}</div></div>`;
  return L.divIcon({
    html,
    className: "radmap-poi-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

const userIcon = L.divIcon({
  html: `<div style="
    width:22px;height:22px;border-radius:50%;
    background:#f97316;border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(249,115,22,.35),0 4px 12px rgba(0,0,0,.5);
    animation:radmap-pulse 2s ease-out infinite;
  "></div>
  <style>@keyframes radmap-pulse{0%{box-shadow:0 0 0 0 rgba(249,115,22,.55),0 4px 12px rgba(0,0,0,.5)}70%{box-shadow:0 0 0 18px rgba(249,115,22,0),0 4px 12px rgba(0,0,0,.5)}100%{box-shadow:0 0 0 0 rgba(249,115,22,0),0 4px 12px rgba(0,0,0,.5)}}</style>`,
  className: "radmap-user-icon",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function classifyTag(tags: Record<string, string>): PoiKind | null {
  if (tags.shop === "bicycle") return "shop";
  if (tags.amenity === "bicycle_repair_station") return "repair";
  if (tags.amenity === "bicycle_rental") return "rental";
  if (tags.amenity === "bicycle_parking") return "parking";
  if (tags.amenity === "drinking_water") return "water";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.leisure === "park" || tags.leisure === "nature_reserve") return "park";
  if (tags.amenity === "cafe") return "cafe";
  if (tags.railway === "station" || tags.public_transport === "station") return "train";
  return null;
}

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

async function fetchPois(lat: number, lon: number, radius: number): Promise<Poi[]> {
  const query = `
    [out:json][timeout:25];
    (
      node(around:${radius},${lat},${lon})[shop=bicycle];
      node(around:${radius},${lat},${lon})[amenity=bicycle_repair_station];
      node(around:${radius},${lat},${lon})[amenity=bicycle_rental];
      node(around:${radius},${lat},${lon})[amenity=bicycle_parking];
      node(around:${radius},${lat},${lon})[amenity=drinking_water];
      node(around:${radius},${lat},${lon})[tourism=viewpoint];
      node(around:${radius},${lat},${lon})[amenity=cafe];
      node(around:${radius},${lat},${lon})[railway=station];
      way(around:${radius},${lat},${lon})[leisure=park];
    );
    out center 200;
  `;
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];
  let data: any = null;
  let lastErr: unknown = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body: "data=" + encodeURIComponent(query),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (!res.ok) throw new Error(String(res.status));
      data = await res.json();
      break;
    } catch (err) {
      lastErr = err;
    }
  }
  if (!data) throw lastErr ?? new Error("Overpass nicht erreichbar.");

  const seen = new Set<string>();
  const pois: Poi[] = [];
  for (const el of data.elements ?? []) {
    const elat = el.lat ?? el.center?.lat;
    const elon = el.lon ?? el.center?.lon;
    if (!elat || !elon) continue;
    const tags = el.tags ?? {};
    const kind = classifyTag(tags);
    if (!kind) continue;
    const id = `${el.type}/${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const name =
      tags.name ||
      tags["name:de"] ||
      tags.operator ||
      tags.brand ||
      KIND_META[kind].label;
    pois.push({
      id,
      kind,
      name,
      lat: elat,
      lon: elon,
      tags,
      distance: haversine({ lat, lon }, { lat: elat, lon: elon }),
    });
  }
  pois.sort((a, b) => a.distance - b.distance);
  return pois.slice(0, 150);
}

function FlyTo({ pos, zoom }: { pos: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, zoom ?? 14, { duration: 1.2 });
  }, [pos, zoom, map]);
  return null;
}

function fmtDist(m: number) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

type Status = "idle" | "locating" | "loading" | "ready" | "error";

export default function InteractiveMap() {
  const [center, setCenter] = useState<[number, number]>([51.1657, 10.4515]); // DE
  const [zoom, setZoom] = useState(6);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState(3000);
  const [pois, setPois] = useState<Poi[]>([]);
  // null = alle Kategorien sichtbar; sonst nur die gewählte
  const [activeKind, setActiveKind] = useState<PoiKind | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [flyPos, setFlyPos] = useState<[number, number] | null>(null);
  const reqRef = useRef(0);

  // auto-locate if consent already granted
  useEffect(() => {
    if (hasGeoConsent()) void handleLocate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPois(lat: number, lon: number, r: number) {
    const reqId = ++reqRef.current;
    setStatus("loading");
    setError(null);
    try {
      const list = await fetchPois(lat, lon, r);
      if (reqRef.current !== reqId) return;
      setPois(list);
      setStatus("ready");
    } catch (e: any) {
      if (reqRef.current !== reqId) return;
      setError(e?.message || "Daten konnten nicht geladen werden.");
      setStatus("error");
    }
  }

  async function handleLocate(silent = false) {
    setStatus("locating");
    setError(null);
    try {
      const loc = await getLocation();
      const p: [number, number] = [loc.lat, loc.lon];
      setUserPos(p);
      setCenter(p);
      setZoom(14);
      setFlyPos(p);
      await loadPois(loc.lat, loc.lon, radius);
    } catch (e: any) {
      if (!silent) {
        setError(e?.message || "Standort konnte nicht ermittelt werden.");
        setStatus("error");
      } else {
        setStatus("idle");
      }
    }
  }

  function toggleKind(k: PoiKind) {
    setActiveKind((prev) => (prev === k ? null : k));
  }

  const visiblePois = useMemo(
    () => (activeKind ? pois.filter((p) => p.kind === activeKind) : pois),
    [pois, activeKind],
  );

  const iconCache = useMemo(() => {
    const m = {} as Record<PoiKind, L.DivIcon>;
    for (const k of ALL_KINDS) m[k] = makeIcon(k);
    return m;
  }, []);

  const counts = useMemo(() => {
    const c: Record<PoiKind, number> = {} as any;
    for (const k of ALL_KINDS) c[k] = 0;
    for (const p of pois) c[p.kind]++;
    return c;
  }, [pois]);

  return (
    <div className="relative w-full">
      {/* Map shell */}
      <div className="relative w-full h-[65vh] md:h-[78vh] border-y border-border overflow-hidden bg-card">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          zoomControl={false}
          className="absolute inset-0 w-full h-full"
          style={{ background: "#0a0a0a" }}
        >
          <ZoomControl position="bottomright" />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="CyclOSM (Radkarte)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://www.cyclosm.org">CyclOSM</a>'
                url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
                maxZoom={20}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenTopoMap (Terrain)">
              <TileLayer
                attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                maxZoom={17}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellit">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay checked name="Radwege (Waymarked Trails)">
              <TileLayer
                attribution='&copy; <a href="https://waymarkedtrails.org">Waymarked Trails</a>'
                url="https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png"
                maxZoom={18}
                opacity={0.85}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="MTB-Trails">
              <TileLayer
                attribution='&copy; <a href="https://waymarkedtrails.org">Waymarked Trails</a>'
                url="https://tile.waymarkedtrails.org/mtb/{z}/{x}/{y}.png"
                maxZoom={18}
                opacity={0.85}
              />
            </LayersControl.Overlay>
          </LayersControl>

          {userPos && (
            <>
              <Marker position={userPos} icon={userIcon}>
                <Popup>Dein Standort</Popup>
              </Marker>
              <Circle
                center={userPos}
                radius={radius}
                pathOptions={{ color: "#f97316", weight: 1.5, fillOpacity: 0.05 }}
              />
            </>
          )}

          {visiblePois.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={iconCache[p.kind]}>
              <Popup>
                <div style={{ minWidth: 180, fontFamily: "system-ui" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: KIND_META[p.kind].color,
                      textTransform: "uppercase",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      marginBottom: 6,
                    }}
                  >
                    {KIND_META[p.kind].label} · {fmtDist(p.distance)}
                  </div>
                  {p.tags["addr:street"] && (
                    <div style={{ fontSize: 12, color: "#555" }}>
                      {p.tags["addr:street"]} {p.tags["addr:housenumber"] || ""}
                      {p.tags["addr:city"] ? `, ${p.tags["addr:city"]}` : ""}
                    </div>
                  )}
                  {p.tags.opening_hours && (
                    <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                      🕐 {p.tags.opening_hours}
                    </div>
                  )}
                  {p.tags.website && (
                    <a
                      href={p.tags.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: 6,
                        fontSize: 12,
                        color: "#f97316",
                        fontWeight: 600,
                      }}
                    >
                      Website ↗
                    </a>
                  )}
                  <a
                    href={`https://www.openstreetmap.org/${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      marginTop: 4,
                      fontSize: 11,
                      color: "#888",
                    }}
                  >
                    OSM-Daten ↗
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          <FlyTo pos={flyPos} zoom={14} />
        </MapContainer>

        {/* Top-left control bar */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col gap-2 max-w-[calc(100%-1.5rem)]">
          <button
            onClick={() => handleLocate(false)}
            disabled={status === "locating" || status === "loading"}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-background/95 backdrop-blur-xl border border-border text-sm font-medium text-foreground hover:border-signal hover:text-signal transition-colors shadow-elevated disabled:opacity-60"
          >
            {status === "locating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4" />
            )}
            {userPos ? "Standort aktualisieren" : "Standort orten"}
          </button>

          {userPos && (
            <div className="flex items-center gap-2 px-3 py-2 bg-background/95 backdrop-blur-xl border border-border shadow-elevated">
              <span className="text-xs text-muted-foreground font-medium">Umkreis</span>
              {[1000, 3000, 5000, 10000].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRadius(r);
                    if (userPos) void loadPois(userPos[0], userPos[1], r);
                  }}
                  className={`px-2 py-1 text-xs font-medium border transition-colors ${
                    radius === r
                      ? "bg-signal text-signal-foreground border-signal"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r / 1000} km
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status / error */}
        {status === "loading" && (
          <div className="absolute top-3 right-3 z-[400] flex items-center gap-2 px-3 py-2 bg-background/95 backdrop-blur-xl border border-border shadow-elevated">
            <Loader2 className="h-4 w-4 animate-spin text-signal" />
            <span className="text-xs text-muted-foreground">Lade POIs …</span>
          </div>
        )}
        {error && (
          <div className="absolute bottom-3 left-3 z-[400] flex items-start gap-2 px-3 py-2 bg-destructive/10 backdrop-blur-xl border border-destructive/40 text-destructive max-w-sm shadow-elevated">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="text-xs leading-relaxed">{error}</span>
          </div>
        )}
      </div>

      {/* Filters bar */}
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveKind(null)}
            className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-bold uppercase tracking-wider transition-all ${
              activeKind === null
                ? "bg-signal text-signal-foreground border-signal"
                : "bg-transparent border-border text-muted-foreground/70 hover:text-foreground"
            }`}
          >
            Alle
            {pois.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-background/20 border border-current/20 text-[10px] tabular-nums">
                {pois.length}
              </span>
            )}
          </button>
          {ALL_KINDS.map((k) => {
            const meta = KIND_META[k];
            const Icon = meta.icon;
            const on = activeKind === k;
            const dim = activeKind !== null && !on;
            const c = counts[k] || 0;
            return (
              <button
                key={k}
                onClick={() => toggleKind(k)}
                className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-medium transition-all ${
                  on
                    ? "bg-card border-foreground text-foreground shadow-elevated"
                    : dim
                      ? "bg-transparent border-border text-muted-foreground/50 hover:text-foreground"
                      : "bg-transparent border-border text-foreground/80 hover:text-foreground"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: meta.color, opacity: dim ? 0.35 : 1 }}
                />
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
                {c > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-background border border-border text-[10px] tabular-nums">
                    {c}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>


      {/* Nearby list */}
      {userPos && (
        <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <div className="eyebrow text-muted-foreground mb-2">
                <span className="editorial-rule mr-3" />
                IN DEINER NÄHE
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-black italic">
                {visiblePois.length}{" "}
                <span className="text-signal">Orte</span> im {radius / 1000} km Umkreis
              </h2>
            </div>
            <div className="text-xs text-muted-foreground">
              Daten: OpenStreetMap · Overpass API · live abgefragt
            </div>
          </div>

          {status === "loading" && pois.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Lade Orte aus OpenStreetMap …
            </div>
          ) : visiblePois.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Keine Orte in diesem Umkreis. Aktiviere weitere Kategorien oder vergrößere
              den Radius.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visiblePois.slice(0, 24).map((p) => {
                const meta = KIND_META[p.kind];
                const Icon = meta.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setFlyPos([p.lat, p.lon])}
                    className="text-left surface p-4 hover-lift group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center shrink-0 border border-border"
                        style={{ color: meta.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-[10px] uppercase tracking-wider font-bold mb-1"
                          style={{ color: meta.color }}
                        >
                          {meta.label} · {fmtDist(p.distance)}
                        </div>
                        <div className="font-display text-base font-bold italic truncate">
                          {p.name}
                        </div>
                        {p.tags["addr:street"] && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {p.tags["addr:street"]} {p.tags["addr:housenumber"] || ""}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-signal"
                          >
                            <ExternalLink className="h-3 w-3" /> OSM
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}&travelmode=bicycling`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-signal"
                          >
                            <NavIcon className="h-3 w-3" /> Route
                          </a>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {!userPos && status !== "locating" && (
        <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
          <div className="surface p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold italic mb-1">
                Zeige Orte in <span className="text-signal">deiner Nähe</span>
              </h3>
              <p className="text-sm text-muted-foreground max-w-lg">
                Fahrradläden, Reparaturstationen, Trinkwasser, Cafés, Bahnhöfe, Aussichts­punkte
                und Parks — live aus OpenStreetMap, kostenlos und ohne Tracking.
              </p>
            </div>
            <button
              onClick={() => handleLocate(false)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-signal text-signal-foreground font-semibold hover:bg-signal/90 transition-colors"
            >
              <Crosshair className="h-4 w-4" /> Standort freigeben
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
