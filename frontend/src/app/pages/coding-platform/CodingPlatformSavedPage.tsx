import { Card, Flex, Text, Badge, Button } from '@radix-ui/themes'
import { Link } from '@/router-adapter'
import { SAVED_WORKSPACE_MOCKS } from '@/features/coding-platform/savedWorkspaceMocks'
import { CodingPlatformPageShell } from './CodingPlatformPageShell'

const KIND_LABEL: Record<string, string> = {
  snippet: 'Сниппет',
  project: 'Приложение',
}

export function CodingPlatformSavedPage() {
  return (
    <CodingPlatformPageShell
      title="Сохранённое"
      description="Черновики кода и мини-проекты (мок). Откройте в песочнице с подсказкой языка; позже — синхронизация с API и облаком."
    >
      <Flex direction="column" gap="3">
        {SAVED_WORKSPACE_MOCKS.map((item) => (
          <Card key={item.id} size="2" variant="surface">
            <Flex direction="column" gap="2" align="start">
              <Flex align="center" justify="between" gap="3" wrap="wrap" style={{ width: '100%' }}>
                <Text weight="bold" size="3">
                  {item.title}
                </Text>
                <Flex align="center" gap="2" wrap="wrap">
                  <Badge size="1" variant="soft" color="blue">
                    {KIND_LABEL[item.kind] ?? item.kind}
                  </Badge>
                  <Text size="1" color="gray">
                    обновлено {item.updatedAt}
                  </Text>
                </Flex>
              </Flex>
              <Text size="2" color="gray">
                {item.description}
              </Text>
              <Text size="1" color="gray">
                Язык: <code>{item.langHint}</code>
              </Text>
              <Button size="2" variant="soft" asChild>
                <Link href={`/coding-platform/playground?lang=${encodeURIComponent(item.langHint)}`}>
                  Открыть в песочнице
                </Link>
              </Button>
            </Flex>
          </Card>
        ))}
      </Flex>
    </CodingPlatformPageShell>
  )
}
