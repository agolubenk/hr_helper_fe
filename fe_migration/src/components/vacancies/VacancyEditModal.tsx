'use client'

import { Box, Flex, Text, Button, Dialog, Separator, TextField, TextArea, Card, Table, Select, Checkbox, Switch, DropdownMenu, Badge, Tabs } from "@radix-ui/themes"
import { useState, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { Cross2Icon, GlobeIcon, PersonIcon, UploadIcon, FileTextIcon, GearIcon, PlusIcon, TrashIcon, ChevronDownIcon, Pencil1Icon, ArrowTopRightIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Link } from "react-router-dom"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './VacancyEditModal.module.css'

/** Справочник доп. полей кандидата (компания); настройка списка — на отдельной странице */
export const COMPANY_CANDIDATE_FIELDS_SETTINGS_PATH = '/company-settings/recruiting/candidate-fields'

const CANDIDATE_ADDITIONAL_FIELD_ROWS = [
  { id: 'grade', label: 'Грейд', typeLabel: 'Выбор из списка' },
  { id: 'relocation', label: 'Готовность к релокации', typeLabel: 'Да / Нет' },
  { id: 'recruiter_note', label: 'Заметка рекрутера', typeLabel: 'Текст' },
] as const

export type SettingTab = 'text' | 'locations' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary' | 'interviews' | 'scorecard' | 'dataProcessing' | 'additionalFields' | 'automations' | 'history'

const SECTIONS: { key: SettingTab; label: string }[] = [
  { key: 'text', label: 'Текст вакансии' },
  { key: 'locations', label: 'Локации' },
  { key: 'recruiters', label: 'Рекрутеры' },
  { key: 'customers', label: 'Заказчики и интервьюеры' },
  { key: 'questions', label: 'Вопросы и ссылки' },
  { key: 'integrations', label: 'Связи и интеграции' },
  { key: 'statuses', label: 'Статусы' },
  { key: 'salary', label: 'Зарплатные вилки' },
  { key: 'interviews', label: 'Встречи и интервью' },
  { key: 'scorecard', label: 'Scorecard' },
  { key: 'dataProcessing', label: 'Обработка данных' },
  { key: 'additionalFields', label: 'Дополнительные поля' },
  { key: 'automations', label: 'Автоматизации' },
  { key: 'history', label: 'История правок' },
]

export const VACANCY_SETTINGS_TAB_KEYS: readonly SettingTab[] = SECTIONS.map(s => s.key)

export function parseVacancySettingsTab(raw: string | null | undefined): SettingTab {
  if (raw && (VACANCY_SETTINGS_TAB_KEYS as readonly string[]).includes(raw)) return raw as SettingTab
  return 'text'
}

/** Офис (площадка) внутри страны — для моков и синхронизации URL textOffice */
export interface VacancyTextTabOfficeLocation {
  id: string
  name: string
}

/** Страна/регион вкладки «Текст вакансии» + числовой countryId и офисы */
export interface VacancyTextTabCountry {
  id: string
  name: string
  countryId: number
  offices: VacancyTextTabOfficeLocation[]
}

// Константы как в ats (мок: id страны и офисов для детализации в UI и query string)
const questionLinkOffices: VacancyTextTabCountry[] = [
  {
    id: 'by',
    name: 'Беларусь',
    countryId: 112,
    offices: [
      { id: 'of-by-msq-101', name: 'Минск, центр' },
      { id: 'of-by-gml-102', name: 'Гомель' },
    ],
  },
  {
    id: 'pl',
    name: 'Польша',
    countryId: 616,
    offices: [{ id: 'of-pl-waw-201', name: 'Варшава' }],
  },
]

/** Отдельная «страница» текста для локации All world remote (индивидуальный режим) */
export const GLOBAL_REMOTE_TEXT_TAB: VacancyTextTabCountry = {
  id: 'all-world-remote',
  name: 'All world remote',
  countryId: 0,
  offices: [{ id: 'of-all-world-remote', name: 'Глобально' }],
}

export function getVacancyTextTabCountryByKey(key: string): VacancyTextTabCountry | undefined {
  if (key === GLOBAL_REMOTE_TEXT_TAB.id) return GLOBAL_REMOTE_TEXT_TAB
  return questionLinkOffices.find((o) => o.id === key)
}

/** Экспорт для страницы /vacancies (дефолты в URL); включает all-world-remote для textCountry= */
export const VACANCY_TEXT_TAB_COUNTRIES: readonly VacancyTextTabCountry[] = [...questionLinkOffices, GLOBAL_REMOTE_TEXT_TAB]

export function parseVacancyTextCountryKey(raw: string | null | undefined): string {
  const valid = new Set<string>([...questionLinkOffices.map((o) => o.id), GLOBAL_REMOTE_TEXT_TAB.id])
  if (raw && valid.has(raw)) return raw
  return questionLinkOffices[0]?.id ?? 'by'
}

/** Валидный officeId для страны или первый офис страны; null если у страны нет офисов */
export function parseVacancyTextOfficeId(countryKey: string, raw: string | null | undefined): string | null {
  const c = getVacancyTextTabCountryByKey(countryKey)
  if (!c?.offices?.length) return null
  if (raw && c.offices.some((o) => o.id === raw)) return raw
  return c.offices[0]?.id ?? null
}

/** Справочник локаций для раздела «Локации» (мок). countryCode: привязка к вкладке страны; null — без привязки / глобально */
const LOCATION_CATALOG: { id: string; label: string; countryCode: 'by' | 'pl' | null }[] = [
  { id: 'all-world-remote', label: 'All world remote', countryCode: null },
  { id: 'loc-msk', label: 'Минск', countryCode: 'by' },
  { id: 'loc-gom', label: 'Гомель', countryCode: 'by' },
  { id: 'loc-waw', label: 'Варшава', countryCode: 'pl' },
  { id: 'loc-remote', label: 'Удалённо', countryCode: null },
  { id: 'loc-hybrid', label: 'Гибрид', countryCode: null },
]

/** Страны для табов «Текст вакансии» / «Вопросы»: если есть города с countryCode — только они; иначе все (в т.ч. только All world remote) */
function getVisibleCountryKeysFromLocationRows(rows: { id: string }[]): string[] {
  const codes = new Set<string>()
  for (const r of rows) {
    const cat = LOCATION_CATALOG.find((c) => c.id === r.id)
    if (cat?.countryCode === 'by' || cat?.countryCode === 'pl') codes.add(cat.countryCode)
  }
  if (codes.size > 0) {
    return questionLinkOffices.filter((o) => codes.has(o.id)).map((o) => o.id)
  }
  return questionLinkOffices.map((o) => o.id)
}

/** Порядок вкладок «Текст вакансии» в индивидуальном режиме — по строкам локаций; All world remote отдельно */
function buildOrderedIndividualTextTabCountries(
  rows: { id: string }[],
  fallbackCountryKeys: string[]
): VacancyTextTabCountry[] {
  const seen = new Set<string>()
  const out: VacancyTextTabCountry[] = []
  for (const row of rows) {
    if (row.id === GLOBAL_REMOTE_TEXT_TAB.id) {
      if (!seen.has(GLOBAL_REMOTE_TEXT_TAB.id)) {
        seen.add(GLOBAL_REMOTE_TEXT_TAB.id)
        out.push(GLOBAL_REMOTE_TEXT_TAB)
      }
      continue
    }
    const cat = LOCATION_CATALOG.find((c) => c.id === row.id)
    if (cat?.countryCode === 'by' || cat?.countryCode === 'pl') {
      const co = questionLinkOffices.find((o) => o.id === cat.countryCode)
      if (co && !seen.has(co.id)) {
        seen.add(co.id)
        out.push(co)
      }
    }
  }
  if (out.length > 0) return out
  return questionLinkOffices.filter((o) => fallbackCountryKeys.includes(o.id))
}

/** Разделитель countryKey::officeId для единой полоски вкладок «Текст вакансии» */
const VACANCY_TEXT_SEGMENT_SEP = '::' as const

export interface VacancyTextFlatSegment {
  key: string
  label: string
  countryKey: string
  officeId: string
}

/** Одна горизонтальная полоска: при нескольких офисах в стране — по вкладке на офис; иначе — одна вкладка на страну */
function buildFlatTextTabSegments(countries: VacancyTextTabCountry[]): VacancyTextFlatSegment[] {
  const out: VacancyTextFlatSegment[] = []
  for (const c of countries) {
    const multiOffice = c.offices.length > 1
    for (const o of c.offices) {
      const key = `${c.id}${VACANCY_TEXT_SEGMENT_SEP}${o.id}`
      const label = multiOffice ? o.name : c.name
      out.push({ key, label, countryKey: c.id, officeId: o.id })
    }
  }
  return out
}

const questionLinkColors = [
  { id: 'blue', hex: '#3B82F6', label: 'Синий' }, { id: 'green', hex: '#10B981', label: 'Зелёный' },
  { id: 'amber', hex: '#F59E0B', label: 'Янтарный' }, { id: 'red', hex: '#EF4444', label: 'Красный' },
  { id: 'violet', hex: '#8B5CF6', label: 'Фиолетовый' }, { id: 'cyan', hex: '#06B6D4', label: 'Бирюзовый' },
  { id: 'gray', hex: '#6B7280', label: 'Серый' },
]
const recruitmentStages = [
  { id: 'new', name: 'New', description: 'Новый кандидат', color: '#2180A0' },
  { id: 'under-review', name: 'Under Review', description: 'На рассмотрении', color: '#3B82F6' },
  { id: 'message', name: 'Message', description: 'Сообщение', color: '#6366F1' },
  { id: 'contact', name: 'Contact', description: 'Контакт', color: '#8B5CF6' },
  { id: 'hr-screening', name: 'HR Screening', description: 'HR скрининг', color: '#A855F7' },
  { id: 'test-task', name: 'Test Task', description: 'Тестовое задание', color: '#C084FC' },
  { id: 'final-interview', name: 'Final Interview', description: 'Финальное интервью', color: '#D946EF' },
  { id: 'decision', name: 'Decision', description: 'Решение', color: '#EC4899' },
  { id: 'interview', name: 'Interview', description: 'Интервью', color: '#8B5CF6' },
  { id: 'offer', name: 'Offer', description: 'Предложение', color: '#22C55E' },
  { id: 'accepted', name: 'Accepted', description: 'Принят', color: '#10B981' },
  { id: 'rejected', name: 'Rejected', description: 'Отказ', color: '#EF4444' },
  { id: 'declined', name: 'Declined', description: 'Отклонено кандидатом', color: '#F59E0B' },
  { id: 'archived', name: 'Archived', description: 'Архив', color: '#6B7280' },
]
const allGrades = [
  { id: '1', name: 'Trainee', order: 1 }, { id: '2', name: 'Junior-', order: 2 }, { id: '3', name: 'Junior', order: 3 },
  { id: '4', name: 'Junior+', order: 4 }, { id: '5', name: 'Middle-', order: 5 }, { id: '6', name: 'Middle', order: 6 },
  { id: '7', name: 'Middle+', order: 7 }, { id: '8', name: 'Senior-', order: 8 }, { id: '9', name: 'Senior', order: 9 },
  { id: '10', name: 'Senior+', order: 10 }, { id: '11', name: 'Lead', order: 11 }, { id: '12', name: 'Lead+', order: 12 },
  { id: '13', name: 'Head', order: 13 }, { id: '14', name: 'C-Level', order: 14 },
]
const companyCurrencies = [
  { id: '1', code: 'BYN', name: 'Белорусский рубль', isMain: true, order: 1 },
  { id: '2', code: 'USD', name: 'Доллар США', isMain: false, order: 2 },
  { id: '3', code: 'EUR', name: 'Евро', isMain: false, order: 3 },
  { id: '4', code: 'PLN', name: 'Польский злотый', isMain: false, order: 4 },
]
const currencyRates: Record<string, number> = { BYN: 1, USD: 3.25, EUR: 3.46, PLN: 0.85 }
const recruiterContactHints = [
  { label: 'Телефон', variable: 'recruiter_phone' }, { label: 'Email', variable: 'recruiter_email' },
  { label: 'LinkedIn', variable: 'recruiter_linkedin' }, { label: 'Telegram', variable: 'recruiter_telegram' },
] as const

interface Department { id: string; name: string; parent: string | null; children?: Department[] }
const mockDepartments: Department[] = [
  { id: '1', name: 'IT Департамент', parent: null, children: [
    { id: '2', name: 'Отдел разработки', parent: '1', children: [
      { id: '5', name: 'Frontend команда', parent: '2', children: [] },
      { id: '6', name: 'Backend команда', parent: '2', children: [] },
    ]},
    { id: '3', name: 'Отдел тестирования', parent: '1', children: [] },
  ]},
  { id: '4', name: 'HR Департамент', parent: null, children: [] },
]

// Фиктивные данные для карточек просмотра (когда нет реальных)
const VIEW_DUMMY = {
  integration: 'Huntflow (ID: 894521)',
  officeLink: 'https://company.com/vacancies/example',
  officeUseOnSite: true,
  officeQuestion: 'Расскажите о вашем опыте и ключевых достижениях в данной роли.',
  department: 'Отдел разработки',
  header: 'Мы — продуктовая IT-компания с офисами в Минске и Варшаве. Приглашаем в команду мотивированного специалиста.',
  responsibilities: '- Разработка и поддержка пользовательских интерфейсов\n- Участие в проектировании и код-ревью\n- Взаимодействие с дизайном и бэкенд-командой',
  requirements: '- Опыт коммерческой разработки от 2 лет\n- Уверенное знание React и TypeScript\n- Понимание принципов вёрстки (HTML, CSS)',
  niceToHave: '- Опыт с тестированием (Jest, React Testing Library)\n- Знание CI/CD и контейнеризации',
  conditions: '- Офис/гибрид/удалёнка на выбор\n- ДМС, стоматология\n- Обучение за счёт компании',
  closing: 'Если вам интересна вакансия — присылайте резюме. Мы свяжемся в течение 3 рабочих дней.',
  link: 'https://company.com/careers',
  attachment: 'Описание_вакансии.docx',
  scorecardTitle: 'Scorecard: Frontend Developer',
  scorecardPosition: 'В начале',
  scorecardLocal: false,
  analysisPrompt: 'Проанализируй резюме кандидата на соответствие вакансии. Оцени опыт, ключевые навыки и релевантность.',
  meetingStage: 'HR Screening',
  meetingDuration: 60,
  meetingTitle: 'HR-собес',
  meetingDescription: 'Знакомство с компанией, обсуждение опыта и мотивации.',
  meetingFormat: 'online',
  recruiterName: 'Иван Иванов',
  recruiterPosition: 'Senior Recruiter',
  interviewerName: 'Алексей Козлов',
  interviewerPosition: 'Tech Lead',
  stagesChain: 'New → Under Review → HR Screening → Interview → Offer → Accepted',
  locations: 'Минск, Удалённо',
  date: '25.01.2026',
  vacancyTitle: 'Frontend Developer (пример)',
  historyChange: 'Изменен текст вакансии',
  historyDate: '2026-01-24 10:30',
  historyUser: 'Иван Иванов',
}

export type VacancyViewItem = {
  id: number
  title: string
  status: 'active' | 'inactive'
  recruiter: string
  locations: string[]
  interviewers: number
  date: string | null
  hasWarning: boolean
  warningText?: string
}

interface VacancyEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vacancyId: number | null
  vacancyTitle?: string
  vacancy?: VacancyViewItem | null
  mode?: 'edit' | 'view'
  vacancyStatus?: 'active' | 'inactive'
  onVacancyStatusChange?: (status: 'active' | 'inactive') => void
  onSwitchToEdit?: () => void
  onSave?: (data: unknown) => void
  /** Удаление вакансии (мок): подтверждение через toast в модалке */
  onDelete?: (vacancyId: number) => void
  /** Рендер без Dialog (ATS и т.п.) */
  embedded?: boolean
  /** Контролируемая вкладка настроек (синхронизация с URL) */
  settingsTab?: SettingTab
  onSettingsTabChange?: (tab: SettingTab) => void
  /** Доп. действие при «Отмена» во встроенном режиме (например navigate назад) */
  onEmbeddedCancel?: () => void
  /** Поиск разделов с родителя (ATS): поле в левой колонке, без дубля в сайдбаре */
  vacancySettingsSearchExternal?: string
  onVacancySettingsSearchExternalChange?: (value: string) => void
  /** Контейнер в левой колонке ATS: сайдбар разделов рендерится через портал */
  settingsSidebarHostEl?: HTMLElement | null
  /** Синхронизация вкладки страны в «Текст вакансии» с URL (/vacancies: textCountry) */
  textTabCountryKey?: string | null
  onTextTabCountryKeyChange?: (countryKey: string) => void
  /** Синхронизация выбранного офиса с URL (textOffice), только при нескольких офисах в стране */
  textTabOfficeId?: string | null
  onTextTabOfficeIdChange?: (officeId: string | null) => void
}

