import { Box, Text } from '@radix-ui/themes'
import GeneralSettings from '@/shared/components/company-settings/GeneralSettings'
import styles from './CompanySettingsPage.module.css'

export function CompanySettingsPage() {
  return (
    <Box data-tour="company-settings-page" className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Общие настройки
      </Text>
      <GeneralSettings />
    </Box>
  )
}
