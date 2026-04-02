import type { LinkBuilderAutomationRule, LinkBuilderGeneralSettings } from './linkBuilderSettingsTypes'

export const LINK_BUILDER_GENERAL_STORAGE_KEY = 'hr-helper-link-builder-general-v1'
export const LINK_BUILDER_AUTOMATIONS_STORAGE_KEY = 'hr-helper-link-builder-automations-v1'

const PATH_SEGMENT_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/

export const DEFAULT_LINK_BUILDER_GENERAL_SETTINGS: LinkBuilderGeneralSettings = {
  defaultStatus: 'active',
  openAdvancedByDefault: false,
  shortLinkPathSegment: 'l',
  autoApplyAutomations: true,
  notifyAutomationApplied: true,
}

/** Стартовые правила-примеры (можно отключить или удалить в UI). */
export const DEFAULT_SAMPLE_AUTOMATIONS: LinkBuilderAutomationRule[] = [
  {
    id: 'auto-demo-notion',
    enabled: false,
    name: 'Notion: заголовок из пути',
    priority: 10,
    matchKind: 'host',
    pattern: 'notion.so',
    apply: {
      openAdvanced: true,
      suggestAliasFromPath: true,
      ogTitleTemplate: 'Материал: {pathLast}',
      ogDescriptionTemplate: '{hostname}{pathname}',
    },
  },
  {
    id: 'auto-demo-docs',
    enabled: false,
    name: 'Документация: лимит кликов',
    priority: 20,
    matchKind: 'host-path-prefix',
    pattern: 'example.com/docs',
    apply: {
      openAdvanced: true,
      expiryMode: 'clicks',
      maxClicks: 500,
    },
  },
]

function sanitizePathSegment(raw: string): string {
  const t = raw.trim().replace(/^\/+|\/+$/g, '')
  if (!t) return DEFAULT_LINK_BUILDER_GENERAL_SETTINGS.shortLinkPathSegment
  if (!PATH_SEGMENT_PATTERN.test(t) || t.length > 32) {
    return DEFAULT_LINK_BUILDER_GENERAL_SETTINGS.shortLinkPathSegment
  }
  return t
}

function parseGeneral(raw: string | null): LinkBuilderGeneralSettings {
  if (!raw) return { ...DEFAULT_LINK_BUILDER_GENERAL_SETTINGS }
  try {
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return { ...DEFAULT_LINK_BUILDER_GENERAL_SETTINGS }
    const x = o as Record<string, unknown>
    const defaultStatus = x.defaultStatus === 'draft' ? 'draft' : 'active'
    return {
      defaultStatus,
      openAdvancedByDefault: x.openAdvancedByDefault === true,
      shortLinkPathSegment: sanitizePathSegment(typeof x.shortLinkPathSegment === 'string' ? x.shortLinkPathSegment : ''),
      autoApplyAutomations: x.autoApplyAutomations !== false,
      notifyAutomationApplied: x.notifyAutomationApplied !== false,
    }
  } catch {
    return { ...DEFAULT_LINK_BUILDER_GENERAL_SETTINGS }
  }
}

function isRule(x: unknown): x is LinkBuilderAutomationRule {
  if (!x || typeof x !== 'object') return false
  const r = x as Record<string, unknown>
  const apply = r.apply
  if (apply === null || typeof apply !== 'object') return false
  return (
    typeof r.id === 'string' &&
    typeof r.enabled === 'boolean' &&
    typeof r.name === 'string' &&
    typeof r.priority === 'number' &&
    Number.isFinite(r.priority) &&
    (r.matchKind === 'host' || r.matchKind === 'host-path-prefix' || r.matchKind === 'regex') &&
    typeof r.pattern === 'string'
  )
}

function parseRules(raw: string | null): LinkBuilderAutomationRule[] {
  if (!raw) return [...DEFAULT_SAMPLE_AUTOMATIONS]
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return [...DEFAULT_SAMPLE_AUTOMATIONS]
    const out: LinkBuilderAutomationRule[] = []
    for (const item of data) {
      if (isRule(item)) out.push(item as LinkBuilderAutomationRule)
    }
    return out.length > 0 ? out : [...DEFAULT_SAMPLE_AUTOMATIONS]
  } catch {
    return [...DEFAULT_SAMPLE_AUTOMATIONS]
  }
}

export function readLinkBuilderGeneralSettings(): LinkBuilderGeneralSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_LINK_BUILDER_GENERAL_SETTINGS }
  return parseGeneral(localStorage.getItem(LINK_BUILDER_GENERAL_STORAGE_KEY))
}

export function writeLinkBuilderGeneralSettings(s: LinkBuilderGeneralSettings): void {
  if (typeof window === 'undefined') return
  const next: LinkBuilderGeneralSettings = {
    ...s,
    shortLinkPathSegment: sanitizePathSegment(s.shortLinkPathSegment),
  }
  localStorage.setItem(LINK_BUILDER_GENERAL_STORAGE_KEY, JSON.stringify(next))
}

export function readLinkBuilderAutomationRules(): LinkBuilderAutomationRule[] {
  if (typeof window === 'undefined') return [...DEFAULT_SAMPLE_AUTOMATIONS]
  return parseRules(localStorage.getItem(LINK_BUILDER_AUTOMATIONS_STORAGE_KEY))
}

export function writeLinkBuilderAutomationRules(rules: LinkBuilderAutomationRule[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LINK_BUILDER_AUTOMATIONS_STORAGE_KEY, JSON.stringify(rules))
}
