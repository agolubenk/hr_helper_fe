'use client'

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Box, Flex, Text, Button, Card, Table, Badge, Dialog, Separator, Tabs, TextField, Select } from '@radix-ui/themes'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  PersonIcon,
  VideoIcon,
  BoxIcon,
  ReloadIcon,
  CheckIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  CopyIcon,
  GearIcon,
} from '@radix-ui/react-icons'
import { useToast } from '@/shared/components/feedback/Toast'
import SlotsPanel from '@/shared/components/calendar/SlotsPanel'
import styles from './CalendarPage.module.css'

interface Attendee {
  email: string
  name?: string
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  organizer?: boolean
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'interview' | 'screening' | 'meeting' | 'other'
  candidate?: string
  interviewer?: string
  format?: 'online' | 'office'
  vacancy?: string
  status?: 'confirmed' | 'tentative' | 'cancelled'
  location?: string
  description?: string
  meetLink?: string
  creatorEmail?: string
  creatorName?: string
  attendees?: Attendee[]
  allDay?: boolean
  multiDay?: boolean
  shortTitle?: string
  dotColor?: string
  outline?: boolean
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Интервью: Иван Иванов',
    start: new Date(2026, 1, 13, 14, 0),
    end: new Date(2026, 1, 13, 15, 30),
    type: 'interview',
    shortTitle: 'Интервью',
    dotColor: '#8B5CF6',
    candidate: 'Иван Иванов',
    interviewer: 'Андрей Голубенко',
    format: 'online',
    vacancy: 'Frontend Engineer (React)',
    status: 'confirmed',
    location: 'Google Meet',
    description: 'Техническое интервью с кандидатом.',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    creatorEmail: 'andrey@example.com',
    creatorName: 'Андрей Голубенко',
    attendees: [
      { email: 'andrey@example.com', name: 'Андрей Голубенко', responseStatus: 'accepted', organizer: true },
      { email: 'ivan@example.com', name: 'Иван Иванов', responseStatus: 'accepted' },
    ],
    allDay: false
  },
  {
    id: '2',
    title: 'HR-скрининг: Мария Козлова',
    start: new Date(2026, 1, 13, 10, 0),
    end: new Date(2026, 1, 13, 10, 30),
    type: 'screening',
    shortTitle: 'HR-скрининг',
    dotColor: '#A855F7',
    candidate: 'Мария Козлова',
    interviewer: 'Андрей Голубенко',
    format: 'online',
    vacancy: 'Fullstack Engineer',
    status: 'confirmed',
    location: 'Google Meet',
    description: 'HR-скрининг кандидата.',
    meetLink: 'https://meet.google.com/xyz-uvw-rst',
    creatorEmail: 'andrey@example.com',
    creatorName: 'Андрей Голубенко',
    attendees: [
      { email: 'andrey@example.com', name: 'Андрей Голубенко', responseStatus: 'accepted', organizer: true },
      { email: 'maria.koz@example.com', name: 'Мария Козлова', responseStatus: 'accepted' }
    ],
    allDay: false
  },
  {
    id: '3',
    title: 'Интервью: Егор Говсь',
    start: new Date(2026, 1, 14, 16, 0),
    end: new Date(2026, 1, 14, 17, 30),
    type: 'interview',
    shortTitle: 'Интервью',
    dotColor: '#f59e0b',
    candidate: 'Егор Говсь',
    interviewer: 'Иван Петров',
    format: 'office',
    vacancy: 'Backend Engineer (Python)',
    status: 'tentative',
    location: 'Офис, каб. 205',
    description: 'Очное техническое интервью.',
    creatorEmail: 'ivan@example.com',
    creatorName: 'Иван Петров',
    attendees: [
      { email: 'ivan@example.com', name: 'Иван Петров', responseStatus: 'accepted', organizer: true },
      { email: 'egor@example.com', name: 'Егор Говсь', responseStatus: 'tentative' }
    ],
    allDay: false
  },
  {
    id: '4',
    title: 'JS Tech Screening | Money Drop',
    start: new Date(2026, 1, 9, 10, 0),
    end: new Date(2026, 1, 9, 11, 0),
    type: 'screening',
    shortTitle: 'JS Tech Screening',
    dotColor: '#10b981',
    candidate: 'Money Drop',
    allDay: false
  },
  {
    id: '5',
    title: 'JS Final Interview | TSYGANKOV',
    start: new Date(2026, 1, 9, 10, 45),
    end: new Date(2026, 1, 9, 12, 15),
    type: 'interview',
    shortTitle: 'JS Final Interview',
    dotColor: '#ec4899',
    candidate: 'TSYGANKOV',
    allDay: false
  },
  {
    id: '6',
    title: 'AI Screening | Алекс',
    start: new Date(2026, 1, 12, 10, 0),
    end: new Date(2026, 1, 12, 11, 0),
    type: 'screening',
    shortTitle: 'AI Screening',
    dotColor: '#ef4444',
    candidate: 'Алекс',
    allDay: false
  },
]

