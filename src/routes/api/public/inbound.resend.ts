import { createFileRoute } from "@tanstack/react-router";

/**
 * Resend Inbound Email webhook.
 *
 * Configure in Resend Inbound settings:
 *   Route pattern: redaktion+*@radmap.de  (and/or redaktion@radmap.de)
 *   Destination:   POST https://radmap.de/api/public/inbound/resend
 *   Header:        X-Radmap-Secret: <INBOUND_EMAIL_SECRET>   (recommended)
 *
 * Requires MX records for the sending subdomain to point to Resend Inbound.
 */

const CLOSED_CASE_HTML = (name: string, articleUrl: string | null, title: string | null) => `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Fall geschlossen · Radmap.de</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="padding:28px 32px;border-bottom:1px solid #f4f4f5;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#18181b;">Radmap<span style="color:#FF6A1A;">.</span>de</div>
<div style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.12em;margin-top:4px;">Automatische Antwort</div>
</td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 16px;font-size:15px;color:#27272a;">Hallo ${escapeHtml(name)},</p>
<p style="margin:0 0 16px;font-size:15px;color:#27272a;line-height:1.65;">
vielen Dank für deine Nachricht. Dieser Vorgang wurde bereits <strong>abgeschlossen und aus unserem System entfernt</strong>. Wir können dir daher auf diesem Weg leider nicht mehr antworten.
</p>
<p style="margin:0 0 24px;font-size:15px;color:#27272a;line-height:1.65;">
Wenn du dein Anliegen weiter besprechen möchtest, kontaktiere uns bitte offiziell über unser Kontaktformular:
</p>
<p style="margin:0 0 24px;text-align:center;">
<a href="https://radmap.de/kontakt" style="display:inline-block;background:#FF6A1A;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:8px;font-size:15px;">Zum Kontaktformular →</a>
</p>
${articleUrl ? `<p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">Bezug: <a href="${articleUrl}" style="color:#FF6A1A;text-decoration:none;">${escapeHtml(title || articleUrl)}</a></p>` : ""}
<p style="margin:24px 0 0;font-size:15px;color:#27272a;">Viele Grüße<br><strong>Die Radmap.de Redaktion</strong></p>
</td></tr>
<tr><td style="padding:16px 32px;background:#18181b;color:#a1a1aa;font-size:11px;text-align:center;">
<a href="https://radmap.de" style="color:#FF6A1A;text-decoration:none;font-weight:600;">radmap.de</a> · Dein Rad-Magazin
</td></tr>
</table>
</td></tr></table>
</body></html>`;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/** Extract the thread token from a plus-addressed recipient like `redaktion+r-abcd123@radmap.de`. */
function extractToken(addresses: string[]): string | null {
  const re = /redaktion\+r-([a-z0-9]+)@radmap\.de/i;
  for (const raw of addresses) {
    const m = raw.match(re);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

function collectAddresses(payload: any): string[] {
  const out: string[] = [];
  const push = (v: any) => {
    if (!v) return;
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v))
      v.forEach((x) => (typeof x === "string" ? out.push(x) : x?.address && out.push(x.address)));
    else if (typeof v === "object" && v.address) out.push(v.address);
  };
  push(payload?.to);
  push(payload?.cc);
  push(payload?.envelope?.to);
  push(payload?.data?.to);
  push(payload?.data?.envelope?.to);
  return out;
}

function firstString(...vals: any[]): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v;
    if (Array.isArray(v) && v[0]) {
      if (typeof v[0] === "string") return v[0];
      if (typeof v[0]?.address === "string") return v[0].address;
    }
    if (v && typeof v === "object" && typeof v.address === "string") return v.address;
  }
  return null;
}

async function sendClosedCaseAutoReply(opts: {
  toEmail: string;
  toName: string;
  originalSubject: string | null;
  articleSlug: string | null;
  articleTitle: string | null;
}) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!lovableKey || !resendKey) return { ok: false, reason: "missing_keys" };

  const articleUrl = opts.articleSlug ? `https://radmap.de/artikel/${opts.articleSlug}` : null;
  const subject = opts.originalSubject
    ? `Re: ${opts.originalSubject.replace(/^\s*re:\s*/i, "")} · Fall geschlossen`
    : "Dein Anliegen · Fall geschlossen";

  const html = CLOSED_CASE_HTML(opts.toName, articleUrl, opts.articleTitle);
  const text =
    `Hallo ${opts.toName},\n\n` +
    `vielen Dank für deine Nachricht. Dieser Vorgang wurde bereits abgeschlossen und aus unserem System entfernt. ` +
    `Wir können dir auf diesem Weg leider nicht mehr antworten.\n\n` +
    `Bitte nutze unser Kontaktformular, um uns offiziell zu erreichen:\nhttps://radmap.de/kontakt\n\n` +
    `Viele Grüße\nDie Radmap.de Redaktion`;

  const resp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: "Radmap.de Redaktion <redaktion@radmap.de>",
      to: [opts.toEmail],
      reply_to: "redaktion@radmap.de",
      subject,
      html,
      text,
    }),
  });
  return { ok: resp.ok, status: resp.status };
}

