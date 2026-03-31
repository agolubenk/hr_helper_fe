import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Checkbox,
  Flex,
  Select,
  SegmentedControl,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { useMemo, useState, useEffect } from 'react'
import { Link } from '@/router-adapter'
import { useValidatedSearchParam } from '@/shared/hooks/useUrlSearchState'
import { MENU_LEVEL1_ORDER, MENU_LEVEL1_TO_LABEL } from '@/config/menuConfig'
import { filterTasks, sortTasksByPriorityAndDue } from '@/features/tasks/filterTasks'
import { MOCK_TASKS } from '@/features/tasks/mocks'
import type { TaskFilterState, TaskItem, TaskKind, TaskPriority, TaskStatus } from '@/features/tasks/types'
import { readDoneTaskIds, toggleDoneTaskId } from '@/features/tasks/taskUiStorage'
import styles from './TasksWorkspace.module.css'

const DOMAIN_EXTRA_LABEL: Record<string, string> = {
  settings: 'Настройки и модули',
}

const DOMAIN_FILTER_IDS = [...MENU_LEVEL1_ORDER, 'settings'] as const

const KIND_LABEL: Record<TaskKind, string> = {
  recruiting_action: 'Рекрутинг',
  approval: 'Согласование',
  meeting_followup: 'После встречи',
  document: 'Документ',
  learning: 'Обучение',
  integration: 'Интеграция',
  analytics: 'Аналитика',
  hr_ops: 'HROps',
  project: 'Проект',
  settings: 'Настройки',
  communication: 'Коммуникации',
  workflow_inbox: 'Inbox / поток',
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  open: 'Открыта',
  in_progress: 'В работе',
  done: 'Выполнена',
  blocked: 'Блокер',
  delegated: 'Делегирована',
}

const PRIORITY_COLOR: Record<TaskPriority, 'ruby' | 'orange' | 'amber' | 'gray'> = {
  urgent: 'ruby',
  high: 'orange',
  medium: 'amber',
  low: 'gray',
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: 'Срочно',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
}

function domainLabel(id: string): string {
  return MENU_LEVEL1_TO_LABEL[id] ?? DOMAIN_EXTRA_LABEL[id] ?? id
}

const initialFilter: TaskFilterState = {
  query: '',
  domainRootId: 'all',
  status: 'all',
  priority: 'all',
  kind: 'all',
  duePreset: 'all',
  onlyWithLinks: false,
}

const TASK_VIEWS = ['table', 'cards'] as const

