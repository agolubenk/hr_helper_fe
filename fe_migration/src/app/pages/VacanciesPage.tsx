/**
 * VacanciesPage — список вакансий, фильтры, карточки/список, модальное окно просмотра/редактирования.
 * Без AppLayout (обёртка в App.tsx). useSearchParams в Suspense.
 * Открытая модалка отражается в URL: vacancy, mode (view|edit), tab.
 * При tab=text дополнительно: textCountry (ключ страны, напр. by|pl), textOffice (id офиса внутри страны).
 */

import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { useState, useEffect, Suspense, useCallback, useMemo } from 'react'
import { useSearchParams } from '@/router-adapter'
import VacanciesSearchFilters from '@/components/vacancies/VacanciesSearchFilters'
import VacanciesStats from '@/components/vacancies/VacanciesStats'
import VacancyCard from '@/components/vacancies/VacancyCard'
import VacancyListItem from '@/components/vacancies/VacancyListItem'
import VacancyEditModal, {
  parseVacancySettingsTab,
  parseVacancyTextCountryKey,
  parseVacancyTextOfficeId,
} from '@/components/vacancies/VacancyEditModal'
import { GridIcon, ListBulletIcon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import styles from './styles/VacanciesPage.module.css'

type VacancyItem = {
  id: number
  title: string
  status: 'active' | 'inactive'
  recruiter: string
  recruiterExtraCount?: number
  locations: string[]
  interviewers: number
  date: string | null
  hasWarning: boolean
  /** Текст предупреждения (если нет incompleteSections) */
  warningText?: string
  /** Названия разделов настроек, которые не заполнены — для формата «Не заполнены X, Y и еще N полей» */
  incompleteSections?: string[]
}

/** Форматирует предупреждение: «Не заполнены вопросы и ссылки и еще 8 полей». */
function formatIncompleteSectionsWarning(incompleteSections: string[]): string {
  if (incompleteSections.length === 0) return ''
  if (incompleteSections.length === 1) return `Не заполнены ${incompleteSections[0]}`
  if (incompleteSections.length === 2) return `Не заполнены ${incompleteSections[0]} и ${incompleteSections[1]}`
  return `Не заполнены ${incompleteSections[0]}, ${incompleteSections[1]} и еще ${incompleteSections.length - 2} полей`
}

function getVacancyWarningText(v: VacancyItem): string | undefined {
  if (!v.hasWarning) return undefined
  if (v.incompleteSections?.length) return formatIncompleteSectionsWarning(v.incompleteSections)
  return v.warningText
}

const mockVacancies: VacancyItem[] = [
  { id: 4090046, title: 'AQA Engineer (TS)', status: 'inactive', recruiter: 'Andrei Golubenko', recruiterExtraCount: 2, locations: ['Минск', 'Удалённо'], interviewers: 0, date: '25.10.2025', hasWarning: true, incompleteSections: ['Вопросы и ссылки', 'Зарплатные вилки'] },
  { id: 3993218, title: 'UX/UI Designer', status: 'inactive', recruiter: 'Andrei Golubenko', locations: [], interviewers: 0, date: '22.09.2025', hasWarning: true, incompleteSections: ['Вопросы и ссылки', 'Зарплатные вилки', 'Статусы', 'Встречи и интервью', 'Scorecard', 'Обработка данных', 'История правок', 'Текст вакансии', 'Связи и интеграции'] },
  { id: 4020335, title: 'System Administrator', status: 'inactive', recruiter: 'Andrei Golubenko', recruiterExtraCount: 1, locations: ['Гомель'], interviewers: 0, date: '22.09.2025', hasWarning: true, incompleteSections: ['Зарплатные вилки'] },
  { id: 4092269, title: 'Manual QA Engineer', status: 'inactive', recruiter: 'Andrei Golubenko', locations: [], interviewers: 0, date: null, hasWarning: false },
  { id: 3979419, title: 'DevOps Engineer', status: 'inactive', recruiter: 'Andrei Golubenko', locations: ['Минск', 'Удалённо', 'Польша'], interviewers: 0, date: null, hasWarning: false },
  { id: 3936534, title: 'Project Manager', status: 'active', recruiter: 'Andrei Golubenko', recruiterExtraCount: 2, locations: ['Минск'], interviewers: 2, date: null, hasWarning: false },
  { id: 4090047, title: 'Frontend Engineer', status: 'active', recruiter: 'Andrei Golubenko', locations: ['Минск', 'Удалённо'], interviewers: 1, date: '26.10.2025', hasWarning: false },
  { id: 4090048, title: 'Backend Engineer', status: 'inactive', recruiter: 'Andrei Golubenko', recruiterExtraCount: 1, locations: ['Варшава', 'Удалённо'], interviewers: 0, date: '20.10.2025', hasWarning: true, incompleteSections: ['Вопросы и ссылки', 'Зарплатные вилки'] },
]

function clearVacancyModalParams(prev: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(prev)
  next.delete('vacancy')
  next.delete('mode')
  next.delete('tab')
  next.delete('edit')
  next.delete('textCountry')
  next.delete('textOffice')
  return next
}

function VacanciesPageContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vacancies, setVacancies] = useState<VacancyItem[]>(() => [...mockVacancies])
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [statusOverrides, setStatusOverrides] = useState<Record<number, 'active' | 'inactive'>>({})

  useEffect(() => {
    const editLegacy = searchParams.get('edit')
    const hasVacancy = searchParams.get('vacancy')
    if (editLegacy && !hasVacancy) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('vacancy', editLegacy)
          next.set('mode', 'edit')
          next.delete('edit')
          return next
        },
        { replace: true }
      )
    }
  }, [searchParams, setSearchParams])

  const modalVacancyId = useMemo(() => {
    const raw = searchParams.get('vacancy')
    if (raw == null || raw === '') return null
    const n = parseInt(raw, 10)
    return Number.isNaN(n) ? null : n
  }, [searchParams])

  const modalMode = searchParams.get('mode') === 'edit' ? 'edit' : 'view'
  const settingsTab = useMemo(() => parseVacancySettingsTab(searchParams.get('tab')), [searchParams])
  const modalOpen = modalVacancyId != null

  const setModalSearch = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          mutate(next)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const openVacancyModal = useCallback(
    (id: number, mode: 'view' | 'edit') => {
      setModalSearch((p) => {
        p.set('vacancy', String(id))
        p.set('mode', mode)
        p.delete('tab')
        p.delete('textCountry')
        p.delete('textOffice')
      })
    },
    [setModalSearch]
  )

  const handleTextTabCountryKeyChange = useCallback(
    (countryKey: string) => {
      setModalSearch((p) => {
        if (modalVacancyId != null) p.set('vacancy', String(modalVacancyId))
        p.set('mode', modalMode)
        p.set('tab', 'text')
        p.set('textCountry', countryKey)
        const firstOffice = parseVacancyTextOfficeId(countryKey, null)
        if (firstOffice) p.set('textOffice', firstOffice)
        else p.delete('textOffice')
      })
    },
    [setModalSearch, modalVacancyId, modalMode]
  )

  const handleTextTabOfficeIdChange = useCallback(
    (officeId: string | null) => {
      setModalSearch((p) => {
        if (modalVacancyId != null) p.set('vacancy', String(modalVacancyId))
        p.set('mode', modalMode)
        p.set('tab', 'text')
        const c = p.get('textCountry') ?? parseVacancyTextCountryKey(null)
        p.set('textCountry', c)
        if (officeId) p.set('textOffice', officeId)
        else p.delete('textOffice')
      })
    },
    [setModalSearch, modalVacancyId, modalMode]
  )

  useEffect(() => {
    if (!modalOpen || modalMode !== 'edit' || settingsTab !== 'text') return
    const hasCo = searchParams.get('textCountry')
    const co = parseVacancyTextCountryKey(hasCo)
    const ofDef = parseVacancyTextOfficeId(co, searchParams.get('textOffice'))
    const needsCo = !hasCo
    const needsOf = ofDef != null && !searchParams.get('textOffice')
    if (!needsCo && !needsOf) return
    setModalSearch((p) => {
      const next = new URLSearchParams(p)
      if (modalVacancyId != null) next.set('vacancy', String(modalVacancyId))
      next.set('mode', 'edit')
      if (needsCo) next.set('textCountry', co)
      if (needsOf && ofDef) next.set('textOffice', ofDef)
      return next
    })
  }, [modalOpen, modalMode, settingsTab, modalVacancyId, setModalSearch, searchParams])

  const closeVacancyModal = useCallback(() => {
    setSearchParams((prev) => clearVacancyModalParams(prev), { replace: true })
  }, [setSearchParams])

  const getStatus = (v: VacancyItem) => statusOverrides[v.id] ?? v.status

  const totalVacancies = vacancies.length
  const activeVacancies = vacancies.filter(v => getStatus(v) === 'active').length
  const inactiveVacancies = vacancies.filter(v => getStatus(v) === 'inactive').length

  const filteredVacancies = vacancies.filter(vacancy => {
    const status = getStatus(vacancy)
    const matchesSearch = !searchQuery ||
      vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.id.toString().includes(searchQuery)
    const matchesRecruiter = selectedRecruiter === 'all' || vacancy.recruiter === selectedRecruiter
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus
    return matchesSearch && matchesRecruiter && matchesStatus
  })

  const handleStatCardClick = useCallback((status: 'all' | 'active' | 'inactive') => {
    setSelectedStatus(status)
  }, [])

  const activeModalVacancy = modalVacancyId != null ? vacancies.find(x => x.id === modalVacancyId) : undefined

  return (
    <Box data-tour="vacancies-page" className={styles.vacanciesContainer}>
      <VacanciesSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRecruiter={selectedRecruiter}
        onRecruiterChange={setSelectedRecruiter}
        selectedStatus={selectedStatus}
        onStatusChange={(v) => setSelectedStatus(v as 'all' | 'active' | 'inactive')}
      />
      <VacanciesStats
        total={totalVacancies}
        active={activeVacancies}
        inactive={inactiveVacancies}
        selectedStatus={selectedStatus}
        onStatusCardClick={handleStatCardClick}
      />
      <Flex data-tour="vacancies-toolbar" justify="between" align="center" className={styles.sectionHeader}>
        <Flex align="center" gap="2">
          <HamburgerMenuIcon width={20} height={20} />
          <Text size="5" weight="bold">Вакансии</Text>
        </Flex>
        <Flex align="center" gap="3">
          <Flex gap="1" className={styles.viewToggle}>
            <Button variant={viewMode === 'cards' ? 'solid' : 'soft'} size="2" onClick={() => setViewMode('cards')} className={styles.viewButton}>
              <GridIcon width={16} height={16} />
            </Button>
            <Button variant={viewMode === 'list' ? 'solid' : 'soft'} size="2" onClick={() => setViewMode('list')} className={styles.viewButton}>
              <ListBulletIcon width={16} height={16} />
            </Button>
          </Flex>
          <Button size="3" className={styles.addButton}>+ Добавить вакансию</Button>
        </Flex>
      </Flex>
      {viewMode === 'cards' ? (
        <Box className={styles.cardsGrid}>
          {filteredVacancies.map(vacancy => (
            <VacancyCard
              key={vacancy.id}
              vacancy={{ ...vacancy, status: getStatus(vacancy), warningText: getVacancyWarningText(vacancy) }}
              onClick={() => openVacancyModal(vacancy.id, 'view')}
              onEditClick={() => openVacancyModal(vacancy.id, 'edit')}
              onStatusClick={() => { const s = getStatus(vacancy); setStatusOverrides(prev => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' })) }}
            />
          ))}
        </Box>
      ) : (
        <Box className={styles.listContainer}>
          {filteredVacancies.map(vacancy => (
            <VacancyListItem
              key={vacancy.id}
              vacancy={{ ...vacancy, status: getStatus(vacancy), warningText: getVacancyWarningText(vacancy) }}
              onClick={() => openVacancyModal(vacancy.id, 'view')}
              onEditClick={() => openVacancyModal(vacancy.id, 'edit')}
              onStatusClick={() => { const s = getStatus(vacancy); setStatusOverrides(prev => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' })) }}
            />
          ))}
        </Box>
      )}
      <VacancyEditModal
        open={modalOpen}
        onOpenChange={(open) => { if (!open) closeVacancyModal() }}
        vacancyId={modalVacancyId}
        mode={modalMode}
        vacancy={activeModalVacancy ? { ...activeModalVacancy, status: statusOverrides[activeModalVacancy.id] ?? activeModalVacancy.status, warningText: getVacancyWarningText(activeModalVacancy) } : null}
        vacancyStatus={activeModalVacancy ? (statusOverrides[activeModalVacancy.id] ?? activeModalVacancy.status) : undefined}
        onVacancyStatusChange={(status) => {
          if (modalVacancyId == null) return
          setStatusOverrides(prev => ({ ...prev, [modalVacancyId]: status }))
        }}
        onSwitchToEdit={modalMode === 'view' && modalVacancyId != null ? () => {
          setModalSearch((p) => {
            p.set('vacancy', String(modalVacancyId))
            p.set('mode', 'edit')
          })
        } : undefined}
        vacancyTitle={activeModalVacancy?.title}
        settingsTab={settingsTab}
        onSettingsTabChange={(tab) => {
          setModalSearch((p) => {
            if (modalVacancyId != null) p.set('vacancy', String(modalVacancyId))
            p.set('mode', modalMode)
            p.set('tab', tab)
            if (tab !== 'text') {
              p.delete('textCountry')
              p.delete('textOffice')
            }
          })
        }}
        textTabCountryKey={modalMode === 'edit' ? searchParams.get('textCountry') : null}
        onTextTabCountryKeyChange={modalMode === 'edit' ? handleTextTabCountryKeyChange : undefined}
        textTabOfficeId={modalMode === 'edit' ? searchParams.get('textOffice') : null}
        onTextTabOfficeIdChange={modalMode === 'edit' ? handleTextTabOfficeIdChange : undefined}
        onDelete={(id) => {
          setVacancies((prev) => prev.filter((v) => v.id !== id))
          setStatusOverrides((prev) => {
            const next = { ...prev }
            delete next[id]
            return next
          })
          closeVacancyModal()
        }}
      />
    </Box>
  )
}

export function VacanciesPage() {
  return (
    <Suspense fallback={<Box p="4"><Text>Загрузка…</Text></Box>}>
      <VacanciesPageContent />
    </Suspense>
  )
}
