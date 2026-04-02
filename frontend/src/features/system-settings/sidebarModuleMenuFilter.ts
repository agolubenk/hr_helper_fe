import type { MenuItemConfig } from '@/config/menuConfig'
import type { SettingsMenuItemConfig } from '@/config/settingsMenuConfig'
import {
  MENU_MODULE_LOCKED_ROOT_IDS,
  getLeafIdsUnderMenuRoot,
} from '@/features/system-settings/menuModulesRegistry'
import type { ModuleEnableMap } from '@/features/system-settings/types'

export function isMainMenuRootEnabled(rootId: string, map: ModuleEnableMap): boolean {
  if (MENU_MODULE_LOCKED_ROOT_IDS.has(rootId)) return true
  const leaves = getLeafIdsUnderMenuRoot(rootId)
  if (leaves.length === 0) return true
  return leaves.some((id) => map[id] !== false)
}

function filterMainOne(item: MenuItemConfig, map: ModuleEnableMap): MenuItemConfig | null {
  if (item.id === 'home') return item
  if (MENU_MODULE_LOCKED_ROOT_IDS.has(item.id)) return item

  if (item.children?.length) {
    const children = item.children
      .map((ch) => filterMainOne(ch, map))
      .filter((x): x is MenuItemConfig => x !== null)
    if (children.length === 0) return null
    return { ...item, children }
  }

  if (item.href) {
    if (map[item.id] === false) return null
    return item
  }

  return item
}

export function filterMainMenuItemsForModules(
  items: MenuItemConfig[],
  map: ModuleEnableMap
): MenuItemConfig[] {
  return items.map((it) => filterMainOne(it, map)).filter((x): x is MenuItemConfig => x !== null)
}

/** Корень основного меню для ветки настроек (по id пункта). */
const SETTINGS_DOMAIN_ROOT: Partial<Record<string, string>> = {
  'people-org-settings': 'employee-relations',
  'recruiting-settings': 'recruiting',
  'onboarding-settings': 'onboarding',
  'hr-ops-settings': 'hr-services',
  'employees-module-settings': 'employee-relations',
  'learning-settings': 'learning',
  'performance-settings': 'performance',
  'compensation-settings': 'finance',
  'hr-pr-settings': 'hr-pr',
  'projects-settings': 'projects',
  'hr-services-settings': 'hr-services',
  'analytics-data-settings': 'analytics',
  'automations-integrations': 'integrations',
}

/** Дочерние пункты «Базовые настройки компании» → корень основного меню (null = всегда). */
const BASIC_SETTINGS_CHILD_ROOT: Partial<Record<string, string | null>> = {
  'company-general': null,
  'company-calendar': 'calendar',
}

function effectiveSettingsContext(itemId: string, parentCtx: string | null): string | null {
  if (itemId in SETTINGS_DOMAIN_ROOT) {
    return SETTINGS_DOMAIN_ROOT[itemId]!
  }
  return parentCtx
}

function filterSettingsOne(
  item: SettingsMenuItemConfig,
  map: ModuleEnableMap,
  parentCtx: string | null
): SettingsMenuItemConfig | null {
  if (item.id === 'basic-company-settings' && item.children?.length) {
    const children = item.children
      .map((ch) => {
        const root = BASIC_SETTINGS_CHILD_ROOT[ch.id]
        if (root === null || root === undefined) return filterSettingsOne(ch, map, null)
        if (!isMainMenuRootEnabled(root, map)) return null
        return filterSettingsOne(ch, map, null)
      })
      .filter((x): x is SettingsMenuItemConfig => x !== null)
    if (children.length === 0) return null
    return { ...item, children }
  }

  const ctx = effectiveSettingsContext(item.id, parentCtx)

  if (ctx !== null && !isMainMenuRootEnabled(ctx, map)) {
    return null
  }

  if (!item.children?.length) {
    return item
  }

  const childParentCtx = SETTINGS_DOMAIN_ROOT[item.id] !== undefined ? SETTINGS_DOMAIN_ROOT[item.id]! : ctx

  const children = item.children
    .map((ch) => filterSettingsOne(ch, map, childParentCtx))
    .filter((x): x is SettingsMenuItemConfig => x !== null)

  if (children.length === 0) return null
  return { ...item, children }
}

export function filterSettingsMenuForModules(
  items: SettingsMenuItemConfig[],
  map: ModuleEnableMap
): SettingsMenuItemConfig[] {
  return items
    .map((it) => filterSettingsOne(it, map, null))
    .filter((x): x is SettingsMenuItemConfig => x !== null)
}
