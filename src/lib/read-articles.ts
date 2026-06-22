import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "radmap:read:v1";
const EVENT = "radmap:read-changed";

type ReadMap = Record<string, number>; // slug -> timestamp

function read(): ReadMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as ReadMap) : {};
  } catch {
    return {};
  }
}

function write(map: ReadMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(EVENT));
}

export function markArticleRead(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  const map = read();
  if (map[slug]) return;
  map[slug] = Date.now();
  write(map);
}

export function unmarkArticleRead(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  const map = read();
  if (!map[slug]) return;
  delete map[slug];
  write(map);
}

export function clearReadArticles() {
  write({});
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

let snapRaw = "";
let snap: ReadMap = {};
function getSnapshot(): ReadMap {
  if (typeof window === "undefined") return snap;
  const raw = localStorage.getItem(STORAGE_KEY) ?? "";
  if (raw === snapRaw) return snap;
  snapRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    snap = parsed && typeof parsed === "object" ? (parsed as ReadMap) : {};
  } catch {
    snap = {};
  }
  return snap;
}

const EMPTY: ReadMap = {};

export function useReadArticles() {
  const map = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const isRead = useCallback((slug: string) => !!map[slug], [map]);
  return { readMap: map, isRead, markRead: markArticleRead, unmarkRead: unmarkArticleRead };
}
