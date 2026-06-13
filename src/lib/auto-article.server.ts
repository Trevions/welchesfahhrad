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
  key_facts: string[];
};

// ---------- Firecrawl: scrape full source article ----------
export type ScrapedSource = { text: string; wordCount: number };

export async function fetchSourceArticle(url: string): Promise<ScrapedSource> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY missing");

  const resp = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 30000,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Firecrawl ${resp.status}: ${t.slice(0, 200)}`);
  }
  const json = (await resp.json()) as {
    data?: { markdown?: string };
    markdown?: string;
  };
  const md = (json.data?.markdown ?? json.markdown ?? "").trim();
  const wordCount = md ? md.split(/\s+/).length : 0;
  return { text: md, wordCount };
}

// ---------- Anti-hallucination validation ----------
const ENTITY_STOPWORDS = new Set([
  "Der","Die","Das","Ein","Eine","Einer","Eines","Einem","Den","Dem","Des",
  "Und","Oder","Aber","Nicht","Auch","Noch","Schon","Sehr","Mehr","Hier","Dort",
  "Wie","Was","Wer","Wo","Wann","Warum","Bei","Mit","Von","Aus","Auf","In","Im",
  "Zu","Zum","Zur","Für","Gegen","Über","Unter","Nach","Vor","Seit","Während",
  "Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag",
  "Januar","Februar","März","April","Mai","Juni","Juli","August","September",
  "Oktober","November","Dezember","Heute","Gestern","Morgen","Jahr","Jahre","Tag","Tage",
  "Radmap","Nachrichten","Ratgeber","Tests","Foto","Fotos","Bild","Quelle","Redaktion",
]);

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractProperNouns(text: string): string[] {
  const clean = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`\[\]()]/g, " ");
  const matches = clean.match(
    /\b[A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9-]+(?:\s+(?:de|van|von|der|den|le|la|du)\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9-]+|\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9-]+){0,3}\b/g,
  ) ?? [];
  const out = new Set<string>();
  for (const m of matches) {
    const first = m.split(/\s+/)[0];
    if (ENTITY_STOPWORDS.has(first)) continue;
    if (m.length < 3) continue;
    out.add(m.trim());
  }
  return [...out];
}

export type ValidationResult = {
  ok: boolean;
  missingEntities: string[];
  missingFacts: string[];
};

