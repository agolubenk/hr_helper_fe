'use client'

import { Badge, Box, Button, Card, Flex, Select, Table, Text, TextField } from '@radix-ui/themes'
import { MagnifyingGlassIcon, Pencil2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/shared/components/feedback/Toast'
import { fetchBenchmarksMock } from './mocks'
import type { Benchmark, Grade, Vacancy } from './types'
import styles from './BenchmarksPage.module.css'

const ALL_VALUE = '__all__'
type StatusFilter = typeof ALL_VALUE | 'active' | 'inactive'

export function BenchmarksPage() {
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [vacancies, setVacancies] = useState<Vacancy[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(ALL_VALUE)
  const [vacancyFilter, setVacancyFilter] = useState<string>(ALL_VALUE)
  const [gradeFilter, setGradeFilter] = useState<string>(ALL_VALUE)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_VALUE)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchBenchmarksMock()
      .then((data) => {
        if (cancelled) return
        setBenchmarks(data.benchmarks)
        setGrades(data.grades)
        setVacancies(data.vacancies)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return benchmarks.filter((b) => {
      if (q) {
        const hay = `${b.vacancy_name} ${b.grade_name} ${b.location}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (typeFilter !== ALL_VALUE && b.type !== typeFilter) return false
      if (vacancyFilter !== ALL_VALUE && String(b.vacancy) !== vacancyFilter) return false
      if (gradeFilter !== ALL_VALUE && String(b.grade) !== gradeFilter) return false
      if (statusFilter === 'active' && !b.is_active) return false
      if (statusFilter === 'inactive' && b.is_active) return false
      return true
    })
  }, [benchmarks, gradeFilter, searchQuery, statusFilter, typeFilter, vacancyFilter])

  const stats = useMemo(() => {
    const total = benchmarks.length
    const active = benchmarks.filter((b) => b.is_active).length
    return { total, active }
  }, [benchmarks])

  const handleDelete = (b: Benchmark) => {
    toast.showWarning('Удалить бенчмарк?', `Удалить "${b.vacancy_name}" (${b.grade_name})?`, {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => setBenchmarks((prev) => prev.filter((x) => x.id !== b.id)),
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Text size="6" weight="bold">
            Бенчмарки
          </Text>
          <Button onClick={() => toast.showInfo('Скоро', 'Создание бенчмарка будет добавлено позже')}>
            <PlusIcon />
            Добавить
          </Button>
        </Flex>

        <Box className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <Text size="2" color="gray">
              Всего
            </Text>
            <Text size="6" weight="bold">
              {stats.total}
            </Text>
          </Card>
          <Card className={styles.statCard}>
            <Text size="2" color="gray">
              Активные
            </Text>
            <Text size="6" weight="bold">
              {stats.active}
            </Text>
          </Card>
        </Box>

        <Card className={styles.filtersCard}>
          <Flex gap="3" wrap="wrap" align="end">
            <Box style={{ flex: 1, minWidth: 260 }}>
              <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                Поиск
              </Text>
              <TextField.Root value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Вакансия, грейд, локация">
                <TextField.Slot>
                  <MagnifyingGlassIcon />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            <Box>
              <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                Тип
              </Text>
              <Select.Root value={typeFilter} onValueChange={setTypeFilter}>
                <Select.Trigger placeholder="Все" style={{ minWidth: 160 }} />
                <Select.Content>
                  <Select.Item value={ALL_VALUE}>Все</Select.Item>
                  <Select.Item value="candidate">Кандидат</Select.Item>
                  <Select.Item value="vacancy">Вакансия</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                Вакансия
              </Text>
              <Select.Root value={vacancyFilter} onValueChange={setVacancyFilter}>
                <Select.Trigger placeholder="Все" style={{ minWidth: 200 }} />
                <Select.Content>
                  <Select.Item value={ALL_VALUE}>Все</Select.Item>
                  {vacancies.map((v) => (
                    <Select.Item key={v.id} value={String(v.id)}>
                      {v.title}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                Грейд
              </Text>
              <Select.Root value={gradeFilter} onValueChange={setGradeFilter}>
                <Select.Trigger placeholder="Все" style={{ minWidth: 160 }} />
                <Select.Content>
                  <Select.Item value={ALL_VALUE}>Все</Select.Item>
                  {grades.map((g) => (
                    <Select.Item key={g.id} value={String(g.id)}>
                      {g.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                Статус
              </Text>
              <Select.Root value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <Select.Trigger placeholder="Все" style={{ minWidth: 160 }} />
                <Select.Content>
                  <Select.Item value={ALL_VALUE}>Все</Select.Item>
                  <Select.Item value="active">Активные</Select.Item>
                  <Select.Item value="inactive">Неактивные</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>
        </Card>

        <Card>
          <Box className={styles.tableContainer}>
            <Table.Root className={styles.table} variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Локация</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>ЗП</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={7}>
                      <Text size="2" color="gray">
                        Загрузка…
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ) : filtered.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={7}>
                      <Text size="2" color="gray">
                        Ничего не найдено
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filtered.map((b) => (
                    <Table.Row key={b.id}>
                      <Table.Cell>
                        <Badge color={b.type === 'candidate' ? 'blue' : 'green'}>{b.type === 'candidate' ? 'Кандидат' : 'Вакансия'}</Badge>
                      </Table.Cell>
                      <Table.Cell>{b.vacancy_name}</Table.Cell>
                      <Table.Cell>{b.grade_name}</Table.Cell>
                      <Table.Cell>{b.location}</Table.Cell>
                      <Table.Cell>{b.salary_display}</Table.Cell>
                      <Table.Cell>
                        <Badge color={b.is_active ? 'green' : 'gray'}>{b.is_active ? 'Активен' : 'Неактивен'}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="2">
                          <Button variant="soft" color="gray" onClick={() => toast.showInfo('Скоро', 'Редактирование будет добавлено позже')}>
                            <Pencil2Icon />
                          </Button>
                          <Button variant="soft" color="red" onClick={() => handleDelete(b)}>
                            <TrashIcon />
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Card>
      </Flex>
    </Box>
  )
}

