import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FROM_NAME = "WelchesFahrrad.de Redaktion";
const FROM_LOCAL = "redaktion";
const FROM_DOMAIN = "welchesfahrrad.de";
const SITE_URL = "https://welchesfahrrad.de";
const CONTACT_URL = `${SITE_URL}/kontakt`;

function replyToFor(threadToken: string) {
  // Plus-addressed reply-to so inbound webhooks can link replies back
  return `${FROM_LOCAL}+r-${threadToken}@${FROM_DOMAIN}`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function buildReplyEmailHtml(opts: {
  recipientName: string;
  message: string;
  articleTitle: string | null;
  articleSlug: string;
  originalReason: string | null;
  originalDescription: string;
}) {
  const paragraphs = opts.message
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.65;color:#27272a;font-size:15px;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const articleUrl = `${SITE_URL}/artikel/${opts.articleSlug}`;
  const title = opts.articleTitle || opts.articleSlug;

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Antwort von WelchesFahrrad.de</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
<tr><td style="padding:28px 32px;border-bottom:1px solid #f4f4f5;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#18181b;letter-spacing:-0.01em;">Welches Fahrrad<span style="color:#FF6A1A;">.</span>de</div>
<div style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.12em;margin-top:4px;">Antwort der Redaktion</div>
</td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 20px;font-size:15px;color:#27272a;">Hallo ${escapeHtml(opts.recipientName)},</p>
<p style="margin:0 0 20px;line-height:1.65;color:#27272a;font-size:15px;">vielen Dank für deine Rückmeldung zu unserem Artikel. Wir haben deinen Hinweis geprüft und möchten dir Folgendes mitteilen:</p>
${paragraphs}
<p style="margin:24px 0 0;font-size:14px;color:#52525b;line-height:1.6;">Falls du weitere Fragen hast, antworte einfach direkt auf diese E-Mail.</p>
<p style="margin:16px 0 0;font-size:15px;color:#27272a;line-height:1.6;">Viele Grüße<br><strong>Die WelchesFahrrad.de Redaktion</strong></p>
</td></tr>
<tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;">
<div style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Bezug: Deine Meldung</div>
<a href="${articleUrl}" style="color:#18181b;font-size:14px;font-weight:600;text-decoration:none;line-height:1.4;display:block;margin-bottom:6px;">${escapeHtml(title)}</a>
${opts.originalReason ? `<div style="font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Grund: ${escapeHtml(opts.originalReason)}</div>` : ""}
<div style="font-size:13px;color:#52525b;line-height:1.55;padding:10px 12px;background:#ffffff;border-left:3px solid #e4e4e7;border-radius:2px;white-space:pre-wrap;">${escapeHtml(opts.originalDescription.slice(0, 400))}${opts.originalDescription.length > 400 ? "…" : ""}</div>
</td></tr>
<tr><td style="padding:20px 32px;background:#18181b;color:#a1a1aa;font-size:11px;line-height:1.6;text-align:center;">
<a href="${SITE_URL}" style="color:#FF6A1A;text-decoration:none;font-weight:600;">welchesfahrrad.de</a> · Dein Rad-Magazin<br>
<span style="color:#71717a;">Antworte einfach auf diese E-Mail, um mit der Redaktion zu sprechen.</span>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const statusEnum = z.enum(["new", "read", "resolved", "archived"]);

const submitInput = z.object({
  article_slug: z.string().trim().min(1).max(200),
  article_title: z.string().trim().max(300).optional().nullable(),
  reporter_name: z.string().trim().min(1).max(120),
  reporter_email: z.string().trim().email().max(254),
  reason: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().min(5).max(5000),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""), // honeypot
});

async function assertStaff(context: { supabase: any; userId: string }) {
  const { data: admin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (admin) return "admin" as const;
  const { data: editor } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "editor",
  });
  if (editor) return "editor" as const;
  throw new Error("Forbidden: staff access required");
}

