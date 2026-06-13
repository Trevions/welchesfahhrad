import { createFileRoute } from "@tanstack/react-router";

type Category = "Nachrichten" | "Ratgeber" | "E-Bikes" | "Tests";

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

        const { runAutoGeneratePipeline } = await import("@/lib/auto-article.server");
        try {
          const result = await runAutoGeneratePipeline({
            category: body.category,
            trigger: body.trigger ?? (body.force ? "manual" : "cron"),
          });
          return Response.json(result);
        } catch (e) {
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : String(e) },
            { status: 500 },
          );
        }
      },
    },
  },
});
