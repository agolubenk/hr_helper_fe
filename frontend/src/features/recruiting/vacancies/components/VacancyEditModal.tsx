'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge, Box, Button, Dialog, Flex, Switch, Text, TextArea, TextField } from '@radix-ui/themes'
import { Cross2Icon, Pencil1Icon } from '@radix-ui/react-icons'
import styles from './VacancyEditModal.module.css'
import type { Vacancy } from '../types'

interface VacancyEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vacancy: Vacancy | null
  mode: 'view' | 'edit'
  onSwitchToEdit?: () => void
  onStatusChange?: (status: Vacancy['status']) => void
}

export function VacancyEditModal({
  open,
  onOpenChange,
  vacancy,
  mode,
  onSwitchToEdit,
  onStatusChange,
}: VacancyEditModalProps) {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setNotes('')
  }, [open])

  const statusLabel = vacancy?.status === 'active' ? 'Активна' : 'Неактивна'
  const statusColor = vacancy?.status === 'active' ? 'green' : 'gray'

  const title = useMemo(() => {
    if (!vacancy) return 'Вакансия'
    return `${vacancy.title} · #${vacancy.id}`
  }, [vacancy])

  if (!vacancy) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 900, maxHeight: '90vh', overflowY: 'auto' }}>
        <Flex justify="between" align="center" gap="3">
          <Dialog.Title style={{ margin: 0 }}>
            <Flex align="center" gap="2">
              {mode === 'edit' && <Pencil1Icon width={18} height={18} />}
              {title}
            </Flex>
          </Dialog.Title>
          <Dialog.Close aria-label="Закрыть">
            <Button variant="ghost">
              <Cross2Icon />
            </Button>
          </Dialog.Close>
        </Flex>

        <Flex gap="3" mt="4" className={styles.metaRow} align="center" wrap="wrap">
          <Badge color={statusColor as 'green' | 'gray'}>{statusLabel}</Badge>
          <Text size="2" color="gray">
            Рекрутер: {vacancy.recruiter}
          </Text>
          <Text size="2" color="gray">
            Интервьюеров: {vacancy.interviewers}
          </Text>
          {vacancy.locations.length > 0 && (
            <Text size="2" color="gray">
              Локации: {vacancy.locations.join(', ')}
            </Text>
          )}
        </Flex>

        <Flex gap="3" mt="4" wrap="wrap" align="center">
          <Flex align="center" gap="2">
            <Switch
              checked={vacancy.status === 'active'}
              onCheckedChange={(checked) => onStatusChange?.(checked ? 'active' : 'inactive')}
            />
            <Text size="2" weight="medium">
              Активна
            </Text>
          </Flex>
          {mode === 'view' && onSwitchToEdit && (
            <Button variant="soft" onClick={onSwitchToEdit}>
              Редактировать
            </Button>
          )}
        </Flex>

        <Box mt="4" className={styles.section}>
          <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
            Заметки (мок)
          </Text>
          {mode === 'edit' ? (
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', minHeight: 120 }} />
          ) : (
            <Text size="2" color="gray">
              Нет заметок
            </Text>
          )}
        </Box>

        <Box mt="4" className={styles.section}>
          <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
            Поля (демо)
          </Text>
          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" weight="medium" className={styles.fieldLabel}>
                Название
              </Text>
              <TextField.Root value={vacancy.title} disabled style={{ width: '100%' }} />
            </Box>
            <Box>
              <Text size="2" weight="medium" className={styles.fieldLabel}>
                ID
              </Text>
              <TextField.Root value={String(vacancy.id)} disabled style={{ width: '100%' }} />
            </Box>
          </Flex>
        </Box>

        <Flex justify="end" gap="3" mt="6" pt="4" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <Dialog.Close>
            <Button variant="soft">Закрыть</Button>
          </Dialog.Close>
          {mode === 'edit' && <Button disabled>Сохранить (позже)</Button>}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

