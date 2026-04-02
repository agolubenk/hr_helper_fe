const ALIAS_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/

export interface LongUrlValidationResult {
  ok: boolean
  normalized?: string
  error?: string
}

/** Добавляет https:// если протокол не указан (как в браузерных формах). */
export function normalizeLongUrlInput(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

export function validateLongUrl(raw: string): LongUrlValidationResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, error: 'Введите адрес ссылки' }
  }
  const normalized = normalizeLongUrlInput(trimmed)
  try {
    const u = new URL(normalized)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { ok: false, error: 'Разрешены только ссылки http и https' }
    }
    if (!u.hostname || u.hostname.length < 1) {
      return { ok: false, error: 'Укажите корректный домен' }
    }
    return { ok: true, normalized: u.toString() }
  } catch {
    return { ok: false, error: 'Неверный формат URL' }
  }
}

export interface AliasValidationResult {
  ok: boolean
  normalized?: string | null
  error?: string
}

export function extractShortLinkSlug(shortUrl: string): string | null {
  try {
    const path = new URL(shortUrl).pathname
    const parts = path.split('/').filter(Boolean)
    const last = parts[parts.length - 1]
    return last ?? null
  } catch {
    return null
  }
}

function validateAliasFormat(t: string): AliasValidationResult {
  if (t.length < 2) {
    return { ok: false, error: 'Alias слишком короткий (минимум 2 символа)' }
  }
  if (t.length > 48) {
    return { ok: false, error: 'Alias слишком длинный (максимум 48 символов)' }
  }
  if (!ALIAS_PATTERN.test(t)) {
    return {
      ok: false,
      error: 'Только латиница, цифры и дефис; не начинайте и не заканчивайте дефисом',
    }
  }
  return { ok: true, normalized: t }
}

/** Проверка alias: формат + уникальность slug среди записей (исключая `excludeId`). */
export function validateAliasAgainstRecords(
  raw: string | undefined,
  records: Array<{ id: string; alias: string | null; shortUrl: string }>,
  excludeId?: string,
): AliasValidationResult {
  const t = (raw ?? '').trim()
  if (!t) {
    return { ok: true, normalized: null }
  }
  const format = validateAliasFormat(t)
  if (!format.ok) {
    return format
  }
  const taken = new Set<string>()
  for (const r of records) {
    if (r.id === excludeId) continue
    if (r.alias) taken.add(r.alias.toLowerCase())
    const s = extractShortLinkSlug(r.shortUrl)
    if (s) taken.add(s.toLowerCase())
  }
  if (taken.has(t.toLowerCase())) {
    return { ok: false, error: 'Такой короткий код или alias уже занят' }
  }
  return { ok: true, normalized: t }
}
