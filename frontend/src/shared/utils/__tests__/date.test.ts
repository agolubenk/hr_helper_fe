import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDateTime,
  addDays,
  addMonths,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  daysBetween,
} from '../date'

describe('date utils', () => {
  describe('formatDate', () => {
    const testDate = new Date('2025-03-15T10:30:00Z')

    it('formats date in short format', () => {
      const result = formatDate(testDate, 'short', 'en-US')
      expect(result).toContain('2025')
    })

    it('formats date in iso format', () => {
      const result = formatDate(testDate, 'iso')
      expect(result).toBe('2025-03-15')
    })

    it('handles string input', () => {
      const result = formatDate('2025-03-15', 'iso')
      expect(result).toBe('2025-03-15')
    })

    it('returns empty string for invalid date', () => {
      expect(formatDate('invalid', 'short')).toBe('')
    })
  })

  describe('formatTime', () => {
    const testDate = new Date('2025-03-15T10:30:45Z')

    it('formats time without seconds', () => {
      const result = formatTime(testDate, false, 'en-US')
      expect(result).toMatch(/\d{1,2}:\d{2}/)
    })

    it('returns empty string for invalid date', () => {
      expect(formatTime('invalid')).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('returns empty string for invalid date', () => {
      expect(formatDateTime('invalid')).toBe('')
    })
  })

  describe('addDays', () => {
    it('adds days to date', () => {
      const date = new Date('2025-03-15')
      const result = addDays(date, 5)
      expect(result.getDate()).toBe(20)
    })

    it('handles negative days', () => {
      const date = new Date('2025-03-15')
      const result = addDays(date, -5)
      expect(result.getDate()).toBe(10)
    })

    it('does not mutate original date', () => {
      const date = new Date('2025-03-15')
      addDays(date, 5)
      expect(date.getDate()).toBe(15)
    })
  })

  describe('addMonths', () => {
    it('adds months to date', () => {
      const date = new Date('2025-03-15')
      const result = addMonths(date, 2)
      expect(result.getMonth()).toBe(4) // May (0-indexed)
    })

    it('handles negative months', () => {
      const date = new Date('2025-03-15')
      const result = addMonths(date, -2)
      expect(result.getMonth()).toBe(0) // January
    })
  })

  describe('startOfDay', () => {
    it('sets time to start of day', () => {
      const date = new Date('2025-03-15T10:30:00')
      const result = startOfDay(date)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe('endOfDay', () => {
    it('sets time to end of day', () => {
      const date = new Date('2025-03-15T10:30:00')
      const result = endOfDay(date)
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })
  })

  describe('startOfMonth', () => {
    it('sets date to first day of month', () => {
      const date = new Date('2025-03-15T10:30:00')
      const result = startOfMonth(date)
      expect(result.getDate()).toBe(1)
      expect(result.getHours()).toBe(0)
    })
  })

  describe('endOfMonth', () => {
    it('sets date to last day of month', () => {
      const date = new Date('2025-03-15T10:30:00')
      const result = endOfMonth(date)
      expect(result.getDate()).toBe(31)
      expect(result.getHours()).toBe(23)
    })

    it('handles February correctly', () => {
      const date = new Date('2025-02-15')
      const result = endOfMonth(date)
      expect(result.getDate()).toBe(28)
    })
  })

  describe('isSameDay', () => {
    it('returns true for same day', () => {
      const date1 = new Date('2025-03-15T10:00:00')
      const date2 = new Date('2025-03-15T20:00:00')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('returns false for different days', () => {
      const date1 = new Date('2025-03-15')
      const date2 = new Date('2025-03-16')
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('isToday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-03-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns true for today', () => {
      expect(isToday(new Date('2025-03-15T08:00:00'))).toBe(true)
    })

    it('returns false for other days', () => {
      expect(isToday(new Date('2025-03-14'))).toBe(false)
    })
  })

  describe('isBefore', () => {
    it('returns true if date is before compare date', () => {
      const date = new Date('2025-03-15')
      const compareDate = new Date('2025-03-20')
      expect(isBefore(date, compareDate)).toBe(true)
    })

    it('returns false if date is after compare date', () => {
      const date = new Date('2025-03-20')
      const compareDate = new Date('2025-03-15')
      expect(isBefore(date, compareDate)).toBe(false)
    })
  })

  describe('isAfter', () => {
    it('returns true if date is after compare date', () => {
      const date = new Date('2025-03-20')
      const compareDate = new Date('2025-03-15')
      expect(isAfter(date, compareDate)).toBe(true)
    })

    it('returns false if date is before compare date', () => {
      const date = new Date('2025-03-15')
      const compareDate = new Date('2025-03-20')
      expect(isAfter(date, compareDate)).toBe(false)
    })
  })

  describe('daysBetween', () => {
    it('calculates days between dates', () => {
      const date1 = new Date('2025-03-15')
      const date2 = new Date('2025-03-20')
      expect(daysBetween(date1, date2)).toBe(5)
    })

    it('returns positive value regardless of order', () => {
      const date1 = new Date('2025-03-20')
      const date2 = new Date('2025-03-15')
      expect(daysBetween(date1, date2)).toBe(5)
    })
  })
})
