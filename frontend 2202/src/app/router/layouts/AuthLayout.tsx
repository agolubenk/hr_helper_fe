import { Box, Flex } from '@radix-ui/themes'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

/** Layout для страниц логина/регистрации */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh', padding: '24px' }}>
      <Box style={{ width: '100%', maxWidth: 400 }}>
        {children}
      </Box>
    </Flex>
  )
}
