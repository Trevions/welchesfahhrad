// Server-only helpers for the auto-article pipeline.
// Loaded ONLY from server route handlers / server-function handlers (never client).

type Category = "Nachrichten" | "Ratgeber" | "E-Bikes" | "Tests";

export type DiscoveredSource = {
  url: string;
  title: string;
  summary: string;
  domain: string;
  published_date?: string;
};

export type RewrittenArticle = {
  skip: boolean;
  skip_reason?: string;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  category: Category;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  read_time: string;
  image_prompt: string;
  image_alt: string;
};

// ---------- Slug helpers ----------
const UMLAUT_MAP: Record<string, string> = {
  ä: "ae", ö: "oe", ü: "ue", Ä: "ae", Ö: "oe", Ü: "ue", ß: "ss",
};
export function slugify(input: string): string {
  return input
    .split("")
    .map((c) => UMLAUT_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function domainOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

// ---------- Perplexity discovery ----------
const PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions";

const SEARCH_PROMPTS: Record<Category, { system: string; user: string }> = {
  Nachrichten: {
    system: "Du findest aktuelle deutschsprachige Nachrichten rund um Fahrräder, Radverkehr, neue Gesetze (StVO, Helmpflicht, Versicherung), kommunale Radwege-Projekte und Verkehrsrecht in Deutschland.",
    user: "Liste 5 aktuelle, relevante Nachrichten der letzten 3 Tage aus Deutschland zum Thema Fahrrad, Radverkehr oder neue Gesetze/Regelungen für Radfahrer. Nur deutschsprachige Originalquellen.",
  },
  Ratgeber: {
    system: "Du findest aktuelle Anlässe für Fahrrad-Ratgeber-Themen: Saisonwechsel, Wartung, Sicherheit, Touren, Pannenhilfe, Diebstahlschutz.",
    user: "Liste 5 aktuelle Anlässe oder Trends der letzten 7 Tage für deutschsprachige Fahrrad-Ratgeber (Wartung, Sicherheit, Reise, Pannenhilfe, Winter/Sommer-Tipps).",
  },
  "E-Bikes": {
    system: "Du findest News, Produkt-Releases, Akku-/Motor-Technik und Tests rund um E-Bikes und Pedelecs auf dem deutschen Markt.",
    user: "Liste 5 aktuelle E-Bike-Nachrichten der letzten 7 Tage: neue Modelle, Akku-/Motor-Technik (Bosch, Shimano, Yamaha), Rückrufe, Marktstudien. Deutschsprachige Quellen bevorzugt.",
  },
  Tests: {
    system: "Du findest aktuelle Fahrrad- und E-Bike-Test-Veröffentlichungen großer deutscher Magazine und Verbraucherorganisationen.",
    user: "Liste 5 aktuelle Fahrrad- oder E-Bike-Tests der letzten 14 Tage (Stiftung Warentest, ADAC, ADFC, Fachmagazine). Deutsch.",
  },
};

export async function discoverSources(category: Category): Promise<DiscoveredSource[]> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY missing");

  const { system, user } = SEARCH_PROMPTS[category];

  const resp = await fetch(PERPLEXITY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: system + " Antworte ausschließlich mit gültigem JSON nach dem vorgegebenen Schema." },
        { role: "user", content: user },
      ],
      search_recency_filter: "week",
      response_format: {
        type: "json_schema",
        json_schema: {
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    url: { type: "string" },
                    summary: { type: "string" },
                    published_date: { type: "string" },
                  },
                  required: ["title", "url", "summary"],
                },
              },
            },
            required: ["items"],
          },
        },
      },
      max_tokens: 1500,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Perplexity ${resp.status}: ${t.slice(0, 300)}`);
  }
  const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "";
  let parsed: { items?: DiscoveredSource[] } = {};
  try { parsed = JSON.parse(content); } catch { /* swallow */ }
  const items = parsed.items ?? [];
  return items
    .filter((it) => it.url && it.title)
    .filter((it) => !it.url.includes("radmap.de"))
    .map((it) => ({ ...it, domain: domainOf(it.url) }));
}

// ---------- AI rewrite via Lovable AI Gateway ----------
const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1";

export async function rewriteArticle(
  source: DiscoveredSource,
  category: Category,
): Promise<RewrittenArticle> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const system = `Du bist Senior-Redakteur:in bei radmap.de, einem deutschen Fahrrad-Magazin.
DEINE AUFGABE: Aus einem Quell-Titel und einer kurzen Zusammenfassung einen vollständigen, eigenständigen deutschsprachigen Artikel schreiben.

