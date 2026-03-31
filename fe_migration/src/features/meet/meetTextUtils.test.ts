import { describe, expect, it } from 'vitest'
import { getMeetInitials } from './meetTextUtils'

describe('getMeetInitials', () => {
  it('returns two letters from first and last word', () => {
    expect(getMeetInitials('John Doe')).toBe('JD')
  })

  it('returns up to two chars for single token', () => {
    expect(getMeetInitials('Madonna')).toBe('MA')
  })

  it('handles empty and whitespace', () => {
    expect(getMeetInitials('')).toBe('?')
    expect(getMeetInitials('   ')).toBe('?')
  })
})
