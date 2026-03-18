'use client'

import { Box, Text, Flex, Button, TextArea, Checkbox, TextField } from '@radix-ui/themes'
import { LockClosedIcon, PlusIcon, Cross2Icon, GlobeIcon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import { useToast } from '@/shared/components/feedback/Toast'
import { fetchReminderPhrase, saveReminderPhrase } from '@/shared/api/profile'
import styles from './ReminderPage.module.css'

interface DisplaySite {
  id: string
  url: string
  enabled: boolean
}

const DEFAULT_SITES: DisplaySite[] = [
  { id: '1', url: 'huntflow.ru', enabled: true },
  { id: '2', url: 'hh.ru', enabled: true },
  { id: '3', url: 'linkedin.com', enabled: false },
]

export default function ReminderPage() {
  const toast = useToast()
  const [phrase, setPhrase] = useState('')
  const [sites, setSites] = useState<DisplaySite[]>(DEFAULT_SITES)
  const [newSiteUrl, setNewSiteUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchReminderPhrase().then((value) => {
      setPhrase(value)
      setIsLoading(false)
    })
  }, [])

  const toggleSite = (id: string) => {
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  const removeSite = (id: string) => {
    setSites((prev) => prev.filter((s) => s.id !== id))
  }

  const addSite = () => {
    const url = newSiteUrl.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (!url) return
    if (sites.some((s) => s.url === url)) {
      toast.showError('Ошибка', 'Сайт уже добавлен')
      return
    }
    setSites((prev) => [...prev, { id: Date.now().toString(), url, enabled: true }])
    setNewSiteUrl('')
  }

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

        <Box className={styles.formGroup}>
          <Flex align="center" gap="2" mb="2">
            <GlobeIcon width={14} height={14} />
            <Text as="label" size="2" weight="medium">
              Сайты для отображения
            </Text>
          </Flex>
          <Text size="1" color="gray" mb="3" as="p">
            Выберите, на каких сайтах будет показываться фраза-напоминание
          </Text>
          <Flex direction="column" gap="2" mb="3">
            {sites.map((site) => (
              <Flex
                key={site.id}
                align="center"
                justify="between"
                className={styles.siteItem}
              >
                <Flex align="center" gap="2" style={{ flex: 1 }}>
                  <Checkbox
                    checked={site.enabled}
                    onCheckedChange={() => toggleSite(site.id)}
                  />
                  <Text size="2">{site.url}</Text>
                </Flex>
                <Button
                  type="button"
                  variant="ghost"
                  size="1"
                  color="gray"
                  onClick={() => removeSite(site.id)}
                  title="Удалить"
                >
                  <Cross2Icon width={12} height={12} />
                </Button>
              </Flex>
            ))}
          </Flex>
          <Flex gap="2">
            <TextField.Root
              placeholder="example.com"
              value={newSiteUrl}
              onChange={(e) => setNewSiteUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSite()}
              style={{ flex: 1 }}
            />
            <Button type="button" variant="soft" onClick={addSite}>
              <PlusIcon width={14} height={14} />
              Добавить
            </Button>
          </Flex>
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