export function validateAgainstSource(
  rewritten: Pick<RewrittenArticle, "title" | "body_markdown" | "key_facts">,
  sourceText: string,
): ValidationResult {
  const haystack = normalizeForMatch(sourceText);
  const generated = `${rewritten.title}\n\n${rewritten.body_markdown}`;
  const entities = extractProperNouns(generated);

  const missingEntities: string[] = [];
  for (const e of entities) {
    if (!haystack.includes(normalizeForMatch(e))) missingEntities.push(e);
  }

  const missingFacts: string[] = [];
  const factStop = new Set(["dass","auch","sich","sind","wird","wurde","haben","einen","einem","einer","oder","aber","nicht","sehr","mehr"]);
  for (const fact of rewritten.key_facts ?? []) {
    const first = (fact || "").split(/[.!?]/)[0].trim();
    if (first.length < 8) continue;
    const tokens = normalizeForMatch(first)
      .split(" ")
      .filter((t) => t.length >= 4 && !factStop.has(t));
    if (tokens.length < 4) continue;
    const hits = tokens.filter((t) => haystack.includes(t)).length;
    if (hits / tokens.length < 0.6) missingFacts.push(fact.slice(0, 120));
  }

  const ok = missingEntities.length <= 2 && missingFacts.length === 0;
  return { ok, missingEntities, missingFacts };
}

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
  sourceText: string,
): Promise<RewrittenArticle> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const system = `Du bist Senior-Redakteur:in bei radmap.de, einem deutschen Fahrrad-Magazin.

DEINE EINZIGE INFORMATIONSQUELLE ist der unten gelieferte Quelltext (QUELLTEXT). Schreibe einen eigenständigen deutschen Artikel, der AUSSCHLIESSLICH Fakten aus diesem Quelltext verwendet.

ABSOLUT VERBOTEN:
- Erfinden von Namen, Teams, Ergebnissen, Zeiten, Orten, Daten oder Zitaten, die NICHT im Quelltext stehen.
- Spekulative taktische Analysen ("die Mannschaft kontrollierte das Tempo…") wenn das nicht im Quelltext steht.
- Prognosen oder Ausblicke auf zukünftige Rennen, Saisonverlauf, Form, Tour de France usw., außer sie stehen WÖRTLICH im Quelltext.
- Generische Sportblog-Phrasen wie "ein positives Signal", "wertvolle Daten zur Formkurve", "gut aufgestellt für die großen Rundfahrten".
- Wenn ein Fakt nicht im Quelltext steht → weglassen. Lieber kurz und korrekt als lang und ausgedacht.

PFLICHT:
1. Jeder Name (Fahrer, Team, Ort, Veranstaltung) MUSS wörtlich im Quelltext vorkommen.
2. Komplett neue Formulierungen — niemals wörtlich aus dem Quelltext kopieren.
3. Tonalität: sachlich, präzise, journalistisch (Nachrichtenstil), keine Werbung, keine Emotion.
4. Länge body_markdown: 350–550 Wörter. Wenn die Quelle nur 200 Wörter Fakten hergibt, schreibe lieber 350 als gestreckte 550.
5. Struktur: 2–4 H2-Überschriften, kurze Absätze, gerne 1 Liste mit echten Fakten.
6. NIEMALS Medien-Quellen namentlich nennen ("laut Magazin XY"). Marken/Hersteller (Bosch, Shimano, Canyon usw.) DÜRFEN genannt werden, wenn sie im Quelltext stehen.
7. SEO: seo_title ≤ 60 Zeichen, seo_description 140–155 Zeichen, seo_keywords 5–8 deutsche Long-Tail.
8. image_prompt: detaillierter ENGLISCHER Prompt für ein fotorealistisches Header-Bild zum Thema. Keine Logos, keine eingeblendete Schrift.
9. image_alt: 80–120 Zeichen, beschreibend.
10. read_time: "X min" basierend auf ~200 Wörtern/min.
11. slug: kurz, deutsch (Umlaute aufgelöst), keine Sonderzeichen.
12. key_facts: 5–10 kurze deutsche Stichpunkte mit den wichtigsten überprüfbaren Fakten, die du aus dem QUELLTEXT entnommen hast (Namen, Zahlen, Orte). JEDER Stichpunkt MUSS sich im Quelltext nachweisen lassen.

SKIP-REGEL:
- skip=true NUR wenn der Quelltext keine sachliche Berichterstattung enthält (z. B. nur ein Magazin-Inhaltsverzeichnis, ein Paywall-Anriss von < 100 Wörtern Fakten, ein reines Interview, das ohne Medien-Marke nicht funktioniert) ODER wenn das Thema nichts mit Fahrrad/Radsport/E-Bike/Radverkehr zu tun hat.
- Bei skip=true → alle anderen Felder mit Leerstring "" bzw. key_facts mit [].

Liefere AUSSCHLIESSLICH gültiges JSON nach dem vorgegebenen Schema.`;

  // Trim source text to keep prompt within sensible limits
  const trimmedSource = sourceText.length > 18000 ? sourceText.slice(0, 18000) + "\n...[gekürzt]" : sourceText;

  const userInput = `Kategorie: ${category}
Quell-Domain (NUR zur Info, NICHT erwähnen): ${source.domain}
Quell-URL: ${source.url}

QUELLTEXT (deine einzige Faktengrundlage):
"""
${trimmedSource}
"""`;

  const resp = await fetch(`${LOVABLE_AI}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
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
              key_facts: { type: "array", items: { type: "string" } },
            },
            required: ["skip", "slug", "title", "excerpt", "body_markdown", "category", "seo_title", "seo_description", "seo_keywords", "read_time", "image_prompt", "image_alt", "key_facts"],
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
  if (out.slug) out.slug = slugify(out.slug);
  else if (out.title) out.slug = slugify(out.title);
  if (!Array.isArray(out.key_facts)) out.key_facts = [];
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
          // 1) Scrape full source text — no scrape, no article.
          let scraped: ScrapedSource;
          try {
            scraped = await fetchSourceArticle(source.url);
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await supabaseAdmin.from("article_sources").insert({
              source_url: source.url,
              source_title: source.title,
              source_domain: source.domain,
              category,
              status: "failed",
              skip_reason: `scrape failed: ${msg.slice(0, 240)}`,
            });
            continue;
          }

          if (scraped.wordCount < 120) {
            await supabaseAdmin.from("article_sources").insert({
              source_url: source.url,
              source_title: source.title,
              source_domain: source.domain,
              category,
              status: "failed",
              scraped_text: scraped.text || null,
              skip_reason: `source too short (${scraped.wordCount} words) — refusing to fabricate`,
            });
            continue;
          }

          // 2) Rewrite using ONLY the scraped text.
          const rewritten = await rewriteArticle(source, category, scraped.text);

          if (rewritten.skip) {
            await supabaseAdmin.from("article_sources").insert({
              source_url: source.url,
              source_title: source.title,
              source_domain: source.domain,
              category,
              status: "skipped_brand_mention",
              scraped_text: scraped.text,
              skip_reason: rewritten.skip_reason ?? "Not suitable for rewrite",
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
              scraped_text: scraped.text,
              skip_reason: "AI returned incomplete article",
            });
            continue;
          }

          // 3) Validate generated text against the source — block hallucinations.
          const validation = validateAgainstSource(rewritten, scraped.text);
          if (!validation.ok) {
            const reason = `hallucination detected — missing entities: [${validation.missingEntities.slice(0, 6).join(", ")}]; missing facts: [${validation.missingFacts.slice(0, 3).join(" | ")}]`;
            await supabaseAdmin.from("article_sources").insert({
              source_url: source.url,
              source_title: source.title,
              source_domain: source.domain,
              category,
              status: "failed",
              scraped_text: scraped.text,
              skip_reason: reason.slice(0, 500),
            });
            errors.push(`validation (${category}): ${reason.slice(0, 200)}`);
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
            scraped_text: scraped.text,
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
