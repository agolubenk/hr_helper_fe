import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminUsersGroupsPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Группы пользователей
      </Text>
      <PlaceholderPage title="Группы пользователей. CRUD." />
    </Box>
  )
}
