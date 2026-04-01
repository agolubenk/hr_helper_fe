import { Box } from '@radix-ui/themes'
import { WorkItemsWorkspace } from '@/features/work-items'

/**
 * Страница «Задачи»: универсальный реестр рабочих элементов в духе example nodus-workitems.html
 * (Inbox, домены, список/доска/календарь, панель деталей, создание).
 */
export function TasksPage() {
  return (
    <Box
      style={{
        height: '100%',
        minHeight: 0,
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <WorkItemsWorkspace />
    </Box>
  )
}
