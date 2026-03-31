/** Статус задачи в едином реестре (синхронизируется с трекингом в продукте). */
export type TaskStatus = 'open' | 'in_progress' | 'done' | 'blocked' | 'delegated'

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'

/** Специфика работы — влияет на подсказки и отчёты. */
export type TaskKind =
  | 'recruiting_action'
  | 'approval'
  | 'meeting_followup'
  | 'document'
  | 'learning'
  | 'integration'
  | 'analytics'
  | 'hr_ops'
  | 'project'
  | 'settings'
  | 'communication'
  | 'workflow_inbox'

export interface TaskEntityLink {
  label: string
  href: string
  external?: boolean
}

export interface TaskItem {
  id: string
  title: string
  summary: string
  status: TaskStatus
  priority: TaskPriority
  kind: TaskKind
  /**
   * Блок сайдбара 1-го уровня (recruiting, calendar, …) — «домен» продукта.
   * Значения согласованы с id корневых пунктов MAIN_MENU_ITEMS (кроме home).
   */
  domainRootId: string
  /** Уточнение: лист меню или логический подмодуль (vacancies-list, ats, …). */
  menuContextId?: string
  menuContextLabel?: string
  /** ISO YYYY-MM-DD */
  dueDate: string
  startDate?: string
  assignee: string
  /** Источник события: ATS, n8n, календарь, … */
  sourceSystem?: string
  tags: string[]
  /** Главная целевая ссылка (карточка сущности). */
  primaryLink?: TaskEntityLink
  /** Дополнительные переходы: вакансия, вики, отчёт, интеграция. */
  links: TaskEntityLink[]
  /**
   * Предупреждение при отключённых модулях (см. menuModulesRegistry / настройки модулей).
   * Только UI; в API придёт флаг доступности.
   */
  moduleRiskHint?: string
}

export type TaskDuePreset = 'all' | 'today' | 'week' | 'overdue'

export interface TaskFilterState {
  query: string
  domainRootId: string
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  kind: TaskKind | 'all'
  duePreset: TaskDuePreset
  onlyWithLinks: boolean
}
