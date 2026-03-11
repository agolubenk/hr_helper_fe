'use client'

import { Box, Flex } from '@radix-ui/themes'
import { useState } from 'react'
import { WorkflowHeader } from './components/WorkflowHeader'
import { WorkflowChat } from './components/WorkflowChat'
import { WorkflowSidebar } from './components/WorkflowSidebar'
import { SlotsPanel } from './components/SlotsPanel'
import styles from './WorkflowPage.module.css'

export function WorkflowPage() {
  const [slotsOpen, setSlotsOpen] = useState(false)

  return (
    <Box data-tour="workflow-page" className={styles.workflowContainer}>
      <WorkflowHeader onSlotsClick={() => setSlotsOpen((v) => !v)} slotsOpen={slotsOpen} />

      {slotsOpen && (
        <Box className={styles.slotsContainer}>
          <SlotsPanel />
        </Box>
      )}

      <Flex gap="4" className={styles.mainContent}>
        <Box data-tour="workflow-chat" className={styles.chatColumn}>
          <WorkflowChat />
        </Box>
        <Box data-tour="workflow-sidebar" className={styles.sidebarColumn}>
          <WorkflowSidebar />
        </Box>
      </Flex>
    </Box>
  )
}

