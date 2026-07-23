# План: Само светла тема + премахване на Новини, Карта и Инструменти

## 1. Само светла тема (без превключвател)

- `src/components/ThemeProvider.tsx` → фиксирано `light`, без localStorage, без toggle
- Изтриване на `src/components/ThemeToggle.tsx`
- Премахване на `<ThemeToggle />` от `Header.tsx` и `MobileHeader.tsx`
- В `src/routes/__root.tsx` — задаване на `class="light"` на `<html>` и премахване на `color-scheme: dark`
- `src/styles.css` — правя `light` дефолт; `.dark` селекторите остават неупотребени (безопасно)

## 2. Изтриване на разделите Новини / Карта / Инструменти

**Route файлове (изтриване):**
- `src/routes/nachrichten.tsx`
- `src/routes/karte.tsx`
- Всички `src/routes/tools.*.tsx` (35 файла, вкл. `tools.tsx` и `tools.index.tsx`)
- `src/routes/news-sitemap[.]xml.ts` (news sitemap вече няма смисъл)

**Компоненти (изтриване):**
- `src/components/karte/InteractiveMap.tsx`
- `src/components/tools/` цялата папка (ToolShell, ToolSeo, EcoRoutePlanner, kaufberater/*)
- `src/components/BikeWeatherBar.tsx`, `BikeWeatherDetails.tsx`, `RadelScoreBadge.tsx` (само за tools)
- `src/lib/tools/`, `src/lib/kaufberater/`

**Навигация / линкове (почистване):**
- `Header.tsx`, `MobileNav.tsx`, `MobileHeader.tsx`, `Footer.tsx` — премахване на линкове към /nachrichten, /karte, /tools
- `src/routes/index.tsx` — премахване на секции с новини/инструменти/карта
- `src/routes/artikel.$slug.tsx`, `fahrraeder.$slug.tsx`, `lexikon.$slug.tsx`, `passt-zu-dir.tsx`, `ueber-uns.tsx` — премахване на импорти/референции към tools/karte

**Backend / MCP / SEO:**
- `src/lib/mcp/index.ts` + `src/lib/mcp/tools/tools_meta.ts` — премахване на tools_meta регистрацията
- `src/routes/[.mcp]/list-tools.ts` — почистване
- `src/routes/sitemap[.]xml.ts` — премахване на tools/karte/nachrichten URL-и
- `src/lib/indexnow.server.ts`, `src/lib/articles.ts` — премахване на препратки
- `public/llms.txt`, `public/robots.txt` — премахване на споменавания

## 3. Какво остава непокътнато

Статии (artikel), Ратгебер, Фахрредер (велосипеди), Лексикон, Мои-Рад, Меркliste, Фаворити, Пасст-зу-дир, Vergleich (сравнение на велосипеди — това е bike-compare, не tools), контакт, правни страници, админ панел, newsletter, doklad-статии.

## Технически бележки

- `routeTree.gen.ts` се регенерира автоматично след триене на route файлове — не го пипам ръчно.
- След триенето ще проверя build-а и ще поправя всеки счупен импорт.
- Данните в базата за tools/karte-related анализи остават, но не се показват никъде.

Потвърди и започвам.
