import { Box, Text } from '@radix-ui/themes'
import { LocalizationSettingsPanel } from '@/components/company-settings/system/LocalizationSettingsPanel'
import styles from './styles/CompanySettings.module.css'

export function LocalizationSettingsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Локализация и переводы
      </Text>
      <LocalizationSettingsPanel />
    </Box>
  )
}
