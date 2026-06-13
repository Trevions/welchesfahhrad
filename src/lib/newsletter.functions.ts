import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SITE_URL = "https://radmap.de";
const FROM_EMAIL = "Radmap Newsletter <newsletter@radmap.de>";
const REPLY_TO = "support@radmap.de";

const subscribeInput = z.object({
  email: z.string().trim().email().max(254),
  consent: z.literal(true),
  source: z.string().max(40).optional().default("footer"),
  // honeypot
  website: z.string().max(0).optional().default(""),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden: admin access required");
}

async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const enc = new TextEncoder().encode(ip + "|radmap-newsletter");
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

async function sendDoiEmail(email: string, confirmUrl: string, unsubUrl: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!lovableKey || !resendKey) {
    console.warn("[newsletter] Resend connector not configured — DOI email skipped for", email);
    return { sent: false };
  }

  const html = `
<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><title>Newsletter bestätigen</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0a0a0a; color:#e5e5e5; padding:40px 20px; margin:0;">
  <div style="max-width:560px; margin:0 auto; background:#111; border:1px solid #262626; border-radius:8px; overflow:hidden;">
    <div style="padding:32px; border-bottom:1px solid #262626;">
      <div style="font-family: Georgia, serif; font-weight:900; font-style:italic; font-size:28px; color:#fff;">Radmap<span style="color:#f97316;">.</span></div>
    </div>
    <div style="padding:32px;">
      <h1 style="font-size:22px; font-weight:700; margin:0 0 16px; color:#fff;">Newsletter-Anmeldung bestätigen</h1>
      <p style="font-size:15px; line-height:1.6; color:#a3a3a3; margin:0 0 24px;">
        Vielen Dank für Ihr Interesse am Radmap-Newsletter. Bitte bestätigen Sie Ihre E-Mail-Adresse durch Klick auf den folgenden Button. Erst nach Bestätigung erhalten Sie unsere wöchentliche Ausgabe (Double-Opt-In gemäß § 7 UWG).
      </p>
      <a href="${confirmUrl}" style="display:inline-block; background:#f97316; color:#0a0a0a; text-decoration:none; padding:14px 28px; font-weight:700; font-size:13px; letter-spacing:0.1em; text-transform:uppercase; border-radius:4px;">Anmeldung bestätigen</a>
      <p style="font-size:13px; line-height:1.6; color:#737373; margin:24px 0 0;">
        Oder kopieren Sie diesen Link in Ihren Browser:<br>
        <span style="color:#a3a3a3; word-break:break-all;">${confirmUrl}</span>
      </p>
      <hr style="border:none; border-top:1px solid #262626; margin:32px 0;">
      <p style="font-size:12px; line-height:1.5; color:#737373; margin:0;">
        Sie haben diese E-Mail erhalten, weil Ihre Adresse auf radmap.de zur Newsletter-Anmeldung verwendet wurde. War das nicht Sie? Ignorieren Sie diese E-Mail einfach — ohne Bestätigung wird keine Anmeldung wirksam und Ihre Daten werden nach 7 Tagen gelöscht.
      </p>
      <p style="font-size:12px; line-height:1.5; color:#737373; margin:12px 0 0;">
        <a href="${unsubUrl}" style="color:#737373;">Sofort vollständig löschen</a>
      </p>
    </div>
    <div style="padding:20px 32px; background:#0a0a0a; border-top:1px solid #262626; font-size:11px; color:#525252;">
      DigiMarket Bulgaria · 6400 Dimitrovgrad, Bulgarien · support@radmap.de
    </div>
  </div>
</body></html>`;

  const text = `Newsletter-Anmeldung bestätigen\n\nVielen Dank für Ihr Interesse am Radmap-Newsletter.\n\nBitte bestätigen Sie Ihre E-Mail-Adresse:\n${confirmUrl}\n\nWenn Sie diese Anmeldung nicht ausgelöst haben, ignorieren Sie diese E-Mail.\n\nDigiMarket Bulgaria, 6400 Dimitrovgrad, support@radmap.de`;

  const resp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      reply_to: REPLY_TO,
      subject: "Bitte bestätigen Sie Ihre Newsletter-Anmeldung",
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("[newsletter] Resend error:", resp.status, errText);
    return { sent: false };
  }
  return { sent: true };
}

