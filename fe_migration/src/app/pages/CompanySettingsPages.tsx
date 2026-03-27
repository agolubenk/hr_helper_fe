import { OrgStructurePage } from '@/app/pages/company-settings/OrgStructurePage'
import { Box, Card, Flex, Text } from '@radix-ui/themes'
import { CandidateResponsesPage } from '@/app/pages/CandidateResponsesPage'
import GeneralSettings from '@/components/company-settings/GeneralSettings'
import GradesSettings from '@/components/company-settings/GradesSettings'
import RatingScalesSettings from '@/components/company-settings/RatingScalesSettings'
import EmployeeLifecycleSettings from '@/components/company-settings/EmployeeLifecycleSettings'
import CandidateFieldsSettings from '@/components/company-settings/CandidateFieldsSettings'
import ScorecardSettings from '@/components/company-settings/ScorecardSettings'
import SLASettings from '@/components/company-settings/SLASettings'
import VacancyPromptSettings from '@/components/company-settings/VacancyPromptSettings'
import RecruitingStagesSettings from '@/components/company-settings/RecruitingStagesSettings'
import RecruitingCommandsSettings from '@/components/company-settings/RecruitingCommandsSettings'
import { CompanyIntegrationsSettings } from '@/components/company-settings/integrations/CompanyIntegrationsSettings'
import { UserGroupsSettings } from '@/components/company-settings/user-groups/UserGroupsSettings'
import { CompanyUsersSettings } from '@/components/company-settings/users'
import { AttractionRulesSettings } from '@/components/company-settings/recruiting/AttractionRulesSettings'
import { OfferTemplateSettings } from '@/components/company-settings/recruiting/OfferTemplateSettings'
import {
  RecruitingMessageTemplatesSettings,
  RecruitingTemplatesSettings,
} from '@/components/company-settings/recruiting/RecruitingTemplatesSettings'
import { RecruitingSubpageBackBar } from '@/components/company-settings/recruiting/RecruitingSubpageBackBar'
import styles from './styles/CompanySettings.module.css'

export function CompanySettingsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Общие настройки
      </Text>
      <GeneralSettings />
    </Box>
  )
}

export function CompanySettingsGradesPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Настройки грейдов
      </Text>
      <GradesSettings />
    </Box>
  )
}

export function CompanySettingsRatingScalesPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Шкалы оценок
      </Text>
      <RatingScalesSettings />
    </Box>
  )
}

export function CompanySettingsEmployeeLifecyclePage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Жизненный цикл сотрудников
      </Text>
      <EmployeeLifecycleSettings />
    </Box>
  )
}

export function CompanySettingsCandidateFieldsPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Настройки дополнительных полей кандидатов
      </Text>
      <CandidateFieldsSettings />
    </Box>
  )
}

export function CompanySettingsVacancyFieldsPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Настройки дополнительных полей вакансии
      </Text>
      <Card>
        <Flex direction="column" gap="2">
          <Text size="3" weight="medium">
            Дополнительные поля вакансии
          </Text>
          <Text size="2" color="gray">
            Здесь будет настройка единого профиля дополнительных полей вакансии и правил их применения.
          </Text>
          <Text size="2" color="gray">
            Индивидуальные значения по конкретной вакансии остаются в карточке вакансии.
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}

export function CompanySettingsScorecardPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Настройки Scorecard
      </Text>
      <ScorecardSettings />
    </Box>
  )
}

export function CompanySettingsSlaPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <SLASettings />
    </Box>
  )
}

export function CompanySettingsVacancyPromptPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Единый промпт для вакансий
      </Text>
      <VacancyPromptSettings />
    </Box>
  )
}

export function CompanySettingsRecruitingStagesPage() {
  return (
    <Box data-tour="recruiting-settings-page" className={styles.container}>
      <RecruitingSubpageBackBar />
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Этапы найма и причины отказа
      </Text>
      <RecruitingStagesSettings />
    </Box>
  )
}

export function CompanySettingsRecruitingCommandsPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <Box mb="4">
        <Text size="6" weight="bold" style={{ display: 'block' }}>
          Команды workflow
        </Text>
        <Text size="2" color="gray" mt="2" style={{ display: 'block' }}>
          Настройте команды для workflow чата. Команды /add и /del являются системными.
        </Text>
      </Box>
      <RecruitingCommandsSettings />
    </Box>
  )
}

export function CompanySettingsOrgStructurePage() {
  return <OrgStructurePage />
}

export function CompanySettingsIntegrationsPage() {
  return <CompanyIntegrationsSettings />
}

export function CompanySettingsUserGroupsPage() {
  return <UserGroupsSettings />
}

export function CompanySettingsUsersPage() {
  return <CompanyUsersSettings />
}

export function CompanySettingsRecruitingRulesPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <AttractionRulesSettings />
    </Box>
  )
}

export function CompanySettingsRecruitingOfferTemplatePage() {
  return <OfferTemplateSettings />
}

export function CompanySettingsRecruitingTemplatesPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Шаблоны рекрутинга
      </Text>
      <RecruitingTemplatesSettings />
    </Box>
  )
}

export function CompanySettingsRecruitingResponseTemplatesPage() {
  return <CandidateResponsesPage />
}

export function CompanySettingsRecruitingMessageTemplatesPage() {
  return (
    <Box className={styles.container}>
      <RecruitingSubpageBackBar />
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Шаблоны писем и сообщений
      </Text>
      <RecruitingMessageTemplatesSettings />
    </Box>
  )
}