interface HistoryItem {
  id: string
  date: string
  user: string
  changes: string
  version: number
  fullText?: string
  fieldsState?: {
    title: string
    department: string
    header: string
    responsibilities: string
    requirements: string
    niceToHave: string
    conditions: string
    closing: string
    link: string
    fieldSettings: Record<string, { active: boolean; visible: boolean }>
  }
}

function getAllDepartmentsFlat(departments: Department[], level = 0): Array<{ id: string; name: string; level: number }> {
  const result: Array<{ id: string; name: string; level: number }> = []
  departments.forEach(dept => {
    result.push({ id: dept.id, name: dept.name, level })
    if (dept.children?.length) result.push(...getAllDepartmentsFlat(dept.children, level + 1))
  })
  return result
}

type OfficeLink = { url: string; useOnSite: boolean; color: string }
type OfficeQuestionsState = { link: OfficeLink; question: { text: string; color: string } }
function getDefaultOfficeState(): OfficeQuestionsState {
  return { link: { url: '', useOnSite: false, color: questionLinkColors[0].hex }, question: { text: '', color: questionLinkColors[0].hex } }
}

type InterviewMeeting = { id: string; stage: string; duration: number; title: string; description: string; format: 'office' | 'online' | '' }

type SalaryRangesMap = Record<string, Record<string, { from: number | null; to: number | null }>>

function createDefaultFieldSettingsForVacancyCountry(): Record<string, { active: boolean; visible: boolean }> {
  return {
    title: { active: true, visible: true },
    department: { active: true, visible: true },
    header: { active: true, visible: true },
    responsibilities: { active: true, visible: true },
    requirements: { active: true, visible: true },
    niceToHave: { active: true, visible: true },
    conditions: { active: true, visible: true },
    closing: { active: true, visible: true },
    link: { active: true, visible: true },
    attachment: { active: true, visible: true },
  }
}

function createDefaultVacancyFieldsByCountryEntry() {
  return {
    title: '',
    department: '',
    header: '',
    responsibilities: '',
    requirements: '',
    niceToHave: '',
    conditions: '',
    closing: '',
    link: '',
    fieldSettings: createDefaultFieldSettingsForVacancyCountry(),
  }
}

