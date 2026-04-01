/** Мок-данные для экрана «Календарь компании» (без API). */

export interface CompanyCalendarRow {
  id: string
  title: string
  subtitle: string
  typeLabel: string
  typeVariant: 'pr' | 'er' | 'bl' | 'pu' | 'gd' | 'or' | 'gr'
  region: string
  tz: string
  layers: number
  status: string
  statusVariant: 'ok' | 'wn'
  isDefault: boolean
}

export const MOCK_CALENDARS: CompanyCalendarRow[] = [
  {
    id: '1',
    title: '🏢 Корпоративный',
    subtitle: 'Базовый календарь компании',
    typeLabel: 'Рабочий',
    typeVariant: 'pr',
    region: 'Global',
    tz: 'Europe/Minsk',
    layers: 7,
    status: 'Активен',
    statusVariant: 'ok',
    isDefault: true,
  },
  {
    id: '2',
    title: '🇧🇾 Беларусь — праздники',
    subtitle: 'Государственные и переносы BY',
    typeLabel: 'Праздничный',
    typeVariant: 'er',
    region: 'BY',
    tz: 'Europe/Minsk',
    layers: 12,
    status: 'Активен',
    statusVariant: 'ok',
    isDefault: false,
  },
  {
    id: '3',
    title: '👥 HR события',
    subtitle: 'Онбординг, ревью, тимбилдинги',
    typeLabel: 'HR',
    typeVariant: 'bl',
    region: 'Global',
    tz: 'Europe/Minsk',
    layers: 9,
    status: 'Активен',
    statusVariant: 'ok',
    isDefault: false,
  },
  {
    id: '4',
    title: '🔍 Рекрутинг-слоты',
    subtitle: 'Интервью, оферы, пробные дни',
    typeLabel: 'Рекрутинг',
    typeVariant: 'pu',
    region: 'Global',
    tz: 'Europe/Minsk',
    layers: 5,
    status: 'Активен',
    statusVariant: 'ok',
    isDefault: false,
  },
  {
    id: '5',
    title: '💰 Payroll даты',
    subtitle: 'Даты выплат, дедлайны',
    typeLabel: 'Payroll',
    typeVariant: 'gd',
    region: 'BY',
    tz: 'Europe/Minsk',
    layers: 2,
    status: 'Draft',
    statusVariant: 'wn',
    isDefault: false,
  },
]

export interface EventTypeItem {
  id: string
  color: string
  name: string
  description: string
  tags: string[]
}

export const MOCK_EVENT_TYPES: EventTypeItem[] = [
  {
    id: '1',
    color: '#437a22',
    name: 'Рабочий день',
    description: 'Обычный рабочий день по расписанию',
    tags: ['working', 'no-approval'],
  },
  {
    id: '2',
    color: '#a13544',
    name: 'Государственный праздник',
    description: 'Нерабочий день, не требует согласования',
    tags: ['holiday', 'blocks-booking', 'affects-payroll'],
  },
  {
    id: '3',
    color: '#d19900',
    name: 'Укороченный день',
    description: 'Pre-holiday short day, рабочий но сокращён на 1ч',
    tags: ['short-day', 'affects-payroll'],
  },
  {
    id: '4',
    color: '#da7101',
    name: 'Перенос рабочего дня',
    description: 'Выходной день переносится на другую дату',
    tags: ['transfer', 'working', 'affects-payroll'],
  },
  {
    id: '5',
    color: '#006494',
    name: 'HR событие',
    description: 'Performance review, онбординг, корпоратив',
    tags: ['hr-event', 'requires-rsvp'],
  },
  {
    id: '6',
    color: '#7a39bb',
    name: 'Интервью (рекрутинг)',
    description: 'Слот для собеседования, блокирует в ATS',
    tags: ['interview', 'blocks-booking'],
  },
]

/** Ячейки мини-календаря апрель 2026 (неделя с понедельника), визуально как в макете */
export type MiniCellKind =
  | 'empty'
  | 'day'
  | 'weekend'
  | 'shift'
  | 'holiday'
  | 'event'
  | 'today'

export interface MiniCalendarCell {
  label: string
  kind: MiniCellKind
  title?: string
}

export const APRIL_2026_PREVIEW: MiniCalendarCell[] = [
  { label: '', kind: 'empty' },
  { label: '', kind: 'empty' },
  { label: '1', kind: 'day' },
  { label: '2', kind: 'day' },
  { label: '3', kind: 'day' },
  { label: '4', kind: 'day' },
  { label: '5', kind: 'shift' },
  { label: '6', kind: 'weekend' },
  { label: '7', kind: 'day' },
  { label: '8', kind: 'day' },
  { label: '9', kind: 'day' },
  { label: '10', kind: 'day' },
  { label: '11', kind: 'day' },
  { label: '12', kind: 'shift' },
  { label: '13', kind: 'weekend' },
  { label: '14', kind: 'day' },
  { label: '15', kind: 'day' },
  { label: '16', kind: 'day' },
  { label: '17', kind: 'day' },
  { label: '18', kind: 'day' },
  { label: '19', kind: 'shift' },
  { label: '20', kind: 'holiday', title: 'Пасха (BY)' },
  { label: '21', kind: 'holiday', title: 'День труда (BY)' },
  { label: '22', kind: 'day' },
  { label: '23', kind: 'event' },
  { label: '24', kind: 'day' },
  { label: '25', kind: 'day' },
  { label: '26', kind: 'shift' },
  { label: '27', kind: 'weekend' },
  { label: '28', kind: 'holiday', title: 'День Победы (BY)' },
  { label: '29', kind: 'today', title: 'Сегодня' },
  { label: '30', kind: 'day' },
]

export const APRIL_STATS = {
  workDays: 22,
  holidays: 3,
  workHours: 176,
  hrEvents: 4,
}
