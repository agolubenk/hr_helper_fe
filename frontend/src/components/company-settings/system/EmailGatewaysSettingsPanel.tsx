import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Select,
  Separator,
  Switch,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'
import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Link } from '@/router-adapter'
import { useToast } from '@/components/Toast/ToastContext'
import type { NotificationGateway, NotificationGatewaysState } from '@/features/system-settings/types'
import {
  EMAIL_TRANSPORT_IDS,
  getEmailTransportLabel,
  getMessengerTransportLabel,
  MESSENGER_TRANSPORT_IDS,
  newEmailGateway,
  newMessengerGateway,
  readNotificationGatewaysState,
  writeNotificationGatewaysState,
} from '@/features/system-settings/notificationGatewaysStorage'
import styles from './EmailGatewaysSettingsPanel.module.css'

function updateGateway(
  state: NotificationGatewaysState,
  id: string,
  patch: Partial<NotificationGateway>
): NotificationGatewaysState {
  return {
    ...state,
    gateways: state.gateways.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  }
}

function removeGateway(state: NotificationGatewaysState, id: string): NotificationGatewaysState {
  return {
    ...state,
    defaultTransactionalEmailGatewayId:
      state.defaultTransactionalEmailGatewayId === id
        ? null
        : state.defaultTransactionalEmailGatewayId,
    defaultInternalMessengerGatewayId:
      state.defaultInternalMessengerGatewayId === id ? null : state.defaultInternalMessengerGatewayId,
    gateways: state.gateways.filter((g) => g.id !== id),
  }
}

