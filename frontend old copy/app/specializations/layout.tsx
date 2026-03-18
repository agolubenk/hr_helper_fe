'use client'

import { usePathname } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { Box } from '@radix-ui/themes'
import { SpecializationsProvider } from './context/SpecializationsContext'
import TreeSidebar from './components/TreeSidebar'
import styles from './specializations.module.css'

const TAB_SEGMENTS = new Set(['info', 'grades', 'matrix', 'career', 'vacancies', 'allocation', 'preview'])

/** Извлекает id специализации из пути: /specializations/[id]/... или /specializations/[id] */
function getSelectedIdFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'specializations' || segments.length < 2) return null
  const id = segments[1]
  return id && !TAB_SEGMENTS.has(id) ? id : null
}

export default function SpecializationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const selectedId = getSelectedIdFromPathname(pathname ?? '')

  return (
    <AppLayout pageTitle="Специализации">
      <Box className={styles.container}>
        <SpecializationsProvider selectedId={selectedId}>
          <TreeSidebar />
          <Box className={styles.centerPanel}>{children}</Box>
        </SpecializationsProvider>
      </Box>
    </AppLayout>
  )
}
