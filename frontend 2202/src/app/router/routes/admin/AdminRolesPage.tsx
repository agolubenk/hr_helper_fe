import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminRolesPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Роли
      </Text>
      <PlaceholderPage title="UserRole: user, role_type (EMPLOYEE, CANDIDATE, INTERVIEWER, ADMIN), context, context_id." />
    </Box>
  )
}
