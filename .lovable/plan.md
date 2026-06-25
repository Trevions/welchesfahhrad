# Импортиране на статия от файл

Добавяме нова възможност в админ панела: при създаване на нова статия можеш да качиш файл (Markdown или JSON), който автоматично попълва всички полета. След това отделно качваш cover снимка, виждаш преглед и натискаш Publish.

## Какво се добавя

### 1. „Import from file" зона горе в редактора на нова статия
- Drag-and-drop / click-to-upload поле, което приема `.md` и `.json`
- Автоматично разпознава формата по разширение
- Бутон „Изчисти" за връщане към празна форма

### 2. Поддържани файлови формати

**Markdown (.md) с frontmatter:**
```markdown
---
title: Заглавие на статията
slug: optional-slug
excerpt: Кратко описание (до 200 символа)
category: Nachrichten
tags: [e-bike, test]
status: draft
seo_title: SEO заглавие
seo_description: SEO мета описание
---

# Първи параграф на тялото
Останалият Markdown текст става HTML за полето body.
```

**JSON (.json):**
```json
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "category": "Nachrichten",
  "tags": ["..."],
  "status": "draft",
  "seo_title": "...",
  "seo_description": "...",
  "body": "<p>HTML или markdown</p>"
}
```

Задължителни: `title`, `body`. Останалите са опционални — категория default „Nachrichten", status default „draft", slug автогенериран от заглавието.

### 3. Поток (UX)

1. Качваш файла → полетата в редактора веднага се попълват, виждаш зелен banner „Файлът е импортиран успешно"
2. Качваш cover снимка в съществуващото image поле (отделно от файла)
3. Виждаш пълен преглед в редактора, можеш ръчно да коригираш каквото и да е
4. Натискаш Publish (или Save as draft) — стандартното поведение

### 4. Валидация и грешки
- Невалиден JSON / липсва `title` или `body` → червен toast с ясна причина, формата не се променя
- Непозната категория → попълва се както е, потребителят може да я смени
- Markdown се конвертира към чист HTML (`marked` + `DOMPurify`)

## Технически детайли

- Нов компонент `src/components/admin/ArticleFileImport.tsx` с drop zone (използва съществуващите shadcn primitives, без нови UI зависимости)
- Парсване на frontmatter с `gray-matter`, markdown→html с `marked`, sanitize с вече наличния DOMPurify pattern
- Добавя се в `src/components/admin/ArticleEditor.tsx` най-горе, над сегашните полета, видимо само при нова статия (не при редакция)
- Полетата се запълват през съществуващия form state (react-hook-form `setValue`) — никаква промяна по `upsertArticle` server fn или DB схема
- Snimkata и публикуването използват вече съществуващата логика — нищо ново на backend

## Извън обхвата
- Без bulk import (само един файл наведнъж)
- Без качване на снимки вградени във файла — снимката винаги е отделно поле
- Без промяна на bike editor-а (само статии)
