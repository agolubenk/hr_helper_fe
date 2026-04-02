import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COMPANY_DISPLAY_NAME_CHANGED_EVENT,
  COMPANY_DISPLAY_NAME_STORAGE_KEY,
  DEFAULT_COMPANY_DISPLAY_NAME,
  readStoredCompanyDisplayName,
  writeStoredCompanyDisplayName,
  subscribeCompanyDisplayName,
} from '@/lib/companyDisplayName'

describe('companyDisplayName', () => {
  beforeEach(() => {
    localStorage.removeItem(COMPANY_DISPLAY_NAME_STORAGE_KEY)
  })

  it('returns default when storage is empty', () => {
    expect(readStoredCompanyDisplayName()).toBe(DEFAULT_COMPANY_DISPLAY_NAME)
  })

  it('writes trimmed value and dispatches event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    writeStoredCompanyDisplayName('  Acme  ')
    expect(localStorage.getItem(COMPANY_DISPLAY_NAME_STORAGE_KEY)).toBe('Acme')
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event))
    const evt = dispatchSpy.mock.calls.find(
      (c) => c[0] instanceof Event && (c[0] as Event).type === COMPANY_DISPLAY_NAME_CHANGED_EVENT
    )
    expect(evt).toBeDefined()
    dispatchSpy.mockRestore()
  })

  it('normalizes empty string to default in storage', () => {
    writeStoredCompanyDisplayName('')
    expect(localStorage.getItem(COMPANY_DISPLAY_NAME_STORAGE_KEY)).toBe(DEFAULT_COMPANY_DISPLAY_NAME)
  })

  it('subscribe receives updates from custom event', () => {
    const fn = vi.fn()
    const unsub = subscribeCompanyDisplayName(fn)
    writeStoredCompanyDisplayName('Beta')
    expect(fn).toHaveBeenCalledWith('Beta')
    unsub()
  })
})
