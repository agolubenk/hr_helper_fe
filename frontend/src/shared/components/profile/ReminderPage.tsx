'use client'

import { Box, Text, Flex, Button, TextArea } from '@radix-ui/themes'
import { LockClosedIcon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import { useToast } from '@/shared/components/feedback/Toast'
import { fetchReminderPhrase, saveReminderPhrase } from '@/shared/api/profile'
import styles from './ReminderPage.module.css'

export default function ReminderPage() {
  const toast = useToast()
  const [phrase, setPhrase] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchReminderPhrase().then((value) => {
      setPhrase(value)
      setIsLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    const ok = await saveReminderPhrase(phrase)
    setIsSaving(false)
    if (ok) {
      toast.showSuccess('Сохранено', 'Фраза-напоминание успешно сохранена')
    } else {
      toast.showError('Ошибка', 'Не удалось сохранить. Проверьте подключение.')
    }
  }

  if (isLoading) {
    return (
      <Box className={styles.reminderBlock}>
        <Text size="2" color="gray">
          Загрузка...
        </Text>
      </Box>
    )
  }

  return (
    <Box className={styles.reminderBlock}>
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <LockClosedIcon width={20} height={20} />
          <Text size="4" weight="bold">
            Фраза-напоминание
          </Text>
        </Flex>
      </Box>

      <Box className={styles.content}>
        <Text size="2" color="gray" as="p" className={styles.hint}>
          Текст хранится в зашифрованном виде и доступен только вам. Не отображается в админке и нигде в явном виде.
        </Text>
        <Box className={styles.formGroup}>
          <Text as="label" size="2" weight="medium" className={styles.label}>
            Ваша фраза
          </Text>
          <TextArea
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Введите фразу-напоминание..."
            rows={4}
            className={styles.textarea}
          />
        </Box>
        <Button
          variant="solid"
          style={{ backgroundColor: 'var(--accent-9)' }}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </Box>
    </Box>
  )
}
