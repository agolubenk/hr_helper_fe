import { MENU_LEVEL1_ORDER } from '@/config/menuConfig'
import type { WorkItem, WorkItemsSidebarFilterId } from './types'
import { itemMatchesMenuRoot } from './menuDomainMap'

const MOCK_CURRENT_USER_INITIALS = 'АК'

const MENU_ROOT_SET = new Set<string>(MENU_LEVEL1_ORDER)

function matchesDomainFilter(item: WorkItem, filterId: WorkItemsSidebarFilterId): boolean {
  if (filterId === 'inbox') return item.status === 'Новый'
  if (filterId === 'all') return true
  if (filterId === 'mywork') return item.assignee === MOCK_CURRENT_USER_INITIALS

  if (MENU_ROOT_SET.has(filterId)) {
    return itemMatchesMenuRoot(item.domain, filterId)
  }

  return false
}

export function filterWorkItemsBySidebar(items: WorkItem[], filterId: WorkItemsSidebarFilterId): WorkItem[] {
  return items.filter((item) => matchesDomainFilter(item, filterId))
}

export function searchWorkItems(items: WorkItem[], query: string): WorkItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (i) =>
      i.title.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q)) ||
      (i.menuContext?.toLowerCase().includes(q) ?? false)
  )
}

export function filterAndSearchWorkItems(
  items: WorkItem[],
  sidebarFilter: WorkItemsSidebarFilterId,
  query: string
): WorkItem[] {
  return searchWorkItems(filterWorkItemsBySidebar(items, sidebarFilter), query)
}
