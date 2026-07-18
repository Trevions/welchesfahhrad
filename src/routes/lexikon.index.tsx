import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, BookOpen, X, ArrowRight, Tag, FileText } from "lucide-react";
import Fuse from "fuse.js";
import { z } from "zod";
import {
  getLexikonTerms,
  type LexikonListItem,
  type LexikonArticleRef,
} from "@/lib/lexikon.functions";

const SITE = "https://radmap.de";

const lexikonQuery = queryOptions({
  queryKey: ["lexikon-terms"],
  queryFn: () => getLexikonTerms(),
  staleTime: 5 * 60_000,
});

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/lexikon/")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(lexikonQuery),
  head: () => {
    const title = "Fahrrad-Lexikon: Fachbegriffe rund ums Rad & E-Bike";
    const description =
      "Verständlich erklärte Fachbegriffe rund um Fahrrad, E-Bike und Radsport – von Ausstattung über Antrieb bis Sicherheit. Kuratiert von der radmap.de-Redaktion.";
    const url = `${SITE}/lexikon`;
    return {
      meta: [
        { title: `${title} | radmap.de` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "de_DE" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "de", href: url },
        { rel: "alternate", hrefLang: "de-DE", href: url },
        { rel: "alternate", hrefLang: "x-default", href: url },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${url}#collection`,
            name: title,
            description,
            url,
            inLanguage: "de-DE",
            isPartOf: { "@type": "WebSite", "@id": `${SITE}#website`, url: SITE, name: "radmap.de" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Start", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "Lexikon", item: url },
            ],
          }),
        },
      ],
    };
  },
  component: LexikonIndex,
});

// Map lexicon category -> article-category slug used on the site
const CATEGORY_ARTICLE_ROUTE: Record<string, string> = {
  "E-Bike": "e-bike",
  Sicherheit: "sicherheit",
  Antrieb: "technik",
  Bremsen: "technik",
  Ausstattung: "technik",
  Rahmen: "technik",
  Fahrwerk: "technik",
  Bikefit: "ratgeber",
  Recht: "recht",
  Zubehör: "zubehoer",
};

function categoryHref(category: string | null): string | null {
  if (!category) return null;
  const slug = CATEGORY_ARTICLE_ROUTE[category];
  return slug ? `/artikel?category=${slug}` : null;
}

