import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { Link, useNavigate } from '@/router-adapter'
import { SecurityUserForm } from '@/app/pages/settings-security/SecurityUserForm'
import styles from '@/app/pages/settings-security/rbacAdminPages.module.css'

export function SettingsSecurityUserCreatePage() {
  const navigate = useNavigate()

  return (
    <Box p={{ initial: '4', sm: '6' }} style={{ maxWidth: 640 }}>
      <Flex align="center" gap="3" mb="4">
        <Button variant="soft" color="gray" asChild>
          <Link href="/settings/users">
            <ArrowLeftIcon /> К списку
          </Link>
        </Button>
      </Flex>
      <Text size="6" weight="bold" className={styles.pageTitle}>
        Новый пользователь
      </Text>
      <Text as="p" size="2" color="gray" className={styles.pageIntro} mb="4">
        Заполните учётную запись, корпоративный email, роли и группы. После сохранения запись появится в общем списке.
      </Text>
      <Box
        p="4"
        style={{
          border: '1px solid var(--gray-a6)',
          borderRadius: 'var(--radius-3)',
          background: 'var(--color-panel)',
        }}
      >
        <SecurityUserForm
          mode="create"
          editingUser={null}
          onSuccess={() => navigate('/settings/users')}
          onCancel={() => navigate('/settings/users')}
        />
      </Box>
    </Box>
  )
}
