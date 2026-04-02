import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Select,
  Switch,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'
import { useMemo } from 'react'
import type { OutboundEventDefinition, OutboundWebhookSubscription } from '@/features/system-settings/types'
import styles from '../OutboundIntegrationsPanel.module.css'

interface OutboundIntegrationsWebhooksSectionProps {
  webhooks: OutboundWebhookSubscription[]
  catalog: OutboundEventDefinition[]
  onUpdate: (id: string, patch: Partial<OutboundWebhookSubscription>) => void
  onRemove: (index: number) => void
  onAdd: () => void
  onToggleSubscribedEvent: (webhookId: string, eventId: string, checked: boolean) => void
  testing: boolean
  onTestSample: () => void
}

export function OutboundIntegrationsWebhooksSection({
  webhooks,
  catalog,
  onUpdate,
  onRemove,
  onAdd,
  onToggleSubscribedEvent,
  testing,
  onTestSample,
}: OutboundIntegrationsWebhooksSectionProps) {
  const byCategory = useMemo(() => {
    const order = [...new Set(catalog.map((e) => e.category))].sort()
    return order.map((cat) => [cat, catalog.filter((e) => e.category === cat)] as const)
  }, [catalog])

  return (
    <Card size="1" variant="surface">
      <Text size="3" weight="bold" mb="1" as="div">
        Подписки (исходящие вебхуки)
      </Text>
      <Text size="2" color="gray" mb="4" as="div" style={{ maxWidth: '70ch' }}>
        Для каждой подписки выберите типы из каталога и при необходимости добавьте произвольные ключи
        событий. Формат тела, обёртка и backoff настраиваются отдельно от глобальных HTTP-лимитов.
      </Text>

      <Flex direction="column" gap="4">
        {webhooks.map((w, index) => (
          <Card key={w.id} variant="surface" className={styles.webhookCard}>
            <Grid columns={{ initial: '1', md: '2' }} gap="3">
              <Box>
                <Text size="2" weight="medium" mb="2" as="div">
                  Название
                </Text>
                <TextField.Root value={w.name} onChange={(e) => onUpdate(w.id, { name: e.target.value })} />
              </Box>
              <Box>
                <Text size="2" weight="medium" mb="2" as="div">
                  URL (маска)
                </Text>
                <TextField.Root
                  value={w.targetUrlHint}
                  onChange={(e) => onUpdate(w.id, { targetUrlHint: e.target.value })}
                  placeholder="https://…"
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" mb="2" as="div">
                  Секрет подписи
                </Text>
                <TextField.Root
                  type="password"
                  value={w.signingSecretHint}
                  onChange={(e) => onUpdate(w.id, { signingSecretHint: e.target.value })}
                />
              </Box>
              <Flex align="end" gap="4" wrap="wrap">
                <Box>
                  <Text size="2" weight="medium" mb="2" as="div">
                    Повторы (max)
                  </Text>
                  <TextField.Root
                    type="number"
                    value={String(w.maxRetries)}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10)
                      onUpdate(w.id, {
                        maxRetries: Number.isFinite(n) ? Math.min(10, Math.max(0, n)) : w.maxRetries,
                      })
                    }}
                    style={{ width: 96 }}
                  />
                </Box>
                <Box>
                  <Text size="2" weight="medium" mb="2" as="div">
                    Backoff, сек
                  </Text>
                  <TextField.Root
                    type="number"
                    value={String(w.retryBackoffSeconds)}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10)
                      onUpdate(w.id, {
                        retryBackoffSeconds: Number.isFinite(n)
                          ? Math.min(600, Math.max(1, n))
                          : w.retryBackoffSeconds,
                      })
                    }}
                    style={{ width: 96 }}
                  />
                </Box>
                <Flex align="center" gap="2" pb="1">
                  <Switch
                    checked={w.enabled}
                    onCheckedChange={(v) => onUpdate(w.id, { enabled: Boolean(v) })}
                  />
                  <Text size="2">Вкл.</Text>
                </Flex>
              </Flex>

              <Box style={{ gridColumn: '1 / -1' }}>
                <Text size="2" weight="medium" mb="2" as="div">
                  Формат полезной нагрузки
                </Text>
                <Flex gap="4" wrap="wrap" align="center">
                  <Select.Root
                    value={w.payloadFormat}
                    onValueChange={(v) =>
                      onUpdate(w.id, { payloadFormat: v === 'ndjson' ? 'ndjson' : 'json' })
                    }
                  >
                    <Select.Trigger style={{ minWidth: 220 }} />
                    <Select.Content position="popper">
                      <Select.Item value="json">JSON (один объект на событие)</Select.Item>
                      <Select.Item value="ndjson">NDJSON (поток строк)</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <Flex align="center" gap="2">
                    <Switch
                      checked={w.includeEnvelope}
                      onCheckedChange={(v) => onUpdate(w.id, { includeEnvelope: Boolean(v) })}
                    />
                    <Text size="2">Обёртка envelope (id, occurredAt, schemaVersion)</Text>
                  </Flex>
                </Flex>
              </Box>

              <Box style={{ gridColumn: '1 / -1' }}>
                <Text size="2" weight="medium" mb="2" as="div">
                  Нестандартные заголовки (заметка, маски)
                </Text>
                <TextArea
                  value={w.customHeadersNote}
                  onChange={(e) => onUpdate(w.id, { customHeadersNote: e.target.value })}
                  rows={2}
                  placeholder="Например: X-Partner-Key: ••••; X-Request-ID из шины"
                />
              </Box>

              <Box style={{ gridColumn: '1 / -1' }}>
                <Text size="2" weight="medium" mb="2" as="div">
                  События из каталога
                </Text>
                {byCategory.map(([category, events]) => (
                  <Box key={category} mb="3">
                    <Text size="1" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>
                      {category}
                    </Text>
                    <Flex direction="column" gap="2" className={styles.eventCheckboxList}>
                      {events.map((ev) => {
                        const checked = w.subscribedEventIds.includes(ev.id)
                        const globallyOff = !ev.deliveryEnabled
                        return (
                          <Flex key={ev.id} align="start" gap="2">
                            <Checkbox
                              checked={checked}
                              disabled={globallyOff}
                              onCheckedChange={(v) =>
                                onToggleSubscribedEvent(w.id, ev.id, v === true)
                              }
                            />
                            <Flex direction="column" gap="1" style={{ flex: 1 }}>
                              <Flex align="center" gap="2" wrap="wrap">
                                <Text size="2">{ev.title}</Text>
                                {globallyOff ? (
                                  <Badge color="amber" size="1" variant="soft">
                                    выключено в каталоге
                                  </Badge>
                                ) : null}
                              </Flex>
                              <Text size="1" color="gray" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                                {ev.eventKey}
                              </Text>
                            </Flex>
                          </Flex>
                        )
                      })}
                    </Flex>
                  </Box>
                ))}
              </Box>

              <Box style={{ gridColumn: '1 / -1' }}>
                <Text size="2" weight="medium" mb="2" as="div">
                  Дополнительные ключи (не из каталога)
                </Text>
                <TextField.Root
                  value={w.additionalEventKeysRaw}
                  onChange={(e) => onUpdate(w.id, { additionalEventKeysRaw: e.target.value })}
                  placeholder="custom.partner.event_a, legacy.hr.signal"
                />
              </Box>
            </Grid>

            <Flex justify="end" mt="3">
              <Button size="1" variant="soft" color="red" onClick={() => onRemove(index)}>
                <TrashIcon width={14} height={14} /> Удалить подписку
              </Button>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Flex mt="4" gap="2" wrap="wrap" align="center">
        <Button variant="soft" onClick={onAdd}>
          <PlusIcon width={14} height={14} /> Добавить подписку
        </Button>
        <Button variant="soft" loading={testing} onClick={onTestSample}>
          Тест первой активной подписки (мок)
        </Button>
      </Flex>
    </Card>
  )
}
