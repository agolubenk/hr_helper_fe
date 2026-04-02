import type { ReactNode } from 'react'
import { Flex, Text, Heading, Box } from '@radix-ui/themes'
import { CodingPlatformNavCard } from './CodingPlatformNavCard'
import styles from '../styles/CodingPlatformPages.module.css'

interface CodingPlatformPageShellProps {
  title: string
  description?: string
  children: ReactNode
  /** Заполнить доступную высоту под AppLayout (песочница IDE без лишнего скролла снаружи) */
  fillAvailableHeight?: boolean
}

export function CodingPlatformPageShell({
  title,
  description,
  children,
  fillAvailableHeight = false,
}: CodingPlatformPageShellProps) {
  return (
    <Flex
      direction="column"
      gap="4"
      className={styles.wrapWide}
      p={{ initial: '3', sm: '4' }}
      style={
        fillAvailableHeight
          ? { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }
          : undefined
      }
    >
      <Box>
        <Flex align="center" justify="between" gap="4" wrap="wrap" mb={description ? '2' : '0'}>
          <Heading size="6" style={{ margin: 0 }}>
            {title}
          </Heading>
          <CodingPlatformNavCard variant="inline" />
        </Flex>
        {description ? (
          <Text size="2" color="gray">
            {description}
          </Text>
        ) : null}
      </Box>
      {fillAvailableHeight ? (
        <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box>
      ) : (
        children
      )}
    </Flex>
  )
}
