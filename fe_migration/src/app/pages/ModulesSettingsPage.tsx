import { Box, Text } from '@radix-ui/themes'
import { ModulesSettingsPanel } from '@/components/company-settings/system/ModulesSettingsPanel'
import styles from './styles/CompanySettings.module.css'

export function ModulesSettingsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Модули (вкл/выкл)
      </Text>
      <ModulesSettingsPanel />
    </Box>
  )
}
