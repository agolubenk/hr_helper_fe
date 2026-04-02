import { Box, Text, Flex, Switch } from '@radix-ui/themes'
import { CheckboxIcon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import styles from './QuickTasksSettings.module.css'

const STORAGE_KEY_ENABLED = 'footerTasksEnabled'
const STORAGE_KEY_COLLAPSED = 'footerTasksCollapsed'

export default function QuickTasksSettings() {
  const [enabled, setEnabled] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED)
    const storedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED)
    if (storedEnabled === null) {
      localStorage.setItem(STORAGE_KEY_ENABLED, 'true')
    }
    if (storedCollapsed === null) {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, 'false')
    }
    if (storedEnabled !== null) setEnabled(storedEnabled === 'true')
    if (storedCollapsed !== null) setCollapsed(storedCollapsed === 'true')
  }, [])

  const handleEnabledChange = (value: boolean) => {
    setEnabled(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ENABLED, String(value))
      window.dispatchEvent(new CustomEvent('footerTasksSettingsChange', { detail: { enabled: value, collapsed } }))
    }
    if (!value) {
      setCollapsed(false)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_COLLAPSED, 'false')
      }
    }
  }

  const handleCollapsedChange = (value: boolean) => {
    setCollapsed(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, String(value))
      window.dispatchEvent(new CustomEvent('footerTasksSettingsChange', { detail: { enabled, collapsed: value } }))
    }
  }

  return (
    <Box className={styles.quickTasksBlock}>
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <CheckboxIcon width={20} height={20} />
          <Text size="4" weight="bold">
            Быстрые задачи
          </Text>
        </Flex>
      </Box>
      <Box className={styles.content}>
        <Text size="2" color="gray" as="p" className={styles.hint}>
          Настройте отображение задач в нижней панели приложения.
        </Text>

        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" className={styles.settingRow}>
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Показывать задачи в футере
              </Text>
              <Text size="1" color="gray">
                Включите для отображения быстрых задач в нижней панели
              </Text>
            </Flex>
            <Switch checked={enabled} onCheckedChange={handleEnabledChange} size="2" />
          </Flex>

          <Flex
            align="center"
            justify="between"
            className={`${styles.settingRow} ${!enabled ? styles.disabled : ''}`}
          >
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium" color={enabled ? undefined : 'gray'}>
                Всегда сжато
              </Text>
              <Text size="1" color="gray">
                Показывать только кнопку +N вместо списка задач
              </Text>
            </Flex>
            <Switch
              checked={collapsed}
              onCheckedChange={handleCollapsedChange}
              disabled={!enabled}
              size="2"
            />
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}
