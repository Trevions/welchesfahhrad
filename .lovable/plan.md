## Проблем

Браузерът (Brave/Chrome) автоматично попълва скрития "honeypot" input защото се казва `website` — много често срещано име, което autofill не уважава. Сървърната Zod схема е `z.string().max(0)`, така че при попълнено поле хвърля грешка и суровият JSON на грешката се показва на потребителя в червено.

В резултат: легитимни хора не могат да се абонират, а UX изглежда счупен.

## Решение (3 точки, всичко в един професионален пас)

### 1. Поправи honeypot-а правилно (root cause)
- Преименувай скритото поле от `website` на нещо което autofill не разпознава: `hp_field` (с `name="hp_field"`, `id="hp_field"`).
- Добави и `autoComplete="new-password"` + обвий го в `<div aria-hidden style="position:absolute; left:-9999px; height:0;">` извън визуалния поток — autofill агресивно игнорира off-screen полета.
- Не дръж стойността в React state; чети я от form ref при submit (autofill често не задейства React onChange).
- В Zod схемата: `hp_field: z.string().max(200).optional()` — приема всичко, **не хвърля**. В handler-а: ако `hp_field` е непразен → върни `{ ok: true }` без да изпратиш имейл (тиха победа, не алармира бота).

### 2. Професионално error UI
- Никога не показвай сурова Zod / сървърна грешка на потребителя.
- В `Footer.tsx` catch блока: винаги показвай дружелюбно немско съобщение: *"Etwas ist schiefgegangen. Bitte versuchen Sie es später erneut."*
- Само ако имейлът е невалиден (клиентска проверка преди submit): *"Bitte geben Sie eine gültige E-Mail-Adresse ein."*
- Логвай реалната грешка в console за debug, но не я показвай.

### 3. Лек polish на формата
- Добави `name="email"` + `autoComplete="email"` за по-добър UX.
- Добави клиентска валидация на имейла преди submit (regex), за да не разчитаме само на сървъра.
- Disable бутона по време на `loading` (вече има, оставяме).

## Файлове за промяна

- `src/components/Footer.tsx` — преименуване на honeypot, ref-базиран read, дружелюбен error display, client email check.
- `src/lib/newsletter.functions.ts` — Zod схема: `hp_field` приема всичко; ако непразно → silent success.

## Какво не пипаме

- Дизайн / визуален стил на формата (същия layout, същите цветове).
- Логиката на DOI имейлите, confirm/abmelden страниците, Resend интеграцията — те работят (последните 3 абонати са потвърдени успешно).
- Базата данни — без миграции.