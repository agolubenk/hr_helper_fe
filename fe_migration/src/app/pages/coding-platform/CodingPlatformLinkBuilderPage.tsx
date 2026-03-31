import { Card, Flex, Text, Heading, Box, Button, TextField } from '@radix-ui/themes'
import { useMemo, useState } from 'react'
import { CodingPlatformPageShell } from './CodingPlatformPageShell'

function buildLink(params: { taskId: string; organizerId: string; meetingAt: string }): string {
  const u = new URL('/meet/room', window.location.origin)
  // Hash-пayload — как у meetRoomHash (мок-формат), чтобы комната могла прочитать параметры.
  // На этом этапе просто формируем человекочитаемый hash.
  const frag = new URLSearchParams()
  if (params.taskId) frag.set('taskId', params.taskId)
  if (params.organizerId) frag.set('organizerId', params.organizerId)
  if (params.meetingAt) frag.set('meetingAt', params.meetingAt)
  u.hash = frag.toString()
  return u.toString()
}

export function CodingPlatformLinkBuilderPage() {
  const [taskId, setTaskId] = useState('task_fe_int_042')
  const [organizerId, setOrganizerId] = useState('p_host')
  const [meetingAt, setMeetingAt] = useState('2026-03-30T14:00:00.000Z')

  const link = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return buildLink({ taskId, organizerId, meetingAt })
  }, [taskId, organizerId, meetingAt])

  return (
    <CodingPlatformPageShell
      title="Link-билдер (заглушка)"
      description="Конструктор ссылки на meet-комнату: параметры задачи, времени и организатора. Пока без валидации и без сохранения."
    >
      <Card size="2">
        <Flex direction="column" gap="3">
          <Box>
            <Heading size="4" style={{ margin: 0 }}>
              Параметры ссылки
            </Heading>
            <Text size="2" color="gray">
              На следующем шаге здесь появятся пресеты (Frontend/Backend/System design), выбор аудитории и генерация вариантов ссылок.
            </Text>
          </Box>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              taskId
            </Text>
            <TextField.Root value={taskId} onChange={(e) => setTaskId(e.target.value)} />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              organizerId
            </Text>
            <TextField.Root value={organizerId} onChange={(e) => setOrganizerId(e.target.value)} />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              meetingAt (ISO)
            </Text>
            <TextField.Root value={meetingAt} onChange={(e) => setMeetingAt(e.target.value)} />
          </Flex>

          <Card size="1" variant="surface">
            <Flex direction="column" gap="2" p="2">
              <Text size="2" weight="medium">
                Ссылка
              </Text>
              <Text size="2" style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
                {link || '—'}
              </Text>
              <Button
                size="2"
                variant="soft"
                onClick={async () => {
                  if (!link) return
                  await navigator.clipboard.writeText(link)
                }}
                style={{ alignSelf: 'flex-start' }}
              >
                Скопировать
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Card>
    </CodingPlatformPageShell>
  )
}

