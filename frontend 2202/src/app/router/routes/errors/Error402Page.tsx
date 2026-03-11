'use client'

import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { HomeIcon, ReloadIcon, StarIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import { MainLayout } from '@/app/router/layouts/MainLayout'
import { FloatingIconsBackground } from '@/shared/components/errors/FloatingIconsBackground'
import styles from './error-402.module.css'

export function Error402Page() {
  const navigate = useNavigate()

  return (
    <MainLayout pageTitle="402 - Требуется оплата" contentPadding={false}>
      <Box className={styles.container}>
        <Box className={styles.background}>
          <FloatingIconsBackground className={styles.floatingIcon} />
        </Box>
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          <Text size="9" weight="bold" className={styles.errorCode}>
            402
          </Text>
          <Flex align="center" gap="2" mt="4">
            <StarIcon width={32} height={32} className={styles.cardIcon} />
            <Text size="6" weight="bold" className={styles.title}>
              Требуется оплата
            </Text>
          </Flex>
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Для доступа к этому контенту требуется оплата. Пожалуйста, выполните оплату для продолжения.
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
