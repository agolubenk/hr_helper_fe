'use client'

/**
 * SocialLinksManager - управление социальными сетями в форме редактирования профиля
 */
import { useState } from 'react'
import { Box, Flex, Text, Button, Dialog, TextField, Select } from '@radix-ui/themes'
import { PlusIcon, Cross2Icon, Pencil1Icon } from '@radix-ui/react-icons'
import type { SocialLink } from '@/lib/types/social-links'
import { createSocialLink } from '@/lib/types/social-links'
import type { SocialPlatformKey } from '@/lib/socialPlatforms'
import { SOCIAL_PLATFORM_KEYS, SOCIAL_PLATFORMS, getPlatformInfo } from '@/lib/socialPlatforms'
import styles from './SocialLinksManager.module.css'

const PLATFORM_PLACEHOLDERS: Partial<Record<SocialPlatformKey, string>> = {
  whatsapp: '+375291234567',
  telegram: 'username',
  linkedin: 'your-profile',
  github: 'username',
  vk: 'id или username',
}

function getPlaceholder(platform: SocialPlatformKey): string {
  return PLATFORM_PLACEHOLDERS[platform] ?? 'username или URL'
}

interface SocialLinksManagerProps {
  links: SocialLink[]
  onUpdate: (links: SocialLink[]) => void
}

export default function SocialLinksManager({ links, onUpdate }: SocialLinksManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformKey | ''>('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const availablePlatforms = SOCIAL_PLATFORM_KEYS.filter(
    (platform) =>
      !links.some((link) => link.platform === platform) || editingLink?.platform === platform
  )

  const handleAdd = () => {
    setEditingLink(null)
    setSelectedPlatform('')
    setValue('')
    setError('')
    setIsModalOpen(true)
  }

  const handleEdit = (link: SocialLink) => {
    setEditingLink(link)
    setSelectedPlatform(link.platform)
    setValue(link.value)
    setError('')
    setIsModalOpen(true)
  }

  const handleDelete = (linkId: string) => {
    onUpdate(links.filter((link) => link.id !== linkId))
  }

  const handleSave = () => {
    if (!selectedPlatform) {
      setError('Выберите платформу')
      return
    }
    if (!value.trim()) {
      setError('Введите значение')
      return
    }
    const config = SOCIAL_PLATFORMS[selectedPlatform]
    if (config.validator && !config.validator(value.trim())) {
      setError('Некорректный формат')
      return
    }

    if (editingLink) {
      onUpdate(
        links.map((link) =>
          link.id === editingLink.id
            ? { ...link, platform: selectedPlatform as SocialPlatformKey, value: value.trim(), updatedAt: new Date().toISOString() }
            : link
        )
      )
    } else {
      onUpdate([...links, createSocialLink(selectedPlatform as SocialPlatformKey, value.trim())])
    }
    setIsModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLink(null)
    setSelectedPlatform('')
    setValue('')
    setError('')
  }

  return (
    <div className={styles.manager}>
      <div className={styles.list}>
        {links.map((link) => {
          const info = getPlatformInfo(link.platform)
          return (
            <div key={link.id} className={styles.item}>
              <div
                className={styles.preview}
                style={{ backgroundColor: info.color }}
              >
                <Flex align="center" justify="center" style={{ width: 20, height: 20 }}>
                  {info.icon}
                </Flex>
              </div>
              <div className={styles.info}>
                <span className={styles.label}>{info.name}</span>
                <span className={styles.value}>{link.value}</span>
              </div>
              <div className={styles.actions}>
                <Button
                  size="1"
                  variant="ghost"
                  onClick={() => handleEdit(link)}
                  title="Редактировать"
                >
                  <Pencil1Icon width={14} height={14} />
                </Button>
                <Button
                  size="1"
                  variant="ghost"
                  color="red"
                  onClick={() => handleDelete(link.id)}
                  title="Удалить"
                >
                  <Cross2Icon width={14} height={14} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {availablePlatforms.length > 0 && (
        <Button variant="soft" onClick={handleAdd} size="2">
          <PlusIcon width={16} height={16} />
          Добавить социальную сеть
        </Button>
      )}

      <Dialog.Root open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <Dialog.Content style={{ maxWidth: 400 }}>
          <Dialog.Title>
            {editingLink ? 'Редактировать ссылку' : 'Добавить социальную сеть'}
          </Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Выберите платформу и введите username или URL
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" weight="medium" mb="2" as="div">
                Платформа
              </Text>
              <Select.Root
                value={selectedPlatform}
                onValueChange={(v) => {
                  setSelectedPlatform(v as SocialPlatformKey)
                  setValue('')
                  setError('')
                }}
                disabled={!!editingLink}
              >
                <Select.Trigger placeholder="Выберите платформу" />
                <Select.Content>
                  {availablePlatforms.map((platform) => {
                    const config = SOCIAL_PLATFORMS[platform]
                    return (
                      <Select.Item key={platform} value={platform}>
                        {config.label}
                      </Select.Item>
                    )
                  })}
                </Select.Content>
              </Select.Root>
            </Box>

            {selectedPlatform && (
              <Box>
                <Text size="2" weight="medium" mb="2" as="div">
                  Значение
                </Text>
                <TextField.Root
                  placeholder={getPlaceholder(selectedPlatform)}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value)
                    setError('')
                  }}
                  color={error ? 'red' : undefined}
                />
                {error && (
                  <Text size="1" color="red" mt="1" as="div">
                    {error}
                  </Text>
                )}
              </Box>
            )}

            <Flex gap="2" justify="end" mt="4">
              <Dialog.Close>
                <Button variant="soft">Отмена</Button>
              </Dialog.Close>
              <Button onClick={handleSave}>
                {editingLink ? 'Сохранить' : 'Добавить'}
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
