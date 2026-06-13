# Newsletter-Abmeldung: sichtbare Option im Footer

## Ziel
Aktuell ist der Abmelde-Link nur in der DOI-Bestätigungs-Mail und (laut RFC 8058) im Gmail-Header. Wer die Newsletter-Mails später löscht, findet keinen Weg zurück. Lösung: ein klar sichtbarer Text-Button **„Newsletter abbestellen"** direkt unter dem Abonnier-Formular im Footer. Klick öffnet ein professionelles Dialog-Fenster, in dem der Nutzer seine E-Mail eingibt — wir schicken ihm dann einen Abmelde-Link per Mail (gleiches Sicherheits-Prinzip wie Double-Opt-In, damit niemand fremde Adressen abmelden kann).

## User-Flow

```text
Footer
 └─ [E-Mail eingeben] [Abonnieren]
    ☐ Einwilligung …
    ───────────────────────────────
    Newsletter abbestellen   ← neuer Text-Button (unauffällig, unterstrichen)

Klick öffnet Dialog:
 ┌──────────────────────────────────────────┐
 │  Newsletter abbestellen                  │
 │                                          │
 │  Geben Sie Ihre E-Mail-Adresse ein.      │
 │  Wir senden Ihnen einen Bestätigungs-    │
 │  Link, um die Abmeldung abzuschließen.   │
 │                                          │
 │  [ihre@email.de        ] [Senden]        │
 └──────────────────────────────────────────┘

Nach Klick „Senden":
 → immer gleiche Erfolgs-Meldung (egal ob die Adresse existiert oder nicht —
   damit man nicht herausfinden kann, wer Abonnent ist).
 → Falls Adresse existiert: Mail mit Abmelde-Link → führt zur bestehenden
   Seite /newsletter/abmelden?token=… (Ein-Klick-Bestätigung).
```

## Was wird gebaut

### 1. Neue Server-Funktion `requestUnsubscribe` (`src/lib/newsletter.functions.ts`)
- Input: `email` + `hp_field` (gleicher Honeypot-Schutz wie beim Abonnieren).
- Sucht den Subscriber. Wenn vorhanden und nicht bereits abgemeldet → schickt Mail mit Link `https://radmap.de/newsletter/abmelden?token=…`.
- Wenn nicht vorhanden / bereits abgemeldet → tut nichts, gibt aber `{ ok: true }` zurück (keine Info-Leaks).
- Eigene saubere HTML-Mail im gleichen Stil wie die DOI-Mail (Betreff: „Abmeldung bestätigen").

### 2. Neuer Dialog `UnsubscribeDialog` (`src/components/UnsubscribeDialog.tsx`)
- Nutzt shadcn `Dialog` (passt zum bestehenden Design-System).
- Felder: E-Mail (mit Validierung), Senden-Button mit Lade-Spinner.
- Honeypot-Feld wie im Abo-Formular (off-screen).
- Erfolgs-State: „Wenn diese Adresse abonniert war, haben wir Ihnen einen Bestätigungs-Link gesendet. Bitte prüfen Sie auch den Spam-Ordner."
- Fehler-State: gleicher freundlicher Text wie im Footer.

### 3. Footer-Anpassung (`src/components/Footer.tsx`)
- Direkt **unter** dem Abonnier-Formular ein dezenter Text-Button:
  `Newsletter bereits abonniert? Hier abbestellen.`
- Klick öffnet den Dialog (State im `NewsletterForm`).
- Bleibt sichtbar — auch nach erfolgreichem Abonnieren — damit Bestandsleser jederzeit hinkommen.

### 4. Bestehende Bestätigungs-Mail erweitern
Im DOI-Confirm-Erfolgs-Bildschirm (`/newsletter/bestaetigen`) zusätzlich einen kleinen Hinweis: „Sie können sich jederzeit über den Link am Ende jeder Newsletter-Mail oder im Footer von radmap.de wieder abmelden."

## Sicherheits- & DSGVO-Aspekte
- **Kein Info-Leak**: Antwort ist immer identisch, egal ob die E-Mail in der DB steht.
- **Bestätigungs-Mail** (statt sofortiger Abmeldung über das Formular): verhindert, dass jemand fremde Adressen mutwillig abmeldet — gleiches Prinzip wie Double-Opt-In.
- **Bestehender Token-Link bleibt gültig** (24 h+) — wir generieren keinen neuen, sondern nutzen den vorhandenen `unsubscribe_token` aus der Tabelle.
- **Honeypot** gegen Bots, gleiche Technik wie im Abo-Formular.
- **Rate-Limiting**: aktuell keins eingebaut, kann aber als Folge-Schritt ergänzt werden (z. B. max. 3 Anfragen pro IP-Hash pro Stunde).

## Geänderte / neue Dateien
- `src/lib/newsletter.functions.ts` — neue exportierte Funktion `requestUnsubscribe` + interne `sendUnsubscribeRequestEmail`.
- `src/components/UnsubscribeDialog.tsx` — **neu**.
- `src/components/Footer.tsx` — Text-Button + Dialog-Einbindung.
- `src/routes/newsletter.bestaetigen.tsx` — kleiner Zusatztext (optional).

## Was *nicht* geändert wird
- Die bestehende DOI-Mail, die Token-Logik, die `/newsletter/abmelden`-Seite, die RFC-8058-One-Click-Route, die DB-Tabelle. Alles bleibt 1:1.
