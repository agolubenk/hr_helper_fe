import { Badge, Box, Card, Flex, Switch, Table, Text } from '@radix-ui/themes'
import type {
  OutboundEventDataClassification,
  OutboundEventDefinition,
} from '@/features/system-settings/types'
import styles from '../OutboundIntegrationsPanel.module.css'

function classificationVariant(
  c: OutboundEventDataClassification
): 'gray' | 'blue' | 'amber' | 'red' {
  switch (c) {
    case 'public':
      return 'gray'
    case 'internal':
      return 'blue'
    case 'confidential':
      return 'amber'
    case 'restricted':
      return 'red'
    default:
      return 'gray'
  }
}

interface OutboundIntegrationsEventCatalogSectionProps {
  catalog: OutboundEventDefinition[]
  onToggleGlobalDelivery: (eventId: string, enabled: boolean) => void
}

export function OutboundIntegrationsEventCatalogSection({
  catalog,
  onToggleGlobalDelivery,
}: OutboundIntegrationsEventCatalogSectionProps) {
  return (
    <Card size="1" variant="surface">
      <Text size="3" weight="bold" mb="1" as="div">
        Каталог исходящих событий
      </Text>
      <Text size="2" color="gray" mb="4" as="div" style={{ maxWidth: '70ch' }}>
        Тип события задаёт ключ доставки, версию полезной нагрузки и классификацию данных. Отключённые здесь
        типы не эмитируются платформой (мок); подписки на них остаются в списке, но доставка блокируется на
        уровне шины.
      </Text>
      <div className={styles.tableWrap}>
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell style={{ width: 56 }}>Вкл</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Ключ</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Категория</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Событие</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ width: 88 }}>Схема</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Данные</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Пример payload</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {catalog.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>
                  <Flex justify="center">
                    <Switch
                      checked={row.deliveryEnabled}
                      onCheckedChange={(v) => onToggleGlobalDelivery(row.id, Boolean(v))}
                    />
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text size="1" style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
                    {row.eventKey}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">{row.category}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" weight="medium">
                    {row.title}
                  </Text>
                  <Text size="1" color="gray" as="div">
                    {row.description}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="soft" size="1">
                    v{row.payloadSchemaVersion}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="soft" color={classificationVariant(row.dataClassification)} size="1">
                    {row.dataClassification}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Box className={styles.payloadPreviewBox}>
                    <pre>{row.samplePayloadPreview}</pre>
                  </Box>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </Card>
  )
}
