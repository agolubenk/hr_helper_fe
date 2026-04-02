/**
 * Layout раздела «Специализации».
 * Заглушка фазы 0: AppLayout + контейнер + Outlet.
 * В фазе 11 добавить SpecializationsProvider и TreeSidebar.
 */

import { Box } from '@radix-ui/themes'
import { Outlet, useLocation } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'
import { SpecializationsProvider } from '@/app/specializations/context/SpecializationsContext'
import { TreeSidebar } from '@/app/specializations/components/TreeSidebar'
import { PreviewSidebar } from '@/app/specializations/components/PreviewSidebar'
import styles from '@/app/pages/styles/SpecializationsPage.module.css'

const TAB_SEGMENTS = new Set(['info', 'grades', 'matrix', 'career', 'vacancies', 'allocation', 'preview'])

function getSelectedIdFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'specializations' || segments.length < 2) return null
  const id = segments[1]
  return id && !TAB_SEGMENTS.has(id) ? id : null
}

export function SpecializationsLayoutShell() {
  const pathname = useLocation().pathname
  const selectedId = getSelectedIdFromPathname(pathname)

  return (
    <AppLayout pageTitle="Специализации">
      <Box className={styles.container}>
        <SpecializationsProvider selectedId={selectedId}>
          <TreeSidebar />
          <Box className={styles.centerPanel}>
            <Outlet />
          </Box>
          <PreviewSidebar />
        </SpecializationsProvider>
      </Box>
    </AppLayout>
  )
}
