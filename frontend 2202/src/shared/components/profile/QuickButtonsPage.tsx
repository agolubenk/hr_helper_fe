'use client'

import { Box, Text, Flex, Button, Table, Switch, Separator } from '@radix-ui/themes'
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  LightningBoltIcon,
  ArrowUpIcon,
  GearIcon,
  HomeIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
  ClockIcon,
  PaperPlaneIcon,
  FileTextIcon,
  StarIcon,
  HeartIcon,
  Link2Icon,
  CheckIcon,
  ListBulletIcon,
  CopyIcon,
  GitHubLogoIcon,
  NotionLogoIcon,
} from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import QuickButtonModal from './QuickButtonModal'
import { useToast } from '@/shared/components/feedback/Toast/ToastContext'
import { getQuickButtons, saveQuickButtons, type QuickButton } from '@/shared/lib/quickButtonsStorage'
import { QUICK_BUTTONS_ENABLED_KEY } from '@/shared/lib/quickButtonsStorage'
import styles from './QuickButtonsPage.module.css'

const SCROLL_TOP_BUTTON_STORAGE_KEY = 'floatingActionsScrollTopEnabled'
const SETTINGS_BUTTON_STORAGE_KEY = 'floatingActionsSettingsEnabled'

const iconComponents: Record<string, React.ComponentType<{ width?: number | string; height?: number | string }>> = {
  HomeIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
  ClockIcon,
  PaperPlaneIcon,
  FileTextIcon,
  StarIcon,
  HeartIcon,
  LightningBoltIcon,
  Link2Icon,
  GearIcon,
  CheckIcon,
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ListBulletIcon,
  CopyIcon,
  GitHubLogoIcon,
  NotionLogoIcon,
}

