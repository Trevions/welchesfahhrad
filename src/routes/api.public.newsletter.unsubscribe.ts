import { createFileRoute } from "@tanstack/react-router";

// RFC 8058 One-Click Unsubscribe endpoint.
// Used by the `List-Unsubscribe` / `List-Unsubscribe-Post` headers so that
// Gmail/Outlook/Apple Mail "Abmelden" buttons can unsubscribe with a single POST,
// without the user ever leaving their inbox.
//
// Also supports GET, which redirects to the branded confirmation page
// (`/newsletter/abmelden?token=...`) so that human clicks on the visible link
// land on a styled page that requires an explicit confirmation — this prevents
// mail-scanners / link-prefetchers from accidentally unsubscribing users.

export const Route = createFileRoute("/api/public/newsletter/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? "";
        const target = `https://welchesfahrrad.de/newsletter/abmelden?token=${encodeURIComponent(token)}`;
        return new Response(null, { status: 302, headers: { Location: target } });
      },

      POST: async ({ request }) => {
        let token = "";
        const contentType = request.headers.get("content-type") ?? "";
        try {
          if (contentType.includes("application/json")) {
            const body = (await request.json()) as { token?: string };
            token = typeof body?.token === "string" ? body.token : "";
          } else {
            const form = await request.formData();
            token = String(form.get("token") ?? "");
          }
        } catch {
          // ignore — fall through to URL param
        }
        if (!token) {
          token = new URL(request.url).searchParams.get("token") ?? "";
        }

        if (!token || token.length < 20 || token.length > 200) {
          return new Response("Invalid token", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin
          .from("newsletter_subscribers")
          .select("id, status")
          .eq("unsubscribe_token", token)
          .maybeSingle();

        if (!row) return new Response("Invalid token", { status: 404 });

        if (row.status !== "unsubscribed") {
          const { error } = await supabaseAdmin
            .from("newsletter_subscribers")
            .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
            .eq("id", row.id);
          if (error) return new Response("Internal error", { status: 500 });
        }

        // RFC 8058 expects 200 OK with no body needed.
        return new Response("OK", { status: 200, headers: { "Content-Type": "text/plain" } });
      },
    },
  },
});