export function EmailGatewaysSettingsPanel() {
  const { showSuccess, showError } = useToast()
  const [state, setState] = useState<NotificationGatewaysState>(() => readNotificationGatewaysState())
  const [testingId, setTestingId] = useState<string | null>(null)

  const emailGateways = state.gateways.filter((g) => g.channel === 'email')
  const messengerGateways = state.gateways.filter((g) => g.channel === 'messenger')

  const save = () => {
    writeNotificationGatewaysState(state)
    showSuccess('Сохранено', 'Настройки шлюзов записаны локально.')
  }

  const testGateway = (gw: NotificationGateway) => {
    if (!gw.enabled) {
      showError('Проверка', 'Включите шлюз перед проверкой или сохраните черновик.')
      return
    }
    setTestingId(gw.id)
    window.setTimeout(() => {
      setTestingId(null)
      const ok =
        gw.channel === 'email'
          ? Boolean(gw.fromEmail?.includes('@') || gw.transport !== 'smtp' || (gw.smtpHost?.length ?? 0) > 3)
          : Boolean((gw.credentialsHint?.length ?? 0) > 2)
      if (ok) {
        showSuccess('Проверка', `Шлюз «${gw.title}»: тестовая доставка (мок) успешна.`)
      } else {
        showError('Проверка', 'Заполните обязательные поля (от кого, хост SMTP или токен).')
      }
    }, 700)
  }

  const renderEmailFields = (g: NotificationGateway) => (
    <>
      <Grid columns={{ initial: '1', sm: '2' }} gap="3" width="100%">
        <Box>
          <Text size="2" weight="medium" mb="2" as="div">
            Транспорт
          </Text>
          <Select.Root
            value={g.transport}
            onValueChange={(v) => {
              if (!EMAIL_TRANSPORT_IDS.includes(v as (typeof EMAIL_TRANSPORT_IDS)[number])) return
              setState((s) => updateGateway(s, g.id, { transport: v as NotificationGateway['transport'] }))
            }}
          >
            <Select.Trigger />
            <Select.Content position="popper">
              {EMAIL_TRANSPORT_IDS.map((tid) => (
                <Select.Item key={tid} value={tid}>
                  {getEmailTransportLabel(tid)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>
        <Box>
          <Text size="2" weight="medium" mb="2" as="div">
            Маска учётных данных
          </Text>
          <TextField.Root
            value={g.credentialsHint}
            onChange={(e) =>
              setState((s) => updateGateway(s, g.id, { credentialsHint: e.target.value }))
            }
            placeholder="Пароль SMTP / API key (маска)"
          />
        </Box>
      </Grid>

      {g.transport === 'smtp' ? (
        <Grid columns={{ initial: '1', sm: '2' }} gap="3" width="100%">
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Хост SMTP
            </Text>
            <TextField.Root
              value={g.smtpHost ?? ''}
              onChange={(e) => setState((s) => updateGateway(s, g.id, { smtpHost: e.target.value }))}
              placeholder="smtp.example.com"
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Порт
            </Text>
            <TextField.Root
              value={g.smtpPort ?? ''}
              onChange={(e) => setState((s) => updateGateway(s, g.id, { smtpPort: e.target.value }))}
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Шифрование
            </Text>
            <Select.Root
              value={g.smtpEncryption ?? 'starttls'}
              onValueChange={(v) => {
                const enc = v === 'none' || v === 'starttls' || v === 'tls' ? v : 'starttls'
                setState((s) => updateGateway(s, g.id, { smtpEncryption: enc }))
              }}
            >
              <Select.Trigger />
              <Select.Content position="popper">
                <Select.Item value="none">Нет</Select.Item>
                <Select.Item value="starttls">STARTTLS</Select.Item>
                <Select.Item value="tls">TLS (SMTPS)</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Пользователь SMTP
            </Text>
            <TextField.Root
              value={g.smtpUser ?? ''}
              onChange={(e) => setState((s) => updateGateway(s, g.id, { smtpUser: e.target.value }))}
            />
          </Box>
        </Grid>
      ) : null}

      {(g.transport === 'sendgrid' || g.transport === 'mailgun') && (
        <Box>
          <Text size="2" weight="medium" mb="2" as="div">
            Регион API (если применимо)
          </Text>
          <TextField.Root
            value={g.apiRegionHint ?? ''}
            onChange={(e) => setState((s) => updateGateway(s, g.id, { apiRegionHint: e.target.value }))}
            placeholder="EU / US"
          />
        </Box>
      )}

      {g.transport === 'microsoft_graph' && (
        <Box>
          <Text size="2" weight="medium" mb="2" as="div">
            Tenant ID (Azure AD)
          </Text>
          <TextField.Root
            value={g.graphTenantHint ?? ''}
            onChange={(e) => setState((s) => updateGateway(s, g.id, { graphTenantHint: e.target.value }))}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </Box>
      )}

      <Grid columns={{ initial: '1', sm: '2' }} gap="3" width="100%">
        <Box>
          <Text size="2" weight="medium" mb="2" as="div">
            Адрес From
          </Text>
          <TextField.Root
            value={g.fromEmail ?? ''}
            onChange={(e) => setState((s) => updateGateway(s, g.id, { fromEmail: e.target.value }))}
            placeholder="noreply@company.com"
          />
        </Box>
        <Box>
          <Text size="2" weight="medium" mb="2" as="div">
            Имя отправителя
          </Text>
          <TextField.Root
            value={g.fromName ?? ''}
            onChange={(e) => setState((s) => updateGateway(s, g.id, { fromName: e.target.value }))}
          />
        </Box>
        <Box style={{ gridColumn: '1 / -1' }}>
          <Text size="2" weight="medium" mb="2" as="div">
            Reply-To (опционально)
          </Text>
          <TextField.Root
            value={g.replyTo ?? ''}
            onChange={(e) => setState((s) => updateGateway(s, g.id, { replyTo: e.target.value }))}
          />
        </Box>
      </Grid>
    </>
  )

  const renderMessengerFields = (g: NotificationGateway) => (
    <Grid columns={{ initial: '1', sm: '2' }} gap="3" width="100%">
      <Box style={{ gridColumn: '1 / -1' }}>
        <Text size="2" weight="medium" mb="2" as="div">
          Транспорт
        </Text>
        <Select.Root
          value={g.transport}
          onValueChange={(v) => {
            if (!MESSENGER_TRANSPORT_IDS.includes(v as (typeof MESSENGER_TRANSPORT_IDS)[number])) return
            setState((s) => updateGateway(s, g.id, { transport: v as NotificationGateway['transport'] }))
          }}
        >
          <Select.Trigger />
          <Select.Content position="popper">
            {MESSENGER_TRANSPORT_IDS.map((tid) => (
              <Select.Item key={tid} value={tid}>
                {getMessengerTransportLabel(tid)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>
      <Box style={{ gridColumn: '1 / -1' }}>
        <Text size="2" weight="medium" mb="2" as="div">
          Маска токена / секрета
        </Text>
        <TextField.Root
          type="password"
          value={g.credentialsHint}
          onChange={(e) =>
            setState((s) => updateGateway(s, g.id, { credentialsHint: e.target.value }))
          }
          placeholder="Bot token или signing secret (маска)"
        />
      </Box>
      <Box>
        <Text size="2" weight="medium" mb="2" as="div">
          Получатель / чат
        </Text>
        <TextField.Root
          value={g.messengerTargetHint ?? ''}
          onChange={(e) =>
            setState((s) => updateGateway(s, g.id, { messengerTargetHint: e.target.value }))
          }
          placeholder="chat_id, @channel, team alias"
        />
      </Box>
      {(g.transport === 'slack_incoming' || g.transport === 'mattermost_incoming') && (
        <Box>
          <Text size="2" weight="medium" mb="2" as="div">
            URL вебхука (маска)
          </Text>
          <TextField.Root
            value={g.webhookUrlHint ?? ''}
            onChange={(e) =>
              setState((s) => updateGateway(s, g.id, { webhookUrlHint: e.target.value }))
            }
            placeholder="https://hooks…/••••"
          />
        </Box>
      )}
    </Grid>
  )

  const renderGatewayCard = (g: NotificationGateway) => (
    <Card key={g.id} size="2" variant="surface" className={styles.gatewayCard}>
      <Flex align="start" justify="between" gap="3" wrap="wrap" mb="3">
        <Box style={{ flex: '1 1 240px' }}>
          <Text size="2" weight="medium" mb="2" as="div">
            Название подключения
          </Text>
          <TextField.Root
            value={g.title}
            onChange={(e) => setState((s) => updateGateway(s, g.id, { title: e.target.value }))}
          />
        </Box>
        <Flex align="center" gap="3">
          <Flex align="center" gap="2">
            <Switch
              checked={g.enabled}
              onCheckedChange={(v) => setState((s) => updateGateway(s, g.id, { enabled: Boolean(v) }))}
            />
            <Text size="2">Включён</Text>
          </Flex>
          <Button
            size="2"
            variant="soft"
            color="red"
            onClick={() => setState((s) => removeGateway(s, g.id))}
          >
            <TrashIcon width={14} height={14} />
          </Button>
        </Flex>
      </Flex>
      <Box mb="3">
        <Text size="2" weight="medium" mb="2" as="div">
          Назначение и сценарии
        </Text>
        <TextArea
          value={g.usageNote}
          onChange={(e) => setState((s) => updateGateway(s, g.id, { usageNote: e.target.value }))}
          placeholder="Например: письма с календаря, офферы, внутренние алерты"
          rows={2}
        />
      </Box>
      {g.channel === 'email' ? renderEmailFields(g) : renderMessengerFields(g)}
      <Flex mt="4" gap="2" wrap="wrap">
        <Button variant="soft" loading={testingId === g.id} onClick={() => testGateway(g)}>
          Проверить доставку (мок)
        </Button>
      </Flex>
    </Card>
  )

  return (
    <Flex direction="column" gap="4">
      <Callout.Root color="amber">
        <Callout.Text>
          Корпоративные исходящие каналы дополняют{' '}
          <Link href="/company-settings/integrations">интеграции компании</Link>
          {' '}и личные подключения в{' '}
          <Link href="/account/profile?tab=integrations">профиле</Link>. Секреты в бою уйдут в защищённое
          хранилище; здесь — маски учётных данных, как в разделе «Песочница».
        </Callout.Text>
      </Callout.Root>

      <Card size="1" variant="surface">
        <Text size="3" weight="bold" mb="1" as="div">
          Маршрутизация по умолчанию
        </Text>
        <Text size="2" color="gray" mb="3" as="div" style={{ maxWidth: '60ch' }}>
          Укажите шлюз для системных писем и опционально — мессенджер для служебных оповещений (автоматизации и
          сценарии подхватят привязку на стороне API).
        </Text>
        <Grid columns={{ initial: '1', sm: '2' }} gap="4">
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Транзакционная почта по умолчанию
            </Text>
            <Select.Root
              value={state.defaultTransactionalEmailGatewayId ?? '__none__'}
              onValueChange={(v) =>
                setState((s) => ({
                  ...s,
                  defaultTransactionalEmailGatewayId: v === '__none__' ? null : v,
                }))
              }
            >
              <Select.Trigger />
              <Select.Content position="popper">
                <Select.Item value="__none__">— не выбрано —</Select.Item>
                {emailGateways.map((g) => (
                  <Select.Item key={g.id} value={g.id}>
                    {g.title}
                    {!g.enabled ? ' (выкл.)' : ''}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Мессенджер для служебных алертов
            </Text>
            <Select.Root
              value={state.defaultInternalMessengerGatewayId ?? '__none__'}
              onValueChange={(v) =>
                setState((s) => ({
                  ...s,
                  defaultInternalMessengerGatewayId: v === '__none__' ? null : v,
                }))
              }
            >
              <Select.Trigger />
              <Select.Content position="popper">
                <Select.Item value="__none__">— не выбрано —</Select.Item>
                {messengerGateways.map((g) => (
                  <Select.Item key={g.id} value={g.id}>
                    {g.title}
                    {!g.enabled ? ' (выкл.)' : ''}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Grid>
      </Card>

      <Box>
        <Flex align="center" justify="between" gap="3" mb="3" wrap="wrap">
          <Text size="3" weight="bold">
            Исходящая почта
          </Text>
          <Button
            variant="soft"
            onClick={() =>
              setState((s) => ({ ...s, gateways: [...s.gateways, newEmailGateway()] }))
            }
          >
            <PlusIcon width={14} height={14} /> Добавить почтовый шлюз
          </Button>
        </Flex>
        <Flex direction="column" gap="3">
          {emailGateways.length === 0 ? (
            <Text size="2" color="gray">
              Нет настроенных почтовых шлюзов.
            </Text>
          ) : (
            emailGateways.map(renderGatewayCard)
          )}
        </Flex>
      </Box>

      <Separator size="4" />

      <Box>
        <Flex align="center" justify="between" gap="3" mb="3" wrap="wrap">
          <Text size="3" weight="bold">
            Мессенджеры и вебхуки
          </Text>
          <Button
            variant="soft"
            onClick={() =>
              setState((s) => ({ ...s, gateways: [...s.gateways, newMessengerGateway()] }))
            }
          >
            <PlusIcon width={14} height={14} /> Добавить мессенджер
          </Button>
        </Flex>
        <Flex direction="column" gap="3">
          {messengerGateways.length === 0 ? (
            <Text size="2" color="gray">
              Нет мессенджер-шлюзов.
            </Text>
          ) : (
            messengerGateways.map(renderGatewayCard)
          )}
        </Flex>
      </Box>

      <div className={styles.actions}>
        <Button onClick={save}>Сохранить всё</Button>
      </div>
    </Flex>
  )
}