HARTE REGELN:
1. NIEMALS wörtlich aus der Quelle übernehmen. Komplett neu formuliert.
2. NIEMALS die Original-Publikation oder Medien-Quelle namentlich erwähnen ("laut X-Magazin", "wie X berichtet", "im Interview mit X-Redaktion"). Marken, Hersteller und Firmennamen (z. B. Bosch, Cube, Shimano, Canyon) DÜRFEN und SOLLEN genannt werden, wenn sie zur Sache gehören – sie sind keine Medien.
3. Skip NUR wenn der Artikel ausdrücklich als "exklusiv für [Magazin XY] geschrieben" o.ä. ausgewiesen ist, also untrennbar an eine Medien-Marke gebunden ist (z. B. exklusives Magazin-Interview als alleiniger Inhalt). Produkt-News, Tests, Releases und Hersteller-Ankündigungen sind NICHT zu skippen.
4. Tonalität: faktisch, präzise, leicht journalistisch, deutsche Leser:innen.
5. SEO-First: Titel ≤ 60 Zeichen, Meta-Description 140–155 Zeichen, body_markdown 600–900 Wörter, klare H2/H3-Struktur, gerne Listen.
6. seo_keywords: 5–8 kommagetrennte deutsche Long-Tail-Keywords.
7. image_alt: 80–120 Zeichen, beschreibend, mit Haupt-Keyword (kein Stuffing).
8. image_prompt: detaillierter englischer Prompt für ein fotorealistisches Header-Bild (kein Text im Bild, keine Logos im Bild). Produkt-/Markenkontext im Bildmotiv ist okay, aber keine eingeblendeten Logos/Schriftzüge.
9. read_time: "X min" basierend auf ~200 Wörtern/min.
10. slug: kurz, deutsch (Umlaute aufgelöst), keine Sonderzeichen.

WICHTIG: Wenn skip=false, MÜSSEN alle Felder (slug, title, excerpt, body_markdown, category, seo_title, seo_description, seo_keywords, read_time, image_prompt, image_alt) vollständig ausgefüllt sein. Wenn skip=true, fülle die anderen Felder mit Leerstring "".

Liefere AUSSCHLIESSLICH gültiges JSON.`;

  const userInput = `Kategorie: ${category}
Quell-Titel: ${source.title}
Quell-Zusammenfassung: ${source.summary}
Quell-Domain (NUR zur Info, NICHT erwähnen): ${source.domain}`;

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
        { role: "user", content: userInput },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "article",
          schema: {
            type: "object",
            properties: {
              skip: { type: "boolean" },
              skip_reason: { type: "string" },
              slug: { type: "string" },
              title: { type: "string" },
              excerpt: { type: "string" },
              body_markdown: { type: "string" },
              category: { type: "string", enum: ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"] },
              seo_title: { type: "string" },
              seo_description: { type: "string" },
              seo_keywords: { type: "string" },
              read_time: { type: "string" },
              image_prompt: { type: "string" },
              image_alt: { type: "string" },
            },
            required: ["skip", "slug", "title", "excerpt", "body_markdown", "category", "seo_title", "seo_description", "seo_keywords", "read_time", "image_prompt", "image_alt"],
          },
        },
      },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI rewrite ${resp.status}: ${t.slice(0, 300)}`);
  }
  const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  const out = JSON.parse(content) as RewrittenArticle;
  // Ensure slug is safe
  if (out.slug) out.slug = slugify(out.slug);
  else if (out.title) out.slug = slugify(out.title);
  return out;
}

// ---------- Image generation (Nano Banana) ----------
export async function generateImagePng(prompt: string): Promise<Uint8Array> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const resp = await fetch(`${LOVABLE_AI}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: `${prompt}. Photorealistic editorial photography, natural lighting, 16:9 aspect, magazine quality. No text, no logos, no watermarks, no brand names.`,
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Image gen ${resp.status}: ${t.slice(0, 300)}`);
  }
  const json = (await resp.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image gen returned no b64_json");

  // base64 → Uint8Array
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}

// ---------- Upload to article-images bucket, return long-lived signed URL ----------
const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;

export async function uploadImageAndGetUrl(
  slug: string,
  png: Uint8Array,
): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const path = `auto/${Date.now()}-${slug}.png`;
  const { error } = await supabaseAdmin.storage
    .from("article-images")
    .upload(path, png, { contentType: "image/png", upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data, error: urlErr } = await supabaseAdmin.storage
    .from("article-images")
    .createSignedUrl(path, TEN_YEARS_SECONDS);
  if (urlErr || !data?.signedUrl) throw new Error(`Signed URL failed: ${urlErr?.message}`);
  return data.signedUrl;
}

