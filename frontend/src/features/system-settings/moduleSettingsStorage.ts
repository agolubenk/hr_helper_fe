import type { ModuleEnableMap } from './types'
import {
  getAllToggleableLeafIds,
  getLeafIdsUnderMenuRoot,
} from '@/features/system-settings/menuModulesRegistry'

const STORAGE_KEY_V2 = 'hr-helper-menu-modules-v2'
const STORAGE_KEY_LEGACY = 'hr-helper-company-modules-enabled'

export const COMPANY_MODULES_CHANGED_EVENT = 'hr-helper-company-modules-changed' as const

function defaultEnableMap(): ModuleEnableMap {
  return Object.fromEntries(getAllToggleableLeafIds().map((id) => [id, true]))
}

/** Миграция со старого формата (крупные модули → листья дерева меню). */
function migrateLegacyV1(parsed: Record<string, unknown>): ModuleEnableMap | null {
  const legacyKeys = ['recruiting', 'projects', 'wiki', 'calendar', 'performance', 'internal_site', 'finance_benchmarks']
  const hasAny = legacyKeys.some((k) => typeof parsed[k] === 'boolean')
  if (!hasAny) return null

  const next = defaultEnableMap()

  const applyFalse = (legacyKey: string, leafIds: string[]) => {
    if (parsed[legacyKey] !== false) return
    for (const id of leafIds) {
      if (id in next) next[id] = false
    }
  }

  applyFalse('recruiting', getLeafIdsUnderMenuRoot('recruiting'))
  applyFalse('projects', getLeafIdsUnderMenuRoot('projects'))
  applyFalse('calendar', getLeafIdsUnderMenuRoot('calendar'))
  applyFalse('performance', getLeafIdsUnderMenuRoot('performance'))
  applyFalse('internal_site', ['internal-site-main', 'internal-site-create'])
  applyFalse('wiki', ['wiki-all'])
  applyFalse('finance_benchmarks', [
    'benchmarks-dashboard',
    'benchmarks-all',
    'finance-salary-ranges',
    'finance-reports',
    'compensation-benefits',
    'compensation-review',
  ])

  return next
}

export function readModuleEnableMap(): ModuleEnableMap {
  if (typeof window === 'undefined') return defaultEnableMap()
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2)
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as unknown
      if (parsed && typeof parsed === 'object') {
        const base = defaultEnableMap()
        const o = parsed as Record<string, unknown>
        for (const id of Object.keys(base)) {
          if (typeof o[id] === 'boolean') base[id] = o[id]
        }
        return base
      }
    }

    const rawLegacy = localStorage.getItem(STORAGE_KEY_LEGACY)
    if (rawLegacy) {
      const parsed = JSON.parse(rawLegacy) as Record<string, unknown>
      const migrated = migrateLegacyV1(parsed)
      if (migrated) {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated))
        return migrated
      }
    }
  } catch {
    /* fallthrough */
  }
  return defaultEnableMap()
}

export function writeModuleEnableMap(map: ModuleEnableMap): void {
  if (typeof window === 'undefined') return
  try {
    const base = defaultEnableMap()
    const merged = { ...base, ...map }
    for (const k of Object.keys(merged)) {
      if (!(k in base)) delete merged[k]
    }
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(merged))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(COMPANY_MODULES_CHANGED_EVENT))
}

export function isModuleEnabled(id: string): boolean {
  return readModuleEnableMap()[id] !== false
}
