import { describe, expect, it } from 'vitest'
import {
  isValidProfileTab,
  resolveInitialProfileTab,
} from '@/components/profile/profileTabsStorage'

describe('profileTabsStorage', () => {
  it('validates known tabs only', () => {
    expect(isValidProfileTab('profile')).toBe(true)
    expect(isValidProfileTab('quick-buttons')).toBe(true)
    expect(isValidProfileTab('unknown-tab')).toBe(false)
  })

  it('prefers search tab over storage tab', () => {
    expect(resolveInitialProfileTab('schedule', 'profile')).toBe('schedule')
  })

  it('falls back to profile when both values are invalid', () => {
    expect(resolveInitialProfileTab('bad', 'also-bad')).toBe('profile')
  })
})
