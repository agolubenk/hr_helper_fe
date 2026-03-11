/**
 * SLASettings - настройки SLA для вакансий
 */
import {
  Box,
  Flex,
  Text,
  Button,
  Card,
  Table,
  Select,
  Callout,
} from '@radix-ui/themes'
import {
  ClockIcon,
  CheckIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
  Pencil1Icon,
  DownloadIcon,
  UploadIcon,
  InfoCircledIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import SLAEditModal, { type SLA } from './SLAEditModal'
import styles from './SLASettings.module.css'

const mockSLAs: SLA[] = [
  { id: '1', vacancy: 'Backend Engineer (Java)', grade: 'Head', timeToOffer: 90, timeToHire: 120, status: 'active', createdAt: '24.10.2025' },
  { id: '2', vacancy: 'Backend Engineer (Java)', grade: 'Junior', timeToOffer: 24, timeToHire: 30, status: 'active', createdAt: '24.10.2025' },
  { id: '3', vacancy: 'Frontend Engineer (React)', grade: 'Middle', timeToOffer: 35, timeToHire: 45, status: 'active', createdAt: '23.10.2025' },
  { id: '4', vacancy: 'Frontend Engineer (React)', grade: 'Senior', timeToOffer: 50, timeToHire: 65, status: 'active', createdAt: '23.10.2025' },
  { id: '5', vacancy: 'DevOps Engineer', grade: 'Middle+', timeToOffer: 40, timeToHire: 55, status: 'active', createdAt: '22.10.2025' },
]

const mockVacancies = ['Все вакансии', 'Backend Engineer (Java)', 'Frontend Engineer (React)', 'DevOps Engineer']
const mockGrades = ['Все грейды', 'Head', 'Junior', 'Junior+', 'Middle', 'Middle+', 'Senior', 'Lead']

export default function SLASettings() {
  const navigate = useNavigate()
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)
  const [selectedVacancy, setSelectedVacancy] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null)
  const [slas, setSlas] = useState<SLA[]>(mockSLAs)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  const filteredSLAs = slas.filter(sla => {
    const matchesVacancy = selectedVacancy === 'all' || sla.vacancy === selectedVacancy
    const matchesGrade = selectedGrade === 'all' || sla.grade === selectedGrade
    const matchesStatus = selectedStatus === 'all' || sla.status === selectedStatus
    return matchesVacancy && matchesGrade && matchesStatus
  })

  const totalPages = Math.ceil(filteredSLAs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSLAs = filteredSLAs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedVacancy, selectedGrade, selectedStatus])

  const totalSLAs = slas.length
  const possibleSLAs = 15
  const coverage = possibleSLAs > 0 ? ((totalSLAs / possibleSLAs) * 100).toFixed(1) : '0'
  const allSLAsCreated = totalSLAs >= possibleSLAs

  const handleEdit = (sla: SLA) => {
    setSelectedSLA(sla)
    setIsEditModalOpen(true)
  }

  const handleSaveSLA = (updatedSLA: SLA) => {
    setSlas(prev => prev.map(s => (s.id === updatedSLA.id ? updatedSLA : s)))
  }

  return (
    <Box className={styles.container}>
      <Flex justify="between" align="center" mb="4">
        <Flex align="center" gap="2">
          <ClockIcon width={24} height={24} />
          <Text size="6" weight="bold">SLA для вакансий</Text>
        </Flex>
        <Flex gap="3">
          <Button variant="soft" color={allSLAsCreated ? 'green' : 'gray'} size="2">
            <CheckIcon width={16} height={16} />
            Все SLA созданы
          </Button>
          <Button
            variant="soft"
            color="pink"
            size="2"
            onClick={() => navigate({ to: '/hiring-requests' })}
          >
            <ArrowLeftIcon width={20} height={20} />
            К заявкам
          </Button>
        </Flex>
      </Flex>

      <Callout.Root color="blue" mb="4">
        <Callout.Icon><InfoCircledIcon width={16} height={16} /></Callout.Icon>
        <Callout.Text>
          SLA (Service Level Agreement) определяет целевые сроки для закрытия вакансии конкретного грейда.
          При создании заявки SLA автоматически подтягивается по паре Вакансия + Грейд.
        </Callout.Text>
      </Callout.Root>

      <Flex gap="4" mb="4">
        <Card className={styles.metricCard} style={{ flex: 1 }}>
          <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>Покрытие SLA</Text>
          <Flex align="center" gap="3">
            <Text size="5" weight="bold">{coverage}%</Text>
            <Box style={{ flex: 1, background: 'var(--gray-4)', borderRadius: '4px', height: '8px', position: 'relative', overflow: 'hidden' }}>
              <Box
                style={{
                  background: 'var(--accent-9)',
                  height: '100%',
                  width: `${Math.min(parseFloat(coverage), 100)}%`,
                  borderRadius: '4px',
                }}
              />
            </Box>
          </Flex>
          <Text size="2" color="gray" mt="2" style={{ display: 'block' }}>
            {totalSLAs} из {possibleSLAs} возможных SLA
          </Text>
        </Card>

        <Card className={styles.metricCard} style={{ flex: 1 }}>
          <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>Статус системы</Text>
          <Flex gap="2">
            <Button size="2" variant="soft" onClick={() => alert('Импорт Excel будет реализован')}>
              <UploadIcon width={16} height={16} />
              Импорт Excel
            </Button>
            <Button size="2" variant="soft" onClick={() => alert('Экспорт Excel будет реализован')}>
              <DownloadIcon width={16} height={16} />
              Экспорт Excel
            </Button>
          </Flex>
        </Card>
      </Flex>

      <Card className={styles.card} mb="4">
        <Flex justify="between" align="center" mb="3">
          <Text size="4" weight="bold">Фильтры</Text>
          <Button variant="ghost" size="1" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
            {isFiltersOpen ? 'Свернуть' : 'Развернуть'}
          </Button>
        </Flex>

        {isFiltersOpen && (
          <Flex direction="column" gap="3">
            <Flex gap="3" wrap="wrap">
              <Box style={{ flex: 1, minWidth: '200px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Вакансия</Text>
                <Select.Root value={selectedVacancy} onValueChange={setSelectedVacancy}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="all">Все вакансии</Select.Item>
                    {mockVacancies.filter(v => v !== 'Все вакансии').map(vacancy => (
                      <Select.Item key={vacancy} value={vacancy}>{vacancy}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box style={{ flex: 1, minWidth: '200px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Грейд</Text>
                <Select.Root value={selectedGrade} onValueChange={setSelectedGrade}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="all">Все грейды</Select.Item>
                    {mockGrades.filter(g => g !== 'Все грейды').map(grade => (
                      <Select.Item key={grade} value={grade}>{grade}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box style={{ flex: 1, minWidth: '200px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Статус</Text>
                <Select.Root value={selectedStatus} onValueChange={setSelectedStatus}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="all">Все статусы</Select.Item>
                    <Select.Item value="active">Активен</Select.Item>
                    <Select.Item value="inactive">Неактивен</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            <Flex gap="3">
              <Button size="3" variant="solid">
                <MagnifyingGlassIcon width={16} height={16} />
                Применить фильтры
              </Button>
              <Button
                size="3"
                variant="soft"
                onClick={() => {
                  setSelectedVacancy('all')
                  setSelectedGrade('all')
                  setSelectedStatus('all')
                }}
              >
                <Cross2Icon width={16} height={16} />
                Сбросить
              </Button>
            </Flex>
          </Flex>
        )}
      </Card>

      <Card className={styles.card}>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Time-to-Offer</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Time-to-Hire</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Создано</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedSLAs.map(sla => (
              <Table.Row key={sla.id}>
                <Table.Cell><Text size="2" weight="medium">{sla.vacancy}</Text></Table.Cell>
                <Table.Cell>
                  <Box className={styles.gradeTag}><Text size="1" weight="medium">{sla.grade}</Text></Box>
                </Table.Cell>
                <Table.Cell>
                  <Box className={styles.timeTag}><Text size="1" weight="medium">{sla.timeToOffer} дней</Text></Box>
                </Table.Cell>
                <Table.Cell>
                  <Box className={styles.timeTag}><Text size="1" weight="medium">{sla.timeToHire} дней</Text></Box>
                </Table.Cell>
                <Table.Cell>
                  <Box className={`${styles.statusTag} ${sla.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    <Text size="1" weight="bold">{sla.status === 'active' ? 'Активен' : 'Неактивен'}</Text>
                  </Box>
                </Table.Cell>
                <Table.Cell><Text size="2" color="gray">{sla.createdAt}</Text></Table.Cell>
                <Table.Cell>
                  <Button variant="ghost" size="1" className={styles.actionButton} onClick={() => handleEdit(sla)}>
                    <Pencil1Icon width={14} height={14} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>

      {totalPages > 1 && (
        <Flex justify="center" align="center" gap="0" mt="4" className={styles.pagination}>
          <Button variant="soft" size="2" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
            <DoubleArrowLeftIcon width={16} height={16} />
          </Button>
          <Button variant="soft" size="2" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
            <ChevronLeftIcon width={16} height={16} />
          </Button>
          <Box className={styles.paginationPageInfo}>
            <Text size="2" weight="medium" style={{ color: '#ffffff' }}>
              Страница {currentPage} из {totalPages}
            </Text>
          </Box>
          <Button variant="soft" size="2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
            <ChevronRightIcon width={16} height={16} />
          </Button>
          <Button variant="soft" size="2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
            <DoubleArrowRightIcon width={16} height={16} />
          </Button>
        </Flex>
      )}

      <SLAEditModal
        sla={selectedSLA}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSLA(null)
        }}
        onSave={handleSaveSLA}
      />
    </Box>
  )
}
