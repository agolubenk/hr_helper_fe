'use client'

import { useMemo, useState } from 'react'
import { Badge, Box, Button, Card, Flex, Select, Table, Text, TextField } from '@radix-ui/themes'
import { EyeOpenIcon, MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '@/shared/components/feedback/Toast'
import type { Invite, InviteStatus } from './types'
import { MOCK_INVITES } from './mocks'

const STATUS_OPTIONS: { value: 'all' | InviteStatus; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'sent', label: 'Отправлен' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Отменен' },
]

const STATUS_COLORS: Record<InviteStatus, { label: string; color: 'yellow' | 'blue' | 'green' | 'gray' }> = {
  pending: { label: 'Ожидает', color: 'yellow' },
  sent: { label: 'Отправлен', color: 'blue' },
  completed: { label: 'Завершен', color: 'green' },
  cancelled: { label: 'Отменен', color: 'gray' },
}

export function InvitesPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [invites, setInvites] = useState<Invite[]>(MOCK_INVITES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | InviteStatus>('all')

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return invites.filter((i) => {
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter
      const matchesQuery =
        !q ||
        i.candidate_name.toLowerCase().includes(q) ||
        (i.vacancy_title ?? '').toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [invites, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const base = { total: invites.length, pending: 0, sent: 0, completed: 0 }
    for (const i of invites) {
      if (i.status === 'pending') base.pending += 1
      if (i.status === 'sent') base.sent += 1
      if (i.status === 'completed') base.completed += 1
    }
    return base
  }, [invites])

  const deleteInvite = (id: number) => {
    setInvites((prev) => prev.filter((i) => i.id !== id))
    toast.showSuccess('Инвайт удалён', `Инвайт #${id} удалён из списка (мок).`)
  }

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Text size="5" weight="bold">
          Инвайты
        </Text>
        <Button onClick={() => toast.showInfo('Создание инвайта', 'Модалка создания будет перенесена следующим шагом.')}>
          <PlusIcon />
          Создать инвайт
        </Button>
      </Flex>

      <Flex gap="3" wrap="wrap">
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Flex justify="between" align="center">
            <Text size="3" weight="bold">
              {stats.total} Всего
            </Text>
          </Flex>
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Flex justify="between" align="center">
            <Text size="3" weight="bold">
              {stats.pending} Ожидает
            </Text>
            <Badge color="yellow">pending</Badge>
          </Flex>
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Flex justify="between" align="center">
            <Text size="3" weight="bold">
              {stats.sent} Отправлен
            </Text>
            <Badge color="blue">sent</Badge>
          </Flex>
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Flex justify="between" align="center">
            <Text size="3" weight="bold">
              {stats.completed} Завершен
            </Text>
            <Badge color="green">done</Badge>
          </Flex>
        </Card>
      </Flex>

      <Flex gap="3" wrap="wrap" align="center">
        <Box style={{ flex: 1, minWidth: 220 }}>
          <TextField.Root value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск по кандидату или вакансии...">
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
        </Box>
        <Select.Root value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <Select.Trigger placeholder="Статус" style={{ minWidth: 220 }} />
          <Select.Content>
            {STATUS_OPTIONS.map((s) => (
              <Select.Item key={s.value} value={s.value}>
                {s.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Box>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Кандидат</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Интервью</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((i) => {
              const meta = STATUS_COLORS[i.status]
              return (
                <Table.Row key={i.id}>
                  <Table.Cell>#{i.id}</Table.Cell>
                  <Table.Cell>{i.candidate_name}</Table.Cell>
                  <Table.Cell>{i.vacancy_title ?? '—'}</Table.Cell>
                  <Table.Cell>{i.interview_datetime_formatted ?? i.interview_datetime}</Table.Cell>
                  <Table.Cell>
                    <Badge color={meta.color}>{meta.label}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" justify="end">
                      <Button variant="ghost" onClick={() => navigate({ to: '/invites' })} title="Просмотр (мок)">
                        <EyeOpenIcon />
                      </Button>
                      <Button variant="ghost" onClick={() => toast.showInfo('Редактирование', 'Страница редактирования будет перенесена отдельно.')} title="Редактировать">
                        <Pencil1Icon />
                      </Button>
                      <Button variant="ghost" color="red" onClick={() => deleteInvite(i.id)} title="Удалить">
                        <TrashIcon />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Box>
    </Flex>
  )
}

