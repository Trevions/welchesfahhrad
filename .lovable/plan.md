## Какво ще построим

Истински, професионален Admin Cockpit за **radmap.de** — на ниво Linear/Vercel/Notion, с реална база, login защита и пълно управление на съдържанието. Не презентация, а работещ инструмент.

### 1. Lovable Cloud (backend)

Активирам Lovable Cloud и създавам:

**Tables:**
- `profiles` (id → auth.users, display_name, avatar_url, created_at) + RLS + trigger за auto-create при signup
- `user_roles` (id, user_id, role enum: 'admin'|'editor'|'user') + security definer `has_role()` функция (анти-recursive RLS pattern)
- `articles` (id, slug unique, title, excerpt, body, cover_image, category enum: nachrichten|ratgeber|e-bikes|tests, author_id, status: draft|published, published_at, read_time, seo_title, seo_description, seo_keywords, og_image, created_at, updated_at, view_count) + RLS: публикуваните се четат от всички; чернови и mutations само admin/editor
- Storage bucket `article-images` (public read, admin write) за cover-и и inline снимки

**Seed:** мигрирам текущите статии от `src/lib/articles.ts` в таблицата при първа стъпка.

**Auth:** Email+password и Google sign-in (през Lovable broker). Първият регистриран user получава автоматично admin рола (one-time trigger). Останалите регистрации са обикновени users.

### 2. Архитектура на маршрутите

```text
src/routes/
  auth.tsx                          # public login/signup (email + Google)
  _authenticated/
    route.tsx                       # integration-managed gate
    admin.tsx                       # layout с sidebar (само admin/editor — has_role check)
    admin.index.tsx                 # dashboard
    admin.articles.tsx              # списък/таблица
    admin.articles.new.tsx          # нов
    admin.articles.$id.edit.tsx     # редакция
    admin.media.tsx                 # библиотека
    admin.users.tsx                 # потребители + роли
    admin.settings.tsx              # SEO defaults, site config
```

Frontend route файловете (`/nachrichten`, `/artikel/$slug`, и т.н.) се преписват да четат от Supabase server fns вместо от `articles.ts`.

### 3. Admin UI (професионален dashboard стил)

**Layout:**
- Lq sidebar 240px: лого "Radmap. **Admin**", навигация (Dashboard, Artikel, Medien, Benutzer, Einstellungen) с lucide icons, активен item с лява оранжева 2px линия. Долу: avatar + email + logout.
- Главен content area: top bar (breadcrumb + search + "New article" CTA + theme toggle), след това page content. Тъмен dense layout (`bg-zinc-950`, `border-zinc-800`), но с същите оранжеви акценти за consistency.
- Responsive: на mobile sidebar става drawer (Sheet от shadcn).

**Dashboard (`/admin`):**
- 4 stat карти: общо статии, публикувани, чернови, views (последни 30 дни) — с малки sparkline/trend индикатори
- "Recent articles" таблица (последни 10) с inline status badges и quick actions
- "By category" donut chart (recharts)
- "Activity feed" — последни 8 промени (created/updated/published)

**Articles list (`/admin/articles`):**
- Pro data table: cover thumb, title + slug, category badge, status pill (draft/published), author, дата, views, actions
- Filters: search (debounced), category dropdown, status tabs (All/Published/Draft), sort by date/views
- Bulk actions (select rows → publish/unpublish/delete)
- Pagination + URL-synced search params
- Hover row reveals row actions (Edit, View, Duplicate, Delete с AlertDialog)

