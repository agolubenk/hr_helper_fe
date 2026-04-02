import { describe, expect, it } from 'vitest'
import { MAIN_MENU_ITEMS } from '@/config/menuConfig'
import { SETTINGS_MENU_ITEMS } from '@/config/settingsMenuConfig'
import { getLeafIdsUnderMenuRoot } from '@/features/system-settings/menuModulesRegistry'
import type { ModuleEnableMap } from '@/features/system-settings/types'
import {
  filterMainMenuItemsForModules,
  filterSettingsMenuForModules,
  isMainMenuRootEnabled,
} from '@/features/system-settings/sidebarModuleMenuFilter'

describe('sidebarModuleMenuFilter', () => {
  it('hides recruiting block when all recruiting leaves off', () => {
    const leaves = getLeafIdsUnderMenuRoot('recruiting')
    expect(leaves.length).toBeGreaterThan(0)
    const map: ModuleEnableMap = {}
    for (const id of leaves) map[id] = false
    const filtered = filterMainMenuItemsForModules(MAIN_MENU_ITEMS, map)
    expect(filtered.some((i) => i.id === 'recruiting')).toBe(false)
  })

  it('keeps analytics when all custom modules off (locked)', () => {
    const map: ModuleEnableMap = {}
    expect(isMainMenuRootEnabled('analytics', map)).toBe(true)
    const filtered = filterMainMenuItemsForModules(MAIN_MENU_ITEMS, map)
    expect(filtered.some((i) => i.id === 'analytics')).toBe(true)
  })

  it('hides recruiting settings branch when recruiting off', () => {
    const leaves = getLeafIdsUnderMenuRoot('recruiting')
    const map: ModuleEnableMap = {}
    for (const id of leaves) map[id] = false
    const filtered = filterSettingsMenuForModules(SETTINGS_MENU_ITEMS, map)
    const company = filtered.find((i) => i.id === 'company-settings')
    expect(company?.children).toBeDefined()
    const moduleBlock = company?.children?.find((c) => c.id === 'module-settings')
    const recruiting = moduleBlock?.children?.find((c) => c.id === 'recruiting-settings')
    expect(recruiting).toBeUndefined()
  })
})
