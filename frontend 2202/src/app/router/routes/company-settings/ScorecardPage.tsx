import { Box, Text } from '@radix-ui/themes'
import ScorecardSettings from '@/shared/components/company-settings/ScorecardSettings'
import styles from '../CompanySettingsPage.module.css'

export function ScorecardPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Scorecard
      </Text>
      <ScorecardSettings />
    </Box>
  )
}
