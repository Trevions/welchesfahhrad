import { parse as parseYaml } from "yaml";
import { BIKE_TYPES, bikeSlugify } from "@/lib/bike-types";

export type ImportedBike = Record<string, any>;

export type BikeImportReport = {
  score: number;
  filledFields: string[];
  filledSections: { key: string; label: string; count: number }[];
  missingImportant: string[];
  warnings: string[];
};

type ParsedText = { raw: Record<string, any>; body: string };

const ALIASES: Record<string, string> = {
  marke: "brand",
  brand_name: "brand",
  hersteller: "brand",
  manufacturer: "brand",
  fabrikat: "brand",
  modell: "model",
  model_name: "model",
  fahrradmodell: "model",
  produktname: "model",
  name: "model",
  jahr: "year",
  modelljahr: "year",
  model_year: "year",
  baujahr: "year",
  kategorie: "category",
  category_type: "category",
  art: "category",
  typ: "bike_type",
  type: "bike_type",
  fahrradtyp: "bike_type",
  bike_kind: "bike_type",
  bike_type_name: "bike_type",
  preis: "price_eur",
  uvp: "price_eur",
  preis_ab: "price_eur",
  price: "price_eur",
  price_euro: "price_eur",
  price_from: "price_eur",
  retail_price: "price_eur",
  msrp: "price_eur",
  bild: "image_url",
  image: "image_url",
  image_url: "image_url",
  bild_url: "image_url",
  titelbild: "image_url",
  hauptbild: "image_url",
  main_image: "image_url",
  hero_image: "image_url",
  cover: "image_url",
  cover_image: "image_url",
  bilder: "gallery",
  images: "gallery",
  galerie: "gallery",
  gallery_images: "gallery",
  photos: "gallery",
  hersteller_url: "manufacturer_url",
  herstellerseite: "manufacturer_url",
  manufacturer_link: "manufacturer_url",
  product_url: "manufacturer_url",
  url: "manufacturer_url",
  kurzbeschreibung: "excerpt",
  teaser: "excerpt",
  summary: "excerpt",
  short_description: "excerpt",
  beschreibung: "description",
  langbeschreibung: "description",
  description_text: "description",
  body: "description",
  staerken: "pros",
  stärken: "pros",
  pros: "pros",
  advantages: "pros",
  pluspunkte: "pros",
  vorteile: "pros",
  schwaechen: "cons",
  schwächen: "cons",
  cons: "cons",
  disadvantages: "cons",
  minuspunkte: "cons",
  nachteile: "cons",
  einsatz: "intended_use",
  einsatzbereiche: "intended_use",
  intended_use: "intended_use",
  use_case: "intended_use",
  use_cases: "intended_use",
  zielgruppe: "intended_use",
  untergrund: "terrain",
  terrain_type: "terrain",
  terrain_types: "terrain",
  bewertung: "ratings",
  rating: "ratings",
  ratings: "ratings",
  redaktionsbewertung: "ratings",
  eignung: "suitability",
  suitability_scores: "suitability",
  performance_scores: "performance",
  fahrgefuehl: "performance",
  fahrgefühl: "performance",
  zubehoer: "accessories",
  zubehör: "accessories",
  accessories_included: "accessories",
  auszeichnungen: "awards",
  awards_prizes: "awards",
  wartung: "maintenance",
  pflege: "maintenance",
  kosten: "costs",
  laufende_kosten: "costs",
  umwelt: "environmental",
  nachhaltigkeit: "environmental",
  environmental_impact: "environmental",
  sicherheit: "safety_features",
  security: "safety_features",
  sicherheitsfeatures: "safety_features",
  geometrie: "geometry",
  geometry_data: "geometry",
  reichweite: "range_matrix",
  reichweite_matrix: "range_matrix",
  range: "range_matrix",
  range_data: "range_matrix",
  historie: "model_history",
  modellhistorie: "model_history",
  history: "model_history",
  ebike_system: "ebike_detail",
  e_bike_system: "ebike_detail",
  e_bike: "ebike",
  ebike_specs: "ebike",
  motor_akku: "ebike",
  seo_title: "meta_title",
  meta_titel: "meta_title",
  meta_title: "meta_title",
  seo_description: "meta_description",
  meta_beschreibung: "meta_description",
  meta_description: "meta_description",
  og_image: "og_image_url",
  og_bild: "og_image_url",
  keywords: "keywords",
  schlagworte: "keywords",
  verfuegbarkeit: "availability",
  verfügbarkeit: "availability",
  availability_status: "availability",
  expert_score: "expert_rating",
  expert_rating: "expert_rating",
  testnote: "expert_rating",
  gesamtwertung: "expert_rating",
  ki: "ai_summary",
  ai: "ai_summary",
  ai_analysis: "ai_summary",
  ki_analyse: "ai_summary",
  fragen: "faq",
  haeufige_fragen: "faq",
  häufige_fragen: "faq",
};

