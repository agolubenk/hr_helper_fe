import { Box } from '@radix-ui/themes'
import MeetingSettings from '@/shared/components/company-settings/MeetingSettings'
import styles from '../CompanySettingsPage.module.css'

export function CompanyCalendarPage() {
  return (
    <Box className={styles.container}>
      <MeetingSettings />
    </Box>
  )
}
