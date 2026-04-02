import { describe, expect, it } from 'vitest'
import { OUTBOUND_EVENT_CATALOG_DEFAULTS } from '@/features/system-settings/outboundEventCatalogDefaults'
import { parseEventTypesToCatalogIds } from '@/features/system-settings/outboundIntegrationsStorage'

describe('parseEventTypesToCatalogIds', () => {
  it('maps known keys to catalog ids and collects unknown tokens', () => {
    const catalog = OUTBOUND_EVENT_CATALOG_DEFAULTS
    const { subscribedEventIds, unmatched } = parseEventTypesToCatalogIds(
      'candidate.stage_changed, foo.bar, vacancy.published',
      catalog
    )
    expect(unmatched).toEqual(['foo.bar'])
    expect(subscribedEventIds.length).toBe(2)
    const keys = subscribedEventIds
      .map((id) => catalog.find((e) => e.id === id)?.eventKey)
      .sort()
    expect(keys).toEqual(['candidate.stage_changed', 'vacancy.published'])
  })

  it('dedupes repeated keys', () => {
    const catalog = OUTBOUND_EVENT_CATALOG_DEFAULTS
    const { subscribedEventIds } = parseEventTypesToCatalogIds(
      'audit.login_failed, audit.login_failed',
      catalog
    )
    expect(subscribedEventIds.length).toBe(1)
  })
})
