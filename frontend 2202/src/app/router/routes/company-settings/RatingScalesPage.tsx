import { Box } from '@radix-ui/themes'
import RatingScalesSettings from '@/shared/components/company-settings/RatingScalesSettings'
import styles from '../CompanySettingsPage.module.css'

export function RatingScalesPage() {
  return (
    <Box className={styles.container}>
      <RatingScalesSettings />
    </Box>
  )
}
