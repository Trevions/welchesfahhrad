import { createFileRoute } from "@tanstack/react-router";

function cleanPath(value: string | null): string | null {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value).replace(/^\/+/, "");
    if (!decoded || decoded.includes("..") || decoded.includes("\\")) return null;
    return decoded;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/article-image/$path")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = cleanPath(params.path);
        if (!path) return new Response("Bad image path", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("article-images").download(path);
        if (error || !data) return new Response("Image not found", { status: 404 });

        const headers = new Headers();
        headers.set("Content-Type", data.type || "image/jpeg");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        return new Response(data, { headers });
      },
    },
  },
});