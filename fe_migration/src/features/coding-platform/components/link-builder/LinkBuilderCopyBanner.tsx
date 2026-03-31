import { useEffect } from 'react'
import { Box, Text, IconButton } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'
import styles from './LinkBuilderCopyBanner.module.css'

interface LinkBuilderCopyBannerProps {
  message: string | null
  onDismiss: () => void
}

export function LinkBuilderCopyBanner({ message, onDismiss }: LinkBuilderCopyBannerProps) {
  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(onDismiss, 3200)
    return () => window.clearTimeout(t)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <Box
      role="status"
      aria-live="polite"
      className={styles.banner}
      p="3"
    >
      <Text size="2" weight="medium" className={styles.text}>
        {message}
      </Text>
      <IconButton size="1" variant="ghost" color="gray" onClick={onDismiss} aria-label="Закрыть уведомление">
        <Cross2Icon width={14} height={14} />
      </IconButton>
    </Box>
  )
}
