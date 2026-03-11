/**
 * Типы для рабочего времени пользователя
 */
export type WorkingHoursMode = 'uniform' | 'custom'

export interface DaySchedule {
  start: string
  end: string
  isWorkday: boolean
  meetingInterval?: string
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

export const DAY_NAMES_SHORT: Record<string, string> = {
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Вс',
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

/** Строит workTimeByDay из uniform-данных (все дни одинаково, Пн–Пт) */
export function buildWorkTimeByDayFromUniform(
  start: string,
  end: string,
  meetingInterval?: string
): WorkingHours['custom'] {
  const schedule = createDefaultCustomSchedule(start, end)
  const intervalStr = meetingInterval ? String(meetingInterval).replace(/\s*мин\s*/i, '') : undefined
  return DAY_KEYS.reduce<WorkingHours['custom']>((acc, day) => {
    const base = schedule[day]
    if (!base) return acc
    acc[day] = {
      ...base,
      meetingInterval: intervalStr || base.meetingInterval,
    }
    return acc
  }, {})
}

/** Проверяет, образуют ли рабочие дни последовательный диапазон */
function areDaysConsecutive(workdays: DayKey[]): boolean {
  if (workdays.length <= 1) return true
  const indices = workdays.map((d) => DAY_KEYS.indexOf(d)).sort((a, b) => a - b)
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) return false
  }
  return true
}

/** Форматирует workTimeByDay для отображения в профиле */
export function formatWorkTimeByDay(
  workTimeByDay: WorkingHours['custom'] | null | undefined
): string {
  if (!workTimeByDay) return ''
  const workdays = DAY_KEYS.filter((d) => workTimeByDay[d]?.isWorkday)
  if (workdays.length === 0) return 'Нет рабочих дней'

  const slots = workdays
    .map((d) => {
      const s = workTimeByDay[d]
      if (!s) return null
      return { day: d, start: s.start, end: s.end }
    })
    .filter((x): x is { day: DayKey; start: string; end: string } => !!x)

  if (slots.length === 0) return 'Нет рабочих дней'

  const allSame = slots.every((x) => x.start === slots[0].start && x.end === slots[0].end)
  const consecutive = areDaysConsecutive(workdays)

  if (allSame && consecutive && slots.length > 1) {
    const range =
      slots.length === 7 ? 'Пн–Вс' : `${DAY_NAMES_SHORT[slots[0].day]}–${DAY_NAMES_SHORT[slots[slots.length - 1].day]}`
    return `${range}: ${slots[0].start}–${slots[0].end}`
  }
  if (allSame && slots.length === 1) {
    return `${DAY_NAMES_SHORT[slots[0].day]}: ${slots[0].start}–${slots[0].end}`
  }

  return slots.map((x) => `${DAY_NAMES_SHORT[x.day]}: ${x.start}–${x.end}`).join('; ')
}

/** Форматирует интервалы по дням (если разные) */
export function formatMeetingIntervalByDay(
  workTimeByDay: WorkingHours['custom'] | null | undefined,
  fallback: string
): string {
  if (!workTimeByDay) return fallback
  const workdays = DAY_KEYS.filter((d) => workTimeByDay[d]?.isWorkday)
  if (workdays.length === 0) return fallback
  const intervals = workdays
    .map((d) => workTimeByDay[d]?.meetingInterval)
    .filter((v): v is string => !!v)
  const unique = [...new Set(intervals)]
  if (unique.length === 0) return fallback
  if (unique.length === 1) return `${unique[0]} мин`
  const nums = unique.map(Number).filter((n) => !isNaN(n))
  if (nums.length === 0) return fallback
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return `Разное по дням (${min}–${max} мин)`
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
