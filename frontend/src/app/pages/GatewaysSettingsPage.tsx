import { Box, Text } from '@radix-ui/themes'
import { EmailGatewaysSettingsPanel } from '@/components/company-settings/system/EmailGatewaysSettingsPanel'
import styles from './styles/CompanySettings.module.css'

export function GatewaysSettingsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Почта и мессенджер-шлюзы
      </Text>
      <EmailGatewaysSettingsPanel />
    </Box>
  )
}
