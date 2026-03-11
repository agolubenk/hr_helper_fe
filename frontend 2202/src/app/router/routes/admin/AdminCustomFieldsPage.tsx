import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

export function AdminCustomFieldsPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Пользовательские поля
      </Text>
      <PlaceholderPage title="CustomAttributesEditor. Схема для Company, User и др." />
    </Box>
  )
}