const SPEC_ALIASES: Record<string, string> = {
  rahmenmaterial: "frame_material",
  rahmen_material: "frame_material",
  frame: "frame_material",
  frame_material: "frame_material",
  material: "frame_material",
  rahmengroessen: "frame_sizes",
  rahmengrößen: "frame_sizes",
  rahmengroesse: "frame_sizes",
  frame_sizes: "frame_sizes",
  sizes: "frame_sizes",
  groessen: "frame_sizes",
  größen: "frame_sizes",
  gabel: "fork",
  fork: "fork",
  federgabel: "fork",
  gewicht: "weight_kg",
  weight: "weight_kg",
  weight_kg: "weight_kg",
  gewicht_kg: "weight_kg",
  schaltung: "drivetrain",
  schaltgruppe: "drivetrain",
  drivetrain: "drivetrain",
  groupset: "drivetrain",
  antrieb: "drivetrain",
  gaenge: "gears",
  gänge: "gears",
  gears: "gears",
  bremsen: "brakes",
  brakes: "brakes",
  brake_system: "brakes",
  laufraeder: "wheels",
  laufräder: "wheels",
  wheels: "wheels",
  wheel_size: "wheels",
  reifenmarke: "tire_brand",
  tire_brand: "tire_brand",
  reifen: "tire_size",
  reifengroesse: "tire_size",
  reifengröße: "tire_size",
  tire_size: "tire_size",
  tires: "tire_size",
  tyre_size: "tire_size",
  profil: "tire_tread",
  reifenprofil: "tire_tread",
  tire_tread: "tire_tread",
  sattel: "saddle",
  saddle: "saddle",
  lenker: "handlebar",
  handlebar: "handlebar",
  vorbau: "stem",
  stem: "stem",
  beleuchtung: "lights",
  lights: "lights",
  licht: "lights",
  gepaecktraeger: "rack",
  gepäckträger: "rack",
  rack: "rack",
  schutzbleche: "fenders",
  fenders: "fenders",
  mudguards: "fenders",
};

const EBIKE_ALIASES: Record<string, string> = {
  motor_marke: "motor_brand",
  motor_brand: "motor_brand",
  motorhersteller: "motor_brand",
  motor_modell: "motor_model",
  motor_model: "motor_model",
  motor: "motor_model",
  motor_nm: "motor_nm",
  drehmoment: "motor_nm",
  torque: "motor_nm",
  torque_nm: "motor_nm",
  motor_w: "motor_w",
  leistung: "motor_w",
  power: "motor_w",
  assist_kmh: "assist_kmh",
  unterstuetzung_bis: "assist_kmh",
  unterstützung_bis: "assist_kmh",
  support_kmh: "assist_kmh",
  akku: "battery_wh",
  akku_wh: "battery_wh",
  battery: "battery_wh",
  battery_wh: "battery_wh",
  akku_kapazitaet: "battery_wh",
  batteriekapazitaet: "battery_wh",
  removable_battery: "battery_removable",
  akku_abnehmbar: "battery_removable",
  battery_removable: "battery_removable",
  ladezeit: "charge_time_h",
  ladezeit_h: "charge_time_h",
  charge_time: "charge_time_h",
  charge_time_h: "charge_time_h",
  reichweite_eco: "range_eco_km",
  range_eco: "range_eco_km",
  range_eco_km: "range_eco_km",
  reichweite_tour: "range_tour_km",
  range_tour: "range_tour_km",
  range_tour_km: "range_tour_km",
  reichweite_turbo: "range_turbo_km",
  range_turbo: "range_turbo_km",
  range_turbo_km: "range_turbo_km",
  display: "display",
  sensor: "sensor",
};

const GEOMETRY_NUMBERS = new Set([
  "wheelbase_mm",
  "stack_mm",
  "reach_mm",
  "seat_tube_mm",
  "head_tube_mm",
  "bottom_bracket_mm",
  "frame_weight_kg",
  "max_rider_weight_kg",
]);