export const Route = createFileRoute("/api/public/inbound/resend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Optional shared-secret check
        const requiredSecret = process.env.INBOUND_EMAIL_SECRET;
        if (requiredSecret) {
          const given = request.headers.get("x-radmap-secret");
          if (given !== requiredSecret) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // Resend Inbound wraps event in { type, data } — normalize
        const p = payload?.data ?? payload;

        const toAddrs = collectAddresses(payload);
        const token = extractToken(toAddrs);

        const fromAddr =
          firstString(p?.from, p?.envelope?.from, payload?.from) ?? "unknown@unknown";
        const fromEmail = fromAddr.match(/<([^>]+)>/)?.[1] ?? fromAddr.trim();
        const fromName =
          (typeof p?.from === "object" && p?.from?.name) ||
          fromAddr.replace(/<[^>]+>/, "").replace(/["']/g, "").trim() ||
          fromEmail.split("@")[0];

        const subject: string | null = p?.subject ?? payload?.subject ?? null;
        const textBody: string | null = p?.text ?? payload?.text ?? null;
        const htmlBody: string | null = p?.html ?? payload?.html ?? null;
        const providerId: string | null = p?.id ?? p?.email_id ?? payload?.id ?? null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (!token) {
          // Log unmatched inbound for audit but don't error
          await supabaseAdmin.from("article_report_messages").insert({
            report_id: null,
            thread_token: "unmatched",
            direction: "inbound",
            from_email: fromEmail,
            to_email: toAddrs.join(", ").slice(0, 500) || "unknown",
            subject,
            body_text: textBody,
            body_html: htmlBody,
            provider_message_id: providerId,
            meta: { unmatched: true, raw_to: toAddrs },
          } as any);
          return new Response(JSON.stringify({ ok: true, matched: false }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { data: report } = await supabaseAdmin
          .from("article_reports")
          .select("id, thread_token, deleted_at, article_slug, article_title, reporter_name, reporter_email, status")
          .eq("thread_token", token)
          .maybeSingle();

        if (!report || (report as any).deleted_at) {
          // Auto-reply "case closed" with a link to the contact form
          await sendClosedCaseAutoReply({
            toEmail: fromEmail,
            toName: fromName,
            originalSubject: subject,
            articleSlug: (report as any)?.article_slug ?? null,
            articleTitle: (report as any)?.article_title ?? null,
          });

          await supabaseAdmin.from("article_report_messages").insert({
            report_id: (report as any)?.id ?? null,
            thread_token: token,
            direction: "inbound",
            from_email: fromEmail,
            to_email: toAddrs.join(", ").slice(0, 500) || "unknown",
            subject,
            body_text: textBody,
            body_html: htmlBody,
            provider_message_id: providerId,
            meta: { closed_case: true },
          } as any);

          await supabaseAdmin.from("article_report_messages").insert({
            report_id: (report as any)?.id ?? null,
            thread_token: token,
            direction: "auto_reply",
            from_email: "redaktion@radmap.de",
            to_email: fromEmail,
            subject: "Fall geschlossen",
            body_text: "Automatische Antwort: Vorgang abgeschlossen · Bitte Kontaktformular nutzen.",
            meta: { kind: "closed_case_auto_reply" },
          } as any);

          return new Response(JSON.stringify({ ok: true, matched: false, autoReply: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Live report → append inbound message and flag as new for the admin
        await supabaseAdmin.from("article_report_messages").insert({
          report_id: (report as any).id,
          thread_token: token,
          direction: "inbound",
          from_email: fromEmail,
          to_email: toAddrs.join(", ").slice(0, 500),
          subject,
          body_text: textBody,
          body_html: htmlBody,
          provider_message_id: providerId,
          meta: {},
        } as any);

        // Bump status back to "new" so the admin sees the reply
        if ((report as any).status !== "new") {
          await supabaseAdmin
            .from("article_reports")
            .update({ status: "new" })
            .eq("id", (report as any).id);
        }

        return new Response(JSON.stringify({ ok: true, matched: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
