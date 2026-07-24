import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "welchesfahrrad:bike-favorites:v1";
const EVENT = "welchesfahrrad:bike-favorites-changed";

export type BikeFavorite = {
  slug: string;
  brand: string;
  model: string;
  year?: number | null;
  image: string;
  category?: string | null;
  bikeType?: string | null;
  priceEur?: number | null;
  savedAt: number;
};

function read(): BikeFavorite[] {
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

function write(list: BikeFavorite[]) {
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

const EMPTY: BikeFavorite[] = [];
let snapshotCache: BikeFavorite[] = [];
let snapshotRaw = "";

function getSnapshot(): BikeFavorite[] {
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

if (typeof window !== "undefined") {
  const bust = () => {
    snapshotRaw = "__dirty__";
  };
  window.addEventListener(EVENT, bust);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) bust();
  });
}

export function useBikeFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const isFavorite = useCallback(
    (slug: string) => favorites.some((b) => b.slug === slug),
    [favorites],
  );

  const add = useCallback((b: Omit<BikeFavorite, "savedAt">) => {
    const list = read();
    if (list.some((x) => x.slug === b.slug)) return;
    write([{ ...b, savedAt: Date.now() }, ...list]);
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((b) => b.slug !== slug));
  }, []);

  const toggle = useCallback((b: Omit<BikeFavorite, "savedAt">) => {
    const list = read();
    if (list.some((x) => x.slug === b.slug)) {
      write(list.filter((x) => x.slug !== b.slug));
      return false;
    }
    write([{ ...b, savedAt: Date.now() }, ...list]);
    return true;
  }, []);

  const clear = useCallback(() => write([]), []);

  return { favorites, isFavorite, add, remove, toggle, clear };
}
