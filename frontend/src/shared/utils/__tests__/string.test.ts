import { describe, it, expect } from 'vitest'
import {
  capitalize,
  capitalizeWords,
  truncate,
  slugify,
  stripHtml,
  pluralize,
  getInitials,
  isEmail,
  isUrl,
  highlightMatch,
} from '../string'

describe('string utils', () => {
  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('lowercases rest of the string', () => {
      expect(capitalize('HELLO')).toBe('Hello')
    })

    it('returns empty string for empty input', () => {
      expect(capitalize('')).toBe('')
    })
  })

  describe('capitalizeWords', () => {
    it('capitalizes each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World')
    })

    it('handles single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello')
    })

    it('returns empty string for empty input', () => {
      expect(capitalizeWords('')).toBe('')
    })
  })

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello...')
    })

    it('does not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('uses custom suffix', () => {
      expect(truncate('hello world', 9, '…')).toBe('hello wo…')
    })

    it('handles empty string', () => {
      expect(truncate('', 5)).toBe('')
    })
  })

  describe('slugify', () => {
    it('converts to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('replaces spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world')
    })

    it('removes special characters', () => {
      expect(slugify('Hello! World?')).toBe('hello-world')
    })

    it('removes leading and trailing hyphens', () => {
      expect(slugify('  hello world  ')).toBe('hello-world')
    })
  })

  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello')
    })

    it('handles nested tags', () => {
      expect(stripHtml('<div><span>Hello</span></div>')).toBe('Hello')
    })

    it('preserves text content', () => {
      expect(stripHtml('Hello World')).toBe('Hello World')
    })
  })

  describe('pluralize', () => {
    it('returns singular form for 1', () => {
      expect(pluralize(1, 'день', 'дня', 'дней')).toBe('день')
    })

    it('returns few form for 2-4', () => {
      expect(pluralize(2, 'день', 'дня', 'дней')).toBe('дня')
      expect(pluralize(3, 'день', 'дня', 'дней')).toBe('дня')
      expect(pluralize(4, 'день', 'дня', 'дней')).toBe('дня')
    })

    it('returns many form for 5-20', () => {
      expect(pluralize(5, 'день', 'дня', 'дней')).toBe('дней')
      expect(pluralize(11, 'день', 'дня', 'дней')).toBe('дней')
      expect(pluralize(20, 'день', 'дня', 'дней')).toBe('дней')
    })

    it('handles 21, 22, etc correctly', () => {
      expect(pluralize(21, 'день', 'дня', 'дней')).toBe('день')
      expect(pluralize(22, 'день', 'дня', 'дней')).toBe('дня')
      expect(pluralize(25, 'день', 'дня', 'дней')).toBe('дней')
    })
  })

  describe('getInitials', () => {
    it('returns initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('handles single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('limits to maxLength', () => {
      expect(getInitials('John Doe Smith', 2)).toBe('JD')
    })

    it('returns empty string for empty input', () => {
      expect(getInitials('')).toBe('')
    })
  })

  describe('isEmail', () => {
    it('validates correct email', () => {
      expect(isEmail('test@example.com')).toBe(true)
    })

    it('rejects invalid email', () => {
      expect(isEmail('invalid')).toBe(false)
      expect(isEmail('invalid@')).toBe(false)
      expect(isEmail('@example.com')).toBe(false)
    })
  })

  describe('isUrl', () => {
    it('validates correct URL', () => {
      expect(isUrl('https://example.com')).toBe(true)
      expect(isUrl('http://example.com/path')).toBe(true)
    })

    it('rejects invalid URL', () => {
      expect(isUrl('invalid')).toBe(false)
      expect(isUrl('example.com')).toBe(false)
    })
  })

  describe('highlightMatch', () => {
    it('wraps match with mark tag', () => {
      expect(highlightMatch('hello world', 'world')).toBe('hello <mark>world</mark>')
    })

    it('is case insensitive', () => {
      expect(highlightMatch('Hello World', 'hello')).toBe('<mark>Hello</mark> World')
    })

    it('uses custom tag', () => {
      expect(highlightMatch('hello world', 'world', 'strong')).toBe(
        'hello <strong>world</strong>'
      )
    })

    it('returns original text for empty query', () => {
      expect(highlightMatch('hello world', '')).toBe('hello world')
    })
  })
})
