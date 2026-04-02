import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  TextField,
  TextArea,
  Select,
  Switch,
  Tabs,
  Card,
  Dialog,
  Checkbox,
  Table,
  Badge,
  DropdownMenu,
} from '@radix-ui/themes'
import {
  GlobeIcon,
  CheckCircledIcon,
  PlusIcon,
  TrashIcon,
  GearIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons'

const OFFICES = [
  { id: 'by', name: 'Беларусь' },
  { id: 'pl', name: 'Польша' },
]

/** Подсказки для вставки в сопровождающий текст приглашения на встречу */
const RECRUITER_CONTACT_HINTS = [
  { label: 'Телефон', variable: 'recruiter_phone' },
  { label: 'Email', variable: 'recruiter_email' },
  { label: 'LinkedIn', variable: 'recruiter_linkedin' },
  { label: 'Telegram', variable: 'recruiter_telegram' },
] as const

const MOCK_DEPARTMENTS = [
  { id: '1', name: 'Разработка', level: 0 },
  { id: '2', name: 'Рекрутинг', level: 0 },
  { id: '3', name: 'Frontend', level: 1 },
  { id: '4', name: 'Backend', level: 1 },
]

const LINK_COLORS = [
  { id: 'blue', hex: '#3B82F6', label: 'Синий' },
  { id: 'green', hex: '#10B981', label: 'Зелёный' },
  { id: 'amber', hex: '#F59E0B', label: 'Янтарный' },
  { id: 'red', hex: '#EF4444', label: 'Красный' },
  { id: 'violet', hex: '#8B5CF6', label: 'Фиолетовый' },
  { id: 'cyan', hex: '#06B6D4', label: 'Бирюзовый' },
  { id: 'gray', hex: '#6B7280', label: 'Серый' },
]

const RECRUITMENT_STAGES = [
  { id: 'new', name: 'New', description: 'Новый кандидат', color: '#2180A0' },
  { id: 'under-review', name: 'Under Review', description: 'На рассмотрении', color: '#3B82F6' },
  { id: 'message', name: 'Message', description: 'Сообщение', color: '#6366F1' },
  { id: 'contact', name: 'Contact', description: 'Контакт', color: '#8B5CF6' },
  { id: 'hr-screening', name: 'HR Screening', description: 'HR скрининг', color: '#A855F7' },
  { id: 'test-task', name: 'Test Task', description: 'Тестовое задание', color: '#C084FC' },
  { id: 'interview', name: 'Interview', description: 'Интервью', color: '#8B5CF6' },
  { id: 'offer', name: 'Offer', description: 'Предложение', color: '#22C55E' },
  { id: 'accepted', name: 'Accepted', description: 'Принят', color: '#10B981' },
  { id: 'rejected', name: 'Rejected', description: 'Отказ', color: '#EF4444' },
  { id: 'declined', name: 'Declined', description: 'Отклонено кандидатом', color: '#F59E0B' },
  { id: 'archived', name: 'Archived', description: 'Архив', color: '#6B7280' },
]

const SALARY_GRADES = [
  { id: '1', name: 'Trainee', order: 1 },
  { id: '2', name: 'Junior-', order: 2 },
  { id: '3', name: 'Junior', order: 3 },
  { id: '4', name: 'Junior+', order: 4 },
  { id: '5', name: 'Middle-', order: 5 },
  { id: '6', name: 'Middle', order: 6 },
  { id: '7', name: 'Middle+', order: 7 },
  { id: '8', name: 'Senior-', order: 8 },
  { id: '9', name: 'Senior', order: 9 },
  { id: '10', name: 'Senior+', order: 10 },
  { id: '11', name: 'Lead', order: 11 },
  { id: '12', name: 'Lead+', order: 12 },
  { id: '13', name: 'Head', order: 13 },
  { id: '14', name: 'C-Level', order: 14 },
]

const COMPANY_CURRENCIES = [
  { id: '1', code: 'BYN', name: 'Белорусский рубль', isMain: true, order: 1 },
  { id: '2', code: 'USD', name: 'Доллар США', isMain: false, order: 2 },
  { id: '3', code: 'EUR', name: 'Евро', isMain: false, order: 3 },
  { id: '4', code: 'PLN', name: 'Польский злотый', isMain: false, order: 4 },
]

/** Курсы валют для пересчёта (единица главной валюты = rate единиц данной) */
const CURRENCY_RATES: Record<string, number> = {
  BYN: 1,
  USD: 3.25,
  EUR: 3.46,
  PLN: 0.85,
}

const MOCK_RECRUITERS = [
  { id: '1', name: 'Иван Иванов', position: 'Senior Recruiter', email: 'ivan@company.com', phone: '+7 (999) 111-22-33' },
  { id: '2', name: 'Петр Петров', position: 'Recruiter', email: 'petr@company.com', phone: '+7 (999) 222-33-44' },
  { id: '3', name: 'Мария Сидорова', position: 'Lead Recruiter', email: 'maria@company.com', phone: '+7 (999) 333-44-55' },
]

const MOCK_INTERVIEWERS = [
  { id: '1', name: 'Елена Волкова', position: 'HR Manager', department: 'HR', email: 'elena@company.com', phone: '+7 (999) 222-33-44', isCustomer: true, interviewType: 'Финальное интервью' },
  { id: '2', name: 'Алексей Козлов', position: 'Tech Lead', department: 'Разработка', email: 'alexey@company.com', phone: '+7 (999) 111-22-33', isCustomer: false, interviewType: 'Финальное интервью' },
  { id: '3', name: 'Мария Петрова', position: 'Product Manager', department: 'Продукт', email: 'maria@company.com', phone: '+7 (999) 333-44-55', isCustomer: true, interviewType: 'Финальное интервью' },
  { id: '4', name: 'Дмитрий Сидоров', position: 'Backend Lead', department: 'Разработка', email: 'dmitry@company.com', phone: '+7 (999) 444-55-66', isCustomer: false, interviewType: 'Техническое интервью' },
  { id: '5', name: 'Ольга Новикова', position: 'Design Lead', department: 'Дизайн', email: 'olga@company.com', phone: '+7 (999) 555-66-77', isCustomer: false, interviewType: 'Финальное интервью' },
]

/** Отдел текущей вакансии для фильтра «Только из отдела» */
const VACANCY_DEPARTMENT = 'Разработка'

export type VacancySettingTab =
  | 'text'
  | 'recruiters'
  | 'customers'
  | 'questions'
  | 'integrations'
  | 'statuses'
  | 'salary'
  | 'interviews'
  | 'scorecard'
  | 'dataProcessing'

interface VacancySettingsFormsProps {
  tab: VacancySettingTab
  vacancyTitle: string
}

export function VacancySettingsForms({ tab, vacancyTitle }: VacancySettingsFormsProps) {
  const [isPublished, setIsPublished] = useState(false)
  const [publicationUrl, setPublicationUrl] = useState<string | null>(null)
  const [publishButtonHover, setPublishButtonHover] = useState(false)
  const [selectedCountryTab, setSelectedCountryTab] = useState(OFFICES[0]?.id ?? 'by')
  const [vacancyActiveByCountry, setVacancyActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [titleByCountry, setTitleByCountry] = useState<Record<string, string>>({})
  const [departmentByCountry, setDepartmentByCountry] = useState<Record<string, string>>({})
  const [headerActiveByCountry, setHeaderActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [headerVisibleByCountry, setHeaderVisibleByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [headerByCountry, setHeaderByCountry] = useState<Record<string, string>>({})
  const [responsibilitiesByCountry, setResponsibilitiesByCountry] = useState<Record<string, string>>({})
  const [responsibilitiesActiveByCountry, setResponsibilitiesActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [responsibilitiesVisibleByCountry, setResponsibilitiesVisibleByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [requirementsByCountry, setRequirementsByCountry] = useState<Record<string, string>>({})
  const [requirementsActiveByCountry, setRequirementsActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [requirementsVisibleByCountry, setRequirementsVisibleByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [niceToHaveByCountry, setNiceToHaveByCountry] = useState<Record<string, string>>({})
  const [niceToHaveActiveByCountry, setNiceToHaveActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [niceToHaveVisibleByCountry, setNiceToHaveVisibleByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [conditionsByCountry, setConditionsByCountry] = useState<Record<string, string>>({})
  const [conditionsActiveByCountry, setConditionsActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [conditionsVisibleByCountry, setConditionsVisibleByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [closingByCountry, setClosingByCountry] = useState<Record<string, string>>({})
  const [closingActiveByCountry, setClosingActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [closingVisibleByCountry, setClosingVisibleByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [linkByCountry, setLinkByCountry] = useState<Record<string, string>>({})
  const [linkActiveByCountry, setLinkActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [linkVisibleByCountry, setLinkVisibleByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [attachmentActiveByCountry, setAttachmentActiveByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [attachmentVisibleByCountry, setAttachmentVisibleByCountry] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, true]))
  )
  const [vacancyAttachment, setVacancyAttachment] = useState<File | null>(null)
  const [questionsLinkByOffice, setQuestionsLinkByOffice] = useState<
    Record<string, { url: string; useOnSite: boolean; color: string }>
  >(() => Object.fromEntries(OFFICES.map((o) => [o.id, { url: '', useOnSite: false, color: LINK_COLORS[0].hex }])))
  const [questionTextByOffice, setQuestionTextByOffice] = useState<Record<string, string>>({})
  const [questionColorByOffice, setQuestionColorByOffice] = useState<Record<string, string>>(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, LINK_COLORS[0].hex]))
  )
  const [selectedStages, setSelectedStages] = useState<Set<string>>(() => new Set(RECRUITMENT_STAGES.map((s) => s.id)))
  const [activeGrades, setActiveGrades] = useState<Set<string>>(new Set(['3', '6', '9', '11']))
  type SalaryRanges = Record<string, Record<string, { from: number | null; to: number | null }>>
  const [salaryRanges, setSalaryRanges] = useState<SalaryRanges>({
    '3': {
      BYN: { from: 1000, to: 2000 },
      USD: { from: null, to: null },
      EUR: { from: null, to: null },
      PLN: { from: null, to: null },
    },
    '6': {
      BYN: { from: 2000, to: 3500 },
      USD: { from: null, to: null },
      EUR: { from: null, to: null },
      PLN: { from: null, to: null },
    },
    '9': {
      BYN: { from: 3500, to: 5000 },
      USD: { from: null, to: null },
      EUR: { from: null, to: null },
      PLN: { from: null, to: null },
    },
    '11': {
      BYN: { from: 5000, to: 7000 },
      USD: { from: null, to: null },
      EUR: { from: null, to: null },
      PLN: { from: null, to: null },
    },
  })
  const [selectedRecruiters, setSelectedRecruiters] = useState<Set<string>>(new Set(['1']))
  const [mainRecruiter, setMainRecruiter] = useState<string>('1')
  const [customersOnlyFromDepartment, setCustomersOnlyFromDepartment] = useState(true)
  const [selectedVacancyInterviewers, setSelectedVacancyInterviewers] = useState<Set<string>>(new Set(['1']))
  const [finalInterviewInterviewers, setFinalInterviewInterviewers] = useState<Set<string>>(new Set(['1', '2']))
  const [integrationPartner, setIntegrationPartner] = useState<string>('')
  const [huntflowVacancyId, setHuntflowVacancyId] = useState('')
  const [useUnifiedPrompt, setUseUnifiedPrompt] = useState(true)
  const [analysisPrompt, setAnalysisPrompt] = useState('')
  const [scorecardLinkUrl, setScorecardLinkUrl] = useState('')
  const [scorecardLinkTitle, setScorecardLinkTitle] = useState('')
  const [scorecardLinkPosition, setScorecardLinkPosition] = useState<'start' | 'end'>('start')
  const [scorecardLocalActive, setScorecardLocalActive] = useState(false)
  const [scorecardLocalSettingsOpen, setScorecardLocalSettingsOpen] = useState(false)
  interface InterviewMeeting {
    id: string
    stage: string
    duration: number
    title: string
    format: 'office' | 'online'
    description: string
  }
  const [interviewMeetings, setInterviewMeetings] = useState<InterviewMeeting[]>([])
  const MEETING_STAGES = [
    { id: 'screening', name: 'HR Screening' },
    { id: 'interview', name: 'Interview' },
  ]

  const addInterviewMeeting = () => {
    setInterviewMeetings((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        stage: MEETING_STAGES[0]?.id ?? 'screening',
        duration: 60,
        title: '',
        format: 'online',
        description: '',
      },
    ])
  }
  const removeInterviewMeeting = (id: string) => {
    setInterviewMeetings((prev) => prev.filter((m) => m.id !== id))
  }
  const updateInterviewMeeting = (id: string, patch: Partial<InterviewMeeting>) => {
    setInterviewMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    )
  }

  const toggleStage = (stageId: string) => {
    setSelectedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stageId)) next.delete(stageId)
      else next.add(stageId)
      return next
    })
  }
  const handleGradeToggle = (gradeId: string) => {
    setActiveGrades((prev) => {
      const next = new Set(prev)
      if (next.has(gradeId)) {
        next.delete(gradeId)
        setSalaryRanges((r) => {
          const nextRanges = { ...r }
          delete nextRanges[gradeId]
          return nextRanges
        })
      } else {
        next.add(gradeId)
        const mainCurrency = COMPANY_CURRENCIES.find((c) => c.isMain)?.code ?? 'BYN'
        setSalaryRanges((r) => ({
          ...r,
          [gradeId]: {
            [mainCurrency]: { from: null, to: null },
            ...COMPANY_CURRENCIES.filter((c) => !c.isMain).reduce<Record<string, { from: number | null; to: number | null }>>(
              (acc, curr) => {
                acc[curr.code] = { from: null, to: null }
                return acc
              },
              {}
            ),
          },
        }))
      }
      return next
    })
  }
  const getSalaryValue = (gradeId: string, currencyCode: string, field: 'from' | 'to'): number | null => {
    if (field === 'from' && !salaryRanges[gradeId]?.[currencyCode]?.from) {
      const currentGrade = SALARY_GRADES.find((g) => g.id === gradeId)
      if (currentGrade) {
        const prevGrade = SALARY_GRADES.filter(
          (g) => g.order < currentGrade.order && activeGrades.has(g.id)
        ).sort((a, b) => b.order - a.order)[0]
        if (prevGrade && salaryRanges[prevGrade.id]?.[currencyCode]?.to != null) {
          return salaryRanges[prevGrade.id][currencyCode].to
        }
      }
      return 0
    }
    return salaryRanges[gradeId]?.[currencyCode]?.[field] ?? null
  }
  const handleSalaryChange = (gradeId: string, currencyCode: string, field: 'from' | 'to', value: string) => {
    const mainCurrency = COMPANY_CURRENCIES.find((c) => c.isMain)?.code ?? 'BYN'
    const numValue = value === '' ? null : parseFloat(value)
    if (value !== '' && Number.isNaN(numValue as number)) return

    setSalaryRanges((prev: SalaryRanges) => {
      const newRanges = { ...prev }
      if (!newRanges[gradeId]) newRanges[gradeId] = {}
      if (!newRanges[gradeId][currencyCode]) newRanges[gradeId][currencyCode] = { from: null, to: null }
      newRanges[gradeId][currencyCode][field] = numValue

      if (currencyCode === mainCurrency && numValue !== null) {
        const mainRate = CURRENCY_RATES[mainCurrency] ?? 1
        COMPANY_CURRENCIES.filter((c) => !c.isMain).forEach((currency) => {
          if (!newRanges[gradeId][currency.code]) {
            newRanges[gradeId][currency.code] = { from: null, to: null }
          }
          const rate = CURRENCY_RATES[currency.code] ?? 1
          const convertedValue = (numValue * mainRate) / rate
          if (field === 'from') {
            newRanges[gradeId][currency.code].from = Math.round(convertedValue * 100) / 100
          } else {
            newRanges[gradeId][currency.code].to = Math.round(convertedValue * 100) / 100
          }
        })
      }
      return newRanges
    })
  }
  const handleRecruiterToggle = (id: string) => {
    setSelectedRecruiters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const handleMainRecruiterToggle = (id: string) => {
    setMainRecruiter((prev) => (prev === id ? '' : id))
  }
  const handleInterviewerToggle = (id: string) => {
    setSelectedVacancyInterviewers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const handleFinalInterviewToggle = (id: string) => {
    setFinalInterviewInterviewers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (tab === 'text') {
    return (
      <Box>
        <Flex align="center" justify="between" mb="4">
          <Text size="4" weight="bold">
            Текст вакансии
          </Text>
          <Flex align="center" gap="2">
            {isPublished && publicationUrl && (
              <Button variant="soft" size="2" onClick={() => window.open(publicationUrl ?? undefined, '_blank')}>
                <GlobeIcon width={16} height={16} />
                Открыть на сайте
              </Button>
            )}
            <Button
              variant={isPublished ? 'solid' : 'soft'}
              color={isPublished && publishButtonHover ? 'red' : isPublished ? 'green' : 'gray'}
              size="2"
              onClick={() => {
                if (!isPublished) {
                  const url = `https://company.com/vacancies/${(vacancyTitle || 'vacancy').toLowerCase().replace(/\s+/g, '-')}`
                  setPublicationUrl(url)
                  setIsPublished(true)
                } else {
                  setPublicationUrl(null)
                  setIsPublished(false)
                }
              }}
              onMouseEnter={() => setPublishButtonHover(true)}
              onMouseLeave={() => setPublishButtonHover(false)}
              style={{
                transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
              }}
            >
              {isPublished ? (
                <>
                  <CheckCircledIcon width={16} height={16} />
                  {publishButtonHover ? 'Снять с публикации' : 'Опубликовано'}
                </>
              ) : (
                <>
                  <GlobeIcon width={16} height={16} />
                  Опубликовать на сайте
                </>
              )}
            </Button>
          </Flex>
        </Flex>

        <Tabs.Root value={selectedCountryTab} onValueChange={setSelectedCountryTab} mb="4">
          <Tabs.List>
            {OFFICES.map((office) => (
              <Tabs.Trigger key={office.id} value={office.id}>
                {office.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {OFFICES.map((office) => (
            <Tabs.Content key={office.id} value={office.id}>
              <Flex align="center" justify="between" mb="3">
                <Text size="2" color="gray">
                  Настройки для {office.name}
                </Text>
                <Flex align="center" gap="2">
                  <Text size="2" color="gray">
                    Активность:
                  </Text>
                  <Switch
                    checked={vacancyActiveByCountry[office.id] ?? false}
                    onCheckedChange={(checked) =>
                      setVacancyActiveByCountry((prev) => ({ ...prev, [office.id]: checked }))
                    }
                  />
                </Flex>
              </Flex>
              <Flex direction="column" gap="4">
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Название
                  </Text>
                  <TextField.Root
                    value={titleByCountry[office.id] ?? ''}
                    onChange={(e) =>
                      setTitleByCountry((prev) => ({ ...prev, [office.id]: e.target.value }))
                    }
                    placeholder="Введите название вакансии"
                    disabled={!vacancyActiveByCountry[office.id]}
                  />
                </Box>
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Отдел
                  </Text>
                  <Select.Root
                    value={departmentByCountry[office.id] ?? ''}
                    onValueChange={(v) =>
                      setDepartmentByCountry((prev) => ({ ...prev, [office.id]: v }))
                    }
                  >
                    <Select.Trigger placeholder="Выберите отдел" disabled={!vacancyActiveByCountry[office.id]} />
                    <Select.Content>
                      {MOCK_DEPARTMENTS.map((dept) => (
                        <Select.Item key={dept.id} value={dept.id}>
                          {'  '.repeat(dept.level)}{dept.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="2" weight="medium">
                      Шапка
                    </Text>
                    <Flex align="center" gap="3">
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Активность:
                        </Text>
                        <Switch
                          checked={headerActiveByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setHeaderActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={!vacancyActiveByCountry[office.id]}
                        />
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Видимость:
                        </Text>
                        <Switch
                          checked={headerVisibleByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setHeaderVisibleByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={
                            !vacancyActiveByCountry[office.id] || !(headerActiveByCountry[office.id] ?? true)
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <TextArea
                    value={headerByCountry[office.id] ?? ''}
                    onChange={(e) =>
                      setHeaderByCountry((prev) => ({ ...prev, [office.id]: e.target.value }))
                    }
                    placeholder="Введите текст шапки"
                    rows={4}
                    disabled={
                      !vacancyActiveByCountry[office.id] || !(headerActiveByCountry[office.id] ?? true)
                    }
                    style={{ minHeight: 100 }}
                  />
                </Box>
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="2" weight="medium">
                      Обязанности
                    </Text>
                    <Flex align="center" gap="3">
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Активность:
                        </Text>
                        <Switch
                          checked={responsibilitiesActiveByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setResponsibilitiesActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={!vacancyActiveByCountry[office.id]}
                        />
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Видимость:
                        </Text>
                        <Switch
                          checked={responsibilitiesVisibleByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setResponsibilitiesVisibleByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={
                            !vacancyActiveByCountry[office.id] ||
                            !(responsibilitiesActiveByCountry[office.id] ?? true)
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <TextArea
                    value={responsibilitiesByCountry[office.id] ?? ''}
                    onChange={(e) =>
                      setResponsibilitiesByCountry((prev) => ({ ...prev, [office.id]: e.target.value }))
                    }
                    placeholder="Введите обязанности"
                    rows={4}
                    disabled={
                      !vacancyActiveByCountry[office.id] ||
                      !(responsibilitiesActiveByCountry[office.id] ?? true)
                    }
                    style={{ minHeight: 100 }}
                  />
                </Box>
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="2" weight="medium">
                      Пожелания
                    </Text>
                    <Flex align="center" gap="3">
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Активность:
                        </Text>
                        <Switch
                          checked={requirementsActiveByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setRequirementsActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={!vacancyActiveByCountry[office.id]}
                        />
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Видимость:
                        </Text>
                        <Switch
                          checked={requirementsVisibleByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setRequirementsVisibleByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={
                            !vacancyActiveByCountry[office.id] ||
                            !(requirementsActiveByCountry[office.id] ?? true)
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <TextArea
                    value={requirementsByCountry[office.id] ?? ''}
                    onChange={(e) =>
                      setRequirementsByCountry((prev) => ({ ...prev, [office.id]: e.target.value }))
                    }
                    placeholder="Введите пожелания"
                    rows={4}
                    disabled={
                      !vacancyActiveByCountry[office.id] ||
                      !(requirementsActiveByCountry[office.id] ?? true)
                    }
                    style={{ minHeight: 100 }}
                  />
                </Box>
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="2" weight="medium">
                      Будет плюсом
                    </Text>
                    <Flex align="center" gap="3">
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Активность:
                        </Text>
                        <Switch
                          checked={niceToHaveActiveByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setNiceToHaveActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={!vacancyActiveByCountry[office.id]}
                        />
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Видимость:
                        </Text>
                        <Switch
                          checked={niceToHaveVisibleByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setNiceToHaveVisibleByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={
                            !vacancyActiveByCountry[office.id] ||
                            !(niceToHaveActiveByCountry[office.id] ?? true)
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <TextArea
                    value={niceToHaveByCountry[office.id] ?? ''}
                    onChange={(e) =>
                      setNiceToHaveByCountry((prev) => ({ ...prev, [office.id]: e.target.value }))
                    }
                    placeholder="Введите что будет плюсом"
                    rows={4}
                    disabled={
                      !vacancyActiveByCountry[office.id] ||
                      !(niceToHaveActiveByCountry[office.id] ?? true)
                    }
                    style={{ minHeight: 100 }}
                  />
                </Box>
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="2" weight="medium">
                      Условия работы
                    </Text>
                    <Flex align="center" gap="3">
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Активность:
                        </Text>
                        <Switch
                          checked={conditionsActiveByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setConditionsActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={!vacancyActiveByCountry[office.id]}
                        />
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Видимость:
                        </Text>
                        <Switch
                          checked={conditionsVisibleByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setConditionsVisibleByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={
                            !vacancyActiveByCountry[office.id] ||
                            !(conditionsActiveByCountry[office.id] ?? true)
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <TextArea
                    value={conditionsByCountry[office.id] ?? ''}
                    onChange={(e) =>
                      setConditionsByCountry((prev) => ({ ...prev, [office.id]: e.target.value }))
                    }
                    placeholder="Введите условия работы"
                    rows={4}
                    disabled={
                      !vacancyActiveByCountry[office.id] ||
                      !(conditionsActiveByCountry[office.id] ?? true)
                    }
                    style={{ minHeight: 100 }}
                  />
                </Box>
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="2" weight="medium">
                      Завершение
                    </Text>
                    <Flex align="center" gap="3">
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Активность:
                        </Text>
                        <Switch
                          checked={closingActiveByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setClosingActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={!vacancyActiveByCountry[office.id]}
                        />
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Видимость:
                        </Text>
                        <Switch
                          checked={closingVisibleByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setClosingVisibleByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={
                            !vacancyActiveByCountry[office.id] ||
                            !(closingActiveByCountry[office.id] ?? true)
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <TextArea
                    value={closingByCountry[office.id] ?? ''}
                    onChange={(e) =>
                      setClosingByCountry((prev) => ({ ...prev, [office.id]: e.target.value }))
                    }
                    placeholder="Введите завершающий текст"
                    rows={4}
                    disabled={
                      !vacancyActiveByCountry[office.id] ||
                      !(closingActiveByCountry[office.id] ?? true)
                    }
                    style={{ minHeight: 100 }}
                  />
                </Box>
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="2" weight="medium">
                      Дополнительная ссылка
                    </Text>
                    <Flex align="center" gap="3">
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Активность:
                        </Text>
                        <Switch
                          checked={linkActiveByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setLinkActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={!vacancyActiveByCountry[office.id]}
                        />
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Видимость:
                        </Text>
                        <Switch
                          checked={linkVisibleByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setLinkVisibleByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={
                            !vacancyActiveByCountry[office.id] ||
                            !(linkActiveByCountry[office.id] ?? true)
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <TextField.Root
                    value={linkByCountry[office.id] ?? ''}
                    onChange={(e) =>
                      setLinkByCountry((prev) => ({ ...prev, [office.id]: e.target.value }))
                    }
                    placeholder="https://example.com/vacancy"
                    disabled={
                      !vacancyActiveByCountry[office.id] ||
                      !(linkActiveByCountry[office.id] ?? true)
                    }
                  />
                </Box>
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Text size="2" weight="medium">
                      Вложения
                    </Text>
                    <Flex align="center" gap="3">
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Активность:
                        </Text>
                        <Switch
                          checked={attachmentActiveByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setAttachmentActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={!vacancyActiveByCountry[office.id]}
                        />
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">
                          Видимость:
                        </Text>
                        <Switch
                          checked={attachmentVisibleByCountry[office.id] ?? true}
                          onCheckedChange={(c) =>
                            setAttachmentVisibleByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                          }
                          disabled={
                            !vacancyActiveByCountry[office.id] ||
                            !(attachmentActiveByCountry[office.id] ?? true)
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex direction="column" gap="2">
                    <input
                      type="file"
                      accept=".docx,.pptx,.figma"
                      onChange={(e) => setVacancyAttachment(e.target.files?.[0] ?? null)}
                      disabled={
                        !vacancyActiveByCountry[office.id] ||
                        !(attachmentActiveByCountry[office.id] ?? true)
                      }
                      id={`vacancy-attachment-${office.id}`}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}
                    />
                    <label
                      htmlFor={`vacancy-attachment-${office.id}`}
                      style={{
                        cursor:
                          vacancyActiveByCountry[office.id] && (attachmentActiveByCountry[office.id] ?? true)
                            ? 'pointer'
                            : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        backgroundColor: 'var(--gray-3)',
                        border: '1px solid var(--gray-6)',
                      }}
                    >
                      <Text size="2">
                        {vacancyAttachment ? vacancyAttachment.name : 'Выберите файл (docx, pptx, figma)'}
                      </Text>
                    </label>
                    {vacancyAttachment && (
                      <Flex align="center" gap="2" style={{ padding: '8px 12px', backgroundColor: 'var(--gray-2)', borderRadius: 6 }}>
                        <Text size="2" style={{ flex: 1 }}>{vacancyAttachment.name}</Text>
                        <Text size="1" color="gray">
                          {(vacancyAttachment.size / 1024).toFixed(2)} KB
                        </Text>
                        <Button size="1" variant="ghost" color="red" onClick={() => setVacancyAttachment(null)}>
                          ×
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                </Box>
              </Flex>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Box>
    )
  }

  if (tab === 'recruiters') {
    return (
      <Box>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Рекрутеры
        </Text>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Назначение ответственных за вакансию. Выберите главного рекрутера и участников.
        </Text>
        <Flex direction="column" gap="3">
          {MOCK_RECRUITERS.map((recruiter) => {
            const isSelected = selectedRecruiters.has(recruiter.id)
            const isMain = mainRecruiter === recruiter.id
            return (
              <Card key={recruiter.id} style={{ padding: 16 }}>
                <Flex align="center" gap="3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleRecruiterToggle(recruiter.id)}
                  />
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Flex align="center" gap="2">
                      <Text size="4" weight="medium">
                        {recruiter.name}
                      </Text>
                      {isMain && (
                        <Badge color="blue" variant="soft" size="1">
                          Главный
                        </Badge>
                      )}
                    </Flex>
                    <Text size="2" color="gray">
                      {recruiter.position}
                    </Text>
                    <Text size="1" color="gray">
                      {recruiter.email}
                    </Text>
                    <Text size="1" color="gray">
                      {recruiter.phone}
                    </Text>
                  </Flex>
                  <Box>
                    <Text size="1" color="gray" mb="1" style={{ display: 'block', textAlign: 'right' }}>
                      Главный
                    </Text>
                    <Switch
                      checked={isMain}
                      disabled={!isSelected}
                      onCheckedChange={() => handleMainRecruiterToggle(recruiter.id)}
                    />
                  </Box>
                </Flex>
              </Card>
            )
          })}
        </Flex>
        {MOCK_RECRUITERS.length === 0 && (
          <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
            Нет доступных рекрутеров
          </Text>
        )}
      </Box>
    )
  }

  if (tab === 'customers') {
    const filteredInterviewers =
      customersOnlyFromDepartment
        ? MOCK_INTERVIEWERS.filter((i) => i.department === VACANCY_DEPARTMENT)
        : MOCK_INTERVIEWERS
    return (
      <Box>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Заказчики и интервьюеры
        </Text>
        <Flex align="center" gap="2" mb="4">
          <Switch
            checked={customersOnlyFromDepartment}
            onCheckedChange={setCustomersOnlyFromDepartment}
          />
          <Text size="2">Только из отдела</Text>
          <Text size="1" color="gray">
            (выкл. — все)
          </Text>
        </Flex>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Список заказчиков и интервьюеров по вакансии.
        </Text>
        <Flex direction="column" gap="3">
          {filteredInterviewers.map((interviewer) => {
            const isSelected = selectedVacancyInterviewers.has(interviewer.id)
            const isFinalInterview = finalInterviewInterviewers.has(interviewer.id)
            return (
              <Card key={interviewer.id} style={{ padding: 16 }}>
                <Flex align="center" gap="3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleInterviewerToggle(interviewer.id)}
                  />
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Flex align="center" gap="2">
                      <Text size="4" weight="medium">
                        {interviewer.name}
                      </Text>
                      {interviewer.isCustomer && (
                        <Badge color="blue" variant="soft" size="1">
                          Заказчик
                        </Badge>
                      )}
                      {isFinalInterview && (
                        <Badge color="purple" variant="soft" size="1">
                          Финальное интервью
                        </Badge>
                      )}
                    </Flex>
                    <Text size="2" color="gray">
                      {interviewer.position} · {interviewer.department}
                    </Text>
                    <Text size="1" color="gray">
                      {interviewer.email} · {interviewer.phone}
                    </Text>
                    <Text size="1" color="gray">
                      {interviewer.interviewType}
                    </Text>
                  </Flex>
                  <Box>
                    <Text size="1" color="gray" mb="1" style={{ display: 'block', textAlign: 'right' }}>
                      Финальное интервью
                    </Text>
                    <Switch
                      checked={isFinalInterview}
                      disabled={!isSelected}
                      onCheckedChange={() => handleFinalInterviewToggle(interviewer.id)}
                    />
                  </Box>
                </Flex>
              </Card>
            )
          })}
        </Flex>
        {filteredInterviewers.length === 0 && (
          <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
            Нет доступных заказчиков
          </Text>
        )}
      </Box>
    )
  }

  if (tab === 'questions') {
    return (
      <Box>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Вопросы и ссылки
        </Text>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Ссылка на вакансию, тогглер использования на сайте и один вопрос по вакансии на офис. Настройки задаются отдельно для каждого офиса. У ссылки и вопроса можно выбрать цвет. Страны автоматически включаются/выключаются на основе активности вакансии для каждой страны из раздела «Текст вакансии».
        </Text>
        <Flex direction="column" gap="4">
          {OFFICES.map((office) => {
            const link = questionsLinkByOffice[office.id] ?? { url: '', useOnSite: false, color: LINK_COLORS[0].hex }
            const qText = questionTextByOffice[office.id] ?? ''
            const qColor = questionColorByOffice[office.id] ?? LINK_COLORS[0].hex
            const isOfficeActive = vacancyActiveByCountry[office.id] ?? true
            return (
              <Card key={office.id} style={{ padding: 16, opacity: isOfficeActive ? 1 : 0.6 }}>
                <Flex direction="column" gap="4">
                  <Flex align="center" justify="between">
                    <Text size="4" weight="bold">
                      {office.name}
                    </Text>
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">
                        Активность:
                      </Text>
                      <Switch
                        checked={isOfficeActive}
                        onCheckedChange={(c) =>
                          setVacancyActiveByCountry((prev) => ({ ...prev, [office.id]: !!c }))
                        }
                      />
                    </Flex>
                  </Flex>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Ссылка на вакансию
                    </Text>
                    <Flex direction="column" gap="2">
                      <Flex align="center" gap="3" wrap="wrap">
                        <TextField.Root
                          value={link.url}
                          onChange={(e) =>
                            setQuestionsLinkByOffice((prev) => ({
                              ...prev,
                              [office.id]: { ...link, url: e.target.value },
                            }))
                          }
                          placeholder="https://example.com/vacancy"
                          style={{ flex: 1, minWidth: 200 }}
                          disabled={!isOfficeActive}
                        />
                        <Flex align="center" gap="2">
                          <Text size="2" color="gray">
                            Использовать на сайте:
                          </Text>
                          <Switch
                            checked={link.useOnSite}
                            onCheckedChange={(c) =>
                              setQuestionsLinkByOffice((prev) => ({
                                ...prev,
                                [office.id]: { ...link, useOnSite: !!c },
                              }))
                            }
                            disabled={!isOfficeActive}
                          />
                        </Flex>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Text size="2" color="gray">
                          Цвет ссылки:
                        </Text>
                        <Flex gap="2" wrap="wrap">
                          {LINK_COLORS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              title={c.label}
                              aria-pressed={link.color === c.hex}
                              disabled={!isOfficeActive}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                backgroundColor: c.hex,
                                border: link.color === c.hex ? '2px solid var(--gray-12)' : '2px solid transparent',
                                cursor: isOfficeActive ? 'pointer' : 'not-allowed',
                                padding: 0,
                                opacity: isOfficeActive ? 1 : 0.5,
                              }}
                              onClick={() =>
                                setQuestionsLinkByOffice((prev) => ({
                                  ...prev,
                                  [office.id]: { ...link, color: c.hex },
                                }))
                              }
                            />
                          ))}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Box>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Вопрос по вакансии
                    </Text>
                    <TextArea
                      value={qText}
                      onChange={(e) => setQuestionTextByOffice((prev) => ({ ...prev, [office.id]: e.target.value }))}
                      placeholder="Текст вопроса..."
                      rows={3}
                      disabled={!isOfficeActive}
                    />
                    <Flex align="center" gap="2" mt="2">
                      <Text size="2" color="gray">
                        Цвет:
                      </Text>
                      {LINK_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          title={c.label}
                          aria-pressed={qColor === c.hex}
                          disabled={!isOfficeActive}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            backgroundColor: c.hex,
                            border: qColor === c.hex ? '2px solid var(--gray-12)' : '2px solid transparent',
                            cursor: isOfficeActive ? 'pointer' : 'not-allowed',
                            padding: 0,
                            opacity: isOfficeActive ? 1 : 0.5,
                          }}
                          onClick={() => setQuestionColorByOffice((prev) => ({ ...prev, [office.id]: c.hex }))}
                        />
                      ))}
                    </Flex>
                  </Box>
                </Flex>
              </Card>
            )
          })}
        </Flex>
      </Box>
    )
  }

  if (tab === 'integrations') {
    return (
      <Box>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Связи и интеграции
        </Text>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Настройка интеграций с внешними сервисами.
        </Text>
        <Flex direction="column" gap="3">
          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Интеграция
            </Text>
            <Select.Root value={integrationPartner || '__none__'} onValueChange={(v) => setIntegrationPartner(v === '__none__' ? '' : v)}>
              <Select.Trigger placeholder="Выберите интеграцию" />
              <Select.Content>
                <Select.Item value="__none__">— Не выбрано</Select.Item>
                <Select.Item value="huntflow">Huntflow</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          {integrationPartner === 'huntflow' && (
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                ID вакансии в Huntflow
              </Text>
              <TextField.Root
                value={huntflowVacancyId}
                onChange={(e) => setHuntflowVacancyId(e.target.value)}
                placeholder="Введите ID вакансии"
              />
            </Box>
          )}
        </Flex>
      </Box>
    )
  }

  if (tab === 'statuses') {
    return (
      <Box>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Статусы
        </Text>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Выберите этапы рекрутинга, которые будут доступны для данной вакансии.
        </Text>
        <Flex direction="column" gap="3">
          {RECRUITMENT_STAGES.map((stage) => {
            const isActive = selectedStages.has(stage.id)
            return (
              <Card key={stage.id} style={{ padding: 16 }}>
                <Flex align="center" gap="3">
                  <Checkbox checked={isActive} onCheckedChange={() => toggleStage(stage.id)} />
                  <Flex align="center" gap="3" style={{ flex: 1 }}>
                    <Box
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: stage.color,
                        flexShrink: 0,
                      }}
                    />
                    <Flex direction="column" gap="1" style={{ flex: 1 }}>
                      <Text size="4" weight="medium">
                        {stage.name}
                      </Text>
                      {stage.description && (
                        <Text size="2" color="gray">
                          {stage.description}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
            )
          })}
        </Flex>
        {RECRUITMENT_STAGES.length === 0 && (
          <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
            Нет доступных этапов
          </Text>
        )}
      </Box>
    )
  }

  if (tab === 'salary') {
    const mainCurrency = COMPANY_CURRENCIES.find((c) => c.isMain)?.code ?? 'BYN'
    return (
      <Box>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Зарплатные вилки
        </Text>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Выберите активные грейды и укажите зарплатные диапазоны. Редактирование доступно только
          для главной валюты ({mainCurrency}), остальные пересчитываются автоматически.
        </Text>
        <Box style={{ overflowX: 'auto', width: '100%' }}>
          <Table.Root
            style={{
              tableLayout: 'fixed',
              width: 'max-content',
              maxWidth: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell
                  style={{
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'var(--gray-2)',
                    zIndex: 10,
                    width: '180px',
                    minWidth: '180px',
                    maxWidth: '180px',
                    padding: '12px',
                  }}
                >
                  Грейд
                </Table.ColumnHeaderCell>
                {COMPANY_CURRENCIES.map((currency) => (
                  <Table.ColumnHeaderCell
                    key={currency.id}
                    style={{
                      width: currency.isMain ? '260px' : '180px',
                      minWidth: currency.isMain ? '260px' : '180px',
                      maxWidth: currency.isMain ? '260px' : '180px',
                      whiteSpace: 'nowrap',
                      padding: '12px',
                    }}
                  >
                    <Flex direction="column" gap="1" align="center">
                      <Flex align="center" gap="2" wrap="nowrap">
                        <Text weight="bold">{currency.code}</Text>
                        {currency.isMain && (
                          <Badge size="1" color="green">
                            Главная
                          </Badge>
                        )}
                      </Flex>
                      <Text size="1" color="gray">
                        Gross
                      </Text>
                    </Flex>
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {SALARY_GRADES.map((grade) => {
                const isActive = activeGrades.has(grade.id)
                return (
                  <Table.Row key={grade.id}>
                    <Table.Cell
                      style={{
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'var(--gray-2)',
                        zIndex: 10,
                        width: '180px',
                        minWidth: '180px',
                        maxWidth: '180px',
                        padding: '12px',
                      }}
                    >
                      <Flex align="center" gap="2">
                        <Checkbox checked={isActive} onCheckedChange={() => handleGradeToggle(grade.id)} />
                        <Text weight={isActive ? 'medium' : 'regular'} style={{ opacity: isActive ? 1 : 0.5 }}>
                          {grade.name}
                        </Text>
                      </Flex>
                    </Table.Cell>
                    {COMPANY_CURRENCIES.map((currency) => {
                      const isMain = currency.isMain
                      const fromVal = getSalaryValue(grade.id, currency.code, 'from')
                      const toVal = getSalaryValue(grade.id, currency.code, 'to')
                      return (
                        <Table.Cell
                          key={currency.id}
                          style={{
                            whiteSpace: 'nowrap',
                            width: isMain ? '260px' : '180px',
                            minWidth: isMain ? '260px' : '180px',
                            maxWidth: isMain ? '260px' : '180px',
                            padding: '12px',
                            verticalAlign: 'middle',
                          }}
                        >
                          {isActive ? (
                            isMain ? (
                              <Flex gap="2" align="center" style={{ flexWrap: 'nowrap' }}>
                                <TextField.Root
                                  type="number"
                                  placeholder="От"
                                  value={fromVal !== null ? String(fromVal) : ''}
                                  onChange={(e) =>
                                    handleSalaryChange(grade.id, currency.code, 'from', e.target.value)
                                  }
                                  style={{ minWidth: 100, width: 100 }}
                                />
                                <Text>—</Text>
                                <TextField.Root
                                  type="number"
                                  placeholder="До"
                                  value={toVal !== null ? String(toVal) : ''}
                                  onChange={(e) =>
                                    handleSalaryChange(grade.id, currency.code, 'to', e.target.value)
                                  }
                                  style={{ minWidth: 100, width: 100 }}
                                />
                              </Flex>
                            ) : (
                              <Text size="2">
                                {fromVal !== null ? fromVal.toFixed(2) : '—'} –{' '}
                                {toVal !== null ? toVal.toFixed(2) : '—'}
                              </Text>
                            )
                          ) : (
                            <Text size="2" color="gray">
                              —
                            </Text>
                          )}
                        </Table.Cell>
                      )
                    })}
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    )
  }

  if (tab === 'interviews') {
    return (
      <Box>
        <Flex align="center" justify="between" mb="4">
          <Text size="4" weight="bold">
            Встречи и интервью
          </Text>
          <Button size="2" variant="soft" onClick={addInterviewMeeting}>
            <PlusIcon width={14} height={14} />
            <Text size="2">Добавить встречу</Text>
          </Button>
        </Flex>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Рекомендуемое количество встреч: 1 (активные этапы до оффера - 2). Для каждой встречи
          укажите этап, длительность, заголовок, сопровождающий текст и формат (офис или онлайн).
        </Text>
        {interviewMeetings.length === 0 ? (
          <Card style={{ padding: 24, textAlign: 'center' }}>
            <Text size="2" color="gray">
              Нет встреч. Добавьте первую встречу.
            </Text>
          </Card>
        ) : (
          <Flex direction="column" gap="4">
            {interviewMeetings.map((meeting, index) => (
              <Card key={meeting.id} style={{ padding: 16 }}>
                <Flex direction="column" gap="4">
                  <Flex align="center" justify="between">
                    <Text size="4" weight="medium">
                      Встреча {index + 1}
                    </Text>
                    {interviewMeetings.length > 1 && (
                      <Button
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={() => removeInterviewMeeting(meeting.id)}
                      >
                        <TrashIcon width={14} height={14} />
                      </Button>
                    )}
                  </Flex>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Этап
                    </Text>
                    <Select.Root
                      value={meeting.stage}
                      onValueChange={(v) => updateInterviewMeeting(meeting.id, { stage: v })}
                    >
                      <Select.Trigger placeholder="Выберите этап" style={{ width: '100%' }} />
                      <Select.Content>
                        {MEETING_STAGES.map((s) => (
                          <Select.Item key={s.id} value={s.id}>
                            {s.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Длительность встречи (минут)
                    </Text>
                    <TextField.Root
                      type="number"
                      value={meeting.duration.toString()}
                      onChange={(e) =>
                        updateInterviewMeeting(meeting.id, {
                          duration: parseInt(e.target.value, 10) || 60,
                        })
                      }
                      placeholder="60"
                      style={{ width: 200 }}
                    />
                  </Box>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Заголовок названия встречи
                    </Text>
                    <TextField.Root
                      value={meeting.title}
                      onChange={(e) => updateInterviewMeeting(meeting.id, { title: e.target.value })}
                      placeholder="Например: Техническое интервью"
                      style={{ width: '100%' }}
                    />
                  </Box>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Формат встречи
                    </Text>
                    <Select.Root
                      value={meeting.format}
                      onValueChange={(v) =>
                        updateInterviewMeeting(meeting.id, {
                          format: (v as 'office' | 'online') || 'online',
                        })
                      }
                    >
                      <Select.Trigger placeholder="Офис или онлайн" style={{ width: '100%' }} />
                      <Select.Content>
                        <Select.Item value="office">Офис</Select.Item>
                        <Select.Item value="online">Онлайн</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box>
                    <Flex align="center" justify="between" mb="2">
                      <Text size="2" weight="medium">
                        Сопровождающий текст
                      </Text>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <Button size="1" variant="ghost">
                            <Text size="1">Подсказки</Text>
                            <ChevronDownIcon width={12} height={12} />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content style={{ minWidth: 260 }}>
                          <DropdownMenu.Item
                            onSelect={() => {
                              const hint = '{{candidate_link}}'
                              updateInterviewMeeting(meeting.id, {
                                description:
                                  meeting.description +
                                  (meeting.description ? '\n' : '') +
                                  hint,
                              })
                            }}
                          >
                            <Text size="2">Ссылка на кандидата в системе</Text>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onSelect={() => {
                              const hint = '{{external_integration_link}}'
                              updateInterviewMeeting(meeting.id, {
                                description:
                                  meeting.description +
                                  (meeting.description ? '\n' : '') +
                                  hint,
                              })
                            }}
                          >
                            <Text size="2">Ссылка во внешней интеграции</Text>
                          </DropdownMenu.Item>
                          {RECRUITER_CONTACT_HINTS.map(({ label, variable }) => (
                            <DropdownMenu.Item
                              key={variable}
                              onSelect={() => {
                                const hint = `{{${variable}}}`
                                updateInterviewMeeting(meeting.id, {
                                  description:
                                    meeting.description +
                                    (meeting.description ? '\n' : '') +
                                    hint,
                                })
                              }}
                            >
                              <Text size="2">{label}</Text>
                            </DropdownMenu.Item>
                          ))}
                          <DropdownMenu.Item
                            onSelect={() => {
                              const hint = '{{office_instructions}}'
                              updateInterviewMeeting(meeting.id, {
                                description:
                                  meeting.description +
                                  (meeting.description ? '\n' : '') +
                                  hint,
                              })
                            }}
                          >
                            <Text size="2">Инструкции офиса</Text>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Flex>
                    <Text size="1" color="gray" mb="2" style={{ display: 'block' }}>
                      Текст, отправляемый с приглашением на встречу.
                    </Text>
                    <TextArea
                      value={meeting.description}
                      onChange={(e) =>
                        updateInterviewMeeting(meeting.id, { description: e.target.value })
                      }
                      placeholder="Введите текст приглашения на встречу..."
                      rows={4}
                      style={{ width: '100%' }}
                    />
                  </Box>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Box>
    )
  }

  if (tab === 'scorecard') {
    return (
      <Box>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Scorecard
        </Text>
        <Flex direction="column" gap="4">
          <Card style={{ padding: 16 }}>
            <Flex direction="column" gap="3">
              <Text size="4" weight="medium" mb="2">
                Ссылка
              </Text>
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Ссылка на Google документ
                  </Text>
                  <TextField.Root
                    value={scorecardLinkUrl}
                    onChange={(e) => setScorecardLinkUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/..."
                    style={{ width: '100%' }}
                  />
                </Box>
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Название-заголовок
                  </Text>
                  <TextField.Root
                    value={scorecardLinkTitle}
                    onChange={(e) => setScorecardLinkTitle(e.target.value)}
                    placeholder="Введите название"
                    style={{ width: '100%' }}
                  />
                </Box>
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Место добавления
                  </Text>
                  <Select.Root
                    value={scorecardLinkPosition}
                    onValueChange={(v: 'start' | 'end') => setScorecardLinkPosition(v)}
                  >
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      <Select.Item value="start">В начале</Select.Item>
                      <Select.Item value="end">В конце</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>
            </Flex>
          </Card>
          <Card style={{ padding: 16 }}>
            <Flex direction="column" gap="3">
              <Text size="4" weight="medium" mb="2">
                Локальный
              </Text>
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <Switch
                    checked={scorecardLocalActive}
                    onCheckedChange={setScorecardLocalActive}
                  />
                  <Text size="2">
                    {scorecardLocalActive ? 'Активный' : 'Не активный'}
                  </Text>
                </Flex>
                <Button
                  variant="soft"
                  onClick={() => setScorecardLocalSettingsOpen(true)}
                  disabled={!scorecardLocalActive}
                  style={{ width: 'fit-content' }}
                >
                  <GearIcon width={16} height={16} />
                  <Text size="2">Настройки</Text>
                </Button>
                {!scorecardLocalActive && (
                  <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
                    В разработке
                  </Text>
                )}
              </Flex>
            </Flex>
          </Card>
        </Flex>
        <Dialog.Root open={scorecardLocalSettingsOpen} onOpenChange={setScorecardLocalSettingsOpen}>
          <Dialog.Content style={{ maxWidth: 600 }}>
            <Dialog.Title>Настройки локального Scorecard</Dialog.Title>
            <Dialog.Description>
              <Text size="2" color="gray">
                Настройки локального Scorecard находятся в разработке
              </Text>
            </Dialog.Description>
            <Flex gap="3" justify="end" mt="4">
              <Dialog.Close>
                <Button variant="soft">Закрыть</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Box>
    )
  }

  if (tab === 'dataProcessing') {
    return (
      <Box>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Обработка данных
        </Text>
        <Flex direction="column" gap="4">
          <Card style={{ padding: 16 }}>
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <Switch checked={useUnifiedPrompt} onCheckedChange={setUseUnifiedPrompt} />
                <Text size="2">Использовать единый промпт</Text>
              </Flex>
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Промпт для анализа
                </Text>
                <TextArea
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  placeholder="Введите промпт для анализа..."
                  rows={5}
                  disabled={useUnifiedPrompt}
                  style={{ width: '100%', minHeight: 140 }}
                />
              </Box>
            </Flex>
          </Card>
        </Flex>
      </Box>
    )
  }

  return null
}
