## Ziel
Jeden Sonntag um 12:00 Uhr (Europe/Berlin) wird automatisch ein professioneller Newsletter mit den Top-Artikeln der Woche an **ausschließlich bestätigte** Abonnenten verschickt. Bei Fehlern wird bis zu 3× erneut versucht. Vollständige Nachvollziehbarkeit im Admin-Panel.

---

## Architektur

```text
pg_cron (jeden Sonntag 12:00 Berlin)
    │
    ▼
/api/public/newsletter/dispatch  (öffentlicher Endpoint, mit Shared-Secret)
    │
    ├─ Ausgabe erstellen (newsletter_issues)
    │   - Top 5–7 Artikel der letzten 7 Tage
    │   - HTML einmalig rendern und speichern
    │
    ├─ Empfänger laden: status = 'confirmed' (strenger Filter)
    │
    └─ Pro Empfänger: in pgmq-Queue 'transactional_emails' einreihen
            │
            ▼
        Bestehende Queue-Verarbeitung sendet via Resend
        (Retry bis 3×, danach DLQ; alles in email_send_log)
```

**Wichtig:** Wir verwenden die bereits eingerichtete pgmq-Email-Infrastruktur (Queue + Cron-Verarbeitung alle 5 Sek.). Retry, DLQ, Suppression und Logging sind dadurch automatisch abgedeckt. Wir bauen keinen eigenen Send-Loop.

---

## 1. Datenbank (Migration)

**Neue Tabelle `newsletter_issues`** — eine Zeile pro Wochenausgabe:
- `id` (uuid), `issue_date` (date, unique), `subject`, `preheader`
- `html`, `text` (gerendert, gespeichert für Reproduzierbarkeit)
- `article_ids` (uuid[]) — welche Artikel enthalten waren
- `status`: `pending` | `sending` | `sent` | `failed`
- `recipients_total`, `recipients_queued`
- `created_at`, `sent_at`

**Neue Tabelle `newsletter_deliveries`** — eine Zeile pro Empfänger pro Ausgabe (Idempotenz + Tracking):
- `id`, `issue_id` (fk), `subscriber_id` (fk), `email`
- `status`: `queued` | `sent` | `failed` | `skipped`
- `message_id` (Korrelation mit `email_send_log`), `error`, `attempts`
- Unique `(issue_id, subscriber_id)` → verhindert Doppelversand bei Cron-Wiederholungen

GRANTs + RLS: nur `service_role` schreibt; `authenticated` mit Admin-Rolle liest.

**Neues Secret `NEWSLETTER_DISPATCH_SECRET`** schützt den öffentlichen Dispatch-Endpoint (header-basiert).

---

## 2. Dispatch-Endpoint

`src/routes/api/public/newsletter.dispatch.ts` (POST):
- Verifiziert `x-dispatch-secret` gegen `NEWSLETTER_DISPATCH_SECRET`.
- Idempotent: erstellt `newsletter_issues`-Zeile für die aktuelle Woche, oder bricht ab, falls bereits `sent`.
- Wählt Top-Artikel: `articles` der letzten 7 Tage, sortiert nach `published_at` desc, limit 6, status `published`.
- Wenn weniger als 1 Artikel → Status `skipped`, keine Mail. (Kein leerer Newsletter.)
- Rendert E-Mail (Radmap-Branding, dunkel, gleiches Design wie DOI-Mail).
- Lädt **ausschließlich** `status = 'confirmed'` aus `newsletter_subscribers`.
- Filtert zusätzlich gegen `suppressed_emails`.
- Erstellt `newsletter_deliveries`-Zeilen mit `ON CONFLICT DO NOTHING` (Idempotenz).
- Reiht jede neue Lieferung in pgmq `transactional_emails` ein (mit `unsubscribe_token` → `List-Unsubscribe`-Header + One-Click).
- Aktualisiert `recipients_total` / `recipients_queued`, setzt Status auf `sent`.

---

## 3. Cron-Job

```sql
SELECT cron.schedule(
  'newsletter-weekly',
  '0 10 * * 0', -- Sonntag 10:00 UTC = 12:00 Berlin im Winter; 11:00 BST im Sommer
  ...
);
```

**DST-Hinweis (Europe/Berlin):** pg_cron unterstützt nur UTC. Damit es ganzjährig **12:00 Berliner Zeit** bleibt, planen wir **zwei** Cron-Jobs:
- `0 11 * * 0` — aktiv nur in Winterzeit (CET, UTC+1)
- `0 10 * * 0` — aktiv nur in Sommerzeit (CEST, UTC+2)

