import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Called by a Postgres AFTER INSERT/UPDATE trigger on public.lexikon_terms
// via pg_net. Fires IndexNow (Bing/Yandex/Seznam) + resubmits the sitemap
// to Google Search Console so new/edited Lexikon entries get re-crawled
// automatically — no manual action from the editor required.
//
// Under /api/public/* so pg_net can hit it without auth on the published
// site. Effect is idempotent (re-pings a URL is harmless), so we don't
// gate on a shared secret; we do validate input shape and rate-limit
// implicitly via IndexNow's own dedupe.

const bodySchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  event: z.enum(["created", "updated", "deleted"]).optional(),
});

export const Route = createFileRoute("/api/public/hooks/lexikon-changed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        const parsed = bodySchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
        }
        try {
          const { notifyLexikonChange } = await import("@/lib/indexnow.server");
          await notifyLexikonChange(parsed.data.slug);
        } catch (e) {
          console.error("[lexikon-changed] notify failed", e);
          return Response.json({ ok: false, error: "notify_failed" }, { status: 500 });
        }
        return Response.json({ ok: true, slug: parsed.data.slug });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
    },
  },
});
