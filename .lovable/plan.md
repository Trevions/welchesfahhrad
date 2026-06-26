## Goal

1. Fix hover ефекта на бутона „Eco Route Planner" (рамката да остане бяла).
2. Превърни `/fahrraeder/$slug` в най-пълната, премиум страница за велосипед — с разширена база, нов админ, side-by-side сравнение до 4 велосипеда, потребителски отзиви и интерактивни калкулатори.

Всичко в един голям PR.

---

## 1. Hover fix (бърз)

`src/routes/index.tsx` — Eco Route Planner бутон:
- Премахни `hover:bg-white`, `hover:border-white`, `hover:text-[#050505]`.
- Запази `border-white/60` постоянно. Hover само за лек fade на фон/иконата (`hover:bg-white/5`), без промяна на цвета на рамката или текста.

---

## 2. Разширена база данни (миграция)

### `bikes` — нови JSONB колони (групирани, за да не правим 60 нови полета)

- `geometry jsonb` — wheelbase, stack, reach, seat_tube, head_tube, bottom_bracket, max_rider_weight_kg, frame_weight_kg, …
- `cockpit jsonb` — handlebar, stem, seatpost, saddle, grips
- `wheelset jsonb` — rims, hubs, spokes, tubeless_ready, tire_pressure_recommended
- `drivetrain_detail jsonb` — crankset, bb, chain, cassette, rear_der, front_der, shifters, pedals, gear_ratios
- `brakes_detail jsonb` — model, rotor_front_mm, rotor_rear_mm, type
- `ebike_detail jsonb` (надстройка над `ebike`) — peak_power_w, voltage, ah, cell_type, charge_cycles, dual_battery, fast_charging, bluetooth, gps, app, ota, walk_assist, usb_charging, security_features[], assist_modes[]
- `suitability jsonb` — { beginner, intermediate, pro, commuting, touring, gravel, mountain, bikepacking, city, family, cargo, racing } всяко 0–10
- `performance jsonb` — { ratings: comfort, handling, cornering, stability, acceleration, climbing, descending, offroad, city, longdistance, sportiness, suspension }
- `range_matrix jsonb` — { eco/tour/sport/turbo × 60/75/90/110kg × flat/hills/mountains/cold/summer/headwind }
- `maintenance jsonb` — schedule, chain_km, brake_pads_km, disc_km, battery_care, suspension_service_km, lubricants, annual_cost_eur
- `costs jsonb` — electricity_kwh_price, cost_per_charge_eur, cost_per_100km_eur, annual_electricity_eur, five_year_total_eur
- `environmental jsonb` — co2_saved_kg_year, fuel_saved_l_year, money_saved_eur_year, trees_equivalent, sustainability_score
- `safety_features jsonb` — integrated_lights, abs, gps, alarm, frame_lock, airtag, nfc, recommended_locks[], visibility_score, night_score
- `accessories jsonb` — compatible[] (mudguards, racks, bags, …)
- `awards jsonb` — [{ name, year, source }]
- `model_history jsonb` — launch_year, previous_generations[], whats_new, improvements, known_issues, common_upgrades
- `videos jsonb` — [{ url, title }]
- `availability text`
- `expert_rating numeric(3,1)`
- `faq jsonb` — [{ q, a }] (AI-генерира при save или при on-demand)
- `ai_summary jsonb` — { strengths, weaknesses, best_for, avoid_if, alternatives }

Всички DEFAULT `'{}'::jsonb` / `'[]'::jsonb` — обратна съвместимост запазена.

### Нови таблици

`bike_reviews`:
- id, bike_id (fk → bikes), user_id (fk → auth.users), rating int 1–10, title, body, photos jsonb default '[]', verified_owner bool, created_at, updated_at
- RLS: всеки (anon) може SELECT (само `status='published'`); authenticated INSERT със собствен user_id; UPDATE/DELETE собствен; admin всичко. GRANT SELECT TO anon, ALL CRUD TO authenticated, ALL TO service_role.
- status text default 'published' (бъдеща модерация).

