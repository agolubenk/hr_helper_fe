/**
 * Быстрые кнопки в localStorage — общий слой для QuickButtonsPage и FloatingActions.
 */

export interface QuickButton {
  id: string
  name: string
  icon: string
  color: string
  type: 'link' | 'text' | 'datetime'
  value: string
  order: number
}

export const QUICK_BUTTONS_KEY = 'quickButtons'
export const QUICK_BUTTONS_ENABLED_KEY = 'quickButtonsEnabled'

const DEFAULT_BUTTONS: QuickButton[] = [
  { id: '1', name: 'Huntflow', icon: 'LightningBoltIcon', color: '#3b82f6', type: 'link', value: 'https://huntflow.ru', order: 1 },
  { id: '2', name: 'Календарь встреч', icon: 'CalendarIcon', color: '#10b981', type: 'link', value: 'https://calendar.google.com', order: 2 },
  { id: '3', name: 'Email', icon: 'EnvelopeClosedIcon', color: '#f59e0b', type: 'link', value: 'mailto:andrei.golubenko@softnetix.io', order: 3 },
  { id: '4', name: 'Телеграм', icon: 'PaperPlaneIcon', color: '#06b6d4', type: 'link', value: 'https://t.me/talent_softnetix', order: 4 },
  { id: '5', name: 'Рабочий график', icon: 'ClockIcon', color: '#8b5cf6', type: 'text', value: '11:00 - 18:30', order: 5 },
  { id: '6', name: 'Следующая встреча', icon: 'CalendarIcon', color: '#ef4444', type: 'datetime', value: '2026-01-15T14:00', order: 6 },
  { id: '7', name: 'GitHub', icon: 'GitHubLogoIcon', color: '#1f2937', type: 'link', value: 'https://github.com', order: 7 },
]

export function getQuickButtons(): QuickButton[] {
  if (typeof window === 'undefined') return DEFAULT_BUTTONS
  try {
    const raw = localStorage.getItem(QUICK_BUTTONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as QuickButton[]
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_BUTTONS
}

export function saveQuickButtons(buttons: QuickButton[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(QUICK_BUTTONS_KEY, JSON.stringify(buttons))
    window.dispatchEvent(
      new CustomEvent('localStorageChange', {
        detail: { key: QUICK_BUTTONS_KEY, value: buttons },
      })
    )
  } catch (e) {
    console.error('Ошибка сохранения быстрых кнопок:', e)
  }
}
