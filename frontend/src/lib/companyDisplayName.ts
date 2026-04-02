/** Совпадает с `mockCompanyData.name` в GeneralSettings — источник до первого сохранения в storage */
export const DEFAULT_COMPANY_DISPLAY_NAME = 'HR Helper'

export const COMPANY_DISPLAY_NAME_STORAGE_KEY = 'hr-helper-company-display-name'

/** То же окно: обновление шапки без поллинга storage */
export const COMPANY_DISPLAY_NAME_CHANGED_EVENT = 'hr-helper-company-display-name-changed' as const

export function readStoredCompanyDisplayName(): string {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_DISPLAY_NAME
  try {
    const raw = localStorage.getItem(COMPANY_DISPLAY_NAME_STORAGE_KEY)
    if (raw == null || raw.trim() === '') return DEFAULT_COMPANY_DISPLAY_NAME
    return raw.trim()
  } catch {
    return DEFAULT_COMPANY_DISPLAY_NAME
  }
}

export function writeStoredCompanyDisplayName(name: string): void {
  if (typeof window === 'undefined') return
  const trimmed = name.trim()
  const toStore = trimmed === '' ? DEFAULT_COMPANY_DISPLAY_NAME : trimmed
  try {
    localStorage.setItem(COMPANY_DISPLAY_NAME_STORAGE_KEY, toStore)
  } catch {
    // приватный режим / квота
  }
  window.dispatchEvent(new Event(COMPANY_DISPLAY_NAME_CHANGED_EVENT))
}

export function subscribeCompanyDisplayName(listener: (name: string) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key !== COMPANY_DISPLAY_NAME_STORAGE_KEY) return
    listener(readStoredCompanyDisplayName())
  }
  const onCustom = () => listener(readStoredCompanyDisplayName())
  window.addEventListener('storage', onStorage)
  window.addEventListener(COMPANY_DISPLAY_NAME_CHANGED_EVENT, onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(COMPANY_DISPLAY_NAME_CHANGED_EVENT, onCustom)
  }
}
