/**
 * Layout страницы одной специализации (/specializations/:id/...).
 * Заглушка фазы 0: табы по URL + Outlet.
 * В фазе 11 добавить useSpecializations, проверку selectedNode, контент табов.
 */

import { Box, Text, Tabs } from '@radix-ui/themes'
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSpecializations } from '@/app/specializations/context/SpecializationsContext'
import styles from '@/app/pages/styles/SpecializationsPage.module.css'

const TAB_ROUTES = [
  { value: 'info', label: 'Основная информация' },
  { value: 'grades', label: 'Система грейдирования' },
  { value: 'matrix', label: 'Матрица навыков' },
  { value: 'career', label: 'Пути развития' },
  { value: 'vacancies', label: 'Связи с вакансиями' },
  { value: 'allocation', label: 'Распределение' },
  { value: 'preview', label: 'Как видят другие' },
] as const

export function SpecializationIdLayoutShell() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const idIndex = pathSegments.indexOf('specializations') >= 0
    ? pathSegments.indexOf(id ?? '') 
    : -1
  const currentTab =
    idIndex >= 0 && pathSegments[idIndex + 1] && TAB_ROUTES.some((t) => t.value === pathSegments[idIndex + 1])
      ? pathSegments[idIndex + 1]
      : 'info'
  const { selectedNode } = useSpecializations()

  if (!id || !selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Специализация не найдена или не выбрана.</Text>
      </Box>
    )
  }

  const handleTabChange = (value: string) => {
    navigate(`/specializations/${id}/${value}`)
  }

  return (
    <Tabs.Root
      value={currentTab}
      onValueChange={handleTabChange}
      className={styles.centerTabsRoot}
    >
      <Tabs.List className={styles.centerTabsList}>
        {TAB_ROUTES.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Box className={styles.centerTabsContent}>
        <Outlet />
      </Box>
    </Tabs.Root>
  )
}
