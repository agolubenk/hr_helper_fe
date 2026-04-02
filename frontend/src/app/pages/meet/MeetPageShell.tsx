import type { ReactNode } from 'react'
import { Flex, Text, Heading, Box } from '@radix-ui/themes'
import { MeetNavCard } from './MeetNavBars'
import styles from '../styles/MeetPages.module.css'

interface MeetPageShellProps {
  title: string
  description?: string
  children: ReactNode
}

export function MeetPageShell({ title, description, children }: MeetPageShellProps) {
  return (
    <Flex direction="column" gap="4" className={styles.wrap} p={{ initial: '3', sm: '4' }}>
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

      <MeetNavCard />

      {children}
    </Flex>
  )
}