Der Dispatch-Endpoint prüft selbst die aktuelle Berliner Stunde (`Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' })`) und bricht ab, falls ≠ 12. So fired immer nur der richtige Job; der andere ist No-Op. Saubere, wartungsfreie Lösung.

Der Cron-Aufruf nutzt die stabile URL `https://project--32d31ab7-6004-41bb-92c7-f09f96939f53.lovable.app/api/public/newsletter/dispatch` und sendet `x-dispatch-secret`.

---

## 4. E-Mail-Template

Professionelles HTML im Radmap-Stil (dunkles Layout, Orange-Akzent, wie DOI-Mail):
- Header: Radmap-Logo + Datum „Ausgabe vom DD.MM.YYYY"
- Preheader-Text (für Inbox-Vorschau)
- 1 Hero-Artikel (großes Bild + Titel + Auszug + „Weiterlesen")
- Weitere Artikel als Liste (Bild + Titel + Auszug)
- Footer: Impressum-Link, Datenschutz-Link, **Abmelde-Link** + RFC-8058 One-Click-Header
- Text-Version (Multipart) für nicht-HTML-Clients

Personalisiertes `List-Unsubscribe` pro Empfänger (eigener Token aus `newsletter_subscribers.unsubscribe_token`).

---

## 5. Admin-Panel-Erweiterung

Neue Sektion auf `/mnv/newsletter`:
- Tab/Karte „Ausgaben" zeigt die letzten Newsletter-Issues (Datum, Status, Empfänger gesamt/gesendet/fehlgeschlagen).
- Pro Ausgabe: Link „HTML-Vorschau anzeigen" + „Lieferdetails" (Tabelle mit Empfänger-Status, fehlende werden mit Fehlergrund angezeigt).
- Button „Jetzt manuell versenden" (Admin-only, ruft denselben Dispatch-Endpoint mit `force=true` auf — überspringt die Stunden-Prüfung). Nützlich für Tests und Notfall-Versand.

---

## 6. Sicherheits- & Compliance-Garantien

- **Strenge Empfänger-Auswahl:** SQL-Filter `WHERE status = 'confirmed' AND email NOT IN (SELECT email FROM suppressed_emails)`. Doppelt geprüft im Code.
- **Suppression-Liste:** Bounces/Complaints von Resend landen automatisch dort und werden bei jeder Ausgabe ausgeschlossen.
- **Idempotenz:** Unique-Constraint `(issue_id, subscriber_id)` macht es unmöglich, denselben Empfänger zweimal für dieselbe Ausgabe zu queuen.
- **Retry-Logik:** pgmq verarbeitet bis zu 5× automatisch (wir nutzen das, kappen aber sichtbar bei 3 echten Sende-Versuchen via `attempts`-Counter — danach `failed` in `newsletter_deliveries`).
- **Audit:** Jeder Versand ist in `newsletter_issues`, `newsletter_deliveries` und `email_send_log` nachvollziehbar.

---

## Zu erstellende/zu ändernde Dateien

- **Migration**: `newsletter_issues`, `newsletter_deliveries`, GRANTs, RLS, pg_cron-Jobs.
- **Secret**: `NEWSLETTER_DISPATCH_SECRET` (per `add_secret`).
- `src/routes/api/public/newsletter.dispatch.ts` — Dispatch-Endpoint
- `src/lib/newsletter-render.server.ts` — HTML/Text-Rendering der Ausgabe
- `src/lib/newsletter.functions.ts` — neue Admin-Server-Functions: `listNewsletterIssues`, `getNewsletterIssue`, `triggerNewsletterDispatch`
- `src/routes/_authenticated/mnv.newsletter.tsx` — Tab „Ausgaben" + Manuell-Versand-Button

---

## Validierung

1. Migration läuft sauber durch, RLS aktiv.
2. Manueller Dispatch (Admin-Button) erstellt eine Ausgabe, queued nur `confirmed` Adressen, E-Mail kommt im Posteingang an.
3. Zweiter Aufruf desselben Tages erstellt keine doppelte Ausgabe und sendet nicht erneut (Idempotenz).
4. Eine Test-Adresse auf `unsubscribed` wird übersprungen.
5. Admin-Panel zeigt die Ausgabe mit korrekten Empfänger-Zahlen.
6. Cron-Job in `cron.job` sichtbar; manueller `SELECT net.http_post(...)` triggert erfolgreich.

Nach Genehmigung implementiere ich alles in einem Rutsch und teste mit einem manuellen Dispatch.
