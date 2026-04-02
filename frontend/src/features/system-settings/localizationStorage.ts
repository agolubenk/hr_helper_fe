import type { LocalizationSettingsState, TranslationOverrideRow } from './types'
import { ALL_APP_LOCALES, type AppLocale } from '@/features/system-settings/localeCatalog'

const SETTINGS_KEY = 'hr-helper-localization-settings'
const OVERRIDES_KEY = 'hr-helper-translation-overrides'

function isAppLocale(x: unknown): x is AppLocale {
  return x === 'ru' || x === 'en' || x === 'be'
}

/** Согласованность: минимум одна локаль, основной и резервный входят в включённые. */
export function normalizeLocaleState(s: LocalizationSettingsState): LocalizationSettingsState {
  const rawEnabled = Array.isArray(s.enabledLocales)
    ? s.enabledLocales.filter(isAppLocale)
    : [...ALL_APP_LOCALES]
  let enabledLocales = [...new Set(rawEnabled)]
  if (enabledLocales.length === 0) enabledLocales = ['ru']

  let interfaceLocale = s.interfaceLocale
  if (!isAppLocale(interfaceLocale) || !enabledLocales.includes(interfaceLocale)) {
    interfaceLocale = enabledLocales[0]
  }

  let fallbackLocale = s.fallbackLocale
  if (!isAppLocale(fallbackLocale) || !enabledLocales.includes(fallbackLocale)) {
    fallbackLocale = enabledLocales.find((l) => l !== interfaceLocale) ?? enabledLocales[0]
  }

  return {
    ...s,
    enabledLocales,
    interfaceLocale,
    fallbackLocale,
  }
}

const DEFAULT_LOCALIZATION: LocalizationSettingsState = normalizeLocaleState({
  enabledLocales: [...ALL_APP_LOCALES],
  interfaceLocale: 'ru',
  fallbackLocale: 'en',
  showTranslationKeys: false,
})

export const LOCALIZATION_SETTINGS_CHANGED = 'hr-helper-localization-changed' as const

export function readLocalizationSettings(): LocalizationSettingsState {
  if (typeof window === 'undefined') return { ...DEFAULT_LOCALIZATION }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_LOCALIZATION }
    const p = JSON.parse(raw) as Partial<LocalizationSettingsState> & {
      enabledLocales?: unknown
      interfaceLocale?: unknown
      fallbackLocale?: unknown
    }

    const enabledFromStorage = Array.isArray(p.enabledLocales)
      ? (p.enabledLocales.filter(isAppLocale) as AppLocale[])
      : undefined

    return normalizeLocaleState({
      enabledLocales:
        enabledFromStorage && enabledFromStorage.length > 0 ? enabledFromStorage : [...ALL_APP_LOCALES],
      interfaceLocale: isAppLocale(p.interfaceLocale) ? p.interfaceLocale : 'ru',
      fallbackLocale: isAppLocale(p.fallbackLocale) ? p.fallbackLocale : 'en',
      showTranslationKeys: Boolean(p.showTranslationKeys),
    })
  } catch {
    return { ...DEFAULT_LOCALIZATION }
  }
}

export function writeLocalizationSettings(s: LocalizationSettingsState): void {
  if (typeof window === 'undefined') return
  try {
    const normalized = normalizeLocaleState(s)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(LOCALIZATION_SETTINGS_CHANGED))
}

export function emptyTranslationValues(): Record<AppLocale, string> {
  const o = {} as Record<AppLocale, string>
  for (const l of ALL_APP_LOCALES) {
    o[l] = ''
  }
  return o
}

/** Нормализация строки из storage / импорта (в т.ч. старый формат с полями ru, en). */
export function normalizeTranslationOverrideRow(raw: unknown): TranslationOverrideRow | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.key !== 'string') return null

  const base = emptyTranslationValues()

  if (o.values !== null && typeof o.values === 'object' && !Array.isArray(o.values)) {
    const v = o.values as Record<string, unknown>
    for (const loc of ALL_APP_LOCALES) {
      const t = v[loc]
      if (typeof t === 'string') base[loc] = t
    }
    return { id: o.id, key: o.key, values: base }
  }

  for (const loc of ALL_APP_LOCALES) {
    const t = o[loc]
    if (typeof t === 'string') base[loc] = t
  }
  return { id: o.id, key: o.key, values: base }
}

const MOCK_DEFAULT_OVERRIDES: TranslationOverrideRow[] = [
  {
    id: '1',
    key: 'footer.tagline',
    values: { ru: 'HR Helper', en: 'HR Helper', be: '' },
  },
  {
    id: '2',
    key: 'wiki.empty.title',
    values: { ru: 'Пока нет статей', en: 'No articles yet', be: '' },
  },
]

export function readTranslationOverrides(): TranslationOverrideRow[] {
  if (typeof window === 'undefined') return [...MOCK_DEFAULT_OVERRIDES]
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY)
    if (!raw) return [...MOCK_DEFAULT_OVERRIDES]
    const p = JSON.parse(raw) as unknown
    if (!Array.isArray(p)) return [...MOCK_DEFAULT_OVERRIDES]
    const rows = p
      .map((r) => normalizeTranslationOverrideRow(r))
      .filter((r): r is TranslationOverrideRow => r !== null)
    return rows.length > 0 ? rows : [...MOCK_DEFAULT_OVERRIDES]
  } catch {
    return [...MOCK_DEFAULT_OVERRIDES]
  }
}

export function writeTranslationOverrides(rows: TranslationOverrideRow[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(rows))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(LOCALIZATION_SETTINGS_CHANGED))
}
