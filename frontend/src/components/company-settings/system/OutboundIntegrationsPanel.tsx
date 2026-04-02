import { Box, Button, Callout, Flex, Tabs } from '@radix-ui/themes'
import { useMemo, useState } from 'react'
import { useValidatedSearchParam } from '@/shared/hooks/useUrlSearchState'
import { useToast } from '@/components/Toast/ToastContext'
import { buildOutboundEventCatalog } from '@/features/system-settings/outboundEventCatalogDefaults'
import type { OutboundIntegrationsState, OutboundWebhookSubscription } from '@/features/system-settings/types'
import {
  newWebhookSubscription,
  readOutboundIntegrationsState,
  writeOutboundIntegrationsState,
} from '@/features/system-settings/outboundIntegrationsStorage'
import { OutboundIntegrationsDeliverySection } from './outbound/OutboundIntegrationsDeliverySection'
import { OutboundIntegrationsEventCatalogSection } from './outbound/OutboundIntegrationsEventCatalogSection'
import { OutboundIntegrationsHttpSection } from './outbound/OutboundIntegrationsHttpSection'
import { OutboundIntegrationsWebhooksSection } from './outbound/OutboundIntegrationsWebhooksSection'
import styles from './OutboundIntegrationsPanel.module.css'

const OUTBOUND_SECTIONS = ['http', 'events', 'webhooks', 'delivery'] as const

export function OutboundIntegrationsPanel() {
  const { showSuccess, showError } = useToast()
  const [state, setState] = useState<OutboundIntegrationsState>(() => readOutboundIntegrationsState())
  const [testing, setTesting] = useState(false)
  const [section, setSection] = useValidatedSearchParam('tab', OUTBOUND_SECTIONS, 'http', {
    omitWhenDefault: true,
    replace: true,
  })

  const catalog = useMemo(
    () => buildOutboundEventCatalog(state.eventDeliveryOverrides),
    [state.eventDeliveryOverrides]
  )

  const save = () => {
    writeOutboundIntegrationsState(state)
    showSuccess('Сохранено', 'Параметры исходящих интеграций записаны локально.')
  }

  const testSampleWebhook = () => {
    const first = state.webhooks.find((w) => w.enabled && w.targetUrlHint.length > 8)
    if (!first) {
      showError('Проверка', 'Включите подписку с заполненным URL (маска).')
      return
    }
    setTesting(true)
    window.setTimeout(() => {
      setTesting(false)
      showSuccess('Проверка', `Тестовая доставка на «${first.name}» (мок) выполнена.`)
    }, 600)
  }

  const updateWebhook = (id: string, patch: Partial<OutboundWebhookSubscription>) => {
    setState((s) => ({
      ...s,
      webhooks: s.webhooks.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }))
  }

  const toggleSubscribedEvent = (webhookId: string, eventId: string, checked: boolean) => {
    setState((s) => ({
      ...s,
      webhooks: s.webhooks.map((w) => {
        if (w.id !== webhookId) return w
        const next = new Set(w.subscribedEventIds)
        if (checked) next.add(eventId)
        else next.delete(eventId)
        return { ...w, subscribedEventIds: [...next] }
      }),
    }))
  }

  const setGlobalEventDelivery = (eventId: string, enabled: boolean) => {
    setState((s) => ({
      ...s,
      eventDeliveryOverrides: { ...s.eventDeliveryOverrides, [eventId]: enabled },
    }))
  }

  return (
    <Flex direction="column" gap="4">
      <Callout.Root color="amber">
        <Callout.Text>
          Исходящие вызовы во внешние системы и подписки на события (POST на ваш endpoint). Ниже —
          каталог типов событий, глобальные HTTP-лимиты и гибкие настройки подписок. Ключи API и контракты —
          в «Интеграции и API»; данные сохраняются локально (мок).
        </Callout.Text>
      </Callout.Root>

      <Tabs.Root
        value={section}
        onValueChange={(v) => setSection(v as (typeof OUTBOUND_SECTIONS)[number])}
      >
        <Tabs.List wrap="wrap" className={styles.tabList}>
          <Tabs.Trigger value="http">HTTP по умолчанию</Tabs.Trigger>
          <Tabs.Trigger value="events">Каталог событий</Tabs.Trigger>
          <Tabs.Trigger value="webhooks">Подписки</Tabs.Trigger>
          <Tabs.Trigger value="delivery">Журнал доставки</Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value="http">
            <Flex direction="column" gap="4">
              <OutboundIntegrationsHttpSection
                httpDefaults={state.httpDefaults}
                onPatch={(patch) =>
                  setState((s) => ({ ...s, httpDefaults: { ...s.httpDefaults, ...patch } }))
                }
              />
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="events">
            <OutboundIntegrationsEventCatalogSection
              catalog={catalog}
              onToggleGlobalDelivery={setGlobalEventDelivery}
            />
          </Tabs.Content>

          <Tabs.Content value="webhooks">
            <OutboundIntegrationsWebhooksSection
              webhooks={state.webhooks}
              catalog={catalog}
              onUpdate={updateWebhook}
              onRemove={(index) =>
                setState((s) => ({
                  ...s,
                  webhooks: s.webhooks.filter((_, i) => i !== index),
                }))
              }
              onAdd={() =>
                setState((s) => ({ ...s, webhooks: [...s.webhooks, newWebhookSubscription()] }))
              }
              onToggleSubscribedEvent={toggleSubscribedEvent}
              testing={testing}
              onTestSample={testSampleWebhook}
            />
          </Tabs.Content>

          <Tabs.Content value="delivery">
            <OutboundIntegrationsDeliverySection />
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      <div className={styles.actions}>
        <Button onClick={save}>Сохранить</Button>
      </div>
    </Flex>
  )
}