function LexikonIndex() {
  const { data } = useSuspenseQuery(lexikonQuery);
  const terms = data.terms;
  const articleMap = useMemo(() => {
    const m = new Map<string, LexikonArticleRef>();
    for (const a of data.articles) m.set(a.slug, a);
    return m;
  }, [data.articles]);

  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/lexikon" });

  const [q, setQ] = useState(search.q ?? "");
  const [openSuggest, setOpenSuggest] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Sync ?q= (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({
        search: (prev: { q?: string; category?: string }) => ({
          ...prev,
          q: q.trim() ? q.trim() : undefined,
        }),
        replace: true,
      });
    }, 200);
    return () => clearTimeout(t);
  }, [q, navigate]);

  const activeCategory = search.category ?? null;

  const fuse = useMemo(
    () =>
      new Fuse(terms, {
        keys: [
          { name: "term", weight: 0.6 },
          { name: "synonyms", weight: 0.25 },
          { name: "short_definition", weight: 0.15 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [terms],
  );

  const needle = q.trim();
  const searchResults = useMemo(() => {
    if (!needle) return [] as LexikonListItem[];
    return fuse.search(needle, { limit: 40 }).map((r) => r.item);
  }, [fuse, needle]);

  const suggestions = useMemo(() => searchResults.slice(0, 8), [searchResults]);

  const displayedTerms = useMemo(() => {
    const base = needle ? searchResults : terms;
    return activeCategory ? base.filter((t) => t.category === activeCategory) : base;
  }, [needle, searchResults, terms, activeCategory]);

  const groups = useMemo(() => {
    const map = new Map<string, LexikonListItem[]>();
    for (const t of displayedTerms) {
      const letter = (t.term[0] ?? "#").toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "de"));
  }, [displayedTerms]);

  const letters = groups.map(([l]) => l);

  const allCategories = useMemo(() => {
    const s = new Set<string>();
    for (const t of terms) if (t.category) s.add(t.category);
    return Array.from(s).sort((a, b) => a.localeCompare(b, "de"));
  }, [terms]);

  // Close suggest on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenSuggest(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => setActiveIdx(0), [needle]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!openSuggest || suggestions.length === 0) {
      if (e.key === "Escape") inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = suggestions[activeIdx];
      if (pick) {
        navigate({ to: "/lexikon/$slug", params: { slug: pick.slug } });
      }
    } else if (e.key === "Escape") {
      setOpenSuggest(false);
    }
  }

  function highlight(text: string, term: string) {
    if (!term) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-signal/20 text-signal rounded px-0.5">
          {text.slice(idx, idx + term.length)}
        </mark>
        {text.slice(idx + term.length)}
      </>
    );
  }

  const setCategoryFilter = (cat: string | null) => {
    navigate({
      search: (prev: { q?: string; category?: string }) => ({
        ...prev,
        category: cat ?? undefined,
      }),
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-16 md:pt-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground">
                Start
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li className="text-foreground font-medium">Lexikon</li>
          </ol>
        </nav>

        <header className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 text-signal eyebrow mb-3">
            <BookOpen className="h-4 w-4" />
            <span>Fahrrad-Lexikon</span>
          </div>
          <h1 className="font-display font-black tracking-tight text-4xl md:text-6xl leading-[0.95]">
            Fachbegriffe rund um Fahrrad & E-Bike
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground font-light leading-relaxed">
            {terms.length} kuratierte Definitionen – von Akku und Antrieb über Bremsen und
            Bikefit bis Sicherheit und Zubehör. Verständlich erklärt, redaktionell geprüft.
          </p>
        </header>

        <div
          ref={wrapRef}
          className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-background/85 backdrop-blur-md border-b border-border"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpenSuggest(true);
              }}
              onFocus={() => setOpenSuggest(true)}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-expanded={openSuggest && suggestions.length > 0}
              aria-controls="lexikon-suggest"
              aria-autocomplete="list"
              placeholder="Begriff suchen (z. B. Pedelec, Drehmoment, MIPS)"
              className="w-full pl-10 pr-10 py-3 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-signal/50"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  inputRef.current?.focus();
                }}
                aria-label="Suche zurücksetzen"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {openSuggest && needle && (
              <div
                id="lexikon-suggest"
                role="listbox"
                className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-border bg-card shadow-xl overflow-hidden z-30"
              >
                {suggestions.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                    Kein Treffer für „{needle}“.
                  </div>
                ) : (
                  <ul className="max-h-[70vh] overflow-y-auto divide-y divide-border">
                    {suggestions.map((s, i) => {
                      const artCount = (s.related_article_slugs ?? []).length;
                      return (
                        <li key={s.slug}>
                          <Link
                            to="/lexikon/$slug"
                            params={{ slug: s.slug }}
                            role="option"
                            aria-selected={i === activeIdx}
                            onMouseEnter={() => setActiveIdx(i)}
                            className={`block px-4 py-3 transition-colors ${
                              i === activeIdx ? "bg-signal/10" : "hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="font-semibold text-foreground">
                                {highlight(s.term, needle)}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                              {s.short_definition}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {s.category && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-signal/10 text-signal">
                                  <Tag className="h-3 w-3" />
                                  {s.category}
                                </span>
                              )}
                              {artCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  {artCount} verwandte Artikel
                                </span>
                              )}
                              {(s.synonyms ?? []).slice(0, 2).map((syn) => (
                                <span
                                  key={syn}
                                  className="text-[10px] text-muted-foreground italic"
                                >
                                  ≈ {syn}
                                </span>
                              ))}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    {searchResults.length > suggestions.length && (
                      <li className="px-4 py-2 text-xs text-muted-foreground bg-muted/40">
                        {searchResults.length - suggestions.length} weitere Treffer unten in
                        der Liste.
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Category chips */}
          {allCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategoryFilter(null)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  !activeCategory
                    ? "bg-signal text-signal-foreground border-signal"
                    : "border-border text-muted-foreground hover:border-signal hover:text-signal"
                }`}
              >
                Alle
              </button>
              {allCategories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategoryFilter(activeCategory === c ? null : c)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    activeCategory === c
                      ? "bg-signal text-signal-foreground border-signal"
                      : "border-border text-muted-foreground hover:border-signal hover:text-signal"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {!needle && letters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {letters.map((l) => (
                <a
                  key={l}
                  href={`#letter-${l}`}
                  className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded border border-border hover:bg-signal hover:text-signal-foreground hover:border-signal transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 space-y-10">
          {groups.length === 0 && (
            <p className="text-muted-foreground py-16 text-center">
              Keine Begriffe gefunden{needle ? ` für „${needle}“` : ""}
              {activeCategory ? ` in Kategorie „${activeCategory}“` : ""}.
            </p>
          )}
          {groups.map(([letter, items]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-32">
              <h2 className="font-display font-black text-3xl md:text-4xl text-signal border-b border-border pb-2 mb-4">
                {letter}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {items.map((t) => {
                  const catHref = categoryHref(t.category);
                  const firstArticle = (t.related_article_slugs ?? [])
                    .map((s) => articleMap.get(s))
                    .find(Boolean);
                  return (
                    <li key={t.slug} className="group">
                      <Link
                        to="/lexikon/$slug"
                        params={{ slug: t.slug }}
                        className="block py-2"
                      >
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-foreground group-hover:text-signal transition-colors">
                            {needle ? highlight(t.term, needle) : t.term}
                          </span>
                          {t.category && (
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                              {t.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {t.short_definition}
                        </p>
                      </Link>
                      {(firstArticle || catHref) && (
                        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-0.5 pl-0">
                          {firstArticle && (
                            <Link
                              to="/artikel/$slug"
                              params={{ slug: firstArticle.slug }}
                              className="inline-flex items-center gap-1 hover:text-signal"
                            >
                              <FileText className="h-3 w-3" />
                              {firstArticle.title}
                            </Link>
                          )}
                          {catHref && (
                            <a href={catHref} className="inline-flex items-center gap-1 hover:text-signal">
                              <Tag className="h-3 w-3" />
                              Mehr zu {t.category}
                            </a>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
