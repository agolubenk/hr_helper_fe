import type { RbacAction, RbacResourceId } from '@/features/rbac-admin/types'

export const RBAC_RESOURCE_LABELS: Record<RbacResourceId, string> = {
  users: 'Пользователи и учётные записи',
  recruiting: 'Рекрутинг и ATS',
  employees: 'Сотрудники и оргданные',
  reports: 'Отчёты и выгрузки',
  'company-settings': 'Настройки компании',
  content: 'Контент (вики, внутренний сайт)',
  analytics: 'Аналитика и дашборды',
  billing: 'Биллинг и лицензии',
}

export const RBAC_ACTION_LABELS: Record<RbacAction, string> = {
  read: 'Просмотр',
  create: 'Создание',
  update: 'Изменение',
  delete: 'Удаление',
  export: 'Экспорт',
  manage: 'Управление',
}
