import type { WorkItem } from './types'

/** Основной переход «в раздел» для объекта: appLinks или типовой маршрут. */
export function getWorkItemContextHref(item: WorkItem): string {
  if (item.appLinks?.[0]?.href) return item.appLinks[0].href
  switch (item.domain) {
    case 'candidate':
      return '/ats/vacancy/1/candidate/1'
    case 'vacancy':
      return '/vacancies'
    case 'hiring_request':
      return '/hiring-requests'
    case 'project':
      return '/projects'
    case 'event':
      return '/calendar'
    case 'meet':
      return '/meet'
    case 'wiki':
      return '/wiki-new'
    case 'specialist':
      return '/specializations'
    case 'company':
      return '/company-settings'
    case 'integration':
      return '/company-settings/integrations'
    case 'report':
      return '/reporting'
    case 'task':
    default:
      return '/tasks'
  }
}
