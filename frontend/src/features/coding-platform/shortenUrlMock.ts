import type { ShortenedLinkRecord, LinkBuilderLinkStatus } from './linkBuilderTypes'
import { validateAliasAgainstRecords } from './linkBuilderValidation'

const CODE_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomCode(length: number): string {
  let s = ''
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint8Array(length)
    cryptoObj.getRandomValues(buf)
    for (let i = 0; i < length; i++) {
      s += CODE_CHARS[buf[i] % CODE_CHARS.length]
    }
    return s
  }
  for (let i = 0; i < length; i++) {
    s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return s
}

function uniqueCode(existing: ShortenedLinkRecord[]): string {
  const slugs = new Set(
    existing.map((r) => {
      try {
        const path = new URL(r.shortUrl).pathname
        const p = path.split('/').filter(Boolean).pop()
        return p?.toLowerCase() ?? ''
      } catch {
        return ''
      }
    }),
  )
  for (let i = 0; i < 40; i++) {
    const c = randomCode(7)
    if (!slugs.has(c.toLowerCase())) return c
  }
  return randomCode(10)
}

export interface ShortenUrlMockInput {
  longUrl: string
  alias?: string | null
  expiresAt?: string | null
  maxClicks?: number | null
  status: LinkBuilderLinkStatus
  ogTitle?: string | null
  ogDescription?: string | null
  ogImageUrl?: string | null
}

export type ShortenUrlMockResult =
  | { ok: true; record: ShortenedLinkRecord }
  | { ok: false; error: string }

function sanitizePathSegment(raw: string | undefined): string {
  const t = (raw ?? 'l').trim().replace(/^\/+|\/+$/g, '')
  if (!t || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(t)) return 'l'
  return t.slice(0, 32)
}

function buildShortUrl(origin: string, pathSegment: string, slug: string): string {
  const seg = sanitizePathSegment(pathSegment)
  const u = new URL(`/${seg}/${encodeURIComponent(slug)}`, origin)
  return u.toString()
}

/**
 * Имитация API: задержка + генерация кода. Позже можно заменить на fetch.
 */
export async function shortenUrlMock(
  input: ShortenUrlMockInput,
  existing: ShortenedLinkRecord[],
  options?: { delayMs?: number; origin?: string; shortLinkPathSegment?: string },
): Promise<ShortenUrlMockResult> {
  const delayMs = options?.delayMs ?? 520
  const origin =
    options?.origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://example.com')
  const pathSegment = sanitizePathSegment(options?.shortLinkPathSegment)

  await new Promise((r) => setTimeout(r, delayMs))

  const aliasCheck = validateAliasAgainstRecords(input.alias ?? '', existing)
  if (!aliasCheck.ok) {
    return { ok: false, error: aliasCheck.error ?? 'Некорректный alias' }
  }

  const slug = aliasCheck.normalized ?? uniqueCode(existing)
  const shortUrl = buildShortUrl(origin, pathSegment, slug)

  const now = new Date().toISOString()
  const record: ShortenedLinkRecord = {
    id: `lb_${now}_${randomCode(6)}`,
    shortUrl,
    longUrl: input.longUrl,
    createdAt: now,
    expiresAt: input.expiresAt ?? null,
    maxClicks: input.maxClicks ?? null,
    clicks: 0,
    status: input.status,
    ogTitle: input.ogTitle != null && input.ogTitle.trim() !== '' ? input.ogTitle.trim() : null,
    ogDescription:
      input.ogDescription != null && input.ogDescription.trim() !== '' ? input.ogDescription.trim() : null,
    ogImageUrl: input.ogImageUrl != null && input.ogImageUrl.trim() !== '' ? input.ogImageUrl.trim() : null,
    alias: aliasCheck.normalized ?? null,
  }

  return { ok: true, record }
}
