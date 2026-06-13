## Ziel

Alle **3 Stunden** läuft ein Cron, der über **Perplexity** echte deutsche Fahrrad-News, neue Gesetze, E-Bike-Releases & Ratgeber-Anlässe findet, jede Story durch **Lovable AI (Gemini 2.5 Pro)** komplett neu, SEO-optimiert und unverwechselbar umschreiben lässt, ein **KI-Bild** generiert (Nano-Banana) mit perfektem Alt-Text, und den Artikel **sofort live** veröffentlicht.

---

## Architektur

```text
pg_cron (alle 3h)
   │
   ▼
POST /api/public/articles/auto-generate  (Shared-Secret)
   │
   ├─ 1. Perplexity sucht 4 Kategorien parallel
   │     (Nachrichten · Gesetze · E-Bikes · Ratgeber)
   │     → JSON-Liste mit Quellen-URLs + Snippets
   │
   ├─ 2. Dedup: skip wenn source_url bereits in
   │     article_sources Tabelle (oder Titel-Hash matcht)
   │
   ├─ 3. Pro Story: Claude/Gemini schreibt um
   │     - komplett neu formuliert (Plagiats-frei)
   │     - SEO-optimiert (Titel, Meta, Keywords, H2/H3)
   │     - 600–900 Wörter, deutsche Tonalität Radmap
   │     - Quellen werden NICHT namentlich genannt
   │       (außer wenn das in der Story zentral ist
   │        → dann Story komplett überspringen)
   │
   ├─ 4. Bild generieren (google/gemini-2.5-flash-image)
   │     - Prompt aus Titel + Kategorie abgeleitet
   │     - in article-images Bucket hochladen
   │     - SEO-Alt-Text vom selben AI-Call (deutsch,
   │       beschreibend, mit primärem Keyword)
   │
   └─ 5. Insert in articles als status='published',
         setze published_at = now(),
         logge source in article_sources
```

Ein Lauf verarbeitet **max. 1 Artikel pro Kategorie** (also bis zu 4/Lauf, faktisch meist 1–2 nach Dedup). Bei 8 Läufen/Tag → realistisch ~4–8 neue Artikel täglich.

---

## 1. Connector & Secrets

**Perplexity-Connector** verbinden (du bekommst nach Plan-Bestätigung den Connect-Button).
Neues Secret: **`ARTICLE_AUTOGEN_SECRET`** schützt den öffentlichen Endpoint.
Bereits vorhanden: `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, Bucket `article-images`.

---

## 2. Datenbank

Neue Tabelle **`article_sources`** (Dedup-Index):
- `id`, `article_id` (fk articles, nullable bei skipped), `source_url` (unique), `source_title`, `source_domain`, `content_hash`, `category`, `discovered_at`, `status` (`processed` | `skipped_brand_mention` | `skipped_duplicate` | `failed`), `skip_reason`.

Neue Tabelle **`article_generation_runs`** (Audit/Monitoring im Admin):
- `id`, `started_at`, `finished_at`, `status` (`running` | `success` | `partial` | `failed`), `sources_found`, `articles_created`, `errors_count`, `error_summary` (text), `trigger` (`cron` | `manual`).

GRANTs + RLS (service_role schreibt; Admin-Rolle liest).

---

## 3. Endpoint `/api/public/articles/auto-generate`

POST, verifiziert `x-autogen-secret`. Optional `?category=...&force=true` für manuelle Tests.

Ablauf pro Lauf:
1. Run-Zeile erstellen (`running`).
2. Für jede Kategorie: Perplexity `sonar` mit `search_recency_filter: 'day'`, deutscher Sprachfilter, domain-exclude `radmap.de`, strukturierter JSON-Output (Liste von `{title, url, summary, published_date}`).
3. Top-Kandidat pro Kategorie wählen, der **nicht** in `article_sources` ist.
4. **Plagiats-Schutz-Prompt** an Gemini 2.5 Pro:
   - Input: Originaltitel + Snippet + Quell-URL
   - System: „Du bist Senior-Redakteur bei Radmap. Schreibe einen komplett eigenständigen Artikel. NIE wörtlich übernehmen. Falls die Story untrennbar von einer Markennennung der Original-Publikation abhängt (z. B. ‚Exklusiv-Interview von X mit Y') → antworte mit `{skip: true, reason}`. Sonst: liefere JSON mit `slug, title, excerpt, body_markdown, category, seo_title, seo_description, seo_keywords, read_time, image_prompt, image_alt`."
   - Strukturierter Output via `response_format` (json_schema).
5. Bei `skip:true` → in `article_sources` als `skipped_brand_mention` loggen, weiter.
6. Bild generieren: `google/gemini-2.5-flash-image` mit `image_prompt`, 1024×1024, Base64 → in `article-images` Bucket als `auto/{slug}.png` uploaden → public URL.
7. Artikel insert (`status='published'`, `published_at=now()`, `source='Radmap Redaktion'`).
8. `article_sources` insert mit `article_id`.
9. Errors aggregieren, Run abschließen (`success`/`partial`/`failed`).

---

## 4. Cron

pg_cron Job `articles-auto-generate-3h`, Schedule `0 */3 * * *`, ruft via `net.http_post` die stabile URL `https://project--32d31ab7-6004-41bb-92c7-f09f96939f53.lovable.app/api/public/articles/auto-generate` mit Header `x-autogen-secret`.

