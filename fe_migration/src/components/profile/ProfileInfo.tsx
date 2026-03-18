'use client'

import { Box, Text, Flex, Grid, Table } from '@radix-ui/themes'
import { PersonIcon, ClockIcon, EnvelopeClosedIcon, CopyIcon } from '@radix-ui/react-icons'
import SocialLinks from './SocialLinks'
import type { SocialLink } from '@/lib/types/social-links'
import type { WorkingHours } from '@/lib/types/working-hours'
import {
  formatWorkingHours,
  formatWorkTimeByDay,
  formatMeetingIntervalByDay,
  buildWorkTimeByDayFromUniform,
  DAY_KEYS,
  DAY_NAMES,
} from '@/lib/types/working-hours'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './ProfileInfo.module.css'

interface ProfileInfoProps {
  userData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    telegram?: string
    registrationDate: string
    lastLoginDate: string
    workSchedule?: string
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: WorkingHours['custom']
    workingHours?: WorkingHours
    meetingInterval: string
    socialLinks?: SocialLink[]
  }
}

function InfoRow({
  label,
  value,
  icon,
  copyable,
  inline,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  copyable?: boolean
  inline?: boolean
}) {
  const toast = useToast()

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(value).then(
      () => toast.showSuccess('Скопировано', 'Скопировано в буфер обмена'),
      () => toast.showError('Ошибка', 'Не удалось скопировать')
    )
  }

  const valueContent = (
    <Flex
      align="center"
      gap="2"
      className={copyable ? styles.valueWithCopy : undefined}
    >
      {icon}
      <Text size="3" style={{ color: 'var(--gray-12)' }}>
        {value}
      </Text>
      {copyable && (
        <Box
          asChild
          className={styles.copyButton}
          style={{
            cursor: 'pointer',
            padding: '1px',
            background: 'transparent',
            border: 'none',
            color: 'var(--gray-11)',
          }}
          title="Копировать"
          onClick={handleCopy}
        >
          <button type="button" aria-label="Копировать">
            <CopyIcon width={14} height={14} />
          </button>
        </Box>
      )}
    </Flex>
  )

  if (inline) {
    return (
      <Flex align="center" gap="2" className={`${styles.infoRow} ${styles.infoRowInline}`}>
        <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
          {label}
        </Text>
        {valueContent}
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="1" className={styles.infoRow}>
      <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
        {label}
      </Text>
      {valueContent}
    </Flex>
  )
}

function formatScheduleForClipboard(
  workTimeByDay: NonNullable<WorkingHours['custom']>
): string {
  const rows = DAY_KEYS.flatMap((d) => {
    const s = workTimeByDay[d]
    if (!s?.isWorkday) return []
    return [
      {
        day: (DAY_NAMES as Record<string, string>)[d] ?? d,
        start: s.start,
        end: s.end,
      },
    ]
  })
  return rows.map((r) => `${r.day}\t${r.start}-${r.end}`).join('\n')
}

