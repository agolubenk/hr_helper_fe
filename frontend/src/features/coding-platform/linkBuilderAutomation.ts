import type { Dispatch, SetStateAction } from 'react'
import type { LinkBuilderExpiryMode } from './linkBuilderTypes'
import type { LinkBuilderAutomationRule } from './linkBuilderSettingsTypes'
import { daysFromNowDatetimeLocal } from './linkBuilderFormat'

export interface LinkBuilderUrlContext {
  hostname: string
  pathname: string
  pathLast: string
  fullUrl: string
  hostPathKey: string
}

export function buildUrlContext(normalizedUrl: string): LinkBuilderUrlContext | null {
  try {
    const u = new URL(normalizedUrl)
    const parts = u.pathname.split('/').filter(Boolean)
    const pathLast = parts[parts.length - 1] ?? ''
    const hostPathKey = `${u.hostname.toLowerCase()}${u.pathname}`.replace(/\/+$/, '')
    return {
      hostname: u.hostname,
      pathname: u.pathname,
      pathLast,
      fullUrl: u.toString(),
      hostPathKey,
    }
  } catch {
    return null
  }
}

export function renderLinkBuilderTemplate(template: string, ctx: LinkBuilderUrlContext): string {
  return template
    .replace(/\{hostname\}/gi, ctx.hostname)
    .replace(/\{pathname\}/gi, ctx.pathname)
    .replace(/\{pathLast\}/gi, ctx.pathLast)
    .replace(/\{fullUrl\}/gi, ctx.fullUrl)
}

/** Alias из последнего сегмента пути (латиница/цифры/дефис). */
export function slugifyPathSegmentForAlias(raw: string): string {
  const t = raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return t.slice(0, 48)
}

export function ruleMatchesUrl(rule: LinkBuilderAutomationRule, ctx: LinkBuilderUrlContext): boolean {
  if (!rule.enabled || !rule.pattern.trim()) return false
  const p = rule.pattern.trim()

  switch (rule.matchKind) {
    case 'host':
      return ctx.hostname.toLowerCase() === p.toLowerCase()
    case 'host-path-prefix': {
      const key = ctx.hostPathKey.toLowerCase()
      const want = p.toLowerCase().replace(/\/+$/, '')
      return key.startsWith(want)
    }
    case 'regex':
      try {
        return new RegExp(p, 'i').test(ctx.fullUrl)
      } catch {
        return false
      }
    default:
      return false
  }
}

/** Первое подходящее правило по приоритету. */
export function pickAutomationRule(rules: LinkBuilderAutomationRule[], ctx: LinkBuilderUrlContext): LinkBuilderAutomationRule | null {
  const sorted = [...rules].filter((r) => r.enabled).sort((a, b) => a.priority - b.priority)
  for (const r of sorted) {
    if (ruleMatchesUrl(r, ctx)) return r
  }
  return null
}

export interface LinkBuilderAutomationFormSetters {
  setHasAdvanced: Dispatch<SetStateAction<boolean>>
  setAlias: Dispatch<SetStateAction<string>>
  setOgTitle: Dispatch<SetStateAction<string>>
  setOgDescription: Dispatch<SetStateAction<string>>
  setOgImageUrl: Dispatch<SetStateAction<string>>
  setExpiryMode: Dispatch<SetStateAction<LinkBuilderExpiryMode>>
  setExpiryLocal: Dispatch<SetStateAction<string>>
  setMaxClicksInput: Dispatch<SetStateAction<string>>
  setLinkActiveSwitch: Dispatch<SetStateAction<boolean>>
}

/** Применить правило к полям формы сокращения. */
export function applyAutomationRuleToForm(rule: LinkBuilderAutomationRule, ctx: LinkBuilderUrlContext, s: LinkBuilderAutomationFormSetters): void {
  const a = rule.apply
  if (a.openAdvanced === true) s.setHasAdvanced(true)
  if (a.status != null) s.setLinkActiveSwitch(a.status === 'active')
  if (a.suggestAliasFromPath === true && ctx.pathLast) {
    const slug = slugifyPathSegmentForAlias(ctx.pathLast)
    if (slug.length >= 2) s.setAlias(slug)
  }
  if (a.ogTitleTemplate && a.ogTitleTemplate.trim()) {
    s.setOgTitle(renderLinkBuilderTemplate(a.ogTitleTemplate, ctx))
  }
  if (a.ogDescriptionTemplate && a.ogDescriptionTemplate.trim()) {
    s.setOgDescription(renderLinkBuilderTemplate(a.ogDescriptionTemplate, ctx))
  }
  if (a.ogImageUrl && a.ogImageUrl.trim()) s.setOgImageUrl(a.ogImageUrl.trim())

  if (a.expiryMode != null) {
    s.setExpiryMode(a.expiryMode)
    if (a.expiryMode === 'date' && a.expiryDaysFromNow != null && a.expiryDaysFromNow > 0) {
      s.setExpiryLocal(daysFromNowDatetimeLocal(a.expiryDaysFromNow))
    }
    if (a.expiryMode === 'clicks' && a.maxClicks != null && a.maxClicks >= 1) {
      s.setMaxClicksInput(String(Math.floor(a.maxClicks)))
    }
  }
}

/** Первый сегмент пути короткой ссылки (`/go/abc` → `go`). */
export function extractShortLinkPathSegment(shortUrl: string): string {
  try {
    const parts = new URL(shortUrl).pathname.split('/').filter(Boolean)
    if (parts.length >= 2) return parts[0] ?? 'l'
  } catch {
    /* ignore */
  }
  return 'l'
}