export default function QuickButtonsPage() {
  const toast = useToast()
  const [buttons, setButtons] = useState<QuickButton[]>(() => getQuickButtons())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingButton, setEditingButton] = useState<QuickButton | null>(null)

  const [isQuickButtonsEnabled, setIsQuickButtonsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(QUICK_BUTTONS_ENABLED_KEY)
      return saved !== null ? saved === 'true' : true
    } catch {
      return true
    }
  })

  const [isScrollTopEnabled, setIsScrollTopEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(SCROLL_TOP_BUTTON_STORAGE_KEY)
      return saved !== null ? saved === 'true' : true
    } catch {
      return true
    }
  })

  const [isSettingsEnabled, setIsSettingsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem(SETTINGS_BUTTON_STORAGE_KEY)
      return saved !== null ? saved === 'true' : true
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    saveQuickButtons(buttons)
    window.dispatchEvent(
      new CustomEvent('localStorageChange', {
        detail: { key: 'quickButtons', value: JSON.stringify(buttons) },
      })
    )
  }, [buttons])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const valueString = String(isScrollTopEnabled)
    localStorage.setItem(SCROLL_TOP_BUTTON_STORAGE_KEY, valueString)
    window.dispatchEvent(
      new CustomEvent('localStorageChange', {
        detail: { key: SCROLL_TOP_BUTTON_STORAGE_KEY, value: valueString },
      })
    )
  }, [isScrollTopEnabled])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const valueString = String(isSettingsEnabled)
    localStorage.setItem(SETTINGS_BUTTON_STORAGE_KEY, valueString)
    window.dispatchEvent(
      new CustomEvent('localStorageChange', {
        detail: { key: SETTINGS_BUTTON_STORAGE_KEY, value: valueString },
      })
    )
  }, [isSettingsEnabled])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const valueString = String(isQuickButtonsEnabled)
    localStorage.setItem(QUICK_BUTTONS_ENABLED_KEY, valueString)
    window.dispatchEvent(
      new CustomEvent('localStorageChange', {
        detail: { key: QUICK_BUTTONS_ENABLED_KEY, value: valueString },
      })
    )
  }, [isQuickButtonsEnabled])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quickButtons' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setButtons(parsed)
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleCreate = () => {
    if (buttons.length >= 15) {
      alert('Максимальное количество быстрых кнопок - 15')
      return
    }
    setEditingButton(null)
    setIsModalOpen(true)
  }

  const handleEdit = (button: QuickButton) => {
    setEditingButton(button)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    toast.showWarning('Удалить кнопку?', 'Вы уверены, что хотите удалить эту кнопку?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => setButtons((prev) => prev.filter((btn) => btn.id !== id)),
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleSave = (data: Omit<QuickButton, 'id'> & { id?: string }) => {
    if (editingButton) {
      setButtons((prev) =>
        prev.map((btn) => (btn.id === editingButton.id ? { ...data, id: editingButton.id } : btn))
      )
    } else {
      if (buttons.length >= 15) {
        alert('Максимальное количество быстрых кнопок - 15')
        return
      }
      const newButton: QuickButton = {
        ...data,
        id: Date.now().toString(),
      }
      setButtons((prev) => [...prev, newButton].sort((a, b) => a.order - b.order))
    }
    setIsModalOpen(false)
    setEditingButton(null)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingButton(null)
  }

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'link':
        return 'Ссылка'
      case 'text':
        return 'Текст'
      case 'datetime':
        return 'Дата/время'
      default:
        return type
    }
  }

  const renderIcon = (iconName: string, size: number = 16) => {
    if (iconComponents[iconName]) {
      const IconComponent = iconComponents[iconName]
      return <IconComponent width={size} height={size} />
    }
    return <span style={{ fontSize: size + 'px' }}>⚡</span>
  }

  return (
    <Box className={styles.quickButtonsBlock}>
      <Box className={styles.header}>
        <Flex align="center" justify="between" width="100%">
          <Flex align="center" gap="2">
            <LightningBoltIcon width={20} height={20} />
            <Text size="4" weight="bold">
              Быстрые кнопки
            </Text>
            {buttons.length > 0 && (
              <Text size="2" color="gray" style={{ marginLeft: '8px' }}>
                ({buttons.length}/15)
              </Text>
            )}
          </Flex>
          <Flex align="center" gap="3">
            <Flex align="center" gap="2">
              <Switch checked={isQuickButtonsEnabled} onCheckedChange={setIsQuickButtonsEnabled} size="2" />
              <Text size="2" color="gray">
                {isQuickButtonsEnabled ? 'Включено' : 'Выключено'}
              </Text>
            </Flex>
            <Button variant="solid" style={{ backgroundColor: 'var(--accent-9)' }} onClick={handleCreate} disabled={buttons.length >= 15}>
              <PlusIcon width={14} height={14} />
              {buttons.length === 0 ? 'Создать' : 'Добавить'}
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Box className={styles.content}>
        {buttons.length === 0 ? (
          <Box className={styles.emptyState}>
            <LightningBoltIcon width={48} height={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
              Нет быстрых кнопок
            </Text>
            <Text size="2" color="gray" style={{ display: 'block', marginBottom: '16px' }}>
              Создайте свою первую быструю кнопку для быстрого доступа к важной информации
            </Text>
            <Button variant="solid" style={{ backgroundColor: 'var(--accent-9)' }} onClick={handleCreate}>
              <PlusIcon width={14} height={14} />
              Создать
            </Button>
          </Box>
        ) : (
          <Box className={styles.tableContainer}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell style={{ width: '60px' }}>№</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '80px' }}>Иконка</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '100px' }}>Цвет</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '120px' }}>Тип</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '120px' }}>Действия</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {buttons.map((button, index) => (
                  <Table.Row key={button.id}>
                    <Table.Cell>
                      <Text size="2">{index + 1}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Box
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: button.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                        title={button.icon}
                      >
                        {renderIcon(button.icon, 18)}
                      </Box>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2" color="gray">
                        {button.color}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{button.name}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{getTypeDisplay(button.type)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Button size="1" variant="soft" onClick={() => handleEdit(button)} title="Редактировать">
                          <Pencil1Icon width={14} height={14} />
                        </Button>
                        <Button size="1" variant="soft" color="red" onClick={() => handleDelete(button.id)} title="Удалить">
                          <TrashIcon width={14} height={14} />
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {buttons.length > 0 && (
          <Box className={styles.settingsSection}>
            <Flex align="center" gap="3" py="2">
              <Switch checked={isScrollTopEnabled} onCheckedChange={setIsScrollTopEnabled} size="2" />
              <ArrowUpIcon width={20} height={20} style={{ opacity: 0.7 }} />
              <Box>
                <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '2px' }}>
                  Кнопка «Вверх»
                </Text>
                <Text size="2" color="gray">
                  Показать кнопку «Вверх» в панели быстрых кнопок
                </Text>
              </Box>
            </Flex>
            <Separator size="4" my="2" />
            <Flex align="center" gap="3" py="2">
              <Switch checked={isSettingsEnabled} onCheckedChange={setIsSettingsEnabled} size="2" />
              <GearIcon width={20} height={20} style={{ opacity: 0.7 }} />
              <Box>
                <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '2px' }}>
                  Кнопка «Настройки»
                </Text>
                <Text size="2" color="gray">
                  Показать кнопку «Настройки» в панели быстрых кнопок
                </Text>
              </Box>
            </Flex>
          </Box>
        )}
      </Box>

      <QuickButtonModal isOpen={isModalOpen} onClose={handleClose} onSave={handleSave} initialData={editingButton} />
    </Box>
  )
}
