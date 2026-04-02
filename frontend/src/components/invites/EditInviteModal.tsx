'use client'

import { Dialog, Box, Flex, Text, Button, TextField, Select } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast/ToastContext'
import { Invite } from '@/lib/api'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Ожидает' },
  { value: 'sent', label: 'Отправлен' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Отменен' },
]

interface EditInviteModalProps {
  isOpen: boolean
  invite: Invite | null
  onClose: () => void
  onSave: (id: number, data: Partial<Invite>) => void
}

export default function EditInviteModal({ isOpen, invite, onClose, onSave }: EditInviteModalProps) {
  const toast = useToast()
  const [interviewDatetime, setInterviewDatetime] = useState('')
  const [status, setStatus] = useState<Invite['status']>('pending')

  useEffect(() => {
    if (invite) {
      setInterviewDatetime(invite.interview_datetime_formatted || invite.interview_datetime.slice(0, 16).replace('T', ' '))
      setStatus(invite.status)
    }
  }, [invite])

  const handleSave = () => {
    if (!invite) return
    const iso = interviewDatetime.includes('T') ? interviewDatetime : interviewDatetime.replace(' ', 'T')
    onSave(invite.id, {
      interview_datetime: iso,
      interview_datetime_formatted: interviewDatetime,
      status,
    })
    toast.showSuccess('Сохранено', 'Изменения инвайта сохранены')
    onClose()
  }

  if (!invite) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content style={{ maxWidth: 480 }}>
        <Dialog.Title>Редактирование инвайта</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Кандидат: {invite.candidate_name}, вакансия: {invite.vacancy_title}
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">Дата и время интервью</Text>
            <TextField.Root
              value={interviewDatetime}
              onChange={(e) => setInterviewDatetime(e.target.value)}
              placeholder="YYYY-MM-DD HH:MM"
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">Статус</Text>
            <Select.Root value={status} onValueChange={(v) => setStatus(v as Invite['status'])}>
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                {STATUS_OPTIONS.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
        <Flex gap="2" justify="end" mt="4">
          <Button variant="soft" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
