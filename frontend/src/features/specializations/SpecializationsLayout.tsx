'use client'

import { Outlet, useRouterState } from '@tanstack/react-router'
import { Box } from '@radix-ui/themes'
import { SpecializationsProvider } from './context/SpecializationsContext'
import { TreeSidebar } from './components/TreeSidebar'
import styles from './SpecializationsLayout.module.css'

function getSelectedIdFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'specializations' || segments.length < 2) return null
  return segments[1] || null
}

export function SpecializationsLayout() {
  const { pathname } = useRouterState().location
  const selectedId = getSelectedIdFromPathname(pathname ?? '')

  return (
    <Box className={styles.container}>
      <SpecializationsProvider selectedId={selectedId}>
        <TreeSidebar />
        <Box className={styles.centerPanel}>
          <Box className={styles.centerContent}>
            <Outlet />
          </Box>
        </Box>
      </SpecializationsProvider>
    </Box>
  )
}