---

## 5. Admin-Panel-Erweiterung

Neue Sektion **`/mnv/auto-articles`**:
- Tabelle der letzten 30 Runs (Datum, Status, gefunden/erstellt/Fehler).
- Liste `article_sources` mit Filter (verarbeitet / übersprungen / fehlgeschlagen) + Skip-Grund.
- Button **„Jetzt manuell auslösen"** (ruft Endpoint mit `force=true`).
- Button **„Nur Kategorie X testen"** pro Kategorie.

---

## 6. SEO-Qualitäts-Garantien (im AI-Prompt verankert)

- Titel ≤ 60 Zeichen, primäres Keyword vorne.
- Meta-Description 140–155 Zeichen, mit Call-to-Action.
- Body in Markdown, H2/H3-Struktur, Listen wo sinnvoll.
- `seo_keywords`: 5–8 deutsche Long-Tail-Keywords.
- `image_alt`: 80–120 Zeichen, beschreibend, mit Keyword (nicht keyword-stuffing).
- Slug aus Titel (deutsche Umlaute → ae/oe/ue, eindeutig, max. 80 Zeichen).
- Read-Time aus Wortzahl berechnet.

---

## 7. Sicherheits- & Compliance-Garantien

- **Plagiats-Schutz**: AI bekommt nur **Titel + kurzes Snippet** (kein Volltext) → erzwingt eigenständige Formulierung. Zusätzliche Heuristik: wenn 3+ aufeinanderfolgende 5-Wort-Sequenzen mit dem Snippet matchen → verwerfen & neu generieren (max. 2 Retries).
- **Markennennung-Skip**: harte Regel im System-Prompt + JSON-Schema-`skip`-Feld.
- **Bilder rechtssicher**: ausschließlich KI-generierte Bilder (Nano-Banana) → keine Urheberrechtsprobleme.
- **Rate-Limit & Kosten**: max. 4 Stories pro Lauf, Token-Budget pro Story gekappt, Bilder mit `quality: 'low'` (für News ausreichend, ~3× billiger).
- **Idempotenz**: `source_url` UNIQUE; Cron-Doppelaufrufe können nichts duplizieren.
- **Vollständiges Audit**: jeder Lauf in `article_generation_runs`, jede Quelle in `article_sources`.

---

## 8. Zu erstellende/zu ändernde Dateien

- Migration: `article_sources`, `article_generation_runs`, GRANTs, RLS, pg_cron-Job.
- Secret: `ARTICLE_AUTOGEN_SECRET`.
- Connector: Perplexity verbinden (Button erscheint nach Bestätigung).
- `src/routes/api.public.articles.auto-generate.ts` — Orchestrierungs-Endpoint.
- `src/lib/auto-article.server.ts` — Perplexity-Suche, AI-Rewrite, Bild-Gen, Upload (server-only).
- `src/lib/auto-article.functions.ts` — Admin-Server-Functions (`listGenerationRuns`, `listArticleSources`, `triggerAutoGenerate`).
- `src/routes/_authenticated/mnv.auto-articles.tsx` — Admin-UI.
- Sidebar-Link in `AdminShell` ergänzen.

---

## 9. Validierung nach Bau

1. Manueller Trigger erzeugt 1 Artikel pro Kategorie (oder Skip mit Grund).
2. Zweiter Trigger derselben Quelle → wird sauber übersprungen.
3. Generierter Artikel: SEO-Title <60, Meta 140–155, Bild im Bucket, Alt-Text vorhanden, Body komplett neu (Stichprobe gegen Original).
4. Story mit Markennennung-Trigger → `skipped_brand_mention` mit Grund.
5. Cron-Job in `cron.job` sichtbar, Schedule `0 */3 * * *`.
6. Admin-Panel zeigt Runs & Quellen mit korrekten Zählern.

Nach deiner Bestätigung baue ich alles in einem Rutsch, verbinde den Perplexity-Connector und teste mit einem manuellen Trigger.