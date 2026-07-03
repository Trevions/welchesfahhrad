import { reviewedAt } from "./reviewed";

export type Faq = { question: string; answer: string };
export type HowToStep = { name: string; text: string };

export function toolHead(opts: {
  title: string;
  description: string;
  path: string;
  slug?: string;
  faq?: Faq[];
  howTo?: { name: string; steps: HowToStep[] };
}) {
  const fullTitle = `${opts.title} | radmap.de`;
  const url = `https://radmap.de${opts.path}`;
  const dateModified = opts.slug ? reviewedAt(opts.slug) : undefined;

  const scripts: Array<{ type: string; children: string }> = [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: opts.title,
        description: opts.description,
        url,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        inLanguage: "de-DE",
        publisher: {
          "@type": "Organization",
          name: "radmap.de",
          url: "https://radmap.de",
        },
        ...(dateModified ? { dateModified } : {}),
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      }),
    },
  ];

  if (opts.faq && opts.faq.length > 0) {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: opts.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }),
    });
  }

  if (opts.howTo) {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: opts.howTo.name,
        step: opts.howTo.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      }),
    });
  }

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: opts.description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: opts.description },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts,
  };
}
