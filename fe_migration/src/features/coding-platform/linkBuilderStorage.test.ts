import { describe, it, expect, beforeEach } from 'vitest'
import { LINK_BUILDER_STORAGE_KEY, readLinkBuilderHistory, writeLinkBuilderHistory } from './linkBuilderStorage'
import type { ShortenedLinkRecord } from './linkBuilderTypes'

const sample: ShortenedLinkRecord = {
  id: '1',
  shortUrl: 'https://x/l/a',
  longUrl: 'https://y',
  createdAt: '2026-01-01T00:00:00.000Z',
  expiresAt: null,
  maxClicks: null,
  clicks: 0,
  status: 'active',
  ogTitle: null,
  ogDescription: null,
  ogImageUrl: null,
  alias: null,
}

describe('linkBuilderStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips JSON', () => {
    writeLinkBuilderHistory([sample])
    expect(readLinkBuilderHistory()).toEqual([sample])
  })

  it('ignores corrupt storage', () => {
    localStorage.setItem(LINK_BUILDER_STORAGE_KEY, 'not-json')
    expect(readLinkBuilderHistory()).toEqual([])
  })
})
