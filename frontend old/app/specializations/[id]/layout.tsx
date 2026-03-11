'use client'

import { usePathname, useParams, useRouter } from 'next/navigation'
import { Box, Text, Tabs } from '@radix-ui/themes'
import { useSpecializations } from '../context/SpecializationsContext'
import styles from '../specializations.module.css'

const TAB_ROUTES = [
  { value: 'info', label: 'Основная информация' },
  { value: 'grades', label: 'Система грейдирования' },
  { value: 'matrix', label: 'Матрица навыков' },
  { value: 'career', label: 'Пути развития' },
  { value: 'vacancies', label: 'Связи с вакансиями' },
  { value: 'allocation', label: 'Распределение' },
  { value: 'preview', label: 'Как видят другие' },
] as const

export default function SpecializationIdLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { selectedNode } = useSpecializations()

  const segments = pathname?.split('/').filter(Boolean) ?? []
  const tabIndex = segments.indexOf(id)
  const currentTab = tabIndex >= 0 && segments[tabIndex + 1] ? segments[tabIndex + 1] : 'info'

  if (!id || !selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Специализация не найдена или не выбрана.</Text>
      </Box>
    )
  }

  const handleTabChange = (value: string) => {
    router.push(`/specializations/${id}/${value}`)
  }

  return (
    <Tabs.Root value={currentTab} onValueChange={handleTabChange} className={styles.centerTabsRoot}>
      <Tabs.List className={styles.centerTabsList}>
        {TAB_ROUTES.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Box className={styles.centerTabsContent}>{children}</Box>
    </Tabs.Root>
  )
}
