/**
 * CandidateResponsesPage — шаблоны ответов кандидатам и слоты.
 * Без AppLayout (обёртка в App.tsx). useSearchParams в Suspense.
 */

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from '@/router-adapter'
import { Box, Flex, Text, Tabs } from '@radix-ui/themes'
import { ChatBubbleIcon, StarIcon, CalendarIcon } from '@radix-ui/react-icons'
import GeneralTemplatesTab from '@/components/candidate-responses/GeneralTemplatesTab'
import GradeTemplatesTab from '@/components/candidate-responses/GradeTemplatesTab'
import SlotsTab from '@/components/candidate-responses/SlotsTab'
import styles from './styles/CandidateResponsesPage.module.css'

function CandidateResponsesPageContent() {
  const [searchParams] = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'general' | 'grades' | 'slots'>(
    (tabParam === 'general' || tabParam === 'grades' || tabParam === 'slots') ? tabParam : 'general'
  )

  useEffect(() => {
    if (tabParam && (tabParam === 'general' || tabParam === 'grades' || tabParam === 'slots')) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'general' | 'grades' | 'slots')
    router.push(`/candidate-responses?tab=${value}`)
  }

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="4">
        <Text size="6" weight="bold">Ответы кандидатам</Text>
        <Tabs.Root value={activeTab} onValueChange={handleTabChange} className={styles.tabs}>
          <Tabs.List className={styles.tabList}>
            <Tabs.Trigger value="general" className={styles.tab}>
              <ChatBubbleIcon width={16} height={16} />
              Общие
            </Tabs.Trigger>
            <Tabs.Trigger value="grades" className={styles.tab}>
              <StarIcon width={16} height={16} />
              По грейдам
            </Tabs.Trigger>
            <Tabs.Trigger value="slots" className={styles.tab}>
              <CalendarIcon width={16} height={16} />
              Слоты
            </Tabs.Trigger>
          </Tabs.List>
          <Box className={styles.tabContent}>
            <Tabs.Content value="general"><GeneralTemplatesTab /></Tabs.Content>
            <Tabs.Content value="grades"><GradeTemplatesTab /></Tabs.Content>
            <Tabs.Content value="slots"><SlotsTab /></Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Box>
  )
}

export function CandidateResponsesPage() {
  return (
    <Suspense fallback={<Box p="4"><Text>Загрузка…</Text></Box>}>
      <CandidateResponsesPageContent />
    </Suspense>
  )
}
