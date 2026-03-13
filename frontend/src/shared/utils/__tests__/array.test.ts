import { describe, it, expect } from 'vitest'
import {
  chunk,
  unique,
  uniqueBy,
  groupBy,
  sortBy,
  first,
  last,
  isEmpty,
  range,
  intersection,
  difference,
  flatten,
  compact,
} from '../array'

describe('array utils', () => {
  describe('chunk', () => {
    it('splits array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it('handles empty array', () => {
      expect(chunk([], 2)).toEqual([])
    })

    it('returns empty array for invalid size', () => {
      expect(chunk([1, 2, 3], 0)).toEqual([])
      expect(chunk([1, 2, 3], -1)).toEqual([])
    })
  })

  describe('unique', () => {
    it('removes duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })

    it('handles strings', () => {
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('handles empty array', () => {
      expect(unique([])).toEqual([])
    })
  })

  describe('uniqueBy', () => {
    it('removes duplicates by key', () => {
      const items = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' },
      ]
      expect(uniqueBy(items, (item) => item.id)).toEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ])
    })
  })

  describe('groupBy', () => {
    it('groups items by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ]
      expect(groupBy(items, (item) => item.type)).toEqual({
        a: [
          { type: 'a', value: 1 },
          { type: 'a', value: 3 },
        ],
        b: [{ type: 'b', value: 2 }],
      })
    })
  })

  describe('sortBy', () => {
    it('sorts by key ascending', () => {
      const items = [{ n: 3 }, { n: 1 }, { n: 2 }]
      expect(sortBy(items, (item) => item.n)).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }])
    })

    it('sorts by key descending', () => {
      const items = [{ n: 3 }, { n: 1 }, { n: 2 }]
      expect(sortBy(items, (item) => item.n, 'desc')).toEqual([
        { n: 3 },
        { n: 2 },
        { n: 1 },
      ])
    })

    it('does not mutate original array', () => {
      const items = [{ n: 3 }, { n: 1 }, { n: 2 }]
      sortBy(items, (item) => item.n)
      expect(items).toEqual([{ n: 3 }, { n: 1 }, { n: 2 }])
    })
  })

  describe('first', () => {
    it('returns first element', () => {
      expect(first([1, 2, 3])).toBe(1)
    })

    it('returns undefined for empty array', () => {
      expect(first([])).toBeUndefined()
    })
  })

  describe('last', () => {
    it('returns last element', () => {
      expect(last([1, 2, 3])).toBe(3)
    })

    it('returns undefined for empty array', () => {
      expect(last([])).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('returns false for non-empty array', () => {
      expect(isEmpty([1])).toBe(false)
    })
  })

  describe('range', () => {
    it('creates range of numbers', () => {
      expect(range(0, 5)).toEqual([0, 1, 2, 3, 4])
    })

    it('uses custom step', () => {
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8])
    })

    it('handles start > 0', () => {
      expect(range(5, 10)).toEqual([5, 6, 7, 8, 9])
    })
  })

  describe('intersection', () => {
    it('returns common elements', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
    })

    it('returns empty array for no common elements', () => {
      expect(intersection([1, 2], [3, 4])).toEqual([])
    })
  })

  describe('difference', () => {
    it('returns elements not in second array', () => {
      expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1])
    })

    it('returns all elements if no overlap', () => {
      expect(difference([1, 2], [3, 4])).toEqual([1, 2])
    })
  })

  describe('flatten', () => {
    it('flattens nested arrays', () => {
      expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles empty arrays', () => {
      expect(flatten([])).toEqual([])
    })
  })

  describe('compact', () => {
    it('removes falsy values', () => {
      expect(compact([0, 1, false, 2, '', 3, null, undefined])).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      expect(compact([])).toEqual([])
    })
  })
})