**Article editor (`/admin/articles/new` и `/edit`):**
- Split: ляво форма, дясно live preview (мини-карта as it'd render)
- Полета: title (auto-slug с manual override), category, excerpt, cover image (drag-drop upload към bucket с crop preview), body (rich-text editor — Tiptap с toolbar: H2/H3, bold/italic, link, list, quote, image insert от media library, code), read time (auto-calc от word count)
- Sticky right rail: status toggle, scheduled publish date picker, author select
- Collapsible "SEO" секция: SEO title (с char counter / 60), meta description (160), keywords tags input, OG image override, slug, canonical preview ("radmap.de/artikel/...")
- Autosave на drafts всеки 5s (toast indicator), keyboard shortcuts (⌘S save, ⌘⏎ publish)
- Form validation с zod + react-hook-form, inline errors

**Media library (`/admin/media`):**
- Grid от качените снимки в storage bucket
- Drag & drop upload (multi-file), progress bars
- Click → details panel с URL copy, dimensions, size, "Use as cover" бутон, delete
- Search по filename

**Users (`/admin/users`):**
- Таблица: avatar, email, display name, роли (badges), joined, last sign-in
- Action: promote to admin/editor, demote, view profile
- Само super-admin (първият user) може да променя роли

**Settings (`/admin/settings`):**
- Site-wide SEO defaults (default OG image, default meta description fallback)
- Newsletter integration placeholder
- Theme preferences

### 4. Server functions (`src/lib/admin.functions.ts`)

Всички защитени с `requireSupabaseAuth` + проверка `has_role(userId, 'admin' | 'editor')`:
- `listArticles({ filters, pagination })`, `getArticle(id)`, `createArticle`, `updateArticle`, `deleteArticle`, `bulkUpdateStatus`
- `uploadMedia`, `listMedia`, `deleteMedia` (signed upload през supabaseAdmin вътре в handler)
- `listUsers`, `assignRole`, `revokeRole` (само admin)
- `getDashboardStats` (counts + 30d trend)

Public reads за frontend (`getPublishedArticles`, `getArticleBySlug`, `getArticlesByCategory`) — без auth, използват supabaseAdmin със safe column projection.

### 5. Дизайн детайли

- Семантични CSS токени: добавям `--admin-bg`, `--admin-surface`, `--admin-border`, `--admin-sidebar` в `styles.css` (тъмна Linear-like палитра, оранжев signal остава)
- Типография: Inter sans за UI dense текст, Playfair само за logo/page titles
- Микро-анимации: Motion за sidebar item hover, status badge pulse при publish, toast slide-in
- Shadcn компоненти: Table, Dialog, Sheet, AlertDialog, Tabs, Badge, Toast (Sonner), Select, Tooltip, Progress, Avatar, Command (за ⌘K търсене)
- Loading states: skeleton rows за таблици, spinner за бутони
- Empty states: илюстрирани placeholder-и с CTA
- Keyboard: ⌘K command palette за бърза навигация и actions
- Toast notifications за всяко действие (success/error)

### 6. SEO & frontend integration

- Frontend категорийните страници и `/artikel/$slug` четат от Supabase
- `head()` метаданни се генерират от `seo_title`/`seo_description`/`og_image` полетата
- `sitemap.xml` route се обновява да pull-ва published статии от базата
- View counter increment при visit на статия (server fn)

### 7. Извън обхват за тази итерация

- AI pipeline (Perplexity auto-news + AI rewrite) — следваща стъпка след като CRUD-а работи
- Real-time collaboration на editor
- Comments система
- Multi-language

### Файлове

**Нови:** ~14 route файла под `_authenticated/admin.*`, `auth.tsx`, `src/components/admin/` (Sidebar, TopBar, StatCard, ArticlesTable, ArticleEditor, MediaGrid, MediaUploader, RichTextEditor, CommandPalette, UserRolesTable), `src/lib/admin.functions.ts`, `src/lib/public-articles.functions.ts`, migration файл

**Променени:** `src/styles.css` (admin токени), `src/routes/__root.tsx` (auth listener), `src/start.ts` (attachSupabaseAuth ако още не е), `src/routes/nachrichten.tsx` / `ratgeber.tsx` / `e-bikes.tsx` / `tests.tsx` / `artikel.$slug.tsx` / `index.tsx` (четене от Supabase), `src/routes/sitemap[.]xml.ts`, остарелият `src/routes/admin.tsx` се премахва

### Резултат

Реален admin кокпит, на който можеш всеки ден да създаваш и публикуваш статии с rich text, snimки, SEO полета и schedule, да виждаш статистики и да управляваш потребители — всичко зад истински login, с дизайн на ниво модерен SaaS dashboard.
