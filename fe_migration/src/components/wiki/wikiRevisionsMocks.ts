export interface WikiContentSection {
  title: string
  content?: string
  items?: string[]
  subsections?: Array<{ title: string; items: string[] }>
}

export interface WikiPageVersion {
  /** Идентификатор ревизии */
  revisionId: string
  editor: string
  editedAt: string
  title: string
  category: string
  tags: string[]
  content: {
    heading: string
    sections: WikiContentSection[]
  }
}

export interface WikiPageMeta {
  pageId: string
  author: string
  created: string
}

export const LATEST_REVISION_ID = 'rev_2025_11_05'

const page1Meta: WikiPageMeta = {
  pageId: '1',
  author: 'Иван Петров',
  created: '04.11.2025',
}

const page1Rev20251104: WikiPageVersion = {
  revisionId: 'rev_2025_11_04',
  editor: page1Meta.author,
  editedAt: page1Meta.created,
  title: 'Архитектура продукта HR Helper',
  category: 'Архитектура',
  tags: ['Архитектура', '#architect'],
  content: {
    heading: 'Архитектура продукта HR Helper',
    sections: [
      {
        title: 'Основные модули',
        items: [
          '1. Управление пользователями и аутентификация (apps.accounts)',
          '2. Финансы и грейды (apps.finance)',
          '3. Вакансии и найм (apps.vacancies, apps.hiring_plan)',
          '4. Google Calendar интеграция (apps.google_oauth)',
          '5. AI-помощник (apps.gemini)',
          '6. Управление интервьюерами (apps.interviewers)',
          '7. Интеграции (apps.clickup_int, apps.notion_int)',
          '8. Настройки компании (apps.company_settings)',
          '9. Huntflow интеграция (apps.huntflow)',
        ],
      },
      {
        title: '5. AI-помощник (apps.gemini)',
        items: [
          'Интеграция с Google Gemini AI',
          'Помощь в составлении описаний вакансий',
          'Генерация ответов',
        ],
      },
      {
        title: 'Технологический стек',
        items: [
          'Backend: Django 4.2, Python 3.13',
          'Frontend: Bootstrap 5, JavaScript (Vanilla)',
          'База данных: SQLite (разработка), PostgreSQL (продакшн)',
          'AI: Google Gemini API',
        ],
      },
      {
        title: '',
        content: 'Подробнее о настройке каждого компонента читайте в соответствующих разделах.',
      },
    ],
  },
}

const page1Rev20251105: WikiPageVersion = {
  revisionId: 'rev_2025_11_05',
  editor: 'Мария Сидорова',
  editedAt: '05.11.2025',
  title: 'Архитектура продукта HR Helper',
  category: 'Архитектура',
  tags: ['Архитектура', '#architect'],
  content: {
    heading: 'Архитектура продукта HR Helper',
    sections: [
      {
        title: 'Основные модули',
        items: [
          '1. Управление пользователями и аутентификация (apps.accounts)',
          '2. Финансы и грейды (apps.finance)',
          '3. Вакансии и найм (apps.vacancies, apps.hiring_plan)',
          '4. Google Calendar интеграция (apps.google_oauth)',
          '5. AI-помощник (apps.gemini)',
          '6. Управление интервьюерами (apps.interviewers)',
          '7. Интеграции (apps.clickup_int, apps.notion_int)',
          '8. Настройки компании (apps.company_settings)',
          '9. Huntflow интеграция (apps.huntflow)',
        ],
      },
      {
        title: '5. AI-помощник (apps.gemini)',
        items: [
          'Интеграция с Google Gemini AI',
          'Помощь в составлении описаний вакансий',
          'Анализ резюме и кандидатов',
          'Генерация ответов',
        ],
      },
      {
        title: 'Взаимосвязи модулей',
        content:
          '┌─────────────────┐\n│   Пользователи  │\n└────────┬────────┘\n         │\n         ├──► Настройки компании\n         │         │\n         │         ├──► Грейды\n         │         └──► Шаблоны отказов\n         └──► Интеграции',
      },
      {
        title: 'Технологический стек',
        items: [
          'Backend: Django 4.2, Python 3.13',
          'Frontend: Bootstrap 5, JavaScript (Vanilla)',
          'База данных: SQLite (разработка), PostgreSQL (продакшн)',
          'AI: Google Gemini API',
          'Интеграции: Google Calendar API, ClickUp API, Notion API, Huntflow API',
          'Task Queue: Celery с Redis',
        ],
      },
      {
        title: '',
        content: 'Подробнее о настройке каждого компонента читайте в соответствующих разделах.',
      },
    ],
  },
}

const pages: Record<
  string,
  {
    meta: WikiPageMeta
    versions: WikiPageVersion[]
  }
> = {
  '1': {
    meta: page1Meta,
    versions: [page1Rev20251105, page1Rev20251104],
  },
}

export function getWikiPageVersions(pageId: string): WikiPageVersion[] {
  return pages[pageId]?.versions ?? []
}

export function getWikiLatestVersion(pageId: string): WikiPageVersion | null {
  return getWikiPageVersions(pageId)[0] ?? null
}

export function getWikiVersionByRevisionId(pageId: string, revisionId: string | null): WikiPageVersion | null {
  if (!revisionId) return getWikiLatestVersion(pageId)
  return getWikiPageVersions(pageId).find((v) => v.revisionId === revisionId) ?? null
}

export function getWikiPageMeta(pageId: string): WikiPageMeta | null {
  return pages[pageId]?.meta ?? null
}

