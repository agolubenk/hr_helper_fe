'use client'

import { Box, Text, Flex, Button, Select, TextField, TextArea, Dialog } from '@radix-ui/themes'
import {
  Cross2Icon,
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
  MagnifyingGlassIcon,
  DownloadIcon,
  UploadIcon,
  CopyIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  GitHubLogoIcon,
  NotionLogoIcon,
} from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import styles from './QuickButtonModal.module.css'

interface QuickButtonData {
  id?: string
  name: string
  icon: string
  customIcon?: string
  type: 'link' | 'text' | 'datetime'
  value: string
  color: string
  order: number
}

interface QuickButtonModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: QuickButtonData) => void
  initialData?: QuickButtonData | null
}

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
  MagnifyingGlassIcon,
  DownloadIcon,
  UploadIcon,
  CopyIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  GitHubLogoIcon,
  NotionLogoIcon,
}

const PRESET_ICONS = [
  { value: 'Link2Icon', label: 'Ссылка', icon: Link2Icon },
  { value: 'HomeIcon', label: 'Дом', icon: HomeIcon },
  { value: 'PersonIcon', label: 'Пользователь', icon: PersonIcon },
  { value: 'EnvelopeClosedIcon', label: 'Почта', icon: EnvelopeClosedIcon },
  { value: 'CalendarIcon', label: 'Календарь', icon: CalendarIcon },
  { value: 'ClockIcon', label: 'Часы', icon: ClockIcon },
  { value: 'PaperPlaneIcon', label: 'Телеграм', icon: PaperPlaneIcon },
  { value: 'FileTextIcon', label: 'Файл', icon: FileTextIcon },
  { value: 'StarIcon', label: 'Звезда', icon: StarIcon },
  { value: 'HeartIcon', label: 'Сердце', icon: HeartIcon },
  { value: 'LightningBoltIcon', label: 'Молния', icon: LightningBoltIcon },
  { value: 'GearIcon', label: 'Настройки', icon: GearIcon },
  { value: 'CheckIcon', label: 'Галочка', icon: CheckIcon },
  { value: 'PlusIcon', label: 'Плюс', icon: PlusIcon },
  { value: 'Pencil1Icon', label: 'Карандаш', icon: Pencil1Icon },
  { value: 'TrashIcon', label: 'Корзина', icon: TrashIcon },
  { value: 'ListBulletIcon', label: 'Список', icon: ListBulletIcon },
  { value: 'MagnifyingGlassIcon', label: 'Поиск', icon: MagnifyingGlassIcon },
  { value: 'DownloadIcon', label: 'Скачать', icon: DownloadIcon },
  { value: 'UploadIcon', label: 'Загрузить', icon: UploadIcon },
  { value: 'CopyIcon', label: 'Копировать', icon: CopyIcon },
  { value: 'ChevronRightIcon', label: 'Шеврон вправо', icon: ChevronRightIcon },
  { value: 'ChevronDownIcon', label: 'Шеврон вниз', icon: ChevronDownIcon },
  { value: 'GitHubLogoIcon', label: 'GitHub', icon: GitHubLogoIcon },
  { value: 'NotionLogoIcon', label: 'Notion', icon: NotionLogoIcon },
]

