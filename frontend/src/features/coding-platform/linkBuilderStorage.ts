import type { ShortenedLinkRecord } from './linkBuilderTypes'

export const LINK_BUILDER_STORAGE_KEY = 'hr-helper-link-builder-history-v1'

const MAX_ITEMS = 200

function isLinkStatus(x: unknown): x is ShortenedLinkRecord['status'] {
  return x === 'active' || x === 'draft' || x === 'disabled'
}

function parseRecord(x: unknown): ShortenedLinkRecord | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  const id = o.id
  const shortUrl = o.shortUrl
  const longUrl = o.longUrl
  const createdAt = o.createdAt
  if (typeof id !== 'string' || typeof shortUrl !== 'string' || typeof longUrl !== 'string' || typeof createdAt !== 'string') {
    return null
  }
  const status = o.status
  if (!isLinkStatus(status)) return null
  const clicks = typeof o.clicks === 'number' && Number.isFinite(o.clicks) ? Math.max(0, o.clicks) : 0
  const expiresAt = o.expiresAt === null || typeof o.expiresAt === 'string' ? o.expiresAt : null
  const maxClicks =
    o.maxClicks === null || (typeof o.maxClicks === 'number' && Number.isFinite(o.maxClicks)) ? (o.maxClicks as number | null) : null
  return {
    id,
    shortUrl,
    longUrl,
    createdAt,
    expiresAt,
    maxClicks,
    clicks,
    status,
    ogTitle: typeof o.ogTitle === 'string' ? o.ogTitle : null,
    ogDescription: typeof o.ogDescription === 'string' ? o.ogDescription : null,
    ogImageUrl: typeof o.ogImageUrl === 'string' ? o.ogImageUrl : null,
    alias: typeof o.alias === 'string' ? o.alias : null,
  }
}

export function readLinkBuilderHistory(): ShortenedLinkRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LINK_BUILDER_STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    const out: ShortenedLinkRecord[] = []
    for (const item of data) {
      const r = parseRecord(item)
      if (r) out.push(r)
    }
    return out
  } catch {
    return []
  }
}

export function writeLinkBuilderHistory(links: ShortenedLinkRecord[]): void {
  if (typeof window === 'undefined') return
  const trimmed = links.slice(0, MAX_ITEMS)
  localStorage.setItem(LINK_BUILDER_STORAGE_KEY, JSON.stringify(trimmed))
}
