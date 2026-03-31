import { CODING_LANGUAGE_CATALOG } from './languageCatalog'

const STORAGE_KEY = 'hr-helper-coding-enabled-languages-v1'

const DEFAULT_IDS = CODING_LANGUAGE_CATALOG.filter((l) =>
  ['html', 'css', 'js', 'ts', 'react', 'node'].includes(l.id),
).map((l) => l.id)

export const CODING_LANGUAGES_CHANGED_EVENT = 'hr-helper-coding-languages-changed'

function parseStored(raw: string | null): string[] | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return null
    const ids = data.filter((x): x is string => typeof x === 'string')
    const valid = new Set(CODING_LANGUAGE_CATALOG.map((l) => l.id))
    const filtered = ids.filter((id) => valid.has(id))
    return filtered.length > 0 ? filtered : null
  } catch {
    return null
  }
}

export function readEnabledCodingLanguageIds(): string[] {
  if (typeof window === 'undefined') return [...DEFAULT_IDS]
  const parsed = parseStored(localStorage.getItem(STORAGE_KEY))
  return parsed ?? [...DEFAULT_IDS]
}

export function writeEnabledCodingLanguageIds(ids: string[]): void {
  const valid = new Set(CODING_LANGUAGE_CATALOG.map((l) => l.id))
  const next = [...new Set(ids.filter((id) => valid.has(id)))]
  if (next.length === 0) return
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(CODING_LANGUAGES_CHANGED_EVENT))
}

export function getDefaultEnabledCodingLanguageIds(): string[] {
  return [...DEFAULT_IDS]
}
