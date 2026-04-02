/**
 * Типы и константы для wiki-new (предложение: 4 слоя + типы страниц + шаблоны).
 */

/** Тип страницы — один из четырёх логических слоёв */
export type PageTypeId = 'knowledge_base' | 'product_docs' | 'instructions' | 'user_guide'

export const PAGE_TYPES: { value: PageTypeId; label: string; badgeLabel: string }[] = [
  { value: 'knowledge_base', label: 'База знаний', badgeLabel: 'Статья' },
  { value: 'product_docs', label: 'Документация по продукту', badgeLabel: 'Документация' },
  { value: 'instructions', label: 'Инструкции и гайды', badgeLabel: 'Инструкция' },
  { value: 'user_guide', label: 'Руководство пользователя', badgeLabel: 'Гайд' },
]

export const CATEGORIES = [
  'Архитектура',
  'Настройка',
  'Интеграции',
  'Пользователи',
  'Отчёты',
  'FAQ',
  'API',
] as const

export type Category = (typeof CATEGORIES)[number]

/** Шаблон контента при создании страницы */
export type ContentTemplateId = 'wiki_article' | 'how_to' | 'module_doc'

export const CONTENT_TEMPLATES: { value: ContentTemplateId; label: string }[] = [
  { value: 'wiki_article', label: 'Wiki‑статья (Wikipedia-стиль)' },
  { value: 'how_to', label: 'Инструкция / How-to' },
  { value: 'module_doc', label: 'Документация по модулю' },
]

/** Заготовки markdown под шаблоны */
export const TEMPLATE_SNIPPETS: Record<ContentTemplateId, string> = {
  wiki_article: `# Заголовок

Краткое описание (2–3 строки).

## Кратко / Основное

- Пункт 1
- Пункт 2

## Основные разделы

### Раздел 1

Текст.

### Раздел 2

Текст.

## См. также

- [Связанная страница](/wiki-new/1)
`,
  how_to: `# Как сделать…

Краткий контекст: кому и когда это нужно.

## Предпосылки (Prerequisites)

- Что должно быть уже настроено

## Шаги

### Шаг 1

Описание шага.

### Шаг 2

Описание шага.

## Частые ошибки

- Ошибка 1 и как избежать

## Связанные статьи

- [Ссылка](/wiki-new/1)
`,
  module_doc: `# Название модуля

Краткое описание роли модуля в системе.

## Назначение

Текст.

## Основные сценарии

- Сценарий 1
- Сценарий 2

## Взаимодействие с другими модулями

Текст или схема.

## Ограничения и edge-cases

Текст.

## Ключевые сущности / термины

| Термин | Описание |
|--------|----------|
| ... | ... |

## Ссылки

- [Инструкция по настройке](/wiki-new/1)
`,
}

/** Блоки для вставки в редактор */
export const BLOCK_TEMPLATES: { id: string; label: string; snippet: string }[] = [
  { id: 'steps', label: 'Инструкция по шагам', snippet: '### Шаг 1\n\nОписание.\n\n### Шаг 2\n\nОписание.\n\n### Шаг 3\n\nОписание.' },
  { id: 'faq', label: 'FAQ (вопрос — ответ)', snippet: '**Вопрос:** …\n\n**Ответ:** …\n\n---\n\n**Вопрос:** …\n\n**Ответ:** …' },
  { id: 'callout', label: 'Важное предупреждение (callout)', snippet: '> **Важно:** Текст предупреждения или подсказки.' },
  { id: 'code', label: 'Пример кода', snippet: '```\n// вставьте код или пример запроса\n```' },
]

export interface WikiNewPageItem {
  id: string
  slug: string
  title: string
  description: string
  tags: string[]
  date: string
  category: string
  pageType: PageTypeId
}

export interface ContentSection {
  title: string
  content?: string
  items?: string[]
}

export interface WikiNewContent {
  heading: string
  sections: ContentSection[]
}