export default function VacancyEditModal({ open, onOpenChange, vacancyId, vacancyTitle, vacancy, mode = 'edit', vacancyStatus, onVacancyStatusChange, onSwitchToEdit, onSave, onDelete, embedded = false, settingsTab, onSettingsTabChange, onEmbeddedCancel, vacancySettingsSearchExternal, onVacancySettingsSearchExternalChange, settingsSidebarHostEl, textTabCountryKey, onTextTabCountryKeyChange, textTabOfficeId, onTextTabOfficeIdChange }: VacancyEditModalProps) {
  const toast = useToast()
  const showToast = (msg: string, t: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const titles = { info: 'Информация', warning: 'Внимание', error: 'Ошибка', success: 'Успешно' }
    if (t === 'info') toast.showInfo(titles.info, msg)
    else if (t === 'warning') toast.showWarning(titles.warning, msg)
    else if (t === 'error') toast.showError(titles.error, msg)
    else toast.showSuccess(titles.success, msg)
  }

  const [internalSettingsTab, setInternalSettingsTab] = useState<SettingTab>('text')
  const activeTab = settingsTab ?? internalSettingsTab
  const setTab = useCallback(
    (tab: SettingTab) => {
      onSettingsTabChange?.(tab)
      if (settingsTab === undefined) setInternalSettingsTab(tab)
    },
    [settingsTab, onSettingsTabChange]
  )
  const [internalVacancySettingsSearch, setInternalVacancySettingsSearch] = useState('')
  const vacancySearchExternal = typeof onVacancySettingsSearchExternalChange === 'function'
  const vacancySettingsSearchValue = vacancySearchExternal ? (vacancySettingsSearchExternal ?? '') : internalVacancySettingsSearch

  const textTabCountryControlled = typeof onTextTabCountryKeyChange === 'function'
  const textTabOfficeControlled = typeof onTextTabOfficeIdChange === 'function'
  const [internalTextCountryTab, setInternalTextCountryTab] = useState<string>(() => questionLinkOffices[0]?.id ?? 'by')
  const [internalOfficeByCountry, setInternalOfficeByCountry] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    questionLinkOffices.forEach((c) => {
      if (c.offices[0]) init[c.id] = c.offices[0].id
    })
    if (GLOBAL_REMOTE_TEXT_TAB.offices[0]) init[GLOBAL_REMOTE_TEXT_TAB.id] = GLOBAL_REMOTE_TEXT_TAB.offices[0].id
    return init
  })

  const selectedCountryTab = textTabCountryControlled
    ? parseVacancyTextCountryKey(textTabCountryKey)
    : internalTextCountryTab

  const resolvedOfficeIdForCountry = useMemo(() => {
    const meta = getVacancyTextTabCountryByKey(selectedCountryTab)
    const offices = meta?.offices ?? []
    if (offices.length === 0) return null
    if (textTabOfficeControlled) {
      return parseVacancyTextOfficeId(selectedCountryTab, textTabOfficeId)
    }
    const fromInternal = internalOfficeByCountry[selectedCountryTab]
    if (fromInternal && offices.some((x) => x.id === fromInternal)) return fromInternal
    return offices[0]?.id ?? null
  }, [selectedCountryTab, textTabOfficeControlled, textTabOfficeId, internalOfficeByCountry])

  const handleTextSegmentChange = useCallback(
    (fullKey: string) => {
      const sep = fullKey.indexOf(VACANCY_TEXT_SEGMENT_SEP)
      if (sep === -1) return
      const countryKey = fullKey.slice(0, sep)
      const officeId = fullKey.slice(sep + VACANCY_TEXT_SEGMENT_SEP.length)
      onTextTabCountryKeyChange?.(countryKey)
      if (!textTabCountryControlled) setInternalTextCountryTab(countryKey)
      onTextTabOfficeIdChange?.(officeId)
      if (!textTabOfficeControlled) {
        setInternalOfficeByCountry((prev) => ({ ...prev, [countryKey]: officeId }))
      }
    },
    [textTabCountryControlled, textTabOfficeControlled, onTextTabCountryKeyChange, onTextTabOfficeIdChange]
  )

  const [isPublished, setIsPublished] = useState(false)
  const [publicationUrl, setPublicationUrl] = useState<string | null>(null)
  const [editHistory, setEditHistory] = useState<HistoryItem[]>([
    { id: '1', date: '2026-01-24 10:30', user: 'Иван Иванов', changes: 'Изменен текст вакансии', version: 1,
      fullText: 'Название вакансии: Senior Frontend Developer\n\nОтдел: Разработка\n\nЗаголовок: Приглашаем опытного разработчика\n\nОбязанности:\n- Разработка пользовательских интерфейсов\n- Оптимизация производительности\n- Работа с командой\n\nТребования:\n- Опыт работы от 3 лет\n- Знание React, TypeScript\n- Опыт работы с Redux',
      fieldsState: {
        title: 'Senior Frontend Developer', department: 'Разработка', header: 'Приглашаем опытного разработчика',
        responsibilities: '- Разработка пользовательских интерфейсов\n- Оптимизация производительности\n- Работа с командой',
        requirements: '- Опыт работы от 3 лет\n- Знание React, TypeScript\n- Опыт работы с Redux', niceToHave: '', conditions: '', closing: '', link: '',
        fieldSettings: { title: { active: true, visible: true }, department: { active: true, visible: true }, header: { active: true, visible: true }, responsibilities: { active: true, visible: true }, requirements: { active: true, visible: true }, niceToHave: { active: true, visible: true }, conditions: { active: true, visible: true }, closing: { active: true, visible: true }, link: { active: true, visible: true }, attachment: { active: true, visible: true } },
      },
    },
  ])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)
  const [restoreConfirmationOpen, setRestoreConfirmationOpen] = useState(false)
  const [versionToRestore, setVersionToRestore] = useState<HistoryItem | null>(null)

  const [vacancyTitleS, setVacancyTitleS] = useState('')
  const [vacancyDepartment, setVacancyDepartment] = useState('')
  const [vacancyHeader, setVacancyHeader] = useState('')
  const [vacancyResponsibilities, setVacancyResponsibilities] = useState('')
  const [vacancyRequirements, setVacancyRequirements] = useState('')
  const [vacancyNiceToHave, setVacancyNiceToHave] = useState('')
  const [vacancyConditions, setVacancyConditions] = useState('')
  const [vacancyClosing, setVacancyClosing] = useState('')
  const [vacancyLink, setVacancyLink] = useState('')
  const [vacancyAttachment, setVacancyAttachment] = useState<File | null>(null)
  const [fieldSettings, setFieldSettings] = useState<Record<string, { active: boolean; visible: boolean }>>({
    title: { active: true, visible: true }, department: { active: true, visible: true }, header: { active: true, visible: true },
    responsibilities: { active: true, visible: true }, requirements: { active: true, visible: true }, niceToHave: { active: true, visible: true },
    conditions: { active: true, visible: true }, closing: { active: true, visible: true }, link: { active: true, visible: true }, attachment: { active: true, visible: true },
  })

  const [allRecruiters] = useState([
    { id: '1', name: 'Иван Иванов', email: 'ivan@company.com', phone: '+7 (999) 111-22-33', position: 'Senior Recruiter' },
    { id: '2', name: 'Петр Петров', email: 'petr@company.com', phone: '+7 (999) 222-33-44', position: 'Recruiter' },
    { id: '3', name: 'Мария Сидорова', email: 'maria@company.com', phone: '+7 (999) 333-44-55', position: 'Lead Recruiter' },
    { id: '4', name: 'Анна Смирнова', email: 'anna@company.com', phone: '+7 (999) 444-55-66', position: 'Recruiter' },
    { id: '5', name: 'Дмитрий Козлов', email: 'dmitry@company.com', phone: '+7 (999) 555-66-77', position: 'Junior Recruiter' },
  ])
  const [selectedRecruiters, setSelectedRecruiters] = useState<Set<string>>(new Set(['1', '2']))
  const [mainRecruiter, setMainRecruiter] = useState<string | null>('1')

  const [allInterviewers] = useState([
    { id: '1', name: 'Алексей Козлов', email: 'alexey@company.com', phone: '+7 (999) 111-22-33', position: 'Tech Lead', department: 'Разработка', isCustomer: false },
    { id: '2', name: 'Елена Волкова', email: 'elena@company.com', phone: '+7 (999) 222-33-44', position: 'HR Manager', department: 'HR', isCustomer: false },
    { id: '3', name: 'Дмитрий Новиков', email: 'dmitry@company.com', phone: '+7 (999) 333-44-55', position: 'CTO', department: 'Управление', isCustomer: false },
    { id: '4', name: 'Ольга Морозова', email: 'olga@company.com', phone: '+7 (999) 444-55-66', position: 'Senior Developer', department: 'Разработка', isCustomer: false },
    { id: '5', name: 'Иван Петров', email: 'ivan.petrov@techsoft.ru', phone: '+7 (495) 123-45-67', position: 'Менеджер проекта', department: 'ООО "ТехноСофт"', isCustomer: true },
    { id: '6', name: 'Мария Соколова', email: 'maria@innovations.ru', phone: '+7 (495) 234-56-78', position: 'Руководитель отдела', department: 'АО "Инновации"', isCustomer: true },
    { id: '7', name: 'Петр Сидоров', email: 'petr@sidorov.ru', phone: '+7 (495) 345-67-89', position: 'Владелец', department: 'ИП Сидоров', isCustomer: true },
  ])
  const [customersOnlyFromDepartment, setCustomersOnlyFromDepartment] = useState(true)
  const [selectedVacancyInterviewers, setSelectedVacancyInterviewers] = useState<Set<string>>(new Set(['1', '2']))
  const [finalInterviewInterviewers, setFinalInterviewInterviewers] = useState<Set<string>>(new Set(['1']))

  const [activeStages, setActiveStages] = useState<Set<string>>(new Set(['new', 'under-review', 'interview', 'offer', 'accepted', 'rejected', 'declined', 'archived']))
  const [activeGrades, setActiveGrades] = useState<Set<string>>(new Set(['3', '6', '9', '11']))
  const [salaryRanges, setSalaryRanges] = useState<SalaryRangesMap>({
    '3': { BYN: { from: 1000, to: 2000 }, USD: { from: null, to: null }, EUR: { from: null, to: null }, PLN: { from: null, to: null } },
    '6': { BYN: { from: 2000, to: 3500 }, USD: { from: null, to: null }, EUR: { from: null, to: null }, PLN: { from: null, to: null } },
    '9': { BYN: { from: 3500, to: 5000 }, USD: { from: null, to: null }, EUR: { from: null, to: null }, PLN: { from: null, to: null } },
    '11': { BYN: { from: 5000, to: 7000 }, USD: { from: null, to: null }, EUR: { from: null, to: null }, PLN: { from: null, to: null } },
  })
  const [isGrossFormat, setIsGrossFormat] = useState(true)

  const getStagesBeforeOffer = () => {
    // Используем этапы с настройками встреч, если они загружены, иначе используем базовые этапы
    const stagesToUse = recruitmentStagesWithMeetings.length > 0 ? recruitmentStagesWithMeetings : recruitmentStages
    return stagesToUse.filter(s => {
      const stageIdx = stagesToUse.findIndex(st => st.id === s.id)
      const offerIdx = stagesToUse.findIndex(st => st.id === 'offer')
      return stageIdx < offerIdx && activeStages.has(s.id)
    })
  }
  // Состояние для этапов найма с настройками встреч
  const [recruitmentStagesWithMeetings, setRecruitmentStagesWithMeetings] = useState<Array<{
    id: string
    name: string
    description?: string
    color: string
    isMeeting?: boolean
    showOffices?: boolean
    showInterviewers?: boolean
  }>>(recruitmentStages.map(s => ({ ...s, isMeeting: false, showOffices: false, showInterviewers: false })))

  // Загрузка этапов найма с настройками встреч
  useEffect(() => {
    // TODO: Загрузить этапы найма из API /api/company-settings/recruiting/stages/
    // и обновить recruitmentStagesWithMeetings с учетом isMeeting, showOffices, showInterviewers
    // Пока используем моковые данные
    const mockStagesWithMeetings = recruitmentStages.map(s => ({
      ...s,
      isMeeting: s.id === 'interview' || s.id === 'hr-screening' || s.id === 'final-interview',
      showOffices: s.id === 'interview' ? true : false,
      showInterviewers: s.id === 'interview' ? true : false,
    }))
    setRecruitmentStagesWithMeetings(mockStagesWithMeetings)
  }, [])

  const [interviewMeetings, setInterviewMeetings] = useState<InterviewMeeting[]>(() => {
    const stages = getStagesBeforeOffer()
    return Array.from({ length: Math.max(0, stages.length - 2) }, (_, i) => ({ id: `meeting-${i}`, stage: '', duration: 60, title: '', description: '', format: '' as 'office' | 'online' | '' }))
  })

  const [scorecardLinkUrl, setScorecardLinkUrl] = useState('')
  const [scorecardLinkTitle, setScorecardLinkTitle] = useState('')
  const [scorecardLinkPosition, setScorecardLinkPosition] = useState<'start' | 'end'>('start')
  const [scorecardLocalActive, setScorecardLocalActive] = useState(false)
  const [scorecardLocalSettingsOpen, setScorecardLocalSettingsOpen] = useState(false)
  const [useUnifiedPrompt, setUseUnifiedPrompt] = useState(true)
  const [analysisPrompt, setAnalysisPrompt] = useState('')
  const [integrationPartner, setIntegrationPartner] = useState<'' | 'huntflow'>('')
  const [huntflowVacancyId, setHuntflowVacancyId] = useState('')
  const [questionsLinksByOffice, setQuestionsLinksByOffice] = useState<Record<string, OfficeQuestionsState>>(() => {
    const init: Record<string, OfficeQuestionsState> = {}
    questionLinkOffices.forEach(o => { init[o.id] = getDefaultOfficeState() })
    return init
  })

  // Состояние активности вакансии для каждой страны
  const [vacancyActiveByCountry, setVacancyActiveByCountry] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    questionLinkOffices.forEach(o => { init[o.id] = true })
    return init
  })

  // Состояние для полей вакансии по странам
  const [vacancyFieldsByCountry, setVacancyFieldsByCountry] = useState<Record<string, {
    title: string
    department: string
    header: string
    responsibilities: string
    requirements: string
    niceToHave: string
    conditions: string
    closing: string
    link: string
    fieldSettings: Record<string, { active: boolean; visible: boolean }>
  }>>(() => {
    const init: Record<string, ReturnType<typeof createDefaultVacancyFieldsByCountryEntry>> = {}
    questionLinkOffices.forEach((o) => {
      init[o.id] = createDefaultVacancyFieldsByCountryEntry()
    })
    return init
  })

  /** false — один набор локаций; true — индивидуальные параметры по странам/офисам (см. «Текст вакансии») */
  const [vacancyLocationsIndividual, setVacancyLocationsIndividual] = useState(false)
  const [vacancyLocationRows, setVacancyLocationRows] = useState<{ id: string; label: string }[]>(() => [
    { id: 'loc-msk', label: 'Минск' },
    { id: 'loc-remote', label: 'Удалённо' },
  ])

  /** Учитывать ли доп. поле кандидата на этой вакансии (каталог полей — в настройках компании) */
  const [vacancyAdditionalFieldEnabled, setVacancyAdditionalFieldEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CANDIDATE_ADDITIONAL_FIELD_ROWS.map((f) => [f.id, true]))
  )

  const setAdditionalFieldOnVacancy = useCallback((fieldId: string, enabled: boolean) => {
    setVacancyAdditionalFieldEnabled((prev) => ({ ...prev, [fieldId]: enabled }))
  }, [])

  const enableAllAdditionalFieldsOnVacancy = useCallback(() => {
    setVacancyAdditionalFieldEnabled(Object.fromEntries(CANDIDATE_ADDITIONAL_FIELD_ROWS.map((f) => [f.id, true])))
  }, [])

  const disableAllAdditionalFieldsOnVacancy = useCallback(() => {
    setVacancyAdditionalFieldEnabled(Object.fromEntries(CANDIDATE_ADDITIONAL_FIELD_ROWS.map((f) => [f.id, false])))
  }, [])

  /** Активность карточки «Вопросы» по id строки локации (только vacancyLocationsIndividual) */
  const [vacancyQuestionsActiveByRowId, setVacancyQuestionsActiveByRowId] = useState<Record<string, boolean>>({})
  const [newLocationLabel, setNewLocationLabel] = useState('')

  const allAdditionalFieldsOnVacancy = useMemo(
    () => CANDIDATE_ADDITIONAL_FIELD_ROWS.every((f) => vacancyAdditionalFieldEnabled[f.id]),
    [vacancyAdditionalFieldEnabled]
  )

  const addLocationFromCatalog = useCallback((catalogId: string) => {
    const row = LOCATION_CATALOG.find((c) => c.id === catalogId)
    if (!row) return
    setVacancyLocationRows((prev) => (prev.some((r) => r.id === row.id) ? prev : [...prev, { id: row.id, label: row.label }]))
  }, [])

  const removeLocationRow = useCallback((id: string) => {
    setVacancyLocationRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addCustomLocationRow = useCallback(() => {
    const t = newLocationLabel.trim()
    if (!t) return
    const id = `custom-${Date.now()}`
    setVacancyLocationRows((prev) => [...prev, { id, label: t }])
    setNewLocationLabel('')
  }, [newLocationLabel])

  const visibleCountryKeysForIndividual = useMemo(
    () => getVisibleCountryKeysFromLocationRows(vacancyLocationRows),
    [vacancyLocationRows]
  )

  const countriesForTextTabs = useMemo((): VacancyTextTabCountry[] => {
    if (!vacancyLocationsIndividual) {
      return questionLinkOffices.filter((o) => visibleCountryKeysForIndividual.includes(o.id))
    }
    return buildOrderedIndividualTextTabCountries(vacancyLocationRows, visibleCountryKeysForIndividual)
  }, [vacancyLocationsIndividual, vacancyLocationRows, visibleCountryKeysForIndividual])

  /** Единая полоска вкладок: страна+офис, без вложенного второго TabList */
  const textTabFlatSegments = useMemo(() => buildFlatTextTabSegments(countriesForTextTabs), [countriesForTextTabs])
  const selectedTextSegmentKey = useMemo(() => {
    const oid = resolvedOfficeIdForCountry
    if (textTabFlatSegments.length === 0) return ''
    if (!oid) return textTabFlatSegments[0]?.key ?? ''
    const k = `${selectedCountryTab}${VACANCY_TEXT_SEGMENT_SEP}${oid}`
    if (textTabFlatSegments.some((s) => s.key === k)) return k
    return textTabFlatSegments[0]?.key ?? ''
  }, [selectedCountryTab, resolvedOfficeIdForCountry, textTabFlatSegments])

  /** Цели карточек «Вопросы и ссылки»: в индивидуальном режиме — каждая строка локации; иначе — базовая страна */
  const questionsLinkTargets = useMemo((): { key: string; heading: string }[] => {
    if (!vacancyLocationsIndividual) {
      const o = questionLinkOffices[0]!
      return [{ key: o.id, heading: o.name }]
    }
    return vacancyLocationRows.map((r) => ({ key: r.id, heading: r.label }))
  }, [vacancyLocationsIndividual, vacancyLocationRows])

  useEffect(() => {
    if (!vacancyLocationsIndividual) return
    setVacancyQuestionsActiveByRowId((prev) => {
      const next = { ...prev }
      for (const row of vacancyLocationRows) {
        if (next[row.id] === undefined) next[row.id] = true
      }
      return next
    })
    setQuestionsLinksByOffice((prev) => {
      const next = { ...prev }
      for (const row of vacancyLocationRows) {
        if (next[row.id] == null) next[row.id] = getDefaultOfficeState()
      }
      return next
    })
  }, [vacancyLocationsIndividual, vacancyLocationRows])

  useEffect(() => {
    const tabIds = countriesForTextTabs.map((c) => c.id)
    setVacancyFieldsByCountry((prev) => {
      let next = prev
      let changed = false
      for (const id of tabIds) {
        if (!next[id]) {
          if (!changed) {
            next = { ...prev }
            changed = true
          }
          next[id] = createDefaultVacancyFieldsByCountryEntry()
        }
      }
      return changed ? next : prev
    })
    setVacancyActiveByCountry((prev) => {
      let next = prev
      let changed = false
      for (const id of tabIds) {
        if (next[id] === undefined) {
          if (!changed) {
            next = { ...prev }
            changed = true
          }
          next[id] = true
        }
      }
      return changed ? next : prev
    })
  }, [countriesForTextTabs])

  useEffect(() => {
    if (!vacancyLocationsIndividual) return
    const keys = textTabFlatSegments.map((s) => s.key)
    if (keys.length === 0) return
    if (!keys.includes(selectedTextSegmentKey)) {
      handleTextSegmentChange(keys[0])
    }
  }, [vacancyLocationsIndividual, textTabFlatSegments, selectedTextSegmentKey, handleTextSegmentChange])

  const updateOfficeLink = (officeId: string, upd: Partial<OfficeLink>) => {
    setQuestionsLinksByOffice(prev => ({ ...prev, [officeId]: { ...(prev[officeId] ?? {}), link: { ...(prev[officeId]?.link ?? getDefaultOfficeState().link), ...upd } } }))
  }
  const updateOfficeQuestion = (officeId: string, upd: Partial<{ text: string; color: string }>) => {
    setQuestionsLinksByOffice(prev => {
      const curr = prev[officeId] ?? getDefaultOfficeState()
      const base = curr.question ?? { text: '', color: questionLinkColors[0].hex }
      return { ...prev, [officeId]: { ...curr, question: { ...base, ...upd } } }
    })
  }

  useEffect(() => {
    const stages = recruitmentStages.filter(s => { const i = recruitmentStages.findIndex(st => st.id === s.id); const o = recruitmentStages.findIndex(st => st.id === 'offer'); return i < o && activeStages.has(s.id) })
    const newCount = Math.max(0, stages.length - 2)
    setInterviewMeetings(prev => {
      if (prev.length < newCount) return [...prev, ...Array.from({ length: newCount - prev.length }, (_, i) => ({ id: `meeting-${Date.now()}-${i}`, stage: '', duration: 60, title: '', description: '', format: '' as 'office' | 'online' | '' }))]
      if (prev.length > newCount && newCount >= 0) return prev.slice(0, newCount)
      return prev
    })
  }, [activeStages])

  const updateInterviewMeeting = (id: string, u: Partial<InterviewMeeting>) => setInterviewMeetings(prev => prev.map(m => m.id === id ? { ...m, ...u } : m))
  const addInterviewMeeting = () => setInterviewMeetings(prev => [...prev, { id: `meeting-${Date.now()}`, stage: '', duration: 60, title: '', description: '', format: '' as 'office' | 'online' | '' }])
  const removeInterviewMeeting = (id: string) => setInterviewMeetings(prev => prev.filter(m => m.id !== id))

  useEffect(() => { if (mainRecruiter && !selectedRecruiters.has(mainRecruiter)) setMainRecruiter(null) }, [selectedRecruiters, mainRecruiter])

  const handleRecruiterToggle = (id: string) => {
    if (mainRecruiter === id && selectedRecruiters.has(id)) { showToast('Сначала назначьте нового главного рекрутера, затем снимите текущего с вакансии', 'warning'); return }
    setSelectedRecruiters(prev => { const s = new Set(prev); if (s.has(id)) { s.delete(id); if (mainRecruiter === id) setMainRecruiter(null) } else s.add(id); return s })
  }
  const handleMainRecruiterToggle = (id: string) => {
    if (!selectedRecruiters.has(id)) { showToast('Главный рекрутер должен быть среди тех, кто может видеть вакансию', 'warning'); return }
    setMainRecruiter(mainRecruiter === id ? null : id)
  }
  const handleStageToggle = (id: string) => setActiveStages(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s })
  const handleGradeToggle = (id: string) => {
    setActiveGrades(prev => {
      const s = new Set(prev)
      if (s.has(id)) { s.delete(id); setSalaryRanges((r: SalaryRangesMap) => { const n = { ...r }; delete n[id]; return n }); return s }
      s.add(id)
      const main = companyCurrencies.find(c => c.isMain)?.code || 'BYN'
      setSalaryRanges((r: SalaryRangesMap) => ({ ...r, [id]: { [main]: { from: null, to: null }, ...companyCurrencies.filter(c => !c.isMain).reduce((a, c) => ({ ...a, [c.code]: { from: null, to: null } }), {} as Record<string, { from: number | null; to: number | null }>) } }))
      return s
    })
  }
  const handleSalaryChange = (gradeId: string, currencyCode: string, field: 'from' | 'to', value: string) => {
    const main = companyCurrencies.find(c => c.isMain)?.code || 'BYN'
    const num = value === '' ? null : parseFloat(value)
    setSalaryRanges((prev: SalaryRangesMap) => {
      const n = { ...prev }
      if (!n[gradeId]) n[gradeId] = {}
      if (!n[gradeId][currencyCode]) n[gradeId][currencyCode] = { from: null, to: null }
      n[gradeId][currencyCode][field] = num
      if (currencyCode === main && num != null) companyCurrencies.filter(c => !c.isMain).forEach(c => {
        if (!n[gradeId][c.code]) n[gradeId][c.code] = { from: null, to: null }
        const rate = currencyRates[c.code] || 1, mainRate = currencyRates[main] || 1
        const v = (num * mainRate) / rate
        n[gradeId][c.code][field] = Math.round(v * 100) / 100
      })
      return n
    })
  }
  const getSalaryValue = (gradeId: string, currencyCode: string, field: 'from' | 'to'): number | null => {
    if (field === 'from' && !salaryRanges[gradeId]?.[currencyCode]?.from) {
      const g = allGrades.find(x => x.id === gradeId)
      if (g) { const prev = allGrades.filter(x => x.order < g.order && activeGrades.has(x.id)).sort((a, b) => b.order - a.order)[0]; if (prev && salaryRanges[prev.id]?.[currencyCode]?.to) return salaryRanges[prev.id][currencyCode].to }
      return 0
    }
    return salaryRanges[gradeId]?.[currencyCode]?.[field] ?? null
  }
  const handleVacancyInterviewerToggle = (id: string) => {
    setSelectedVacancyInterviewers(prev => { const s = new Set(prev); if (s.has(id)) { s.delete(id); if (finalInterviewInterviewers.has(id)) setFinalInterviewInterviewers(f => { const n = new Set(f); n.delete(id); return n }) } else s.add(id); return s })
  }
  const handleFinalInterviewToggle = (id: string) => {
    if (!selectedVacancyInterviewers.has(id)) { showToast('Интервьюер должен быть среди тех, кто может видеть вакансию', 'warning'); return }
    setFinalInterviewInterviewers(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s })
  }

  const getFieldName = (k: string): string => ({ title: 'Название вакансии', department: 'Отдел', header: 'Заголовок', responsibilities: 'Обязанности', requirements: 'Требования', niceToHave: 'Будет плюсом', conditions: 'Условия работы', closing: 'Заключение', link: 'Ссылка', attachment: 'Вложение' }[k] || k)
  const compareLines = (cur: string, next: string): string => {
    const cw = cur.split(/(\s+)/), nw = next.split(/(\s+)/)
    const r: string[] = []
    let ci = 0, ni = 0
    while (ci < cw.length || ni < nw.length) {
      if (ci >= cw.length) { r.push(`<span style="text-decoration:underline;background:#fef3c7;">${nw.slice(ni).join('')}</span>`); break }
      if (ni >= nw.length) { r.push(`<span style="text-decoration:line-through;background:#fef3c7;">${cw.slice(ci).join('')}</span>`); break }
      if (cw[ci] === nw[ni]) { r.push(cw[ci]); ci++; ni++; continue }
      let found = false
      for (let j = ni + 1; j < nw.length; j++) if (cw[ci] === nw[j]) { r.push(`<span style="text-decoration:line-through;background:#fef3c7;">${nw.slice(ni, j).join('')}</span>`); ni = j; found = true; break }
      if (!found) for (let j = ci + 1; j < cw.length; j++) if (cw[j] === nw[ni]) { r.push(`<span style="text-decoration:underline;background:#fef3c7;">${cw.slice(ci, j).join('')}</span>`); ci = j; found = true; break }
      if (!found) { r.push(`<span style="text-decoration:line-through;background:#fef3c7;">${cw[ci]}</span>`, `<span style="text-decoration:underline;background:#fef3c7;">${nw[ni]}</span>`); ci++; ni++ }
    }
    return r.join('')
  }
  const calculateDiff = (cur: string, next: string): string => {
    if (!next) return cur
    const cl = cur.split('\n'), nl = next.split('\n'), max = Math.max(cl.length, nl.length), out: string[] = []
    for (let i = 0; i < max; i++) {
      const c = cl[i] || '', n = nl[i] || ''
      if (c === n) out.push(c)
      else if (c && !n) out.push(`<span style="text-decoration:line-through;background:#fef3c7;">${c}</span>`)
      else if (!c && n) out.push(`<span style="text-decoration:underline;background:#fef3c7;">${n}</span>`)
      else out.push(compareLines(c, n))
    }
    return out.join('\n')
  }
  const handleRestoreVersion = () => {
    if (!versionToRestore?.fieldsState) { showToast('Не удалось восстановить версию: отсутствуют данные', 'error'); return }
    const fs = versionToRestore.fieldsState
    setVacancyTitleS(fs.title); setVacancyDepartment(fs.department); setVacancyHeader(fs.header)
    setVacancyResponsibilities(fs.responsibilities); setVacancyRequirements(fs.requirements); setVacancyNiceToHave(fs.niceToHave)
    setVacancyConditions(fs.conditions); setVacancyClosing(fs.closing); setVacancyLink(fs.link); setFieldSettings(fs.fieldSettings)
    const v = Math.max(...editHistory.map(h => h.version)) + 1, now = new Date().toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    setEditHistory(prev => [{ id: String(Date.now()), date: now, user: 'Текущий пользователь', changes: `Восстановлена версия ${versionToRestore.version} от ${versionToRestore.date}`, version: v, fullText: versionToRestore.fullText, fieldsState: { ...fs, fieldSettings: JSON.parse(JSON.stringify(fs.fieldSettings)) } }, ...prev])
    setRestoreConfirmationOpen(false); setSelectedHistoryItem(null); setVersionToRestore(null)
    showToast(`Версия ${versionToRestore.version} успешно восстановлена`, 'success')
  }

  useEffect(() => {
    if (open) {
      setVacancyTitleS(vacancyTitle ?? '')
      if (settingsTab === undefined) setInternalSettingsTab('text')
    }
  }, [open, vacancyTitle, settingsTab])

  const stagesBeforeOffer = getStagesBeforeOffer()
  const maxMeetingsCount = Math.max(0, stagesBeforeOffer.length - 2)

  const handleSave = () => {
    onSave?.({ vacancyTitle: vacancyTitleS, vacancyDepartment, vacancyHeader, vacancyResponsibilities, vacancyRequirements, vacancyNiceToHave, vacancyConditions, vacancyClosing, vacancyLink, fieldSettings, isPublished, publicationUrl, selectedRecruiters, mainRecruiter, customersOnlyFromDepartment, selectedVacancyInterviewers, finalInterviewInterviewers, activeStages, activeGrades, salaryRanges, interviewMeetings, scorecardLinkUrl, scorecardLinkTitle, scorecardLinkPosition, scorecardLocalActive, useUnifiedPrompt, analysisPrompt, integrationPartner, huntflowVacancyId, questionsLinksByOffice, vacancyLocationsIndividual, vacancyLocationRows, vacancyAdditionalFieldEnabled })
    if (!embedded) onOpenChange(false)
  }
  const handleCancel = () => {
    onEmbeddedCancel?.()
    if (!embedded) onOpenChange(false)
  }

  const canDeleteVacancy = mode === 'edit' && vacancyId != null && typeof onDelete === 'function'

  const handleDeleteVacancyClick = () => {
    if (vacancyId == null || !onDelete) return
    const title = vacancyTitleS.trim() || vacancyTitle || vacancy?.title || `№ ${vacancyId}`
    toast.showWarning('Удалить вакансию?', `Вакансия «${title}» будет удалена без возможности восстановления (в демо — из списка).`, {
      duration: 60_000,
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            onDelete(vacancyId)
            if (!embedded) onOpenChange(false)
            else onEmbeddedCancel?.()
            toast.showSuccess('Вакансия удалена', 'Запись убрана из списка.')
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const filteredSections = vacancySettingsSearchValue.trim()
    ? SECTIONS.filter(s => s.label.toLowerCase().includes(vacancySettingsSearchValue.trim().toLowerCase()))
    : SECTIONS

  const sidebarClassName =
    embedded && settingsSidebarHostEl ? `${styles.sidebar} ${styles.sidebarInAtsLeft}` : styles.sidebar

  const editSidebarNode = (
    <Flex direction="column" gap="2" className={sidebarClassName}>
      {!vacancySearchExternal && (
        <TextField.Root
          placeholder="Search vacancy-settings..."
          value={internalVacancySettingsSearch}
          onChange={(e) => setInternalVacancySettingsSearch(e.target.value)}
          size="2"
        />
      )}
      <Text size="2" weight="medium">Настройки вакансии</Text>
      <Text size="1" weight="medium" color="gray">Разделы настроек</Text>
      {filteredSections.map(({ key, label }) => (
        <Button key={key} variant={activeTab === key ? 'solid' : 'soft'} onClick={() => setTab(key)} style={{ justifyContent: 'flex-start' }}>
          <Text size="2">{label}</Text>
        </Button>
      ))}
    </Flex>
  )

  const editMainColumnBox = (
              <Box className={styles.content}>
                {activeTab === 'text' && (
                  <Box>
                    <Flex align="center" justify="between" mb="4">
                      <Text size="3" weight="bold">Текст вакансии</Text>
                      <Flex align="center" gap="2">
                        {isPublished && publicationUrl && (
                          <Button variant="soft" size="2" onClick={() => window.open(publicationUrl!, '_blank')}>
                            <GlobeIcon width={16} height={16} /> Открыть на сайте
                          </Button>
                        )}
                        <Button
                          variant={isPublished ? 'solid' : 'soft'}
                          color={isPublished ? 'green' : 'gray'}
                          size="2"
                          className={isPublished ? styles.publishTogglePublished : undefined}
                          onClick={(e) => {
                            const btn = e.currentTarget; (btn.querySelector('.button-text') as HTMLElement) && ((btn.querySelector('.button-text') as HTMLElement).textContent = isPublished ? 'Опубликовано' : 'Опубликовать на сайте')
                            if (!isPublished) {
                              const url = `https://company.com/vacancies/${(vacancyTitleS || 'v').toLowerCase().replace(/\s+/g, '-')}`
                              setPublicationUrl(url); setIsPublished(true)
                              setEditHistory(prev => [{ id: String(Date.now()), date: new Date().toLocaleString('ru-RU'), user: 'Текущий пользователь', changes: 'Вакансия опубликована на сайте', version: prev[0]?.version ? prev[0].version + 1 : 1 }, ...prev])
                              alert(`Вакансия опубликована на сайте!\nURL: ${url}`)
                            } else {
                              setIsPublished(false); setPublicationUrl(null)
                              setEditHistory(prev => [{ id: String(Date.now()), date: new Date().toLocaleString('ru-RU'), user: 'Текущий пользователь', changes: 'Публикация вакансии снята с сайта', version: prev[0]?.version ? prev[0].version + 1 : 1 }, ...prev])
                              alert('Вакансия снята с публикации')
                            }
                          }}
                          onMouseEnter={(e) => { if (isPublished) { const span = e.currentTarget.querySelector('.button-text') as HTMLElement; if (span) span.textContent = 'Снять публикацию' } }}
                          onMouseLeave={(e) => { if (isPublished) { const span = e.currentTarget.querySelector('.button-text') as HTMLElement; if (span) span.textContent = 'Опубликовано' } }}
                        >
                          {isPublished ? (<><span className="button-text">Опубликовано</span></>) : (<><GlobeIcon width={16} height={16} /> Опубликовать на сайте</>)}
                        </Button>
                      </Flex>
                    </Flex>
                    {!vacancyLocationsIndividual ? (
                      <Box mb="4">
                        <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>
                          Единый текст для всех локаций: табы стран и площадок отключены при режиме «везде одинаково» в разделе «Локации».
                        </Text>
                        {(() => {
                          const office = questionLinkOffices.find((o) => o.id === 'by')!
                          return (
                        <Box>
                          <Flex align="center" justify="end" mb="3">
                            <Flex align="center" gap="2">
                              <Text size="2" color="gray">Активность:</Text>
                              <Switch
                                checked={vacancyActiveByCountry[office.id] || false}
                                onCheckedChange={(checked) => setVacancyActiveByCountry((prev) => ({ ...prev, [office.id]: checked }))}
                              />
                            </Flex>
                          </Flex>
                          <Flex direction="column" gap="4">
                            <Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Название</Text><TextField.Root value={vacancyFieldsByCountry[office.id]?.title || vacancyTitleS} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, title: e.target.value } })); setVacancyTitleS(e.target.value) }} placeholder="Введите название вакансии" disabled={!vacancyActiveByCountry[office.id]} /></Box>
                            <Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Отдел</Text><Select.Root value={vacancyFieldsByCountry[office.id]?.department || vacancyDepartment} onValueChange={(v) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, department: v } })); setVacancyDepartment(v) }}><Select.Trigger placeholder="Выберите отдел" disabled={!vacancyActiveByCountry[office.id]} /><Select.Content>{getAllDepartmentsFlat(mockDepartments).map(d => <Select.Item key={d.id} value={d.id}>{'  '.repeat(d.level)}{d.name}</Select.Item>)}</Select.Content></Select.Root></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Шапка</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.header?.active ?? fieldSettings.header.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, header: { ...fs.header, active: !!c } } } })); setFieldSettings(prev => ({ ...prev, header: { ...prev.header, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.header?.visible ?? fieldSettings.header.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, header: { ...fs.header, visible: !!c } } } })); setFieldSettings(prev => ({ ...prev, header: { ...prev.header, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.header || vacancyHeader} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, header: e.target.value } })); setVacancyHeader(e.target.value) }} placeholder="Введите текст шапки" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.header?.active ?? fieldSettings.header.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Обязанности</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.responsibilities?.active ?? fieldSettings.responsibilities.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, responsibilities: { ...fs.responsibilities, active: !!c } } } })); setFieldSettings(prev => ({ ...prev, responsibilities: { ...prev.responsibilities, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.responsibilities?.visible ?? fieldSettings.responsibilities.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, responsibilities: { ...fs.responsibilities, visible: !!c } } } })); setFieldSettings(prev => ({ ...prev, responsibilities: { ...prev.responsibilities, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.responsibilities || vacancyResponsibilities} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, responsibilities: e.target.value } })); setVacancyResponsibilities(e.target.value) }} placeholder="Введите обязанности" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.responsibilities?.active ?? fieldSettings.responsibilities.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Пожелания</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.requirements?.active ?? fieldSettings.requirements.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, requirements: { ...fs.requirements, active: !!c } } } })); setFieldSettings(prev => ({ ...prev, requirements: { ...prev.requirements, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.requirements?.visible ?? fieldSettings.requirements.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, requirements: { ...fs.requirements, visible: !!c } } } })); setFieldSettings(prev => ({ ...prev, requirements: { ...prev.requirements, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.requirements || vacancyRequirements} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, requirements: e.target.value } })); setVacancyRequirements(e.target.value) }} placeholder="Введите пожелания" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.requirements?.active ?? fieldSettings.requirements.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Будет плюсом</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.niceToHave?.active ?? fieldSettings.niceToHave.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, niceToHave: { ...fs.niceToHave, active: !!c } } } })); setFieldSettings(prev => ({ ...prev, niceToHave: { ...prev.niceToHave, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.niceToHave?.visible ?? fieldSettings.niceToHave.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, niceToHave: { ...fs.niceToHave, visible: !!c } } } })); setFieldSettings(prev => ({ ...prev, niceToHave: { ...prev.niceToHave, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.niceToHave || vacancyNiceToHave} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, niceToHave: e.target.value } })); setVacancyNiceToHave(e.target.value) }} placeholder="Введите что будет плюсом" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.niceToHave?.active ?? fieldSettings.niceToHave.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Условия работы</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.conditions?.active ?? fieldSettings.conditions.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, conditions: { ...fs.conditions, active: !!c } } } })); setFieldSettings(prev => ({ ...prev, conditions: { ...prev.conditions, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.conditions?.visible ?? fieldSettings.conditions.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, conditions: { ...fs.conditions, visible: !!c } } } })); setFieldSettings(prev => ({ ...prev, conditions: { ...prev.conditions, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.conditions || vacancyConditions} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, conditions: e.target.value } })); setVacancyConditions(e.target.value) }} placeholder="Введите условия работы" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.conditions?.active ?? fieldSettings.conditions.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Завершение</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.closing?.active ?? fieldSettings.closing.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, closing: { ...fs.closing, active: !!c } } } })); setFieldSettings(prev => ({ ...prev, closing: { ...prev.closing, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.closing?.visible ?? fieldSettings.closing.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, closing: { ...fs.closing, visible: !!c } } } })); setFieldSettings(prev => ({ ...prev, closing: { ...prev.closing, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.closing || vacancyClosing} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, closing: e.target.value } })); setVacancyClosing(e.target.value) }} placeholder="Введите завершающий текст" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.closing?.active ?? fieldSettings.closing.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Дополнительная ссылка</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.link?.active ?? fieldSettings.link.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, link: { ...fs.link, active: !!c } } } })); setFieldSettings(prev => ({ ...prev, link: { ...prev.link, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.link?.visible ?? fieldSettings.link.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, link: { ...fs.link, visible: !!c } } } })); setFieldSettings(prev => ({ ...prev, link: { ...prev.link, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextField.Root value={vacancyFieldsByCountry[office.id]?.link || vacancyLink} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, link: e.target.value } })); setVacancyLink(e.target.value) }} placeholder="https://example.com/vacancy" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.link?.active ?? fieldSettings.link.active)} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Вложения</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.active ?? fieldSettings.attachment.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, attachment: { ...fs.attachment, active: !!c } } } })); setFieldSettings(prev => ({ ...prev, attachment: { ...prev.attachment, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.visible ?? fieldSettings.attachment.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, attachment: { ...fs.attachment, visible: !!c } } } })); setFieldSettings(prev => ({ ...prev, attachment: { ...prev.attachment, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex>
                              <Flex direction="column" gap="2"><input type="file" accept=".docx,.pptx,.figma" onChange={(e) => setVacancyAttachment(e.target.files?.[0] || null)} disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.active ?? fieldSettings.attachment.active)} id="vacancy-edit-modal-attachment-uniform" style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} /><Button asChild variant="soft" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.active ?? fieldSettings.attachment.active)} style={{ width: '100%', justifyContent: 'flex-start' }}><label htmlFor="vacancy-edit-modal-attachment-uniform" style={{ cursor: (vacancyActiveByCountry[office.id] && (vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.active ?? fieldSettings.attachment.active)) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}><UploadIcon width={16} height={16} /><Text size="2">{vacancyAttachment ? vacancyAttachment.name : 'Выберите файл (docx, pptx, figma)'}</Text></label></Button>{vacancyAttachment && <Flex align="center" gap="2" style={{ padding: '8px 12px', backgroundColor: 'var(--gray-2)', borderRadius: 6 }}><FileTextIcon width={16} height={16} /><Text size="2" style={{ flex: 1 }}>{vacancyAttachment.name}</Text><Text size="1" color="gray">{(vacancyAttachment.size / 1024).toFixed(2)} KB</Text><Button size="1" variant="ghost" color="red" onClick={() => setVacancyAttachment(null)}><Cross2Icon width={14} height={14} /></Button></Flex>}</Flex>
                            </Box>
                          </Flex>
                        </Box>
                          )
                        })()}
                      </Box>
                    ) : (
                    <Tabs.Root value={selectedTextSegmentKey} onValueChange={handleTextSegmentChange} mb="4">
                      {textTabFlatSegments.length > 1 ? (
                        <Tabs.List className={styles.tabListScroll}>
                          {textTabFlatSegments.map((seg) => (
                            <Tabs.Trigger key={seg.key} value={seg.key}>
                              <Text size="2">{seg.label}</Text>
                            </Tabs.Trigger>
                          ))}
                        </Tabs.List>
                      ) : null}
                      {textTabFlatSegments.map((seg) => {
                        const office = getVacancyTextTabCountryByKey(seg.countryKey)
                        if (!office) return null
                        return (
                        <Tabs.Content key={seg.key} value={seg.key}>
                          <Flex align="center" justify="between" mb="3" gap="3" wrap="wrap">
                            <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                              {textTabFlatSegments.length === 1 ? (
                                <Text size="2" color="gray">
                                  {office.offices.length > 1
                                    ? `${office.name} — ${office.offices.find((x) => x.id === seg.officeId)?.name ?? ''}`
                                    : office.name}
                                </Text>
                              ) : null}
                            </Flex>
                            <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                              <Text size="2" color="gray">Активность:</Text>
                              <Switch 
                                checked={vacancyActiveByCountry[office.id] || false} 
                                onCheckedChange={(checked) => setVacancyActiveByCountry(prev => ({ ...prev, [office.id]: checked }))} 
                              />
                            </Flex>
                          </Flex>
                          <Flex direction="column" gap="4">
                            <Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Название</Text><TextField.Root value={vacancyFieldsByCountry[office.id]?.title || vacancyTitleS} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, title: e.target.value } })); if (office.id === selectedCountryTab) setVacancyTitleS(e.target.value) }} placeholder="Введите название вакансии" disabled={!vacancyActiveByCountry[office.id]} /></Box>
                            <Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Отдел</Text><Select.Root value={vacancyFieldsByCountry[office.id]?.department || vacancyDepartment} onValueChange={(v) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, department: v } })); if (office.id === selectedCountryTab) setVacancyDepartment(v) }}><Select.Trigger placeholder="Выберите отдел" disabled={!vacancyActiveByCountry[office.id]} /><Select.Content>{getAllDepartmentsFlat(mockDepartments).map(d => <Select.Item key={d.id} value={d.id}>{'  '.repeat(d.level)}{d.name}</Select.Item>)}</Select.Content></Select.Root></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Шапка</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.header?.active ?? fieldSettings.header.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, header: { ...fs.header, active: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, header: { ...prev.header, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.header?.visible ?? fieldSettings.header.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, header: { ...fs.header, visible: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, header: { ...prev.header, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.header || vacancyHeader} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, header: e.target.value } })); if (office.id === selectedCountryTab) setVacancyHeader(e.target.value) }} placeholder="Введите текст шапки" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.header?.active ?? fieldSettings.header.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Обязанности</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.responsibilities?.active ?? fieldSettings.responsibilities.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, responsibilities: { ...fs.responsibilities, active: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, responsibilities: { ...prev.responsibilities, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.responsibilities?.visible ?? fieldSettings.responsibilities.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, responsibilities: { ...fs.responsibilities, visible: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, responsibilities: { ...prev.responsibilities, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.responsibilities || vacancyResponsibilities} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, responsibilities: e.target.value } })); if (office.id === selectedCountryTab) setVacancyResponsibilities(e.target.value) }} placeholder="Введите обязанности" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.responsibilities?.active ?? fieldSettings.responsibilities.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Пожелания</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.requirements?.active ?? fieldSettings.requirements.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, requirements: { ...fs.requirements, active: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, requirements: { ...prev.requirements, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.requirements?.visible ?? fieldSettings.requirements.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, requirements: { ...fs.requirements, visible: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, requirements: { ...prev.requirements, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.requirements || vacancyRequirements} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, requirements: e.target.value } })); if (office.id === selectedCountryTab) setVacancyRequirements(e.target.value) }} placeholder="Введите пожелания" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.requirements?.active ?? fieldSettings.requirements.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Будет плюсом</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.niceToHave?.active ?? fieldSettings.niceToHave.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, niceToHave: { ...fs.niceToHave, active: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, niceToHave: { ...prev.niceToHave, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.niceToHave?.visible ?? fieldSettings.niceToHave.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, niceToHave: { ...fs.niceToHave, visible: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, niceToHave: { ...prev.niceToHave, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.niceToHave || vacancyNiceToHave} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, niceToHave: e.target.value } })); if (office.id === selectedCountryTab) setVacancyNiceToHave(e.target.value) }} placeholder="Введите что будет плюсом" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.niceToHave?.active ?? fieldSettings.niceToHave.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Условия работы</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.conditions?.active ?? fieldSettings.conditions.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, conditions: { ...fs.conditions, active: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, conditions: { ...prev.conditions, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.conditions?.visible ?? fieldSettings.conditions.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, conditions: { ...fs.conditions, visible: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, conditions: { ...prev.conditions, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.conditions || vacancyConditions} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, conditions: e.target.value } })); if (office.id === selectedCountryTab) setVacancyConditions(e.target.value) }} placeholder="Введите условия работы" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.conditions?.active ?? fieldSettings.conditions.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Завершение</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.closing?.active ?? fieldSettings.closing.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, closing: { ...fs.closing, active: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, closing: { ...prev.closing, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.closing?.visible ?? fieldSettings.closing.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, closing: { ...fs.closing, visible: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, closing: { ...prev.closing, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextArea value={vacancyFieldsByCountry[office.id]?.closing || vacancyClosing} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, closing: e.target.value } })); if (office.id === selectedCountryTab) setVacancyClosing(e.target.value) }} placeholder="Введите завершающий текст" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.closing?.active ?? fieldSettings.closing.active)} style={{ minHeight: '100px' }} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Дополнительная ссылка</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.link?.active ?? fieldSettings.link.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, link: { ...fs.link, active: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, link: { ...prev.link, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.link?.visible ?? fieldSettings.link.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, link: { ...fs.link, visible: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, link: { ...prev.link, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex><TextField.Root value={vacancyFieldsByCountry[office.id]?.link || vacancyLink} onChange={(e) => { const fields = vacancyFieldsByCountry[office.id] || {}; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, link: e.target.value } })); if (office.id === selectedCountryTab) setVacancyLink(e.target.value) }} placeholder="https://example.com/vacancy" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.link?.active ?? fieldSettings.link.active)} /></Box>
                            <Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Вложения</Text><Flex align="center" gap="3"><Flex align="center" gap="2"><Text size="1" color="gray">Активность:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.active ?? fieldSettings.attachment.active} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, attachment: { ...fs.attachment, active: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, attachment: { ...prev.attachment, active: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex><Flex align="center" gap="2"><Text size="1" color="gray">Видимость:</Text><Switch checked={vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.visible ?? fieldSettings.attachment.visible} onCheckedChange={(c) => { const fields = vacancyFieldsByCountry[office.id] || {}; const fs = fields.fieldSettings || fieldSettings; setVacancyFieldsByCountry(prev => ({ ...prev, [office.id]: { ...fields, fieldSettings: { ...fs, attachment: { ...fs.attachment, visible: !!c } } } })); if (office.id === selectedCountryTab) setFieldSettings(prev => ({ ...prev, attachment: { ...prev.attachment, visible: !!c } })) }} disabled={!vacancyActiveByCountry[office.id]} /></Flex></Flex></Flex>
                              <Flex direction="column" gap="2"><input type="file" accept=".docx,.pptx,.figma" onChange={(e) => setVacancyAttachment(e.target.files?.[0] || null)} disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.active ?? fieldSettings.attachment.active)} id={`vacancy-edit-modal-attachment-${office.id}`} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} /><Button asChild variant="soft" disabled={!vacancyActiveByCountry[office.id] || !(vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.active ?? fieldSettings.attachment.active)} style={{ width: '100%', justifyContent: 'flex-start' }}><label htmlFor={`vacancy-edit-modal-attachment-${office.id}`} style={{ cursor: (vacancyActiveByCountry[office.id] && (vacancyFieldsByCountry[office.id]?.fieldSettings?.attachment?.active ?? fieldSettings.attachment.active)) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}><UploadIcon width={16} height={16} /><Text size="2">{vacancyAttachment ? vacancyAttachment.name : 'Выберите файл (docx, pptx, figma)'}</Text></label></Button>{vacancyAttachment && <Flex align="center" gap="2" style={{ padding: '8px 12px', backgroundColor: 'var(--gray-2)', borderRadius: 6 }}><FileTextIcon width={16} height={16} /><Text size="2" style={{ flex: 1 }}>{vacancyAttachment.name}</Text><Text size="1" color="gray">{(vacancyAttachment.size / 1024).toFixed(2)} KB</Text><Button size="1" variant="ghost" color="red" onClick={() => setVacancyAttachment(null)}><Cross2Icon width={14} height={14} /></Button></Flex>}</Flex>
                            </Box>
                          </Flex>
                        </Tabs.Content>
                        )
                      })}
                    </Tabs.Root>
                    )}
                  </Box>
                )}

                {activeTab === 'locations' && (
                  <Box>
                    <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>Локации</Text>
                    <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                      Укажите, где открыта вакансия. Режим «индивидуальные параметры» подразумевает уточнение по странам и площадкам в разделе «Текст вакансии».
                    </Text>
                    <Card style={{ padding: 16 }}>
                      <Flex align="center" justify="between" gap="4" wrap="wrap" mb="4">
                        <Flex align="center" gap="3" style={{ flex: 1, minWidth: 220 }}>
                          <Text size="2" weight={!vacancyLocationsIndividual ? 'medium' : 'regular'} color={!vacancyLocationsIndividual ? undefined : 'gray'}>
                            Везде одинаково
                          </Text>
                          <Switch checked={vacancyLocationsIndividual} onCheckedChange={setVacancyLocationsIndividual} />
                          <Text size="2" weight={vacancyLocationsIndividual ? 'medium' : 'regular'} color={vacancyLocationsIndividual ? undefined : 'gray'}>
                            Индивидуальные параметры
                          </Text>
                        </Flex>
                      </Flex>
                      <Separator size="4" mb="4" />
                      <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Выбранные локации</Text>
                      {vacancyLocationRows.length === 0 ? (
                        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                          Список пуст — добавьте локацию ниже.
                        </Text>
                      ) : (
                        <Box className={styles.locationChipsRow} mb="4">
                          {vacancyLocationRows.map((row) => (
                            <Flex
                              key={row.id}
                              align="center"
                              gap="2"
                              style={{
                                flexShrink: 0,
                                padding: '8px 10px',
                                borderRadius: 6,
                                backgroundColor: 'var(--gray-2)',
                              }}
                            >
                              <Text size="2">{row.label}</Text>
                              <Button
                                size="1"
                                variant="ghost"
                                color="red"
                                type="button"
                                onClick={() => removeLocationRow(row.id)}
                                aria-label={`Удалить ${row.label}`}
                              >
                                <TrashIcon width={14} height={14} />
                              </Button>
                            </Flex>
                          ))}
                        </Box>
                      )}
                      <Flex direction="column" gap="3">
                        <Box>
                          <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Добавить из справочника</Text>
                          <Select.Root
                            value="__none__"
                            onValueChange={(v) => {
                              if (v === '__none__') return
                              addLocationFromCatalog(v)
                            }}
                          >
                            <Select.Trigger placeholder="Выберите локацию" style={{ width: '100%', maxWidth: 320 }} />
                            <Select.Content>
                              <Select.Item value="__none__">—</Select.Item>
                              {LOCATION_CATALOG.filter((c) => !vacancyLocationRows.some((r) => r.id === c.id)).map((c) => (
                                <Select.Item key={c.id} value={c.id}>{c.label}</Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        </Box>
                        <Box>
                          <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Своя локация</Text>
                          <Flex gap="2" wrap="wrap" align="center">
                            <TextField.Root
                              value={newLocationLabel}
                              onChange={(e) => setNewLocationLabel(e.target.value)}
                              placeholder="Например: Краков"
                              style={{ flex: 1, minWidth: 180, maxWidth: 320 }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomLocationRow() } }}
                            />
                            <Button type="button" variant="soft" onClick={addCustomLocationRow}>
                              <PlusIcon width={14} height={14} />
                              <Text size="2">Добавить</Text>
                            </Button>
                          </Flex>
                        </Box>
                      </Flex>
                    </Card>
                  </Box>
                )}
    
                {activeTab === 'recruiters' && (
                  <Box><Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Рекрутеры</Text>
                    <Flex direction="column" gap="3">{allRecruiters.map((r) => {
                      const sel = selectedRecruiters.has(r.id), main = mainRecruiter === r.id
                      return <Card key={r.id} style={{ padding: 16 }}><Flex align="center" gap="3"><Checkbox checked={sel} onCheckedChange={() => handleRecruiterToggle(r.id)} /><Flex direction="column" gap="1" style={{ flex: 1 }}><Flex align="center" gap="2"><Text size="3" weight="medium">{r.name}</Text>{main && <Badge color="blue" variant="soft" size="1">Главный</Badge>}</Flex><Text size="2" color="gray">{r.position}</Text><Text size="1" color="gray">{r.email}</Text><Text size="1" color="gray">{r.phone}</Text></Flex><Box><Text size="1" color="gray" mb="1" style={{ display: 'block', textAlign: 'right' }}>Главный</Text><Switch checked={main} disabled={!sel} onCheckedChange={() => handleMainRecruiterToggle(r.id)} /></Box></Flex></Card>
                    })}</Flex>
                    {allRecruiters.length === 0 && <Text size="2" color="gray" style={{ textAlign: 'center', padding: 40 }}>Нет доступных рекрутеров</Text>}
                  </Box>
                )}
    
                {activeTab === 'customers' && (
                  <Box><Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Заказчики и интервьюеры</Text>
                    <Flex align="center" gap="2" mb="4"><Switch checked={customersOnlyFromDepartment} onCheckedChange={setCustomersOnlyFromDepartment} /><Text size="2">Только из отдела</Text><Text size="1" color="gray">(выкл. — все)</Text></Flex>
                    {(() => {
                      const deptName = getAllDepartmentsFlat(mockDepartments).find(d => d.id === vacancyDepartment)?.name ?? ''
                      const isHR = (d: string) => d === 'HR' || d === 'HR Департамент'
                      const filtered = customersOnlyFromDepartment ? allInterviewers.filter(i => i.department === deptName || isHR(i.department)) : allInterviewers
                      return <Flex direction="column" gap="3">{filtered.map((i) => {
                        const sel = selectedVacancyInterviewers.has(i.id), fin = finalInterviewInterviewers.has(i.id)
                        return <Card key={i.id} style={{ padding: 16 }}><Flex align="center" gap="3"><Checkbox checked={sel} onCheckedChange={() => handleVacancyInterviewerToggle(i.id)} /><Flex direction="column" gap="1" style={{ flex: 1 }}><Flex align="center" gap="2"><Text size="3" weight="medium">{i.name}</Text>{i.isCustomer && <Badge color="blue" variant="soft" size="1">Заказчик</Badge>}{fin && <Badge color="purple" variant="soft" size="1">Финальное интервью</Badge>}</Flex><Text size="2" color="gray">{i.position}</Text><Text size="1" color="gray">{i.department}</Text><Text size="1" color="gray">{i.email}</Text><Text size="1" color="gray">{i.phone}</Text></Flex><Box><Text size="1" color="gray" mb="1" style={{ display: 'block', textAlign: 'right' }}>Финальное интервью</Text><Switch checked={fin} disabled={!sel} onCheckedChange={() => handleFinalInterviewToggle(i.id)} /></Box></Flex></Card>
                      })}{filtered.length === 0 && <Text size="2" color="gray" style={{ textAlign: 'center', padding: 40 }}>Нет доступных интервьюеров</Text>}</Flex>
                    })()}
                  </Box>
                )}
    
                {activeTab === 'questions' && (
                  <Box><Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Вопросы и ссылки</Text><Text size="2" color="gray" mb="4" style={{ display: 'block' }}>Ссылка на вакансию, тогглер использования на сайте и один вопрос на каждую выбранную локацию. В режиме «везде одинаково» — одна карточка (Беларусь). В «индивидуальных параметрах» — отдельная карточка на каждую строку в «Локациях» (включая All world remote). У ссылки и вопроса можно выбрать цвет.</Text>
                    {questionsLinkTargets.length === 0 && vacancyLocationsIndividual ? (
                      <Text size="2" color="gray">Список локаций пуст — добавьте позиции в разделе «Локации».</Text>
                    ) : (
                    <Flex direction="column" gap="4">{questionsLinkTargets.map((t) => {
                      const isActive = vacancyLocationsIndividual
                        ? (vacancyQuestionsActiveByRowId[t.key] ?? true)
                        : (vacancyActiveByCountry[t.key] ?? true)
                      const state = questionsLinksByOffice[t.key] ?? getDefaultOfficeState(), { link, question } = state, q = question ?? { text: '', color: questionLinkColors[0].hex }
                      const hideQuestionsCountryHeading =
                        questionsLinkTargets.length === 1 && !vacancyLocationsIndividual
                      const setActive = (checked: boolean) => {
                        if (vacancyLocationsIndividual) {
                          setVacancyQuestionsActiveByRowId((prev) => ({ ...prev, [t.key]: checked }))
                        } else {
                          setVacancyActiveByCountry((prev) => ({ ...prev, [t.key]: checked }))
                        }
                      }
                      return <Card key={t.key} style={{ padding: 16, opacity: isActive ? 1 : 0.6 }}><Flex direction="column" gap="4">{hideQuestionsCountryHeading ? (
                        <Flex align="center" justify="end" wrap="wrap" gap="2">
                          <Flex align="center" gap="2">
                            <Text size="2" color="gray">Активность:</Text>
                            <Switch checked={isActive} onCheckedChange={(checked) => setActive(checked)} />
                          </Flex>
                        </Flex>
                      ) : (
                        <Flex align="center" justify="between" wrap="wrap" gap="2">
                          <Text size="4" weight="bold" style={{ minWidth: 0 }}>
                            {t.heading}
                          </Text>
                          <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                            <Text size="2" color="gray">Активность:</Text>
                            <Switch checked={isActive} onCheckedChange={(checked) => setActive(checked)} />
                          </Flex>
                        </Flex>
                      )}
                        <Box><Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>Ссылка на вакансию</Text><Flex direction="column" gap="3"><Flex align="center" gap="3" wrap="wrap"><TextField.Root value={link.url} onChange={(e) => updateOfficeLink(t.key, { url: e.target.value })} placeholder="https://example.com/vacancy" style={{ flex: 1, minWidth: 200 }} disabled={!isActive} /><Flex align="center" gap="2"><Text size="2" color="gray">Использовать с сайта:</Text><Switch checked={link.useOnSite} onCheckedChange={(c) => updateOfficeLink(t.key, { useOnSite: !!c })} disabled={!isActive} /></Flex></Flex><Flex align="center" gap="2"><Text size="2" weight="medium">Цвет ссылки:</Text>{questionLinkColors.map((c) => <button key={c.id} type="button" onClick={() => updateOfficeLink(t.key, { color: c.hex })} title={c.label} disabled={!isActive} style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: c.hex, border: link.color === c.hex ? '2px solid var(--gray-12)' : '2px solid transparent', cursor: isActive ? 'pointer' : 'not-allowed', padding: 0, opacity: isActive ? 1 : 0.5 }} aria-pressed={link.color === c.hex} />)}</Flex></Flex></Box>
                        <Separator size="4" /><Box><Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>Вопрос по вакансии</Text><Flex direction="column" gap="2"><TextArea value={q.text} onChange={(e) => updateOfficeQuestion(t.key, { text: e.target.value })} placeholder="Текст вопроса..." style={{ minWidth: '100%', minHeight: 60 }} disabled={!isActive} /><Flex gap="2" align="center"><Text size="2" color="gray">Цвет:</Text>{questionLinkColors.map((c) => <button key={c.id} type="button" onClick={() => updateOfficeQuestion(t.key, { color: c.hex })} title={c.label} disabled={!isActive} style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: c.hex, border: q.color === c.hex ? '2px solid var(--gray-12)' : '2px solid transparent', cursor: isActive ? 'pointer' : 'not-allowed', padding: 0, opacity: isActive ? 1 : 0.5 }} />)}</Flex></Flex></Box></Flex></Card>
                    })}</Flex>
                    )}
                  </Box>
                )}
    
                {activeTab === 'integrations' && (
                  <Box><Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Связи и интеграции</Text><Text size="2" color="gray" mb="4" style={{ display: 'block' }}>Настройка интеграций с внешними сервисами</Text>
                    <Flex direction="column" gap="4"><Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Интеграция</Text><Select.Root value={integrationPartner || '__none__'} onValueChange={(v) => { if (v === '__none__' && integrationPartner === 'huntflow') { toast.showToast({ type: 'warning', title: 'Отключить интеграцию Huntflow?', message: 'Подтвердите отключение связи с Huntflow.', duration: 5 * 60 * 1000, actions: [{ label: 'Подтвердить', onClick: () => { setIntegrationPartner(''); setHuntflowVacancyId('') }, variant: 'soft', color: 'gray' }, { label: 'Отклонить', onClick: () => {}, variant: 'solid', color: 'blue' }] }); return } setIntegrationPartner((v === '__none__' ? '' : v) as '' | 'huntflow') }}><Select.Trigger placeholder="Выберите интеграцию" style={{ width: '100%', maxWidth: 280 }} /><Select.Content><Select.Item value="__none__">—</Select.Item><Select.Item value="huntflow">Huntflow</Select.Item></Select.Content></Select.Root></Box>
                    {integrationPartner === 'huntflow' && <Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>ID вакансии в Huntflow</Text><TextField.Root type="text" inputMode="numeric" value={huntflowVacancyId} onChange={(e) => setHuntflowVacancyId(e.target.value.replace(/\D/g, ''))} placeholder="Только цифры" style={{ width: '100%', maxWidth: 200 }} /></Box>}</Flex>
                  </Box>
                )}
    
                {activeTab === 'statuses' && (
                  <Box><Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Статусы</Text><Text size="2" color="gray" mb="4" style={{ display: 'block' }}>Выберите этапы рекрутинга, которые будут доступны для данной вакансии</Text>
                    <Flex direction="column" gap="3">{recruitmentStages.map((s) => { const act = activeStages.has(s.id); return <Card key={s.id} style={{ padding: 16 }}><Flex align="center" gap="3"><Checkbox checked={act} onCheckedChange={() => handleStageToggle(s.id)} /><Flex align="center" gap="3" style={{ flex: 1 }}><Box style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} /><Flex direction="column" gap="1"><Text size="3" weight="medium">{s.name}</Text>{s.description && <Text size="2" color="gray">{s.description}</Text>}</Flex></Flex></Flex></Card> })}</Flex>
                    {recruitmentStages.length === 0 && <Text size="2" color="gray" style={{ textAlign: 'center', padding: 40 }}>Нет доступных этапов</Text>}
                  </Box>
                )}
    
                {activeTab === 'salary' && (
                  <Box><Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Зарплатные вилки</Text><Text size="2" color="gray" mb="4" style={{ display: 'block' }}>Выберите активные грейды и укажите зарплатные диапазоны. Редактирование доступно только для главной валюты ({companyCurrencies.find(c => c.isMain)?.code || 'BYN'}), остальные пересчитываются автоматически.</Text>
                    <Box className={styles.salaryForksTableWrapper} style={{ overflowX: 'auto', width: '100%' }}><Table.Root style={{ tableLayout: 'fixed', width: 'max-content', maxWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}><Table.Header><Table.Row><Table.ColumnHeaderCell style={{ position: 'sticky', left: 0, backgroundColor: 'var(--gray-2)', zIndex: 10, width: 180, minWidth: 180, maxWidth: 180 }}>Грейд</Table.ColumnHeaderCell>{companyCurrencies.map(cur => <Table.ColumnHeaderCell key={cur.id} style={{ width: cur.isMain ? 260 : 180, minWidth: cur.isMain ? 260 : 180, maxWidth: cur.isMain ? 260 : 180, whiteSpace: 'nowrap', padding: 12 }}><Flex direction="column" gap="1" align="center"><Text weight="bold">{cur.code}</Text>{cur.isMain && <Badge size="1" color="green">Главная</Badge>}<Text size="1" color="gray">{isGrossFormat ? 'Gross' : 'Net'}</Text></Flex></Table.ColumnHeaderCell>)}</Table.Row></Table.Header><Table.Body>{allGrades.map((g) => { const act = activeGrades.has(g.id), mainCur = companyCurrencies.find(c => c.isMain)?.code || 'BYN'; return <Table.Row key={g.id}><Table.Cell style={{ position: 'sticky', left: 0, backgroundColor: 'var(--gray-2)', zIndex: 10, width: 180, minWidth: 180, maxWidth: 180 }}><Flex align="center" gap="2"><Checkbox checked={act} onCheckedChange={() => handleGradeToggle(g.id)} /><Text weight={act ? 'medium' : 'regular'} style={{ opacity: act ? 1 : 0.5 }}>{g.name}</Text></Flex></Table.Cell>{companyCurrencies.map((cur) => { const isMain = cur.isMain, fromV = getSalaryValue(g.id, cur.code, 'from'), toV = getSalaryValue(g.id, cur.code, 'to'); return <Table.Cell key={cur.id} style={{ whiteSpace: 'nowrap', width: isMain ? 260 : 180, minWidth: isMain ? 260 : 180, maxWidth: isMain ? 260 : 180, padding: 12, verticalAlign: 'middle' }}>{act ? (isMain ? <Flex gap="2" align="center" style={{ flexWrap: 'nowrap' }}><input type="number" placeholder="От" value={fromV != null ? String(fromV) : ''} onChange={(e) => handleSalaryChange(g.id, cur.code, 'from', e.target.value)} style={{ minWidth: 100, padding: '4px 8px', fontSize: 13, lineHeight: 1.2, height: '28px', borderRadius: 6, border: '1px solid var(--gray-a6)', backgroundColor: 'var(--color-panel)', color: 'var(--gray-12)', outline: 'none', boxSizing: 'border-box', width: fromV != null ? Math.max(100, String(fromV).length * 8 + 24) : 100 }} /><Text>—</Text><input type="number" placeholder="До" value={toV != null ? String(toV) : ''} onChange={(e) => handleSalaryChange(g.id, cur.code, 'to', e.target.value)} style={{ minWidth: 100, padding: '4px 8px', fontSize: 13, lineHeight: 1.2, height: '28px', borderRadius: 6, border: '1px solid var(--gray-a6)', backgroundColor: 'var(--color-panel)', color: 'var(--gray-12)', outline: 'none', boxSizing: 'border-box', width: toV != null ? Math.max(100, String(toV).length * 8 + 24) : 100 }} /></Flex> : <Text size="2" style={{ whiteSpace: 'nowrap', display: 'block' }}>{fromV != null ? fromV.toFixed(2) : '—'} – {toV != null ? toV.toFixed(2) : '—'}</Text>) : <Text size="2" color="gray">—</Text>}</Table.Cell> })}</Table.Row> })}</Table.Body></Table.Root></Box>
                  </Box>
                )}
    
                {activeTab === 'interviews' && (
                  <Box><Flex align="center" justify="between" mb="4"><Text size="3" weight="bold">Встречи и интервью</Text><Button size="2" variant="soft" onClick={addInterviewMeeting}><PlusIcon width={14} height={14} /><Text size="2">Добавить встречу</Text></Button></Flex><Text size="2" color="gray" mb="4" style={{ display: 'block' }}>Рекомендуемое количество встреч: {maxMeetingsCount} (активные этапы до оффера - 2). Для каждой встречи укажите этап, длительность, заголовок, сопровождающий текст и формат (офис или онлайн). Формат встречи связан с настройками этапа: если для выбранного этапа включено показывание офисов (showOffices = true), то выбор "Офис" активен, а если нет, то по определению ставится "Онлайн" и поле disabled.</Text>
                    {interviewMeetings.length === 0 ? <Card style={{ padding: 24, textAlign: 'center' }}><Text size="2" color="gray">Нет встреч. Добавьте первую встречу.</Text></Card> : <Flex direction="column" gap="4">{interviewMeetings.map((m, i) => {
                      const selectedStage = recruitmentStagesWithMeetings.find(s => s.id === m.stage)
                      const showOfficesForStage = selectedStage?.showOffices ?? false
                      const isFormatDisabled = !showOfficesForStage
                      const currentFormat = isFormatDisabled ? 'online' : (m.format || 'online')
                      return <Card key={m.id} style={{ padding: 16 }}><Flex direction="column" gap="4"><Flex align="center" justify="between"><Text size="3" weight="medium">Встреча {i + 1}</Text>{interviewMeetings.length > 1 && <Button size="1" variant="ghost" color="red" onClick={() => removeInterviewMeeting(m.id)}><TrashIcon width={14} height={14} /></Button>}</Flex><Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Этап</Text><Select.Root value={m.stage} onValueChange={(v) => {
                        const stage = recruitmentStagesWithMeetings.find(s => s.id === v)
                        const showOffices = stage?.showOffices ?? false
                        // Если showOffices = false, автоматически устанавливаем формат "Онлайн"
                        // Если showOffices = true, сохраняем текущий формат или устанавливаем "Онлайн" по умолчанию
                        const newFormat: 'office' | 'online' | '' = showOffices 
                          ? (m.format === 'office' || m.format === 'online' ? m.format : 'online') 
                          : 'online'
                        updateInterviewMeeting(m.id, {
                          stage: v,
                          format: newFormat
                        })
                      }}><Select.Trigger placeholder="Выберите этап" style={{ width: '100%' }} /><Select.Content>{stagesBeforeOffer.map(s => <Select.Item key={s.id} value={s.id}>{s.description || s.name}</Select.Item>)}</Select.Content></Select.Root></Box><Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Длительность встречи (минут)</Text><TextField.Root type="number" value={String(m.duration)} onChange={(e) => updateInterviewMeeting(m.id, { duration: parseInt(e.target.value) || 60 })} placeholder="60" style={{ width: 200 }} /></Box><Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Заголовок названия встречи</Text><TextField.Root value={m.title} onChange={(e) => updateInterviewMeeting(m.id, { title: e.target.value })} placeholder="Например: Техническое интервью - Frontend Developer" style={{ width: '100%' }} /></Box><Box><Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Формат встречи</Text><Text size="1" color="gray" mb="2" style={{ display: 'block' }}>{isFormatDisabled ? 'Для выбранного этапа показывание офисов отключено. Автоматически установлен формат "Онлайн".' : 'Выберите офис или онлайн'}</Text><Select.Root value={currentFormat} onValueChange={(v) => updateInterviewMeeting(m.id, { format: (v || 'online') as 'office' | 'online' | '' })} disabled={isFormatDisabled}><Select.Trigger placeholder={isFormatDisabled ? 'Онлайн (автоматически)' : 'Офис или онлайн'} style={{ width: '100%' }} /><Select.Content><Select.Item value="office">Офис</Select.Item><Select.Item value="online">Онлайн</Select.Item></Select.Content></Select.Root></Box><Box><Flex align="center" justify="between" mb="2"><Text size="2" weight="medium">Сопровождающий текст</Text><DropdownMenu.Root><DropdownMenu.Trigger><Button size="1" variant="ghost"><Text size="1">Подсказки</Text><ChevronDownIcon width={12} height={12} /></Button></DropdownMenu.Trigger><DropdownMenu.Content style={{ minWidth: 260 }}><DropdownMenu.Item onSelect={() => updateInterviewMeeting(m.id, { description: m.description + (m.description ? '\n' : '') + '{{candidate_link}}' })}><Text size="2">Ссылка на кандидата в системе</Text></DropdownMenu.Item><DropdownMenu.Item onSelect={() => updateInterviewMeeting(m.id, { description: m.description + (m.description ? '\n' : '') + '{{external_integration_link}}' })}><Text size="2">Ссылка во внешней интеграции</Text></DropdownMenu.Item>{recruiterContactHints.map(({ label, variable }) => <DropdownMenu.Item key={variable} onSelect={() => updateInterviewMeeting(m.id, { description: m.description + (m.description ? '\n' : '') + `{{${variable}}}` })}><Text size="2">{label}</Text></DropdownMenu.Item>)}<DropdownMenu.Item onSelect={() => updateInterviewMeeting(m.id, { description: m.description + (m.description ? '\n' : '') + '{{office_instructions}}' })}><Text size="2">Инструкции офиса</Text></DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Root></Flex><Text size="1" color="gray" mb="2" style={{ display: 'block' }}>Введите текст, который будет отправлен вместе с приглашением на встречу. Используйте подсказки для вставки шаблонов.</Text><TextArea value={m.description} onChange={(e) => updateInterviewMeeting(m.id, { description: e.target.value })} placeholder="Введите текст приглашения на встречу..." style={{ minHeight: 120, width: '100%' }} /></Box></Flex></Card>
                    })}</Flex>}
                  </Box>
                )}
    
                {activeTab === 'scorecard' && (
                  <Box><Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Scorecard</Text><Flex direction="column" gap="4"><Card style={{ padding: 16 }}><Flex direction="column" gap="3"><Text size="3" weight="medium" mb="2">Ссылка</Text><Flex direction="column" gap="3"><Flex direction="column" gap="2"><Text size="2" weight="medium">Ссылка на Google документ</Text><TextField.Root value={scorecardLinkUrl} onChange={(e) => setScorecardLinkUrl(e.target.value)} placeholder="https://docs.google.com/document/..." style={{ width: '100%' }} /></Flex><Flex direction="column" gap="2"><Text size="2" weight="medium">Название-заголовок</Text><TextField.Root value={scorecardLinkTitle} onChange={(e) => setScorecardLinkTitle(e.target.value)} placeholder="Введите название" style={{ width: '100%' }} /></Flex><Flex direction="column" gap="2"><Text size="2" weight="medium">Место добавления</Text><Select.Root value={scorecardLinkPosition} onValueChange={(v: 'start' | 'end') => setScorecardLinkPosition(v)}><Select.Trigger style={{ width: '100%' }} /><Select.Content><Select.Item value="start">В начале</Select.Item><Select.Item value="end">В конце</Select.Item></Select.Content></Select.Root></Flex></Flex></Flex></Card><Card style={{ padding: 16 }}><Flex direction="column" gap="3"><Text size="3" weight="medium" mb="2">Локальный</Text><Flex direction="column" gap="3"><Flex align="center" gap="2"><Switch checked={scorecardLocalActive} onCheckedChange={setScorecardLocalActive} /><Text size="2">{scorecardLocalActive ? 'Активный' : 'Не активный'}</Text></Flex><Button variant="soft" onClick={() => setScorecardLocalSettingsOpen(true)} disabled={!scorecardLocalActive} style={{ width: 'fit-content' }}><GearIcon width={16} height={16} /><Text size="2">Настройки</Text></Button>{!scorecardLocalActive && <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>В разработке</Text>}</Flex></Flex></Card></Flex>
                    <Dialog.Root open={scorecardLocalSettingsOpen} onOpenChange={setScorecardLocalSettingsOpen}><Dialog.Content style={{ maxWidth: 600 }}><Dialog.Title>Настройки локального Scorecard</Dialog.Title><Dialog.Description size="2" color="gray" mb="4">Настройки локального Scorecard находятся в разработке</Dialog.Description><Flex gap="3" justify="end" mt="4"><Dialog.Close><Button variant="soft">Закрыть</Button></Dialog.Close></Flex></Dialog.Content></Dialog.Root>
                  </Box>
                )}
    
                {activeTab === 'dataProcessing' && (
                  <Box><Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Обработка данных</Text><Flex direction="column" gap="4"><Card style={{ padding: 16 }}><Flex direction="column" gap="3"><Flex align="center" gap="2"><Switch checked={useUnifiedPrompt} onCheckedChange={setUseUnifiedPrompt} /><Text size="2">Использовать единый промпт</Text></Flex><Flex direction="column" gap="2"><Text size="2" weight="medium">Промпт для анализа</Text><TextArea value={analysisPrompt} onChange={(e) => setAnalysisPrompt(e.target.value)} placeholder="Введите промпт для анализа..." disabled={useUnifiedPrompt} style={{ minHeight: 140, width: '100%' }} /></Flex></Flex></Card></Flex></Box>
                )}

                {activeTab === 'additionalFields' && (
                  <Box>
                    <Flex align="start" justify="between" gap="3" wrap="wrap" mb="3">
                      <Text size="3" weight="bold" style={{ display: 'block' }}>Дополнительные поля</Text>
                      <Button asChild variant="soft" size="2">
                        <Link to={COMPANY_CANDIDATE_FIELDS_SETTINGS_PATH}>
                          <Flex align="center" gap="2">
                            <ArrowTopRightIcon width={14} height={14} />
                            <Text size="2">Все доп. поля</Text>
                          </Flex>
                        </Link>
                      </Button>
                    </Flex>
                    <Flex direction="column" gap="4">
                      <Text size="2" color="gray">
                        Поля из справочника компании, которые кандидат заполняет при отклике на эту вакансию. Состав справочника настраивается отдельно; здесь включаются и выключаются поля только для этой вакансии.
                      </Text>
                      <Card style={{ padding: 16 }}>
                        <Flex align="center" justify="between" gap="3" wrap="wrap" mb="3">
                          <Text size="2" weight="medium">Все поля на вакансии</Text>
                          <Flex align="center" gap="2">
                            <Switch
                              checked={allAdditionalFieldsOnVacancy}
                              onCheckedChange={(c) => (c ? enableAllAdditionalFieldsOnVacancy() : disableAllAdditionalFieldsOnVacancy())}
                            />
                          </Flex>
                        </Flex>
                        <Table.Root>
                          <Table.Header>
                            <Table.Row>
                              <Table.ColumnHeaderCell>Поле</Table.ColumnHeaderCell>
                              <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                              <Table.ColumnHeaderCell>На вакансии</Table.ColumnHeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {CANDIDATE_ADDITIONAL_FIELD_ROWS.map((row) => (
                              <Table.Row key={row.id}>
                                <Table.Cell><Text size="2">{row.label}</Text></Table.Cell>
                                <Table.Cell><Text size="2">{row.typeLabel}</Text></Table.Cell>
                                <Table.Cell>
                                  <Switch
                                    checked={vacancyAdditionalFieldEnabled[row.id] ?? false}
                                    onCheckedChange={(c) => setAdditionalFieldOnVacancy(row.id, c)}
                                  />
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table.Root>
                        <Text size="1" color="gray" mt="3" style={{ display: 'block' }}>
                          Новые поля в справочнике появятся здесь после сохранения в настройках компании.
                        </Text>
                      </Card>
                    </Flex>
                  </Box>
                )}
    
                {activeTab === 'automations' && (
                  <Box>
                    <Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>Автоматизации</Text>
                    <Card style={{ padding: 16 }}>
                      <Text size="2" color="gray">
                        Контент раздела будет добавлен позже: триггеры, действия и цепочки, привязанные к этой вакансии.
                      </Text>
                    </Card>
                  </Box>
                )}
    
                {activeTab === 'history' && (
                  <Box><Text size="3" weight="bold" mb="4" style={{ display: 'block' }}>История правок</Text><Flex direction="column" gap="3">{editHistory.length === 0 ? <Text size="2" color="gray" style={{ textAlign: 'center', padding: 40 }}>История правок пуста</Text> : editHistory.map((item) => <Card key={item.id} style={{ padding: 16, cursor: 'pointer' }} onClick={() => setSelectedHistoryItem(item)}><Flex direction="column" gap="2"><Flex align="center" justify="between"><Flex align="center" gap="2"><Badge color="gray" variant="soft">Версия {item.version}</Badge><Text size="2" weight="medium">{item.changes}</Text></Flex><Text size="1" color="gray">{item.date}</Text></Flex><Flex align="center" gap="2"><PersonIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} /><Text size="1" color="gray">{item.user}</Text></Flex></Flex></Card>)}</Flex>
                    <Dialog.Root open={selectedHistoryItem !== null} onOpenChange={(o) => !o && setSelectedHistoryItem(null)}><Dialog.Content style={{ maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>{selectedHistoryItem && (() => { const nextV = editHistory.filter(h => h.version < selectedHistoryItem.version).sort((a, b) => b.version - a.version)[0]; const curT = selectedHistoryItem.fullText || selectedHistoryItem.changes, nextT = nextV?.fullText || nextV?.changes || '', diffT = nextT ? calculateDiff(curT, nextT) : curT; return <><Dialog.Title><Flex direction="column" gap="2"><Text size="4" weight="bold">Версия {selectedHistoryItem.version}</Text><Text size="2" color="gray">{selectedHistoryItem.changes}</Text></Flex></Dialog.Title><Dialog.Description><Flex direction="column" gap="3" mt="4"><Flex align="center" gap="2"><PersonIcon width={16} height={16} /><Text size="2">{selectedHistoryItem.user}</Text><Text size="1" color="gray">•</Text><Text size="1" color="gray">{selectedHistoryItem.date}</Text></Flex>{nextV && <Box style={{ padding: 12, backgroundColor: 'var(--yellow-2)', borderRadius: 6, border: '1px solid var(--yellow-6)' }}><Text size="1" color="gray" mb="2" style={{ display: 'block' }}>Сравнение с версией {nextV.version} от {nextV.date}</Text><Text size="1" style={{ display: 'block' }}><span style={{ textDecoration: 'line-through', backgroundColor: '#fef3c7' }}>Удалено</span> <span style={{ textDecoration: 'underline', backgroundColor: '#fef3c7' }}>Добавлено</span></Text></Box>}<Box style={{ padding: 16, backgroundColor: 'var(--gray-2)', borderRadius: 6, border: '1px solid var(--gray-6)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6, maxHeight: 500, overflow: 'auto' }}><div dangerouslySetInnerHTML={{ __html: diffT.replace(/\n/g, '<br/>') }} /></Box></Flex></Dialog.Description><Flex gap="3" mt="4" justify="end"><Button variant="solid" color="blue" onClick={() => { setVersionToRestore(selectedHistoryItem); setRestoreConfirmationOpen(true) }}>Восстановить версию</Button><Dialog.Close><Button variant="soft" color="gray">Закрыть</Button></Dialog.Close></Flex></> })()}</Dialog.Content></Dialog.Root>
                    <Dialog.Root open={restoreConfirmationOpen} onOpenChange={setRestoreConfirmationOpen}><Dialog.Content style={{ maxWidth: 600 }}><Dialog.Title><Text size="4" weight="bold">Подтверждение восстановления</Text></Dialog.Title><Dialog.Description><Flex direction="column" gap="4" mt="4"><Text size="2">Вы собираетесь восстановить версию {versionToRestore?.version} от {versionToRestore?.date}. Все текущие изменения будут заменены на значения из этой версии.</Text>{versionToRestore?.fieldsState && <><Separator /><Text size="2" weight="bold" mb="2">Будут восстановлены следующие поля:</Text><Box style={{ maxHeight: 300, overflowY: 'auto', padding: 12, backgroundColor: 'var(--gray-2)', borderRadius: 6, border: '1px solid var(--gray-6)' }}><Flex direction="column" gap="2">{Object.entries(versionToRestore.fieldsState?.fieldSettings ?? {}).map(([fk, settings]) => { const fn = getFieldName(fk); const fs = versionToRestore.fieldsState; let fv = ''; if (fk === 'title') fv = fs?.title || ''; else if (fk === 'department') fv = fs?.department || ''; else if (fk === 'header') fv = fs?.header || ''; else if (fk === 'responsibilities') fv = fs?.responsibilities || ''; else if (fk === 'requirements') fv = fs?.requirements || ''; else if (fk === 'niceToHave') fv = fs?.niceToHave || ''; else if (fk === 'conditions') fv = fs?.conditions || ''; else if (fk === 'closing') fv = fs?.closing || ''; else if (fk === 'link') fv = fs?.link || ''; return <Card key={fk} style={{ padding: 12 }}><Flex direction="column" gap="2"><Flex align="center" gap="2"><Text size="2" weight="medium">{fn}</Text><Badge color={settings.active ? 'green' : 'gray'} variant="soft" size="1">{settings.active ? 'Активно' : 'Неактивно'}</Badge><Badge color={settings.visible ? 'blue' : 'gray'} variant="soft" size="1">{settings.visible ? 'Видимо' : 'Скрыто'}</Badge></Flex>{fv && fk !== 'attachment' && <Text size="1" color="gray" style={{ maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fv.length > 100 ? fv.substring(0, 100) + '...' : fv}</Text>}</Flex></Card> })}</Flex></Box><Box style={{ padding: 12, backgroundColor: 'var(--yellow-2)', borderRadius: 6, border: '1px solid var(--yellow-6)' }}><Text size="1" color="gray">⚠️ Восстановление создаст новую версию в истории правок. Текущие несохраненные изменения будут потеряны.</Text></Box></>}</Flex></Dialog.Description><Flex gap="3" mt="4" justify="end"><Button variant="soft" color="gray" onClick={() => { setRestoreConfirmationOpen(false); setVersionToRestore(null) }}>Отмена</Button><Button variant="solid" color="blue" onClick={handleRestoreVersion}>Восстановить</Button></Flex></Dialog.Content></Dialog.Root>
                  </Box>
                )}
              </Box>
  )

  const editFooterFragment = (
    <>
            <Separator size="4" my="3" />
            <Flex justify="between" align="center" gap="3" wrap="wrap" style={{ width: '100%' }}>
              <Box style={{ minWidth: 0 }}>
                {canDeleteVacancy ? (
                  <Button size="3" type="button" variant="soft" color="red" onClick={handleDeleteVacancyClick}>
                    Удалить
                  </Button>
                ) : null}
              </Box>
              <Flex gap="3" justify="end" wrap="wrap" style={{ marginLeft: 'auto' }}>
                <Button size="3" variant="soft" onClick={handleCancel}>Отмена</Button>
                <Button size="3" onClick={handleSave}>Сохранить</Button>
              </Flex>
            </Flex>
    </>
  )

  const showSidebarInModalBody = !(embedded && settingsSidebarHostEl)

  const editModeBodyAndFooter = (
    <>
            <Flex className={styles.body} gap="4">
              {showSidebarInModalBody ? editSidebarNode : null}
              {editMainColumnBox}
            </Flex>
            {editFooterFragment}
    </>
  )

  if (embedded) {
    if (!open) return null
    if (mode !== 'edit') {
      return (
        <Box className={styles.embeddedRoot} p="4">
          <Text size="2" color="gray">Встроенный режим доступен только при редактировании.</Text>
        </Box>
      )
    }
    return (
      <>
        {settingsSidebarHostEl ? createPortal(editSidebarNode, settingsSidebarHostEl) : null}
        <Box className={styles.embeddedRoot}>
          <Flex justify="between" align="center" mb="2" wrap="wrap" gap="2">
            <Flex align="center" gap="2">
              <Text size="5" weight="bold">{vacancy?.title ?? vacancyTitleS ?? vacancyTitle ?? 'Настройки вакансии'}</Text>
              {onVacancyStatusChange && vacancyStatus !== undefined && (
                <Flex align="center" gap="2">
                  <Switch checked={vacancyStatus === 'active'} onCheckedChange={(c) => onVacancyStatusChange(c ? 'active' : 'inactive')} />
                  <Text size="2" color="gray">Активна</Text>
                </Flex>
              )}
            </Flex>
          </Flex>
          <Separator size="4" mb="3" />
          {editModeBodyAndFooter}
        </Box>
      </>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {mode === 'view' ? (
      <Dialog.Content className={styles.dialogContent} style={{ maxWidth: 960, width: '94vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <Flex justify="between" align="center" mb="2">
          <Flex align="center" gap="2">
            <Dialog.Title style={{ marginBottom: 0 }}>{vacancy?.title ?? vacancyTitleS ?? vacancyTitle ?? 'Вакансия'}</Dialog.Title>
            {onVacancyStatusChange && vacancyStatus !== undefined && (
              <Flex align="center" gap="2">
                <Switch checked={vacancyStatus === 'active'} onCheckedChange={(c) => onVacancyStatusChange(c ? 'active' : 'inactive')} />
                <Text size="2" color="gray">Активна</Text>
              </Flex>
            )}
          </Flex>
          <Flex gap="2" align="center">
            <Button size="2" variant="soft" onClick={onSwitchToEdit}>
              <Pencil1Icon width={16} height={16} />
              Редактировать
            </Button>
            <Dialog.Close><Button variant="ghost" size="2" radius="full"><Cross2Icon width={18} height={18} /></Button></Dialog.Close>
          </Flex>
        </Flex>
        <Separator size="4" mb="3" />
        <Flex className={styles.body} gap="4">
          <Flex direction="column" gap="2" className={styles.sidebar}>
            <TextField.Root
              placeholder="Search vacancy-settings..."
              value={vacancySettingsSearchValue}
              onChange={(e) =>
                vacancySearchExternal
                  ? onVacancySettingsSearchExternalChange?.(e.target.value)
                  : setInternalVacancySettingsSearch(e.target.value)
              }
              size="2"
            />
            <Text size="2" weight="medium">Настройки вакансии</Text>
            <Text size="1" weight="medium" color="gray">Разделы настроек</Text>
            {filteredSections.map(({ key, label }) => (
              <Button key={key} variant={activeTab === key ? 'solid' : 'soft'} onClick={() => setTab(key)} style={{ justifyContent: 'flex-start' }}>
                <Text size="2">{label}</Text>
              </Button>
            ))}
          </Flex>
          <Box className={styles.content} style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeTab === 'text' && (
              <>
                <Card style={{ padding: 16 }}>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Основная информация</Text>
                  <Flex direction="column" gap="3">
                    <Box><Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Название</Text><Text size="3" weight="bold">{vacancy?.title ?? vacancyTitleS ?? vacancyTitle ?? VIEW_DUMMY.vacancyTitle}</Text></Box>
                    <Box><Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Рекрутер</Text><Text size="2">{vacancy?.recruiter ?? allRecruiters.find(r => r.id === mainRecruiter)?.name ?? VIEW_DUMMY.recruiterName}</Text></Box>
                    <Box><Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Локации</Text><Text size="2">{vacancy?.locations?.length ? vacancy.locations.join(', ') : VIEW_DUMMY.locations}</Text></Box>
                    <Box><Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Интервьюеры</Text><Text size="2">{vacancy != null ? vacancy.interviewers : selectedVacancyInterviewers.size}</Text></Box>
                    <Box><Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Дата</Text><Text size="2">{vacancy?.date ?? VIEW_DUMMY.date}</Text></Box>
                    {vacancy?.hasWarning && vacancy?.warningText && (
                      <Box style={{ padding: 10, backgroundColor: 'var(--yellow-2)', borderRadius: 6, border: '1px solid var(--yellow-6)' }}>
                        <Flex align="center" gap="2">
                          <ExclamationTriangleIcon width={14} height={14} />
                          <Text size="2" color="amber">{vacancy.warningText}</Text>
                        </Flex>
                      </Box>
                    )}
                    <Box><Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Активность</Text><Badge color={(isPublished || !vacancyHeader) ? 'green' : 'gray'} variant="soft">{(isPublished || !vacancyHeader) ? 'Опубликовано' : 'Не опубликовано'}</Badge></Box>
                  </Flex>
                </Card>
                <Card style={{ padding: 16 }}>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Полное описание</Text>
                  {isPublished && publicationUrl && <Button size="2" variant="soft" mb="3" onClick={() => window.open(publicationUrl!, '_blank')}><GlobeIcon width={16} height={16} /> Открыть на сайте</Button>}
                  <Flex direction="column" gap="3">
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Отдел</Text><Text size="2">{getAllDepartmentsFlat(mockDepartments).find(d => d.id === vacancyDepartment)?.name || VIEW_DUMMY.department}</Text></Box>
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Шапка</Text><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{vacancyHeader || VIEW_DUMMY.header}</Text></Box>
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Обязанности</Text><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{vacancyResponsibilities || VIEW_DUMMY.responsibilities}</Text></Box>
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Требования</Text><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{vacancyRequirements || VIEW_DUMMY.requirements}</Text></Box>
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Будет плюсом</Text><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{vacancyNiceToHave || VIEW_DUMMY.niceToHave}</Text></Box>
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Условия работы</Text><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{vacancyConditions || VIEW_DUMMY.conditions}</Text></Box>
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Завершение</Text><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{vacancyClosing || VIEW_DUMMY.closing}</Text></Box>
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Доп. ссылка</Text><Text size="2">{vacancyLink || VIEW_DUMMY.link}</Text></Box>
                    <Box><Text size="1" color="gray" style={{ display: 'block' }}>Вложение</Text><Text size="2">{vacancyAttachment?.name || VIEW_DUMMY.attachment}</Text></Box>
                  </Flex>
                </Card>
              </>
            )}
            {activeTab === 'locations' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Локации</Text>
                <Box mb="3">
                  <Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Режим</Text>
                  <Text size="2">{vacancyLocationsIndividual ? 'Индивидуальные параметры' : 'Везде одинаково'}</Text>
                </Box>
                <Box>
                  <Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Список</Text>
                  <Text size="2">
                    {vacancyLocationRows.length > 0 ? vacancyLocationRows.map((r) => r.label).join(', ') : '—'}
                  </Text>
                </Box>
              </Card>
            )}
            {activeTab === 'recruiters' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Рекрутеры</Text>
                <Flex direction="column" gap="2">{allRecruiters.filter(r => selectedRecruiters.has(r.id)).map(r => (
                  <Flex key={r.id} align="center" gap="2"><Text size="2">{r.name}</Text>{mainRecruiter === r.id && <Badge color="blue" variant="soft" size="1">Главный</Badge>}<Text size="1" color="gray">{r.position}</Text></Flex>
                ))}</Flex>
                {allRecruiters.filter(r => selectedRecruiters.has(r.id)).length === 0 && (vacancy?.recruiter ? <Text size="2">{vacancy.recruiter}</Text> : <Flex align="center" gap="2"><Text size="2">{VIEW_DUMMY.recruiterName}</Text><Text size="1" color="gray">— {VIEW_DUMMY.recruiterPosition}</Text></Flex>)}
              </Card>
            )}
            {activeTab === 'customers' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Заказчики и интервьюеры</Text>
                <Box mb="3"><Text size="1" color="gray" style={{ display: 'block' }}>Только из отдела</Text><Text size="2">{customersOnlyFromDepartment ? 'Да' : 'Нет (все)'}</Text></Box>
                <Flex direction="column" gap="2">{Array.from(selectedVacancyInterviewers).map(id => { const inv = allInterviewers.find(i => i.id === id); if (!inv) return null; const fin = finalInterviewInterviewers.has(id); return <Flex key={id} align="center" gap="2" wrap="wrap"><Text size="2">{inv.name}</Text>{inv.isCustomer && <Badge color="blue" variant="soft" size="1">Заказчик</Badge>}{fin && <Badge color="purple" variant="soft" size="1">Финальное интервью</Badge>}</Flex>})}</Flex>
                {selectedVacancyInterviewers.size === 0 && <Flex align="center" gap="2"><Text size="2">{VIEW_DUMMY.interviewerName}</Text><Text size="1" color="gray">— {VIEW_DUMMY.interviewerPosition}</Text></Flex>}
              </Card>
            )}
            {activeTab === 'questions' && (
              <>
                <Card style={{ padding: 16 }}>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Ссылки</Text>
                  <Flex direction="column" gap="1">{vacancyLink && <a href={vacancyLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-11)' }}><Text size="2">{vacancyLink}</Text></a>}{questionsLinkTargets.map((o) => { const l = questionsLinksByOffice[o.key]?.link; if (!l?.url) return null; return <a key={o.key} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-11)' }}><Text size="2">{o.heading}: {l.url}</Text></a> })}</Flex>
                  {!vacancyLink && !questionsLinkTargets.some((o) => questionsLinksByOffice[o.key]?.link?.url) && <a href={VIEW_DUMMY.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-11)' }}><Text size="2">{VIEW_DUMMY.link}</Text></a>}
                </Card>
                <Card style={{ padding: 16 }}>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Вопросы</Text>
                  {questionsLinkTargets.map((o) => { const q = questionsLinksByOffice[o.key]?.question?.text; return <Box key={o.key} mb="2"><Text size="1" color="gray">{o.heading}</Text><Text size="2">{q || VIEW_DUMMY.officeQuestion}</Text></Box> })}
                </Card>
              </>
            )}
            {activeTab === 'integrations' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Связи и интеграции</Text>
                <Flex direction="column" gap="3">
                  <Box><Text size="1" color="gray" mb="1" style={{ display: 'block' }}>Связи с интеграциями</Text><Text size="2">{integrationPartner === 'huntflow' ? `Huntflow${huntflowVacancyId ? ` (ID: ${huntflowVacancyId})` : ''}` : VIEW_DUMMY.integration}</Text></Box>
                  <Box><Text size="1" color="gray" mb="2" style={{ display: 'block' }}>Доступные офисы</Text>{questionsLinkTargets.map((office) => { const s = questionsLinksByOffice[office.key] ?? getDefaultOfficeState(); const l = s.link, q = s.question ?? { text: '', color: '' }; return <Box key={office.key} mb="2"><Text size="2" weight="medium">{office.heading}</Text><Text size="1" color="gray" style={{ display: 'block' }}>Ссылка: {l?.url || VIEW_DUMMY.officeLink}; с сайта: {(l?.url ? l.useOnSite : VIEW_DUMMY.officeUseOnSite) ? 'да' : 'нет'}</Text><Text size="1" color="gray" style={{ display: 'block' }}>Вопрос: {q?.text || VIEW_DUMMY.officeQuestion}</Text></Box> })}</Box>
                </Flex>
              </Card>
            )}
            {activeTab === 'statuses' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>Переходы по этапам</Text>
                <Text size="2" style={{ whiteSpace: 'nowrap', overflowX: 'auto', display: 'block' }}>{recruitmentStages.filter(s => activeStages.has(s.id)).map(s => s.name).join(' → ') || VIEW_DUMMY.stagesChain}</Text>
              </Card>
            )}
            {activeTab === 'salary' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Зарплатные вилки</Text>
                <Text size="1" color="gray" mb="2" style={{ display: 'block' }}>{isGrossFormat ? 'Gross' : 'Net'}</Text>
                <Box className={styles.salaryForksTableWrapper} style={{ overflowX: 'auto' }}><Table.Root style={{ tableLayout: 'fixed', width: 'max-content', maxWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}><Table.Header><Table.Row><Table.ColumnHeaderCell style={{ width: 100, padding: 8 }}>Грейд</Table.ColumnHeaderCell>{companyCurrencies.map(c => <Table.ColumnHeaderCell key={c.id} style={{ padding: 8 }}>{c.code}</Table.ColumnHeaderCell>)}</Table.Row></Table.Header><Table.Body>{allGrades.map(g => { const act = activeGrades.has(g.id); return <Table.Row key={g.id}><Table.Cell style={{ padding: 8 }}><Text size="2" weight={act ? 'medium' : 'regular'} style={{ opacity: act ? 1 : 0.6 }}>{g.name}</Text></Table.Cell>{companyCurrencies.map(cur => { const fromV = getSalaryValue(g.id, cur.code, 'from'), toV = getSalaryValue(g.id, cur.code, 'to'); return <Table.Cell key={cur.id} style={{ padding: 8 }}><Text size="2">{act ? `${fromV != null ? fromV.toFixed(2) : '—'} – ${toV != null ? toV.toFixed(2) : '—'}` : '—'}</Text></Table.Cell>})}</Table.Row>})}</Table.Body></Table.Root></Box>
              </Card>
            )}
            {activeTab === 'interviews' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Встречи и интервью</Text>
                {interviewMeetings.length === 0 ? (
                  <Box style={{ padding: 12, backgroundColor: 'var(--gray-2)', borderRadius: 8, border: '1px solid var(--gray-6)' }}>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Встреча 1</Text>
                    <Flex direction="column" gap="2">
                      <Box><Text size="1" color="gray" style={{ display: 'block' }}>Этап</Text><Text size="2">{VIEW_DUMMY.meetingStage}</Text></Box>
                      <Box><Text size="1" color="gray" style={{ display: 'block' }}>Длительность</Text><Text size="2">{VIEW_DUMMY.meetingDuration} мин</Text></Box>
                      <Box><Text size="1" color="gray" style={{ display: 'block' }}>Заголовок</Text><Text size="2">{VIEW_DUMMY.meetingTitle}</Text></Box>
                      <Box><Text size="1" color="gray" style={{ display: 'block' }}>Сопровождающий текст</Text><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{VIEW_DUMMY.meetingDescription}</Text></Box>
                      <Box><Text size="1" color="gray" style={{ display: 'block' }}>Формат</Text><Text size="2">Онлайн</Text></Box>
                    </Flex>
                  </Box>
                ) : (
                  <Flex direction="column" gap="4">{interviewMeetings.map((m, i) => (
                    <Box key={m.id} style={{ padding: 12, backgroundColor: 'var(--gray-2)', borderRadius: 8, border: '1px solid var(--gray-6)' }}>
                      <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Встреча {i + 1}</Text>
                      <Flex direction="column" gap="2">
                        <Box><Text size="1" color="gray" style={{ display: 'block' }}>Этап</Text><Text size="2">{m.stage ? (recruitmentStages.find(s => s.id === m.stage)?.name || m.stage) : VIEW_DUMMY.meetingStage}</Text></Box>
                        <Box><Text size="1" color="gray" style={{ display: 'block' }}>Длительность</Text><Text size="2">{m.duration} мин</Text></Box>
                        <Box><Text size="1" color="gray" style={{ display: 'block' }}>Заголовок</Text><Text size="2">{m.title || VIEW_DUMMY.meetingTitle}</Text></Box>
                        <Box><Text size="1" color="gray" style={{ display: 'block' }}>Сопровождающий текст</Text><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{m.description || VIEW_DUMMY.meetingDescription}</Text></Box>
                        <Box><Text size="1" color="gray" style={{ display: 'block' }}>Формат</Text><Text size="2">{m.format === 'office' ? 'Офис' : m.format === 'online' ? 'Онлайн' : 'Онлайн'}</Text></Box>
                      </Flex>
                    </Box>
                  ))}</Flex>
                )}
              </Card>
            )}
            {activeTab === 'scorecard' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Scorecard</Text>
                <Flex direction="column" gap="2">
                  {scorecardLinkUrl && <a href={scorecardLinkUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-11)' }}><Text size="2">{scorecardLinkTitle || scorecardLinkUrl}</Text></a>}
                  <Text size="2">Название: {scorecardLinkTitle || scorecardLinkUrl || VIEW_DUMMY.scorecardTitle}; место: {scorecardLinkPosition === 'start' ? 'В начале' : 'В конце'}; локальный: {(scorecardLinkUrl || scorecardLinkTitle) ? (scorecardLocalActive ? 'Активный' : 'Не активный') : (VIEW_DUMMY.scorecardLocal ? 'Активный' : 'Не активный')}</Text>
                </Flex>
              </Card>
            )}
            {activeTab === 'dataProcessing' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Промпт для анализа</Text>
                <Text size="2">Единый промпт: {useUnifiedPrompt ? 'да' : 'нет'}</Text>
                {(!useUnifiedPrompt || !analysisPrompt) && <Box mt="2"><Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{analysisPrompt || VIEW_DUMMY.analysisPrompt}</Text></Box>}
              </Card>
            )}
            {activeTab === 'additionalFields' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Дополнительные поля</Text>
                <Text size="2" color="gray" mb="3">
                  Справочник:{' '}
                  <Text size="2" asChild>
                    <Link to={COMPANY_CANDIDATE_FIELDS_SETTINGS_PATH} style={{ color: 'var(--accent-11)' }}>
                      настройки полей кандидатов
                    </Link>
                  </Text>
                </Text>
                <Flex direction="column" gap="2">
                  {CANDIDATE_ADDITIONAL_FIELD_ROWS.map((row) => (
                    <Text size="2" key={row.id}>
                      {row.label}: {vacancyAdditionalFieldEnabled[row.id] ? 'включено для вакансии' : 'выключено для вакансии'}
                    </Text>
                  ))}
                </Flex>
              </Card>
            )}
            {activeTab === 'automations' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>Автоматизации</Text>
                <Text size="2" color="gray">
                  Раздел в разработке. Здесь появятся сценарии и правила автоматизации для этой вакансии.
                </Text>
              </Card>
            )}
            {activeTab === 'history' && (
              <Card style={{ padding: 16 }}>
                <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>История правок</Text>
                {editHistory.length === 0 ? (
                  <Box style={{ padding: 10, backgroundColor: 'var(--gray-2)', borderRadius: 6, border: '1px solid var(--gray-6)' }}>
                    <Flex justify="between" align="start" gap="2"><Text size="2" weight="medium">{VIEW_DUMMY.historyChange}</Text><Text size="1" color="gray">{VIEW_DUMMY.historyDate}</Text></Flex>
                    <Flex align="center" gap="2"><PersonIcon width={12} height={12} style={{ color: 'var(--gray-9)' }} /><Text size="1" color="gray">{VIEW_DUMMY.historyUser}</Text></Flex>
                  </Box>
                ) : (
                  <Flex direction="column" gap="2">{editHistory.slice(0, 5).map(item => (
                    <Box key={item.id} style={{ padding: 10, backgroundColor: 'var(--gray-2)', borderRadius: 6, border: '1px solid var(--gray-6)' }}>
                      <Flex justify="between" align="start" gap="2"><Text size="2" weight="medium">{item.changes}</Text><Text size="1" color="gray">{item.date}</Text></Flex>
                      <Flex align="center" gap="2"><PersonIcon width={12} height={12} style={{ color: 'var(--gray-9)' }} /><Text size="1" color="gray">{item.user}</Text></Flex>
                    </Box>
                  ))}</Flex>
                )}
                {editHistory.length > 5 && <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>Всего версий: {editHistory.length}</Text>}
              </Card>
            )}
          </Box>
        </Flex>
      </Dialog.Content>
      ) : (
      <Dialog.Content className={styles.dialogContent}>
        <Flex justify="between" align="center" mb="2">
          <Flex align="center" gap="2">
            <Dialog.Title style={{ marginBottom: 0 }}>{vacancy?.title ?? vacancyTitleS ?? vacancyTitle ?? 'Настройки вакансии'}</Dialog.Title>
            {onVacancyStatusChange && vacancyStatus !== undefined && (
              <Flex align="center" gap="2">
                <Switch checked={vacancyStatus === 'active'} onCheckedChange={(c) => onVacancyStatusChange(c ? 'active' : 'inactive')} />
                <Text size="2" color="gray">Активна</Text>
              </Flex>
            )}
          </Flex>
          <Dialog.Close>
            <Button variant="ghost" size="2" radius="full">
              <Cross2Icon width={18} height={18} />
            </Button>
          </Dialog.Close>
        </Flex>
        <Separator size="4" mb="3" />

        {editModeBodyAndFooter}
      </Dialog.Content>
      )}
    </Dialog.Root>
  )
}
