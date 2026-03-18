import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { HomeIcon, LockClosedIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import AppLayout from '@/components/AppLayout'
import { FloatingIconsBackground } from '@/components/errors/FloatingIconsBackground'
import baseStyles from '@/app/pages/styles/errors/error-pages-base.module.css'
import styles from '@/app/pages/styles/errors/error-403.module.css'

export function ForbiddenPage() {
  const router = useRouter()

  return (
    <AppLayout pageTitle="403 - Доступ запрещен">
      <Box className={baseStyles.container}>
        <Box className={baseStyles.background}>
          <FloatingIconsBackground className={baseStyles.floatingIcon} />
        </Box>
        <Flex direction="column" align="center" justify="center" className={baseStyles.content}>
          <Text size="9" weight="bold" className={styles.errorCode}>
            403
          </Text>
          <Flex align="center" gap="2" mt="4">
            <LockClosedIcon width={32} height={32} className={styles.lockIcon} />
            <Text size="6" weight="bold" className={baseStyles.title}>
              Доступ запрещен
            </Text>
          </Flex>
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            У вас нет прав для доступа к этой странице. Обратитесь к администратору, если считаете, что это ошибка.
          </Text>
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => router.push('/')}>
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
    </AppLayout>
  )
}
