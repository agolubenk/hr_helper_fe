'use client'

import { Dialog, Box, Flex, Text, Button } from '@radix-ui/themes'
import { CalendarIcon } from '@radix-ui/react-icons'
import { Invite } from '@/lib/api'

interface ViewInviteModalProps {
  isOpen: boolean
  invite: Invite | null
  onClose: () => void
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export default function ViewInviteModal({ isOpen, invite, onClose }: ViewInviteModalProps) {
  if (!invite) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content style={{ maxWidth: 480 }}>
        <Dialog.Title>Просмотр инвайта</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Информация об инвайте на интервью
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <Box>
            <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>Кандидат</Text>
            <Text size="2">{invite.candidate_name || '—'}</Text>
          </Box>
          {invite.candidate_email && (
            <Box>
              <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>Email</Text>
              <Text size="2">{invite.candidate_email}</Text>
            </Box>
          )}
          <Box>
            <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>Вакансия</Text>
            <Text size="2">{invite.vacancy_title || '—'}</Text>
          </Box>
          <Box>
            <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>Дата и время интервью</Text>
            <Flex align="center" gap="2">
              <CalendarIcon width={14} height={14} />
              <Text size="2">
                {invite.interview_datetime_formatted || formatDate(invite.interview_datetime)}
              </Text>
            </Flex>
          </Box>
          <Box>
            <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>Статус</Text>
            <Text size="2">{invite.status_display || invite.status}</Text>
          </Box>
          <Box>
            <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>Формат</Text>
            <Text size="2">{invite.interview_format === 'online' ? 'Онлайн' : invite.interview_format === 'office' ? 'В офисе' : '—'}</Text>
          </Box>
          {invite.google_meet_url && (
            <Box>
              <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>Google Meet</Text>
              <Text size="2" style={{ wordBreak: 'break-all' }}>{invite.google_meet_url}</Text>
            </Box>
          )}
          <Box>
            <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>Создан</Text>
            <Text size="2">{formatDate(invite.created_at)}</Text>
          </Box>
        </Flex>
        <Flex gap="2" justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft">Закрыть</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
