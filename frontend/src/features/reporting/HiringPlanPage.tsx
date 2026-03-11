'use client'

import { Box, Button, Card, Flex, Select, Table, Text, TextField } from '@radix-ui/themes'
import { CalendarIcon, ListBulletIcon } from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

const ALL_VALUE = '__all__'
const LIMIT_OPTIONS = [5, 10, 15, 25, 50, 100] as const

type Status = 'planned' | 'in_progress' | 'closed' | 'cancelled'

interface RecruiterDays {
  name: string
  days: number
}

interface HiringRequestRow {
  id: number
  vacancy: string
  grade: string
  grade_short: string
  project: string | null
  priority: 1 | 2 | 3
  status: Status
  opening_date: string
  deadline: string
  closed_date: string | null
  days_in_progress: number
  sla_to_offer: number
  sla_status_display: string
  time2hire: number | null
  recruiters: RecruiterDays[]
  candidate_name: string | null
  candidate_id: string | null
  is_overdue: boolean
}

const MOCK_REQUESTS: HiringRequestRow[] = [
  { id: 1, vacancy: 'Frontend Engineer (React)', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', priority: 2, status: 'in_progress', opening_date: '2025-12-17', deadline: '2026-01-21', closed_date: null, days_in_progress: 26, sla_to_offer: 35, sla_status_display: 'Нормально', time2hire: null, recruiters: [{ name: 'Голубенко А.', days: 22 }], candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 2, vacancy: 'DevOps Engineer', grade: 'Middle+', grade_short: 'M+', project: null, priority: 2, status: 'closed', opening_date: '2025-12-11', deadline: '2026-01-20', closed_date: '2026-01-06', days_in_progress: 26, sla_to_offer: 40, sla_status_display: 'В срок', time2hire: 67, recruiters: [{ name: 'Голубенко А.', days: 15 }, { name: 'Черномордин А.', days: 6 }, { name: 'Петрова М.', days: 5 }], candidate_name: 'Aleksander Volvachev', candidate_id: '76779160', is_overdue: false },
  { id: 3, vacancy: 'Backend Engineer', grade: 'Middle', grade_short: 'M', project: null, priority: 3, status: 'planned', opening_date: '2025-12-01', deadline: '2026-01-15', closed_date: null, days_in_progress: 0, sla_to_offer: 35, sla_status_display: 'Нет SLA', time2hire: null, recruiters: [{ name: 'Голубенко А.', days: 0 }], candidate_name: null, candidate_id: null, is_overdue: false },
]

function fmt(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

export function HiringPlanPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>(ALL_VALUE)
  const [tableLimit, setTableLimit] = useState<(typeof LIMIT_OPTIONS)[number]>(10)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK_REQUESTS.filter((r) => {
      if (q) {
        const hay = `${r.vacancy} ${r.candidate_name || ''} ${r.project || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (status !== ALL_VALUE && r.status !== status) return false
      return true
    }).slice(0, tableLimit)
  }, [search, status, tableLimit])

  return (
    <Box style={{ padding: '0 24px' }}>
      <Flex align="center" justify="between" mb="4" wrap="wrap" gap="3">
        <Flex align="center" gap="2">
          <ListBulletIcon width={24} height={24} />
          <Text size="6" weight="bold">
            План найма
          </Text>
        </Flex>
        <Button variant="soft" onClick={() => navigate({ to: '/reporting/hiring-plan/yearly' })}>
          <CalendarIcon />
          Годовая таблица
        </Button>
      </Flex>

      <Card mb="4">
        <Flex gap="3" wrap="wrap" align="end">
          <Box style={{ flex: 1, minWidth: 260 }}>
            <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
              Поиск
            </Text>
            <TextField.Root value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Вакансия, кандидат, проект" />
          </Box>

          <Box>
            <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
              Статус
            </Text>
            <Select.Root value={status} onValueChange={setStatus}>
              <Select.Trigger placeholder="Все статусы" style={{ minWidth: 200 }} />
              <Select.Content>
                <Select.Item value={ALL_VALUE}>Все статусы</Select.Item>
                <Select.Item value="planned">Планируется</Select.Item>
                <Select.Item value="in_progress">В процессе</Select.Item>
                <Select.Item value="closed">Закрыта</Select.Item>
                <Select.Item value="cancelled">Отменена</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
              Лимит
            </Text>
            <Select.Root value={String(tableLimit)} onValueChange={(v) => setTableLimit(Number(v) as (typeof LIMIT_OPTIONS)[number])}>
              <Select.Trigger placeholder="10" style={{ minWidth: 120 }} />
              <Select.Content>
                {LIMIT_OPTIONS.map((n) => (
                  <Select.Item key={n} value={String(n)}>
                    {n}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
      </Card>

      <Card>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Открыта</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Дедлайн</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((r) => (
              <Table.Row key={r.id}>
                <Table.Cell>{r.vacancy}</Table.Cell>
                <Table.Cell>{r.grade}</Table.Cell>
                <Table.Cell>{r.sla_status_display}</Table.Cell>
                <Table.Cell>{fmt(r.opening_date)}</Table.Cell>
                <Table.Cell>{fmt(r.deadline)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>
    </Box>
  )
}