export default function CalendarPage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedOffice, setSelectedOffice] = useState<'minsk' | 'warsaw' | 'gomel'>('minsk')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'slots'>('calendar')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const toast = useToast()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const mockEvents = MOCK_EVENTS

  const offices = [
    { id: 'minsk', label: 'Минск' },
    { id: 'warsaw', label: 'Варшава' },
    { id: 'gomel', label: 'Гомель' },
  ]

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview': return '#8B5CF6'
      case 'screening': return '#A855F7'
      case 'meeting': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview': return 'Интервью'
      case 'screening': return 'HR-скрининг'
      case 'meeting': return 'Встреча'
      default: return 'Событие'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    const days: (Date | null)[] = []
    for (let i = 0; i < adjustedStart; i++) {
      days.push(new Date(year, month, -adjustedStart + i + 1))
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    const nextMonth = new Date(year, month + 1, 1)
    let nextD = 1
    while (days.length % 7 !== 0) {
      days.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextD))
      nextD++
    }
    return days
  }

  const getEventsForDate = (date: Date | null): CalendarEvent[] => {
    if (!date) return []
    return mockEvents.filter(e => new Date(e.start).toDateString() === date.toDateString())
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') newDate.setMonth(prev.getMonth() - 1)
      else newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const getWeekDays = (date: Date): Date[] => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return days
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction === 'prev' ? -7 : 7))
      return newDate
    })
  }

  const goToToday = () => setCurrentDate(new Date())

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setEventModalOpen(true)
  }

  const handleSyncCalendar = async () => {
    setIsSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.showSuccess('Календарь синхронизирован', 'События успешно обновлены из Google Calendar')
    } catch {
      toast.showError('Ошибка синхронизации', 'Не удалось синхронизировать календарь')
    } finally {
      setIsSyncing(false)
    }
  }

  const getDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime()
    const durationMinutes = Math.round(durationMs / (1000 * 60))
    if (durationMinutes < 60) return `${durationMinutes} мин`
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    if (minutes === 0) return `${hours}ч`
    if (minutes === 30) return `${hours},5ч`
    return `${hours}ч ${minutes}мин`
  }

  const getAttendeeStatusBadge = (status: Attendee['responseStatus']) => {
    switch (status) {
      case 'accepted': return { color: '#10b981', label: 'Принял', icon: CheckIcon }
      case 'declined': return { color: '#ef4444', label: 'Отклонил', icon: Cross2Icon }
      case 'tentative': return { color: '#f59e0b', label: 'Возможно', icon: ExclamationTriangleIcon }
      default: return { color: '#6b7280', label: 'Не ответил', icon: ClockIcon }
    }
  }

  const WEEK_START_HOUR = 8
  const WEEK_END_HOUR = 22
  const HOUR_HEIGHT = 48

  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const weekDays = useMemo(() => ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'], [])
  const weekDaysDates = useMemo(() => getWeekDays(currentDate), [currentDate.getTime()])
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate.getFullYear(), currentDate.getMonth()])
  const todayStr = new Date().toDateString()
  const MAX_VISIBLE_EVENTS = 3

  const filteredEvents = mockEvents.filter(event => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      event.title.toLowerCase().includes(query) ||
      event.candidate?.toLowerCase().includes(query) ||
      event.vacancy?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    )
  })

  const copyEventLink = (event: CalendarEvent) => {
    const link = `https://calendar.google.com/event?eid=${event.id}`
    navigator.clipboard.writeText(link).then(() => {
      toast.showSuccess('Ссылка скопирована', 'Ссылка на событие скопирована в буфер обмена')
    }).catch(() => {
      toast.showError('Ошибка', 'Не удалось скопировать ссылку')
    })
  }

  return (
    <Box className={styles.calendarContainer}>
      <Flex align="center" justify="between" mb="4" wrap="wrap" gap="3" style={{ flexShrink: 0 }}>
        <Text size="5" weight="bold">Календарь</Text>
        <Flex align="center" gap="3">
          <Button
            variant="soft"
            size="2"
            onClick={handleSyncCalendar}
            disabled={isSyncing}
            style={{ backgroundColor: isSyncing ? 'var(--gray-4)' : 'var(--accent-9)', color: '#ffffff' }}
          >
            <ReloadIcon width={16} height={16} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            <Text size="2">{isSyncing ? 'Синхронизация...' : 'Синхронизировать'}</Text>
          </Button>
          <Button variant="soft" size="2" onClick={() => navigate({ to: '/calendar/settings' })}>
            <GearIcon width={16} height={16} />
            Настройки
          </Button>
        </Flex>
      </Flex>

      <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as 'calendar' | 'list' | 'slots')} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Flex align="center" justify="between" mb="0" style={{ flexShrink: 0 }} className={styles.tabsRow}>
          <Tabs.List mb="0" style={{ flexShrink: 0 }}>
            <Tabs.Trigger value="calendar">
              <CalendarIcon width={16} height={16} />
              <Text size="2" style={{ marginLeft: '8px' }}>Календарь</Text>
            </Tabs.Trigger>
            <Tabs.Trigger value="list">
              <ListBulletIcon width={16} height={16} />
              <Text size="2" style={{ marginLeft: '8px' }}>Список событий</Text>
            </Tabs.Trigger>
            <Tabs.Trigger value="slots">
              <ClockIcon width={16} height={16} />
              <Text size="2" style={{ marginLeft: '8px' }}>Слоты</Text>
            </Tabs.Trigger>
          </Tabs.List>
          {activeTab === 'calendar' && (
            <Select.Root value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week' | 'day')}>
              <Select.Trigger style={{ minWidth: '120px' }} />
              <Select.Content>
                <Select.Item value="month">Месяц</Select.Item>
                <Select.Item value="week">Неделя</Select.Item>
                <Select.Item value="day">День</Select.Item>
              </Select.Content>
            </Select.Root>
          )}
        </Flex>

        <Tabs.Content value="calendar" className={styles.tabsContentCalendar}>
          <Flex align="center" justify="between" mt="2" mb="4" wrap="wrap" gap="3" style={{ flexShrink: 0 }}>
            <Flex align="center" gap="3">
              <Button variant="soft" size="2" onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}>
                <ChevronLeftIcon width={16} height={16} />
              </Button>
              <Text size="5" weight="bold">
                {viewMode === 'month' ? monthName : `Неделя ${weekDaysDates[0]?.toLocaleDateString('ru-RU', { day: 'numeric' })} — ${weekDaysDates[6]?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              </Text>
              <Button variant="soft" size="2" onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}>
                <ChevronRightIcon width={16} height={16} />
              </Button>
              <Button variant="soft" size="2" onClick={goToToday}>Сегодня</Button>
            </Flex>

            <Flex gap="1" align="center" className={styles.officeToggle}>
              {offices.map(office => (
                <Box
                  key={office.id}
                  className={styles.officeButton}
                  data-selected={selectedOffice === office.id}
                  onClick={() => setSelectedOffice(office.id as 'minsk' | 'warsaw' | 'gomel')}
                >
                  <Text size="1" weight={selectedOffice === office.id ? 'medium' : 'regular'}>{office.label}</Text>
                </Box>
              ))}
            </Flex>
          </Flex>

          {viewMode === 'month' && (
            <Box className={styles.calendarGridWrap}>
            <Box className={styles.calendarGrid}>
                {weekDays.map(day => (
                  <Box key={day} className={styles.weekDayHeader}>
                    <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>{day}</Text>
                  </Box>
                ))}
                {days.map((date, index) => {
                  const events = getEventsForDate(date)
                  const isToday = date && date.toDateString() === todayStr
                  const isCurrentMonth = date && date.getMonth() === currentDate.getMonth()
                  const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS)
                  const moreCount = events.length - MAX_VISIBLE_EVENTS

                  return (
                    <Box
                      key={index}
                      className={styles.calendarDay}
                      data-today={isToday}
                      data-other-month={!isCurrentMonth}
                    >
                      {date && (
                        <>
                          <Flex align="center" justify="between" mb="1" style={{ width: '100%' }}>
                            <Text
                              as="span"
                              size="2"
                              weight={isToday ? 'bold' : 'regular'}
                              className={isToday ? styles.todayBadge : undefined}
                            >
                              {date.getDate()}
                            </Text>
                            {events.length > 0 && (
                              <Badge size="1" style={{ backgroundColor: 'var(--accent-9)', color: '#ffffff', flexShrink: 0 }}>
                                {events.length}
                              </Badge>
                            )}
                          </Flex>
                          <Flex direction="column" gap="1" style={{ flex: 1, minHeight: 0 }}>
                            {visibleEvents.map(event => (
                              <Flex
                                key={event.id}
                                align="center"
                                gap="6"
                                className={styles.eventRow}
                                onClick={() => handleEventClick(event)}
                                title={`${event.title} (${formatTime(event.start)} - ${formatTime(event.end)})`}
                              >
                                <Box
                                  className={styles.eventDot}
                                  style={{
                                    backgroundColor: event.outline ? 'transparent' : (event.dotColor || getEventTypeColor(event.type)),
                                    border: event.outline ? `2px solid ${event.dotColor || getEventTypeColor(event.type)}` : 'none',
                                  }}
                                />
                                <Text size="1" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {event.allDay ? (event.shortTitle || event.title) : `${formatTime(event.start)} ${event.shortTitle || event.title}`}
                                </Text>
                              </Flex>
                            ))}
                            {moreCount > 0 && (
                              <Text size="1" className={styles.moreLabel}>Ещё {moreCount}</Text>
                            )}
                          </Flex>
                        </>
                      )}
                    </Box>
                  )
                })}
            </Box>
            </Box>
          )}

          {viewMode === 'week' && (
            <Box className={styles.weekViewWrap}>
              <Box className={styles.weekViewGrid}>
                <Box className={styles.weekViewHeader}>
                  <Box className={styles.weekTimeCorner}>
                    <Text size="1" style={{ color: 'var(--gray-11)' }}>GMT+03</Text>
                  </Box>
                  {weekDaysDates.map((date, i) => {
                    const isToday = date.toDateString() === todayStr
                    return (
                      <Box key={i} className={styles.weekDayHeaderCell}>
                        <Text size="1" weight="bold" style={{ color: 'var(--gray-11)' }}>{weekDays[i]}</Text>
                        <Text
                          as="span"
                          size="2"
                          weight={isToday ? 'bold' : 'regular'}
                          className={isToday ? styles.weekTodayBadge : undefined}
                          style={!isToday ? { marginTop: 4 } : undefined}
                        >
                          {date.getDate()}
                        </Text>
                      </Box>
                    )
                  })}
                </Box>
                <Box className={styles.weekViewBody}>
                  <Box className={styles.weekViewBodyContent}>
                    <Box className={styles.weekTimeColumn}>
                    {Array.from({ length: WEEK_END_HOUR - WEEK_START_HOUR }, (_, i) => WEEK_START_HOUR + i).map(hour => (
                      <Box key={hour} className={styles.weekTimeSlot} style={{ height: HOUR_HEIGHT }}>
                        <Text size="1" style={{ color: 'var(--gray-11)' }}>{hour.toString().padStart(2, '0')}:00</Text>
                      </Box>
                    ))}
                  </Box>
                  <Box className={styles.weekDaysColumn}>
                    {weekDaysDates.map((date, dayIndex) => {
                      const dayEvents = mockEvents.filter(e => {
                        if (e.allDay || e.multiDay) return false
                        const d = new Date(e.start)
                        return d.toDateString() === date.toDateString()
                      })
                      return (
                        <Box key={dayIndex} className={styles.weekDayColumn} style={{ minHeight: (WEEK_END_HOUR - WEEK_START_HOUR) * HOUR_HEIGHT }}>
                          {Array.from({ length: WEEK_END_HOUR - WEEK_START_HOUR }, (_, i) => (
                            <Box key={i} className={styles.weekHourCell} style={{ height: HOUR_HEIGHT }} />
                          ))}
                          {date.toDateString() === todayStr && (() => {
                            const now = currentTime
                            const totalMinutes = (WEEK_END_HOUR - WEEK_START_HOUR) * 60
                            const currentMinutes = now.getHours() * 60 + now.getMinutes() - WEEK_START_HOUR * 60
                            const positionPct = Math.max(0, Math.min(100, (currentMinutes / totalMinutes) * 100))
                            return positionPct > 0 && positionPct < 100 ? (
                              <Box
                                className={styles.weekCurrentTimeIndicator}
                                style={{ top: `${positionPct}%` }}
                                aria-hidden
                              >
                                <Box className={styles.weekCurrentTimeDot} />
                                <Box className={styles.weekCurrentTimeLine} />
                              </Box>
                            ) : null
                          })()}
                          {dayEvents.map(event => {
                            const start = new Date(event.start)
                            const end = new Date(event.end)
                            const startMinutes = start.getHours() * 60 + start.getMinutes() - WEEK_START_HOUR * 60
                            const endMinutes = end.getHours() * 60 + end.getMinutes() - WEEK_START_HOUR * 60
                            const totalMinutes = (WEEK_END_HOUR - WEEK_START_HOUR) * 60
                            const topPct = Math.max(0, (startMinutes / totalMinutes) * 100)
                            const heightPct = Math.min(100 - topPct, ((endMinutes - startMinutes) / totalMinutes) * 100)
                            if (heightPct <= 0) return null
                            return (
                              <Box
                                key={event.id}
                                className={styles.weekEventBlock}
                                style={{
                                  top: `${topPct}%`,
                                  height: `${heightPct}%`,
                                  backgroundColor: event.dotColor || getEventTypeColor(event.type),
                                }}
                                onClick={(e) => { e.stopPropagation(); handleEventClick(event) }}
                              >
                                <Text size="1" weight="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {event.shortTitle || event.title}
                                </Text>
                                {event.candidate && (
                                  <Text size="1" style={{ color: 'rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {event.candidate}
                                  </Text>
                                )}
                              </Box>
                            )
                          })}
                        </Box>
                      )
                    })}
                  </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {viewMode === 'day' && (
            <Card>
              <Box p="4">
                <Text size="4" weight="bold" mb="4">День - {formatDate(currentDate)}</Text>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Время</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Событие</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Кандидат</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Интервьюер</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Формат</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {mockEvents.filter(e => !e.multiDay && new Date(e.start).toDateString() === currentDate.toDateString()).map(event => (
                      <Table.Row key={event.id} style={{ cursor: 'pointer' }} onClick={() => handleEventClick(event)}>
                        <Table.Cell>
                          <Flex align="center" gap="2">
                            <ClockIcon width={14} height={14} />
                            <Text size="2">{formatTime(event.start)} - {formatTime(event.end)}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge style={{ backgroundColor: getEventTypeColor(event.type) }}>{getEventTypeLabel(event.type)}</Badge>
                        </Table.Cell>
                        <Table.Cell><Text size="2">{event.candidate || '-'}</Text></Table.Cell>
                        <Table.Cell><Text size="2">{event.interviewer || '-'}</Text></Table.Cell>
                        <Table.Cell>
                          <Flex align="center" gap="1">
                            {event.format === 'online' ? <VideoIcon width={14} height={14} /> : <BoxIcon width={14} height={14} />}
                            <Text size="2">{event.format === 'online' ? 'Онлайн' : 'Офис'}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell><Text size="2">{event.vacancy || '-'}</Text></Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card>
          )}
        </Tabs.Content>

        <Tabs.Content value="list" className={styles.tabsContentList}>
          <Card mt="2">
            <Box p="4">
              <Flex direction="column" gap="4" mb="4">
                <Flex align="center" gap="3" wrap="wrap">
                  <TextField.Root
                    placeholder="Поиск по названию, кандидату, вакансии..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, minWidth: '300px' }}
                  >
                    <TextField.Slot><MagnifyingGlassIcon width={16} height={16} /></TextField.Slot>
                  </TextField.Root>
                  {searchQuery && (
                    <Button variant="soft" size="2" onClick={() => setSearchQuery('')}>
                      <Cross2Icon width={14} height={14} />
                      <Text size="2" style={{ marginLeft: '4px' }}>Очистить</Text>
                    </Button>
                  )}
                </Flex>
              </Flex>

              {filteredEvents.length > 0 ? (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell style={{ width: '25%' }}>Название встречи</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell style={{ width: '20%' }}>Дата и время</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell style={{ width: '15%' }}>Google Meet</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell style={{ width: '35%' }}>Описание</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell style={{ width: '5%' }}>Ссылка</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredEvents.map(event => (
                      <Table.Row key={event.id} style={{ cursor: 'pointer' }} onClick={() => handleEventClick(event)}>
                        <Table.Cell>
                          <Flex align="center" gap="2">
                            {event.status === 'confirmed' ? <CheckIcon width={16} height={16} style={{ color: '#10b981' }} /> :
                              event.status === 'tentative' ? <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} /> :
                              event.status === 'cancelled' ? <Cross2Icon width={16} height={16} style={{ color: '#ef4444' }} /> :
                              <BoxIcon width={16} height={16} style={{ color: '#6b7280' }} />}
                            <Text size="2" weight="bold">{event.title}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2">
                            {event.allDay
                              ? `${event.start.toLocaleDateString('ru-RU')} (Весь день)`
                              : event.multiDay
                              ? `${event.start.toLocaleDateString('ru-RU')} — ${event.end.toLocaleDateString('ru-RU')}`
                              : `${event.start.toLocaleDateString('ru-RU')} ${formatTime(event.start)} - ${formatTime(event.end)}`}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          {event.meetLink ? (
                            <Button variant="soft" size="1" onClick={(e) => { e.stopPropagation(); window.open(event.meetLink, '_blank') }} style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                              <VideoIcon width={12} height={12} />
                              <Text size="1" style={{ color: '#ffffff', marginLeft: '4px' }}>Google Meet</Text>
                            </Button>
                          ) : (
                            <Text size="2" style={{ color: 'var(--gray-11)' }}>-</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {event.description ? (
                            <Text size="2" style={{ color: 'var(--gray-11)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.description}</Text>
                          ) : (
                            <Text size="2" style={{ color: 'var(--gray-11)' }}>-</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Button variant="soft" size="1" onClick={(e) => { e.stopPropagation(); copyEventLink(event) }} style={{ backgroundColor: 'var(--accent-9)', color: '#ffffff' }}>
                            <ExternalLinkIcon width={12} height={12} />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              ) : (
                <Box style={{ textAlign: 'center', padding: '48px' }}>
                  <CalendarIcon width={48} height={48} style={{ color: 'var(--gray-11)', marginBottom: '16px' }} />
                  <Text size="4" weight="bold" style={{ color: 'var(--gray-11)', display: 'block', marginBottom: '8px' }}>События не найдены</Text>
                  <Text size="2" style={{ color: 'var(--gray-11)' }}>
                    {searchQuery ? 'Попробуйте изменить параметры поиска' : 'События календаря не синхронизированы. Запустите синхронизацию.'}
                  </Text>
                </Box>
              )}
            </Box>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="slots" className={styles.tabsContentList}>
          <Card mt="2">
            <Box p="4">
              <Flex align="center" justify="between" mb="4">
                <Flex align="center" gap="2">
                  <ClockIcon width={20} height={20} style={{ color: '#10b981' }} />
                  <Text size="4" weight="bold">Свободные слоты</Text>
                </Flex>
                <Button variant="soft" size="2" onClick={() => toast.showInfo('Копирование', 'Функция копирования всех слотов в разработке')} style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                  <CopyIcon width={14} height={14} />
                  <Text size="2" style={{ color: '#ffffff', marginLeft: '4px' }}>Копировать все</Text>
                </Button>
              </Flex>
              <SlotsPanel />
            </Box>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      <Dialog.Root open={eventModalOpen} onOpenChange={setEventModalOpen}>
        <Dialog.Content style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
          {selectedEvent && (
            <>
              <Dialog.Title>{selectedEvent.title}</Dialog.Title>
              <Box mt="4">
                <Flex direction="column" gap="4">
                  <Box>
                    <Flex align="center" gap="2" mb="2">
                      <ClockIcon width={16} height={16} />
                      <Text size="3" weight="bold">Время</Text>
                    </Flex>
                    <Text size="2">
                      {selectedEvent.multiDay
                        ? `${selectedEvent.start.toLocaleDateString('ru-RU')} — ${selectedEvent.end.toLocaleDateString('ru-RU')}`
                        : `${formatTime(selectedEvent.start)} - ${formatTime(selectedEvent.end)}${!selectedEvent.allDay ? ` (${getDuration(selectedEvent.start, selectedEvent.end)})` : ''}`}
                    </Text>
                  </Box>
                  {selectedEvent.location && (
                    <Box>
                      <Flex align="center" gap="2" mb="2">
                        <BoxIcon width={16} height={16} />
                        <Text size="3" weight="bold">Место</Text>
                      </Flex>
                      <Text size="2">{selectedEvent.location}</Text>
                    </Box>
                  )}
                  <Box>
                    <Flex align="center" gap="2" mb="2">
                      <Text size="3" weight="bold">Статус</Text>
                    </Flex>
                    <Badge style={{
                      backgroundColor: selectedEvent.status === 'confirmed' ? '#10b981' : selectedEvent.status === 'tentative' ? '#f59e0b' : '#ef4444'
                    }}>
                      {selectedEvent.status === 'confirmed' ? 'Подтверждено' : selectedEvent.status === 'tentative' ? 'Предварительно' : 'Отменено'}
                    </Badge>
                  </Box>
                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <Box>
                      <Flex align="center" gap="2" mb="2">
                        <PersonIcon width={16} height={16} />
                        <Text size="3" weight="bold">Участники</Text>
                      </Flex>
                      <Flex direction="column" gap="2">
                        {selectedEvent.attendees.map((attendee, idx) => {
                          const statusBadge = getAttendeeStatusBadge(attendee.responseStatus)
                          const StatusIcon = statusBadge.icon
                          return (
                            <Flex key={idx} align="center" justify="between">
                              <Flex align="center" gap="2">
                                <Text size="2" weight={attendee.organizer ? 'bold' : 'regular'}>{attendee.name || attendee.email}</Text>
                                {attendee.organizer && <Badge style={{ backgroundColor: 'var(--accent-9)' }}>Организатор</Badge>}
                              </Flex>
                              <Badge style={{ backgroundColor: statusBadge.color, color: '#ffffff' }}>
                                <StatusIcon width={12} height={12} />
                                <Text size="1" style={{ color: '#ffffff', marginLeft: '4px' }}>{statusBadge.label}</Text>
                              </Badge>
                            </Flex>
                          )
                        })}
                      </Flex>
                    </Box>
                  )}
                  {selectedEvent.meetLink && (
                    <Box>
                      <Flex align="center" gap="2" mb="2">
                        <VideoIcon width={16} height={16} />
                        <Text size="3" weight="bold">Google Meet</Text>
                      </Flex>
                      <Button variant="soft" size="2" onClick={() => window.open(selectedEvent!.meetLink, '_blank')} style={{ backgroundColor: 'var(--accent-9)', color: '#ffffff' }}>
                        <ExternalLinkIcon width={14} height={14} />
                        <Text size="2" style={{ color: '#ffffff', marginLeft: '4px' }}>Присоединиться к встрече</Text>
                      </Button>
                    </Box>
                  )}
                  {selectedEvent.description && (
                    <>
                      <Separator size="4" />
                      <Box>
                        <Text size="3" weight="bold" mb="2">Описание</Text>
                        <Box p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          <Text size="2">{selectedEvent.description}</Text>
                        </Box>
                      </Box>
                    </>
                  )}
                </Flex>
              </Box>
              <Flex gap="3" justify="end" mt="4">
                <Button variant="soft" onClick={() => setEventModalOpen(false)}>Закрыть</Button>
              </Flex>
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
