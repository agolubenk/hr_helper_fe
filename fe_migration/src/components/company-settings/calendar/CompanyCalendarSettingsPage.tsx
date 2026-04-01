'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Text,
  Heading,
  Select,
  Switch,
  TextField,
  Table,
  IconButton,
  Badge,
} from '@radix-ui/themes'
import {
  GlobeIcon,
  CalendarIcon,
  ClockIcon,
  ActivityLogIcon,
  ExclamationTriangleIcon,
  PersonIcon,
  LockClosedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Pencil1Icon,
  TrashIcon,
  PlusIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  Link2Icon,
  EnvelopeClosedIcon,
  ChatBubbleIcon,
} from '@radix-ui/react-icons'
import * as Tabs from '@radix-ui/react-tabs'
import { Link, useSearchParams } from '@/router-adapter'
import { useToast } from '@/components/Toast/ToastContext'
import {
  APRIL_2026_PREVIEW,
  APRIL_STATS,
  MOCK_CALENDARS,
  MOCK_EVENT_TYPES,
  type MiniCalendarCell,
} from './mocks'
import styles from './CompanyCalendarSettingsPage.module.css'

const CALENDAR_SETTINGS_TABS = [
  'general',
  'calendars',
  'event-types',
  'rules',
  'exceptions',
  'assign',
  'policies',
] as const

type CalendarSettingsTab = (typeof CALENDAR_SETTINGS_TABS)[number]

const CALENDAR_SETTINGS_TAB_SET = new Set<string>(CALENDAR_SETTINGS_TABS)

