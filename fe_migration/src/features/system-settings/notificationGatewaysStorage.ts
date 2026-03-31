import type {
  EmailTransportId,
  MessengerTransportId,
  NotificationGateway,
  NotificationGatewayChannel,
  NotificationGatewaysState,
} from '@/features/system-settings/types'

const STORAGE_KEY = 'hr-helper-notification-gateways'

export const EMAIL_TRANSPORT_IDS: EmailTransportId[] = [
  'smtp',
  'sendgrid',
  'mailgun',
  'microsoft_graph',
]

export const MESSENGER_TRANSPORT_IDS: MessengerTransportId[] = [
  'telegram_bot',
  'slack_incoming',
  'mattermost_incoming',
]

const EMAIL_TRANSPORT_LABEL: Record<EmailTransportId, string> = {
  smtp: 'SMTP / корпоративный relay',
  sendgrid: 'SendGrid (HTTP API)',
  mailgun: 'Mailgun',
  microsoft_graph: 'Microsoft Graph (Exchange Online)',
}

const MESSENGER_TRANSPORT_LABEL: Record<MessengerTransportId, string> = {
  telegram_bot: 'Telegram Bot API',
  slack_incoming: 'Slack Incoming Webhook',
  mattermost_incoming: 'Mattermost Incoming Webhook',
}

export function getEmailTransportLabel(id: EmailTransportId): string {
  return EMAIL_TRANSPORT_LABEL[id]
}

export function getMessengerTransportLabel(id: MessengerTransportId): string {
  return MESSENGER_TRANSPORT_LABEL[id]
}

function isEmailTransport(x: string): x is EmailTransportId {
  return (EMAIL_TRANSPORT_IDS as string[]).includes(x)
}

function isMessengerTransport(x: string): x is MessengerTransportId {
  return (MESSENGER_TRANSPORT_IDS as string[]).includes(x)
}

function defaultTransportForChannel(ch: NotificationGatewayChannel): EmailTransportId | MessengerTransportId {
  return ch === 'email' ? 'smtp' : 'telegram_bot'
}

function inferLegacyTransport(
  channel: NotificationGatewayChannel,
  provider: string
): EmailTransportId | MessengerTransportId {
  const p = provider.toLowerCase()
  if (channel === 'messenger') {
    if (p.includes('slack')) return 'slack_incoming'
    if (p.includes('mattermost')) return 'mattermost_incoming'
    return 'telegram_bot'
  }
  if (p.includes('sendgrid')) return 'sendgrid'
  if (p.includes('mailgun')) return 'mailgun'
  if (p.includes('graph') || p.includes('microsoft') || p.includes('office')) return 'microsoft_graph'
  return 'smtp'
}

function normalizeGateway(raw: unknown): NotificationGateway | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>

  if (typeof o.id !== 'string' || typeof o.title !== 'string') return null

  const chRaw = o.channel
  if (chRaw === 'sms') return null
  if (chRaw !== 'email' && chRaw !== 'messenger') return null
  const channel = chRaw

  const legacyProvider = typeof o.provider === 'string' ? o.provider : ''
  const legacyHint =
    typeof o.connectionHint === 'string'
      ? o.connectionHint
      : typeof o.credentialsHint === 'string'
        ? o.credentialsHint
        : ''

  let transportRaw = typeof o.transport === 'string' ? o.transport : ''
  if (!transportRaw) {
    transportRaw = inferLegacyTransport(channel, legacyProvider)
  }

  let transport: EmailTransportId | MessengerTransportId = defaultTransportForChannel(channel)
  if (channel === 'email' && isEmailTransport(transportRaw)) transport = transportRaw
  if (channel === 'messenger' && isMessengerTransport(transportRaw)) transport = transportRaw

  const readStr = (k: string): string | undefined => (typeof o[k] === 'string' ? o[k] : undefined)

  return {
    id: o.id,
    channel,
    title: o.title,
    enabled: Boolean(o.enabled),
    usageNote: typeof o.usageNote === 'string' ? o.usageNote : '',
    transport,
    credentialsHint: legacyHint || readStr('credentialsHint') || '',
    smtpHost: readStr('smtpHost'),
    smtpPort: readStr('smtpPort'),
    smtpEncryption:
      o.smtpEncryption === 'none' || o.smtpEncryption === 'starttls' || o.smtpEncryption === 'tls'
        ? o.smtpEncryption
        : undefined,
    smtpUser: readStr('smtpUser'),
    fromEmail: readStr('fromEmail'),
    fromName: readStr('fromName'),
    replyTo: readStr('replyTo'),
    apiRegionHint: readStr('apiRegionHint'),
    graphTenantHint: readStr('graphTenantHint'),
    messengerTargetHint: readStr('messengerTargetHint'),
    webhookUrlHint: readStr('webhookUrlHint'),
  }
}

