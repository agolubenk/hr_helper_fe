import { describe, expect, it } from 'vitest'
import { filterTasks, sortTasksByPriorityAndDue } from '@/features/tasks/filterTasks'
import type { TaskItem } from '@/features/tasks/types'

const sample: TaskItem[] = [
  {
    id: 'a',
    title: 'Alpha',
    summary: 'x',
    status: 'open',
    priority: 'low',
    kind: 'approval',
    domainRootId: 'recruiting',
    dueDate: '2026-04-10',
    assignee: 'U',
    tags: [],
    links: [{ label: 'L', href: '/x' }],
  },
  {
    id: 'b',
    title: 'Beta overdue',
    summary: 'y',
    status: 'in_progress',
    priority: 'urgent',
    kind: 'recruiting_action',
    domainRootId: 'calendar',
    dueDate: '2020-01-01',
    assignee: 'U',
    tags: [],
    links: [],
  },
]

describe('filterTasks', () => {
  it('filters by domain', () => {
    const f = filterTasks(
      sample,
      {
        query: '',
        domainRootId: 'recruiting',
        status: 'all',
        priority: 'all',
        kind: 'all',
        duePreset: 'all',
        onlyWithLinks: false,
      },
      { doneIds: new Set() }
    )
    expect(f.map((t) => t.id)).toEqual(['a'])
  })

  it('filters overdue', () => {
    const f = filterTasks(
      sample,
      {
        query: '',
        domainRootId: 'all',
        status: 'all',
        priority: 'all',
        kind: 'all',
        duePreset: 'overdue',
        onlyWithLinks: false,
      },
      { doneIds: new Set() }
    )
    expect(f.some((t) => t.id === 'b')).toBe(true)
  })

  it('treats doneIds as done for status filter', () => {
    const f = filterTasks(
      sample,
      {
        query: '',
        domainRootId: 'all',
        status: 'done',
        priority: 'all',
        kind: 'all',
        duePreset: 'all',
        onlyWithLinks: false,
      },
      { doneIds: new Set(['a']) }
    )
    expect(f.map((t) => t.id)).toEqual(['a'])
  })
})

describe('sortTasksByPriorityAndDue', () => {
  it('sorts urgent before low then by due date', () => {
    const s = sortTasksByPriorityAndDue(sample)
    expect(s[0]?.id).toBe('b')
    expect(s[1]?.id).toBe('a')
  })
})
