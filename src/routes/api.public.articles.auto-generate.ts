import { createFileRoute } from "@tanstack/react-router";
import {
  discoverSources,
  rewriteArticle,
  generateImagePng,
  uploadImageAndGetUrl,
  ensureUniqueSlug,
  slugify,
  type DiscoveredSource,
} from "@/lib/auto-article.server";

type Category = "Nachrichten" | "Ratgeber" | "E-Bikes" | "Tests";
const ALL_CATEGORIES: Category[] = ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"];

export const Route = createFileRoute("/api/public/articles/auto-generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.ARTICLE_AUTOGEN_SECRET;
        if (!secret) return new Response("Server misconfigured", { status: 500 });
        if (request.headers.get("x-autogen-secret") !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: { category?: Category; force?: boolean; trigger?: "cron" | "manual" } = {};
        try { body = (await request.json()) as typeof body; } catch { /* empty */ }
        const categories: Category[] = body.category ? [body.category] : ALL_CATEGORIES;
        const trigger = body.trigger ?? (body.force ? "manual" : "cron");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Run row
        const { data: runRow, error: runErr } = await supabaseAdmin
          .from("article_generation_runs")
          .insert({ status: "running", trigger })
          .select("id")
          .single();
        if (runErr || !runRow) {
          return Response.json({ ok: false, error: runErr?.message ?? "run insert failed" }, { status: 500 });
        }
        const runId = runRow.id;

        let sourcesFound = 0;
        let articlesCreated = 0;
        const errors: string[] = [];

        for (const category of categories) {
          try {
            const candidates = await discoverSources(category);
            sourcesFound += candidates.length;
            if (candidates.length === 0) continue;

            // Filter out already-seen URLs
            const urls = candidates.map((c) => c.url);
            const { data: seenRows } = await supabaseAdmin
              .from("article_sources")
              .select("source_url")
              .in("source_url", urls);
            const seen = new Set((seenRows ?? []).map((r) => r.source_url));
            const fresh: DiscoveredSource[] = candidates.filter((c) => !seen.has(c.url));
            if (fresh.length === 0) continue;

            // Try candidates in order until one succeeds (or all exhausted)
            let createdForCategory = false;
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

                // Guard required fields
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

                // Generate image (failures are tolerated — article still publishes without image)
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

                // Store alt text by appending it to og_image meta? articles table has no image_alt column.
                // We persist it as part of the body_markdown image syntax if not present, but cleanest:
                // we already set og_image; alt is embedded via cover_image rendering elsewhere.
                // (Future: add image_alt column.)

                articlesCreated++;
                createdForCategory = true;
                break; // one article per category per run
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

            if (!createdForCategory) {
              // all fresh candidates exhausted or skipped — fine
            }
          } catch (e) {
            errors.push(`category ${category}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }

        const finalStatus = errors.length === 0
          ? "success"
          : articlesCreated > 0
          ? "partial"
          : "failed";

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

        return Response.json({
          ok: true,
          runId,
          status: finalStatus,
          sourcesFound,
          articlesCreated,
          errors,
        });
      },
    },
  },
});
