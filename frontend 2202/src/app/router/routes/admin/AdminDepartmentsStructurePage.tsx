import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminDepartmentsStructurePage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Оргструктура
      </Text>
      <PlaceholderPage title="Дерево отделов. Иерархия." />
    </Box>
  )
}
