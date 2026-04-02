import type { WorkItem } from './types'

/** Отображение срока в списке: при наличии `dueAt` — ДД.ММ.ГГГГ, иначе короткая подпись `date`. */
export function formatWorkItemListDueDate(item: WorkItem): string {
  if (item.dueAt) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(item.dueAt.trim())
    if (!m) return item.date
    const y = Number(m[1])
    const mo = Number(m[2])
    const d = Number(m[3])
    if (!y || !mo || !d) return item.date
    const dt = new Date(y, mo - 1, d)
    if (Number.isNaN(dt.getTime())) return item.date
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dt)
  }
  return item.date
}
