import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminCompanyOfficesPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Офисы и локации
      </Text>
      <PlaceholderPage title="Список офисов и локаций компании. CRUD." />
    </Box>
  )
}
