/**
 * Типы для вики-системы.
 * Соответствуют моделям published/hr/backend/apps/wiki/models.py
 */

export interface WikiTag {
  id: number
  name: string
  color: string
  created_at?: string
}

export const WIKI_CATEGORIES = [
  { value: '', label: 'Без категории' },
  { value: 'Введение', label: 'Введение' },
  { value: 'Архитектура', label: 'Архитектура' },
  { value: 'Настройка', label: 'Настройка' },
  { value: 'Использование', label: 'Использование' },
  { value: 'Интеграции', label: 'Интеграции' },
] as const

export const RELATED_APP_CHOICES = [
  { value: '', label: 'Не привязано' },
  { value: 'accounts', label: 'Пользователи' },
  { value: 'company_settings', label: 'Настройки компании' },
  { value: 'finance', label: 'Финансы' },
  { value: 'vacancies', label: 'Вакансии' },
  { value: 'hiring_plan', label: 'План найма' },
  { value: 'google_oauth', label: 'Google Calendar' },
  { value: 'gemini', label: 'AI-помощник' },
  { value: 'interviewers', label: 'Интервьюеры' },
  { value: 'clickup_int', label: 'ClickUp' },
  { value: 'notion_int', label: 'Notion' },
  { value: 'huntflow', label: 'Huntflow' },
] as const

export interface WikiPage {
  id: number
  title: string
  slug: string
  content: string
  description: string
  category: string
  parent_id: number | null
  related_app: string
  order: number
  is_published: boolean
  author?: { id: number; first_name?: string; last_name?: string; email?: string }
  last_edited_by?: { id: number; first_name?: string; last_name?: string; email?: string }
  created_at: string
  updated_at: string
  tags: WikiTag[]
}

export interface WikiPageHistory {
  id: number
  page: number
  title: string
  content: string
  edited_by?: { id: number; first_name?: string; last_name?: string }
  created_at: string
  change_note: string
}

export interface WikiPageFormData {
  title: string
  slug: string
  content: string
  description: string
  category: string
  parent_id: number | null
  related_app: string
  order: number
  is_published: boolean
  tag_ids: number[]
  change_note?: string
}
