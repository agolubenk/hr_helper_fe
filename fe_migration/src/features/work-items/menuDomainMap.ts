import type { WorkItemDomain } from './types'

/**
 * Соответствие корневого пункта меню приложения и типов объектов реестра.
 * Один объект может попадать в несколько разделов при пересечении доменов.
 */
export const MENU_ROOT_TO_WORK_ITEM_DOMAINS: Record<string, readonly WorkItemDomain[]> = {
  calendar: ['event', 'meet'],
  'workflow-chat': ['integration', 'task'],
  tasks: ['task', 'company'],
  'meet-home': ['meet', 'event'],
  recruiting: ['candidate', 'vacancy', 'hiring_request', 'specialist'],
  onboarding: ['wiki', 'task'],
  'hr-services': ['project', 'task', 'hiring_request'],
  'employee-relations': ['company', 'task'],
  learning: ['wiki', 'task'],
  performance: ['report', 'task'],
  finance: ['report', 'integration'],
  'hr-pr': ['wiki', 'task'],
  projects: ['project', 'integration'],
  analytics: ['report'],
  integrations: ['integration'],
  'meet-system': ['meet', 'event'],
  'coding-platform': ['task'],
  'link-builder': ['task', 'integration'],
}

export function itemMatchesMenuRoot(itemDomain: WorkItemDomain, menuRootId: string): boolean {
  const allowed = MENU_ROOT_TO_WORK_ITEM_DOMAINS[menuRootId]
  if (!allowed) return false
  return (allowed as readonly WorkItemDomain[]).includes(itemDomain)
}
