import { useMemo } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { useBikeProfile } from "@/lib/bike-profile";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReadArticles } from "@/lib/read-articles";
import { getPercentMatches, type PercentMatch } from "@/lib/recommendations";
import { getPublicArticles } from "@/lib/articles.functions";

const matchesArticlesQuery = queryOptions({
  queryKey: ["public-articles"],
  queryFn: () => getPublicArticles(),
  staleTime: 60_000,
});

/**
 * Returns the strong-match articles (>= minPercent) for the current bike
 * profile, with already-read and already-bookmarked entries filtered out.
 * Safe to call from anywhere — no Suspense, no SSR fetch.
 */
export function useMatchingArticles(minPercent = 80) {
  const profile = useBikeProfile();
  const { data } = useQuery({
    ...matchesArticlesQuery,
    enabled: !!profile && profile.bikeTypes.length > 0,
  });
  const { bookmarks } = useBookmarks();
  const { readMap } = useReadArticles();

  return useMemo<{ matches: PercentMatch[]; count: number }>(() => {
    if (!profile || profile.bikeTypes.length === 0 || !data) {
      return { matches: [], count: 0 };
    }
    const bookmarked = new Set(bookmarks.map((b) => b.slug));
    const all = getPercentMatches(data.articles, profile, { minPercent });
    const visible = all.filter((m) => !readMap[m.article.slug] && !bookmarked.has(m.article.slug));
    return { matches: visible, count: visible.length };
  }, [profile, data, bookmarks, readMap, minPercent]);
}
