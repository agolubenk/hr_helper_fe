import { Box, Text } from '@radix-ui/themes'
import { OutboundIntegrationsPanel } from '@/components/company-settings/system/OutboundIntegrationsPanel'
import styles from './styles/CompanySettings.module.css'

export function OutboundIntegrationsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Исходящие API и вебхуки
      </Text>
      <OutboundIntegrationsPanel />
    </Box>
  )
}
