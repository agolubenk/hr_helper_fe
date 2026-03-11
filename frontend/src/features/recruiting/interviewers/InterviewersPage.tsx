'use client'

import { useMemo, useState } from 'react'
import { Box, Button, Card, Dialog, Flex, SegmentedControl, Switch, Table, Text, TextField } from '@radix-ui/themes'
import {
  CalendarIcon,
  CheckCircledIcon,
  CopyIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  EnvelopeClosedIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PersonIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'
import { useToast } from '@/shared/components/feedback/Toast'
import styles from './InterviewersPage.module.css'

interface Interviewer {
  id: number
  firstName: string
  lastName: string
  middleName?: string
  email: string
  isActive: boolean
  createdAt: string
  calendarLink?: string
}

const initialMockInterviewers: Interviewer[] = [
  {
    id: 1,
    firstName: 'Artur',
    lastName: 'Akimau',
    email: 'arthur.akimov@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:16',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=arthur.akimov@softnetix.io',
  },
  {
    id: 2,
    firstName: 'Yauheni',
    lastName: 'Baber',
    email: 'yauheni.baber@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:15',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=yauheni.baber@softnetix.io',
  },
  {
    id: 3,
    firstName: 'Sergey',
    lastName: 'Sidorov',
    email: 'sergey.sidorov@softnetix.io',
    isActive: false,
    createdAt: '15.11.2025 13:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=sergey.sidorov@softnetix.io',
  },
]

type StatusFilter = 'all' | 'active' | 'inactive'

function getInitials(interviewer: Interviewer) {
  return `${interviewer.firstName.charAt(0).toUpperCase()}${interviewer.lastName.charAt(0).toUpperCase()}`
}

function getFullName(interviewer: Interviewer) {
  return `${interviewer.lastName} ${interviewer.firstName}`
}

function matchesQuery(interviewer: Interviewer, query: string) {
  if (!query) return true
  const q = query.trim().toLowerCase()
  if (!q) return true
  const full = `${interviewer.firstName} ${interviewer.lastName} ${interviewer.middleName || ''}`.toLowerCase()
  return full.includes(q) || interviewer.email.toLowerCase().includes(q)
}

function matchesStatus(interviewer: Interviewer, status: StatusFilter) {
  if (status === 'all') return true
  if (status === 'active') return interviewer.isActive
  return !interviewer.isActive
}

interface InterviewerFormState {
  firstName: string
  lastName: string
  middleName: string
  email: string
  calendarLink: string
  isActive: boolean
}

function toFormState(interviewer?: Interviewer): InterviewerFormState {
  return {
    firstName: interviewer?.firstName ?? '',
    lastName: interviewer?.lastName ?? '',
    middleName: interviewer?.middleName ?? '',
    email: interviewer?.email ?? '',
    calendarLink: interviewer?.calendarLink ?? '',
    isActive: interviewer?.isActive ?? true,
  }
}

export function InterviewersPage() {
  const toast = useToast()
  const [items, setItems] = useState<Interviewer[]>(initialMockInterviewers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [viewing, setViewing] = useState<Interviewer | null>(null)
  const [editing, setEditing] = useState<Interviewer | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const totalCount = items.length
  const activeCount = items.filter((i) => i.isActive).length
  const inactiveCount = totalCount - activeCount

  const filteredItems = useMemo(() => {
    return items.filter((i) => matchesQuery(i, searchQuery) && matchesStatus(i, statusFilter))
  }, [items, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const paginatedItems = filteredItems.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage)

  const setPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages))

  const toggleActive = (id: number, isActive: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive } : i)))
  }

  const askDelete = (interviewer: Interviewer) => {
    toast.showWarning('Удалить интервьюера?', `Вы уверены, что хотите удалить ${getFullName(interviewer)}?`, {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            setItems((prev) => prev.filter((i) => i.id !== interviewer.id))
            setViewing(null)
            toast.showSuccess('Удалено', `${getFullName(interviewer)} удалён`)
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const copyCalendarLink = async (interviewer: Interviewer) => {
    if (!interviewer.calendarLink) {
      toast.showInfo('Нет ссылки', 'У интервьюера не задана ссылка на календарь')
      return
    }
    try {
      await navigator.clipboard.writeText(interviewer.calendarLink)
      toast.showSuccess('Скопировано', 'Ссылка на календарь скопирована в буфер обмена')
    } catch {
      toast.showError('Не удалось скопировать', 'Похоже, браузер запретил доступ к буферу обмена')
    }
  }

  const openCalendar = (interviewer: Interviewer) => {
    if (!interviewer.calendarLink) {
      toast.showInfo('Нет ссылки', 'У интервьюера не задана ссылка на календарь')
      return
    }
    window.open(interviewer.calendarLink, '_blank', 'noopener,noreferrer')
  }

  const upsert = (base?: Interviewer, form?: InterviewerFormState) => {
    if (!form) return
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return

    if (!base) {
      const nextId = (items.reduce((max, it) => Math.max(max, it.id), 0) || 0) + 1
      const created: Interviewer = {
        id: nextId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: form.middleName.trim() || undefined,
        email: form.email.trim(),
        isActive: form.isActive,
        createdAt: new Date().toLocaleString('ru-RU'),
        calendarLink: form.calendarLink.trim() || undefined,
      }
      setItems((prev) => [created, ...prev])
      toast.showSuccess('Создано', `${getFullName(created)} добавлен`)
      return
    }

    const updated: Interviewer = {
      ...base,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      middleName: form.middleName.trim() || undefined,
      email: form.email.trim(),
      isActive: form.isActive,
      calendarLink: form.calendarLink.trim() || undefined,
    }
    setItems((prev) => prev.map((i) => (i.id === base.id ? updated : i)))
    toast.showSuccess('Сохранено', `${getFullName(updated)} обновлён`)
  }

  return (
    <Box className={styles.container}>
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Text size="6" weight="bold">
          Интервьюеры
        </Text>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusIcon width={16} height={16} />
          Добавить интервьюера
        </Button>
      </Flex>

      <Flex gap="3" align="center" wrap="wrap">
        <Card className={styles.searchCard} style={{ flex: 1 }}>
          <Flex gap="3" align="center" wrap="wrap">
            <TextField.Root
              placeholder="Поиск по имени, фамилии или email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              style={{ flex: 1, minWidth: '280px' }}
              size="2"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon />
              </TextField.Slot>
            </TextField.Root>

            <SegmentedControl.Root
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as StatusFilter)
                setCurrentPage(1)
              }}
              size="2"
            >
              <SegmentedControl.Item value="active">Активные ({activeCount})</SegmentedControl.Item>
              <SegmentedControl.Item value="inactive">Неактивные ({inactiveCount})</SegmentedControl.Item>
              <SegmentedControl.Item value="all">Все ({totalCount})</SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>
        </Card>
      </Flex>

      <Box className={styles.tableContainer}>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Интервьюер</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Календарь</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Активен</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedItems.map((i) => (
              <Table.Row key={i.id}>
                <Table.Cell>
                  <Flex align="center" gap="3">
                    <Box className={styles.avatar}>
                      <Text weight="bold" style={{ color: 'white' }}>
                        {getInitials(i)}
                      </Text>
                    </Box>
                    <Box>
                      <Text weight="bold">{getFullName(i)}</Text>
                      <Text size="2" color="gray">
                        {i.firstName}
                      </Text>
                    </Box>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <EnvelopeClosedIcon />
                    <Text size="2">{i.email}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <CalendarIcon />
                    <Text size="2" color={i.calendarLink ? undefined : 'gray'}>
                      {i.calendarLink ? 'Есть ссылка' : 'Нет'}
                    </Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" className={i.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive}>
                    {i.isActive ? 'Активен' : 'Неактивен'}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Switch checked={i.isActive} onCheckedChange={(checked) => toggleActive(i.id, checked)} />
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="1" align="center">
                    <Button
                      variant="soft"
                      color="gray"
                      className={styles.actionButton}
                      onClick={() => setViewing(i)}
                      title="Открыть"
                    >
                      <PersonIcon />
                    </Button>
                    <Button
                      variant="soft"
                      color="green"
                      className={styles.actionButton}
                      onClick={() => setEditing(i)}
                      title="Редактировать"
                    >
                      <Pencil1Icon />
                    </Button>
                    <Button
                      variant="soft"
                      color="red"
                      className={styles.actionButton}
                      onClick={() => askDelete(i)}
                      title="Удалить"
                    >
                      <TrashIcon />
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <Box className={styles.pagination}>
        <Button className={styles.paginationButton} onClick={() => setPage(1)} disabled={safePage === 1}>
          <DoubleArrowLeftIcon />
        </Button>
        <Button className={styles.paginationButton} onClick={() => setPage(safePage - 1)} disabled={safePage === 1}>
          <ChevronLeftIcon />
        </Button>
        <Box className={styles.paginationPageInfo}>
          Стр. {safePage} из {totalPages}
        </Box>
        <Button
          className={styles.paginationButton}
          onClick={() => setPage(safePage + 1)}
          disabled={safePage === totalPages}
        >
          <ChevronRightIcon />
        </Button>
        <Button className={styles.paginationButton} onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>
          <DoubleArrowRightIcon />
        </Button>
      </Box>

      <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <Dialog.Content maxWidth="620px">
          <Dialog.Title>Добавить интервьюера</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="3">
            Заполните данные интервьюера.
          </Dialog.Description>
          <InterviewerForm
            initial={toFormState()}
            onCancel={() => setIsCreateOpen(false)}
            onSubmit={(form) => {
              upsert(undefined, form)
              setIsCreateOpen(false)
            }}
          />
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <Dialog.Content maxWidth="620px">
          <Dialog.Title>Редактировать интервьюера</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="3">
            Обновите данные интервьюера.
          </Dialog.Description>
          {editing && (
            <InterviewerForm
              initial={toFormState(editing)}
              onCancel={() => setEditing(null)}
              onSubmit={(form) => {
                upsert(editing, form)
                setEditing(null)
              }}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <Dialog.Content maxWidth="720px">
          {viewing && (
            <Flex direction="column" gap="4">
              <Dialog.Title
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  borderWidth: 0,
                }}
              >
                {getFullName(viewing)}
              </Dialog.Title>
              <Dialog.Description
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  borderWidth: 0,
                }}
              >
                {viewing.email}
              </Dialog.Description>

              <Box className={styles.modalHeader}>
                <Flex align="center" gap="3">
                  <Box className={styles.modalHeaderIcon}>
                    <PersonIcon width={18} height={18} style={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Text size="5" weight="bold" style={{ color: 'white' }}>
                      {getFullName(viewing)}
                    </Text>
                    <Text size="2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {viewing.email}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Flex gap="2" wrap="wrap">
                <Button variant="soft" onClick={() => copyCalendarLink(viewing)}>
                  <CopyIcon />
                  Скопировать календарь
                </Button>
                <Button variant="soft" onClick={() => openCalendar(viewing)} disabled={!viewing.calendarLink}>
                  <CalendarIcon />
                  Открыть календарь
                </Button>
                <Button variant="soft" color="green" onClick={() => setEditing(viewing)}>
                  <Pencil1Icon />
                  Редактировать
                </Button>
                <Button variant="soft" color="red" onClick={() => askDelete(viewing)}>
                  <TrashIcon />
                  Удалить
                </Button>
              </Flex>

              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <CheckCircledIcon />
                  <Text size="2">Статус: {viewing.isActive ? 'Активен' : 'Неактивен'}</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <CalendarIcon />
                  <Text size="2">Календарь: {viewing.calendarLink ? 'Есть ссылка' : 'Не задан'}</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Text size="2" color="gray">
                    Добавлен: {viewing.createdAt}
                  </Text>
                </Flex>
              </Flex>

              <Flex justify="end" gap="2">
                <Button variant="soft" onClick={() => setViewing(null)}>
                  Закрыть
                </Button>
              </Flex>
            </Flex>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

interface InterviewerFormProps {
  initial: InterviewerFormState
  onSubmit: (value: InterviewerFormState) => void
  onCancel: () => void
}

function InterviewerForm({ initial, onSubmit, onCancel }: InterviewerFormProps) {
  const [form, setForm] = useState<InterviewerFormState>(initial)
  const isValid = Boolean(form.firstName.trim() && form.lastName.trim() && form.email.trim())

  return (
    <Flex direction="column" gap="3">
      <Flex gap="3" wrap="wrap">
        <Box style={{ flex: 1, minWidth: 220 }}>
          <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
            Имя *
          </Text>
          <TextField.Root value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </Box>
        <Box style={{ flex: 1, minWidth: 220 }}>
          <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
            Фамилия *
          </Text>
          <TextField.Root value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </Box>
      </Flex>

      <Box>
        <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
          Отчество
        </Text>
        <TextField.Root value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
      </Box>

      <Box>
        <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
          Email *
        </Text>
        <TextField.Root value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Box>

      <Box>
        <Text size="2" weight="bold" mb="1" style={{ display: 'block' }}>
          Ссылка на календарь
        </Text>
        <TextField.Root
          value={form.calendarLink}
          onChange={(e) => setForm({ ...form, calendarLink: e.target.value })}
          placeholder="https://calendar.google.com/..."
        />
      </Box>

      <Flex align="center" gap="3">
        <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
        <Text size="2">Активен</Text>
      </Flex>

      <Flex justify="end" gap="2" mt="2">
        <Button variant="soft" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={() => onSubmit(form)} disabled={!isValid}>
          <CheckCircledIcon />
          Сохранить
        </Button>
      </Flex>
    </Flex>
  )
}