function parseCalendarTab(raw: string | null): CalendarSettingsTab {
  if (raw !== null && CALENDAR_SETTINGS_TAB_SET.has(raw)) {
    return raw as CalendarSettingsTab
  }
  return 'general'
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function badgeClass(variant: string): string {
  switch (variant) {
    case 'pr':
      return styles.badgePr
    case 'er':
      return styles.badgeEr
    case 'bl':
      return styles.badgeBl
    case 'pu':
      return styles.badgePu
    case 'gd':
      return styles.badgeGd
    case 'or':
      return styles.badgeOr
    default:
      return styles.badgeGr
  }
}

function MiniCalendarCellView({ cell }: { cell: MiniCalendarCell }) {
  if (cell.kind === 'empty') {
    return <div className={`${styles.miniCalCell} ${styles.miniCalCellEmpty}`} aria-hidden />
  }
  const extra = [styles.miniCalCell]
  if (cell.kind === 'weekend') extra.push(styles.miniCalWeekend)
  if (cell.kind === 'shift') extra.push(styles.miniCalShift)
  if (cell.kind === 'holiday') extra.push(styles.miniCalHoliday)
  if (cell.kind === 'event') extra.push(styles.miniCalEvent)
  if (cell.kind === 'today') extra.push(styles.miniCalToday)
  if (cell.kind === 'day' || cell.kind === 'shift' || cell.kind === 'event') {
    extra.push(styles.miniCalCellInteractive)
  }
  return (
    <div className={extra.join(' ')} title={cell.title}>
      {cell.label}
    </div>
  )
}

function CompanyCalendarSettingsPageContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = useMemo(
    () => parseCalendarTab(searchParams.get('tab')),
    [searchParams]
  )

  useEffect(() => {
    const raw = searchParams.get('tab')
    if (raw !== null && CALENDAR_SETTINGS_TAB_SET.has(raw)) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', parseCalendarTab(raw))
        return next
      },
      { replace: true }
    )
  }, [searchParams, setSearchParams])

  const onTabChange = useCallback(
    (value: string) => {
      if (!CALENDAR_SETTINGS_TAB_SET.has(value)) return
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', value)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const toast = useToast()
  const [workDays, setWorkDays] = useState<Set<number>>(() => new Set([1, 2, 3, 4, 5]))
  const [tzAuto, setTzAuto] = useState(true)
  const [tzConflict, setTzConflict] = useState(true)
  const [tzNamed, setTzNamed] = useState(true)
  const [draftMode, setDraftMode] = useState(true)
  const [historySnap, setHistorySnap] = useState(true)
  const [notifyStaff, setNotifyStaff] = useState(true)
  const [dstFlag, setDstFlag] = useState(true)
  const [multiTz, setMultiTz] = useState(true)
  const [holidayImport, setHolidayImport] = useState(true)
  const [apiFirst, setApiFirst] = useState(false)

  const toggleWorkDay = useCallback((i: number) => {
    setWorkDays((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }, [])

  const onMockSave = () => {
    toast.showSuccess('Сохранено (мок)', 'Изменения записаны локально для демонстрации')
  }

  return (
    <Box className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Навигация">
        <Link href="/company-settings">Настройки</Link>
        <span className={styles.breadcrumbSep} aria-hidden>
          /
        </span>
        <span>Календарь компании</span>
      </nav>

      <Flex className={styles.topBar} align="start" justify="between" wrap="wrap" gap="4">
        <Box className={styles.titleBlock}>
          <Heading as="h1" size="6" style={{ margin: 0 }}>
            Календарь компании
          </Heading>
          <Text size="2" color="gray" style={{ marginTop: 4, display: 'block' }}>
            Правила, события, таймзоны, персонализация и наследование для всей организации
          </Text>
        </Box>
        <Flex className={styles.topActions} align="center" wrap="wrap" gap="3">
          <span className={styles.tzBadge} role="status">
            <ClockIcon width={12} height={12} aria-hidden />
            Europe/Minsk <strong>UTC+3</strong>
          </span>
          <Button size="2" onClick={() => toast.showInfo('Мок', 'Добавление события (скоро)')}>
            <PlusIcon width={14} height={14} />
            Событие
          </Button>
        </Flex>
      </Flex>

      <Tabs.Root
        className={styles.tabsRoot}
        value={activeTab}
        onValueChange={onTabChange}
        id="company-calendar-settings-tabs"
      >
        <Tabs.List className={styles.tabsList} aria-label="Разделы настроек">
          <Tabs.Trigger className={styles.tabTrigger} value="general">
            <GlobeIcon />
            Общие
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabTrigger} value="calendars">
            <CalendarIcon />
            Календари
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabTrigger} value="event-types">
            <ClockIcon />
            Типы событий
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabTrigger} value="rules">
            <ActivityLogIcon />
            Правила
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabTrigger} value="exceptions">
            <ExclamationTriangleIcon />
            Исключения
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabTrigger} value="assign">
            <PersonIcon />
            Назначения
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabTrigger} value="policies">
            <LockClosedIcon />
            Политики
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="general">
          <Box className={styles.twoCol}>
            <Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Box>
                    <Flex align="center" gap="2" className={styles.cardTitle}>
                      <GlobeIcon width={15} height={15} />
                      Таймзоны и глобализация
                    </Flex>
                    <Text className={styles.cardDesc}>Базовые параметры компании</Text>
                  </Box>
                </Box>
                <Box className={styles.cardBody}>
                  <Text as="label" size="2" weight="bold" htmlFor="tz-main" style={{ display: 'block', marginBottom: 6 }}>
                    Таймзона компании <span style={{ color: 'var(--red-9)' }}>*</span>
                  </Text>
                  <Select.Root defaultValue="minsk">
                    <Select.Trigger id="tz-main" />
                    <Select.Content>
                      <Select.Item value="minsk">Europe/Minsk — UTC+3</Select.Item>
                      <Select.Item value="msk">Europe/Moscow — UTC+3</Select.Item>
                      <Select.Item value="waw">Europe/Warsaw — UTC+1</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <Text className={styles.hint} style={{ marginTop: 8, display: 'block' }}>
                    Используется как дефолт при создании новых календарей и событий
                  </Text>
                  <Box className={styles.divider} />
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        Автоопределение таймзоны пользователя
                      </Text>
                      <Text size="1" color="gray">
                        При входе предлагать пересчёт времени в локальную TZ
                      </Text>
                    </Box>
                    <Switch checked={tzAuto} onCheckedChange={setTzAuto} />
                  </Flex>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        Показывать конфликт таймзон
                      </Text>
                      <Text size="1" color="gray">
                        Помечать события, если источник TZ ≠ TZ пользователя
                      </Text>
                    </Box>
                    <Switch checked={tzConflict} onCheckedChange={setTzConflict} />
                  </Flex>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        Хранить именованные TZ
                      </Text>
                      <Text size="1" color="gray">
                        Использовать Europe/Minsk вместо UTC+3 (рекомендуется для DST)
                      </Text>
                    </Box>
                    <Switch checked={tzNamed} onCheckedChange={setTzNamed} />
                  </Flex>
                  <Flex align="start" gap="3" className={`${styles.infoBox} ${styles.infoBlue}`} role="note" mt="3">
                    <InfoCircledIcon width={14} height={14} aria-hidden />
                    <Text size="2">
                      Повторяемые события считаются в TZ правила. При переходе на летнее время UTC-смещение
                      автоматически пересчитывается.
                    </Text>
                  </Flex>
                </Box>
              </Box>

              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Box>
                    <Flex align="center" gap="2" className={styles.cardTitle}>
                      <CalendarIcon width={15} height={15} />
                      Отображение и локаль
                    </Flex>
                    <Text className={styles.cardDesc}>Формат, неделя, рабочие дни</Text>
                  </Box>
                </Box>
                <Box className={styles.cardBody}>
                  <Box className={styles.fieldGrid}>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="first-day" style={{ display: 'block', marginBottom: 6 }}>
                        Первый день недели
                      </Text>
                      <Select.Root defaultValue="mon">
                        <Select.Trigger id="first-day" />
                        <Select.Content>
                          <Select.Item value="mon">Понедельник</Select.Item>
                          <Select.Item value="sun">Воскресенье</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="date-fmt" style={{ display: 'block', marginBottom: 6 }}>
                        Формат даты
                      </Text>
                      <Select.Root defaultValue="eu">
                        <Select.Trigger id="date-fmt" />
                        <Select.Content>
                          <Select.Item value="eu">DD.MM.YYYY</Select.Item>
                          <Select.Item value="us">MM/DD/YYYY</Select.Item>
                          <Select.Item value="iso">YYYY-MM-DD (ISO)</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="time-fmt" style={{ display: 'block', marginBottom: 6 }}>
                        Формат времени
                      </Text>
                      <Select.Root defaultValue="24">
                        <Select.Trigger id="time-fmt" />
                        <Select.Content>
                          <Select.Item value="24">24ч (14:30)</Select.Item>
                          <Select.Item value="12">12ч (2:30 PM)</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Box>
                  <Box className={styles.divider} />
                  <Text size="2" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
                    Рабочие дни
                  </Text>
                  <Flex className={styles.workDays} role="group" aria-label="Рабочие дни недели" gap="2" wrap="wrap">
                    {WEEKDAYS.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        className={`${styles.workDayBtn} ${workDays.has(i) ? styles.workDayBtnActive : ''}`}
                        title={label}
                        aria-pressed={workDays.has(i)}
                        onClick={() => toggleWorkDay(i)}
                      >
                        {label}
                      </button>
                    ))}
                  </Flex>
                  <Text className={styles.hint} style={{ marginTop: 8, display: 'block' }}>
                    Используется для расчёта рабочего времени и доступности сотрудников
                  </Text>
                  <Box className={styles.divider} />
                  <Box className={styles.fieldGridTwo}>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="work-from" style={{ display: 'block', marginBottom: 6 }}>
                        Рабочее время — начало
                      </Text>
                      <TextField.Root id="work-from" type="time" defaultValue="09:00" />
                    </Box>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="work-to" style={{ display: 'block', marginBottom: 6 }}>
                        Рабочее время — конец
                      </Text>
                      <TextField.Root id="work-to" type="time" defaultValue="18:00" />
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Flex align="center" gap="2" className={styles.cardTitle}>
                    <ActivityLogIcon width={15} height={15} />
                    Публикация и версионирование
                  </Flex>
                </Box>
                <Box className={styles.cardBody}>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        Draft / Published режим
                      </Text>
                      <Text size="1" color="gray">
                        Правки не вступают в силу до явной публикации
                      </Text>
                    </Box>
                    <Switch checked={draftMode} onCheckedChange={setDraftMode} />
                  </Flex>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        История изменений
                      </Text>
                      <Text size="1" color="gray">
                        Автоматически снимать snapshot при публикации
                      </Text>
                    </Box>
                    <Switch checked={historySnap} onCheckedChange={setHistorySnap} />
                  </Flex>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        Уведомлять сотрудников
                      </Text>
                      <Text size="1" color="gray">
                        Email/push при публикации изменений, затрагивающих их расписание
                      </Text>
                    </Box>
                    <Switch checked={notifyStaff} onCheckedChange={setNotifyStaff} />
                  </Flex>
                  <Box mt="4">
                    <Text as="label" size="2" weight="bold" htmlFor="pub-note" style={{ display: 'block', marginBottom: 6 }}>
                      Комментарий к публикации
                    </Text>
                    <TextField.Root
                      id="pub-note"
                      placeholder="Например: «Изменение графика Q2 2026»"
                    />
                  </Box>
                  <Button mt="4" onClick={onMockSave}>
                    Сохранить (мок)
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Box>
                    <Flex align="center" gap="2" className={styles.cardTitle}>
                      <CalendarIcon width={15} height={15} />
                      Предпросмотр — апрель 2026
                    </Flex>
                    <Text className={styles.cardDesc}>Europe/Minsk · UTC+3</Text>
                  </Box>
                  <Flex className={styles.previewHeaderNav} align="center" gap="1">
                    <IconButton size="1" variant="ghost" aria-label="Предыдущий месяц" onClick={() => toast.showInfo('Мок', 'Навигация по месяцам')}>
                      <ChevronLeftIcon />
                    </IconButton>
                    <IconButton size="1" variant="ghost" aria-label="Следующий месяц" onClick={() => toast.showInfo('Мок', 'Навигация по месяцам')}>
                      <ChevronRightIcon />
                    </IconButton>
                  </Flex>
                </Box>
                <Box className={styles.miniCalGrid}>
                  {WEEKDAYS.map((d) => (
                    <div key={d} className={styles.miniCalDow}>
                      {d}
                    </div>
                  ))}
                  {APRIL_2026_PREVIEW.map((cell, idx) => (
                    <MiniCalendarCellView key={idx} cell={cell} />
                  ))}
                </Box>
                <Box className={styles.miniCalLegend}>
                  <span className={styles.legendDot}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 2,
                        background: 'color-mix(in srgb, var(--amber-a4) 55%, transparent)',
                        display: 'inline-block',
                      }}
                    />
                    Смена
                  </span>
                  <span className={styles.legendDot}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red-9)', display: 'inline-block' }} />
                    Праздник
                  </span>
                  <span className={styles.legendDot}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-9)', display: 'inline-block' }} />
                    HR событие
                  </span>
                  <span className={styles.legendDot}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent-9)', display: 'inline-block' }} />
                    Сегодня
                  </span>
                </Box>
              </Box>

              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>Статистика на апрель</Text>
                </Box>
                <Box className={styles.cardBody}>
                  <Box className={styles.statsGrid}>
                    <Box className={styles.statCell}>
                      <Text className={styles.statValue} style={{ color: 'var(--accent-11)' }}>
                        {APRIL_STATS.workDays}
                      </Text>
                      <Text className={styles.statLabel}>рабочих дня</Text>
                    </Box>
                    <Box className={styles.statCell}>
                      <Text className={styles.statValue} style={{ color: 'var(--red-11)' }}>
                        {APRIL_STATS.holidays}
                      </Text>
                      <Text className={styles.statLabel}>праздника</Text>
                    </Box>
                    <Box className={styles.statCell}>
                      <Text className={styles.statValue} style={{ color: 'var(--amber-11)' }}>
                        {APRIL_STATS.workHours}
                      </Text>
                      <Text className={styles.statLabel}>рабочих часов</Text>
                    </Box>
                    <Box className={styles.statCell}>
                      <Text className={styles.statValue} style={{ color: 'var(--orange-11)' }}>
                        {APRIL_STATS.hrEvents}
                      </Text>
                      <Text className={styles.statLabel}>HR события</Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="calendars">
          <Flex className={styles.toolbar} wrap="wrap" gap="3" justify="between" align="center">
            <Flex className={styles.toolbarLeft} wrap="wrap" gap="3" align="center">
              <TextField.Root placeholder="Поиск календарей…" style={{ width: 220 }} />
              <Select.Root defaultValue="all">
                <Select.Trigger placeholder="Тип" />
                <Select.Content>
                  <Select.Item value="all">Все типы</Select.Item>
                  <Select.Item value="work">Рабочий</Select.Item>
                  <Select.Item value="holiday">Праздничный</Select.Item>
                </Select.Content>
              </Select.Root>
              <Select.Root defaultValue="allr">
                <Select.Trigger placeholder="Регион" />
                <Select.Content>
                  <Select.Item value="allr">Все регионы</Select.Item>
                  <Select.Item value="by">BY</Select.Item>
                  <Select.Item value="global">Global</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
            <Button size="2" onClick={() => toast.showInfo('Мок', 'Новый календарь')}>
              <PlusIcon width={14} height={14} />
              Новый календарь
            </Button>
          </Flex>
          <Box className={styles.card}>
            <Box className={`${styles.tableScroll} ${styles.tableNeat}`}>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Регион</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Таймзона</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Слоёв</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className={styles.tableActionsHead}>Действия</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {MOCK_CALENDARS.map((row) => (
                    <Table.Row key={row.id}>
                      <Table.Cell className={styles.tableCellPrimary}>
                        <Text weight="bold">{row.title}</Text>
                        <Text size="1" color="gray" style={{ display: 'block' }}>
                          {row.subtitle}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={`${styles.typeBadge} ${badgeClass(row.typeVariant)}`}>{row.typeLabel}</span>
                      </Table.Cell>
                      <Table.Cell>{row.region}</Table.Cell>
                      <Table.Cell>
                        <Text size="1" style={{ fontFamily: 'var(--default-font-family, monospace)' }}>
                          {row.tz}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text weight="bold">{row.layers}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={row.statusVariant === 'ok' ? 'jade' : 'amber'} variant="soft">
                          {row.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className={styles.tableActionsCell}>
                        <Flex align="center" gap="2" justify="end" wrap="wrap">
                          <Text as="span" size="2" color="gray" title={row.isDefault ? 'По умолчанию' : 'Не по умолчанию'} aria-label={row.isDefault ? 'По умолчанию' : 'Не по умолчанию'}>
                            {row.isDefault ? '★' : '–'}
                          </Text>
                          <Flex className={styles.rowActions} gap="1">
                            <IconButton size="1" variant="ghost" aria-label="Редактировать" onClick={() => toast.showInfo('Мок', 'Редактирование')}>
                              <Pencil1Icon />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="red" aria-label="Удалить" onClick={() => toast.showInfo('Мок', 'Удаление')}>
                              <TrashIcon />
                            </IconButton>
                          </Flex>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="event-types">
          <Flex justify="between" align="start" wrap="wrap" gap="4" mb="4">
            <Text size="2" color="gray" style={{ maxWidth: 56 * 16 }}>
              Каждый тип события задаёт цвет, логику влияния на рабочее время и разрешения на создание.
            </Text>
            <Button size="2" onClick={() => toast.showInfo('Мок', 'Добавить тип')}>
              <PlusIcon width={14} height={14} />
              Добавить тип
            </Button>
          </Flex>
          <Box>
            {MOCK_EVENT_TYPES.map((et) => (
              <Box key={et.id} className={styles.eventTypeRow}>
                <span className={styles.eventTypeSwatch} style={{ background: et.color }} aria-hidden />
                <Box className={styles.eventTypeMeta}>
                  <Text weight="bold">{et.name}</Text>
                  <Text size="1" color="gray">
                    {et.description}
                  </Text>
                </Box>
                <Flex className={styles.eventTypeTags} wrap="wrap">
                  {et.tags.map((t) => (
                    <span key={t} className={`${styles.typeBadge} ${styles.badgeGr}`}>
                      {t}
                    </span>
                  ))}
                </Flex>
                <IconButton size="1" variant="ghost" aria-label={`Редактировать ${et.name}`} onClick={() => toast.showInfo('Мок', et.name)}>
                  <Pencil1Icon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Tabs.Content>

        <Tabs.Content value="rules">
          <Box className={styles.rulesTwoCol}>
            <Box>
              <Box className={styles.card}>
                <Box className={`${styles.cardHeader} ${styles.cardHeaderStacked}`}>
                  <Flex className={styles.cardHeaderTopRow} align="center" justify="between" wrap="nowrap" gap="3">
                    <Flex align="center" gap="2" className={styles.cardTitle} wrap="nowrap">
                      <ActivityLogIcon width={15} height={15} />
                      Правила работы
                    </Flex>
                    <Button variant="soft" size="2" onClick={() => toast.showInfo('Мок', 'Новое правило')}>
                      + Правило
                    </Button>
                  </Flex>
                  <Text className={styles.cardDesc}>Задают рабочее время, смены, break-окна и повторения</Text>
                </Box>
                <Box className={`${styles.tableScroll} ${styles.tableNeat} ${styles.tableFixed} ${styles.tableRules}`}>
                  <Table.Root variant="surface">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Тип повторения</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Применяется к</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className={styles.tableActionsHead}>Действия</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell className={`${styles.tableCellStack} ${styles.tableCellPrimary}`}>
                          <Text weight="bold">Стандартная рабочая неделя</Text>
                          <Text size="1" color="gray">
                            Пн–Пт, 09:00–18:00, break 13:00–14:00
                          </Text>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgeGr}`}>Еженедельно</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgePr}`}>Компания</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <Badge color="jade" variant="soft">
                            Активно
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className={styles.tableActionsCell}>
                          <Flex className={styles.rowActions} justify="end">
                            <IconButton size="1" variant="ghost" aria-label="Редактировать" onClick={() => toast.showInfo('Мок', 'Правило')}>
                              <Pencil1Icon />
                            </IconButton>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className={`${styles.tableCellStack} ${styles.tableCellPrimary}`}>
                          <Text weight="bold">Смена А — ранняя</Text>
                          <Text size="1" color="gray">
                            06:00–14:00, rotation 2/2
                          </Text>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgeGr}`}>Ротация</span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className={`${styles.typeBadge} ${styles.badgeBl}`}>Операционный отдел</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <Badge color="jade" variant="soft">
                            Активно
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className={styles.tableActionsCell}>
                          <Flex className={styles.rowActions} justify="end">
                            <IconButton size="1" variant="ghost" aria-label="Редактировать">
                              <Pencil1Icon />
                            </IconButton>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className={`${styles.tableCellStack} ${styles.tableCellPrimary}`}>
                          <Text weight="bold">Ежегодный performance review</Text>
                          <Text size="1" color="gray">
                            Каждый март, 2 недели
                          </Text>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgeGr}`}>Ежегодно</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgePr}`}>Компания</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <Badge color="jade" variant="soft">
                            Активно
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className={styles.tableActionsCell}>
                          <Flex className={styles.rowActions} justify="end">
                            <IconButton size="1" variant="ghost" aria-label="Редактировать">
                              <Pencil1Icon />
                            </IconButton>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Box>
              </Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>Новое правило</Text>
                </Box>
                <Box className={styles.cardBody}>
                  <Box className={styles.fieldGrid}>
                    <Box className={styles.fieldFull}>
                      <Text as="label" size="2" weight="bold" htmlFor="r-name" style={{ display: 'block', marginBottom: 6 }}>
                        Название правила *
                      </Text>
                      <TextField.Root id="r-name" placeholder="Например: Стандартная рабочая неделя" />
                    </Box>
                    <Box>
                      <Text size="2" weight="bold" style={{ display: 'block', marginBottom: 6 }}>
                        Тип правила
                      </Text>
                      <Select.Root defaultValue="work">
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value="work">Рабочее время</Select.Item>
                          <Select.Item value="shift">Смена</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                    <Box>
                      <Text size="2" weight="bold" style={{ display: 'block', marginBottom: 6 }}>
                        Тип повторения
                      </Text>
                      <Select.Root defaultValue="weekly">
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value="weekly">Еженедельно</Select.Item>
                          <Select.Item value="daily">Ежедневно</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Box>
                  <Flex align="start" gap="3" className={styles.rulesHintWarn} mt="4" role="note">
                    <ExclamationTriangleIcon width={14} height={14} aria-hidden />
                    <Text size="2">Правила в Draft до публикации не влияют на расписания сотрудников.</Text>
                  </Flex>
                  <Button mt="3" onClick={onMockSave}>
                    Добавить правило
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>Типы повторения</Text>
                  <Text className={styles.cardDesc}>Справка</Text>
                </Box>
                <Box className={styles.cardBody}>
                  {[
                    { t: 'Еженедельно', d: 'Пн–Пт 09:00–18:00. Базовый для большинства офисов.' },
                    { t: 'Ротация смен', d: '2/2, 3/3, 4/2 или ночной цикл. Задаётся через payload.' },
                    { t: 'Кастомный RRULE', d: 'Любой RFC5545-паттерн.' },
                  ].map((g) => (
                    <Box key={g.t} className={styles.guideCard}>
                      <Text className={styles.guideTitle}>{g.t}</Text>
                      <Text className={styles.guideText}>{g.d}</Text>
                    </Box>
                  ))}
                  <Flex align="start" gap="3" className={`${styles.infoBox} ${styles.infoBlue}`} mt="3" role="note">
                    <InfoCircledIcon width={14} height={14} aria-hidden />
                    <Text size="2">
                      Повторения всегда хранятся в локальной TZ правила, а не в UTC. Это защищает от разрывов при переходе на
                      летнее/зимнее время.
                    </Text>
                  </Flex>
                </Box>
              </Box>
            </Box>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="exceptions">
          <Flex justify="between" align="start" wrap="wrap" gap="4" mb="4">
            <Box>
              <Text size="4" weight="bold">
                Исключения и переносы
              </Text>
              <Text size="2" color="gray" style={{ marginTop: 4, display: 'block' }}>
                Разовые события, которые перекрывают базовые правила
              </Text>
            </Box>
            <Button size="2" onClick={() => toast.showInfo('Мок', 'Исключение')}>
              + Исключение
            </Button>
          </Flex>
          <Box className={styles.card}>
            <Box className={`${styles.tableScroll} ${styles.tableNeat}`}>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Дата / период</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Применяется к</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className={styles.tableActionsHead}>Действия</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell className={styles.tableCellPrimary}>
                      <Text weight="bold">28.04.2026</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`${styles.typeBadge} ${styles.badgeOr}`}>Перенос</span>
                    </Table.Cell>
                    <Table.Cell>Рабочая суббота (компенсация 09.05)</Table.Cell>
                    <Table.Cell>
                      <span className={`${styles.typeBadge} ${styles.badgePr}`}>Компания</span>
                    </Table.Cell>
                    <Table.Cell className={styles.tableActionsCell}>
                      <Flex className={styles.rowActions} justify="end">
                        <IconButton size="1" variant="ghost" color="red" aria-label="Удалить">
                          <TrashIcon />
                        </IconButton>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell className={styles.tableCellPrimary}>
                      <Text weight="bold">09.05.2026</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`${styles.typeBadge} ${styles.badgeEr}`}>Выходной</span>
                    </Table.Cell>
                    <Table.Cell>День Победы — нерабочий</Table.Cell>
                    <Table.Cell>
                      <span className={`${styles.typeBadge} ${styles.badgePr}`}>BY</span>
                    </Table.Cell>
                    <Table.Cell className={styles.tableActionsCell}>
                      <Flex className={styles.rowActions} justify="end">
                        <IconButton size="1" variant="ghost" color="red" aria-label="Удалить">
                          <TrashIcon />
                        </IconButton>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Box>
          </Box>
          <Flex align="start" gap="3" className={styles.rulesHintWarn} mt="4" role="note">
            <ExclamationTriangleIcon width={14} height={14} aria-hidden />
            <Text size="2">
              Исключения всегда имеют более высокий приоритет, чем базовые правила. Конфликты исключений разрешаются по полю
              «Слой».
            </Text>
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="assign">
          <Box className={styles.assignGrid}>
            <Box>
              <Box className={styles.card}>
                <Box className={`${styles.cardHeader} ${styles.cardHeaderStacked}`}>
                  <Flex className={styles.cardHeaderTopRow} align="center" justify="between" wrap="nowrap" gap="3">
                    <Text className={styles.cardTitle}>Назначения календарей</Text>
                    <Button variant="soft" size="2" onClick={() => toast.showInfo('Мок', 'Назначить')}>
                      + Назначить
                    </Button>
                  </Flex>
                  <Text className={styles.cardDesc}>Кому и какой календарь применяется</Text>
                </Box>
                <Box className={`${styles.tableScroll} ${styles.tableNeat} ${styles.tableFixed} ${styles.tableAssign}`}>
                  <Table.Root variant="surface">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Кому</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Тип цели</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Календарь</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Приоритет</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Активен с</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>До</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className={styles.tableActionsHead}>Действия</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell className={styles.tableCellPrimary}>
                          <Text weight="bold">Вся компания</Text>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgePr}`}>Компания</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellWrap}>🏢 Корпоративный</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>1</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>01.01.2026</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>—</Table.Cell>
                        <Table.Cell className={styles.tableActionsCell}>
                          <Flex className={styles.rowActions} justify="end">
                            <IconButton size="1" variant="ghost" aria-label="Редактировать">
                              <Pencil1Icon />
                            </IconButton>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className={styles.tableCellPrimary}>
                          <Text weight="bold">Minsk Office</Text>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgeBl}`}>Локация</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellWrap}>🇧🇾 BY Праздники</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>2</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>01.01.2026</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>—</Table.Cell>
                        <Table.Cell className={styles.tableActionsCell}>
                          <Flex className={styles.rowActions} justify="end">
                            <IconButton size="1" variant="ghost" aria-label="Редактировать">
                              <Pencil1Icon />
                            </IconButton>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className={styles.tableCellPrimary}>
                          <Text weight="bold">HR-команда</Text>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgeGd}`}>Команда</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellWrap}>👥 HR события</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>3</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>01.01.2026</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>—</Table.Cell>
                        <Table.Cell className={styles.tableActionsCell}>
                          <Flex className={styles.rowActions} justify="end">
                            <IconButton size="1" variant="ghost" aria-label="Редактировать">
                              <Pencil1Icon />
                            </IconButton>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className={styles.tableCellPrimary}>
                          <Text weight="bold">Екатерина Смирнова</Text>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellNowrap}>
                          <span className={`${styles.typeBadge} ${styles.badgeGr}`}>Сотрудник</span>
                        </Table.Cell>
                        <Table.Cell className={styles.tableCellWrap}>🔍 Рекрутинг-слоты</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>4</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>15.03.2026</Table.Cell>
                        <Table.Cell className={styles.tableCellNum}>—</Table.Cell>
                        <Table.Cell className={styles.tableActionsCell}>
                          <Flex className={styles.rowActions} justify="end">
                            <IconButton size="1" variant="ghost" aria-label="Редактировать">
                              <Pencil1Icon />
                            </IconButton>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Box>
              </Box>
            </Box>
            <Box>
              <Box className={styles.card}>
                <Box className={`${styles.cardHeader} ${styles.cardHeaderOnlyText}`}>
                  <Text className={styles.cardTitle}>Модель наследования</Text>
                  <Text className={styles.cardDesc}>Итоговый календарь = merge слоёв по приоритету</Text>
                </Box>
                <Box className={styles.cardBody}>
                  <Box className={styles.layerStack} role="list" aria-label="Слои наследования">
                    <Box className={styles.layerItem} role="listitem">
                      <Box className={styles.layerNum}>1</Box>
                      <Box className={styles.layerItemMain}>
                        <Text weight="bold">Глобальная компания</Text>
                        <Text size="1" color="gray">
                          🏢 Корпоративный · Europe/Minsk
                        </Text>
                      </Box>
                      <span className={`${styles.typeBadge} ${styles.badgePr}`}>max</span>
                    </Box>
                    <Box className={styles.layerArrow} aria-hidden>
                      <ChevronRightIcon style={{ transform: 'rotate(90deg)' }} />
                    </Box>
                    <Box className={styles.layerItem} role="listitem">
                      <Box className={styles.layerNum}>2</Box>
                      <Box className={styles.layerItemMain}>
                        <Text weight="bold">Страна / регион</Text>
                        <Text size="1" color="gray">
                          🇧🇾 BY Праздники
                        </Text>
                      </Box>
                    </Box>
                    <Box className={styles.layerArrow} aria-hidden>
                      <ChevronRightIcon style={{ transform: 'rotate(90deg)' }} />
                    </Box>
                    <Box className={styles.layerItem} role="listitem">
                      <Box className={styles.layerNum}>3</Box>
                      <Box className={styles.layerItemMain}>
                        <Text weight="bold">Локация / Офис</Text>
                        <Text size="1" color="gray">
                          Minsk Office
                        </Text>
                      </Box>
                    </Box>
                    <Box className={styles.layerArrow} aria-hidden>
                      <ChevronRightIcon style={{ transform: 'rotate(90deg)' }} />
                    </Box>
                    <Box className={styles.layerItem} role="listitem">
                      <Box className={styles.layerNum}>4</Box>
                      <Box className={styles.layerItemMain}>
                        <Text weight="bold">Отдел / Команда</Text>
                        <Text size="1" color="gray">
                          HR-команда · 👥 HR события
                        </Text>
                      </Box>
                    </Box>
                    <Box className={styles.layerArrow} aria-hidden>
                      <ChevronRightIcon style={{ transform: 'rotate(90deg)' }} />
                    </Box>
                    <Box className={styles.layerItem} role="listitem">
                      <Box className={styles.layerNum}>5</Box>
                      <Box className={styles.layerItemMain}>
                        <Text weight="bold">Сотрудник</Text>
                        <Text size="1" color="gray">
                          Персональный календарь
                        </Text>
                      </Box>
                    </Box>
                    <Box className={styles.layerArrow} aria-hidden>
                      <ChevronRightIcon style={{ transform: 'rotate(90deg)' }} />
                    </Box>
                    <Box className={`${styles.layerItem} ${styles.layerOverride}`} role="listitem">
                      <Box className={`${styles.layerNum} ${styles.layerNumDim}`}>!</Box>
                      <Box className={styles.layerItemMain}>
                        <Text weight="bold">Исключение на дату</Text>
                        <Text size="1" color="gray">
                          Всегда перекрывает любой слой
                        </Text>
                      </Box>
                      <Badge color="amber" variant="soft">
                        override
                      </Badge>
                    </Box>
                  </Box>
                  <Flex align="start" gap="3" className={styles.rulesHintOk} mt="4" role="note">
                    <CheckCircledIcon width={14} height={14} aria-hidden />
                    <Text size="2">
                      Более специфичный слой перекрывает более общий. Итоговый календарь строится как merge всех слоёв.
                    </Text>
                  </Flex>
                </Box>
              </Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Box>
                    <Text className={styles.cardTitle}>Разбор результата</Text>
                    <Text className={styles.cardDesc}>Объяснение для конкретного сотрудника и даты</Text>
                  </Box>
                </Box>
                <Box className={styles.cardBody}>
                  <Box className={styles.fieldGrid}>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="ex-emp" style={{ display: 'block', marginBottom: 6 }}>
                        Сотрудник
                      </Text>
                      <TextField.Root id="ex-emp" defaultValue="Екатерина Смирнова" placeholder="Имя или ID" />
                    </Box>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="ex-date" style={{ display: 'block', marginBottom: 6 }}>
                        Дата
                      </Text>
                      <TextField.Root id="ex-date" type="date" defaultValue="2026-05-09" />
                    </Box>
                  </Box>
                  <Button mt="4" variant="soft" style={{ width: '100%' }} onClick={() => toast.showInfo('Мок', 'Разбор календаря')}>
                    Объяснить →
                  </Button>
                  <Flex align="start" gap="3" className={`${styles.infoBox} ${styles.infoBlue}`} mt="4" role="status">
                    <InfoCircledIcon width={14} height={14} aria-hidden />
                    <Text size="2">
                      <strong>09.05.2026</strong> — нерабочий день. Источник: BY Праздники, слой 2. Переопределено из: базовое правило
                      «Рабочая неделя». Явное исключение: нет.
                    </Text>
                  </Flex>
                </Box>
              </Box>
            </Box>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="policies">
          <Box className={styles.policyGrid}>
            <Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Box>
                    <Flex align="center" gap="2" className={styles.cardTitle}>
                      <LockClosedIcon width={15} height={15} />
                      Политики конфликтов
                    </Flex>
                    <Text className={styles.cardDesc}>Что делать при пересечении событий</Text>
                  </Box>
                </Box>
                <Box className={styles.cardBody}>
                  <Box className={styles.policyRow}>
                    <Box className={styles.policyIcon}>
                      <ExclamationTriangleIcon />
                    </Box>
                    <Box className={styles.policyRowText}>
                      <Text weight="bold">Двойное бронирование сотрудника</Text>
                      <Text size="1" color="gray">
                        Два события одновременно на одного человека
                      </Text>
                    </Box>
                    <Select.Root defaultValue="block">
                      <Select.Trigger className={styles.selectCompact} />
                      <Select.Content>
                        <Select.Item value="block">Блокировать</Select.Item>
                        <Select.Item value="warn">Предупреждать</Select.Item>
                        <Select.Item value="allow">Разрешать</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box className={styles.policyRow}>
                    <Box className={styles.policyIcon}>
                      <ExclamationTriangleIcon />
                    </Box>
                    <Box className={styles.policyRowText}>
                      <Text weight="bold">Интервью в нерабочее время</Text>
                      <Text size="1" color="gray">
                        Слот создаётся вне рабочих часов или в праздник
                      </Text>
                    </Box>
                    <Select.Root defaultValue="warn">
                      <Select.Trigger className={styles.selectCompact} />
                      <Select.Content>
                        <Select.Item value="warn">Предупреждать</Select.Item>
                        <Select.Item value="block">Блокировать</Select.Item>
                        <Select.Item value="allow">Разрешать</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box className={styles.policyRow}>
                    <Box className={styles.policyIcon}>
                      <PersonIcon />
                    </Box>
                    <Box className={styles.policyRowText}>
                      <Text weight="bold">Лимит отсутствий в команде превышен</Text>
                      <Text size="1" color="gray">
                        Кол-во одновременно отсутствующих &gt; maxParallelAbsences
                      </Text>
                    </Box>
                    <Select.Root defaultValue="approval">
                      <Select.Trigger className={styles.selectCompact} />
                      <Select.Content>
                        <Select.Item value="approval">Требовать согласования</Select.Item>
                        <Select.Item value="block">Блокировать</Select.Item>
                        <Select.Item value="warn">Предупреждать</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box className={styles.policyRow}>
                    <Box className={styles.policyIcon}>
                      <ClockIcon />
                    </Box>
                    <Box className={styles.policyRowText}>
                      <Text weight="bold">Минимальный отдых между сменами</Text>
                      <Text size="1" color="gray">
                        minRestHours между концом и началом следующей смены
                      </Text>
                    </Box>
                    <Select.Root defaultValue="block">
                      <Select.Trigger className={styles.selectCompact} />
                      <Select.Content>
                        <Select.Item value="block">Блокировать</Select.Item>
                        <Select.Item value="warn">Предупреждать</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Box>
              </Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Box>
                    <Text className={styles.cardTitle}>Гибкие ограничения</Text>
                    <Text className={styles.cardDesc}>Применяются через поле constraints</Text>
                  </Box>
                </Box>
                <Box className={styles.cardBody}>
                  <Box className={styles.fieldGrid}>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="mx-hrs" style={{ display: 'block', marginBottom: 6 }}>
                        maxHoursPerDay
                      </Text>
                      <TextField.Root id="mx-hrs" type="number" defaultValue="10" />
                      <Text className={styles.hint}>Максимум рабочих часов в день</Text>
                    </Box>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="mn-rest" style={{ display: 'block', marginBottom: 6 }}>
                        minRestHours
                      </Text>
                      <TextField.Root id="mn-rest" type="number" defaultValue="11" />
                      <Text className={styles.hint}>Минимальный отдых между сменами</Text>
                    </Box>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="mx-abs" style={{ display: 'block', marginBottom: 6 }}>
                        maxParallelAbsences
                      </Text>
                      <TextField.Root id="mx-abs" type="number" defaultValue="3" />
                      <Text className={styles.hint}>Макс. одновременных отсутствий в команде</Text>
                    </Box>
                    <Box>
                      <Text as="label" size="2" weight="bold" htmlFor="mx-wk" style={{ display: 'block', marginBottom: 6 }}>
                        maxWeeklyHours
                      </Text>
                      <TextField.Root id="mx-wk" type="number" defaultValue="48" />
                      <Text className={styles.hint}>Максимум часов в неделю</Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Box>
                    <Text className={styles.cardTitle}>Интеграции</Text>
                    <Text className={styles.cardDesc}>Внешние источники и синхронизация</Text>
                  </Box>
                </Box>
                <Box className={styles.cardBody}>
                  <Box className={styles.integrationStack}>
                    <Box className={styles.policyRow}>
                      <Box className={styles.policyIcon}>
                        <CalendarIcon width={14} height={14} />
                      </Box>
                      <Box className={styles.policyRowText}>
                        <Text weight="bold">Google Calendar</Text>
                        <Text size="1" color="gray">
                          Двусторонняя синхронизация HR событий
                        </Text>
                      </Box>
                      <Badge color="jade" variant="soft">
                        Активна
                      </Badge>
                    </Box>
                    <Box className={styles.policyRow}>
                      <Box className={styles.policyIcon}>
                        <EnvelopeClosedIcon width={14} height={14} />
                      </Box>
                      <Box className={styles.policyRowText}>
                        <Text weight="bold">Microsoft Outlook</Text>
                        <Text size="1" color="gray">
                          Push корпоративных событий в ящики сотрудников
                        </Text>
                      </Box>
                      <Badge color="amber" variant="soft">
                        Конфиг
                      </Badge>
                    </Box>
                    <Box className={styles.policyRow}>
                      <Box className={styles.policyIcon}>
                        <ChatBubbleIcon width={14} height={14} />
                      </Box>
                      <Box className={styles.policyRowText}>
                        <Text weight="bold">Slack</Text>
                        <Text size="1" color="gray">
                          Уведомления в каналы о новых событиях и переносах
                        </Text>
                      </Box>
                      <Badge color="gray" variant="soft">
                        Отключена
                      </Badge>
                    </Box>
                    <Box className={styles.policyRow}>
                      <Box className={styles.policyIcon}>
                        <Link2Icon width={14} height={14} />
                      </Box>
                      <Box className={styles.policyRowText}>
                        <Text weight="bold">Webhook / n8n</Text>
                        <Text size="1" color="gray">
                          POST-события при создании, изменении, удалении
                        </Text>
                      </Box>
                      <Badge color="gray" variant="soft">
                        Не настроена
                      </Badge>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box className={styles.card}>
                <Box className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>Специальные флаги</Text>
                </Box>
                <Box className={styles.cardBody}>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        Учитывать DST при пересчёте
                      </Text>
                      <Text size="1" color="gray">
                        Автоматически сдвигать события при переходе на летнее/зимнее время
                      </Text>
                    </Box>
                    <Switch checked={dstFlag} onCheckedChange={setDstFlag} />
                  </Flex>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        Режим просмотра Multi-TZ
                      </Text>
                      <Text size="1" color="gray">
                        Показывать время в TZ компании / пользователя / источника
                      </Text>
                    </Box>
                    <Switch checked={multiTz} onCheckedChange={setMultiTz} />
                  </Flex>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        Импорт государственных праздников
                      </Text>
                      <Text size="1" color="gray">
                        Автообновление при старте нового года
                      </Text>
                    </Box>
                    <Switch checked={holidayImport} onCheckedChange={setHolidayImport} />
                  </Flex>
                  <Flex className={styles.rowBetween}>
                    <Box>
                      <Text size="2" weight="medium">
                        API-first доступ к движку
                      </Text>
                      <Text size="1" color="gray">
                        Разрешить внешним системам запрашивать итоговый календарь через REST
                      </Text>
                    </Box>
                    <Switch checked={apiFirst} onCheckedChange={setApiFirst} />
                  </Flex>
                  <Button mt="4" variant="solid" onClick={onMockSave}>
                    Сохранить политики (мок)
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}

export function CompanyCalendarSettingsPage() {
  return (
    <Suspense
      fallback={
        <Box className={styles.page}>
          <Text color="gray">Загрузка…</Text>
        </Box>
      }
    >
      <CompanyCalendarSettingsPageContent />
    </Suspense>
  )
}
