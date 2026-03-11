import { Box, Flex, Text, Button, Dialog } from '@radix-ui/themes'
import { CopyIcon, LockClosedIcon, FileTextIcon } from '@radix-ui/react-icons'
import { Link } from '@tanstack/react-router'
import { useToast } from '@/shared/components/feedback/Toast'
import styles from './ExtensionSettingsModal.module.css'

interface ExtensionSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  token?: string
}

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/hr-helper/dccabghccldhpkichoejklfmbcclmepl?authuser=0&hl=ru'

export function ExtensionSettingsModal({ isOpen, onClose, token = 'demo-token-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }: ExtensionSettingsModalProps) {
  const toast = useToast()
  const maskedToken = token ? `${token.slice(0, 4)}${'*'.repeat(Math.max(0, token.length - 8))}${token.slice(-4)}` : ''

  const copyToClipboard = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    toast.showSuccess('Скопировано', 'Токен скопирован в буфер обмена')
  }

  if (!isOpen) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
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
              <Text size="3" weight="medium">Токен для доступа расширения к API</Text>
            </div>
            <Text size="2" color="gray" as="p" className={styles.tokenDescription}>
              Поле скрыто символами; кнопка «Копировать» копирует полный токен в буфер.
            </Text>
            <div className={styles.tokenInputGroup}>
              <div className={styles.tokenInput}>
                <LockClosedIcon width={16} height={16} className={styles.tokenInputIcon} />
                <input
                  type="text"
                  value={maskedToken}
                  readOnly
                  className={styles.tokenField}
                />
              </div>
              <Button onClick={copyToClipboard} size="2">
                <CopyIcon width={16} height={16} />
                Копировать
              </Button>
            </div>
            <div className={styles.tokenInfo}>
              <Text size="1" color="gray" as="p">
                Расширение в Chrome Web Store:{' '}
                <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer" className={styles.tokenLink}>
                  HR Helper
                </a>
              </Text>
            </div>
          </div>
          <Box className={styles.wikiLinkSection}>
            <Link to="/wiki" className={styles.wikiLink}>
              <FileTextIcon width={14} height={14} />
              <Text size="2">Инструкция по расширению в Вики</Text>
            </Link>
          </Box>
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
