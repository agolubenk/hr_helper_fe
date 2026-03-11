import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminLocationsPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Локации
      </Text>
      <PlaceholderPage title="Офисы и локации. name, address, country, city, mapLink." />
    </Box>
  )
}
