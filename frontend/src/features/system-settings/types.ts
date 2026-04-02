import type { AppLocale } from '@/features/system-settings/localeCatalog'

export type ModuleEnableMap = Record<string, boolean>

export type { AppLocale }

export interface LocalizationSettingsState {
  /** Языки, доступные в пространстве (интерфейс и переключатель) — минимум один */
  enabledLocales: AppLocale[]
  interfaceLocale: AppLocale
  fallbackLocale: AppLocale
  /** Показывать ключи строк в UI (для контент-менеджеров) */
  showTranslationKeys: boolean
}

export interface TranslationOverrideRow {
  id: string
  key: string
  /** Переводы по всем известным локалям приложения (в т.ч. выключенным — данные сохраняются) */
  values: Record<AppLocale, string>
}

export type SandboxEnvironmentKind = 'production_mirror' | 'staging' | 'isolated'

export interface SandboxSettingsState {
  mode: SandboxEnvironmentKind
  baseUrl: string
  apiKeyMasked: string
  organizationId: string
  allowWrite: boolean
}

export type NotificationGatewayChannel = 'email' | 'messenger'

export type EmailTransportId = 'smtp' | 'sendgrid' | 'mailgun' | 'microsoft_graph'

export type MessengerTransportId = 'telegram_bot' | 'slack_incoming' | 'mattermost_incoming'

/** Один исходящий шлюз (почта или мессенджер). Секреты в продукте — только через безопасное хранилище; здесь маски и мок-проверки. */
export interface NotificationGateway {
  id: string
  channel: NotificationGatewayChannel
  title: string
  enabled: boolean
  /** Назначение для администраторов: какие сценарии крутить через этот шлюз */
  usageNote: string
  transport: EmailTransportId | MessengerTransportId
  /** Маска пароля / API key / bot token (как в песочнице — не «голые» секреты) */
  credentialsHint: string
  smtpHost?: string
  smtpPort?: string
  smtpEncryption?: 'none' | 'starttls' | 'tls'
  smtpUser?: string
  fromEmail?: string
  fromName?: string
  replyTo?: string
  apiRegionHint?: string
  graphTenantHint?: string
  messengerTargetHint?: string
  webhookUrlHint?: string
}

export interface NotificationGatewaysState {
  /** Основной шлюз системных писем (приглашения, восстановление доступа, напоминания календаря) */
  defaultTransactionalEmailGatewayId: string | null
  /** Куда слать внутренние служебные алерты в мессенджер, если включено в сценариях */
  defaultInternalMessengerGatewayId: string | null
  gateways: NotificationGateway[]
}

/** Глобальные параметры исходящих HTTP-вызовов (интеграции «наружу»). */
export interface OutboundHttpDefaults {
  enabled: boolean
  /** Таймаут запроса, сек */
  timeoutSeconds: number
  /** Макс. параллельных исходящих запросов на воркер (мок) */
  maxConcurrent: number
  /** Примечание к User-Agent / корпоративному прокси */
  egressNote: string
  /** Маска общего HMAC/подписи для исходящих webhooks системы */
  signingSecretHint: string
}

export type OutboundEventDataClassification = 'public' | 'internal' | 'confidential' | 'restricted'

/** Описание типа события для каталога исходящих вебхуков (контракт, мок). */
export interface OutboundEventDefinition {
  id: string
  eventKey: string
  category: string
  title: string
  description: string
  payloadSchemaVersion: string
  samplePayloadPreview: string
  /** Глобально разрешить эмиссию этого типа (feature-flag уровня платформы). */
  deliveryEnabled: boolean
  dataClassification: OutboundEventDataClassification
}

export type OutboundWebhookPayloadFormat = 'json' | 'ndjson'

/** Подписка внешней системы на события HR Helper (исходящий webhook с нашей стороны). */
export interface OutboundWebhookSubscription {
  id: string
  name: string
  /** Маска целевого URL */
  targetUrlHint: string
  /** Дублирует агрегат ключей для обратной совместимости и отладки в storage */
  eventTypes: string
  /** Выбранные строки каталога (id из реестра) */
  subscribedEventIds: string[]
  /** Дополнительные ключи событий, не из каталога (через запятую в одной строке) */
  additionalEventKeysRaw: string
  /** Секрет для подписи тела (маска) */
  signingSecretHint: string
  enabled: boolean
  /** Повторы при 5xx/таймауте */
  maxRetries: number
  /** Базовая задержка между повторами, сек ( мок backoff = linear * attempt ) */
  retryBackoffSeconds: number
  payloadFormat: OutboundWebhookPayloadFormat
  /** Заметка о нестанд.: X-Request-ID, корпоративные заголовки (маски) */
  customHeadersNote: string
  /** Обёртка envelope: id, occurredAt, schemaVersion */
  includeEnvelope: boolean
}

export type OutboundDeliveryStatus = 'delivered' | 'failed' | 'pending'

/** Строка журнала доставки (мок, только для UI). */
export interface OutboundDeliveryLogEntry {
  id: string
  at: string
  webhookId: string
  webhookName: string
  eventKey: string
  status: OutboundDeliveryStatus
  httpStatus?: number
  durationMs?: number
}

export interface OutboundIntegrationsState {
  httpDefaults: OutboundHttpDefaults
  /** Переопределение deliveryEnabled по id события из каталога */
  eventDeliveryOverrides: Record<string, boolean>
  webhooks: OutboundWebhookSubscription[]
}