const SECTION_DEFS = [
  { key: "basic", label: "Grunddaten", fields: ["brand", "model", "year", "category", "bike_type", "price_eur", "manufacturer_url", "availability"] },
  { key: "content", label: "Inhalt", fields: ["excerpt", "description", "highlights", "intended_use", "terrain"] },
  { key: "media", label: "Medien", fields: ["image_url", "gallery", "og_image_url"] },
  { key: "specs", label: "Specs", fields: ["specs", "geometry", "cockpit", "wheelset", "drivetrain_detail", "brakes_detail"] },
  { key: "ebike", label: "E-Bike", fields: ["ebike", "ebike_detail", "range_matrix"] },
  { key: "ratings", label: "Bewertung", fields: ["ratings", "expert_rating", "suitability", "performance"] },
  { key: "extra", label: "Ratgeberdaten", fields: ["maintenance", "costs", "environmental", "safety_features", "accessories", "awards", "model_history", "videos", "faq", "ai_summary"] },
  { key: "seo", label: "SEO", fields: ["meta_title", "meta_description", "keywords"] },
];

function keyOf(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[äöü]/g, (m) => ({ ä: "ae", ö: "oe", ü: "ue" })[m] ?? m)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function remapKeys(input: any): any {
  if (Array.isArray(input)) return input.map(remapKeys);
  if (input && typeof input === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      const normalized = keyOf(k);
      out[ALIASES[normalized] ?? normalized] = remapKeys(v);
    }
    return out;
  }
  return input;
}

function readValue(obj: Record<string, any>, aliases: string[]): any {
  for (const alias of aliases) {
    const k = keyOf(alias);
    if (obj[k] != null && obj[k] !== "") return obj[k];
    const mapped = ALIASES[k];
    if (mapped && obj[mapped] != null && obj[mapped] !== "") return obj[mapped];
  }
  return undefined;
}

export function parseBikeNumber(value: any): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value == null || value === "") return null;
  let s = String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[€$£]|eur|euro|kg|wh|nm|w|km\/h|km|h|mm|cm/gi, "")
    .replace(/[^0-9,.-]/g, "");
  if (!s || s === "-" || s === "." || s === ",") return null;
  const comma = s.lastIndexOf(",");
  const dot = s.lastIndexOf(".");
  if (comma > -1 && dot > -1) {
    s = comma > dot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (comma > -1) {
    s = s.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function asInt(value: any): number | null {
  const n = parseBikeNumber(value);
  return n == null ? null : Math.round(n);
}

function asString(value: any): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(asString).filter(Boolean).join(", ");
  if (typeof value === "object") return "";
  return String(value).trim();
}

function asArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(asString).filter(Boolean);
  if (value == null || value === "") return [];
  if (typeof value === "object") return [];
  return String(value)
    .split(/\r?\n|;|\s\|\s|•/g)
    .flatMap((part) => (part.includes(",") ? part.split(",") : [part]))
    .map((x) => x.trim().replace(/^[-–—]\s*/, ""))
    .filter(Boolean);
}

function asObject(value: any): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function isFilled(value: any): boolean {
  if (value == null || value === "") return false;
  if (Array.isArray(value)) return value.some(isFilled);
  if (typeof value === "object") return Object.values(value).some(isFilled);
  return true;
}

function compactObject<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      const arr = v.filter(isFilled);
      if (arr.length) out[k] = arr;
    } else if (v && typeof v === "object") {
      const nested = compactObject(v);
      if (Object.keys(nested).length) out[k] = nested;
    } else if (v != null && v !== "") {
      out[k] = v;
    }
  }
  return out as T;
}

function mergeMappedGroup(source: any, aliases: Record<string, string>, numberKeys: Set<string> = new Set()): Record<string, any> {
  const input = asObject(source);
  const out: Record<string, any> = {};
  for (const [rawKey, rawValue] of Object.entries(input)) {
    const k = keyOf(rawKey);
    const mapped = aliases[k] ?? k;
    const numeric = numberKeys.has(mapped) || /(_kg|_km|_mm|_wh|_nm|_w|_h|score|rating)$/.test(mapped);
    out[mapped] = numeric ? parseBikeNumber(rawValue) : rawValue;
  }
  return compactObject(out);
}

function normalizeCategory(value: any, raw: Record<string, any>): "bike" | "ebike" | undefined {
  const s = asString(value).toLowerCase();
  if (["ebike", "e-bike", "e bike", "elektro", "elektrisch", "pedelec", "s-pedelec"].some((x) => s.includes(x))) return "ebike";
  if (["bike", "fahrrad", "rad", "bicycle", "analog"].includes(s)) return "bike";
  const hasEbikeData = isFilled(raw.ebike) || isFilled(raw.ebike_detail) || isFilled(raw.motor) || isFilled(raw.akku) || isFilled(raw.battery);
  return hasEbikeData ? "ebike" : undefined;
}

