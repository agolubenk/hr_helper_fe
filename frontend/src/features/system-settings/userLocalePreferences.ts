import type { AppLocale } from '@/features/system-settings/localeCatalog'
import {
  LOCALIZATION_SETTINGS_CHANGED,
  readLocalizationSettings,
} from '@/features/system-settings/localizationStorage'

const USER_PREFS_KEY = 'hr-helper-user-ui-locale-preferences'

export const USER_LOCALE_PREFERENCES_CHANGED = 'hr-helper-user-locale-prefs-changed' as const

export interface UserLocalePreferencesState {
  preferredLocales: AppLocale[]
  activeLocale: AppLocale
}

function isAppLocale(x: unknown): x is AppLocale {
  return x === 'ru' || x === 'en' || x === 'be'
}

const DOC_LANG_MAP: Record<AppLocale, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  be: 'be-BY',
}

/** Согласованность с настройками компании: предпочтения — непустое подмножество enabled. */
export function normalizeUserLocalePreferences(
  companyEnabled: AppLocale[],
  stored: Partial<UserLocalePreferencesState> | null,
  fallbackActive: AppLocale
): UserLocalePreferencesState {
  const enabled =
    companyEnabled.length > 0 ? [...new Set(companyEnabled)] : (['ru'] as AppLocale[])

  let preferred: AppLocale[] = []
  if (stored?.preferredLocales && Array.isArray(stored.preferredLocales)) {
    preferred = stored.preferredLocales.filter((l): l is AppLocale => isAppLocale(l) && enabled.includes(l))
  }
  if (preferred.length === 0) preferred = [...enabled]

  let active: AppLocale = isAppLocale(stored?.activeLocale) ? stored.activeLocale : fallbackActive
  if (!enabled.includes(active) || !preferred.includes(active)) {
    active = preferred[0]
  }

  return {
    preferredLocales: [...new Set(preferred)],
    activeLocale: active,
  }
}

export function applyDocumentLangFromPreferences(): void {
  if (typeof document === 'undefined') return
  const { activeLocale } = readUserLocalePreferences()
  document.documentElement.lang = DOC_LANG_MAP[activeLocale]
}

export function readUserLocalePreferences(): UserLocalePreferencesState {
  const company = readLocalizationSettings()
  if (typeof window === 'undefined') {
    return normalizeUserLocalePreferences(company.enabledLocales, null, company.interfaceLocale)
  }
  try {
    const raw = localStorage.getItem(USER_PREFS_KEY)
    const parsed = raw
      ? (JSON.parse(raw) as Partial<UserLocalePreferencesState>)
      : null
    return normalizeUserLocalePreferences(company.enabledLocales, parsed, company.interfaceLocale)
  } catch {
    return normalizeUserLocalePreferences(company.enabledLocales, null, company.interfaceLocale)
  }
}

export function writeUserLocalePreferences(state: UserLocalePreferencesState): void {
  if (typeof window === 'undefined') return
  const company = readLocalizationSettings()
  const normalized = normalizeUserLocalePreferences(
    company.enabledLocales,
    state,
    company.interfaceLocale
  )
  try {
    localStorage.setItem(USER_PREFS_KEY, JSON.stringify(normalized))
  } catch {
    /* ignore */
  }
  document.documentElement.lang = DOC_LANG_MAP[normalized.activeLocale]
  window.dispatchEvent(new Event(USER_LOCALE_PREFERENCES_CHANGED))
}

export function setUserActiveLocale(locale: AppLocale): void {
  const current = readUserLocalePreferences()
  if (!current.preferredLocales.includes(locale)) return
  writeUserLocalePreferences({ ...current, activeLocale: locale })
}

export function setUserPreferredLocales(locales: AppLocale[]): void {
  const company = readLocalizationSettings()
  const filtered: AppLocale[] = [...new Set(locales.filter((l) => company.enabledLocales.includes(l)))]
  const nextPreferred: AppLocale[] =
    filtered.length > 0
      ? filtered
      : company.enabledLocales.length > 0
        ? [company.enabledLocales[0]]
        : ['ru']
  const current = readUserLocalePreferences()
  let active: AppLocale = current.activeLocale
  if (!nextPreferred.includes(active)) active = nextPreferred[0]
  writeUserLocalePreferences({ preferredLocales: nextPreferred, activeLocale: active })
}

export function subscribeUserAndCompanyLocaleChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const onUser = () => callback()
  const onCompany = () => callback()
  window.addEventListener(USER_LOCALE_PREFERENCES_CHANGED, onUser)
  window.addEventListener(LOCALIZATION_SETTINGS_CHANGED, onCompany)
  return () => {
    window.removeEventListener(USER_LOCALE_PREFERENCES_CHANGED, onUser)
    window.removeEventListener(LOCALIZATION_SETTINGS_CHANGED, onCompany)
  }
}
