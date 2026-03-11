import { Box, Text } from '@radix-ui/themes'
import EmployeeLifecycleSettings from '@/shared/components/company-settings/EmployeeLifecycleSettings'
import styles from '../CompanySettingsPage.module.css'

export function EmployeeLifecyclePage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Жизненный цикл сотрудников
      </Text>
      <EmployeeLifecycleSettings />
    </Box>
  )
}
