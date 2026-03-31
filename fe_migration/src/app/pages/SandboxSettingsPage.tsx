import { Box, Text } from '@radix-ui/themes'
import { SandboxSettingsPanel } from '@/components/company-settings/system/SandboxSettingsPanel'
import styles from './styles/CompanySettings.module.css'

export function SandboxSettingsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Песочница / стенд
      </Text>
      <SandboxSettingsPanel />
    </Box>
  )
}
