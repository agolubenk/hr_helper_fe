import { describe, expect, it } from 'vitest'
import type { WorkItem } from '../types'
import { formatWorkItemListDueDate } from '../formatListDueDate'

const base: Pick<WorkItem, 'date' | 'dueAt'> = { date: '03 апр' }

describe('formatWorkItemListDueDate', () => {
  it('formats dueAt as DD.MM.YYYY in ru locale', () => {
    expect(
      formatWorkItemListDueDate({
        ...base,
        dueAt: '2026-04-03',
      } as WorkItem)
    ).toMatch(/03\.04\.2026/)
  })

  it('falls back to date when dueAt missing', () => {
    expect(formatWorkItemListDueDate({ date: '03 апр' } as WorkItem)).toBe('03 апр')
  })
})
