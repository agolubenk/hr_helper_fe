import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminRolesPermissionsPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Права доступа
      </Text>
      <PlaceholderPage title="Матрица прав по ролям и контекстам." />
    </Box>
  )
}
