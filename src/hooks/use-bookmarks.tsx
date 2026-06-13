import { useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "radmap:bookmarks:v1";
const EVENT = "radmap:bookmarks-changed";

export type Bookmark = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  savedAt: number;
};

function read(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: Bookmark[] = [];

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(
    subscribe,
    () => {
      // cache snapshot per change to keep referential stability
      return getSnapshot();
    },
    () => EMPTY,
  );

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.some((b) => b.slug === slug),
    [bookmarks],
  );

  const add = useCallback((b: Omit<Bookmark, "savedAt">) => {
    const list = read();
    if (list.some((x) => x.slug === b.slug)) return;
    write([{ ...b, savedAt: Date.now() }, ...list]);
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((b) => b.slug !== slug));
  }, []);

  const toggle = useCallback(
    (b: Omit<Bookmark, "savedAt">) => {
      const list = read();
      if (list.some((x) => x.slug === b.slug)) {
        write(list.filter((x) => x.slug !== b.slug));
        return false;
      }
      write([{ ...b, savedAt: Date.now() }, ...list]);
      return true;
    },
    [],
  );

  const clear = useCallback(() => write([]), []);

  return { bookmarks, isBookmarked, add, remove, toggle, clear };
}

// Snapshot cache to avoid re-creating array refs each render
let snapshotCache: Bookmark[] = [];
let snapshotRaw = "";
function getSnapshot(): Bookmark[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = localStorage.getItem(STORAGE_KEY) ?? "";
  if (raw === snapshotRaw) return snapshotCache;
  snapshotRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    snapshotCache = Array.isArray(parsed) ? parsed : [];
  } catch {
    snapshotCache = [];
  }
  return snapshotCache;
}

// Listen for changes to bust snapshot cache
if (typeof window !== "undefined") {
  const bust = () => {
    snapshotRaw = "__dirty__";
  };
  window.addEventListener(EVENT, bust);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) bust();
  });
}
