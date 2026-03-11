/**
 * Общая логика и мок шкал оценок.
 * Используется в настройках компании (Шкалы оценок) и на странице создания оценки.
 */

export interface RatingScaleOption {
  value: string
  label: string
  order: number
}

export interface RatingScale {
  id: string
  name: string
  isDefault: boolean
  options: RatingScaleOption[]
}

const DEFAULT_SCALE: RatingScale = {
  id: 'default-1-5',
  name: '1–5 баллов',
  isDefault: true,
  options: [
    { value: '1', label: '1', order: 1 },
    { value: '2', label: '2', order: 2 },
    { value: '3', label: '3', order: 3 },
    { value: '4', label: '4', order: 4 },
    { value: '5', label: '5', order: 5 },
  ],
}

export const DEFAULT_RATING_SCALES: RatingScale[] = [
  DEFAULT_SCALE,
  {
    id: 'pass-fail',
    name: 'Сдал / Не сдал',
    isDefault: false,
    options: [
      { value: 'fail', label: 'Не сдал', order: 1 },
      { value: 'pass', label: 'Сдал', order: 2 },
    ],
  },
  {
    id: 'four-level',
    name: 'Четыре уровня',
    isDefault: false,
    options: [
      { value: '1', label: 'Не сдал', order: 1 },
      { value: '2', label: 'Сдал', order: 2 },
      { value: '3', label: 'Хорошо', order: 3 },
      { value: '4', label: 'Отлично', order: 4 },
    ],
  },
]

export function getRatingScales(): RatingScale[] {
  return DEFAULT_RATING_SCALES
}

export function getRatingScaleById(id: string): RatingScale | undefined {
  return DEFAULT_RATING_SCALES.find((s) => s.id === id)
}

const STORAGE_KEY_PREFIX = 'matrix_rating_scale_'

export function setRatingScaleForSpec(specId: string, scaleId: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY_PREFIX + specId, scaleId)
}

export function setRatingScaleForSpecTab(specId: string, tab: string, scaleId: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY_PREFIX + specId + '_' + tab, scaleId)
}

export function getDefaultRatingScale(): RatingScale {
  return DEFAULT_RATING_SCALES.find((s) => s.isDefault) ?? DEFAULT_RATING_SCALES[0]
}

export function getRatingScaleForSpec(specId: string, tab?: string): RatingScale {
  if (typeof window === 'undefined') return getDefaultRatingScale()
  const key = tab ? STORAGE_KEY_PREFIX + specId + '_' + tab : STORAGE_KEY_PREFIX + specId
  const id = window.localStorage.getItem(key)
  if (id) {
    const scale = getRatingScaleById(id)
    if (scale) return scale
  }
  return getDefaultRatingScale()
}

export function getRatingScaleIdForSpec(specId: string, tab?: string): string {
  if (typeof window === 'undefined')
    return DEFAULT_RATING_SCALES.find((s) => s.isDefault)?.id ?? DEFAULT_RATING_SCALES[0].id
  const key = tab ? STORAGE_KEY_PREFIX + specId + '_' + tab : STORAGE_KEY_PREFIX + specId
  const id = window.localStorage.getItem(key)
  if (id && getRatingScaleById(id)) return id
  return DEFAULT_RATING_SCALES.find((s) => s.isDefault)?.id ?? DEFAULT_RATING_SCALES[0].id
}
