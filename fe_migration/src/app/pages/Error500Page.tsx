import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { HomeIcon, ReloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import AppLayout from '@/components/AppLayout'
import { FloatingIconsBackground } from '@/components/errors/FloatingIconsBackground'
import styles from '@/app/pages/styles/errors/error-500.module.css'

export function Error500Page() {
  const router = useRouter()

  return (
    <AppLayout pageTitle="500 - Ошибка сервера">
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
            <Button size="3" onClick={() => router.push('/')}>
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
    </AppLayout>
  )
}