export default function QuickButtonModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: QuickButtonModalProps) {
  const [formData, setFormData] = useState<QuickButtonData>({
    name: '',
    icon: '',
    customIcon: '',
    type: 'link',
    value: '',
    color: '#007bff',
    order: 0,
  })

  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          icon: initialData.icon || '',
          customIcon: initialData.customIcon || '',
          type: initialData.type || 'link',
          value: initialData.value || '',
          color: initialData.color || '#007bff',
          order: initialData.order || 0,
        })
      } else {
        setFormData({
          name: '',
          icon: '',
          customIcon: '',
          type: 'link',
          value: '',
          color: '#007bff',
          order: 0,
        })
      }
    }
  }, [isOpen, initialData])

  const handleChange = (field: keyof QuickButtonData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Пожалуйста, введите название')
      return
    }

    if (!formData.icon) {
      alert('Пожалуйста, выберите иконку')
      return
    }

    if (!formData.value.trim()) {
      alert('Пожалуйста, введите значение')
      return
    }

    if (formData.type === 'link') {
      const trimmedValue = formData.value.trim()
      const urlPattern = /^(https?:\/\/|\/|mailto:|tel:)/i
      if (!urlPattern.test(trimmedValue)) {
        alert('URL должен начинаться с http://, https://, /, mailto: или tel:')
        return
      }
      if (trimmedValue.startsWith('mailto:') && !trimmedValue.includes('@')) {
        alert('Некорректный email в mailto:')
        return
      }
      if (trimmedValue.startsWith('tel:') && trimmedValue.length <= 4) {
        alert('Некорректный номер телефона в tel:')
        return
      }
    }

    const saveData: QuickButtonData = {
      ...formData,
      icon: formData.icon,
    }

    onSave(saveData)
  }

  const getValueHelperText = () => {
    switch (formData.type) {
      case 'link':
        return 'Для типа "Ссылка" укажите URL (начинается с http://, https://, /, mailto: или tel:)'
      case 'text':
        return 'Введите текст, который будет отображаться'
      case 'datetime':
        return 'Введите дату и время в формате YYYY-MM-DD HH:mm'
      default:
        return ''
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Content className={styles.dialogContent} style={{ maxWidth: 600 }}>
        <Flex justify="between" align="center" className={styles.modalHeader}>
          <Dialog.Title className={styles.modalTitle}>
            {initialData ? 'Редактировать кнопку' : 'Создать кнопку'}
          </Dialog.Title>
          <Dialog.Close aria-label="Закрыть" className={styles.closeButton}>
            <Cross2Icon width={20} height={20} />
          </Dialog.Close>
        </Flex>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Box className={styles.modalContent}>
            <Flex gap="4" style={{ marginBottom: 20 }}>
              <Box style={{ flex: 1 }}>
                <Text size="2" weight="medium" as="div" className={styles.formLabel}>
                  Название <Text color="red">*</Text>
                </Text>
                <TextField.Root
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Введите название"
                  required
                  style={{ width: '100%' }}
                />
              </Box>
              <Box style={{ width: 150, flexShrink: 0 }}>
                <Text size="2" weight="medium" as="div" className={styles.formLabel}>
                  Порядок
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => handleChange('order', parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
              </Box>
            </Flex>

            <Flex gap="4" style={{ marginBottom: 20 }}>
              <Box style={{ flex: 1 }}>
                <Text size="2" weight="medium" as="div" className={styles.formLabel}>
                  Иконка <Text color="red">*</Text>
                </Text>
                <Flex align="center" gap="2" style={{ marginBottom: 8 }}>
                  {formData.icon && iconComponents[formData.icon] && (
                    <Box style={{ flexShrink: 0 }}>
                      {(() => {
                        const IconComponent = iconComponents[formData.icon]
                        return <IconComponent width={20} height={20} />
                      })()}
                    </Box>
                  )}
                  <Box style={{ flex: 1 }}>
                    <Select.Root
                      key={formData.icon || 'empty'}
                      value={formData.icon || undefined}
                      onValueChange={(value) => handleChange('icon', value)}
                    >
                      <Select.Trigger placeholder="Выберите иконку..." style={{ width: '100%' }}>
                        {formData.icon && PRESET_ICONS.find((i) => i.value === formData.icon)?.label}
                      </Select.Trigger>
                      <Select.Content position="popper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {PRESET_ICONS.map((icon) => {
                          const IconComponent = icon.icon
                          return (
                            <Select.Item key={icon.value} value={icon.value}>
                              <Flex align="center" gap="2">
                                <IconComponent width={16} height={16} />
                                <Text>{icon.label}</Text>
                              </Flex>
                            </Select.Item>
                          )
                        })}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>
                <Text size="1" color="gray" as="div" style={{ marginBottom: 8 }}>
                  Выберите иконку из списка @radix-ui/react-icons
                </Text>
              </Box>
              <Box style={{ width: 200, flexShrink: 0 }}>
                <Text size="2" weight="medium" as="div" className={styles.formLabel}>
                  Цвет фона
                </Text>
                <Flex align="center" gap="2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className={styles.colorPicker}
                    style={{ flexShrink: 0 }}
                  />
                  <TextField.Root
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="#007bff"
                    style={{ flex: 1 }}
                  />
                </Flex>
                <Text size="1" color="gray" as="div" style={{ marginTop: 8 }}>
                  Выберите цвет фона для кнопки
                </Text>
              </Box>
            </Flex>

            <Box style={{ marginBottom: 20 }}>
              <Text size="2" weight="medium" as="div" className={styles.formLabel}>
                Тип <Text color="red">*</Text>
              </Text>
              <Select.Root value={formData.type} onValueChange={(value: 'link' | 'text' | 'datetime') => handleChange('type', value)}>
                <Select.Trigger placeholder="Выберите тип..." style={{ width: '100%' }} />
                <Select.Content>
                  <Select.Item value="link">Ссылка</Select.Item>
                  <Select.Item value="text">Текст</Select.Item>
                  <Select.Item value="datetime">Дата/время</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box style={{ marginBottom: 20 }}>
              <Text size="2" weight="medium" as="div" className={styles.formLabel}>
                Значение <Text color="red">*</Text>
              </Text>
              {formData.type === 'text' ? (
                <TextArea
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="Введите текст"
                  required
                  style={{ width: '100%', minHeight: '100px', marginBottom: 8 }}
                />
              ) : formData.type === 'datetime' ? (
                <TextField.Root
                  type="datetime-local"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  required
                  style={{ width: '100%', marginBottom: 8 }}
                />
              ) : (
                <TextField.Root
                  type="url"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="https://example.com или /path или mailto:email@example.com или tel:+1234567890"
                  required
                  style={{ width: '100%', marginBottom: 8 }}
                />
              )}
              <Text size="1" color="gray" as="div">
                {getValueHelperText()}
              </Text>
            </Box>
          </Box>

          <Flex justify="end" gap="3" className={styles.modalFooter}>
            <Dialog.Close>
              <Button variant="soft" type="button">
                Отмена
              </Button>
            </Dialog.Close>
            <Button variant="solid" type="submit" style={{ backgroundColor: 'var(--accent-9)' }}>
              Сохранить
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
