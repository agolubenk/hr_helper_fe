import { Box, Text } from '@radix-ui/themes'
import VacancyPromptSettings from '@/shared/components/company-settings/VacancyPromptSettings'
import styles from '../CompanySettingsPage.module.css'

export function VacancyPromptPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Единый промпт для вакансий
      </Text>
      <VacancyPromptSettings />
    </Box>
  )
}