function normalizeBikeType(value: any): string {
  const s = asString(value);
  if (!s) return "";
  const normalized = keyOf(s);
  const direct = BIKE_TYPES.find((t) => keyOf(t) === normalized);
  if (direct) return direct;
  if (/city|urban|stadt|comfort/.test(normalized)) return "City";
  if (/trekking|tour|touring|reise|commuter|pendel/.test(normalized)) return "Trekking";
  if (/gravel|allroad|cross/.test(normalized)) return "Gravel";
  if (/rennrad|road|race|endurance|aero/.test(normalized)) return "Rennrad";
  if (/mtb|mountain|hardtail|fully|trail|enduro/.test(normalized)) return "Mountainbike";
  if (/cargo|lasten|longtail/.test(normalized)) return "Cargo";
  if (/falt|fold|klapp/.test(normalized)) return "Falt";
  if (/fitness|hybrid/.test(normalized)) return "Fitness";
  if (/bmx/.test(normalized)) return "BMX";
  if (/kinder|kids|child/.test(normalized)) return "Kinder";
  return s;
}

function normalizeRatingGroup(value: any): Record<string, number> {
  const group = asObject(value);
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(group)) {
    const n = parseBikeNumber(v);
    if (n == null) continue;
    out[keyOf(k)] = n > 10 && n <= 100 ? Math.round(n / 10) : Math.max(0, Math.min(10, n));
  }
  return out;
}

function normalizeFaq(value: any): { q: string; a: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return null;
      const obj = remapKeys(item) as Record<string, any>;
      const q = asString(obj.q ?? obj.question ?? obj.frage);
      const a = asString(obj.a ?? obj.answer ?? obj.antwort);
      return q && a ? { q, a } : null;
    })
    .filter(Boolean) as { q: string; a: string }[];
}

function normalizeAwards(value: any): { name: string; year?: number; source?: string }[] {
  if (!Array.isArray(value)) value = asArray(value);
  return value
    .map((item: any) => {
      if (typeof item === "string") return { name: item };
      const obj = remapKeys(item) as Record<string, any>;
      const name = asString(obj.name ?? obj.title ?? obj.award);
      return name ? { name, year: asInt(obj.year) ?? undefined, source: asString(obj.source) || undefined } : null;
    })
    .filter(Boolean) as { name: string; year?: number; source?: string }[];
}

function normalizeVideos(value: any): { url: string; title?: string }[] {
  if (!Array.isArray(value)) value = asArray(value);
  return value
    .map((item: any) => {
      if (typeof item === "string") return { url: item };
      const obj = remapKeys(item) as Record<string, any>;
      const url = asString(obj.url ?? obj.link);
      return url ? { url, title: asString(obj.title) || undefined } : null;
    })
    .filter(Boolean) as { url: string; title?: string }[];
}

function normalizeGallery(value: any): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" ? asString((remapKeys(item) as any).url ?? (remapKeys(item) as any).image_url) : asString(item)))
      .filter(Boolean);
  }
  return asArray(value);
}

