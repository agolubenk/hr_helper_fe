import { Text, Card } from '@radix-ui/themes'
import { MeetPageShell } from './MeetPageShell'

export function MeetNewLinksPage() {
  return (
    <MeetPageShell title="Новые ссылки" description="Свежие приглашения и одноразовые ссылки на комнаты.">
      <Card>
        <Text size="2" color="gray">
          Пока нет новых ссылок — данные подставятся из API позже.
        </Text>
      </Card>
    </MeetPageShell>
  )
}