// ============ PUBLIC: Subscribe ============
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d) => subscribeInput.parse(d))
  .handler(async ({ data }) => {
    if (data.website && data.website.length > 0) {
      // Honeypot — pretend success
      return { ok: true };
    }

    const ua = getRequestHeader("user-agent") ?? null;
    const fwd = getRequestHeader("x-forwarded-for") ?? "";
    const ip = fwd.split(",")[0]?.trim() || null;
    const ipHash = await hashIp(ip);

    const consentText =
      "Ich möchte den Radmap-Newsletter erhalten und stimme der Verarbeitung meiner E-Mail-Adresse zum Zweck des Versands gemäß Datenschutzerklärung zu. Eine Abmeldung ist jederzeit möglich.";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check existing subscriber
    const { data: existing } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, status, confirm_token, unsubscribe_token")
      .ilike("email", data.email)
      .maybeSingle();

    let confirmToken: string;
    let unsubToken: string;

    if (existing) {
      if (existing.status === "confirmed") {
        // Already subscribed — silent success (don't leak existence)
        return { ok: true };
      }
      // Pending or unsubscribed → resend confirmation, reset tokens
      confirmToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      unsubToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      await supabaseAdmin
        .from("newsletter_subscribers")
        .update({
          status: "pending",
          confirm_token: confirmToken,
          unsubscribe_token: unsubToken,
          source: data.source,
          ip_hash: ipHash,
          user_agent: ua,
          consent_text: consentText,
          subscribed_at: new Date().toISOString(),
          confirmed_at: null,
          unsubscribed_at: null,
        })
        .eq("id", existing.id);
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .insert({
          email: data.email,
          status: "pending",
          source: data.source,
          ip_hash: ipHash,
          user_agent: ua,
          consent_text: consentText,
        })
        .select("confirm_token, unsubscribe_token")
        .single();
      if (error) throw new Error(error.message);
      confirmToken = inserted.confirm_token;
      unsubToken = inserted.unsubscribe_token;
    }

    const confirmUrl = `${SITE_URL}/newsletter/bestaetigen?token=${confirmToken}`;
    const unsubUrl = `${SITE_URL}/newsletter/abmelden?token=${unsubToken}`;

    await sendDoiEmail(data.email, confirmUrl, unsubUrl);

    return { ok: true };
  });

// ============ PUBLIC: Confirm via token ============
export const confirmNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(20).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: selErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("confirm_token", data.token)
      .maybeSingle();

    if (selErr) throw new Error(selErr.message);
    if (!row) return { ok: false, reason: "invalid" as const };
    if (row.status === "confirmed") return { ok: true, alreadyConfirmed: true };

    const { error: updErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) throw new Error(updErr.message);
    return { ok: true, alreadyConfirmed: false };
  });

// ============ PUBLIC: Unsubscribe via token ============
export const unsubscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(20).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("unsubscribe_token", data.token)
      .maybeSingle();
    if (!row) return { ok: false, reason: "invalid" as const };

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ ADMIN: List subscribers ============
export const listNewsletterSubscribers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        status: z.enum(["pending", "confirmed", "unsubscribed"]).optional(),
        search: z.string().max(200).optional(),
      })
      .optional()
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("newsletter_subscribers")
      .select(
        "id, email, status, source, subscribed_at, confirmed_at, unsubscribed_at, created_at",
      )
      .order("created_at", { ascending: false });
    if (data?.status) q = q.eq("status", data.status);
    if (data?.search) q = q.ilike("email", `%${data.search}%`);
    const { data: rows, error } = await q.limit(1000);
    if (error) throw new Error(error.message);

    const { count: confirmed } = await context.supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed");

    return { subscribers: rows ?? [], confirmed: confirmed ?? 0 };
  });

// ============ ADMIN: Delete subscriber ============
export const deleteNewsletterSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
