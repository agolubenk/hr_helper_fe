import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminPositionsPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Должности
      </Text>
      <PlaceholderPage title="Список должностей. name, department, grade." />
    </Box>
  )
}
