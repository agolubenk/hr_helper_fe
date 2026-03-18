import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { HomeIcon, LockClosedIcon, PersonIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import AppLayout from '@/components/AppLayout'
import { FloatingIconsBackground } from '@/components/errors/FloatingIconsBackground'
import baseStyles from '@/app/pages/styles/errors/error-pages-base.module.css'
import styles from '@/app/pages/styles/errors/error-401.module.css'

export function Error401Page() {
  const router = useRouter()

  return (
    <AppLayout pageTitle="401 - Требуется авторизация">
      <Box className={baseStyles.container}>
        <Box className={baseStyles.background}>
          <FloatingIconsBackground className={baseStyles.floatingIcon} />
        </Box>
        <Flex direction="column" align="center" justify="center" className={baseStyles.content}>
          <Text size="9" weight="bold" className={baseStyles.errorCode}>
            401
          </Text>
          <Flex align="center" gap="2" mt="4">
            <PersonIcon width={32} height={32} className={styles.personIcon} />
            <Text size="6" weight="bold" className={baseStyles.title}>
              Требуется авторизация
            </Text>
          </Flex>
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Для доступа к этой странице необходимо войти в систему. Пожалуйста, авторизуйтесь.
          </Text>
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => router.push('/account/login')}>
              <LockClosedIcon width={16} height={16} />
              Войти
            </Button>
            <Button size="3" variant="soft" onClick={() => router.push('/')}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
          </Flex>
        </Flex>
      </Box>
    </AppLayout>
  )
}
