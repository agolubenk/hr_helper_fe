import { Box, Text } from '@radix-ui/themes'
import GeneralSettings from '@/shared/components/company-settings/GeneralSettings'

export function AdminCompanyPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Общие настройки компании
      </Text>
      <GeneralSettings />
    </Box>
  )
}