`bike_review_votes` (опционално helpful votes) — пропускаме за първи PR.

### Грантове и RLS

Всеки CREATE TABLE → GRANT → ENABLE RLS → POLICIES, по правилата.

---

## 3. Админ панел — `BikeEditor` разширение

`src/components/admin/BikeEditor.tsx`:
- Нов tab navigation: **Basis · Geometrie · Cockpit · Antrieb · Bremsen · Laufräder · E-Bike · Eignung · Performance · Reichweite · Wartung · Kosten · Umwelt · Sicherheit · Zubehör · Auszeichnungen · Historie · Medien · SEO**.
- Всеки таб = форма за съответната JSONB група.
- Бутон **„AI ausfüllen"** (използва Lovable AI Gateway, `google/gemini-2.5-flash`) — попълва празни полета на база `brand + model + year`. Реализирано чрез нов server fn `generateBikeMeta`.
- Запазва се видът на listing/edit маршрутите (`mnv/bikes`, `mnv/bikes_/new`, `mnv/bikes_/$id`).

---

## 4. Premium UI редизайн на `/fahrraeder/$slug`

Пълно пренаписване на `src/routes/fahrraeder.$slug.tsx` + нови компоненти под `src/components/bikes/detail/`:

### Структура (sticky sidebar nav вляво на desktop, top tabs на mobile)

```
Hero
├─ Gallery (main + thumbnails, lightbox, video секция ако videos[])
├─ Title block (brand · model · year · category badge · awards)
├─ Rating block (Expert score, User score) + price
└─ Action bar: [Vergleichen] [Merken] [Teilen] [Drucken] [Specs kopieren] [Hersteller-Website]

QuickFacts (8 карти: Gewicht · Material · Motor · Akku · Reichweite · Top-Speed · Federweg · Räder · Schaltung · Bremsen)

Wofür ist dieses Rad? (12 use-case карти със score bars 1–10)

Vollständige Specs (tabs / accordion: Rahmen, Cockpit, Laufräder, Antrieb, Bremsen, E-Bike-System)

Realistische Reichweite (interactive chart — switcher Eco/Tour/Sport/Turbo × Gewicht × Bedingungen)

Fahrgefühl & Komfort (radar chart с 12 оценки)

Wartung (timeline-card)

Laufende Kosten (interactive калкулатор — kWh цена slider, km/година slider → 5-year cost, vs auto, vs MIV)

Umweltbilanz (карти + estimated CO₂/година)

Sicherheit (карти + score-rings)

Kompatibles Zubehör (icon grid)

Smart-Rechner (linkове към съществуващите /tools)

KI-Analyse (strengths/weaknesses/best for/avoid)

Pros & Cons (вече има — restyle)

FAQ (accordion)

Modell-Historie (timeline)

Reviews (експертни + user, формуляр за authenticated user)

Vergleich-Banner ("Mit anderem Rad vergleichen")
```

### Sticky навигация
- Desktop: лява колона sticky `<nav>` с ankor линкове + scrollspy подсветка на активна секция (IntersectionObserver).
- Mobile: top horizontal sticky scroller под header.

### Search inside page
- Малък search input в sticky nav — филтрира видими секции по ключови думи (client-side `useMemo` индекс на section titles + spec keys).

### Действия
- **Vergleichen** → toggle в localStorage `radmap.compare[]` (max 4) + toast + бутон навигира към `/vergleich`.
- **Merken** → използва съществуващия `useBookmarks`.
- **Teilen** → съществуващ `ShareMenu`.
- **Drucken** → `window.print()` + print CSS (`@media print` в `src/styles.css` — премахни sticky/sidebars).
- **Specs kopieren** → JSON/Markdown в clipboard.

### Dark mode
- Само семантични токени (`bg-card`, `text-foreground`, `border-border`, `text-signal`). Никакви hardcoded цветове.

