import type { ReactNode } from 'react'
import { Flex, Text, Heading, Box } from '@radix-ui/themes'
import { CodingPlatformNavCard } from './CodingPlatformNavCard'
import styles from '../styles/CodingPlatformPages.module.css'

interface CodingPlatformPageShellProps {
  title: string
  description?: string
  /** Шире обычного wrap — для IDE-песочницы */
  wide?: boolean
  children: ReactNode
}

export function CodingPlatformPageShell({ title, description, wide, children }: CodingPlatformPageShellProps) {
  return (
    <Flex direction="column" gap="4" className={wide ? styles.wrapWide : styles.wrap} p={{ initial: '3', sm: '4' }}>
      <Box>
        <Heading size="6" mb="1">
          {title}
        </Heading>
        {description ? (
          <Text size="2" color="gray">
            {description}
          </Text>
        ) : null}
      </Box>
      <CodingPlatformNavCard />
      {children}
    </Flex>
  )
}
