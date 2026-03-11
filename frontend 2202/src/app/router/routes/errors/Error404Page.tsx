'use client'

import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { HomeIcon, MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import { MainLayout } from '@/app/router/layouts/MainLayout'
import { FloatingIconsBackground } from '@/shared/components/errors/FloatingIconsBackground'
import styles from './error-404.module.css'

export function Error404Page() {
  const navigate = useNavigate()

  return (
    <MainLayout pageTitle="404 - Страница не найдена" contentPadding={false}>
      <Box className={styles.container}>
        <Box className={styles.background}>
          <FloatingIconsBackground className={styles.floatingIcon} />
        </Box>
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          <Text size="9" weight="bold" className={styles.errorCode}>
            404
          </Text>
          <Flex align="center" gap="2" mt="4">
            <Box className={styles.searchIconWrapper}>
              <MagnifyingGlassIcon width={32} height={32} className={styles.searchIcon} />
            </Box>
            <Text size="6" weight="bold" className={styles.title}>
              Страница не найдена
            </Text>
          </Flex>
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </Text>
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => navigate({ to: '/' })}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
            <Button size="3" variant="soft" onClick={() => window.history.back()}>
              <ReloadIcon width={16} height={16} />
              Назад
            </Button>
          </Flex>
        </Flex>
      </Box>
    </MainLayout>
  )
}
