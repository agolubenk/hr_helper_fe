/**
 * API вики.
 * TODO: Подключить к бэкенду, когда будет готов JSON API.
 * Сейчас использует моковые данные.
 */
import type { WikiPage, WikiTag, WikiPageFormData } from '@/shared/types/wiki'

// Моковые данные для разработки
let mockTags: WikiTag[] = [
  { id: 1, name: 'настройка', color: '#007bff' },
  { id: 2, name: 'интеграции', color: '#28a745' },
  { id: 3, name: 'вакансии', color: '#ffc107' },
  { id: 4, name: 'календарь', color: '#17a2b8' },
  { id: 5, name: 'рекрутинг', color: '#e83e8c' },
  { id: 6, name: 'onboarding', color: '#6f42c1' },
  { id: 7, name: 'api', color: '#fd7e14' },
  { id: 8, name: 'безопасность', color: '#dc3545' },
]

function tag(id: number) {
  return mockTags.find((t) => t.id === id)!
}

const MOCK_PAGES: WikiPage[] = [
  // Введение
  {
    id: 1,
    title: 'Введение в систему',
    slug: 'vvedenie',
    content: '<h2>Добро пожаловать</h2><p>HR Helper — внутренняя система для управления HR-процессами: вакансии, кандидаты, календарь интервью, интеграции.</p><h3>Основные разделы</h3><ul><li><strong>Вики</strong> — база знаний</li><li><strong>Настройки</strong> — конфигурация компании</li><li><strong>Календарь</strong> — расписание интервью</li></ul>',
    description: 'Обзор возможностей системы',
    category: 'Введение',
    parent_id: null,
    related_app: '',
    order: -10,
    is_published: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
    tags: [],
  },
  {
    id: 2,
    title: 'Быстрый старт',
    slug: 'quick-start',
    content: '<h2>Первые шаги</h2><p>После входа в систему выполните следующие действия:</p><ol><li>Заполните профиль компании</li><li>Добавьте сотрудников</li><li>Настройте интеграции</li><li>Создайте первую вакансию</li></ol>',
    description: 'Пошаговая инструкция для новых пользователей',
    category: 'Введение',
    parent_id: null,
    related_app: '',
    order: -9,
    is_published: true,
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-02-05T09:00:00Z',
    tags: [tag(6)],
  },
  {
    id: 3,
    title: 'Глоссарий терминов',
    slug: 'glossary',
    content: '<h2>Ключевые понятия</h2><p><strong>ATS</strong> — Applicant Tracking System, система управления кандидатами.</p><p><strong>Pipeline</strong> — воронка подбора.</p><p><strong>Scorecard</strong> — оценочная карта.</p>',
    description: 'Словарь HR-терминов',
    category: 'Введение',
    parent_id: null,
    related_app: '',
    order: -8,
    is_published: true,
    created_at: '2024-01-18T14:00:00Z',
    updated_at: '2024-01-18T14:00:00Z',
    tags: [],
  },
  // Архитектура
  {
    id: 4,
    title: 'Общая архитектура',
    slug: 'arhitektura',
    content: '<h2>Компоненты системы</h2><p>HR Helper состоит из нескольких модулей:</p><ul><li>Frontend — React-приложение</li><li>Backend — Django REST API</li><li>База данных — PostgreSQL</li><li>Очереди — Celery + Redis</li></ul>',
    description: 'Структура и компоненты платформы',
    category: 'Архитектура',
    parent_id: null,
    related_app: '',
    order: 0,
    is_published: true,
    created_at: '2024-01-20T11:00:00Z',
    updated_at: '2024-02-08T16:00:00Z',
    tags: [tag(7)],
  },
  {
    id: 5,
    title: 'API и webhooks',
    slug: 'api-webhooks',
    content: '<h2>Интеграция через API</h2><p>Для внешних систем доступен REST API. Документация: /api/docs/</p><h3>Webhooks</h3><p>Настройте webhooks для получения событий: создание кандидата, смена этапа и др.</p>',
    description: 'REST API и события webhook',
    category: 'Архитектура',
    parent_id: null,
    related_app: '',
    order: 1,
    is_published: true,
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-02-12T10:00:00Z',
    tags: [tag(7), tag(8)],
  },
  // Настройка
  {
    id: 6,
    title: 'Настройки компании',
    slug: 'nastroyki-kompanii',
    content: '<h2>Общие настройки</h2><p>Здесь можно настроить основные параметры компании: название, ИНН, адрес штаб-квартиры, часовой пояс и отрасль.</p><h3>Поля</h3><ul><li><strong>Название</strong> — юридическое наименование</li><li><strong>ИНН</strong> — идентификационный номер</li><li><strong>Часовой пояс</strong> — для корректного отображения времени</li></ul>',
    description: 'Настройка основных параметров компании',
    category: 'Настройка',
    parent_id: null,
    related_app: 'company_settings',
    order: 0,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-01T14:30:00Z',
    tags: [tag(1)],
  },
  {
    id: 7,
    title: 'Пользователи и роли',
    slug: 'users-roles',
    content: '<h2>Управление пользователями</h2><p>Добавление сотрудников, назначение ролей и прав доступа.</p><h3>Роли</h3><ul><li>Администратор</li><li>Рекрутер</li><li>Интервьюер</li></ul>',
    description: 'Настройка пользователей и прав',
    category: 'Настройка',
    parent_id: null,
    related_app: 'accounts',
    order: 1,
    is_published: true,
    created_at: '2024-01-16T12:00:00Z',
    updated_at: '2024-02-03T11:00:00Z',
    tags: [tag(1), tag(8)],
  },
  {
    id: 8,
    title: 'Этапы найма',
    slug: 'etapy-nayma',
    content: '<h2>Конфигурация этапов</h2><p>Настройте этапы воронки подбора под ваши процессы</p><h3>Стандартные этапы</h3><p>Резюме → Screening → Интервью → Оффер → Вышел</p>',
    description: 'Настройка этапов рекрутинга',
    category: 'Настройка',
    parent_id: null,
    related_app: 'company_settings',
    order: 2,
    is_published: true,
    created_at: '2024-01-17T14:00:00Z',
    updated_at: '2024-02-04T09:00:00Z',
    tags: [tag(1), tag(5)],
  },
  // Использование
  {
    id: 9,
    title: 'Создание вакансии',
    slug: 'sozdanie-vakansii',
    content: '<h2>Как создать вакансию</h2><p>Перейдите в раздел Вакансии → Создать. Заполните название, описание, требования.</p><h3>Поля</h3><ul><li>Название</li><li>Специализация</li><li>Зарплатная вилка</li></ul>',
    description: 'Пошаговое создание вакансии',
    category: 'Использование',
    parent_id: null,
    related_app: 'vacancies',
    order: 0,
    is_published: true,
    created_at: '2024-01-22T10:00:00Z',
    updated_at: '2024-02-06T14:00:00Z',
    tags: [tag(3), tag(5)],
  },
  {
    id: 10,
    title: 'Настройка календаря интервью',
    slug: 'kalendar-intervyu',
    content: '<h2>Расписание интервью</h2><p>Подключите Google Calendar для синхронизации слотов.</p><h3>Слоты</h3><p>Слоты создаются автоматически на основе рабочего времени интервьюера.</p>',
    description: 'Календарь и слоты для интервью',
    category: 'Использование',
    parent_id: null,
    related_app: 'google_oauth',
    order: 1,
    is_published: true,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-02-10T11:00:00Z',
    tags: [tag(4)],
  },
  {
    id: 11,
    title: 'AI-помощник',
    slug: 'ai-pomoshnik',
    content: '<h2>Использование AI</h2><p>AI-помощник помогает с анализом резюме, генерацией описаний вакансий.</p><h3>Интеграция через Gemini</h3><p>Требуется API-ключ в настройках профиля.</p>',
    description: 'Возможности AI-помощника',
    category: 'Использование',
    parent_id: null,
    related_app: 'gemini',
    order: 2,
    is_published: true,
    created_at: '2024-01-28T09:00:00Z',
    updated_at: '2024-02-11T15:00:00Z',
    tags: [tag(7)],
  },
  // Интеграции
  {
    id: 12,
    title: 'Интеграция с Huntflow',
    slug: 'integracia-huntflow',
    content: '<h2>Подключение Huntflow</h2><p>Huntflow — ATS для управления вакансиями и кандидатами. Для подключения потребуется API-ключ.</p><h3>Шаги</h3><ol><li>Получите API-ключ в личном кабинете Huntflow</li><li>Вставьте ключ в настройках интеграций</li><li>Синхронизируйте вакансии</li></ol>',
    description: 'Подключение и настройка Huntflow',
    category: 'Интеграции',
    parent_id: null,
    related_app: 'huntflow',
    order: 0,
    is_published: true,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-02-10T11:00:00Z',
    tags: [tag(2), tag(3)],
  },
  {
    id: 13,
    title: 'Google Calendar',
    slug: 'google-calendar',
    content: '<h2>Синхронизация календаря</h2><p>OAuth-авторизация для доступа к Google Calendar.</p><h3>Права</h3><p>Требуется доступ на чтение и создание событий.</p>',
    description: 'Подключение Google Calendar',
    category: 'Интеграции',
    parent_id: null,
    related_app: 'google_oauth',
    order: 1,
    is_published: true,
    created_at: '2024-01-21T11:00:00Z',
    updated_at: '2024-02-09T10:00:00Z',
    tags: [tag(2), tag(4)],
  },
  {
    id: 14,
    title: 'ClickUp и Notion',
    slug: 'clickup-notion',
    content: '<h2>Интеграция с задачами</h2><p>Связывайте кандидатов с задачами в ClickUp или Notion.</p><h3>Двусторонняя синхронизация</h3><p>Изменения статусов синхронизируются в обе стороны.</p>',
    description: 'Связь с ClickUp и Notion',
    category: 'Интеграции',
    parent_id: null,
    related_app: 'clickup_int',
    order: 2,
    is_published: true,
    created_at: '2024-01-24T14:00:00Z',
    updated_at: '2024-02-07T12:00:00Z',
    tags: [tag(2)],
  },
  // Без категории
  {
    id: 15,
    title: 'Чек-лист онбординга',
    slug: 'checklist-onboarding',
    content: '<h2>Чек-лист для нового сотрудника</h2><p>Стандартный список задач при выходе на работу.</p><ul><li>Выдать оборудование</li><li>Провести экскурсию</li><li>Назначить бадди</li></ul>',
    description: 'Шаблон чек-листа онбординга',
    category: '',
    parent_id: null,
    related_app: '',
    order: 0,
    is_published: true,
    created_at: '2024-01-30T10:00:00Z',
    updated_at: '2024-02-12T09:00:00Z',
    tags: [tag(6)],
  },
  {
    id: 17,
    title: 'Этап резюме',
    slug: 'etap-rezyume',
    content: '<h2>Этап резюме</h2><p>Первый этап воронки — проверка резюме кандидата.</p>',
    description: 'Настройка этапа резюме',
    category: 'Настройка',
    parent_id: 8,
    related_app: 'company_settings',
    order: 3,
    is_published: true,
    created_at: '2024-01-17T15:00:00Z',
    updated_at: '2024-02-04T10:00:00Z',
    tags: [tag(1), tag(5)],
  },
  {
    id: 18,
    title: 'Этап интервью',
    slug: 'etap-intervyu',
    content: '<h2>Этап интервью</h2><p>Этап проведения интервью с кандидатом.</p>',
    description: 'Настройка этапа интервью',
    category: 'Настройка',
    parent_id: 8,
    related_app: 'company_settings',
    order: 4,
    is_published: true,
    created_at: '2024-01-17T16:00:00Z',
    updated_at: '2024-02-04T11:00:00Z',
    tags: [tag(1), tag(5)],
  },
  {
    id: 19,
    title: 'Настройка ClickUp',
    slug: 'nastroyka-clickup',
    content: '<h2>Подключение ClickUp</h2><p>API-ключ и настройка синхронизации.</p>',
    description: 'Подключение ClickUp',
    category: 'Интеграции',
    parent_id: 14,
    related_app: 'clickup_int',
    order: 3,
    is_published: true,
    created_at: '2024-01-24T15:00:00Z',
    updated_at: '2024-02-07T13:00:00Z',
    tags: [tag(2)],
  },
  {
    id: 20,
    title: 'Настройка Notion',
    slug: 'nastroyka-notion',
    content: '<h2>Подключение Notion</h2><p>OAuth и настройка интеграции с Notion.</p>',
    description: 'Подключение Notion',
    category: 'Интеграции',
    parent_id: 14,
    related_app: 'notion_int',
    order: 4,
    is_published: true,
    created_at: '2024-01-24T16:00:00Z',
    updated_at: '2024-02-07T14:00:00Z',
    tags: [tag(2)],
  },
  {
    id: 16,
    title: 'FAQ',
    slug: 'faq',
    content: '<h2>Частые вопросы</h2><p><strong>Как сбросить пароль?</strong> — Через форму восстановления.</p><p><strong>Как добавить интервьюера?</strong> — В настройках профиля.</p>',
    description: 'Ответы на частые вопросы',
    category: '',
    parent_id: null,
    related_app: '',
    order: 1,
    is_published: true,
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-02-01T08:00:00Z',
    tags: [],
  },
]

