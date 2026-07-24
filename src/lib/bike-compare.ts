// Client-only localStorage helper for bike comparison (max 4 slugs).
const KEY = "welchesfahrrad.compare.v1";
const MAX = 4;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent("welchesfahrrad-compare-change"));
  } catch {
    /* ignore */
  }
}

export const compareStore = {
  list: read,
  has: (slug: string) => read().includes(slug),
  toggle(slug: string): { added: boolean; list: string[]; full: boolean } {
    const cur = read();
    if (cur.includes(slug)) {
      const next = cur.filter((s) => s !== slug);
      write(next);
      return { added: false, list: next, full: false };
    }
    if (cur.length >= MAX) return { added: false, list: cur, full: true };
    const next = [...cur, slug];
    write(next);
    return { added: true, list: next, full: false };
  },
  remove(slug: string) {
    write(read().filter((s) => s !== slug));
  },
  clear() {
    write([]);
  },
  MAX,
};

export function subscribeCompare(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("welchesfahrrad-compare-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("welchesfahrrad-compare-change", handler);
    window.removeEventListener("storage", handler);
  };
}
