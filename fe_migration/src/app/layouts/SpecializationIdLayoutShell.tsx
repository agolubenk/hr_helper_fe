/**
 * Layout страницы одной специализации (/specializations/:id/...).
 * Заглушка фазы 0: табы по URL + Outlet.
 * В фазе 11 добавить useSpecializations, проверку selectedNode, контент табов.
 */

import { Box, Text, Tabs } from '@radix-ui/themes'
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom'

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

  if (!id) {
    return (
      <Box style={{ padding: 24, color: 'var(--gray-11)' }}>
        <Text size="2" color="gray">Специализация не найдена.</Text>
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
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      <Tabs.List
        style={{
          flexShrink: 0,
          borderBottom: '1px solid var(--gray-a6)',
          padding: '0 16px',
        }}
      >
        {TAB_ROUTES.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
        <Outlet />
      </Box>
    </Tabs.Root>
  )
}
