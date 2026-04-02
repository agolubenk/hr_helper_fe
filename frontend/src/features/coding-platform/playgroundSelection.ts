import type { CodingLanguageDefinition } from './types'

const WEB_STACK_ORDER = ['html', 'css', 'js', 'react'] as const

function dedupePreserveOrder(ids: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

/** Парсинг `langs=html,css,ts` с фильтром по подключённым id. */
export function parseLangsParam(raw: string | null | undefined, enabledSet: Set<string>): string[] {
  if (raw == null || !raw.trim()) return []
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return dedupePreserveOrder(ids.filter((id) => enabledSet.has(id)))
}

/** Базовый веб-стек в порядке каталога (только включённые). */
export function defaultWebStackSelection(enabledSet: Set<string>): string[] {
  return WEB_STACK_ORDER.filter((id) => enabledSet.has(id))
}

export function getLanguageByIdFromList(
  catalog: CodingLanguageDefinition[],
  id: string,
): CodingLanguageDefinition | undefined {
  return catalog.find((l) => l.id === id)
}

/**
 * Подбор вкладок по основному `lang` (обратная совместимость с ?lang=html).
 * Для iframe-web — классический стек HTML/CSS/JS (+ React, если включён).
 */
export function defaultSelectionForLangParam(
  langId: string,
  enabledSet: Set<string>,
  getDef: (id: string) => CodingLanguageDefinition | undefined,
): string[] {
  if (!enabledSet.has(langId)) {
    const first = [...enabledSet][0]
    return first ? [first] : []
  }
  const def = getDef(langId)
  if (!def) return [langId]
  if (def.runner === 'iframe-web') {
    const web = defaultWebStackSelection(enabledSet)
    if (web.length === 0) return [langId]
    if (web.includes(langId)) return web
    return dedupePreserveOrder([langId, ...web])
  }
  return [langId]
}

/** Сортировка выбранных id в порядке каталога. */
export function sortSelectedIds(
  ids: string[],
  catalogSorted: CodingLanguageDefinition[],
): string[] {
  const order = new Map(catalogSorted.map((l, i) => [l.id, i]))
  return [...ids].sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999))
}

export function selectionHasWebPreview(
  ids: string[],
  getDef: (id: string) => CodingLanguageDefinition | undefined,
): boolean {
  return ids.some((id) => getDef(id)?.runner === 'iframe-web')
}
