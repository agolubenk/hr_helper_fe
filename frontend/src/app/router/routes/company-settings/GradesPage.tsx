import { Box } from '@radix-ui/themes'
import GradesSettings from '@/shared/components/company-settings/GradesSettings'
import styles from '../CompanySettingsPage.module.css'

export function GradesPage() {
  return (
    <Box className={styles.container}>
      <GradesSettings />
    </Box>
  )
}
