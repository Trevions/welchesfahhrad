export type BikeCategory = "bike" | "ebike";

export const BIKE_TYPES = [
  "City",
  "Trekking",
  "Gravel",
  "Rennrad",
  "Mountainbike",
  "Cargo",
  "Falt",
  "Fitness",
  "BMX",
  "Kinder",
] as const;
export type BikeType = (typeof BIKE_TYPES)[number];

export type BikeSpecs = {
  frame_material?: string;
  frame_sizes?: string;
  fork?: string;
  weight_kg?: number;
  drivetrain?: string;
  gears?: string;
  brakes?: string;
  wheels?: string;
  tire_brand?: string;
  tire_size?: string;
  tire_tread?: string;
  saddle?: string;
  handlebar?: string;
  stem?: string;
  lights?: string;
  rack?: string;
  fenders?: string;
};

export type BikeEbike = {
  motor_brand?: string;
  motor_model?: string;
  motor_nm?: number;
  motor_w?: number;
  battery_wh?: number;
  battery_removable?: boolean;
  range_eco_km?: number;
  range_tour_km?: number;
  range_turbo_km?: number;
  charge_time_h?: number;
  assist_kmh?: number;
  display?: string;
  sensor?: string;
};

export type BikeRatings = {
  comfort?: number;
  drivetrain?: number;
  brakes?: number;
  equipment?: number;
  value?: number;
  overall?: number;
};

export type BikeHighlights = { pros: string[]; cons: string[] };

export type BikeGeometry = {
  wheelbase_mm?: number;
  stack_mm?: number;
  reach_mm?: number;
  seat_tube_mm?: number;
  head_tube_mm?: number;
  bottom_bracket_mm?: number;
  frame_weight_kg?: number;
  max_rider_weight_kg?: number;
};

export type BikeSuitability = Partial<{
  beginner: number;
  intermediate: number;
  pro: number;
  commuting: number;
  touring: number;
  gravel: number;
  mountain: number;
  bikepacking: number;
  city: number;
  family: number;
  cargo: number;
  racing: number;
}>;

export type BikePerformance = Partial<{
  comfort: number;
  handling: number;
  cornering: number;
  stability: number;
  acceleration: number;
  climbing: number;
  descending: number;
  offroad: number;
  city: number;
  longdistance: number;
  sportiness: number;
  suspension: number;
}>;

export type BikeFaq = { q: string; a: string };
export type BikeAward = { name: string; year?: number; source?: string };
export type BikeVideo = { url: string; title?: string };

export type BikeAiSummary = {
  strengths?: string[];
  weaknesses?: string[];
  best_for?: string;
  avoid_if?: string;
  alternatives?: string[];
};

export type Bike = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  category: BikeCategory;
  bike_type: string | null;
  price_eur: number | null;
  price_date: string | null;
  image_url: string | null;
  gallery: string[];
  manufacturer_url: string | null;
  excerpt: string | null;
  description: string | null;
  highlights: BikeHighlights;
  specs: BikeSpecs;
  ebike: BikeEbike | null;
  ratings: BikeRatings;
  intended_use: string[];
  terrain: string[];
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  keywords: string[];
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Extended fields
  geometry: BikeGeometry;
  cockpit: Record<string, any>;
  wheelset: Record<string, any>;
  drivetrain_detail: Record<string, any>;
  brakes_detail: Record<string, any>;
  ebike_detail: Record<string, any>;
  suitability: BikeSuitability;
  performance: BikePerformance;
  range_matrix: Record<string, any>;
  maintenance: Record<string, any>;
  costs: Record<string, any>;
  environmental: Record<string, any>;
  safety_features: Record<string, any>;
  accessories: string[];
  awards: BikeAward[];
  model_history: Record<string, any>;
  videos: BikeVideo[];
  faq: BikeFaq[];
  ai_summary: BikeAiSummary;
  availability: string | null;
  expert_rating: number | null;
};

export function bikeSlugify(brand: string, model: string, year?: number | null): string {
  const base = `${brand} ${model} ${year ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[äöü]/g, (m) => ({ ä: "ae", ö: "oe", ü: "ue" })[m] ?? m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return base || "fahrrad";
}
