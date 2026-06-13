import { createFileRoute } from "@tanstack/react-router";
import {
  renderIssueHtml,
  renderIssueText,
  renderIssueSubject,
  renderIssuePreheader,
  type IssueArticle,
} from "@/lib/newsletter-render.server";

// Weekly newsletter dispatch.
//
// Triggered by:
//  - pg_cron Sundays at 10:00 and 11:00 UTC (covers both Berlin DST states)
//  - manual admin trigger (with force=true)
//
// Strict guarantees:
//  - Only `confirmed` subscribers receive the newsletter
//  - Suppressed addresses (bounces/complaints) are excluded
//  - Unique constraint (issue_id, subscriber_id) prevents duplicate sends
//  - Up to 3 send attempts per recipient; failures land in newsletter_deliveries.status='failed'

const SITE = "https://radmap.de";
const FROM_EMAIL = "Radmap.de <hallo@radmap.de>";
const REPLY_TO = "support@radmap.de";

function getBerlinHour(d: Date): number {
  const s = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(d);
  return parseInt(s, 10);
}

function getBerlinIssueDate(d: Date): string {
  // YYYY-MM-DD in Berlin timezone
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return parts; // "YYYY-MM-DD"
}

async function sendOne(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubUrl: string;
  oneClickUrl: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!lovableKey || !resendKey) {
    return { ok: false, error: "Resend connector not configured" };
  }

  try {
    const resp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: opts.to,
        reply_to: REPLY_TO,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        headers: {
          "List-Unsubscribe": `<${opts.oneClickUrl}>, <${opts.unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "List-Id": "Radmap.de Wochenrückblick <updates.radmap.de>",
          Precedence: "bulk",
          "X-Entity-Ref-ID": crypto.randomUUID(),
        },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { ok: false, error: `Resend ${resp.status}: ${errText.slice(0, 300)}` };
    }
    const json = (await resp.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export const Route = createFileRoute("/api/public/newsletter/dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // --- 1. Auth ---
        const secret = process.env.NEWSLETTER_DISPATCH_SECRET;
        if (!secret) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const header = request.headers.get("x-dispatch-secret") ?? "";
        if (header !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: { force?: boolean } = {};
        try {
          body = (await request.json()) as { force?: boolean };
        } catch {
          /* empty body is fine */
        }
        const force = body.force === true;

        // --- 2. Time gate (only Sundays at 12:00 Berlin time, unless forced) ---
        const now = new Date();
        if (!force) {
          const berlinHour = getBerlinHour(now);
          if (berlinHour !== 12) {
            return Response.json({
              ok: true,
              skipped: true,
              reason: `Not the dispatch hour (Berlin hour=${berlinHour})`,
            });
          }
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const issueDate = getBerlinIssueDate(now);

        // --- 3. Idempotency: check existing issue ---
        const { data: existingIssue } = await supabaseAdmin
          .from("newsletter_issues")
          .select("id, status")
          .eq("issue_date", issueDate)
          .maybeSingle();

        if (existingIssue && (existingIssue.status === "sent" || existingIssue.status === "sending")) {
          return Response.json({
            ok: true,
            skipped: true,
            reason: `Issue ${issueDate} already ${existingIssue.status}`,
            issueId: existingIssue.id,
          });
        }

        // --- 4. Top articles of last 7 days ---
        const sinceIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: articles, error: artErr } = await supabaseAdmin
          .from("articles")
          .select("id, slug, title, excerpt, cover_image, category, published_at")
          .eq("status", "published")
          .gte("published_at", sinceIso)
          .order("published_at", { ascending: false })
          .limit(6);

        if (artErr) {
          return Response.json({ ok: false, error: artErr.message }, { status: 500 });
        }

        const issueArticles: IssueArticle[] = (articles ?? []).map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          cover_image: a.cover_image,
          category: a.category as string,
        }));

        if (issueArticles.length === 0) {
          // mark as skipped — no content this week
          await supabaseAdmin.from("newsletter_issues").upsert(
            {
              issue_date: issueDate,
              subject: "(keine Artikel)",
              html: "",
              text: "",
              article_ids: [],
              status: "skipped",
              error: "No published articles in the last 7 days",
            },
            { onConflict: "issue_date" },
          );
          return Response.json({ ok: true, skipped: true, reason: "No articles" });
        }

        const subject = renderIssueSubject(now);
        const preheader = renderIssuePreheader(issueArticles);

        // We render per-recipient (unsubscribe link differs).
        // Store an example HTML (using first subscriber's token) for admin preview.

        // --- 5. Recipients: confirmed AND not suppressed ---
        const { data: subs, error: subErr } = await supabaseAdmin
          .from("newsletter_subscribers")
          .select("id, email, unsubscribe_token, status")
          .eq("status", "confirmed");
        if (subErr) {
          return Response.json({ ok: false, error: subErr.message }, { status: 500 });
        }

        const { data: suppressed } = await supabaseAdmin
          .from("suppressed_emails")
          .select("email");
        const suppressedSet = new Set((suppressed ?? []).map((r) => r.email.toLowerCase()));

        const recipients = (subs ?? []).filter(
          (s) => s.status === "confirmed" && !suppressedSet.has(s.email.toLowerCase()),
        );

        // --- 6. Create / update issue row ---
        const sampleUnsub = recipients[0]
          ? `${SITE}/newsletter/abmelden?token=${recipients[0].unsubscribe_token}`
          : `${SITE}/newsletter/abmelden`;
        const sampleOneClick = recipients[0]
          ? `${SITE}/api/public/newsletter/unsubscribe?token=${recipients[0].unsubscribe_token}`
          : sampleUnsub;
        const sampleHtml = renderIssueHtml({
          articles: issueArticles,
          issueDate: now,
          preheader,
          unsubscribeUrl: sampleUnsub,
          oneClickUnsubUrl: sampleOneClick,
        });
        const sampleText = renderIssueText({
          articles: issueArticles,
          issueDate: now,
          preheader,
          unsubscribeUrl: sampleUnsub,
          oneClickUnsubUrl: sampleOneClick,
        });

        const { data: issueRow, error: issErr } = await supabaseAdmin
          .from("newsletter_issues")
          .upsert(
            {
              issue_date: issueDate,
              subject,
              preheader,
              html: sampleHtml,
              text: sampleText,
              article_ids: issueArticles.map((a) => a.id),
              status: "sending",
              recipients_total: recipients.length,
              recipients_sent: 0,
              recipients_failed: 0,
              error: null,
            },
            { onConflict: "issue_date" },
          )
          .select("id")
          .single();
        if (issErr || !issueRow) {
          return Response.json({ ok: false, error: issErr?.message ?? "issue insert failed" }, { status: 500 });
        }
        const issueId = issueRow.id;

        // --- 7. Pre-create delivery rows (idempotent) ---
        if (recipients.length > 0) {
          const rows = recipients.map((r) => ({
            issue_id: issueId,
            subscriber_id: r.id,
            email: r.email,
            status: "queued" as const,
          }));
          await supabaseAdmin
            .from("newsletter_deliveries")
            .upsert(rows, { onConflict: "issue_id,subscriber_id", ignoreDuplicates: true });
        }

        // --- 8. Load pending deliveries and send ---
        const { data: pending } = await supabaseAdmin
          .from("newsletter_deliveries")
          .select("id, subscriber_id, email, attempts")
          .eq("issue_id", issueId)
          .in("status", ["queued", "failed"])
          .lt("attempts", 3);

        const subTokenMap = new Map(recipients.map((r) => [r.id, r.unsubscribe_token]));
        let sentCount = 0;
        let failedCount = 0;

        for (const d of pending ?? []) {
          const token = subTokenMap.get(d.subscriber_id);
          if (!token) {
            // subscriber vanished (deleted/unsubscribed since queue) — skip
            await supabaseAdmin
              .from("newsletter_deliveries")
              .update({ status: "skipped", error: "Subscriber no longer confirmed" })
              .eq("id", d.id);
            continue;
          }

          const unsubUrl = `${SITE}/newsletter/abmelden?token=${token}`;
          const oneClickUrl = `${SITE}/api/public/newsletter/unsubscribe?token=${token}`;
          const html = renderIssueHtml({
            articles: issueArticles,
            issueDate: now,
            preheader,
            unsubscribeUrl: unsubUrl,
            oneClickUnsubUrl: oneClickUrl,
          });
          const text = renderIssueText({
            articles: issueArticles,
            issueDate: now,
            preheader,
            unsubscribeUrl: unsubUrl,
            oneClickUnsubUrl: oneClickUrl,
          });

          const res = await sendOne({
            to: d.email,
            subject,
            html,
            text,
            unsubUrl,
            oneClickUrl,
          });

          if (res.ok) {
            sentCount++;
            await supabaseAdmin
              .from("newsletter_deliveries")
              .update({
                status: "sent",
                attempts: d.attempts + 1,
                message_id: res.id ?? null,
                sent_at: new Date().toISOString(),
                error: null,
              })
              .eq("id", d.id);
          } else {
            const attempts = d.attempts + 1;
            const finalStatus = attempts >= 3 ? "failed" : "queued";
            if (finalStatus === "failed") failedCount++;
            await supabaseAdmin
              .from("newsletter_deliveries")
              .update({
                status: finalStatus,
                attempts,
                error: res.error?.slice(0, 500) ?? "Unknown error",
              })
              .eq("id", d.id);
          }

          // small delay to stay under Resend's 2 req/s default rate limit
          await new Promise((r) => setTimeout(r, 600));
        }

        // --- 9. Finalize issue ---
        const { count: doneCount } = await supabaseAdmin
          .from("newsletter_deliveries")
          .select("id", { count: "exact", head: true })
          .eq("issue_id", issueId)
          .eq("status", "sent");

        const { count: failCount } = await supabaseAdmin
          .from("newsletter_deliveries")
          .select("id", { count: "exact", head: true })
          .eq("issue_id", issueId)
          .eq("status", "failed");

        const { count: stillQueued } = await supabaseAdmin
          .from("newsletter_deliveries")
          .select("id", { count: "exact", head: true })
          .eq("issue_id", issueId)
          .eq("status", "queued");

        const finalStatus = (stillQueued ?? 0) > 0 ? "sending" : "sent";

        await supabaseAdmin
          .from("newsletter_issues")
          .update({
            status: finalStatus,
            recipients_sent: doneCount ?? 0,
            recipients_failed: failCount ?? 0,
            sent_at: finalStatus === "sent" ? new Date().toISOString() : null,
          })
          .eq("id", issueId);

        return Response.json({
          ok: true,
          issueId,
          recipients: recipients.length,
          sentThisRun: sentCount,
          failedThisRun: failedCount,
          status: finalStatus,
        });
      },
    },
  },
});
