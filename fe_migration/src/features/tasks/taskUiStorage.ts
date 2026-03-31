const DONE_IDS_KEY = 'hr-helper-tasks-done-ids'

export function readDoneTaskIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(DONE_IDS_KEY)
    if (!raw) return new Set()
    const p = JSON.parse(raw) as unknown
    if (!Array.isArray(p)) return new Set()
    return new Set(p.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

export function writeDoneTaskIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DONE_IDS_KEY, JSON.stringify([...ids]))
  } catch {
    /* ignore */
  }
}

export function toggleDoneTaskId(taskId: string): Set<string> {
  const next = readDoneTaskIds()
  if (next.has(taskId)) next.delete(taskId)
  else next.add(taskId)
  writeDoneTaskIds(next)
  return next
}
