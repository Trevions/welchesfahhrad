// Auto-indexing helpers. Server-only.
// - IndexNow: notifies Bing, Yandex, Seznam, Naver directly (Google is not a
//   participant, so it never sees these pings).
// - Google Search Console: the classic /ping?sitemap= endpoint was retired by
//   Google in June 2023 and now returns 404 — we no longer call it. Instead
//   we resubmit the sitemap via the Search Console API through the Lovable
//   connector gateway, which is the only supported way to nudge a re-crawl
//   programmatically.

const HOST = "radmap.de";
const INDEXNOW_KEY = "3d26c1d64fd8793cda1f811255be3d61";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const NEWS_SITEMAP_URL = `https://${HOST}/news-sitemap.xml`;
const GSC_SITE_URL = `https://${HOST}/`;

const GATEWAY_BASE = "https://connector-gateway.lovable.dev/google_search_console";

export async function pingIndexNow(urls: string[]): Promise<void> {
  const clean = urls.filter((u) => typeof u === "string" && u.startsWith("http"));
  if (clean.length === 0) return;

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: clean,
      }),
    });
    if (!res.ok) {
      console.error("[indexnow] non-ok", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[indexnow] ping failed", e);
  }
}

/**
 * Re-submit the sitemap(s) to Google Search Console via the connector gateway.
 * Silently skips when the GSC connector isn't linked to the project yet.
 */
export async function submitSitemapToGoogle(): Promise<void> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const gscKey = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lovableKey || !gscKey) {
    // GSC connector not linked — nothing to do. IndexNow still runs for Bing/Yandex.
    return;
  }

  const encodedSite = encodeURIComponent(GSC_SITE_URL);
  for (const feed of [SITEMAP_URL, NEWS_SITEMAP_URL]) {
    const encodedFeed = encodeURIComponent(feed);
    const url = `${GATEWAY_BASE}/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedFeed}`;
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": gscKey,
        },
      });
      if (!res.ok) {
        console.error(
          "[gsc] sitemap submit failed",
          feed,
          res.status,
          await res.text().catch(() => ""),
        );
      }
    } catch (e) {
      console.error("[gsc] sitemap submit error", feed, e);
    }
  }
}

export async function notifyNewArticle(slug: string): Promise<void> {
  const url = `https://${HOST}/artikel/${slug}`;
  await Promise.all([
    pingIndexNow([url, `https://${HOST}/`, `https://${HOST}/nachrichten`]),
    submitSitemapToGoogle(),
  ]);
}

export async function notifyLexikonChange(slug: string): Promise<void> {
  const url = `https://${HOST}/lexikon/${slug}`;
  await Promise.all([
    pingIndexNow([url, `https://${HOST}/lexikon`]),
    submitSitemapToGoogle(),
  ]);
}

