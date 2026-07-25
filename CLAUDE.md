# welchesfahrrad.de

German bike/e-bike comparison and editorial site (welchesfahrrad.de). Public
site (articles, bike database, comparison tools, "Lexikon" glossary) plus an
admin/editorial backoffice at `/mnv/*`, and a first-party MCP server that
exposes the same admin operations as tools for AI agents.

## Stack

- **TanStack Start + TanStack Router**, file-based routing. This is **NOT
  Next.js**. `package.json`'s internal `name` is `tanstack_start_ts` — ignore
  it, it's a template artifact, not a hint to use Next.js/Remix conventions.
- Vite 8, SSR via `nitro`, deployed to Cloudflare (nitro's `cloudflare`
  target is wired up by the shared vite config, see below).
- React 19, TypeScript 5.8 (strict mode; `noUnusedLocals`/`noUnusedParameters`
  are OFF).
- **Bun** is the primary package manager — `bun.lock` is the source of truth.
  A `package-lock.json` also exists; don't trust it over `bun.lock`.
- `bunfig.toml` sets a 24h supply-chain guard (`minimumReleaseAge`) that
  blocks installing package versions published less than a day ago, with an
  explicit exclude list for `@lovable.dev/*` packages. Confirm with the user
  before adding new excludes.
- **Lovable platform packages** (`@lovable.dev/*`) are load-bearing, not
  optional integrations: `@lovable.dev/vite-tanstack-config` (shared vite
  config), `@lovable.dev/mcp-js` (the MCP server framework used in
  `src/lib/mcp`), `@lovable.dev/cloud-auth-js`, `@lovable.dev/email-js`,
  `@lovable.dev/webhooks-js`.
- No test framework/script is configured. `bun run lint` (ESLint) and
  `bun run format` (Prettier) are the only checks available; there is no
  `bun run test`.

### vite.config.ts

`@lovable.dev/vite-tanstack-config`'s `defineConfig` already wires up
`tanstackStart`, `viteReact`, `tailwindcss`, `tsConfigPaths`, nitro
(Cloudflare target by default), the dev-only component tagger, `VITE_*` env
injection, the `@` path alias, React/TanStack dedupe, error-logger plugins,
and sandbox port/host detection. **Do not manually add any of those
plugins** — duplicates break the app. Only extend via the `vite`/`tanstackStart`
keys passed into `defineConfig`. The repo redirects TanStack Start's server
entry to `src/server.ts`, a thin wrapper that also catches h3's swallowed
in-handler throws (which surface as 500 JSON `{"unhandled":true,...}`
instead of a real error) and renders a real error page for them.

## Styling — read before touching any design

- Tailwind CSS v4 via `@tailwindcss/vite`, CSS-first config. **There is no
  `tailwind.config.js`/`.ts` — do not create one.**
- All design tokens live in `src/styles.css` inside `@theme inline { ... }`.
- Colors are `oklch()`/hex CSS variables under `:root` / `.light` / `.dark`.
- Accent color token is `--signal` (`#3d5afe`, "electric cobalt" per the
  in-file comment) → exposed as `--color-signal` / Tailwind class
  `text-signal` etc. Note: some UI copy (e.g. the admin sign-in screen) uses
  a hardcoded orange `#FF6A1A` instead of the `--signal` token — that's an
  inconsistency in the code, not a second official accent color.
- Fonts: **DM Serif Display** for headlines (`--font-display`), **Inter**
  for body (`--font-sans`). Loaded via a Google Fonts `<link>` in
  `src/routes/__root.tsx` (non-render-blocking via a `media="print"` →
  `media="all"` swap trick), with metric-adjusted `@font-face` fallbacks
  (`"... Fallback"`) declared at the top of `src/styles.css`.
- UI primitives are shadcn/ui over Radix, in `src/components/ui/` — style
  `new-york`, base color `slate`, CSS variables on, no class prefix (see
  `components.json`). Path aliases: `@/components`, `@/lib`, `@/hooks`,
  `@/components/ui` all map into `src/`.

## Structure

