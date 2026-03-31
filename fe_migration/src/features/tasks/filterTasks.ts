import type { TaskDuePreset, TaskFilterState, TaskItem, TaskPriority, TaskStatus } from '@/features/tasks/types'

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function parseISODate(s: string): Date | null {
  const d = new Date(s + 'T12:00:00')
  return Number.isNaN(d.getTime()) ? null : d
}

function matchesDuePreset(task: TaskItem, preset: TaskDuePreset): boolean {
  if (preset === 'all') return true
  const due = parseISODate(task.dueDate)
  if (!due) return false
  const t0 = startOfToday()
  if (preset === 'overdue') return due < t0
  if (preset === 'today') return due.toDateString() === t0.toDateString()
  if (preset === 'week') {
    const end = addDays(t0, 7)
    return due >= t0 && due <= end
  }
  return true
}

export function filterTasks(
  tasks: TaskItem[],
  filter: TaskFilterState,
  options: { doneIds: Set<string> }
): TaskItem[] {
  const q = filter.query.trim().toLowerCase()

  return tasks.filter((task) => {
    const effectiveStatus: TaskStatus = options.doneIds.has(task.id) ? 'done' : task.status
    if (filter.status !== 'all' && effectiveStatus !== filter.status) return false
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false
    if (filter.kind !== 'all' && task.kind !== filter.kind) return false
    if (filter.domainRootId !== 'all' && task.domainRootId !== filter.domainRootId) return false
    if (!matchesDuePreset(task, filter.duePreset)) return false
    if (filter.onlyWithLinks && task.links.length === 0 && !task.primaryLink) return false
    if (q) {
      const hay = [
        task.title,
        task.summary,
        task.assignee,
        task.menuContextLabel ?? '',
        ...(task.tags ?? []),
        ...(task.sourceSystem ? [task.sourceSystem] : []),
      ]
        .join(' ')
       .toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export function sortTasksByPriorityAndDue(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort((a, b) => {
    const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    if (pr !== 0) return pr
    const da = parseISODate(a.dueDate)?.getTime() ?? 0
    const db = parseISODate(b.dueDate)?.getTime() ?? 0
    return da - db
  })
}
