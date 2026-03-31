'use client'

import { useState } from 'react'
import { Box, Flex, Text, Button, Card, Select, Switch, Separator } from '@radix-ui/themes'
import { ChevronLeftIcon, GearIcon, ViewGridIcon, ColorWheelIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@/router-adapter'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './styles/CalendarSettingsPage.module.css'

const CALENDAR_SETTINGS_STORAGE_KEY = 'calendarSettings'

interface CalendarSettings {
  defaultView: 'month' | 'week' | 'day'
  firstDayOfWeek: 'monday' | 'sunday'
  showWeekends: boolean
  eventColorScheme: 'byType' | 'byStatus' | 'byVacancy'
  compactView: boolean
}

const defaultSettings: CalendarSettings = {
  defaultView: 'month',
  firstDayOfWeek: 'monday',
  showWeekends: true,
  eventColorScheme: 'byType',
  compactView: false,
}

function loadSettings(): CalendarSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const saved = localStorage.getItem(CALENDAR_SETTINGS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultSettings, ...parsed }
    }
  } catch {
    // ignore localStorage parse errors
  }
  return defaultSettings
}

function saveSettings(settings: CalendarSettings) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CALENDAR_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore localStorage write errors
  }
}

export function CalendarSettingsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [settings, setSettings] = useState<CalendarSettings>(loadSettings)

  const updateSetting = <K extends keyof CalendarSettings>(key: K, value: CalendarSettings[K]) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    toast.showSuccess('Настройки сохранены', 'Изменения применены')
  }

  return (
    <Box className={styles.settingsContainer}>
      <Flex align="center" gap="3" mb="5">
        <Button variant="soft" size="2" onClick={() => navigate('/calendar')}>
          <ChevronLeftIcon width={16} height={16} />
          Назад
        </Button>
        <Flex align="center" gap="2">
          <GearIcon width={20} height={20} />
          <Text size="5" weight="bold">
            Настройки календаря
          </Text>
        </Flex>
      </Flex>

      <Card className={styles.settingsCard}>
        <Box p="5">
          <Text size="2" weight="bold" className={styles.sectionTitle}>
            <ViewGridIcon width={16} height={16} />
            Отображение
          </Text>
          <Flex direction="column" gap="4" className={styles.section}>
            <Box className={styles.settingRow}>
              <Box>
                <Text size="2" weight="medium" as="div">
                  Вид по умолчанию
                </Text>
                <Text size="1" color="gray" as="div" mt="1">
                  Какой вид открывать при загрузке
                </Text>
              </Box>
              <Select.Root
                value={settings.defaultView}
                onValueChange={(v) => updateSetting('defaultView', v as 'month' | 'week' | 'day')}
              >
                <Select.Trigger className={styles.selectTrigger} />
                <Select.Content>
                  <Select.Item value="month">Месяц</Select.Item>
                  <Select.Item value="week">Неделя</Select.Item>
                  <Select.Item value="day">День</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box className={styles.settingRow}>
              <Box>
                <Text size="2" weight="medium" as="div">
                  Первый день недели
                </Text>
                <Text size="1" color="gray" as="div" mt="1">
                  С какого дня начинать неделю
                </Text>
              </Box>
              <Select.Root
                value={settings.firstDayOfWeek}
                onValueChange={(v) => updateSetting('firstDayOfWeek', v as 'monday' | 'sunday')}
              >
                <Select.Trigger className={styles.selectTrigger} />
                <Select.Content>
                  <Select.Item value="monday">Понедельник</Select.Item>
                  <Select.Item value="sunday">Воскресенье</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          <Separator size="4" className={styles.separator} />

          <Text size="2" weight="bold" className={styles.sectionTitle}>
            <ColorWheelIcon width={16} height={16} />
            События
          </Text>
          <Flex direction="column" gap="4" className={styles.section}>
            <Box className={styles.settingRow}>
              <Box>
                <Text size="2" weight="medium" as="div">
                  Цветовая схема
                </Text>
                <Text size="1" color="gray" as="div" mt="1">
                  По какому признаку раскрашивать события
                </Text>
              </Box>
              <Select.Root
                value={settings.eventColorScheme}
                onValueChange={(v) =>
                  updateSetting('eventColorScheme', v as 'byType' | 'byStatus' | 'byVacancy')
                }
              >
                <Select.Trigger className={styles.selectTrigger} />
                <Select.Content>
                  <Select.Item value="byType">По типу</Select.Item>
                  <Select.Item value="byStatus">По статусу</Select.Item>
                  <Select.Item value="byVacancy">По вакансии</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          <Separator size="4" className={styles.separator} />

          <Text size="2" weight="bold" className={styles.sectionTitle}>
            Дополнительно
          </Text>
          <Flex direction="column" gap="1" className={styles.section}>
            <Flex align="center" justify="between" className={styles.switchRow}>
              <Box>
                <Text size="2" weight="medium" as="div">
                  Показывать выходные
                </Text>
                <Text size="1" color="gray" as="div" mt="1">
                  Суббота и воскресенье в календаре
                </Text>
              </Box>
              <Switch
                checked={settings.showWeekends}
                onCheckedChange={(v) => updateSetting('showWeekends', v)}
                size="2"
              />
            </Flex>
            <Flex align="center" justify="between" className={styles.switchRow}>
              <Box>
                <Text size="2" weight="medium" as="div">
                  Компактный вид
                </Text>
                <Text size="1" color="gray" as="div" mt="1">
                  Уменьшить размер ячеек и событий
                </Text>
              </Box>
              <Switch
                checked={settings.compactView}
                onCheckedChange={(v) => updateSetting('compactView', v)}
                size="2"
              />
            </Flex>
          </Flex>
        </Box>
      </Card>
    </Box>
  )
}

