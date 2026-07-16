План за прилагане на SEO мастерплана. Планът е разделен на 3 фази — първо ще направя Фаза 1 (техническия фундамент), после ще питам за приоритетите на Фаза 2/3, защото част от тях изискват създаване на много ново съдържание (Lexikon, Pillar Pages).

---

## Какво вече е готово (проверих преди плана)

- Meta/OG/Twitter/canonical/hreflang за статии и велосипеди — готово (последно обновяване).
- `NewsArticle`, `Product`, `BreadcrumbList`, `FAQPage` (Tools), `SoftwareApplication` schema — готово.
- `sitemap.xml` + `news-sitemap.xml` + `robots.txt` + IndexNow + GSC ping — готово.
- Canonical/OG:URL self-reference, ISO дати, `article:published/modified_time` — готово.
- Core Web Vitals (LCP preload, lazy, font-display swap, size-adjust, code-splitting) — готово.
- Tools имат eigene URLs, H1, SEO текст, FAQ schema, "Zuletzt geprüft", Redaktion badge — готово.

## Фаза 1 — Sofort (в тази сесия)

1. **Global WebSite + Organization + SearchAction JSON-LD** в `__root.tsx` (sitewide), със `sameAs` (ще ги оставя празни докато не ми дадеш соц. профилите).
2. **BreadcrumbList schema** на артикулната страница `artikel.$slug.tsx` (Start → Kategorie → Artikel) — засега липсва, само на bike и tools го има.
3. **HowTo schema** — автоматично разпознаване на "Anleitung"/"Ratgeber" статии с номерирани стъпки в тялото и генериране на `HowTo` JSON-LD (opt-in чрез frontmatter поле `howto_steps`).
4. **`max-image-preview:large`** в root robots meta (за Discover/News rich results).
5. **Autor-Box + "Zuletzt aktualisiert"** видимо под всяка статия (E-E-A-T).
6. **"Weiterlesen"-Box** в края на статия — 3 свързани артикула по категория (използвам съществуващия `recommendations.ts`).
7. **Sichtbare Breadcrumbs** на артикулните страници (Start → Kategorie → Titel), matching JSON-LD.
8. **Alt-текст quality gate** — в `ArticleEditor` warning ако alt е празен, "bild", или само keyword-stuffing pattern.

## Фаза 2 — Тази/следващата сесия (изисква съгласие)

9. **Lexikon секция** (`/lexikon/`, `/lexikon/$slug`) с `DefinedTerm` schema, template страница, sitemap интеграция. Ще започна с ~30 термина от списъка ти. **Пита:** искаш ли AI да генерира първоначалните дефиниции, или ще ги подадеш?
10. **Pillar Pages** за 3-те най-силни клъстъра (Akku, Kaufberatung, Sicherheit) — редакционни hub страници с интро + линкове към cluster статиите + FAQ. **Пита:** изчакваме ли докато има повече cluster статии, или създаваме pillar-ите сега като "hub" с наличното?
11. **Vergleichsseiten** (`/vergleich/bosch-vs-shimano` и т.н.) — 6 страници с Product comparison schema.

## Фаза 3 — Content pipeline (не е код-задача)

12. Писане на 60+ клъстърни статии по списъка — това е редакционна работа, не мога да я направя автоматично без да наруша качеството. Мога да ти направя админ инструмент "Cluster Planner" който показва кои от планираните заглавия още липсват в базата.

---

## Технически детайли (за референция)

- Файлове за Фаза 1: `src/routes/__root.tsx`, `src/routes/artikel.$slug.tsx`, `src/components/admin/ArticleEditor.tsx`, нов `src/components/articles/Breadcrumbs.tsx`, нов `src/components/articles/AuthorBox.tsx`, нов `src/components/articles/RelatedArticles.tsx`.
- Lexikon (Фаза 2): нов `src/routes/lexikon.index.tsx` + `src/routes/lexikon.$slug.tsx`, нова таблица `lexikon_terms` в Cloud DB с GRANT+RLS, sitemap entry.
- Няма да пипам вече готовите tools/bike SEO блокове.

---

Ако одобриш, изпълнявам **Фаза 1** веднага и след това ще те попитам конкретно за Фаза 2 (Lexikon initial content + Pillar strategy).
