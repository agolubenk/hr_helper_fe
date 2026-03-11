import { Box, Text } from '@radix-ui/themes'
import CandidateFieldsSettings from '@/shared/components/company-settings/CandidateFieldsSettings'
import styles from '../CompanySettingsPage.module.css'

export function CandidateFieldsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Дополнительные поля кандидатов
      </Text>
      <CandidateFieldsSettings />
    </Box>
  )
}
