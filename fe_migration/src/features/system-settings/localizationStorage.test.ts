import { describe, expect, it } from 'vitest'
import {
  normalizeLocaleState,
  normalizeTranslationOverrideRow,
} from '@/features/system-settings/localizationStorage'
import type { LocalizationSettingsState } from '@/features/system-settings/types'

describe('normalizeLocaleState', () => {
  it('keeps at least one locale and fits interface/fallback into enabled', () => {
    const s: LocalizationSettingsState = {
      enabledLocales: ['ru'],
      interfaceLocale: 'en',
      fallbackLocale: 'be',
      showTranslationKeys: false,
    }
    const n = normalizeLocaleState(s)
    expect(n.enabledLocales).toEqual(['ru'])
    expect(n.interfaceLocale).toBe('ru')
    expect(n.fallbackLocale).toBe('ru')
  })

  it('dedupes enabled locales', () => {
    const n = normalizeLocaleState({
      enabledLocales: ['ru', 'ru', 'en'],
      interfaceLocale: 'ru',
      fallbackLocale: 'en',
      showTranslationKeys: true,
    })
    expect(n.enabledLocales).toEqual(['ru', 'en'])
  })
})

describe('normalizeTranslationOverrideRow', () => {
  it('parses legacy ru/en shape', () => {
    const r = normalizeTranslationOverrideRow({
      id: '1',
      key: 'a.b',
      ru: 'р',
      en: 'e',
    })
    expect(r?.values.ru).toBe('р')
    expect(r?.values.en).toBe('e')
    expect(r?.values.be).toBe('')
  })

  it('parses values object', () => {
    const r = normalizeTranslationOverrideRow({
      id: '2',
      key: 'c',
      values: { ru: '1', en: '2', be: '3' },
    })
    expect(r?.values).toEqual({ ru: '1', en: '2', be: '3' })
  })
})
