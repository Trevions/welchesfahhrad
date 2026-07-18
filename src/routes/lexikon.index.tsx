import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { getLexikonTerms, type LexikonListItem } from "@/lib/lexikon.functions";

const SITE = "https://radmap.de";

const lexikonQuery = queryOptions({
  queryKey: ["lexikon-terms"],
  queryFn: () => getLexikonTerms(),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/lexikon/")({
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
      links: [{ rel: "canonical", href: url }],
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

function LexikonIndex() {
  const { data } = useSuspenseQuery(lexikonQuery);
  const terms = data.terms;
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return terms;
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(needle) ||
        t.short_definition?.toLowerCase().includes(needle) ||
        (t.synonyms ?? []).some((s) => s.toLowerCase().includes(needle)),
    );
  }, [terms, q]);

  const groups = useMemo(() => {
    const map = new Map<string, LexikonListItem[]>();
    for (const t of filtered) {
      const letter = (t.term[0] ?? "#").toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "de"));
  }, [filtered]);

  const letters = groups.map(([l]) => l);

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

        <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-background/85 backdrop-blur-md border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Begriff suchen (z. B. Pedelec, Drehmoment, MIPS)"
              className="w-full pl-10 pr-4 py-3 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-signal/50"
            />
          </div>
          {letters.length > 0 && (
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
              Keine Begriffe gefunden für „{q}“.
            </p>
          )}
          {groups.map(([letter, items]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
              <h2 className="font-display font-black text-3xl md:text-4xl text-signal border-b border-border pb-2 mb-4">
                {letter}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {items.map((t) => (
                  <li key={t.slug}>
                    <Link
                      to="/lexikon/$slug"
                      params={{ slug: t.slug }}
                      className="group block py-2"
                    >
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-semibold text-foreground group-hover:text-signal transition-colors">
                          {t.term}
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
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