// ---------- Ensure unique slug ----------
export async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let slug = baseSlug;
  let i = 2;
  for (;;) {
    const { data } = await supabaseAdmin
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${baseSlug}-${i++}`;
    if (i > 50) return `${baseSlug}-${Date.now()}`;
  }
}

// ---------- Orchestrator (in-process) ----------
const ALL_CATEGORIES: Category[] = ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"];

export type RunAutoGenerateInput = {
  category?: Category;
  trigger?: "cron" | "manual";
};

export type RunAutoGenerateResult = {
  ok: true;
  runId: string;
  status: "success" | "partial" | "failed";
  sourcesFound: number;
  articlesCreated: number;
  errors: string[];
};

export async function runAutoGeneratePipeline(
  input: RunAutoGenerateInput = {},
): Promise<RunAutoGenerateResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const categories: Category[] = input.category ? [input.category] : ALL_CATEGORIES;
  const trigger = input.trigger ?? "manual";

  const { data: runRow, error: runErr } = await supabaseAdmin
    .from("article_generation_runs")
    .insert({ status: "running", trigger })
    .select("id")
    .single();
  if (runErr || !runRow) throw new Error(runErr?.message ?? "run insert failed");
  const runId = runRow.id as string;

  let sourcesFound = 0;
  let articlesCreated = 0;
  const errors: string[] = [];

  for (const category of categories) {
    try {
      const candidates = await discoverSources(category);
      sourcesFound += candidates.length;
      if (candidates.length === 0) continue;

      const urls = candidates.map((c) => c.url);
      const { data: seenRows } = await supabaseAdmin
        .from("article_sources")
        .select("source_url")
        .in("source_url", urls);
      const seen = new Set((seenRows ?? []).map((r) => r.source_url));
      const fresh: DiscoveredSource[] = candidates.filter((c) => !seen.has(c.url));
      if (fresh.length === 0) continue;

      for (const source of fresh.slice(0, 3)) {
        try {
          const rewritten = await rewriteArticle(source, category);

          if (rewritten.skip) {
            await supabaseAdmin.from("article_sources").insert({
              source_url: source.url,
              source_title: source.title,
              source_domain: source.domain,
              category,
              status: "skipped_brand_mention",
              skip_reason: rewritten.skip_reason ?? "Brand-dependent story",
            });
            continue;
          }

          if (!rewritten.title || !rewritten.body_markdown || !rewritten.excerpt) {
            await supabaseAdmin.from("article_sources").insert({
              source_url: source.url,
              source_title: source.title,
              source_domain: source.domain,
              category,
              status: "failed",
              skip_reason: "AI returned incomplete article",
            });
            continue;
          }

          const baseSlug = rewritten.slug || slugify(rewritten.title);
          const slug = await ensureUniqueSlug(baseSlug);

          let coverImage: string | null = null;
          try {
            const png = await generateImagePng(rewritten.image_prompt || rewritten.title);
            coverImage = await uploadImageAndGetUrl(slug, png);
          } catch (e) {
            errors.push(`image (${category}): ${e instanceof Error ? e.message : String(e)}`);
          }

          const articleCategory = (["Nachrichten", "Ratgeber", "E-Bikes", "Tests"] as const).includes(
            rewritten.category as Category,
          )
            ? rewritten.category
            : category;

          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("articles")
            .insert({
              slug,
              title: rewritten.title.slice(0, 200),
              excerpt: rewritten.excerpt.slice(0, 500),
              body: rewritten.body_markdown,
              cover_image: coverImage,
              category: articleCategory,
              source: "Radmap Redaktion",
              status: "published",
              read_time: rewritten.read_time?.slice(0, 20) ?? null,
              seo_title: rewritten.seo_title?.slice(0, 70) ?? null,
              seo_description: rewritten.seo_description?.slice(0, 170) ?? null,
              seo_keywords: rewritten.seo_keywords?.slice(0, 300) ?? null,
              og_image: coverImage,
              published_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (insErr || !inserted) {
            errors.push(`insert (${category}): ${insErr?.message ?? "unknown"}`);
            await supabaseAdmin.from("article_sources").insert({
              source_url: source.url,
              source_title: source.title,
              source_domain: source.domain,
              category,
              status: "failed",
              skip_reason: insErr?.message?.slice(0, 300) ?? "Insert failed",
            });
            continue;
          }

          await supabaseAdmin.from("article_sources").insert({
            article_id: inserted.id,
            source_url: source.url,
            source_title: source.title,
            source_domain: source.domain,
            category,
            status: "processed",
          });

          articlesCreated++;
          break;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`rewrite (${category}): ${msg}`);
          await supabaseAdmin.from("article_sources").insert({
            source_url: source.url,
            source_title: source.title,
            source_domain: source.domain,
            category,
            status: "failed",
            skip_reason: msg.slice(0, 300),
          });
        }
      }
    } catch (e) {
      errors.push(`category ${category}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const finalStatus: "success" | "partial" | "failed" =
    errors.length === 0 ? "success" : articlesCreated > 0 ? "partial" : "failed";

  await supabaseAdmin
    .from("article_generation_runs")
    .update({
      status: finalStatus,
      sources_found: sourcesFound,
      articles_created: articlesCreated,
      errors_count: errors.length,
      error_summary: errors.length ? errors.join("\n").slice(0, 4000) : null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);

  return { ok: true, runId, status: finalStatus, sourcesFound, articlesCreated, errors };
}