function limitText(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function parseText(text: string, fileName: string): ParsedText {
  const cleaned = text.replace(/^\uFEFF/, "");
  const name = fileName.toLowerCase();
  if (name.endsWith(".json")) {
    return { raw: JSON.parse(cleaned), body: "" };
  }

  const fm = cleaned.match(/^\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (fm) return { raw: parseYaml(fm[1]) ?? {}, body: fm[2]?.trim() ?? "" };

  if (name.endsWith(".yaml") || name.endsWith(".yml")) return { raw: parseYaml(cleaned) ?? {}, body: "" };

  try {
    const parsed = parseYaml(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return { raw: parsed as Record<string, any>, body: "" };
  } catch {
    // Plain markdown without frontmatter is not enough to identify a model.
  }
  return { raw: {}, body: cleaned.trim() };
}

export function normalizeBikeImport(rawInput: Record<string, any>, body = ""): ImportedBike {
  const raw = remapKeys(rawInput);
  const media = remapKeys(raw.media ?? raw.bilder ?? raw.images ?? {}) as Record<string, any>;
  const seo = remapKeys(raw.seo ?? raw.search ?? {}) as Record<string, any>;
  const components = remapKeys(raw.components ?? raw.komponenten ?? raw.technical_specs ?? raw.specifications ?? raw.spezifikationen ?? {}) as Record<string, any>;
  const motor = remapKeys(raw.motor ?? {}) as Record<string, any>;
  const battery = remapKeys(raw.battery ?? raw.akku ?? {}) as Record<string, any>;
  const prosCons = remapKeys(raw.pros_cons ?? raw.staerken_schwaechen ?? raw.vorteile_nachteile ?? {}) as Record<string, any>;

  const specs = compactObject({
    ...mergeMappedGroup(components, SPEC_ALIASES),
    ...mergeMappedGroup(raw.specs, SPEC_ALIASES),
    ...mergeMappedGroup(raw.technical, SPEC_ALIASES),
  });
  for (const [alias, target] of Object.entries(SPEC_ALIASES)) {
    const v = raw[alias];
    if (v != null && specs[target] == null) specs[target] = /_kg$/.test(target) ? parseBikeNumber(v) : v;
  }

  const ebike = compactObject({
    ...mergeMappedGroup(raw.ebike, EBIKE_ALIASES),
    ...mergeMappedGroup(raw.e_bike, EBIKE_ALIASES),
    ...mergeMappedGroup(raw.ebike_specs, EBIKE_ALIASES),
    ...mergeMappedGroup(motor, EBIKE_ALIASES),
    ...mergeMappedGroup(battery, EBIKE_ALIASES),
  });
  for (const [alias, target] of Object.entries(EBIKE_ALIASES)) {
    const v = raw[alias];
    if (v != null && ebike[target] == null) ebike[target] = /(_km|_wh|_nm|_w|_h|kmh)$/.test(target) ? parseBikeNumber(v) : v;
  }
  if (typeof raw.motor === "string" && !ebike.motor_model) ebike.motor_model = raw.motor;
  if (typeof raw.akku === "string" && !ebike.battery_wh) ebike.battery_wh = parseBikeNumber(raw.akku);
  if (typeof raw.battery === "string" && !ebike.battery_wh) ebike.battery_wh = parseBikeNumber(raw.battery);

  const imageUrl = asString(raw.image_url ?? media.image_url ?? media.main_image ?? media.hero_image ?? media.cover_image);
  const gallery = normalizeGallery(raw.gallery ?? media.gallery ?? media.images ?? media.photos);
  const description = asString(raw.description) || body;
  const excerpt = asString(raw.excerpt) || limitText(description, 260);
  const brand = asString(raw.brand);
  const model = asString(raw.model);
  const year = asInt(raw.year);
  const bikeType = normalizeBikeType(raw.bike_type ?? raw.type ?? raw.fahrradtyp);
  const category = normalizeCategory(raw.category, { ...raw, ebike, ebike_detail: raw.ebike_detail }) ?? "bike";

  const highlights = compactObject({
    pros: asArray(raw.highlights?.pros ?? raw.pros ?? prosCons.pros ?? prosCons.staerken ?? raw.strengths),
    cons: asArray(raw.highlights?.cons ?? raw.cons ?? prosCons.cons ?? prosCons.schwaechen ?? raw.weaknesses),
  });

  const price = asInt(raw.price_eur);
  const titleBase = [brand, model, year].filter(Boolean).join(" ");
  const metaTitle = asString(raw.meta_title ?? seo.meta_title ?? seo.title) || (titleBase ? `${titleBase} — Test, Specs & Preis | radmap.de` : "");
  const metaDescription =
    asString(raw.meta_description ?? seo.meta_description ?? seo.description) ||
    limitText(excerpt || `${titleBase} mit technischen Daten, Ausstattung, Bewertung und Herstellerinformationen.`, 155);

  const out: ImportedBike = compactObject({
    slug: asString(raw.slug) || (brand && model ? bikeSlugify(brand, model, year) : ""),
    brand,
    model,
    year,
    category,
    bike_type: bikeType,
    price_eur: price,
    image_url: imageUrl || gallery[0] || "",
    gallery: gallery.filter((g) => g !== imageUrl),
    manufacturer_url: asString(raw.manufacturer_url),
    excerpt,
    description,
    highlights,
    specs,
    ebike: category === "ebike" ? ebike : {},
    ratings: normalizeRatingGroup(raw.ratings),
    intended_use: asArray(raw.intended_use),
    terrain: asArray(raw.terrain),
    meta_title: metaTitle,
    meta_description: metaDescription,
    og_image_url: asString(raw.og_image_url ?? seo.og_image_url) || imageUrl || gallery[0] || "",
    keywords: asArray(raw.keywords ?? seo.keywords),
    geometry: mergeMappedGroup(raw.geometry, {}, GEOMETRY_NUMBERS),
    cockpit: compactObject(asObject(raw.cockpit)),
    wheelset: compactObject(asObject(raw.wheelset)),
    drivetrain_detail: compactObject(asObject(raw.drivetrain_detail)),
    brakes_detail: compactObject(asObject(raw.brakes_detail)),
    ebike_detail: compactObject(asObject(raw.ebike_detail)),
    suitability: normalizeRatingGroup(raw.suitability),
    performance: normalizeRatingGroup(raw.performance),
    range_matrix: compactObject(asObject(raw.range_matrix)),
    maintenance: compactObject(asObject(raw.maintenance)),
    costs: compactObject(asObject(raw.costs)),
    environmental: compactObject(asObject(raw.environmental)),
    safety_features: compactObject(asObject(raw.safety_features)),
    accessories: asArray(raw.accessories),
    awards: normalizeAwards(raw.awards),
    model_history: compactObject(asObject(raw.model_history)),
    videos: normalizeVideos(raw.videos),
    faq: normalizeFaq(raw.faq),
    ai_summary: compactObject(asObject(raw.ai_summary)),
    availability: asString(raw.availability),
    expert_rating: parseBikeNumber(raw.expert_rating),
  });

  if (!out.keywords?.length && titleBase) {
    out.keywords = [brand, model, bikeType, category === "ebike" ? "E-Bike" : "Fahrrad"].filter(Boolean);
  }
  return out;
}

export function analyzeBikeImport(data: ImportedBike): BikeImportReport {
  const filledFields = Object.keys(data).filter((k) => isFilled(data[k]));
  const filledSections = SECTION_DEFS.map((section) => ({
    key: section.key,
    label: section.label,
    count: section.fields.filter((field) => isFilled(data[field])).length,
  })).filter((section) => section.count > 0);

  const missingImportant: string[] = [];
  if (!isFilled(data.brand)) missingImportant.push("Marke");
  if (!isFilled(data.model)) missingImportant.push("Modell");
  if (!isFilled(data.image_url)) missingImportant.push("Hauptbild");
  if (!isFilled(data.excerpt)) missingImportant.push("Kurzbeschreibung");
  if (!isFilled(data.description)) missingImportant.push("Beschreibung");
  if (!isFilled(data.specs)) missingImportant.push("Spezifikationen");
  if (data.category === "ebike" && !isFilled(data.ebike)) missingImportant.push("Motor/Akku");

  const warnings: string[] = [];
  if (data.price_eur != null && !Number.isInteger(data.price_eur)) warnings.push("Preis wurde gerundet.");
  if (data.bike_type && !BIKE_TYPES.includes(data.bike_type as any)) warnings.push(`Typ „${data.bike_type}” ist nicht in der Standardliste.`);
  if (!data.meta_title || !data.meta_description) warnings.push("SEO-Daten sind nur teilweise vorhanden.");

  const importantTotal = 8 + (data.category === "ebike" ? 1 : 0);
  const importantFilled = importantTotal - missingImportant.length;
  const densityBonus = Math.min(30, filledFields.length * 2);
  const sectionBonus = Math.min(20, filledSections.length * 3);
  const score = Math.max(0, Math.min(100, Math.round((importantFilled / importantTotal) * 50 + densityBonus + sectionBonus)));

  return { score, filledFields, filledSections, missingImportant, warnings };
}

export async function parseBikeFile(file: File): Promise<{ data: ImportedBike; report: BikeImportReport }> {
  const name = file.name.toLowerCase();
  if (!/\.(json|md|markdown|txt|ya?ml)$/.test(name)) {
    throw new Error("Unterstützt werden .json, .yaml, .yml, .md und .txt");
  }
  const text = await file.text();
  let parsed: ParsedText;
  try {
    parsed = parseText(text, file.name);
  } catch (error) {
    throw new Error(error instanceof Error ? `Datei konnte nicht gelesen werden: ${error.message}` : "Datei konnte nicht gelesen werden");
  }
  const data = normalizeBikeImport(parsed.raw, parsed.body);
  if (!data.brand || !data.model) {
    throw new Error("Die Datei enthält keinen erkennbaren Fahrrad-Datensatz. Mindestens Marke und Modell müssen vorhanden sein.");
  }
  return { data, report: analyzeBikeImport(data) };
}