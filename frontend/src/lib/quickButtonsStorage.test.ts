import { describe, expect, it, vi } from 'vitest'
import {
  getQuickButtons,
  QUICK_BUTTONS_KEY,
  saveQuickButtons,
  type QuickButton,
} from '@/lib/quickButtonsStorage'

describe('quickButtonsStorage', () => {
  it('returns default buttons when storage is empty', () => {
    localStorage.removeItem(QUICK_BUTTONS_KEY)
    const buttons = getQuickButtons()
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('saves buttons and dispatches localStorageChange event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    const data: QuickButton[] = [
      {
        id: 'x',
        name: 'Test',
        icon: 'CalendarIcon',
        color: '#000000',
        type: 'text',
        value: 'value',
        order: 1,
      },
    ]

    saveQuickButtons(data)
    const stored = getQuickButtons()

    expect(stored).toEqual(data)
    expect(dispatchSpy).toHaveBeenCalled()
    dispatchSpy.mockRestore()
  })
})