let mockPages = [...MOCK_PAGES]
let nextId = 21

export interface WikiListParams {
  category?: string
  tag?: string
  app?: string
  q?: string
}

export async function fetchWikiPages(params?: WikiListParams): Promise<WikiPage[]> {
  // TODO: apiClient.get('/wiki/pages/', { params })
  await delay(300)
  let result = mockPages.filter((p) => p.is_published)
  if (params?.category) result = result.filter((p) => p.category === params.category)
  if (params?.tag) result = result.filter((p) => p.tags.some((t) => t.name === params.tag))
  if (params?.app) result = result.filter((p) => p.related_app === params.app)
  if (params?.q) {
    const q = params.q.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }
  return result.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export async function fetchWikiPage(slug: string): Promise<WikiPage | null> {
  // TODO: apiClient.get(`/wiki/pages/${slug}/`)
  await delay(200)
  return mockPages.find((p) => p.slug === slug && p.is_published) ?? null
}

export async function fetchWikiPageForEdit(slug: string): Promise<WikiPage | null> {
  // TODO: apiClient.get(`/wiki/pages/${slug}/edit/`)
  await delay(200)
  return mockPages.find((p) => p.slug === slug) ?? null
}

export async function fetchWikiTags(): Promise<WikiTag[]> {
  // TODO: apiClient.get('/wiki/tags/')
  await delay(150)
  return mockTags
}

export async function createWikiPage(data: WikiPageFormData): Promise<WikiPage> {
  // TODO: apiClient.post('/wiki/pages/', data)
  await delay(400)
  const page: WikiPage = {
    id: nextId++,
    title: data.title,
    slug: data.slug,
    content: data.content,
    description: data.description,
    category: data.category,
    parent_id: data.parent_id,
    related_app: data.related_app,
    order: data.order,
    is_published: data.is_published,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: mockTags.filter((t) => data.tag_ids.includes(t.id)),
  }
  mockPages.push(page)
  return page
}

export async function updateWikiPage(slug: string, data: WikiPageFormData): Promise<WikiPage> {
  // TODO: apiClient.put(`/wiki/pages/${slug}/`, data)
  await delay(400)
  const idx = mockPages.findIndex((p) => p.slug === slug)
  if (idx < 0) throw new Error('Страница не найдена')
  const page: WikiPage = {
    ...mockPages[idx],
    title: data.title,
    slug: data.slug,
    content: data.content,
    description: data.description,
    category: data.category,
    parent_id: data.parent_id,
    related_app: data.related_app,
    order: data.order,
    is_published: data.is_published,
    updated_at: new Date().toISOString(),
    tags: mockTags.filter((t) => data.tag_ids.includes(t.id)),
  }
  mockPages[idx] = page
  return page
}

export async function createWikiTag(name: string, color?: string): Promise<WikiTag> {
  // TODO: apiClient.post('/wiki/tags/create/', { name, color })
  await delay(200)
  const tag: WikiTag = {
    id: mockTags.length + 1,
    name: name.toLowerCase(),
    color: color ?? '#6c757d',
  }
  mockTags.push(tag)
  return tag
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