export const submitArticleReport = createServerFn({ method: "POST" })
  .inputValidator((d) => submitInput.parse(d))
  .handler(async ({ data }) => {
    if (data.website && data.website.length > 0) return { ok: true };

    const ua = getRequestHeader("user-agent") ?? null;
    const fwd = getRequestHeader("x-forwarded-for") ?? "";
    const ip = fwd.split(",")[0]?.trim() || null;

    let ipHash: string | null = null;
    if (ip) {
      const enc = new TextEncoder().encode(ip + "|welchesfahrrad");
      const buf = await crypto.subtle.digest("SHA-256", enc);
      ipHash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("article_reports")
      .insert({
        article_slug: data.article_slug,
        article_title: data.article_title || null,
        reporter_name: data.reporter_name,
        reporter_email: data.reporter_email,
        reason: data.reason || null,
        description: data.description,
        user_agent: ua,
        ip_hash: ipHash,
      } as any)
      .select("id, thread_token")
      .maybeSingle();
    if (error) throw new Error(error.message);

    // Log the original submission as the first inbound message
    if (inserted) {
      await supabaseAdmin.from("article_report_messages").insert({
        report_id: (inserted as any).id,
        thread_token: (inserted as any).thread_token,
        direction: "inbound",
        from_email: data.reporter_email,
        to_email: `${FROM_LOCAL}@${FROM_DOMAIN}`,
        subject: data.reason ? `Meldung: ${data.reason}` : "Artikel-Meldung",
        body_text: data.description,
        meta: { origin: "web_form" },
      } as any);
    }
    return { ok: true };
  });

export const listArticleReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z
      .object({
        status: statusEnum.optional(),
        search: z.string().max(200).optional(),
        includeDeleted: z.boolean().optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    let q = context.supabase
      .from("article_reports")
      .select(
        "id, article_slug, article_title, reporter_name, reporter_email, reason, description, status, created_at, updated_at, deleted_at, thread_token",
      )
      .order("created_at", { ascending: false });
    if (!data?.includeDeleted) q = q.is("deleted_at", null);
    if (data?.status) q = q.eq("status", data.status);
    if (data?.search) q = q.or(
      `article_title.ilike.%${data.search}%,article_slug.ilike.%${data.search}%,reporter_name.ilike.%${data.search}%,reporter_email.ilike.%${data.search}%`,
    );
    const { data: rows, error } = await q.limit(500);
    if (error) throw new Error(error.message);

    const { count: unread } = await context.supabase
      .from("article_reports")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "new");

    return { reports: rows ?? [], unread: unread ?? 0 };
  });

export const getUnreadArticleReportCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { count } = await context.supabase
      .from("article_reports")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "new");
    return { unread: count ?? 0 };
  });

export const updateArticleReportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: statusEnum }))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("article_reports")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Soft-delete (keeps correspondence and enables closed-case auto-reply)
export const deleteArticleReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const role = await assertStaff(context);
    if (role !== "admin") throw new Error("Forbidden: admins only");
    const { error } = await context.supabase
      .from("article_reports")
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const restoreArticleReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const role = await assertStaff(context);
    if (role !== "admin") throw new Error("Forbidden: admins only");
    const { error } = await context.supabase
      .from("article_reports")
      .update({ deleted_at: null } as any)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listArticleReportMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ report_id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { data: rows, error } = await context.supabase
      .from("article_report_messages")
      .select("id, direction, from_email, to_email, subject, body_text, body_html, created_at, meta")
      .eq("report_id", data.report_id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { messages: rows ?? [] };
  });

export const replyToArticleReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      subject: z.string().trim().min(3).max(200),
      message: z.string().trim().min(5).max(10000),
      markResolved: z.boolean().optional().default(false),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);

    const { data: report, error: fetchErr } = await context.supabase
      .from("article_reports")
      .select("id, article_slug, article_title, reporter_name, reporter_email, reason, description, thread_token, deleted_at")
      .eq("id", data.id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!report) throw new Error("Meldung nicht gefunden");
    if ((report as any).deleted_at) throw new Error("Diese Meldung ist gelöscht.");

    const lovableKey = process.env.LOVABLE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!lovableKey || !resendKey) {
      throw new Error("E-Mail-Versand ist nicht konfiguriert");
    }

    const threadToken = (report as any).thread_token as string;
    const replyTo = replyToFor(threadToken);
    const fromEmail = `${FROM_NAME} <${FROM_LOCAL}@${FROM_DOMAIN}>`;

    const html = buildReplyEmailHtml({
      recipientName: report.reporter_name,
      message: data.message,
      articleTitle: report.article_title,
      articleSlug: report.article_slug,
      originalReason: report.reason,
      originalDescription: report.description,
    });

    const text =
      `Hallo ${report.reporter_name},\n\n` +
      `vielen Dank für deine Rückmeldung zu unserem Artikel. Wir haben deinen Hinweis geprüft und möchten dir Folgendes mitteilen:\n\n` +
      `${data.message.trim()}\n\n` +
      `Falls du weitere Fragen hast, antworte einfach direkt auf diese E-Mail.\n\n` +
      `Viele Grüße\nDie WelchesFahrrad.de Redaktion\n\n` +
      `— Bezug: ${report.article_title ?? report.article_slug}\n` +
      `${SITE_URL}/artikel/${report.article_slug}\n`;

    const resp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [report.reporter_email],
        reply_to: replyTo,
        subject: data.subject,
        html,
        text,
        headers: { "X-Welches Fahrrad-Thread": threadToken },
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`E-Mail-Versand fehlgeschlagen [${resp.status}]: ${body}`);
    }

    let providerId: string | null = null;
    try {
      const j = await resp.json();
      providerId = j?.id ?? null;
    } catch {
      /* ignore */
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("article_report_messages").insert({
      report_id: data.id,
      thread_token: threadToken,
      direction: "outbound",
      from_email: `${FROM_LOCAL}@${FROM_DOMAIN}`,
      to_email: report.reporter_email,
      subject: data.subject,
      body_text: text,
      body_html: html,
      provider_message_id: providerId,
      meta: { reply_to: replyTo },
    } as any);

    await context.supabase
      .from("article_reports")
      .update({ status: data.markResolved ? "resolved" : "read" })
      .eq("id", data.id);

    return { ok: true };
  });
