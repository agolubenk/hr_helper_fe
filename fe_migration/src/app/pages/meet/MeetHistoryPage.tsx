import { Text, Card } from '@radix-ui/themes'
import { MeetPageShell } from './MeetPageShell'

export function MeetHistoryPage() {
  return (
    <MeetPageShell title="История" description="Журнал прошедших встреч.">
      <Card>
        <Text size="2" color="gray">
          История пуста — после подключения бэкенда появятся записи и длительность встреч.
        </Text>
      </Card>
    </MeetPageShell>
  )
}
