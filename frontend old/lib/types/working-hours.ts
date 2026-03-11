/**
 * Типы для рабочего времени пользователя
 */
export type WorkingHoursMode = 'uniform' | 'custom'

export interface DaySchedule {
  start: string
  end: string
  isWorkday: boolean
}

export interface WorkingHours {
  mode: WorkingHoursMode
  uniform?: {
    start: string
    end: string
  }
  custom?: {
    monday?: DaySchedule
    tuesday?: DaySchedule
    wednesday?: DaySchedule
    thursday?: DaySchedule
    friday?: DaySchedule
    saturday?: DaySchedule
    sunday?: DaySchedule
  }
}

export const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type DayKey = (typeof DAY_KEYS)[number]

export const DAY_NAMES: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
}

export const DEFAULT_UNIFORM = { start: '09:00', end: '18:00' } as const

export function createDefaultCustomSchedule(start = '09:00', end = '18:00'): WorkingHours['custom'] {
  return {
    monday: { start, end, isWorkday: true },
    tuesday: { start, end, isWorkday: true },
    wednesday: { start, end, isWorkday: true },
    thursday: { start, end, isWorkday: true },
    friday: { start, end, isWorkday: true },
    saturday: { start, end, isWorkday: false },
    sunday: { start, end, isWorkday: false },
  }
}

/** Форматирует рабочие часы для отображения в профиле */
export function formatWorkingHours(wh: WorkingHours | null | undefined): string {
  if (!wh) return '—'
  if (wh.mode === 'uniform' && wh.uniform) {
    return `${wh.uniform.start} — ${wh.uniform.end}`
  }
  if (wh.mode === 'custom' && wh.custom) {
    const workdays = DAY_KEYS.filter((d) => wh.custom?.[d]?.isWorkday)
    if (workdays.length === 0) return 'Нет рабочих дней'
    if (workdays.length === 7) {
      const first = wh.custom[workdays[0]]
      return first ? `${first.start} — ${first.end} (ежедневно)` : '—'
    }
    return workdays
      .map((d) => {
        const s = wh.custom?.[d]
        if (!s) return ''
        return `${DAY_NAMES[d]}: ${s.start} — ${s.end}`
      })
      .filter(Boolean)
      .join('; ')
  }
  return '—'
}
