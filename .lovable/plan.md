## Plan: make newsletter unsubscribe work professionally

### Goal
Make the footer unsubscribe flow reliable on `radmap.de`: when a confirmed subscriber requests unsubscribe, the system records it in the admin panel and that address is no longer included for newsletter sending.

### Changes
1. **Replace the failing unsubscribe-request email step**
   - The footer dialog will no longer depend on sending a second email that may not arrive.
   - User enters their subscribed email and clicks unsubscribe.
   - If the address exists, update it immediately to `unsubscribed` and set the unsubscribe timestamp.
   - If the address does not exist, show the same neutral success message so we do not expose subscriber data.

2. **Improve the unsubscribe dialog**
   - Change the wording from “E-Mail versendet” to a clear final result like “Abmeldung verarbeitet”.
   - Make the button text clear: “Newsletter abbestellen”.
   - Keep professional anti-spam protection with the honeypot field.

3. **Admin panel tracking**
   - The admin panel already reads `confirmed`, `pending`, and `unsubscribed` statuses.
   - I will make the unsubscribe state clearer by showing the unsubscribe date when available and keeping the “Abgemeldet” filter/stat visible.

4. **Sending safety**
   - Any newsletter-recipient logic must only use subscribers with status `confirmed`.
   - Unsubscribed addresses remain in the admin panel for proof/audit, but must not be used for future sends.

5. **Keep token unsubscribe support**
   - Existing links like `/newsletter/abmelden?token=...` and email-client unsubscribe headers stay active.
   - If someone clicks an unsubscribe link from an email, it still marks the address as unsubscribed.

### Files to update
- `src/lib/newsletter.functions.ts`
- `src/components/UnsubscribeDialog.tsx`
- `src/routes/_authenticated/mnv.newsletter.tsx`

### Validation
- Confirm a currently `confirmed` test subscriber becomes `unsubscribed` after using the footer dialog.
- Confirm the admin newsletter page shows the updated status/date.
- Confirm no unsubscribe-request email is required anymore.