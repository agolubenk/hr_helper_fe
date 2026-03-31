import {
  OUTBOUND_EVENT_CATALOG_DEFAULTS,
  buildOutboundEventCatalog,
} from '@/features/system-settings/outboundEventCatalogDefaults'
import type {
  OutboundEventDefinition,
  OutboundIntegrationsState,
  OutboundHttpDefaults,
  OutboundWebhookSubscription,
  OutboundWebhookPayloadFormat,
} from '@/features/system-settings/types'

const STORAGE_KEY = 'hr-helper-outbound-integrations'

const DEFAULT_HTTP: OutboundHttpDefaults = {
  enabled: true,
  timeoutSeconds: 30,
  maxConcurrent: 20,
  egressNote: '',
  signingSecretHint: 'whsec ••••••8921',
}

const EVENT_KEY_TO_ID = new Map(
  OUTBOUND_EVENT_CATALOG_DEFAULTS.map((e) => [e.eventKey, e.id] as const)
)

export function parseEventTypesToCatalogIds(
  eventTypes: string,
  catalog: OutboundEventDefinition[]
): { subscribedEventIds: string[]; unmatched: string[] } {
  const keyToId = new Map(catalog.map((e) => [e.eventKey, e.id] as const))
  const tokens = eventTypes
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean)
  const subscribedEventIds: string[] = []
  const unmatched: string[] = []
  for (const t of tokens) {
    const id = keyToId.get(t)
    if (id) subscribedEventIds.push(id)
    else unmatched.push(t)
  }
  return { subscribedEventIds: [...new Set(subscribedEventIds)], unmatched }
}

function deriveEventTypesField(
  w: OutboundWebhookSubscription,
  catalog: OutboundEventDefinition[]
): string {
  const keysFromIds = w.subscribedEventIds
    .map((id) => catalog.find((e) => e.id === id)?.eventKey)
    .filter((k): k is string => Boolean(k))
  const extra = w.additionalEventKeysRaw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return [...new Set([...keysFromIds, ...extra])].join(', ')
}

function normalizePayloadFormat(raw: unknown): OutboundWebhookPayloadFormat {
  return raw === 'ndjson' ? 'ndjson' : 'json'
}

function normalizeWebhook(
  raw: unknown,
  catalog: OutboundEventDefinition[]
): OutboundWebhookSubscription | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.name !== 'string') return null
  const retries = Number(o.maxRetries)
  const backoff = Number(o.retryBackoffSeconds)
  const eventTypesStr = typeof o.eventTypes === 'string' ? o.eventTypes : ''

  let subscribedEventIds: string[] = Array.isArray(o.subscribedEventIds)
    ? o.subscribedEventIds.filter((x): x is string => typeof x === 'string')
    : []
  let additionalEventKeysRaw =
    typeof o.additionalEventKeysRaw === 'string' ? o.additionalEventKeysRaw : ''

  if (subscribedEventIds.length === 0 && eventTypesStr.trim()) {
    const parsed = parseEventTypesToCatalogIds(eventTypesStr, catalog)
    subscribedEventIds = parsed.subscribedEventIds
    if (parsed.unmatched.length) {
      additionalEventKeysRaw = [additionalEventKeysRaw, parsed.unmatched.join(', ')]
        .filter(Boolean)
        .join(', ')
    }
  }

  return {
    id: o.id,
    name: o.name,
    targetUrlHint: typeof o.targetUrlHint === 'string' ? o.targetUrlHint : '',
    eventTypes: eventTypesStr,
    subscribedEventIds,
    additionalEventKeysRaw,
    signingSecretHint: typeof o.signingSecretHint === 'string' ? o.signingSecretHint : '',
    enabled: Boolean(o.enabled),
    maxRetries: Number.isFinite(retries) && retries >= 0 ? Math.min(10, Math.floor(retries)) : 3,
    retryBackoffSeconds:
      Number.isFinite(backoff) && backoff >= 1 ? Math.min(600, Math.floor(backoff)) : 30,
    payloadFormat: normalizePayloadFormat(o.payloadFormat),
    customHeadersNote: typeof o.customHeadersNote === 'string' ? o.customHeadersNote : '',
    includeEnvelope: typeof o.includeEnvelope === 'boolean' ? o.includeEnvelope : true,
  }
}

function normalizeOverrides(raw: unknown): Record<string, boolean> {
  if (typeof raw !== 'object' || raw === null) return {}
  const o = raw as Record<string, unknown>
  const out: Record<string, boolean> = {}
  for (const id of Object.keys(o)) {
    if (typeof o[id] === 'boolean') {
      const known = OUTBOUND_EVENT_CATALOG_DEFAULTS.some((e) => e.id === id)
      if (known) out[id] = o[id]!
    }
  }
  return out
}

