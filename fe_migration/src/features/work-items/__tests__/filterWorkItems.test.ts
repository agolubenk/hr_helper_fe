import { describe, expect, it } from 'vitest'
import type { WorkItem } from '../types'
import { filterWorkItemsBySidebar, filterAndSearchWorkItems, searchWorkItems } from '../filterWorkItems'

const sample: WorkItem[] = [
  {
    id: 'CAND-001',
    domain: 'candidate',
    title: 'Иван С.',
    status: 'Скрин',
    assignee: 'АК',
    priority: 'Высокий',
    date: '01 апр',
    tags: ['React'],
    description: '',
    relatedItems: [],
  },
  {
    id: 'VAC-001',
    domain: 'vacancy',
    title: 'Senior Frontend',
    status: 'В работе',
    assignee: 'МВ',
    priority: 'Средний',
    date: '15 апр',
    tags: [],
    description: '',
    relatedItems: [],
  },
  {
    id: 'NEW-001',
    domain: 'task',
    title: 'Черновик',
    status: 'Новый',
    assignee: 'МВ',
    priority: 'Низкий',
    date: '10 апр',
    tags: [],
    description: '',
    relatedItems: [],
  },
]

describe('filterWorkItemsBySidebar', () => {
  it('recruiting keeps candidates and vacancies', () => {
    const r = filterWorkItemsBySidebar(sample, 'recruiting')
    expect(r).toHaveLength(2)
    expect(r.map((i) => i.id).sort()).toEqual(['CAND-001', 'VAC-001'])
  })

  it('filters my work by assignee initials АК', () => {
    expect(filterWorkItemsBySidebar(sample, 'mywork')).toHaveLength(1)
    expect(filterWorkItemsBySidebar(sample, 'mywork')[0].id).toBe('CAND-001')
  })

  it('inbox keeps only Новый status', () => {
    const r = filterWorkItemsBySidebar(sample, 'inbox')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('NEW-001')
  })
})

describe('searchWorkItems', () => {
  it('matches title and id', () => {
    expect(searchWorkItems(sample, 'frontend')).toHaveLength(1)
    expect(searchWorkItems(sample, 'vac-001')).toHaveLength(1)
  })
})

describe('filterAndSearchWorkItems', () => {
  it('applies sidebar then search', () => {
    const r = filterAndSearchWorkItems(sample, 'recruiting', 'senior')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('VAC-001')
  })
})
