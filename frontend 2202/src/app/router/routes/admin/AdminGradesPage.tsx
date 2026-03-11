import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminGradesPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Грейды
      </Text>
      <PlaceholderPage title="Грейды. Связь с должностями и компенсацией." />
    </Box>
  )
}
