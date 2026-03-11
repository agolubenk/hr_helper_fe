import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminCustomFieldsSchemaPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Схема пользовательских полей
      </Text>
      <PlaceholderPage title="JSON Schema для custom_attributes." />
    </Box>
  )
}
