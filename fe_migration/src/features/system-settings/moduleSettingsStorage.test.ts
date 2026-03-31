import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAllToggleableLeafIds, getLeafIdsUnderMenuRoot } from '@/features/system-settings/menuModulesRegistry'
import {
  COMPANY_MODULES_CHANGED_EVENT,
  readModuleEnableMap,
  writeModuleEnableMap,
} from '@/features/system-settings/moduleSettingsStorage'

const STORAGE_KEY_V2 = 'hr-helper-menu-modules-v2'

describe('moduleSettingsStorage', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY_V2)
  })

  it('returns all toggleable leaves enabled by default', () => {
    const m = readModuleEnableMap()
    for (const id of getAllToggleableLeafIds()) {
      expect(m[id]).toBe(true)
    }
  })

  it('persists leaf toggle and dispatches event', () => {
    const spy = vi.spyOn(window, 'dispatchEvent')
    const leaves = getLeafIdsUnderMenuRoot('recruiting')
    expect(leaves.length).toBeGreaterThan(0)
    const target = leaves[0]
    const base = readModuleEnableMap()
    writeModuleEnableMap({ ...base, [target]: false })
    expect(readModuleEnableMap()[target]).toBe(false)
    expect(spy.mock.calls.some((c) => (c[0] as Event).type === COMPANY_MODULES_CHANGED_EVENT)).toBe(true)
    spy.mockRestore()
  })
})
