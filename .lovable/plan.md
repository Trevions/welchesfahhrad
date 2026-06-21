Преработка на SPLIT HERO на началната страница (`src/routes/index.tsx`, ~редове 65–121).

## Промени

**1. Махам снимката, премиум черен фон**
- Премахвам `<img>` + двата overlay градиента.
- Слоеве на новия фон:
  - База `#050505`
  - SVG grain/noise overlay (inline data-URL, opacity ~0.06)
  - Голям приглушен signal-gold radial-gradient в горен десен ъгъл
  - Тънка вертикална signal hairline линия отляво
  - Огромна editorial „N° 24" цифра на заден план (font-display, opacity ниска)
- Махам неизползвания `hero` import.

**2. Заглавието вече не се отрязва**
- Махам `lg:h-[78vh]` + `min-h-[520px]` + `absolute inset-0` overlay подхода.
- Контейнерът става нормален `min-h-[78vh] flex flex-col justify-end` с `py-16 md:py-24` → текстът тече естествено, дълги заглавия се събират.
- H1 размер: `text-3xl md:text-5xl lg:text-[4.5rem]`, без `max-w-4xl` ограничение на мобилни.

**3. Анимации, които ВИНАГИ работят**
- Сменям `data-reveal` на hero елементите с директни CSS анимации (`animate-fade-up` с `animation-fill-mode: both` и нарастващи `animation-delay`) — изпълняват се сигурно при mount, не зависят от IntersectionObserver.
- Бутон „Vollständiger Bericht":
  - Винаги активен мек signal-glow pulse
  - Постоянно движещ се shimmer underline
  - Рамка от сива на 1px signal за яснота
  - Hover: invert (signal фон, тъмен текст) + стрелка translate
- Eyebrow „Top-Story" получава пулсиращ signal-dot отпред.

**4. Малки полировки**
- Метаредът (дата · време · източник) с моноспейс tracking за editorial вид.

## Извън скоупа
- Десният aside панел „Diese Woche".
- Останалите секции на home.
- Глобални дизайн-токени.

## Технически
- Само `src/routes/index.tsx`.
- Без нови зависимости, без backend промени.
