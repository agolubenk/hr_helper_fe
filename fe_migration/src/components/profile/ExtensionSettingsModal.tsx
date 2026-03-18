'use client'

/**
 * ExtensionSettingsModal - модальное окно настроек расширения Chrome "HR Helper"
 */
import { useState } from 'react'
import { Box, Flex, Text, Button, Dialog } from '@radix-ui/themes'
import { CopyIcon, EyeOpenIcon, EyeClosedIcon, LockClosedIcon } from '@radix-ui/react-icons'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './ExtensionSettingsModal.module.css'

const apiBase = import.meta.env?.VITE_API_URL?.trim()
const TOKEN_API_URL = apiBase
  ? `${apiBase.replace(/\/$/, '')}/accounts/users/token/`
  : 'https://hr.sftntx.com/api/v1/accounts/users/token/'

interface ExtensionSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  token?: string
}

export default function ExtensionSettingsModal({
  isOpen,
  onClose,
  token = 'demo-token-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
}: ExtensionSettingsModalProps) {
  const [isTokenVisible, setIsTokenVisible] = useState(false)
  const toast = useToast()

  const maskedToken = token
    ? `${token.slice(0, 4)}${'*'.repeat(Math.max(0, token.length - 8))}${token.slice(-4)}`
    : ''

  const copyToClipboard = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    toast.showSuccess('Скопировано', 'Токен скопирован в буфер обмена')
  }

  if (!isOpen) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content style={{ maxWidth: 560 }}>
        <Dialog.Title>Расширение Chrome &quot;HR Helper&quot;</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Настройка доступа расширения к API
        </Dialog.Description>

        <Box className={styles.extensionSettings}>
          <div className={styles.extensionStatus}>
            <div className={styles.statusIndicator}>
              <div className={styles.statusDot} />
              <span>Включено</span>
            </div>
          </div>

          <div className={styles.tokenSection}>
            <div className={styles.tokenHeader}>
              <LockClosedIcon width={20} height={20} className={styles.tokenHeaderIcon} />
              <Text size="3" weight="medium">
                Токен для доступа расширения к API
              </Text>
            </div>
            <Text size="2" color="gray" as="p" className={styles.tokenDescription}>
              Поле скрыто символами; кнопка «Копировать» копирует полный токен в буфер.
            </Text>
            <div className={styles.tokenInputGroup}>
              <div className={styles.tokenInput}>
                <LockClosedIcon width={16} height={16} className={styles.tokenInputIcon} />
                <input
                  type="text"
                  value={isTokenVisible ? token : maskedToken}
                  readOnly
                  className={styles.tokenField}
                />
                <Button
                  variant="ghost"
                  size="1"
                  onClick={() => setIsTokenVisible(!isTokenVisible)}
                  title={isTokenVisible ? 'Скрыть' : 'Показать'}
                >
                  {isTokenVisible ? (
                    <EyeClosedIcon width={16} height={16} />
                  ) : (
                    <EyeOpenIcon width={16} height={16} />
                  )}
                </Button>
              </div>
              <Button onClick={copyToClipboard} size="2">
                <CopyIcon width={16} height={16} />
                Копировать
              </Button>
            </div>
            <div className={styles.tokenInfo}>
              <Text size="1" color="gray" as="p">
                Токен по запросу:{' '}
                <a
                  href={TOKEN_API_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.tokenLink}
                >
                  {TOKEN_API_URL}
                </a>
              </Text>
            </div>
          </div>
        </Box>

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft">Закрыть</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
