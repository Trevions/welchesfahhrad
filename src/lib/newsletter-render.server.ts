// Server-only HTML/text renderer for the weekly newsletter.
// Pure functions — no I/O. Called from the dispatch route.

export interface IssueArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string;
}

const SITE = "https://radmap.de";
const BRAND_ORANGE = "#f97316";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderIssueSubject(issueDate: Date): string {
  const fmt = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(issueDate);
  return `Radmap Wochenrückblick – ${fmt}`;
}

export function renderIssuePreheader(articles: IssueArticle[]): string {
  const first = articles[0];
  if (!first) return "Die Top-Themen der Woche aus der Fahrradwelt.";
  const ex = first.excerpt?.trim() || first.title;
  return ex.slice(0, 140);
}

interface RenderOpts {
  articles: IssueArticle[];
  issueDate: Date;
  preheader: string;
  unsubscribeUrl: string;
  oneClickUnsubUrl: string;
  webViewUrl?: string;
}

export function renderIssueHtml(opts: RenderOpts): string {
  const dateLabel = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(opts.issueDate);

  const [hero, ...rest] = opts.articles;

  const heroHtml = hero
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr><td>
        ${
          hero.cover_image
            ? `<a href="${SITE}/artikel/${escapeHtml(hero.slug)}" style="text-decoration:none;"><img src="${escapeHtml(hero.cover_image)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border-radius:6px;border:1px solid #262626;" /></a>`
            : ""
        }
        <div style="margin-top:18px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND_ORANGE};font-weight:700;">${escapeHtml(hero.category)}</div>
        <h2 style="margin:8px 0 12px;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">
          <a href="${SITE}/artikel/${escapeHtml(hero.slug)}" style="color:#ffffff;text-decoration:none;">${escapeHtml(hero.title)}</a>
        </h2>
        ${hero.excerpt ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#a3a3a3;">${escapeHtml(hero.excerpt)}</p>` : ""}
        <a href="${SITE}/artikel/${escapeHtml(hero.slug)}" style="display:inline-block;background:${BRAND_ORANGE};color:#0a0a0a;text-decoration:none;padding:12px 22px;font-weight:700;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">Weiterlesen</a>
      </td></tr>
    </table>`
    : "";

  const restHtml = rest
    .map(
      (a) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-top:1px solid #262626;padding-top:24px;">
      <tr>
        ${
          a.cover_image
            ? `<td width="140" valign="top" style="padding-right:16px;">
                <a href="${SITE}/artikel/${escapeHtml(a.slug)}" style="text-decoration:none;"><img src="${escapeHtml(a.cover_image)}" alt="" width="140" style="display:block;width:140px;height:auto;border-radius:4px;border:1px solid #262626;" /></a>
              </td>`
            : ""
        }
        <td valign="top">
          <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND_ORANGE};font-weight:700;margin-bottom:4px;">${escapeHtml(a.category)}</div>
          <h3 style="margin:0 0 8px;font-size:16px;line-height:1.35;color:#ffffff;font-weight:700;">
            <a href="${SITE}/artikel/${escapeHtml(a.slug)}" style="color:#ffffff;text-decoration:none;">${escapeHtml(a.title)}</a>
          </h3>
          ${a.excerpt ? `<p style="margin:0;font-size:13px;line-height:1.5;color:#a3a3a3;">${escapeHtml(a.excerpt.slice(0, 160))}${a.excerpt.length > 160 ? "…" : ""}</p>` : ""}
        </td>
      </tr>
    </table>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Radmap Wochenrückblick</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px 12px;margin:0;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(opts.preheader)}</div>
  <div style="max-width:600px;margin:0 auto;background:#111111;border:1px solid #262626;border-radius:8px;overflow:hidden;">
    <div style="padding:24px 32px;border-bottom:1px solid #262626;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-family:Georgia,serif;font-weight:900;font-style:italic;font-size:24px;color:#ffffff;">Radmap<span style="color:${BRAND_ORANGE};">.</span>de</div>
      <div style="font-size:11px;color:#737373;letter-spacing:0.1em;text-transform:uppercase;">Wochenrückblick · ${escapeHtml(dateLabel)}</div>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#a3a3a3;">Die wichtigsten Artikel der vergangenen Woche aus der Welt des Radsports – kompakt für Sie zusammengestellt.</p>
      ${heroHtml}
      ${restHtml}
      <hr style="border:none;border-top:1px solid #262626;margin:32px 0 24px;">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#a3a3a3;">Vielen Dank, dass Sie Teil der Radmap-Community sind. Wir lesen jede Antwort – schreiben Sie uns einfach an <a href="mailto:support@radmap.de" style="color:${BRAND_ORANGE};">support@radmap.de</a>.</p>
    </div>
    <div style="padding:20px 32px;background:#0a0a0a;border-top:1px solid #262626;font-size:11px;line-height:1.6;color:#525252;">
      DigiMarket · <a href="${SITE}/impressum" style="color:#737373;">Impressum</a> · <a href="${SITE}/datenschutz" style="color:#737373;">Datenschutz</a><br>
      Sie erhalten diese E-Mail, weil Sie den Radmap-Newsletter bestätigt haben.<br>
      <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#737373;">Newsletter abbestellen</a>
    </div>
  </div>
</body></html>`;
}

export function renderIssueText(opts: RenderOpts): string {
  const dateLabel = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(opts.issueDate);

  const lines: string[] = [
    `Radmap Wochenrückblick – ${dateLabel}`,
    "",
    "Die wichtigsten Artikel der vergangenen Woche:",
    "",
  ];
  for (const a of opts.articles) {
    lines.push(`• ${a.title}`);
    if (a.excerpt) lines.push(`  ${a.excerpt.slice(0, 200)}`);
    lines.push(`  ${SITE}/artikel/${a.slug}`);
    lines.push("");
  }
  lines.push("---");
  lines.push("DigiMarket · support@radmap.de");
  lines.push(`Impressum: ${SITE}/impressum`);
  lines.push(`Newsletter abbestellen: ${opts.unsubscribeUrl}`);
  return lines.join("\n");
}
