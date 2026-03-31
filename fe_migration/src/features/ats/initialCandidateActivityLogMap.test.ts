import { describe, expect, it } from 'vitest'
import { initialCandidateActivityLogMap, MOCK_CANDIDATES } from './mocks'

describe('initialCandidateActivityLogMap', () => {
  it('копирует activityLog и не мутирует исходные моки', () => {
    const m = initialCandidateActivityLogMap(MOCK_CANDIDATES)
    expect(m['1']?.length).toBeGreaterThan(0)
    const first = m['1']![0]!
    const originalTitle = first.title
    first.title = 'mutated-for-test'
    const c1 = MOCK_CANDIDATES.find((c) => c.id === '1')
    expect(c1?.activityLog?.[0]?.title).toBe(originalTitle)
  })
})
