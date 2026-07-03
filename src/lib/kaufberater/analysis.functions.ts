import { createServerFn } from "@tanstack/react-start";
import { KaufberaterInputSchema, type AiAnalysis, type BikeFitScore } from "./types";
import { calculateRecommendation } from "./calculations";
import { scoreCandidates } from "./geometry";

const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1";

type BikeRow = {
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  price_eur: number | null;
  bike_type: string | null;
  category: string;
  excerpt: string | null;
  image_url: string | null;
  availability: string | null;
  geometry: { reach_mm?: number | null; stack_mm?: number | null } | null;
};

async function loadCandidateBikes(bikeType: string, budget: number): Promise<BikeRow[]> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const isEbike = bikeType.startsWith("e-") || bikeType === "cargo";
    const { data } = await sb
      .from("bikes")
      .select("slug, brand, model, year, price_eur, bike_type, category, excerpt, image_url, availability, geometry")
      .eq("published", true)
      .eq("category", isEbike ? "ebike" : "bike")
      .lte("price_eur", Math.round(budget * 1.15))
      .gte("price_eur", Math.round(budget * 0.5))
      .order("price_eur", { ascending: false })
      .limit(24);
    return (data as BikeRow[]) ?? [];
  } catch {
    return [];
  }
}

export const analyzeKaufberater = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => KaufberaterInputSchema.parse(input))
  .handler(async ({ data }) => {
    const calc = calculateRecommendation(data);
    const candidates = await loadCandidateBikes(data.bikeType, data.budgetEur);
    const scored: BikeFitScore[] = scoreCandidates(candidates, calc);
    const topScored = scored.slice(0, 8);

    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { calc, analysis: null as AiAnalysis | null, scoredCandidates: topScored };
    }

    const bikeTypeLabel: Record<string, string> = {
      road: "Rennrad",
      gravel: "Gravel",
      "mtb-hardtail": "MTB Hardtail",
      "mtb-fully": "MTB Fully",
      "e-mtb": "E-MTB",
      trekking: "Trekking",
      "e-trekking": "E-Trekking",
      city: "City",
      "e-city": "E-City",
      cargo: "Lastenrad",
    };

    const system = `Du bist Senior-Kaufberater:in bei radmap.de, dem größten deutschen Fahrrad-Magazin. Deine Kaufberatung ist präzise, ehrlich und faktenbasiert. Kein Marketing-Sprech, keine Übertreibungen. Antworte AUSSCHLIESSLICH in gültigem JSON nach dem Schema.

REGELN:
- Nenne KEINE Marken/Modelle, die NICHT in der übergebenen Kandidaten-Liste stehen — außer als generische Marken-Kategorie ("etablierte Trekking-Marken wie Cube, Kalkhoff, Riese & Müller").
- Bei topPicks: verwende NUR Räder aus der Kandidaten-Liste (mit slug). Wenn die Liste leer ist, nutze generische Kategorie-Empfehlungen ohne slug.
- Alle Berechnungen sind bereits gemacht und werden dir gegeben — deine Aufgabe ist die menschliche Interpretation und Begründung.
- Sprache: klares, sachliches Deutsch. Sätze kurz. Keine Emojis.
- Bei Grenzfall-Rahmengröße: erkläre klar, wann kleiner (sportlich, wendig) vs größer (komfortabel, ruhig) sinnvoll ist.
- Warnungen konkret machen — Zahlen und Konsequenzen, nicht "achte auf Qualität".`;

    const user = JSON.stringify({
      profil: {
        koerpergroesse_cm: data.bodyHeightCm,
        schrittlaenge_cm: data.inseamCm,
        gewicht_kg: data.weightKg,
        alter: data.age,
        geschlecht: data.gender,
        flexibilitaet_1_5: data.flexibility,
      },
      wunsch: {
        radtyp: bikeTypeLabel[data.bikeType] ?? data.bikeType,
        einsatz: data.use,
        wochen_km: data.weeklyKm,
        gelaende: data.terrain,
        untergrund_pct: { asphalt: data.surfaceAsphaltPct, schotter: data.surfaceGravelPct, trail: data.surfaceTrailPct },
        budget_eur: data.budgetEur,
        must_have: data.mustHave,
        prioritaeten: data.priorities,
        e_bike: {
          motor_praeferenz: data.motorPref,
          gewuenschte_reichweite_km: data.desiredRangeKm,
          unterstuetzung: data.supportLevel,
        },
      },
      berechnung: calc,
      kandidaten_aus_datenbank: topScored.map((c) => ({
        slug: c.slug,
        marke: c.brand,
        modell: c.model,
        jahr: c.year,
        preis_eur: c.price_eur,
        typ: c.bike_type,
        kurz: c.excerpt,
        fit_score: c.fitScore,
        delta_reach_mm: c.deltaReachMm,
        delta_stack_mm: c.deltaStackMm,
        verfuegbarkeit: c.availability,
      })),
    });

    try {
      const resp = await fetch(`${LOVABLE_AI}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "kaufberatung",
              schema: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  frameRecommendation: { type: "string" },
                  alternativeSizes: { type: "string" },
                  topPicks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        slug: { type: "string" },
                        label: { type: "string" },
                        reason: { type: "string" },
                        priceHint: { type: "string" },
                      },
                      required: ["label", "reason"],
                    },
                  },
                  warnings: { type: "array", items: { type: "string" } },
                  checklistBeforeBuy: { type: "array", items: { type: "string" } },
                  financing: { type: "string" },
                },
                required: [
                  "summary",
                  "frameRecommendation",
                  "alternativeSizes",
                  "topPicks",
                  "warnings",
                  "checklistBeforeBuy",
                ],
              },
            },
          },
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        return {
          calc,
          analysis: null,
          scoredCandidates: topScored,
          error: `KI-Analyse nicht verfügbar (${resp.status}). Alle Berechnungen unten sind korrekt und nutzbar.${resp.status === 402 ? " Credits erschöpft." : resp.status === 429 ? " Rate-Limit — kurz warten und erneut versuchen." : ""}`,
          _debug: t.slice(0, 200),
        };
      }

      const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content ?? "{}";
      const analysis = JSON.parse(content) as AiAnalysis;

      // topPicks slugs gegen candidates validieren
      const allowed = new Set(candidates.map((c) => c.slug));
      analysis.topPicks = (analysis.topPicks ?? []).map((p) => ({
        ...p,
        slug: p.slug && allowed.has(p.slug) ? p.slug : null,
      }));

      return { calc, analysis, scoredCandidates: topScored };
    } catch (e) {
      return {
        calc,
        analysis: null,
        scoredCandidates: topScored,
        error: `KI-Analyse fehlgeschlagen: ${(e as Error).message.slice(0, 120)}`,
      };
    }
  });
