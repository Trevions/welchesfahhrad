// Auto-indexing helpers. Server-only.
// IndexNow (Bing, Yandex, Seznam, Naver) + Google/Bing sitemap ping.
// Google does not officially accept IndexNow, but submitting a fresh sitemap
// is the supported way to nudge re-crawl.

const HOST = "radmap.de";
const INDEXNOW_KEY = "3d26c1d64fd8793cda1f811255be3d61";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

export async function pingIndexNow(urls: string[]): Promise<void> {
  const clean = urls.filter((u) => typeof u === "string" && u.startsWith("http"));
  if (clean.length === 0) return;

  try {
    await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: clean,
      }),
    });
  } catch (e) {
    console.error("[indexnow] ping failed", e);
  }
}

export async function pingSearchEngineSitemaps(): Promise<void> {
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  ];
  await Promise.all(
    targets.map((url) =>
      fetch(url, { method: "GET" }).catch((e) =>
        console.error("[sitemap-ping] failed", url, e),
      ),
    ),
  );
}

export async function notifyNewArticle(slug: string): Promise<void> {
  const url = `https://${HOST}/artikel/${slug}`;
  await Promise.all([
    pingIndexNow([url, `https://${HOST}/`, `https://${HOST}/nachrichten`]),
    pingSearchEngineSitemaps(),
  ]);
}
