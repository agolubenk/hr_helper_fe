import { Box, Text } from '@radix-ui/themes'
import RecruitingCommandsSettings from '@/shared/components/company-settings/RecruitingCommandsSettings'
import styles from '../CompanySettingsPage.module.css'

export function RecruitingCommandsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Команды workflow
      </Text>
      <RecruitingCommandsSettings />
    </Box>
  )
}
