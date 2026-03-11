import { Box, Text } from '@radix-ui/themes'
import UsersSettings from '@/shared/components/company-settings/UsersSettings'

export function AdminUsersPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Пользователи
      </Text>
      <UsersSettings />
    </Box>
  )
}