export function TasksWorkspace() {
  const [view, setView] = useValidatedSearchParam('view', TASK_VIEWS, 'table', {
    omitWhenDefault: true,
    replace: true,
  })
  const [filter, setFilter] = useState<TaskFilterState>(initialFilter)
  const [doneIds, setDoneIds] = useState<Set<string>>(() =>
    typeof window === 'undefined' ? new Set() : readDoneTaskIds()
  )

  useEffect(() => {
    setDoneIds(readDoneTaskIds())
  }, [])

  const filtered = useMemo(() => {
    const f = filterTasks(MOCK_TASKS, filter, { doneIds })
    return sortTasksByPriorityAndDue(f)
  }, [filter, doneIds])

  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let overdue = 0
    for (const t of MOCK_TASKS) {
      const st = doneIds.has(t.id) ? 'done' : t.status
      if (st === 'done') continue
      const d = new Date(t.dueDate + 'T12:00:00')
      if (!Number.isNaN(d.getTime()) && d < today) overdue += 1
    }
    const open = MOCK_TASKS.filter((t) => (doneIds.has(t.id) ? false : t.status === 'open')).length
    const prog = MOCK_TASKS.filter((t) => (doneIds.has(t.id) ? false : t.status === 'in_progress')).length
    return { total: MOCK_TASKS.length, open, inProgress: prog, overdue, done: doneIds.size }
  }, [doneIds])

  const toggleDone = (id: string) => {
    setDoneIds(toggleDoneTaskId(id))
  }

  const effectiveStatus = (t: TaskItem): TaskStatus => (doneIds.has(t.id) ? 'done' : t.status)

  const renderLinks = (t: TaskItem) => (
    <Flex className={styles.linksRow} gap="2" wrap="wrap">
      {t.primaryLink ? (
        <Button size="1" variant="soft" asChild>
          <Link href={t.primaryLink.href}>{t.primaryLink.label}</Link>
        </Button>
      ) : null}
      {t.links.map((l) => (
        <Button key={`${t.id}-${l.href}-${l.label}`} size="1" variant="ghost" asChild>
          <Link href={l.href} target={l.external ? '_blank' : undefined} rel={l.external ? 'noreferrer' : undefined}>
            {l.label}
          </Link>
        </Button>
      ))}
    </Flex>
  )

  const cardsByDomain = useMemo(() => {
    const m = new Map<string, TaskItem[]>()
    for (const t of filtered) {
      const k = t.domainRootId
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(t)
    }
    return m
  }, [filtered])

  return (
    <Box className={styles.root} data-tour="tasks-page">
      <Flex direction="column" gap="2">
        <Text size="6" weight="bold">
          Задачи
        </Text>
        <Text size="2" color="gray" style={{ maxWidth: '72ch' }}>
          Единый реестр поручений с привязкой к блокам меню, срокам и объектам приложения. Статус «Выполнено» на
          этой странице сохраняется локально (мок); в продукте синхронизируется с workflow и правами.
        </Text>
      </Flex>

      <Callout.Root color="blue">
        <Callout.Text>
          Связь с <Link href="/workflow">Inbox / Workflow chat</Link> — оперативные ответы; с{' '}
          <Link href="/calendar">календарём</Link> — дедлайны и встречи; с{' '}
          <Link href="/settings/modules">модулями</Link> — видимость доменов в навигации.
        </Callout.Text>
      </Callout.Root>

      <Flex className={styles.statsRow} gap="2" wrap="wrap">
        <Badge size="2">Всего: {stats.total}</Badge>
        <Badge size="2" color="blue">
          Открыто: {stats.open}
        </Badge>
        <Badge size="2" color="amber">
          В работе: {stats.inProgress}
        </Badge>
        <Badge size="2" color="ruby">
          Просрочено: {stats.overdue}
        </Badge>
        <Badge size="2" color="green">
          Отмечено выполненным: {stats.done}
        </Badge>
      </Flex>

      <Card size="2" variant="surface">
        <Flex justify="between" align="center" gap="3" wrap="wrap" mb="3">
          <Text size="3" weight="bold">
            Фильтры
          </Text>
          <SegmentedControl.Root value={view} onValueChange={(v) => (v === 'cards' ? setView('cards') : setView('table'))}>
            <SegmentedControl.Item value="table">Таблица</SegmentedControl.Item>
            <SegmentedControl.Item value="cards">Карточки по областям</SegmentedControl.Item>
          </SegmentedControl.Root>
        </Flex>

        <div className={styles.toolbarGrid}>
          <Box style={{ gridColumn: '1 / -1' }}>
            <Text size="2" weight="medium" mb="2" as="div">
              Поиск
            </Text>
            <TextField.Root
              placeholder="Заголовок, исполнитель, теги…"
              value={filter.query}
              onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Область (блок меню)
            </Text>
            <Select.Root
              value={filter.domainRootId}
              onValueChange={(v) => setFilter((f) => ({ ...f, domainRootId: v }))}
            >
              <Select.Trigger />
              <Select.Content position="popper">
                <Select.Item value="all">Все области</Select.Item>
                {DOMAIN_FILTER_IDS.map((id) => (
                  <Select.Item key={id} value={id}>
                    {domainLabel(id)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Статус
            </Text>
            <Select.Root
              value={filter.status}
              onValueChange={(v) =>
                setFilter((f) => ({
                  ...f,
                  status: v as TaskFilterState['status'],
                }))
              }
            >
              <Select.Trigger />
              <Select.Content position="popper">
                <Select.Item value="all">Все</Select.Item>
                {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
                  <Select.Item key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Приоритет
            </Text>
            <Select.Root
              value={filter.priority}
              onValueChange={(v) =>
                setFilter((f) => ({ ...f, priority: v as TaskFilterState['priority'] }))
              }
            >
              <Select.Trigger />
              <Select.Content position="popper">
                <Select.Item value="all">Все</Select.Item>
                {(Object.keys(PRIORITY_COLOR) as TaskPriority[]).map((p) => (
                  <Select.Item key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Специфика (тип)
            </Text>
            <Select.Root
              value={filter.kind}
              onValueChange={(v) => setFilter((f) => ({ ...f, kind: v as TaskFilterState['kind'] }))}
            >
              <Select.Trigger />
              <Select.Content position="popper">
                <Select.Item value="all">Все типы</Select.Item>
                {(Object.keys(KIND_LABEL) as TaskKind[]).map((k) => (
                  <Select.Item key={k} value={k}>
                    {KIND_LABEL[k]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Срок
            </Text>
            <Select.Root
              value={filter.duePreset}
              onValueChange={(v) =>
                setFilter((f) => ({ ...f, duePreset: v as TaskFilterState['duePreset'] }))
              }
            >
              <Select.Trigger />
              <Select.Content position="popper">
                <Select.Item value="all">Все даты</Select.Item>
                <Select.Item value="today">Сегодня</Select.Item>
                <Select.Item value="week">7 дней</Select.Item>
                <Select.Item value="overdue">Просрочено</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          <Flex align="center" gap="2" style={{ minHeight: 48 }}>
            <Checkbox
              checked={filter.onlyWithLinks}
              onCheckedChange={(v) => setFilter((f) => ({ ...f, onlyWithLinks: v === true }))}
            />
            <Text size="2">Только с переходами</Text>
          </Flex>
        </div>
      </Card>

      <Text size="2" color="gray">
        Показано: {filtered.length} из {MOCK_TASKS.length}
      </Text>

      {filtered.length === 0 ? (
        <Card size="2">
          <Text size="2" color="gray">
            Нет задач по выбранным фильтрам. Сбросьте область, срок или поиск.
          </Text>
        </Card>
      ) : view === 'table' ? (
        <div className={styles.tableWrap}>
          <Table.Root size="1" variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Задача</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Область / контекст</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Срок</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Приоритет</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Связи</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ width: 120 }} />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((t) => (
                <Table.Row key={t.id}>
                  <Table.Cell>
                    <Text size="2" weight="medium">
                      {t.title}
                    </Text>
                    <Text size="1" color="gray" style={{ display: 'block', marginTop: 4, maxWidth: '42ch' }}>
                      {t.summary}
                    </Text>
                    {t.moduleRiskHint ? (
                      <Text size="1" color="orange" style={{ display: 'block', marginTop: 6, maxWidth: '48ch' }}>
                        {t.moduleRiskHint}
                      </Text>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{domainLabel(t.domainRootId)}</Text>
                    {t.menuContextLabel ? (
                      <Text size="1" color="gray" style={{ display: 'block' }}>
                        {t.menuContextLabel}
                      </Text>
                    ) : null}
                    {t.sourceSystem ? (
                      <Badge size="1" variant="soft" mt="1">
                        {t.sourceSystem}
                      </Badge>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{KIND_LABEL[t.kind]}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{t.dueDate}</Text>
                    <Text size="1" color="gray">
                      {t.assignee}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={PRIORITY_COLOR[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="soft">{STATUS_LABEL[effectiveStatus(t)]}</Badge>
                  </Table.Cell>
                  <Table.Cell>{renderLinks(t)}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="1"
                      variant={doneIds.has(t.id) ? 'solid' : 'outline'}
                      onClick={() => toggleDone(t.id)}
                    >
                      {doneIds.has(t.id) ? 'Вернуть' : 'Выполнено'}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      ) : (
        <Flex direction="column" gap="4">
          {[...cardsByDomain.entries()].map(([domainId, items]) => (
            <Box key={domainId}>
              <Text size="4" weight="bold" className={styles.domainHeading}>
                {domainLabel(domainId)}
              </Text>
              <div className={styles.cardGrid}>
                {items.map((t) => (
                  <Card key={t.id} size="2" variant="surface" className={styles.taskCard}>
                    <Flex justify="between" align="start" gap="2" wrap="wrap" mb="2">
                      <Text size="3" weight="medium">
                        {t.title}
                      </Text>
                      <Badge color={PRIORITY_COLOR[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge>
                    </Flex>
                    <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
                      {t.summary}
                    </Text>
                    <Flex gap="2" wrap="wrap" mb="2">
                      <Badge variant="soft">{STATUS_LABEL[effectiveStatus(t)]}</Badge>
                      <Badge variant="outline">{KIND_LABEL[t.kind]}</Badge>
                      <Text size="1">до {t.dueDate}</Text>
                      <Text size="1" color="gray">
                        {t.assignee}
                      </Text>
                    </Flex>
                    {t.menuContextLabel ? (
                      <Text size="1" color="gray" mb="2">
                        Контекст: {t.menuContextLabel}
                      </Text>
                    ) : null}
                    {t.moduleRiskHint ? (
                      <Callout.Root color="orange" mb="2" size="1">
                        <Callout.Text>{t.moduleRiskHint}</Callout.Text>
                      </Callout.Root>
                    ) : null}
                    <Box mb="2">{renderLinks(t)}</Box>
                    <Button size="2" variant={doneIds.has(t.id) ? 'solid' : 'soft'} onClick={() => toggleDone(t.id)}>
                      {doneIds.has(t.id) ? 'Вернуть в работу' : 'Отметить выполненной'}
                    </Button>
                  </Card>
                ))}
              </div>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  )
}

