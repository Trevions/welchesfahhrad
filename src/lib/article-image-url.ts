const ARTICLE_IMAGE_PROXY = "/api/public/article-image";

function safeEncodePath(path: string): string {
  return encodeURIComponent(path.replace(/^\/+/, ""));
}

export function articleImageUrl(input: string | null | undefined): string {
  if (!input) return "";
  const value = input.trim();
  if (!value) return "";

  if (value.startsWith(`${ARTICLE_IMAGE_PROXY}/`)) return value;

  const directPath = value.match(/^article-images\/(.+)$/)?.[1] ?? value.match(/^\/?storage\/v1\/object\/(?:public|sign)\/article-images\/(.+)$/)?.[1];
  if (directPath) return `${ARTICLE_IMAGE_PROXY}/${safeEncodePath(directPath.split("?")[0])}`;

  try {
    const url = new URL(value);
    const marker = "/storage/v1/object/";
    const idx = url.pathname.indexOf(marker);
    if (idx !== -1) {
      const after = url.pathname.slice(idx + marker.length);
      const match = after.match(/^(?:public|sign)\/article-images\/(.+)$/);
      if (match?.[1]) return `${ARTICLE_IMAGE_PROXY}/${safeEncodePath(decodeURIComponent(match[1]))}`;
    }
  } catch {
    // Keep external or already-relative URLs untouched.
  }

  return value;
}