- `src/routes/` — file-based routes (see `src/routes/README.md` for the
  file-naming → URL convention cheat sheet; read it before adding routes).
  `src/routes/__root.tsx` is the only root layout/shell; `routeTree.gen.ts`
  is auto-generated, never hand-edit it.
  - `src/routes/_authenticated/` — the admin/editorial area, URL-prefixed
    `mnv.*` (e.g. `mnv.articles.tsx`, `mnv.bikes.tsx`, `mnv.lexikon.tsx`,
    `mnv.users.tsx`, `mnv.media.tsx`, `mnv.newsletter.tsx`,
    `mnv.auto-articles.tsx`, `mnv.reports.tsx`). `_authenticated/route.tsx`
    is a client-only (`ssr: false`) auth gate that checks
    `supabase.auth.getUser()` and renders a sign-in form if unauthenticated;
    it does not itself enforce staff roles — server functions do that via
    `assertStaff` (see Supabase section).
  - `src/routes/[.mcp]/`, `src/routes/mcp.ts`, `src/routes/[.well-known]/` —
    the app's own MCP server endpoint (tool listing/invocation, OAuth
    protected-resource metadata). Backed by `src/lib/mcp/`.
  - `src/routes/api.public.*` and `src/routes/api/public/*` — public API
    routes (auto-article generation, newsletter dispatch/unsubscribe,
    inbound Resend email webhook, article image proxy).
- `src/components/` — flat, PascalCase files at the top level (`Header.tsx`,
  `Footer.tsx`, `ArticleCard.tsx`, etc.), plus subfolders:
  - `admin/` — editorial backoffice components (`ArticleEditor`,
    `BikeEditor`, `LexikonForm`, file-import helpers, `AdminShell`).
  - `bikes/` — bike comparison/matching UI (`BikeCard`, `BikeCompareButton`,
    `CompareFloatingBar`, `BikeRangeChart`, `BikeRatingRadar`, etc.).
  - `ui/` — shadcn/ui primitives, generated/managed via `components.json`.
