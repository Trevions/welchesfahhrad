## Какво ще се промени

Цялостен ре-дизайн на radmap.de към премиум немско cycling списание в "Split Magazine" посока (избраното направление v2). Без backend промени — само визуален слой и presentation код.

### 1. Дизайн система (`src/styles.css`)

Нова палитра, заменя текущата:
- `--background` → `#050505` (deep noir)
- `--foreground` → `oklch(0.96 0.005 80)` (warm bone)
- `--card` / `--surface` → `oklch(0.10 0.005 250)` (zinc-950)
- `--border` → `oklch(0.25 0.005 250 / 0.6)` (zinc-800)
- `--signal` (акцент) → `#FF6A1A` (живо оранжево като в прототипа)
- `--muted-foreground` → zinc-500
- Светла тема: топла хартия (`#F5F2EC`), черно мастило, същият оранжев акцент

Типография — нови шрифтове през `<link>` в `__root.tsx`:
- `--font-display: "Playfair Display"` (черен 900, italic) — заглавия
- `--font-sans: "Inter"` (300/400/600/700) — body
- Заглавия с `tracking-tighter`, `leading-[0.85]`, поддръжка на italic accent (както в прототипа: "Die *Evolution* des Vortriebs")

Премахвам неона/glow ефектите. Добавям нови utilities: `editorial-rule` (тънка 1px линия с отстъп), `eyebrow` (10px uppercase tracking-[0.4em]).

### 2. Home page (`src/routes/index.tsx`)

Пълно пренаписване по split layout:

```text
┌─────────────────────────────────────────┬─────────────┐
│                                         │  Radmap.    │
│                                         ├─────────────┤
│      cinematic hero image               │  Urban      │
│      (zinc-950 vignette gradient)       │  headline 1 │
│                                         │  · 4 Min    │
│      ─── EXKLUSIV TEST                  ├─────────────┤
│                                         │  Technik    │
│      Die Evolution                      │  headline 2 │
│      des Vortriebs.                     ├─────────────┤
│      (Playfair 8xl, italic accent)      │  Lifestyle  │
│                                         │  headline 3 │
│      Lead + [Vollständiger Bericht →]   ├─────────────┤
│                                         │  Magazin    │
│                                         │  Ausgabe 24 │
└─────────────────────────────────────────┴─────────────┘
```

- 12-колонна grid: 8 cols cinematic feature + 4 cols editorial feed
- Под този split — broken-grid секция с 6 статии (mixed размери, overlapping eyebrow tags, rule lines)
- Хоризонтално-скрол ред "Tests & Reviews" с рейтинг chips
- Ratgeber блок (3 големи карти с номера 01/02/03)
- Newsletter capture (минимален, 1 input + бутон, без gradient)
- Премахва се "stat strip" (2.4M / 150+ / 24/7) — изглежда фалшиво

### 3. Компоненти

- `Header.tsx` — нов sticky desktop header: ляво wordmark `Radmap.` (Playfair italic с оранжева точка), център категории (NACHRICHTEN · RATGEBER · E-BIKES · TESTS, eyebrow стил), дясно търсене + Admin + theme toggle
- `MobileHeader.tsx` — компактен: wordmark вляво, theme toggle + търсене вдясно, тънък border-bottom
- `MobileNav.tsx` — bottom tab bar пренаписан: плосък черен (`bg-zinc-950/95 backdrop-blur`), активен item с оранжева 2px top-rule (не glow), 5 таба
- `ArticleCard.tsx` — пренаписан: image отгоре с grayscale → hover color, eyebrow категория, Playfair заглавие, мета ред с rule line, без glass ефект
- Нов `EditorialFeed.tsx` — вертикалните divide-y списъчни елементи от split-а
- Нов `MagazineBlock.tsx` — corner блок с magazine cover thumbnail
- Нов `CategoryRule.tsx` — стандартния "─── EYEBROW" patterns
- `Footer.tsx` — преработен: 4-колонен, тънки rule линии, малки caps, без emoji/gradient

### 4. Други страници (същия език)

- `nachrichten.tsx`, `ratgeber.tsx`, `e-bikes.tsx`, `tests.tsx` — нов pattern: голям category masthead (eyebrow + Playfair заглавие + lead), под него 2-колонен список feature + side editorial list
- `artikel.$slug.tsx` — нова article shell: голям cinematic cover, eyebrow + Playfair заглавие (както в screenshot но с правилен контраст), мета ред (дата · време · автор), drop cap на първи параграф, ширина max-w-2xl за прозата, share rail отстрани (desktop), повече bottom padding за mobile (за bottom tab bar)
- `admin.tsx` — пасва стила (Playfair masthead, плоски форми)

### 5. Анимации (леки, без претрупване)

- Hero headline: mask-reveal на load (clip-path по линии)
- Feature image: subtle parallax при scroll (transform: translateY) + grayscale → color при hover
- Cards: image scale 1→1.04 + eyebrow цвят промяна при hover
- Bottom nav active state: оранжев top-rule с smooth transition
- Editorial feed items: leftborder rule расте при hover

### 6. Снимки

Генерирам 6 нови cinematic снимки през `imagegen` (premium model за heroes):
- Нов hero: matte black e-bike frame, dramatic studio lighting, high contrast (16:9 кинематографично)
- Magazine cover thumbnail (portrait)
- 4 нови thumbnail-а за категориите (нов news image, нов e-bike, нов ratgeber, нов test). Стилът: high-contrast, grain, single light source — премахва текущите "vivid blue" stock-looking снимки

### 7. Технически файлове

Без промени по: `routeTree.gen.ts` (авто), API/backend, `lib/articles.ts` (данните остават), маршрутизация.

Промени по: всички файлове в `src/components/`, всички route файлове, `src/styles.css`, `__root.tsx` (добавям `<link>` за Playfair + Inter в head).

### Извън обхват (за следващ етап)

- Свързване на Perplexity + Lovable AI за автоматично теглене и пренаписване на новини
- Admin login защита и реален CRUD за статии
- Database (Lovable Cloud)
- Image scraping / auto-thumbnail генерация за новини

Тези ще ги направим в Етап 2 след като приемеш визуалния резултат.

### Резултат

Сайт с editorial premium усещане (Monocle × Rapha × Apple Newsroom), нула gradient заглавия с лош контраст, оранжев акцент вместо неонова cyan, magazine-grade типография на немски, mobile bottom tab bar който изглежда professional.