function normalizeHttp(raw: unknown): OutboundHttpDefaults {
  if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_HTTP }
  const o = raw as Record<string, unknown>
  const timeout = Number(o.timeoutSeconds)
  const concurrent = Number(o.maxConcurrent)
  return {
    enabled: Boolean(o.enabled),
    timeoutSeconds: Number.isFinite(timeout) && timeout > 0 ? Math.min(300, Math.floor(timeout)) : DEFAULT_HTTP.timeoutSeconds,
    maxConcurrent:
      Number.isFinite(concurrent) && concurrent > 0 ? Math.min(200, Math.floor(concurrent)) : DEFAULT_HTTP.maxConcurrent,
    egressNote: typeof o.egressNote === 'string' ? o.egressNote : '',
    signingSecretHint:
      typeof o.signingSecretHint === 'string' ? o.signingSecretHint : DEFAULT_HTTP.signingSecretHint,
  }
}

const DEFAULT_WEBHOOKS: OutboundWebhookSubscription[] = [
  {
    id: 'wh-1',
    name: 'Корпоративный n8n',
    targetUrlHint: 'https://n8n.internal.company/webhook/hr-helper•••',
    eventTypes: 'candidate.stage_changed, vacancy.status_changed',
    subscribedEventIds: (
      ['candidate.stage_changed', 'vacancy.status_changed'] as const
    )
      .map((k) => EVENT_KEY_TO_ID.get(k))
      .filter((id): id is string => Boolean(id)),
    additionalEventKeysRaw: '',
    signingSecretHint: 'sh••••9012',
    enabled: true,
    maxRetries: 3,
    retryBackoffSeconds: 30,
    payloadFormat: 'json',
    customHeadersNote: 'X-Corp-Trace: •••',
    includeEnvelope: true,
  },
  {
    id: 'wh-2',
    name: 'Резерв SIEM (алерты безопасности)',
    targetUrlHint: 'https://siem.partner.example/ingest/hr•••',
    eventTypes: 'audit.login_failed, integration.api_error',
    subscribedEventIds: (['audit.login_failed', 'integration.api_error'] as const)
      .map((k) => EVENT_KEY_TO_ID.get(k))
      .filter((id): id is string => Boolean(id)),
    additionalEventKeysRaw: '',
    signingSecretHint: '',
    enabled: false,
    maxRetries: 5,
    retryBackoffSeconds: 60,
    payloadFormat: 'ndjson',
    customHeadersNote: '',
    includeEnvelope: true,
  },
]

function parseStored(raw: unknown): OutboundIntegrationsState {
  const catalog = OUTBOUND_EVENT_CATALOG_DEFAULTS
  if (typeof raw === 'object' && raw !== null && 'httpDefaults' in raw && 'webhooks' in raw) {
    const o = raw as Record<string, unknown>
    const hooks = Array.isArray(o.webhooks)
      ? (o.webhooks as unknown[]).map((h) => normalizeWebhook(h, catalog)).filter((w): w is OutboundWebhookSubscription => w !== null)
      : []
    const eventDeliveryOverrides = 'eventDeliveryOverrides' in o ? normalizeOverrides(o.eventDeliveryOverrides) : {}
    const mergedCatalog = buildOutboundEventCatalog(eventDeliveryOverrides)
    const fixedHooks = hooks.map((w) => ({
      ...w,
      eventTypes: deriveEventTypesField(w, mergedCatalog),
    }))
    return {
      httpDefaults: normalizeHttp(o.httpDefaults),
      eventDeliveryOverrides,
      webhooks: fixedHooks.length > 0 ? fixedHooks : [...DEFAULT_WEBHOOKS],
    }
  }
  return {
    httpDefaults: { ...DEFAULT_HTTP },
    eventDeliveryOverrides: {},
    webhooks: [...DEFAULT_WEBHOOKS],
  }
}

/** Сериализация подписок перед записью: актуализирует поле eventTypes. */
export function withDerivedEventTypes(state: OutboundIntegrationsState): OutboundIntegrationsState {
  const catalog = buildOutboundEventCatalog(state.eventDeliveryOverrides)
  return {
    ...state,
      webhooks: state.webhooks.map((w) => ({
      ...w,
      eventTypes: deriveEventTypesField(w, catalog),
    })),
  }
}

export function readOutboundIntegrationsState(): OutboundIntegrationsState {
  if (typeof window === 'undefined') {
    return { httpDefaults: { ...DEFAULT_HTTP }, eventDeliveryOverrides: {}, webhooks: [...DEFAULT_WEBHOOKS] }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { httpDefaults: { ...DEFAULT_HTTP }, eventDeliveryOverrides: {}, webhooks: [...DEFAULT_WEBHOOKS] }
    return parseStored(JSON.parse(raw) as unknown)
  } catch {
    return { httpDefaults: { ...DEFAULT_HTTP }, eventDeliveryOverrides: {}, webhooks: [...DEFAULT_WEBHOOKS] }
  }
}

export function writeOutboundIntegrationsState(state: OutboundIntegrationsState): void {
  if (typeof window === 'undefined') return
  try {
    const payload = withDerivedEventTypes(state)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function newWebhookSubscription(): OutboundWebhookSubscription {
  return {
    id: `wh-${Date.now()}`,
    name: 'Новая подписка',
    targetUrlHint: '',
    eventTypes: '',
    subscribedEventIds: [],
    additionalEventKeysRaw: '',
    signingSecretHint: '',
    enabled: false,
    maxRetries: 3,
    retryBackoffSeconds: 30,
    payloadFormat: 'json',
    customHeadersNote: '',
    includeEnvelope: true,
  }
}
