import { describe, expect, it } from 'vitest'
import { normalizeUserLocalePreferences } from '@/features/system-settings/userLocalePreferences'

describe('normalizeUserLocalePreferences', () => {
  it('defaults preferred to all company enabled when stored empty', () => {
    const r = normalizeUserLocalePreferences(['ru', 'en'], null, 'ru')
    expect(r.preferredLocales).toEqual(['ru', 'en'])
    expect(r.activeLocale).toBe('ru')
  })

  it('filters stored preferred to company enabled', () => {
    const r = normalizeUserLocalePreferences(
      ['ru', 'en'],
      { preferredLocales: ['en', 'be', 'ru'], activeLocale: 'en' },
      'ru'
    )
    expect(r.preferredLocales).toEqual(['en', 'ru'])
    expect(r.activeLocale).toBe('en')
  })

  it('resets active when not in preferred', () => {
    const r = normalizeUserLocalePreferences(
      ['ru', 'en'],
      { preferredLocales: ['en'], activeLocale: 'ru' },
      'ru'
    )
    expect(r.preferredLocales).toEqual(['en'])
    expect(r.activeLocale).toBe('en')
  })

  it('uses fallback enabled list when company has none', () => {
    const r = normalizeUserLocalePreferences([], null, 'en')
    expect(r.preferredLocales).toEqual(['ru'])
    expect(r.activeLocale).toBe('ru')
  })
})
