import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { HomeIcon, MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import AppLayout from '@/components/AppLayout'
import { FloatingIconsBackground } from '@/components/errors/FloatingIconsBackground'
import styles from '@/app/pages/styles/errors/error-404.module.css'

export function Error404Page() {
  const router = useRouter()

  return (
    <AppLayout pageTitle="404 - Страница не найдена">
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
