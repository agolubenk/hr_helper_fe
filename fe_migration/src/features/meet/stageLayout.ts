/** Режимы раскладки тайлов в мок-комнате meet (локальный UI, без API). */

export type StageLayoutMode =
  | 'spotlight'
  | 'evenGrid'
  | 'splitHalf'
  | 'proportional'
  | 'focusWide'
  | 'stripBottom'
  | 'compactStrip'

export interface StageLayoutOption {
  id: StageLayoutMode
  label: string
  hint: string
}

export const STAGE_LAYOUT_OPTIONS: StageLayoutOption[] = [
  { id: 'spotlight', label: 'Главный в фокусе', hint: 'Крупный спотлайт и полоса превью справа' },
  { id: 'evenGrid', label: 'Равномерная сетка', hint: 'Все участники — плитки одного размера' },
  { id: 'splitHalf', label: 'Пополам', hint: 'Две колонки ~50/50' },
  { id: 'proportional', label: 'Пропорционально', hint: 'Главный ~2/3 ширины, полоса ~1/3' },
  { id: 'focusWide', label: 'Сильный акцент', hint: 'Главный ~70%, полоса уже' },
  { id: 'stripBottom', label: 'Полоса снизу', hint: 'Главной областью вверху, превью в ряд внизу' },
  { id: 'compactStrip', label: 'Узкая полоса', hint: 'Как спотлайт, но превью уже' },
]
