'use client'

import { Box, Flex, Text, Tabs } from '@radix-ui/themes'
import { CalendarIcon, ChatBubbleIcon, StarIcon } from '@radix-ui/react-icons'
import { useEffect, useMemo, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { GeneralTemplatesTab } from './components/GeneralTemplatesTab'
import { GradeTemplatesTab } from './components/GradeTemplatesTab'
import { SlotsTab } from './components/SlotsTab'
import styles from './CandidateResponsesPage.module.css'

type CandidateResponsesTab = 'general' | 'grades' | 'slots'

const DEFAULT_TAB: CandidateResponsesTab = 'general'

function parseTab(value: string | null): CandidateResponsesTab {
  if (value === 'general' || value === 'grades' || value === 'slots') return value
  return DEFAULT_TAB
}

function updateQueryParamTab(tab: CandidateResponsesTab) {
  const url = new URL(window.location.href)
  url.searchParams.set('tab', tab)
  window.history.replaceState(null, '', url.toString())
}

export function CandidateResponsesPage() {
  const { search } = useRouterState().location

  const tabFromUrl = useMemo(() => {
    const params = new URLSearchParams(search)
    return parseTab(params.get('tab'))
  }, [search])

  const [activeTab, setActiveTab] = useState<CandidateResponsesTab>(tabFromUrl)

  useEffect(() => {
    setActiveTab(tabFromUrl)
  }, [tabFromUrl])

  const handleTabChange = (value: string) => {
    const tab = parseTab(value)
    setActiveTab(tab)
    updateQueryParamTab(tab)
  }

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="4">
        <Text size="6" weight="bold">
          Ответы кандидатам
        </Text>

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
            <Tabs.Content value="general">
              <GeneralTemplatesTab />
            </Tabs.Content>
            <Tabs.Content value="grades">
              <GradeTemplatesTab />
            </Tabs.Content>
            <Tabs.Content value="slots">
              <SlotsTab />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Box>
  )
}

