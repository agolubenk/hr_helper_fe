/**
 * Layout раздела «Специализации».
 * Заглушка фазы 0: AppLayout + контейнер + Outlet.
 * В фазе 11 добавить SpecializationsProvider и TreeSidebar.
 */

import { Box } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'

export function SpecializationsLayoutShell() {
  return (
    <AppLayout pageTitle="Специализации">
      <Box style={{ padding: 16, minHeight: 200 }}>
        <Outlet />
      </Box>
    </AppLayout>
  )
}
