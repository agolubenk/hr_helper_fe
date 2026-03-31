import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shortenUrlMock } from './shortenUrlMock'

describe('shortenUrlMock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns error for duplicate alias', async () => {
    const p = shortenUrlMock(
      {
        longUrl: 'https://b.test',
        alias: 'taken',
        status: 'active',
      },
      [
        {
          id: 'x',
          shortUrl: 'https://app.test/l/taken',
          longUrl: 'https://a.test',
          createdAt: '2026-01-01',
          expiresAt: null,
          maxClicks: null,
          clicks: 0,
          status: 'active',
          ogTitle: null,
          ogDescription: null,
          ogImageUrl: null,
          alias: null,
        },
      ],
      { delayMs: 100, origin: 'https://app.test' },
    )
    await vi.advanceTimersByTimeAsync(100)
    const r = await p
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('занят')
  })

  it('creates record with slug and shortUrl', async () => {
    const p = shortenUrlMock(
      { longUrl: 'https://long.test/foo', status: 'draft' },
      [],
      { delayMs: 50, origin: 'https://app.test' },
    )
    await vi.advanceTimersByTimeAsync(50)
    const r = await p
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.record.longUrl).toBe('https://long.test/foo')
      expect(r.record.shortUrl.startsWith('https://app.test/l/')).toBe(true)
      expect(r.record.status).toBe('draft')
    }
  })
})