function ScheduleTable({
  workTimeByDay,
}: {
  workTimeByDay: NonNullable<WorkingHours['custom']>
}) {
  const rows = DAY_KEYS.flatMap((d) => {
    const s = workTimeByDay[d]
    if (!s?.isWorkday) return []
    return [
      {
        day: (DAY_NAMES as Record<string, string>)[d] ?? d,
        start: s.start,
        end: s.end,
        interval: s.meetingInterval ? `${s.meetingInterval} мин` : '—',
      },
    ]
  })
  if (rows.length === 0) return null
  return (
    <Box className={styles.scheduleTableWrap}>
      <Table.Root size="1" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>День недели</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Начало</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Конец</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Интервал</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((r) => (
            <Table.Row key={r.day}>
              <Table.Cell>{r.day}</Table.Cell>
              <Table.Cell>{r.start}</Table.Cell>
              <Table.Cell>{r.end}</Table.Cell>
              <Table.Cell>{r.interval}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

function ScheduleSection({
  workTimeByDay,
}: {
  workTimeByDay: NonNullable<WorkingHours['custom']>
}) {
  const toast = useToast()

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const text = formatScheduleForClipboard(workTimeByDay)
    navigator.clipboard.writeText(text).then(
      () => toast.showSuccess('Скопировано', 'Скопировано в буфер обмена'),
      () => toast.showError('Ошибка', 'Не удалось скопировать')
    )
  }

  return (
    <Box className={styles.scheduleBlockWithCopy}>
      <Flex align="center" gap="2" className={styles.scheduleHeaderWithCopy}>
        <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
          Рабочий график
        </Text>
        <Box
          asChild
          className={styles.copyButton}
          style={{
            cursor: 'pointer',
            padding: '1px',
            background: 'transparent',
            border: 'none',
            color: 'var(--gray-11)',
          }}
          title="Копировать"
          onClick={handleCopy}
        >
          <button type="button" aria-label="Копировать">
            <CopyIcon width={14} height={14} />
          </button>
        </Box>
      </Flex>
      <ScheduleTable workTimeByDay={workTimeByDay} />
    </Box>
  )
}

function getScheduleForDisplay(
  userData: ProfileInfoProps['userData']
): WorkingHours['custom'] | null {
  if (userData.workTimeByDay) {
    const workdays = DAY_KEYS.filter((d) => userData.workTimeByDay![d]?.isWorkday)
    if (workdays.length > 0) return userData.workTimeByDay
  }
  if (userData.workStartTime && userData.workEndTime) {
    return buildWorkTimeByDayFromUniform(
      userData.workStartTime,
      userData.workEndTime,
      userData.meetingInterval
    )
  }
  return null
}

function shouldShowScheduleTable(
  schedule: WorkingHours['custom'] | null
): boolean {
  if (!schedule) return false
  const workdays = DAY_KEYS.filter((d) => schedule[d]?.isWorkday)
  return workdays.length > 0
}

export default function ProfileInfo({ userData }: ProfileInfoProps) {
  return (
    <Box className={styles.profileInfoBlock}>
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <PersonIcon width={20} height={20} />
          <Text size="4" weight="bold">
            Информация о профиле
          </Text>
        </Flex>
      </Box>
      <Box className={styles.content}>
        <Grid columns="2" gap="4" width="100%" className={styles.grid}>
          <Box>
            <InfoRow
              label="ФИО:"
              value={`${userData.lastName} ${userData.firstName}`.trim()}
            />
            <InfoRow
              label="Email:"
              value={userData.email}
              icon={<EnvelopeClosedIcon width={16} height={16} />}
              copyable
            />
            <InfoRow
              label="Телефон:"
              value={userData.phone?.trim() ? userData.phone : '+79935665726'}
              copyable
            />
            <InfoRow
              label="Дата регистрации:"
              value={userData.registrationDate}
              inline
            />
            <InfoRow
              label="Дата последнего входа:"
              value={userData.lastLoginDate}
              inline
            />
          </Box>
          <Box>
            {(() => {
              const schedule = getScheduleForDisplay(userData)
              return shouldShowScheduleTable(schedule) ? (
                <ScheduleSection workTimeByDay={schedule!} />
              ) : (
                <>
                  <InfoRow
                    label="Рабочий график:"
                    value={
                      userData.workingHours
                        ? formatWorkingHours(userData.workingHours)
                        : (() => {
                            const byDay = formatWorkTimeByDay(userData.workTimeByDay)
                            if (byDay) return byDay
                            if (userData.workStartTime && userData.workEndTime) {
                              return `${userData.workStartTime} — ${userData.workEndTime}`
                            }
                            return userData.workSchedule || '—'
                          })()
                    }
                    icon={<ClockIcon width={16} height={16} />}
                  />
                  <InfoRow
                    label="Время между встречами:"
                    value={formatMeetingIntervalByDay(
                      userData.workTimeByDay,
                      `${userData.meetingInterval} мин`
                    )}
                    icon={<ClockIcon width={16} height={16} />}
                  />
                </>
              )
            })()}
          </Box>
        </Grid>

        <Box mt="6" pt="4" style={{ borderTop: '1px solid var(--gray-a6)' }}>
          <Text
            size="2"
            weight="medium"
            style={{ color: 'var(--gray-11)', marginBottom: '12px', display: 'block' }}
          >
            Социальные сети и мессенджеры
          </Text>
          <SocialLinks links={userData.socialLinks ?? []} telegram={userData.telegram} />
        </Box>
      </Box>
    </Box>
  )
}
