import { MENU_LEVEL1_ORDER } from '@/config/menuConfig'

/** Домены универсального реестра — в т.ч. сущности HR Helper (мок). */
export type WorkItemDomain =
  | 'task'
  | 'candidate'
  | 'vacancy'
  | 'project'
  | 'event'
  | 'wiki'
  | 'specialist'
  | 'company'
  | 'hiring_request'
  | 'meet'
  | 'integration'
  | 'report'

export type WorkItemStatus =
  | 'Новый'
  | 'В работе'
  | 'На ревью'
  | 'Скрин'
  | 'Интервью'
  | 'Оффер'
  | 'Готово'
  | 'Заблокирован'
  | 'Планирование'

export type WorkItemPriority = 'Критичный' | 'Высокий' | 'Средний' | 'Низкий'

export interface WorkItemEntityLink {
  label: string
  href: string
}

export interface WorkItemFieldDef {
  key: string
  label: string
  type: 'text' | 'date' | 'datetime-local' | 'select'
  placeholder?: string
  options?: string[]
}

export interface WorkItemSchemaSection {
  key: string
  label: string
  type?: 'tags' | 'fields'
  tags?: string[]
  fields?: WorkItemFieldDef[]
}

export interface WorkItem {
  id: string
  domain: WorkItemDomain
  title: string
  status: WorkItemStatus
  assignee: string
  priority: WorkItemPriority
  /** Короткая подпись даты для списка (как в прототипе). */
  date: string
  /** Точная дата срока (YYYY-MM-DD) для колонки «Дата» в списке. */
  dueAt?: string
  /** Мок: объект отображается в закреплённой зоне (футер). */
  showInFooter?: boolean
  tags: string[]
  description: string
  relatedItems: string[]
  done?: boolean
  /** Переходы в соответствующие разделы приложения. */
  appLinks?: WorkItemEntityLink[]
  /** Подпись контекста (меню, модуль). */
  menuContext?: string
}

export type WorkItemsView = 'list' | 'board' | 'calendar'

/** Корневые пункты меню приложения (тот же порядок, что в сайдбаре). */
export type WorkItemsMenuRootId = (typeof MENU_LEVEL1_ORDER)[number]

/** Inbox / «все» / «мои» + фильтр по разделу меню 1-го уровня. */
export type WorkItemsSidebarFilterId = 'inbox' | 'all' | 'mywork' | WorkItemsMenuRootId
