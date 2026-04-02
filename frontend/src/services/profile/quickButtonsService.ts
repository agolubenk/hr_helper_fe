import {
  getQuickButtons,
  saveQuickButtons,
  type QuickButton,
} from '@/lib/quickButtonsStorage'

/**
 * Фаза 13: единая точка доступа к quick buttons.
 * Сейчас источник — localStorage (fallback/mock).
 * После контракта API переключаем реализацию в этом файле.
 */
export function loadQuickButtons(): QuickButton[] {
  return getQuickButtons()
}

export function persistQuickButtons(buttons: QuickButton[]): void {
  saveQuickButtons(buttons)
}
