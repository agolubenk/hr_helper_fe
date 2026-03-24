/**
 * BenchmarksPage (finance/benchmarks/page.tsx) - Страница управления бенчмарками зарплат
 * 
 * Назначение:
 * - Управление бенчмарками зарплат из вакансий и кандидатов
 * - Создание, редактирование и удаление бенчмарков
 * - Фильтрация и поиск бенчмарков
 * - Статистика по бенчмаркам
 * 
 * Функциональность:
 * - Список всех бенчмарков в таблице
 * - Поиск бенчмарков по вакансии, грейду, локации
 * - Фильтрация по типу (кандидат/вакансия), грейду, вакансии, статусу
 * - Статистика: всего бенчмарков, активных, по типам, по грейдам
 * - Форма добавления нового бенчмарка
 * - Форма редактирования бенчмарка
 * - Удаление бенчмарка
 * - Активация/деактивация бенчмарка
 * - Ссылки на вакансии в HeadHunter
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений
 * - Sidebar: содержит ссылку на эту страницу в разделе "Финансы"
 * - finance/page.tsx: страница финансов, откуда может происходить переход
 * 
 * Поведение:
 * - При загрузке загружает список бенчмарков
 * - При поиске фильтрует бенчмарки по введенному запросу
 * - При добавлении бенчмарка показывает форму, при сохранении скрывает её
 * - При редактировании бенчмарка открывает форму редактирования
 * - При удалении показывает подтверждение
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

import {
  Box,
  Flex,
  Text,
  Button,
  TextField,
  Table,
  Badge,
  Select,
  Card,
  Dialog,
  Separator,
  TextArea,
  Switch,
} from "@radix-ui/themes"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ReloadIcon,
  EyeOpenIcon,
  Pencil2Icon,
  TrashIcon,
  ExternalLinkIcon,
  CalendarIcon,
  SewingPinFilledIcon,
  BackpackIcon,
  DashboardIcon,
  DoubleArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"
import { useState, useEffect, useMemo } from "react"
import { Benchmark, BenchmarkSettings, Grade, Vacancy } from "@/lib/api"
import { Link } from '@/router-adapter'
import {
  MOCK_BENCHMARKS,
  MOCK_GRADES,
  MOCK_SETTINGS,
  MOCK_VACANCIES,
  formatSalaryDisplay,
} from '@/app/pages/benchmarks/benchmarksMocks'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './styles/BenchmarksPage.module.css'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100] as const

const WORK_FORMAT_EDIT_OPTIONS = [
  { value: 'none', label: 'Не указано' },
  { value: 'офис', label: 'Офис' },
  { value: 'гибрид', label: 'Гибрид' },
  { value: 'удаленка', label: 'Удалёнка' },
  { value: 'all world', label: 'All World' },
] as const

export default function BenchmarksPage() {
  const { showSuccess } = useToast()
  const [benchmarkDataset, setBenchmarkDataset] = useState<Benchmark[]>(() => [...MOCK_BENCHMARKS])
  const [settings, setSettings] = useState<BenchmarkSettings | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [vacancyFilter, setVacancyFilter] = useState<string>('')
  const [gradeFilter, setGradeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(15)
  const [grades, setGrades] = useState<Grade[]>([])
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    work_format: false,
    compensation: false,
    benefits: false,
    development: false,
    technologies: false,
    domain: false,
  })

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addType, setAddType] = useState<'candidate' | 'vacancy'>('candidate')
  const [addVacancyId, setAddVacancyId] = useState('1')
  const [addGradeId, setAddGradeId] = useState('1')
  const [addSalaryFrom, setAddSalaryFrom] = useState('')
  const [addSalaryTo, setAddSalaryTo] = useState('')
  const [addLocation, setAddLocation] = useState('')

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewBenchmark, setViewBenchmark] = useState<Benchmark | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editBenchmarkId, setEditBenchmarkId] = useState<number | null>(null)
  const [editType, setEditType] = useState<'candidate' | 'vacancy'>('candidate')
  const [editVacancyId, setEditVacancyId] = useState('1')
  const [editGradeId, setEditGradeId] = useState('1')
  const [editSalaryFrom, setEditSalaryFrom] = useState('')
  const [editSalaryTo, setEditSalaryTo] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editLinkedCandidateId, setEditLinkedCandidateId] = useState('')
  const [editTotalExperienceYears, setEditTotalExperienceYears] = useState('')
  const [editWorkRegionsDisplay, setEditWorkRegionsDisplay] = useState('')
  const [editSalaryExpectationsNote, setEditSalaryExpectationsNote] = useState('')
  const [editVacancyDescription, setEditVacancyDescription] = useState('')
  const [editVacancySourceDisplay, setEditVacancySourceDisplay] = useState('')
  const [editDomainDescription, setEditDomainDescription] = useState('')
  const [editWorkFormat, setEditWorkFormat] = useState('')
  const [editCompensation, setEditCompensation] = useState('')
  const [editBenefits, setEditBenefits] = useState('')
  const [editDevelopment, setEditDevelopment] = useState('')
  const [editTechnologies, setEditTechnologies] = useState('')
  const [editDomainDisplay, setEditDomainDisplay] = useState('')
  const [editDomainKey, setEditDomainKey] = useState('')
  const [editHhVacancyId, setEditHhVacancyId] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const { tableRows, totalFiltered, effectivePage } = useMemo(() => {
    let filtered = [...benchmarkDataset]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.vacancy_name?.toLowerCase().includes(query) ||
          b.grade_name?.toLowerCase().includes(query) ||
          b.location?.toLowerCase().includes(query) ||
          b.technologies?.toLowerCase().includes(query)
      )
    }

    if (typeFilter) {
      filtered = filtered.filter((b) => b.type === typeFilter)
    }

    if (vacancyFilter) {
      filtered = filtered.filter((b) => b.vacancy === parseInt(vacancyFilter, 10))
    }

    if (gradeFilter) {
      filtered = filtered.filter((b) => b.grade === parseInt(gradeFilter, 10))
    }

    if (statusFilter === 'true') {
      filtered = filtered.filter((b) => b.is_active === true)
    } else if (statusFilter === 'false') {
      filtered = filtered.filter((b) => b.is_active === false)
    }

    const filteredTotal = filtered.length
    const maxPage = Math.max(1, Math.ceil(filteredTotal / pageSize) || 1)
    const effPage = Math.min(page, maxPage)
    const startIndex = (effPage - 1) * pageSize
    const rows = filtered.slice(startIndex, startIndex + pageSize)

    return { tableRows: rows, totalFiltered: filteredTotal, effectivePage: effPage }
  }, [
    benchmarkDataset,
    page,
    pageSize,
    searchQuery,
    typeFilter,
    vacancyFilter,
    gradeFilter,
    statusFilter,
  ])

  useEffect(() => {
    if (effectivePage !== page) {
      setPage(effectivePage)
    }
  }, [effectivePage, page])

  const loadSettings = async () => {
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setSettings(MOCK_SETTINGS)
      
      // Инициализируем видимость полей на основе настроек
      const enabledFields = MOCK_SETTINGS.vacancy_fields || []
      const initialVisibility: Record<string, boolean> = {}
      enabledFields.forEach((field: string) => {
        initialVisibility[field] = false
      })
      setVisibleFields(initialVisibility)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await benchmarksApi.getSettings()
      if (response.data) {
        setSettings(response.data)
        const enabledFields = response.data.vacancy_fields || []
        const initialVisibility: Record<string, boolean> = {}
        enabledFields.forEach((field: string) => {
          initialVisibility[field] = false
        })
        setVisibleFields(initialVisibility)
      }
      */
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error)
    }
  }

  const loadGrades = async () => {
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setGrades(MOCK_GRADES)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await gradesApi.getAll()
      if (response.data) {
        setGrades(response.data)
      }
      */
    } catch (error) {
      console.error('Ошибка при загрузке грейдов:', error)
    }
  }

  const loadVacancies = async () => {
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setVacancies(MOCK_VACANCIES)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await vacanciesApi.getAll()
      if (response.data) {
        setVacancies(response.data.map(v => ({
          id: v.id,
          name: v.name || v.title || `Вакансия ${v.id}`
        })))
      }
      */
    } catch (error) {
      console.error('Ошибка при загрузке вакансий:', error)
    }
  }

  useEffect(() => {
    loadSettings()
    loadGrades()
    loadVacancies()
  }, [])

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setSearchQuery('')
    setTypeFilter('')
    setVacancyFilter('')
    setGradeFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const toggleFieldVisibility = (field: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getTypeBadgeColor = (type: string) => {
    return type === 'candidate' ? 'green' : 'blue'
  }

  const getTypeLabel = (type: string) => {
    return type === 'candidate' ? 'Кандидат' : 'Вакансия'
  }

  const handleAddBenchmark = () => {
    const vId = parseInt(addVacancyId, 10)
    const gId = parseInt(addGradeId, 10)
    const vacancy = MOCK_VACANCIES.find((x) => x.id === vId) ?? MOCK_VACANCIES[0]
    const grade = MOCK_GRADES.find((x) => x.id === gId) ?? MOCK_GRADES[0]
    const from = addSalaryFrom.trim() || '0'
    const to = addSalaryTo.trim() || from
    const now = new Date().toISOString()
    const nextId = benchmarkDataset.reduce((m, b) => Math.max(m, b.id), 0) + 1
    const disp = formatSalaryDisplay(from, to)
    const row: Benchmark = {
      id: nextId,
      type: addType,
      vacancy: vacancy.id,
      vacancy_name: vacancy.name ?? vacancy.title ?? `Вакансия ${vacancy.id}`,
      grade: grade.id,
      grade_name: grade.name,
      salary_from: from.replace(/\s/g, ''),
      salary_to: to.replace(/\s/g, ''),
      salary_display: disp,
      location: addLocation.trim() || '—',
      work_format: addType === 'candidate' ? 'гибрид' : 'офис',
      compensation: 'ДМС',
      benefits: 'Обеды',
      development: 'Курсы',
      technologies: '—',
      domain: 'saas',
      domain_display: 'SaaS',
      domain_description:
        addType === 'candidate'
          ? 'Мок: сфера и домен кандидата.'
          : 'Мок: домен продукта и команды.',
      hh_vacancy_id: addType === 'vacancy' ? String(12_000_000 + nextId) : null,
      notes: null,
      is_active: true,
      date_added: now,
      created_at: now,
      updated_at: now,
      linked_candidate_id: addType === 'candidate' ? 8000 + nextId : null,
      total_experience_years: addType === 'candidate' ? 3 : null,
      work_regions_display:
        addType === 'candidate' ? `${addLocation.trim() || '—'}; мок-регионы` : null,
      salary_expectations_note:
        addType === 'candidate' ? `Ожидания по ЗП: ${disp} (мок)` : null,
      vacancy_description:
        addType === 'vacancy'
          ? `Описание вакансии «${vacancy.name ?? vacancy.title}» — мок-текст.`
          : null,
      vacancy_source_display: addType === 'vacancy' ? 'Внутренняя база' : null,
    }
    setBenchmarkDataset((prev) => [...prev, row])
    setAddModalOpen(false)
    setAddSalaryFrom('')
    setAddSalaryTo('')
    setAddLocation('')
  }

  const openViewBenchmark = (b: Benchmark) => {
    setViewBenchmark(b)
    setViewModalOpen(true)
  }

  const openEditBenchmark = (b: Benchmark) => {
    setEditBenchmarkId(b.id)
    setEditType(b.type)
    setEditVacancyId(String(b.vacancy))
    setEditGradeId(String(b.grade))
    setEditSalaryFrom(b.salary_from)
    setEditSalaryTo(b.salary_to?.trim() ?? '')
    setEditLocation(b.location)
    setEditIsActive(b.is_active)
    setEditLinkedCandidateId(b.linked_candidate_id != null ? String(b.linked_candidate_id) : '')
    setEditTotalExperienceYears(
      b.total_experience_years != null ? String(b.total_experience_years) : ''
    )
    setEditWorkRegionsDisplay(b.work_regions_display ?? '')
    setEditSalaryExpectationsNote(b.salary_expectations_note ?? '')
    setEditVacancyDescription(b.vacancy_description ?? '')
    setEditVacancySourceDisplay(b.vacancy_source_display ?? '')
    setEditDomainDescription(b.domain_description ?? '')
    setEditWorkFormat(b.work_format ?? '')
    setEditCompensation(b.compensation ?? '')
    setEditBenefits(b.benefits ?? '')
    setEditDevelopment(b.development ?? '')
    setEditTechnologies(b.technologies ?? '')
    setEditDomainDisplay(b.domain_display ?? '')
    setEditDomainKey(b.domain ?? '')
    setEditHhVacancyId(b.hh_vacancy_id ?? '')
    setEditNotes(b.notes ?? '')
    setEditModalOpen(true)
  }

  const handleSaveEditBenchmark = () => {
    if (editBenchmarkId === null) return
    const vId = parseInt(editVacancyId, 10)
    const gId = parseInt(editGradeId, 10)
    const vacancy = MOCK_VACANCIES.find((x) => x.id === vId) ?? MOCK_VACANCIES[0]
    const grade = MOCK_GRADES.find((x) => x.id === gId) ?? MOCK_GRADES[0]
    const from = editSalaryFrom.trim() || '0'
    const to = editSalaryTo.trim() || from
    const now = new Date().toISOString()

    const lcRaw = editLinkedCandidateId.trim()
    const linked_candidate_id =
      editType !== 'candidate'
        ? null
        : lcRaw === ''
          ? null
          : Number.isFinite(Number(lcRaw))
            ? parseInt(lcRaw, 10)
            : null

    const expRaw = editTotalExperienceYears.trim()
    const total_experience_years =
      editType !== 'candidate'
        ? null
        : expRaw === ''
          ? null
          : Number.isFinite(Number(expRaw))
            ? Math.floor(Number(expRaw))
            : null

    const hhRaw = editHhVacancyId.trim()
    const hh_vacancy_id = editType === 'vacancy' ? (hhRaw !== '' ? hhRaw : null) : null

    setBenchmarkDataset((prev) =>
      prev.map((b) =>
        b.id === editBenchmarkId
          ? {
              ...b,
              type: editType,
              vacancy: vacancy.id,
              vacancy_name: vacancy.name ?? vacancy.title ?? `Вакансия ${vacancy.id}`,
              grade: grade.id,
              grade_name: grade.name,
              salary_from: from.replace(/\s/g, ''),
              salary_to: to.replace(/\s/g, ''),
              salary_display: formatSalaryDisplay(from, to),
              location: editLocation.trim() || '—',
              is_active: editIsActive,
              updated_at: now,
              linked_candidate_id:
                editType === 'candidate' ? linked_candidate_id : null,
              total_experience_years:
                editType === 'candidate' ? total_experience_years : null,
              work_regions_display:
                editType === 'candidate'
                  ? editWorkRegionsDisplay.trim() || null
                  : null,
              salary_expectations_note:
                editType === 'candidate'
                  ? editSalaryExpectationsNote.trim() || null
                  : null,
              vacancy_description:
                editType === 'vacancy'
                  ? editVacancyDescription.trim() || null
                  : null,
              vacancy_source_display:
                editType === 'vacancy'
                  ? editVacancySourceDisplay.trim() || null
                  : null,
              domain_description: editDomainDescription.trim() || null,
              work_format: editWorkFormat.trim() || null,
              compensation: editCompensation.trim() || null,
              benefits: editBenefits.trim() || null,
              development: editDevelopment.trim() || null,
              technologies: editTechnologies.trim() || null,
              domain: editDomainKey.trim() || null,
              domain_display: editDomainDisplay.trim() || null,
              hh_vacancy_id: editType === 'vacancy' ? hh_vacancy_id : null,
              notes: editNotes.trim() || null,
            }
          : b
      )
    )
    setEditModalOpen(false)
    setEditBenchmarkId(null)
    showSuccess('Сохранено', 'Изменения записаны локально (мок).')
  }

  const handleDeleteBenchmark = (b: Benchmark) => {
    if (!window.confirm(`Удалить бенчмарк #${b.id} (${b.vacancy_name})?`)) return
    setBenchmarkDataset((prev) => prev.filter((x) => x.id !== b.id))
    showSuccess('Удалено', 'Запись удалена из списка (мок).')
  }

  const toggleBenchmarkActive = (id: number) => {
    const now = new Date().toISOString()
    setBenchmarkDataset((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, is_active: !b.is_active, updated_at: now } : b
      )
    )
  }

  const getWorkFormatBadge = (workFormat: string | null | undefined) => {
    if (!workFormat) return <Text size="2" color="gray">—</Text>
    const formatMap: Record<string, { label: string; color: string }> = {
      'офис': { label: 'Офис', color: 'blue' },
      'гибрид': { label: 'Гибрид', color: 'green' },
      'удаленка': { label: 'Удаленка', color: 'orange' },
      'all world': { label: 'All World', color: 'purple' },
    }
    const format = formatMap[workFormat] || { label: workFormat, color: 'gray' }
    return <Badge color={format.color as any}>{format.label}</Badge>
  }

  const totalPages =
    totalFiltered > 0 ? Math.max(1, Math.ceil(totalFiltered / pageSize)) : 0
  const safePage = totalFiltered > 0 ? Math.min(page, totalPages) : 1
  const rangeStart = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalFiltered)
  const pageNumbers: number[] = []
  for (
    let i = Math.max(1, safePage - 2);
    i <= Math.min(totalPages, safePage + 2);
    i++
  ) {
    pageNumbers.push(i)
  }

  const enabledFields = settings?.vacancy_fields || []

  const viewBenchmarkLive =
    viewBenchmark !== null
      ? benchmarkDataset.find((b) => b.id === viewBenchmark.id) ?? viewBenchmark
      : null

  return (
    <Box className={styles.container}>
        <Flex direction="column" gap="4">
          <Dialog.Root open={addModalOpen} onOpenChange={setAddModalOpen}>
            <Dialog.Content style={{ maxWidth: '480px' }}>
              <Dialog.Title>Новый бенчмарк</Dialog.Title>
              <Dialog.Description size="2" color="gray" mb="3">
                Мок: запись добавляется локально (без API).
              </Dialog.Description>
              <Flex direction="column" gap="3">
                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">Тип</Text>
                  <Select.Root value={addType} onValueChange={(v) => setAddType(v as 'candidate' | 'vacancy')}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="candidate">Кандидат</Select.Item>
                      <Select.Item value="vacancy">Вакансия</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">Специализация</Text>
                  <Select.Root value={addVacancyId} onValueChange={setAddVacancyId}>
                    <Select.Trigger />
                    <Select.Content>
                      {MOCK_VACANCIES.map((v) => (
                        <Select.Item key={v.id} value={v.id.toString()}>
                          {v.name ?? v.title}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">Грейд</Text>
                  <Select.Root value={addGradeId} onValueChange={setAddGradeId}>
                    <Select.Trigger />
                    <Select.Content>
                      {MOCK_GRADES.map((g) => (
                        <Select.Item key={g.id} value={g.id.toString()}>
                          {g.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
                <Flex gap="2">
                  <Box style={{ flex: 1 }}>
                    <Text size="2" weight="medium" mb="1" as="div">Зарплата от</Text>
                    <TextField.Root
                      placeholder="200000"
                      value={addSalaryFrom}
                      onChange={(e) => setAddSalaryFrom(e.target.value)}
                    />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="2" weight="medium" mb="1" as="div">Зарплата до</Text>
                    <TextField.Root
                      placeholder="300000"
                      value={addSalaryTo}
                      onChange={(e) => setAddSalaryTo(e.target.value)}
                    />
                  </Box>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">Локация</Text>
                  <TextField.Root
                    placeholder="Москва"
                    value={addLocation}
                    onChange={(e) => setAddLocation(e.target.value)}
                  />
                </Flex>
                <Flex justify="end" gap="2" mt="2">
                  <Button variant="soft" onClick={() => setAddModalOpen(false)}>Отмена</Button>
                  <Button onClick={handleAddBenchmark}>Сохранить</Button>
                </Flex>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          <Dialog.Root open={viewModalOpen} onOpenChange={setViewModalOpen}>
            <Dialog.Content
              style={{ maxWidth: 'min(560px, 96vw)' }}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Dialog.Title>Просмотр бенчмарка</Dialog.Title>
              <Dialog.Description size="2" color="gray" mb="2">
                Мок: данные из локальной записи; ссылки ведут в разделы приложения.
              </Dialog.Description>
              {viewBenchmarkLive && (
                <Box className={styles.viewDialogBody}>
                  <Flex direction="column" gap="3">
                    <Flex direction="column" gap="2">
                      <Text size="1" weight="bold" color="gray">
                        Общие
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">ID: </Text>
                        {viewBenchmarkLive.id}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Тип: </Text>
                        {getTypeLabel(viewBenchmarkLive.type)}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Специализация / роль: </Text>
                        {viewBenchmarkLive.vacancy_name}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Грейд: </Text>
                        {viewBenchmarkLive.grade_name}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Вилка (ЗП): </Text>
                        {viewBenchmarkLive.salary_display}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Локация: </Text>
                        {viewBenchmarkLive.location}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Статус записи: </Text>
                        {viewBenchmarkLive.is_active ? 'Активен' : 'Неактивен'}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Дата добавления: </Text>
                        {new Date(viewBenchmarkLive.date_added).toLocaleString('ru-RU')}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Обновлено: </Text>
                        {new Date(viewBenchmarkLive.updated_at).toLocaleString('ru-RU')}
                      </Text>
                    </Flex>

                    {viewBenchmarkLive.type === 'candidate' && (
                      <>
                        <Separator size="4" />
                        <Flex direction="column" gap="2">
                          <Text size="1" weight="bold" color="gray">
                            Кандидат
                          </Text>
                          {viewBenchmarkLive.linked_candidate_id != null && (
                            <Text size="2" as="div">
                              <Text weight="bold" as="span">Карточка в базе (ATS): </Text>
                              <Link
                                href={`/ats/vacancy/${viewBenchmarkLive.vacancy}/candidate/${viewBenchmarkLive.linked_candidate_id}`}
                              >
                                Открыть кандидата #{viewBenchmarkLive.linked_candidate_id}
                              </Link>
                            </Text>
                          )}
                          <Text size="2">
                            <Text weight="bold" as="span">Суммарный опыт: </Text>
                            {viewBenchmarkLive.total_experience_years != null
                              ? `${viewBenchmarkLive.total_experience_years} лет`
                              : '—'}
                          </Text>
                          <Text size="2">
                            <Text weight="bold" as="span">ЗП / ожидания: </Text>
                            {viewBenchmarkLive.salary_expectations_note ?? viewBenchmarkLive.salary_display}
                          </Text>
                          <Text size="2">
                            <Text weight="bold" as="span">Области и регионы (где работал): </Text>
                            {viewBenchmarkLive.work_regions_display ?? '—'}
                          </Text>
                        </Flex>
                      </>
                    )}

                    {viewBenchmarkLive.type === 'vacancy' && (
                      <>
                        <Separator size="4" />
                        <Flex direction="column" gap="2">
                          <Text size="1" weight="bold" color="gray">
                            Вакансия
                          </Text>
                          <Text size="2" as="div">
                            <Text weight="bold" as="span">Вакансия в системе: </Text>
                            <Link href={`/vacancies?edit=${viewBenchmarkLive.vacancy}`}>
                              Открыть карточку вакансии
                            </Link>
                          </Text>
                          {viewBenchmarkLive.hh_vacancy_id && (
                            <Text size="2" as="div">
                              <Text weight="bold" as="span">Источник / hh.ru: </Text>
                              <a
                                href={`https://hh.ru/vacancy/${viewBenchmarkLive.hh_vacancy_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Вакансия на HeadHunter
                              </a>
                            </Text>
                          )}
                          <Text size="2">
                            <Text weight="bold" as="span">Источник в системе: </Text>
                            {viewBenchmarkLive.vacancy_source_display ?? '—'}
                          </Text>
                          <Text size="2">
                            <Text weight="bold" as="span">Грейд и вилка: </Text>
                            {viewBenchmarkLive.grade_name} · {viewBenchmarkLive.salary_display}
                          </Text>
                          <Text size="2">
                            <Text weight="bold" as="span">Описание вакансии: </Text>
                          </Text>
                          <Text size="2" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
                            {viewBenchmarkLive.vacancy_description ?? '—'}
                          </Text>
                          {viewBenchmarkLive.domain_description && (
                            <Text size="2" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
                              <Text weight="bold" as="span" color="gray">Домен / контекст: </Text>
                              {viewBenchmarkLive.domain_description}
                            </Text>
                          )}
                        </Flex>
                      </>
                    )}

                    <Separator size="4" />
                    <Flex direction="column" gap="2">
                      <Text size="1" weight="bold" color="gray">
                        Дополнительные поля
                      </Text>
                      <Flex align="center" gap="2" wrap="wrap">
                        <Text size="2" weight="bold">
                          Формат работы:
                        </Text>
                        {viewBenchmarkLive.work_format
                          ? getWorkFormatBadge(viewBenchmarkLive.work_format)
                          : (
                            <Text size="2" color="gray">
                              —
                            </Text>
                          )}
                      </Flex>
                      <Text size="2">
                        <Text weight="bold" as="span">Компенсации: </Text>
                        {viewBenchmarkLive.compensation ?? '—'}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Бенефиты: </Text>
                        {viewBenchmarkLive.benefits ?? '—'}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Развитие: </Text>
                        {viewBenchmarkLive.development ?? '—'}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Технологии: </Text>
                        {viewBenchmarkLive.technologies ?? '—'}
                      </Text>
                      <Text size="2">
                        <Text weight="bold" as="span">Домен: </Text>
                        {viewBenchmarkLive.domain_display ?? viewBenchmarkLive.domain ?? '—'}
                      </Text>
                    </Flex>

                    {viewBenchmarkLive.notes && (
                      <>
                        <Separator size="4" />
                        <Text size="2">
                          <Text weight="bold" as="span">Заметки: </Text>
                          {viewBenchmarkLive.notes}
                        </Text>
                      </>
                    )}

                    <Flex justify="end" mt="2">
                      <Button variant="soft" onClick={() => setViewModalOpen(false)}>
                        Закрыть
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              )}
            </Dialog.Content>
          </Dialog.Root>

          <Dialog.Root open={editModalOpen} onOpenChange={setEditModalOpen}>
            <Dialog.Content style={{ maxWidth: 'min(560px, 96vw)' }}>
              <Dialog.Title>Редактирование бенчмарка</Dialog.Title>
              <Dialog.Description size="2" color="gray" mb="2">
                Мок: те же блоки, что в просмотре; изменения сохраняются локально (без API).
              </Dialog.Description>
              <Box className={styles.viewDialogBody}>
                <Flex direction="column" gap="3">
                  <Flex direction="column" gap="2">
                    <Text size="1" weight="bold" color="gray">
                      Общие
                    </Text>
                    {editBenchmarkId != null && (
                      <Text size="2" color="gray">
                        ID записи: {editBenchmarkId}
                      </Text>
                    )}
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Тип</Text>
                      <Select.Root
                        value={editType}
                        onValueChange={(v) => setEditType(v as 'candidate' | 'vacancy')}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value="candidate">Кандидат</Select.Item>
                          <Select.Item value="vacancy">Вакансия</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Специализация / роль</Text>
                      <Select.Root value={editVacancyId} onValueChange={setEditVacancyId}>
                        <Select.Trigger />
                        <Select.Content>
                          {MOCK_VACANCIES.map((v) => (
                            <Select.Item key={v.id} value={v.id.toString()}>
                              {v.name ?? v.title}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Грейд</Text>
                      <Select.Root value={editGradeId} onValueChange={setEditGradeId}>
                        <Select.Trigger />
                        <Select.Content>
                          {MOCK_GRADES.map((g) => (
                            <Select.Item key={g.id} value={g.id.toString()}>
                              {g.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Flex>
                    <Flex gap="2">
                      <Box style={{ flex: 1 }}>
                        <Text size="2" weight="medium" mb="1" as="div">
                          Зарплата от
                        </Text>
                        <TextField.Root
                          placeholder="200000"
                          value={editSalaryFrom}
                          onChange={(e) => setEditSalaryFrom(e.target.value)}
                        />
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text size="2" weight="medium" mb="1" as="div">
                          Зарплата до
                        </Text>
                        <TextField.Root
                          placeholder="300000"
                          value={editSalaryTo}
                          onChange={(e) => setEditSalaryTo(e.target.value)}
                        />
                      </Box>
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Локация</Text>
                      <TextField.Root
                        placeholder="Москва"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                      />
                    </Flex>
                    <Flex align="center" gap="2">
                      <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                      <Text size="2">Активная запись</Text>
                    </Flex>
                  </Flex>

                  {editType === 'candidate' && (
                    <>
                      <Separator size="4" />
                      <Flex direction="column" gap="2">
                        <Text size="1" weight="bold" color="gray">
                          Кандидат
                        </Text>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium">ID кандидата в базе (ATS)</Text>
                          <TextField.Root
                            placeholder="Например, 12042"
                            value={editLinkedCandidateId}
                            onChange={(e) => setEditLinkedCandidateId(e.target.value)}
                          />
                          <Text size="1" color="gray">
                            Ссылка в интерфейсе: /ats/vacancy/…/candidate/…
                          </Text>
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium">Суммарный опыт (лет)</Text>
                          <TextField.Root
                            inputMode="numeric"
                            placeholder="5"
                            value={editTotalExperienceYears}
                            onChange={(e) => setEditTotalExperienceYears(e.target.value)}
                          />
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium">ЗП / ожидания (текст)</Text>
                          <TextArea
                            rows={3}
                            placeholder="Ожидания по вилке, релокации и т.д."
                            value={editSalaryExpectationsNote}
                            onChange={(e) => setEditSalaryExpectationsNote(e.target.value)}
                          />
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium">Области и регионы (где работал)</Text>
                          <TextArea
                            rows={3}
                            placeholder="Регионы, отрасли, документированный опыт"
                            value={editWorkRegionsDisplay}
                            onChange={(e) => setEditWorkRegionsDisplay(e.target.value)}
                          />
                        </Flex>
                      </Flex>
                    </>
                  )}

                  {editType === 'vacancy' && (
                    <>
                      <Separator size="4" />
                      <Flex direction="column" gap="2">
                        <Text size="1" weight="bold" color="gray">
                          Вакансия
                        </Text>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium">ID вакансии на hh.ru</Text>
                          <TextField.Root
                            placeholder="12xxxxxxx"
                            value={editHhVacancyId}
                            onChange={(e) => setEditHhVacancyId(e.target.value)}
                          />
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium">Источник в системе</Text>
                          <TextField.Root
                            placeholder="HeadHunter, внутренняя база…"
                            value={editVacancySourceDisplay}
                            onChange={(e) => setEditVacancySourceDisplay(e.target.value)}
                          />
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium">Описание вакансии</Text>
                          <TextArea
                            rows={5}
                            placeholder="Полное описание, условия, стек…"
                            value={editVacancyDescription}
                            onChange={(e) => setEditVacancyDescription(e.target.value)}
                          />
                        </Flex>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium">Домен / контекст продукта</Text>
                          <TextArea
                            rows={3}
                            placeholder="Домен, команда, контекст"
                            value={editDomainDescription}
                            onChange={(e) => setEditDomainDescription(e.target.value)}
                          />
                        </Flex>
                      </Flex>
                    </>
                  )}

                  <Separator size="4" />
                  <Flex direction="column" gap="2">
                    <Text size="1" weight="bold" color="gray">
                      Дополнительные поля
                    </Text>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Формат работы</Text>
                      <Select.Root
                        value={editWorkFormat || 'none'}
                        onValueChange={(v) =>
                          setEditWorkFormat(v === 'none' ? '' : v)
                        }
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {WORK_FORMAT_EDIT_OPTIONS.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Компенсации</Text>
                      <TextField.Root
                        value={editCompensation}
                        onChange={(e) => setEditCompensation(e.target.value)}
                      />
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Бенефиты</Text>
                      <TextField.Root
                        value={editBenefits}
                        onChange={(e) => setEditBenefits(e.target.value)}
                      />
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Развитие</Text>
                      <TextField.Root
                        value={editDevelopment}
                        onChange={(e) => setEditDevelopment(e.target.value)}
                      />
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Технологии</Text>
                      <TextField.Root
                        value={editTechnologies}
                        onChange={(e) => setEditTechnologies(e.target.value)}
                      />
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Домен (ключ)</Text>
                      <TextField.Root
                        placeholder="saas, fintech…"
                        value={editDomainKey}
                        onChange={(e) => setEditDomainKey(e.target.value)}
                      />
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">Домен (отображение)</Text>
                      <TextField.Root
                        placeholder="SaaS, FinTech…"
                        value={editDomainDisplay}
                        onChange={(e) => setEditDomainDisplay(e.target.value)}
                      />
                    </Flex>
                  </Flex>

                  <Separator size="4" />
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">Заметки</Text>
                    <TextArea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </Flex>

                  <Flex justify="end" gap="2" mt="2">
                    <Button variant="soft" onClick={() => setEditModalOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleSaveEditBenchmark}>Сохранить</Button>
                  </Flex>
                </Flex>
              </Box>
            </Dialog.Content>
          </Dialog.Root>

          {/* Заголовок */}
          <Flex justify="between" align="center" wrap="wrap" gap="3">
            <Flex direction="column" gap="1">
              <Text size="6" weight="bold">Все бенчмарки</Text>
              <Text size="2" color="gray">
                Таблица, фильтры и добавление записей. Обзор и графики — на дашборде.
              </Text>
            </Flex>
            <Flex gap="2" wrap="wrap">
              <Button asChild size="3" variant="soft">
                <Link href="/finance/benchmarks">
                  <Flex align="center" gap="2">
                    <DashboardIcon width={16} height={16} />
                    Обзор
                  </Flex>
                </Link>
              </Button>
              <Button size="3" onClick={() => setAddModalOpen(true)}>
                <PlusIcon width={16} height={16} />
                Добавить бенчмарк
              </Button>
            </Flex>
          </Flex>

          {/* Фильтры */}
          <Card className={styles.filtersCard}>
            <Flex direction="column" gap="3">
              <Flex gap="3" align="center" wrap="nowrap" className={styles.filtersRow}>
                <Box className={styles.searchFieldWrap}>
                  <TextField.Root
                    placeholder="Поиск по специализации, грейду, локации..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                  >
                    <TextField.Slot>
                      <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>
                <Select.Root value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
                  <Select.Trigger placeholder="Тип" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="all">Все типы</Select.Item>
                    <Select.Item value="candidate">Кандидат</Select.Item>
                    <Select.Item value="vacancy">Вакансия</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Select.Root value={vacancyFilter || 'all'} onValueChange={(value) => setVacancyFilter(value === 'all' ? '' : value)}>
                  <Select.Trigger placeholder="Специализация" style={{ minWidth: '150px' }} />
                  <Select.Content>
                    <Select.Item value="all">Все специализации</Select.Item>
                    {vacancies.map(v => (
                      <Select.Item key={v.id} value={v.id.toString()}>{v.name}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Select.Root value={gradeFilter || 'all'} onValueChange={(value) => setGradeFilter(value === 'all' ? '' : value)}>
                  <Select.Trigger placeholder="Грейд" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="all">Все грейды</Select.Item>
                    {grades.map(g => (
                      <Select.Item key={g.id} value={g.id.toString()}>{g.name}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Select.Root value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                  <Select.Trigger placeholder="Статус" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="all">Все</Select.Item>
                    <Select.Item value="true">Активные</Select.Item>
                    <Select.Item value="false">Неактивные</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Flex align="center" gap="2" wrap="nowrap" className={styles.pageSizeActions}>
                  <Button variant="soft" onClick={handleReset}>
                    <ReloadIcon width={16} height={16} />
                    Сброс
                  </Button>
                  <Select.Root
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setPage(1)
                    }}
                  >
                    <Select.Trigger
                      style={{ minWidth: '72px' }}
                      aria-label="Строк на странице"
                    />
                    <Select.Content>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <Select.Item key={n} value={String(n)}>
                          {n}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* Дополнительные поля */}
          {enabledFields.length > 0 && (
            <Box className={styles.additionalFields}>
              <Text size="2" color="gray" className={styles.additionalFieldsInner} style={{ flexShrink: 0 }}>Дополнительные поля:</Text>
              <Flex gap="2" wrap="nowrap" className={styles.additionalFieldsInner}>
                {enabledFields.map((field: string) => (
                  <Button
                    key={field}
                    size="1"
                    variant={visibleFields[field] ? 'solid' : 'soft'}
                    onClick={() => toggleFieldVisibility(field)}
                    className={styles.fieldToggle}
                  >
                    {field === 'work_format' && 'Формат работы'}
                    {field === 'compensation' && 'Компенсации'}
                    {field === 'benefits' && 'Бенефиты'}
                    {field === 'development' && 'Развитие'}
                    {field === 'technologies' && 'Технологии'}
                    {field === 'domain' && 'Домен'}
                  </Button>
                ))}
              </Flex>
            </Box>
          )}

          {/* Таблица бенчмарков */}
          <Card>
            {tableRows.length === 0 ? (
              <Box p="6" style={{ textAlign: 'center' }}>
                <Text color="gray" size="3">Бенчмарки не найдены</Text>
                <Text color="gray" size="2" mt="2">
                  Попробуйте изменить фильтры или добавьте первый бенчмарк
                </Text>
              </Box>
            ) : (
              <Box className={styles.tableContainer}>
                <Box className={styles.tableNowrap}>
                  <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Специализация</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className={styles.salaryColumn}>Сумма</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Локация</Table.ColumnHeaderCell>
                      {visibleFields.work_format && enabledFields.includes('work_format') && (
                        <Table.ColumnHeaderCell>Формат работы</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.compensation && enabledFields.includes('compensation') && (
                        <Table.ColumnHeaderCell>Компенсации</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.benefits && enabledFields.includes('benefits') && (
                        <Table.ColumnHeaderCell>Бенефиты</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.development && enabledFields.includes('development') && (
                        <Table.ColumnHeaderCell>Развитие</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.technologies && enabledFields.includes('technologies') && (
                        <Table.ColumnHeaderCell>Технологии</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.domain && enabledFields.includes('domain') && (
                        <Table.ColumnHeaderCell>Домен</Table.ColumnHeaderCell>
                      )}
                      <Table.ColumnHeaderCell>Дата</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {tableRows.map((benchmark) => (
                      <Table.Row key={benchmark.id}>
                        <Table.Cell>
                          <Badge color={getTypeBadgeColor(benchmark.type)}>
                            <BackpackIcon width={12} height={12} style={{ marginRight: 4 }} />
                            {getTypeLabel(benchmark.type)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text weight="medium">{benchmark.vacancy_name}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge>{benchmark.grade_name}</Badge>
                        </Table.Cell>
                        <Table.Cell className={styles.salaryColumn}>
                          <Text>{benchmark.salary_display}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex align="center" gap="1">
                            <SewingPinFilledIcon width={12} height={12} />
                            <Text size="2">{benchmark.location}</Text>
                          </Flex>
                        </Table.Cell>
                        {visibleFields.work_format && enabledFields.includes('work_format') && (
                          <Table.Cell>
                            {getWorkFormatBadge(benchmark.work_format)}
                          </Table.Cell>
                        )}
                        {visibleFields.compensation && enabledFields.includes('compensation') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.compensation || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        {visibleFields.benefits && enabledFields.includes('benefits') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.benefits || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        {visibleFields.development && enabledFields.includes('development') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.development || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        {visibleFields.technologies && enabledFields.includes('technologies') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.technologies || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        {visibleFields.domain && enabledFields.includes('domain') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.domain_display || benchmark.domain || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        <Table.Cell>
                          <Flex align="center" gap="1">
                            <CalendarIcon width={12} height={12} />
                            <Text size="2" color="gray">
                              {new Date(benchmark.date_added).toLocaleDateString('ru-RU')}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            role="button"
                            tabIndex={0}
                            className={styles.statusBadgeClickable}
                            title="Нажмите, чтобы переключить активность"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleBenchmarkActive(benchmark.id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleBenchmarkActive(benchmark.id)
                              }
                            }}
                          >
                            <Badge color={benchmark.is_active ? 'green' : 'gray'}>
                              {benchmark.is_active ? 'Активен' : 'Неактивен'}
                            </Badge>
                          </span>
                        </Table.Cell>
                        <Table.Cell className={styles.actionsCell}>
                          <Flex gap="1">
                            {benchmark.hh_vacancy_id && (
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(`https://hh.ru/vacancy/${benchmark.hh_vacancy_id}`, '_blank')
                                }}
                                title="Открыть на hh.ru"
                              >
                                <ExternalLinkIcon width={14} height={14} />
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="1"
                              variant="soft"
                              title="Просмотр"
                              onClick={(e) => {
                                e.stopPropagation()
                                openViewBenchmark(benchmark)
                              }}
                            >
                              <EyeOpenIcon width={14} height={14} />
                            </Button>
                            <Button
                              type="button"
                              size="1"
                              variant="soft"
                              title="Редактировать"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditBenchmark(benchmark)
                              }}
                            >
                              <Pencil2Icon width={14} height={14} />
                            </Button>
                            <Button
                              type="button"
                              size="1"
                              variant="soft"
                              color="red"
                              title="Удалить"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteBenchmark(benchmark)
                              }}
                            >
                              <TrashIcon width={14} height={14} />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
                </Box>
              </Box>
            )}
          </Card>

          {/* Пагинация */}
          {totalFiltered > 0 && (
            <Flex
              justify="between"
              align="center"
              wrap="wrap"
              gap="3"
              className={styles.paginationRow}
            >
              <Text size="2" color="gray">
                Показано {rangeStart}–{rangeEnd} из {totalFiltered}
              </Text>
              {totalPages > 1 && (
                <Flex
                  justify="center"
                  align="center"
                  wrap="wrap"
                  gap="0"
                  className={styles.paginationButtonGroup}
                >
                  <Button
                    variant="soft"
                    size="2"
                    disabled={safePage === 1}
                    onClick={() => setPage(1)}
                    title="Первая страница"
                    aria-label="Первая страница"
                    style={{ borderRadius: '6px 0 0 6px' }}
                  >
                    <DoubleArrowLeftIcon width={16} height={16} />
                  </Button>
                  <Button
                    variant="soft"
                    size="2"
                    disabled={safePage === 1}
                    onClick={() => setPage(safePage - 1)}
                    title="Предыдущая страница"
                    aria-label="Предыдущая страница"
                    style={{ borderRadius: 0, borderLeft: '1px solid var(--gray-6)' }}
                  >
                    <ChevronLeftIcon width={16} height={16} />
                  </Button>
                  {pageNumbers.map((num) => (
                    <Button
                      key={num}
                      variant={num === safePage ? 'solid' : 'soft'}
                      size="2"
                      onClick={() => setPage(num)}
                      aria-label={`Страница ${num}`}
                      title={`Страница ${num}`}
                      style={{
                        borderRadius: 0,
                        borderLeft: '1px solid var(--gray-6)',
                        minWidth: '40px',
                      }}
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    variant="soft"
                    size="2"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                    title="Следующая страница"
                    aria-label="Следующая страница"
                    style={{ borderRadius: 0, borderLeft: '1px solid var(--gray-6)' }}
                  >
                    <ChevronRightIcon width={16} height={16} />
                  </Button>
                  <Button
                    variant="soft"
                    size="2"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(totalPages)}
                    title="Последняя страница"
                    aria-label="Последняя страница"
                    style={{ borderRadius: '0 6px 6px 0', borderLeft: '1px solid var(--gray-6)' }}
                  >
                    <DoubleArrowRightIcon width={16} height={16} />
                  </Button>
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
    </Box>
  )
}
