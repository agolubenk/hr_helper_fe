import { Box, Text } from '@radix-ui/themes'
import RecruitingStagesSettings from '@/shared/components/company-settings/RecruitingStagesSettings'
import styles from '../CompanySettingsPage.module.css'

export function RecruitingStagesPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Этапы найма и причины отказа
      </Text>
      <RecruitingStagesSettings />
    </Box>
  )
}
