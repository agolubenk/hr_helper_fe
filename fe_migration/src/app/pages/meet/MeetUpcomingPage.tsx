import { Text, Card } from '@radix-ui/themes'
import { MeetPageShell } from './MeetPageShell'

export function MeetUpcomingPage() {
  return (
    <MeetPageShell title="Предстоящие" description="Запланированные миты и напоминания.">
      <Card>
        <Text size="2" color="gray">
          Нет запланированных встреч — раздел заполнится из календаря или API.
        </Text>
      </Card>
    </MeetPageShell>
  )
}