function defaultState(): NotificationGatewaysState {
  const gateways: NotificationGateway[] = [
    {
      id: 'gw-email-smtp',
      channel: 'email',
      title: 'Корпоративный SMTP',
      enabled: true,
      usageNote: 'Транзакционные письма, календарь, workflow',
      transport: 'smtp',
      credentialsHint: 'smtp-auth •••• (ротация через security)',
      smtpHost: 'smtp.internal.company',
      smtpPort: '587',
      smtpEncryption: 'starttls',
      smtpUser: 'noreply@internal.company',
      fromEmail: 'noreply@internal.company',
      fromName: 'HR Helper',
      replyTo: 'hr@internal.company',
    },
    {
      id: 'gw-email-api',
      channel: 'email',
      title: 'Облачный API (резерв)',
      enabled: false,
      usageNote: 'Фейловер, маркетинговые рассылки (отдельный поток в продукте)',
      transport: 'sendgrid',
      credentialsHint: 'SG.••••7124',
      apiRegionHint: 'EU',
      fromEmail: 'notify@company.example',
      fromName: 'HR Helper Cloud',
    },
    {
      id: 'gw-msg-telegram',
      channel: 'messenger',
      title: 'Служебный Telegram',
      enabled: true,
      usageNote: 'Быстрые алерты рекрутёрам, статусы интеграций',
      transport: 'telegram_bot',
      credentialsHint: 'bot token ••••9012',
      messengerTargetHint: 'chat_id · HR ops',
    },
  ]

  return {
    defaultTransactionalEmailGatewayId: 'gw-email-smtp',
    defaultInternalMessengerGatewayId: 'gw-msg-telegram',
    gateways,
  }
}

function migrateFromUnknown(raw: unknown): NotificationGatewaysState {
  if (Array.isArray(raw)) {
    const gateways = raw
      .map((r) => normalizeGateway(r))
      .filter((r): r is NotificationGateway => r !== null)
    const firstEmail = gateways.find((g) => g.channel === 'email' && g.enabled)?.id ?? null
    const firstMsg = gateways.find((g) => g.channel === 'messenger' && g.enabled)?.id ?? null
    return {
      defaultTransactionalEmailGatewayId: firstEmail,
      defaultInternalMessengerGatewayId: firstMsg,
      gateways: gateways.length > 0 ? gateways : defaultState().gateways,
    }
  }

  if (typeof raw === 'object' && raw !== null && Array.isArray((raw as NotificationGatewaysState).gateways)) {
    const s = raw as NotificationGatewaysState
    const gateways = s.gateways
      .map((r) => normalizeGateway(r))
      .filter((r): r is NotificationGateway => r !== null)
    return {
      defaultTransactionalEmailGatewayId:
        typeof s.defaultTransactionalEmailGatewayId === 'string'
          ? s.defaultTransactionalEmailGatewayId
          : null,
      defaultInternalMessengerGatewayId:
        typeof s.defaultInternalMessengerGatewayId === 'string'
          ? s.defaultInternalMessengerGatewayId
          : null,
      gateways: gateways.length > 0 ? gateways : defaultState().gateways,
    }
  }

  return defaultState()
}

export function readNotificationGatewaysState(): NotificationGatewaysState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return migrateFromUnknown(JSON.parse(raw) as unknown)
  } catch {
    return defaultState()
  }
}

export function writeNotificationGatewaysState(state: NotificationGatewaysState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function newEmailGateway(): NotificationGateway {
  const id = `gw-email-${Date.now()}`
  return {
    id,
    channel: 'email',
    title: 'Новый почтовый шлюз',
    enabled: false,
    usageNote: '',
    transport: 'smtp',
    credentialsHint: '',
    smtpHost: '',
    smtpPort: '587',
    smtpEncryption: 'starttls',
    smtpUser: '',
    fromEmail: '',
    fromName: '',
  }
}

export function newMessengerGateway(): NotificationGateway {
  const id = `gw-msg-${Date.now()}`
  return {
    id,
    channel: 'messenger',
    title: 'Новый мессенджер-шлюз',
    enabled: false,
    usageNote: '',
    transport: 'telegram_bot',
    credentialsHint: '',
    messengerTargetHint: '',
    webhookUrlHint: '',
  }
}
