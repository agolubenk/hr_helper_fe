import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminUsersRolesPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Роли пользователей
      </Text>
      <PlaceholderPage title="UserRole: EMPLOYEE, CANDIDATE, INTERVIEWER, ADMIN. Контекст: global, department, project." />
    </Box>
  )
}
