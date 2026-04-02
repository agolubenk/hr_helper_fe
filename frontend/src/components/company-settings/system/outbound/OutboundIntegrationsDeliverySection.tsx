import { Badge, Card, Table, Text } from '@radix-ui/themes'
import { OUTBOUND_DELIVERY_LOG_MOCK } from '@/features/system-settings/outboundEventCatalogDefaults'
import type { OutboundDeliveryStatus } from '@/features/system-settings/types'
import styles from '../OutboundIntegrationsPanel.module.css'

function statusBadge(status: OutboundDeliveryStatus): { label: string; color: 'green' | 'red' | 'amber' } {
  switch (status) {
    case 'delivered':
      return { label: 'Доставлено', color: 'green' }
    case 'failed':
      return { label: 'Ошибка', color: 'red' }
    case 'pending':
      return { label: 'В очереди', color: 'amber' }
    default:
      return { label: '—', color: 'amber' }
  }
}

export function OutboundIntegrationsDeliverySection() {
  return (
    <Card size="1" variant="surface">
      <Text size="3" weight="bold" mb="1" as="div">
        Журнал доставки (мок)
      </Text>
      <Text size="2" color="gray" mb="4" as="div" style={{ maxWidth: '70ch' }}>
        Имитация последних попыток POST на endpoint-ы подписок. После подключения к бэкенду таблица будет
        приходить из API с пагинацией и фильтрами по событию и подписке.
      </Text>
      <div className={styles.tableWrap}>
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Время (UTC)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Подписка</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Событие</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>HTTP</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>мс</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {OUTBOUND_DELIVERY_LOG_MOCK.map((row) => {
              const st = statusBadge(row.status)
              return (
                <Table.Row key={row.id}>
                  <Table.Cell>
                    <Text size="2">{row.at.replace('T', ' ').replace(/\.\d{3}Z$/, ' Z')}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{row.webhookName}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="1" style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
                      {row.eventKey}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={st.color} variant="soft" size="1">
                      {st.label}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{row.httpStatus != null ? String(row.httpStatus) : '—'}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{row.durationMs != null ? String(row.durationMs) : '—'}</Text>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </div>
    </Card>
  )
}
