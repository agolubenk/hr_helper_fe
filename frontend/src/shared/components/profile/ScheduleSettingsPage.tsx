'use client'

import { Box, Flex, Text, Grid, Button, Switch, Select } from '@radix-ui/themes'
import { ClockIcon, ChevronLeftIcon, CalendarIcon, CheckIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { FloatingLabelInput } from '@/shared/components/forms/FloatingLabelInput'
import { DAY_KEYS, DAY_NAMES } from '@/shared/lib/types/working-hours'
import type { DaySchedule } from '@/shared/lib/types/working-hours'
import styles from './ProfileEditForm.module.css'

type WorkTimeByDay = Partial<Record<(typeof DAY_KEYS)[number], DaySchedule>>

const MEETING_INTERVALS = Array.from({ length: 13 }, (_, i) => i * 5) // 0, 5, 10, ..., 60

interface ScheduleSettingsPageProps {
  initialData: {
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: WorkTimeByDay
    meetingInterval?: string
  }
  onCancel: () => void
  onSave: (data: {
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: WorkTimeByDay
    meetingInterval?: string
  }) => void
}

export function ScheduleSettingsPage({ initialData, onCancel, onSave }: ScheduleSettingsPageProps) {
  const defaultStart = initialData.workStartTime || '09:00'
  const defaultEnd = initialData.workEndTime || '18:00'
  const [isAllDaysSame, setIsAllDaysSame] = useState(
    !!(initialData.workStartTime && initialData.workEndTime) && !initialData.workTimeByDay
  )
  const normalizeDay = (d: string) => d !== 'saturday' && d !== 'sunday'
  const defaultInterval = initialData.meetingInterval && MEETING_INTERVALS.includes(Number(initialData.meetingInterval)) ? initialData.meetingInterval : '15'
  const normalize = (w?: WorkTimeByDay): WorkTimeByDay => {
    if (!w || Object.keys(w).length === 0) {
      return DAY_KEYS.reduce<WorkTimeByDay>((acc, day) => {
        acc[day] = { start: defaultStart, end: defaultEnd, isWorkday: normalizeDay(day), meetingInterval: defaultInterval }
        return acc
      }, {})
    }
    return DAY_KEYS.reduce<WorkTimeByDay>((acc, day) => {
      const ex = w[day] as { start?: string; end?: string; isWorkday?: boolean; meetingInterval?: string } | undefined
      acc[day] = { start: ex?.start ?? defaultStart, end: ex?.end ?? defaultEnd, isWorkday: ex?.isWorkday ?? normalizeDay(day), meetingInterval: ex?.meetingInterval ?? defaultInterval }
      return acc
    }, {})
  }
  const [workStartTime, setWorkStartTime] = useState(initialData.workStartTime || defaultStart)
  const [workEndTime, setWorkEndTime] = useState(initialData.workEndTime || defaultEnd)
  const [meetingInterval, setMeetingInterval] = useState(initialData.meetingInterval || '15')
  const [workTimeByDay, setWorkTimeByDay] = useState<WorkTimeByDay>(normalize(initialData.workTimeByDay))

  const handleToggle = (checked: boolean) => {
    setIsAllDaysSame(checked)
    if (checked) {
      const first = DAY_KEYS.find((d) => workTimeByDay[d]?.isWorkday)
      const s = first ? workTimeByDay[first] : workTimeByDay.monday
      if (s) {
        setWorkStartTime(s.start)
        setWorkEndTime(s.end)
        setMeetingInterval(s.meetingInterval || '15')
      }
    } else {
      const base = { start: workStartTime, end: workEndTime, meetingInterval }
      setWorkTimeByDay(
        DAY_KEYS.reduce<WorkTimeByDay>((acc, day) => {
          acc[day] = { ...base, isWorkday: normalizeDay(day) }
          return acc
        }, {})
      )
    }
  }

  const handleDayChange = (day: (typeof DAY_KEYS)[number], field: 'start' | 'end' | 'isWorkday' | 'meetingInterval', value: string | boolean) => {
    setWorkTimeByDay((p) => {
      const cur = p[day] ?? { start: '09:00', end: '18:00', isWorkday: false, meetingInterval: '15' }
      if (field === 'isWorkday') return { ...p, [day]: { ...cur, isWorkday: value as boolean } }
      return { ...p, [day]: { ...cur, [field]: value } }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = isAllDaysSame
      ? { workStartTime, workEndTime, workTimeByDay: undefined, meetingInterval }
      : (() => {
          const firstWorkday = DAY_KEYS.find((d) => workTimeByDay[d]?.isWorkday)
          return {
            workStartTime: undefined,
            workEndTime: undefined,
            workTimeByDay: workTimeByDay as WorkTimeByDay,
            meetingInterval: workTimeByDay[firstWorkday!]?.meetingInterval ?? '15',
          }
        })()
    onSave(payload)
    onCancel()
  }

  return (
    <Box className={styles.editBlock}>
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <CalendarIcon width={20} height={20} />
          <Text size="4" weight="bold">Расписание</Text>
        </Flex>
      </Box>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Box className={styles.content}>
          <Box className={styles.scheduleSection}>
            <Box style={{ marginTop: '12px' }}>
              <Flex align="center" gap="2" mb="2">
                <Switch checked={isAllDaysSame} onCheckedChange={handleToggle} />
                <Text size="2" weight="medium">Все дни недели одинаково</Text>
              </Flex>
              <Text size="1" color="gray" style={{ marginLeft: '28px', display: 'block' }}>
                {isAllDaysSame ? 'Одно и то же рабочее время для всех рабочих дней' : 'Настроить рабочее время для каждого дня недели отдельно'}
              </Text>
            </Box>
            {isAllDaysSame ? (
              <Grid columns="2" gap="4" width="100%" style={{ marginTop: '16px' }} className={styles.grid}>
                <Box>
                  <FloatingLabelInput id="workStartTime" label="Начало" type="time" value={workStartTime} onChange={(e) => setWorkStartTime(e.target.value)} icon={<ClockIcon width={16} height={16} />} />
                </Box>
                <Box>
                  <FloatingLabelInput id="workEndTime" label="Конец" type="time" value={workEndTime} onChange={(e) => setWorkEndTime(e.target.value)} icon={<ClockIcon width={16} height={16} />} />
                </Box>
              </Grid>
            ) : (
              <Box style={{ marginTop: '16px' }}>
                {DAY_KEYS.map((day) => {
                  const s = workTimeByDay[day] ?? { start: '09:00', end: '18:00', isWorkday: normalizeDay(day), meetingInterval: '15' }
                  return (
                    <Box key={day} className={styles.dayRow}>
                      <Flex align="center" gap="3" mb="2">
                        <Switch checked={s.isWorkday} onCheckedChange={(v) => handleDayChange(day, 'isWorkday', v)} />
                        <Text size="2" weight="medium">{DAY_NAMES[day]}</Text>
                      </Flex>
                      <Grid columns="3" gap="4" width="100%" className={styles.dayGrid}>
                        <Box>
                          <FloatingLabelInput id={`${day}-start`} label="Начало" type="time" value={s.start} onChange={(e) => handleDayChange(day, 'start', e.target.value)} icon={<ClockIcon width={16} height={16} />} disabled={!s.isWorkday} />
                        </Box>
                        <Box>
                          <FloatingLabelInput id={`${day}-end`} label="Конец" type="time" value={s.end} onChange={(e) => handleDayChange(day, 'end', e.target.value)} icon={<ClockIcon width={16} height={16} />} disabled={!s.isWorkday} />
                        </Box>
                        <Box>
                          <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block', color: 'var(--gray-11)' }}>
                            Интервал
                          </Text>
                          <Select.Root
                            value={s.meetingInterval && MEETING_INTERVALS.includes(Number(s.meetingInterval)) ? s.meetingInterval : '15'}
                            onValueChange={(v) => handleDayChange(day, 'meetingInterval', v)}
                          >
                            <Select.Trigger style={{ width: '100%' }} disabled={!s.isWorkday} />
                            <Select.Content>
                              {MEETING_INTERVALS.map((mins) => (
                                <Select.Item key={mins} value={String(mins)}>
                                  {mins} мин
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        </Box>
                      </Grid>
                    </Box>
                  )
                })}
              </Box>
            )}
            {isAllDaysSame && (
              <Box style={{ marginTop: '16px' }}>
                <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block', color: 'var(--gray-11)' }}>
                  Время между встречами
                </Text>
                <Select.Root value={meetingInterval} onValueChange={setMeetingInterval}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    {MEETING_INTERVALS.map((mins) => (
                      <Select.Item key={mins} value={String(mins)}>
                        {mins} мин
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            )}
          </Box>
        </Box>
        <Flex justify="between" align="center" className={styles.actions}>
          <Button type="button" variant="soft" onClick={onCancel} title="Отмена">
            <ChevronLeftIcon width={16} height={16} className={styles.buttonIconMobile} />
            <span className={styles.buttonTextMobile}> Отмена</span>
          </Button>
          <Button type="submit" className={styles.saveButton} title="Сохранить">
            <CheckIcon width={16} height={16} className={styles.buttonIconMobile} />
            <span className={styles.buttonTextMobile}> Сохранить</span>
          </Button>
        </Flex>
      </form>
    </Box>
  )
}
