/**
 * VacanciesPage — список вакансий, фильтры, карточки/список, модальное окно просмотра/редактирования.
 * Без AppLayout (обёртка в App.tsx). useSearchParams в Suspense.
 */

import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from '@/router-adapter'
import VacanciesSearchFilters from '@/components/vacancies/VacanciesSearchFilters'
import VacanciesStats from '@/components/vacancies/VacanciesStats'
import VacancyCard from '@/components/vacancies/VacancyCard'
import VacancyListItem from '@/components/vacancies/VacancyListItem'
import VacancyEditModal from '@/components/vacancies/VacancyEditModal'
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

function VacanciesPageContent() {
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewVacancyId, setViewVacancyId] = useState<number | null>(null)
  const [editVacancyId, setEditVacancyId] = useState<number | null>(null)
  const [statusOverrides, setStatusOverrides] = useState<Record<number, 'active' | 'inactive'>>({})

  const getStatus = (v: VacancyItem) => statusOverrides[v.id] ?? v.status

  useEffect(() => {
    const id = searchParams.get('edit')
    if (!id) return
    const n = parseInt(id, 10)
    if (!isNaN(n)) { setEditVacancyId(n); setViewVacancyId(null) }
  }, [searchParams])

  const totalVacancies = mockVacancies.length
  const activeVacancies = mockVacancies.filter(v => getStatus(v) === 'active').length
  const inactiveVacancies = mockVacancies.filter(v => getStatus(v) === 'inactive').length

  const filteredVacancies = mockVacancies.filter(vacancy => {
    const status = getStatus(vacancy)
    const matchesSearch = !searchQuery ||
      vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.id.toString().includes(searchQuery)
    const matchesRecruiter = selectedRecruiter === 'all' || vacancy.recruiter === selectedRecruiter
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus
    return matchesSearch && matchesRecruiter && matchesStatus
  })

  return (
    <Box data-tour="vacancies-page" className={styles.vacanciesContainer}>
      <VacanciesSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRecruiter={selectedRecruiter}
        onRecruiterChange={setSelectedRecruiter}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <VacanciesStats total={totalVacancies} active={activeVacancies} inactive={inactiveVacancies} />
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
              onClick={() => { setViewVacancyId(vacancy.id); setEditVacancyId(null) }}
              onEditClick={() => { setEditVacancyId(vacancy.id); setViewVacancyId(null) }}
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
              onClick={() => { setViewVacancyId(vacancy.id); setEditVacancyId(null) }}
              onEditClick={() => { setEditVacancyId(vacancy.id); setViewVacancyId(null) }}
              onStatusClick={() => { const s = getStatus(vacancy); setStatusOverrides(prev => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' })) }}
            />
          ))}
        </Box>
      )}
      <VacancyEditModal
        open={!!(editVacancyId || viewVacancyId)}
        onOpenChange={(open) => { if (!open) { setEditVacancyId(null); setViewVacancyId(null) } }}
        vacancyId={editVacancyId ?? viewVacancyId}
        mode={viewVacancyId ? 'view' : 'edit'}
        vacancy={(() => { const id = editVacancyId ?? viewVacancyId; const v = id != null ? mockVacancies.find(x => x.id === id) : undefined; return v ? { ...v, status: statusOverrides[v.id] ?? v.status, warningText: getVacancyWarningText(v) } : null })()}
        vacancyStatus={(() => { const id = editVacancyId ?? viewVacancyId; const v = id != null ? mockVacancies.find(x => x.id === id) : undefined; return v ? (statusOverrides[v.id] ?? v.status) : undefined })()}
        onVacancyStatusChange={(status) => { const id = editVacancyId ?? viewVacancyId; if (id != null) setStatusOverrides(prev => ({ ...prev, [id]: status })) }}
        onSwitchToEdit={viewVacancyId != null ? () => { setEditVacancyId(viewVacancyId); setViewVacancyId(null) } : undefined}
        vacancyTitle={mockVacancies.find(v => v.id === (editVacancyId ?? viewVacancyId))?.title}
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
