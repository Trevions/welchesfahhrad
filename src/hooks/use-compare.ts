import { useEffect, useState, useCallback } from "react";
import { compareStore, subscribeCompare } from "@/lib/bike-compare";

export function useCompare() {
  const [slugs, setSlugs] = useState<string[]>(() => compareStore.list());
  useEffect(() => subscribeCompare(() => setSlugs(compareStore.list())), []);
  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const toggle = useCallback((slug: string) => compareStore.toggle(slug), []);
  const remove = useCallback((slug: string) => compareStore.remove(slug), []);
  const clear = useCallback(() => compareStore.clear(), []);
  return { slugs, count: slugs.length, max: compareStore.MAX, has, toggle, remove, clear };
}
