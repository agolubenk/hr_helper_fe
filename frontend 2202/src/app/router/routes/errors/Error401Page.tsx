'use client'

import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { HomeIcon, LockClosedIcon, PersonIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import { MainLayout } from '@/app/router/layouts/MainLayout'
import { FloatingIconsBackground } from '@/shared/components/errors/FloatingIconsBackground'
import styles from './error-401.module.css'

export function Error401Page() {
  const navigate = useNavigate()

  return (
    <MainLayout pageTitle="401 - Требуется авторизация" contentPadding={false}>
      <Box className={styles.container}>
        <Box className={styles.background}>
          <FloatingIconsBackground className={styles.floatingIcon} />
        </Box>
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          <Text size="9" weight="bold" className={styles.errorCode}>
            401
          </Text>
          <Flex align="center" gap="2" mt="4">
            <PersonIcon width={32} height={32} className={styles.personIcon} />
            <Text size="6" weight="bold" className={styles.title}>
              Требуется авторизация
            </Text>
          </Flex>
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Для доступа к этой странице необходимо войти в систему. Пожалуйста, авторизуйтесь.
          </Text>
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => navigate({ to: '/account/profile' })}>
              <LockClosedIcon width={16} height={16} />
              Войти
            </Button>
            <Button size="3" variant="soft" onClick={() => navigate({ to: '/' })}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
          </Flex>
        </Flex>
      </Box>
    </MainLayout>
  )
}