- `src/lib/` — mixed client+server helpers and TanStack `createServerFn`
  modules. Naming convention: `*.functions.ts` = server functions callable
  from client code (bundled into the client, executed on server via RPC);
  `*.server.ts` = server-only modules never bundled to the client (enforced
  by Vite's handling of the suffix, not just convention — see ESLint rule
  below). Notable files: `admin.functions.ts` (dashboard stats, user/role
  management, media library), `articles.functions.ts` / `articles.ts`,
  `bikes.functions.ts` / `bike-*.ts` (compare, match, import, profile,
  weather tips), `lexikon.functions.ts` / `lexikon-admin.functions.ts`,
  `auto-article.functions.ts` / `auto-article.server.ts`, `contact.functions.ts`,
  `newsletter.functions.ts` / `newsletter-render.server.ts`,
  `config.server.ts` (server env-config pattern, see below),
  `indexnow.server.ts` (pings IndexNow on publish), `mcp/` (the MCP tool
  definitions consumed by `src/lib/mcp/index.ts`'s `defineMcp`).
- `src/hooks/` — `use-bike-favorites`, `use-bookmarks`, `use-compare`,
  `use-bike-weather`, `use-cookie-consent`, `use-mobile`.
- `src/integrations/supabase/` — see Supabase section below.
  `src/integrations/lovable/` — Lovable platform glue.
- `supabase/migrations/` — 33+ timestamped SQL migrations (Lovable Cloud /
  Supabase-managed).

### ESLint rule of note

`eslint.config.js` bans importing `server-only` (the Next.js package) with a
custom error message: this project marks server-only modules via the
`*.server.ts` filename suffix (or `@tanstack/react-start/server-only`), not
via that package — another Next.js-convention trap to avoid.

## Server env-var access pattern (`src/lib/config.server.ts`)

Three deliberate patterns, don't mix them up:
- Public config readable on both client and server: `import.meta.env.VITE_FOO`,
  defined in `.env` with a `VITE_` prefix. Never put secrets here.
- Reusable server-only helpers: a `.server.ts` module reading `process.env`
  **inside a function**, not at module scope — on Cloudflare Workers, env
  binds at request time, so module-scope `process.env` reads resolve to
  `undefined`.
- One-off server-only reads: inline `process.env.X` inside a `createServerFn`
  handler.

## Supabase

- Two generated clients in `src/integrations/supabase/` (headers say
  "automatically generated, do not edit directly" — treat by-hand edits as
  likely to be overwritten):
  - `client.ts` — browser client, anon/publishable key
    (`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, falls back to
    non-`VITE_` env for SSR). Safe for client-bundled code.
  - `client.server.ts` — admin client, service-role key
    (`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`), bypasses RLS. **Never
    use in browser-reachable code.** Its own comment says: top-level import
    is safe only from other `.server.ts` modules; from route files or
    `*.functions.ts` (which ship to the client bundle), load it with a
    dynamic `await import(...)` inside the handler instead (see the
    `indexnow.server.ts` usage in `articles.ts` for the pattern).
  - `auth-middleware.ts` exports `requireSupabaseAuth`, a TanStack Start
    server middleware: validates the `Authorization: Bearer <jwt>` header
    via `supabase.auth.getClaims`, and injects `{ supabase, userId, claims }`
    into handler context, where `supabase` is a **user-scoped** client (RLS
    applies, not the admin client).
- Role model: `user_roles` table with roles `admin` / `editor` / `user`,
  checked via a `has_role(_user_id, _role)` RPC. Most `*.functions.ts`
  handlers call a local `assertStaff(context)` helper that requires
  `admin` or `editor` and throws `Forbidden` otherwise; some operations
  (delete, user-role management) further require `admin` specifically.
  This authorization lives in the server functions, not in route-level
  guards — the `_authenticated` route only checks that a Supabase session
  exists, not the user's role.
- `src/integrations/supabase/types.ts` — generated DB types (`Database`),
  also "do not edit directly".

## MCP server (this app exposes one)

`src/lib/mcp/index.ts` defines the app's own MCP server (`defineMcp` from
`@lovable.dev/mcp-js`), named `welchesfahrrad-mcp`, OAuth-protected via the
Supabase auth issuer (`https://<project-ref>.supabase.co/auth/v1`). Tools
live in `src/lib/mcp/tools/*.ts` (articles, bikes, lexikon, images,
analytics, site/contact/newsletter) and mirror the admin CRUD operations —
this is a separate thing from the `mcp__Welches_Fahhrad__*` tools available
to you in this session (those talk to the deployed instance's data over
MCP; the code here is what implements that server).

## Locale / content

Site content and admin UI copy are in German (`de-DE`/`de` locale, `lang="de"`
on `<html>`). Article categories are a fixed enum: `Nachrichten`, `Ratgeber`,
`E-Bikes`, `Tests`. Article/bike/lexikon statuses follow a `draft` /
`published` pattern.

## Known issues

### 1. Article body is Markdown-stripped, not rendered (unresolved)

`bodyToParagraphs()` in `src/lib/articles.functions.ts` does not render the
stored Markdown — it strips it. It splits `article.body` on blank lines into
paragraphs, then regex-removes heading markers (`^#{1,6}\s+`), bold/italic
(`**`, `*`, `__`), and rewrites `-`/`*` list markers to a literal `• ` prefix
inside plain text. `src/routes/artikel.$slug.tsx` then maps the resulting
string array straight into `<p>` tags (`{a.body.map((p, i) => <p>...</p>)}`),
with only the first paragraph getting special (`drop-cap`) styling.

Net effect: any `## Subheading` an editor writes in the body ends up as a
plain, unstyled paragraph in the DOM — there is no `<h2>`/`<h3>`, no `<ul>`/
`<li>`, no `<strong>`/`<em>`. This flattens the article's semantic structure
(bad for accessibility and for search engines building a document outline)
and silently discards formatting editors may believe is being applied.

`marked` + `dompurify` are both dependencies and are used elsewhere for real
Markdown-to-sanitized-HTML rendering — `src/components/admin/ArticleEditor.tsx`
uses them for the editor's live preview pane (`previewHtml`, "Vorschau"), and
`src/components/bikes/BikePrintSheet.tsx` uses them for bike `description`
text on the public bike detail page. Neither is wired into the public article
route. So the article editor's preview does not match what actually renders
on the published page. This is unresolved — flagging it here rather than
silently fixing it, since switching `artikel.$slug.tsx` to
`marked.parse` + `DOMPurify.sanitize` + `dangerouslySetInnerHTML` is a
behavior change that touches every published article's rendering.

### 2. Article category list is duplicated across ~10 places

There is no single source of truth for the four-value category enum
(`Nachrichten`, `Ratgeber`, `E-Bikes`, `Tests`). It is hand-declared
separately in:

- `supabase/migrations/20260612185513_f07778ab-2e41-45dc-86e5-7ee712587811.sql`
  — `CREATE TYPE public.article_category AS ENUM (...)`, the actual source of
  truth at the DB level.
- `src/integrations/supabase/types.ts` — generated `Database["public"]["Enums"]["article_category"]`
  (regenerate from the DB; don't hand-edit).
- `src/lib/articles.functions.ts` — `validCat` const in `rowToArticle()`.
- `src/lib/articles.ts` — hand-written `Article["category"]` union type.
- `src/lib/mcp/tools/articles.ts` — `CATEGORY = z.enum([...])`.
- `src/lib/auto-article.functions.ts` — inline `z.enum([...])` on an optional
  field.
- `src/lib/auto-article.server.ts` — declared **four separate times**: the
  `Category` union type, an LLM-facing JSON-schema `enum`, the `ALL_CATEGORIES`
  const array, and one more inline `.includes(...)` array literal.
- `src/lib/admin.functions.ts` — `articleCategories` const, reused for both
  Zod validation and dashboard stat bucketing.
- `src/components/admin/ArticleEditor.tsx` — `ALLOWED_CATEGORIES` const plus
  a duplicate hand-written union type.
- `src/components/admin/ArticleFileImport.tsx` — same pair again
  (`ALLOWED_CATEGORIES` const + union type).

Separately, `Header.tsx` and `MobileNav.tsx` each hardcode a `nav`/`items`
array with `{ to: "/e-bikes", label: "E-Bikes" }` and
`{ to: "/ratgeber", label: "Ratgeber" }` entries; `artikel.$slug.tsx` has its
own `categorySlugMap` mapping all four categories to routes (`Nachrichten` →
`/`, `Tests` → `/fahrraeder`). These don't enumerate the category type, but
they do hardcode category-derived labels/routes and will drift silently if a
category is renamed.

Adding, renaming, or removing a category means touching the migration (new
migration, since the enum already has published rows), the generated types,
and every file above, plus checking the nav files and `categorySlugMap` for
routes that assume exactly these four values. Nothing currently enforces
this at build time.

### 3. Do not edit the same files in Lovable and Git at the same time

This project is developed through both the Lovable platform (which edits
project files directly and syncs them) and this Git repository. Editing the
same files in the Lovable editor and via a local/CI Git workflow in the same
window will produce conflicting writes — Lovable's sync is not a merge-aware
Git client. Coordinate who is editing before making concurrent changes, and
prefer letting one side finish and sync before the other starts.

### 4. Bike comparison feature: reachable, not leftover

Checked whether `src/components/bikes/*` and the compare route are dead code
carried over from a template. They are not — the compare feature is fully
wired into navigation:

- `/vergleich` (`src/routes/vergleich.tsx`) is a real nav destination in both
  `Header.tsx` (desktop nav array) and `MobileNav.tsx` (bottom nav, with its
  own icon), plus a CTA on the homepage (`index.tsx`) and on `favoriten.tsx`.
- `CompareFloatingBar` is mounted globally in `src/routes/__root.tsx`, so the
  "N Räder im Vergleich" bar can appear on any page.
- `BikeCompareButton` is used from `BikeCard.tsx` (bike grid/listing cards)
  and directly on `index.tsx`; `fahrraeder.$slug.tsx` (bike detail page) has
  its own inline compare toggle wired to the same `compareStore`
  (`src/lib/bike-compare.ts`).
- `BikeFavoriteButton`, `BikeImageLightbox`, `BikeMatchCard`, and
  `BikeRatingRadar` are all imported and used from `fahrraeder.$slug.tsx`.

Two components in that folder do appear to be genuinely unused, unlike the
rest: **`BikeRangeChart.tsx`** and **`BikeShowcase.tsx`** have no imports
anywhere outside their own files. Treat those two specifically as dead code
to verify before relying on them, not the compare feature as a whole.
