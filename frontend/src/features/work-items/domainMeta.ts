import type { WorkItemDomain, WorkItemPriority, WorkItemStatus } from './types'

export interface WorkItemDomainMeta {
  label: string
  icon: string
  /** Класс-модификатор для цветных бейджей в CSS Modules. */
  token: string
}

export const WORK_ITEM_DOMAIN_ORDER: WorkItemDomain[] = [
  'candidate',
  'vacancy',
  'hiring_request',
  'project',
  'event',
  'meet',
  'wiki',
  'specialist',
  'integration',
  'report',
  'task',
  'company',
]

export const WORK_ITEM_DOMAIN_META: Record<WorkItemDomain, WorkItemDomainMeta> = {
  task: { label: 'Задача', icon: '☑️', token: 'domainTask' },
  candidate: { label: 'Кандидат', icon: '👤', token: 'domainCandidate' },
  vacancy: { label: 'Вакансия', icon: '💼', token: 'domainVacancy' },
  project: { label: 'Проект', icon: '📋', token: 'domainProject' },
  event: { label: 'Событие', icon: '📅', token: 'domainEvent' },
  meet: { label: 'Мит', icon: '🎥', token: 'domainMeet' },
  wiki: { label: 'Wiki', icon: '📄', token: 'domainWiki' },
  specialist: { label: 'Специалист', icon: '⭐', token: 'domainSpecialist' },
  company: { label: 'Компания', icon: '🏢', token: 'domainCompany' },
  hiring_request: { label: 'Заявка на найм', icon: '📝', token: 'domainHiringRequest' },
  integration: { label: 'Интеграция', icon: '🔗', token: 'domainIntegration' },
  report: { label: 'Отчёт', icon: '📊', token: 'domainReport' },
}

/** Привязка статуса к варианту Badge (Radix). */
export const WORK_ITEM_STATUS_BADGE_COLOR: Record<
  WorkItemStatus,
  'gray' | 'blue' | 'cyan' | 'green' | 'orange' | 'red' | 'purple' | 'amber'
> = {
  Новый: 'cyan',
  'В работе': 'blue',
  'На ревью': 'purple',
  Скрин: 'blue',
  Интервью: 'amber',
  Оффер: 'green',
  Готово: 'gray',
  Заблокирован: 'red',
  Планирование: 'gray',
}

export const WORK_ITEM_PRIORITY_DOT: Record<WorkItemPriority, string> = {
  Критичный: 'var(--red-9)',
  Высокий: 'var(--orange-9)',
  Средний: 'var(--amber-9)',
  Низкий: 'var(--gray-8)',
}

export const BOARD_STAGE_ORDER: WorkItemStatus[] = [
  'Планирование',
  'Новый',
  'В работе',
  'Скрин',
  'Интервью',
  'На ревью',
  'Оффер',
  'Готово',
]

export const STATUS_FALLBACK_BUCKET = 'Другое' as const

export function boardBucketForStatus(status: WorkItemStatus): WorkItemStatus | typeof STATUS_FALLBACK_BUCKET {
  if (BOARD_STAGE_ORDER.includes(status)) return status
  if (status === 'Заблокирован') return 'В работе'
  return STATUS_FALLBACK_BUCKET
}
