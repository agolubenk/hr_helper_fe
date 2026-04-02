import { describe, expect, it } from 'vitest'
import { CODING_LANGUAGE_CATALOG, sortCatalog } from './languageCatalog'

describe('languageCatalog', () => {
  it('sortCatalog orders by order field', () => {
    const shuffled = [...CODING_LANGUAGE_CATALOG].reverse()
    const sorted = sortCatalog(shuffled)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.order).toBeGreaterThanOrEqual(sorted[i - 1]!.order)
    }
  })
})
