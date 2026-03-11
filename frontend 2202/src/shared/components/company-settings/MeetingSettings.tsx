'use client'

import { Text, Flex, Button, Switch, Card } from '@radix-ui/themes'
import { Cross2Icon, CheckIcon } from '@radix-ui/react-icons'
import { useState, useCallback } from 'react'
import { ScheduleSettingsPage } from '@/shared/components/profile/ScheduleSettingsPage'
import { useToast } from '@/shared/components/feedback/Toast'
import type { WorkingHours } from '@/shared/lib/types/working-hours'
import styles from './GeneralSettings.module.css'

const mockMeetingSettings = {
  ignoreNonAcceptedMeetings: false,
}

const mockScheduleData = {
  workStartTime: '09:00',
  workEndTime: '18:00',
  meetingInterval: '15',
  workTimeByDay: undefined as WorkingHours['custom'] | undefined,
}

export default function MeetingSettings() {
  const toast = useToast()
  const [ignoreNonAcceptedMeetings, setIgnoreNonAcceptedMeetings] = useState(
    mockMeetingSettings.ignoreNonAcceptedMeetings
  )
  const [savedScheduleData, setSavedScheduleData] = useState(mockScheduleData)
  const [scheduleResetKey, setScheduleResetKey] = useState(0)

  const handleScheduleSave = useCallback(
    (data: {
      workStartTime?: string
      workEndTime?: string
      workTimeByDay?: WorkingHours['custom']
      meetingInterval?: string
    }) => {
      setSavedScheduleData({
        workStartTime: data.workStartTime ?? mockScheduleData.workStartTime,
        workEndTime: data.workEndTime ?? mockScheduleData.workEndTime,
        meetingInterval: data.meetingInterval ?? mockScheduleData.meetingInterval,
        workTimeByDay: data.workTimeByDay,
      })
      toast.showSuccess('Расписание сохранено', 'Изменения успешно применены')
    },
    [toast]
  )

  const handleScheduleCancel = useCallback(() => {
    setScheduleResetKey((k) => k + 1)
  }, [])

  return (
    <Flex direction="column" gap="4">
      <ScheduleSettingsPage
        key={scheduleResetKey}
        initialData={{
          workStartTime: savedScheduleData.workStartTime,
          workEndTime: savedScheduleData.workEndTime,
          workTimeByDay: savedScheduleData.workTimeByDay,
          meetingInterval: savedScheduleData.meetingInterval,
        }}
        onCancel={handleScheduleCancel}
        onSave={handleScheduleSave}
      />

      <Card className={styles.card}>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Настройки встреч
        </Text>
        <Flex direction="column" gap="2">
          <Flex gap="2" align="center" wrap="wrap">
            <Switch
              checked={ignoreNonAcceptedMeetings}
              onCheckedChange={setIgnoreNonAcceptedMeetings}
            />
            <Text size="2" weight="medium" asChild>
              <label style={{ cursor: 'pointer' }}>Игнорировать не принятые встречи</label>
            </Text>
          </Flex>
          <Text size="1" color="gray" style={{ display: 'block' }}>
            Если включено, встречи без подтверждения не учитываются при расчёте занятости.
          </Text>
        </Flex>
        <Flex justify="end" gap="3" pt="3" mt="4" style={{ borderTop: '1px solid var(--gray-a6)' }}>
          <Button variant="soft" size="3" title="Отмена">
            <Cross2Icon width={18} height={18} className={styles.buttonIconMobile} />
            <span className={styles.buttonTextMobile}> Отмена</span>
          </Button>
          <Button size="3" title="Сохранить изменения">
            <CheckIcon width={18} height={18} className={styles.buttonIconMobile} />
            <span className={styles.buttonTextMobile}> Сохранить изменения</span>
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}
