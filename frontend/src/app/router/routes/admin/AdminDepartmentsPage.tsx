import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminDepartmentsPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Отделы
      </Text>
      <PlaceholderPage title="Список отделов. name, slug, parent, manager, location." />
    </Box>
  )
}