---

## 5. Сравнителна страница `/vergleich`

Нов рут `src/routes/vergleich.tsx`:
- Чете до 4 slug-а от search params.
- Сравнителна таблица (всички spec групи vertical, велосипеди в колони).
- Подсветва: най-добра стойност в зелено, най-лоша в червено (numeric specs).
- "Радар overlay" — superimposed radar на performance ratings.
- Selector за добавяне/смяна (autocomplete от `bikes` таблицата).
- Public route (без auth).

---

## 6. Отзиви

Компонент `BikeReviewsSection`:
- Списък с публикувани отзиви (rating, title, body, verified badge, дата).
- Average + distribution histogram.
- За authenticated: формуляр (Zod validation, max length).
- За anonymous: CTA „Anmelden um eine Bewertung zu schreiben".

Server fns в `src/lib/bike-reviews.functions.ts`:
- `listBikeReviews({ bikeId })` — публичен (server publishable client).
- `submitBikeReview({ bikeId, rating, title, body })` — `requireSupabaseAuth`.
- `deleteBikeReview({ id })` — own или admin.

---

## 7. Интерактивни калкулатори (в страницата)

- **Reichweiten-Simulator**: slider за weight, terrain, weather, assist → използва `range_matrix` за interpolation.
- **Kostenrechner**: slider за kWh цена, km/година, charges/седмица → output 5-year cost, ROI vs auto/public.
- **CO₂-Sparen**: km/год × emission factor → kg CO₂/год + дървета.
- Recharts за всички графики (вече dependency).

---

## 8. SEO

- JSON-LD: разшири с `Product`, `AggregateRating` (от reviews), `FAQPage` (от faq[]), `BreadcrumbList`.
- og:image от gallery[0].
- meta description от `ai_summary.best_for` като fallback.

---

## 9. Технически детайли

- Нови файлове:
  - `src/components/bikes/detail/StickyNav.tsx`
  - `src/components/bikes/detail/HeroBlock.tsx`
  - `src/components/bikes/detail/QuickFactsGrid.tsx`
  - `src/components/bikes/detail/SuitabilityGrid.tsx`
  - `src/components/bikes/detail/SpecsTabs.tsx`
  - `src/components/bikes/detail/RangeSimulator.tsx`
  - `src/components/bikes/detail/CostCalculator.tsx`
  - `src/components/bikes/detail/EnvironmentCards.tsx`
  - `src/components/bikes/detail/SafetyCards.tsx`
  - `src/components/bikes/detail/AccessoryGrid.tsx`
  - `src/components/bikes/detail/AiAnalysis.tsx`
  - `src/components/bikes/detail/FaqAccordion.tsx`
  - `src/components/bikes/detail/HistoryTimeline.tsx`
  - `src/components/bikes/detail/ReviewsSection.tsx`
  - `src/components/bikes/detail/ActionBar.tsx`
  - `src/components/bikes/detail/CompareDrawer.tsx`
  - `src/lib/bike-compare.ts` (localStorage)
  - `src/lib/bike-reviews.functions.ts`
  - `src/lib/bike-ai.functions.ts` (AI fill, AI summary, FAQ gen)
  - `src/routes/vergleich.tsx`
- Разшири: `src/lib/bike-types.ts`, `src/lib/bikes.functions.ts`, `src/components/admin/BikeEditor.tsx`.
- Print CSS блок в `src/styles.css`.

---

## Ред на изпълнение

1. Hover fix.
2. Миграция (bikes JSONB + bike_reviews + RLS + GRANT). 
3. Обнови `bike-types.ts` и server fns.
4. Разшири `BikeEditor` с табове и AI fill.
5. Изгради новата детайл страница + всички компоненти.
6. `/vergleich` страница.
7. Reviews UI + server fns.
8. SEO JSON-LD разширение.
9. Build + sanity check.

Поради големия обхват очаквай ~25-30 нови/променени файла и една миграция.