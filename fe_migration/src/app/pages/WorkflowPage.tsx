import WorkflowHeader from '@/components/workflow/WorkflowHeader'
import WorkflowChat from '@/components/workflow/WorkflowChat'
import WorkflowSidebar from '@/components/workflow/WorkflowSidebar'
import SlotsPanel from '@/components/workflow/SlotsPanel'
import { Box, Flex } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import styles from '@/app/pages/styles/WorkflowPage.module.css'

const WORKFLOW_SIDEBAR_STORAGE_KEY = 'workflowSidebarOpen'

function getStoredSidebarOpen(): boolean {
  try {
    const saved = localStorage.getItem(WORKFLOW_SIDEBAR_STORAGE_KEY)
    return saved !== 'false'
  } catch {
    return true
  }
}

export function WorkflowPage() {
  const [slotsOpen, setSlotsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(getStoredSidebarOpen)

  useEffect(() => {
    try {
      localStorage.setItem(WORKFLOW_SIDEBAR_STORAGE_KEY, String(sidebarOpen))
    } catch {
      // ignore
    }
  }, [sidebarOpen])

  useEffect(() => {
    const contentElement = document.querySelector('[data-app-layout-content]') as HTMLElement
    if (contentElement) {
      const originalPaddingTop = contentElement.style.paddingTop
      contentElement.style.paddingTop = '8px'
      return () => {
        contentElement.style.paddingTop = originalPaddingTop || ''
      }
    }
  }, [])

  return (
    <Box data-tour="workflow-page" className={styles.workflowContainer}>
      <WorkflowHeader
        onSlotsClick={() => setSlotsOpen(!slotsOpen)}
        slotsOpen={slotsOpen}
      />
      {slotsOpen && (
        <Box className={styles.slotsContainer}>
          <SlotsPanel />
        </Box>
      )}
      <Flex gap="4" className={styles.mainContent}>
        <Box data-tour="workflow-chat" className={styles.chatColumn}>
          <WorkflowChat
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />
        </Box>
        {sidebarOpen && (
          <Box data-tour="workflow-sidebar" className={styles.sidebarColumn}>
            <WorkflowSidebar />
          </Box>
        )}
      </Flex>
    </Box>
  )
}
