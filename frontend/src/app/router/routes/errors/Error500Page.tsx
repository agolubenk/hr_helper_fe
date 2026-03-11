'use client'

import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { HomeIcon, ReloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import { MainLayout } from '@/app/router/layouts/MainLayout'
import { FloatingIconsBackground } from '@/shared/components/errors/FloatingIconsBackground'
import styles from './error-500.module.css'

export function Error500Page() {
  const navigate = useNavigate()

  return (
    <MainLayout pageTitle="500 - Ошибка сервера" contentPadding={false}>
      <Box className={styles.container}>
        <Box className={styles.background}>
          <FloatingIconsBackground className={styles.floatingIcon} />
        </Box>
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          <Text size="9" weight="bold" className={styles.errorCode}>
            500
          </Text>
          <Flex align="center" gap="2" mt="4">
            <ExclamationTriangleIcon width={32} height={32} className={styles.errorIcon} />
            <Text size="6" weight="bold" className={styles.title}>
              Ошибка сервера
            </Text>
          </Flex>
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Произошла внутренняя ошибка сервера. Мы уже работаем над её устранением. Попробуйте обновить страницу через несколько минут.
          </Text>
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => navigate({ to: '/' })}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
            <Button size="3" variant="soft" onClick={() => window.location.reload()}>
              <ReloadIcon width={16} height={16} />
              Обновить
            </Button>
          </Flex>
        </Flex>
      </Box>
    </MainLayout>
  )
}
