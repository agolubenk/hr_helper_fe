import { Text, Card } from '@radix-ui/themes'
import { MeetPageShell } from './MeetPageShell'

export function MeetArchivePage() {
  return (
    <MeetPageShell title="Архивы" description="Долгосрочное хранение записей и материалов.">
      <Card>
        <Text size="2" color="gray">
          Архив пуст — мок-экран до появления реальных данных.
        </Text>
      </Card>
    </MeetPageShell>
  )
}
