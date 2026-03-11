'use client'

import { useMemo, useState } from 'react'
import { Badge, Box, Button, Card, Flex, SegmentedControl, Select, Table, Text, TextField } from '@radix-ui/themes'
import { DownloadIcon, HamburgerMenuIcon, MagnifyingGlassIcon, PlusIcon, UploadIcon } from '@radix-ui/react-icons'
import { useToast } from '@/shared/components/feedback/Toast'
import type { HiringRequest, HiringRequestPriority, HiringRequestStatus } from './types'
import { MOCK_REQUESTS } from './mocks'

const STATUS_LABEL: Record<HiringRequestStatus, string> = {
  planned: 'Запланировано',
  in_process: 'В процессе',
  closed: 'Закрыто',
  cancelled: 'Отменено',
}

const PRIORITY_LABEL: Record<HiringRequestPriority, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
}

export function HiringRequestsPage() {
  const toast = useToast()
  const [mode, setMode] = useState<'all' | 'blocks'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState<'all' | HiringRequestStatus>('all')
  const [priority, setPriority] = useState<'all' | HiringRequestPriority>('all')

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return MOCK_REQUESTS.filter((r) => {
      const matchesQ = !q || r.title.toLowerCase().includes(q) || String(r.id).includes(q)
      const matchesStatus = status === 'all' || r.status === status
      const matchesPriority = priority === 'all' || r.priority === priority
      return matchesQ && matchesStatus && matchesPriority
    })
  }, [searchQuery, status, priority])

  const stats = useMemo(() => {
    const base = { total: 0, planned: 0, in_process: 0, cancelled: 0, closed: 0 }
    for (const r of filtered) {
      base.total += 1
      base[r.status] += 1
    }
    return base
  }, [filtered])

  const grouped = useMemo(() => {
    const map = new Map<string, HiringRequest[]>()
    for (const r of filtered) {
      const key = r.title
      const list = map.get(key) ?? []
      list.push(r)
      map.set(key, list)
    }
    return Array.from(map.entries()).map(([title, items]) => ({ title, items }))
  }, [filtered])

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Flex align="center" gap="2">
          <HamburgerMenuIcon width={20} height={20} />
          <Text size="5" weight="bold">
            Заявки на подбор
          </Text>
        </Flex>
        <Flex gap="2" wrap="wrap" justify="end">
          <Button variant="soft" onClick={() => toast.showInfo('Импорт', 'Импорт Excel будет перенесён отдельным шагом.')}>
            <UploadIcon />
            Импорт
          </Button>
          <Button variant="soft" onClick={() => toast.showInfo('Экспорт', 'Экспорт Excel будет перенесён отдельным шагом.')}>
            <DownloadIcon />
            Экспорт
          </Button>
          <Button onClick={() => toast.showInfo('Создание заявки', 'Модалка создания будет перенесена следующим шагом.')}>
            <PlusIcon />
            Создать заявку
          </Button>
        </Flex>
      </Flex>

      <Flex gap="3" wrap="wrap">
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Text size="3" weight="bold">
            {stats.total} Всего
          </Text>
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Text size="3" weight="bold">
            {stats.planned} Запланировано
          </Text>
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Text size="3" weight="bold">
            {stats.in_process} В процессе
          </Text>
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Text size="3" weight="bold">
            {stats.closed} Закрыто
          </Text>
        </Card>
      </Flex>

      <Flex gap="3" wrap="wrap" align="center">
        <Box style={{ flex: 1, minWidth: 240 }}>
          <TextField.Root value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск по названию или ID...">
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
        </Box>
        <Select.Root value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <Select.Trigger placeholder="Статус" style={{ minWidth: 200 }} />
          <Select.Content>
            <Select.Item value="all">Все статусы</Select.Item>
            <Select.Item value="planned">Запланировано</Select.Item>
            <Select.Item value="in_process">В процессе</Select.Item>
            <Select.Item value="closed">Закрыто</Select.Item>
            <Select.Item value="cancelled">Отменено</Select.Item>
          </Select.Content>
        </Select.Root>
        <Select.Root value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
          <Select.Trigger placeholder="Приоритет" style={{ minWidth: 200 }} />
          <Select.Content>
            <Select.Item value="all">Все приоритеты</Select.Item>
            <Select.Item value="high">Высокий</Select.Item>
            <Select.Item value="medium">Средний</Select.Item>
            <Select.Item value="low">Низкий</Select.Item>
          </Select.Content>
        </Select.Root>
        <SegmentedControl.Root value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <SegmentedControl.Item value="all">Все</SegmentedControl.Item>
          <SegmentedControl.Item value="blocks">Блоками</SegmentedControl.Item>
        </SegmentedControl.Root>
      </Flex>

      {mode === 'all' ? (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Рекрутер</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Приоритет</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Кандидатов</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((r) => (
              <Table.Row key={r.id}>
                <Table.Cell>#{r.id}</Table.Cell>
                <Table.Cell>{r.title}</Table.Cell>
                <Table.Cell>{r.recruiter}</Table.Cell>
                <Table.Cell>
                  <Badge color={r.status === 'closed' ? 'green' : r.status === 'cancelled' ? 'gray' : r.status === 'planned' ? 'yellow' : 'blue'}>
                    {STATUS_LABEL[r.status]}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={r.priority === 'high' ? 'red' : r.priority === 'medium' ? 'yellow' : 'gray'}>
                    {PRIORITY_LABEL[r.priority]}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{r.candidates}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <Flex direction="column" gap="3">
          {grouped.map((g) => (
            <Card key={g.title}>
              <Flex direction="column" gap="2">
                <Text size="3" weight="bold">
                  {g.title}
                </Text>
                <Text size="2" color="gray">
                  {g.items.length} заявок
                </Text>
                <Flex gap="2" wrap="wrap">
                  {g.items.map((r) => (
                    <Badge key={r.id} color={r.status === 'closed' ? 'green' : r.status === 'cancelled' ? 'gray' : r.status === 'planned' ? 'yellow' : 'blue'}>
                      #{r.id} · {STATUS_LABEL[r.status]}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Flex>
  )
}

