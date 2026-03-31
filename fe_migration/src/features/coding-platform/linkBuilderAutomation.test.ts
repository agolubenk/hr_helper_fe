import { describe, it, expect } from 'vitest'
import {
  buildUrlContext,
  pickAutomationRule,
  renderLinkBuilderTemplate,
  ruleMatchesUrl,
  slugifyPathSegmentForAlias,
} from './linkBuilderAutomation'
import type { LinkBuilderAutomationRule } from './linkBuilderSettingsTypes'

const notionRule: LinkBuilderAutomationRule = {
  id: '1',
  enabled: true,
  name: 'n',
  priority: 1,
  matchKind: 'host',
  pattern: 'notion.so',
  apply: {},
}

const docsRule: LinkBuilderAutomationRule = {
  id: '2',
  enabled: true,
  name: 'd',
  priority: 2,
  matchKind: 'host-path-prefix',
  pattern: 'example.com/docs',
  apply: {},
}

describe('linkBuilderAutomation', () => {
  it('buildUrlContext extracts parts', () => {
    const c = buildUrlContext('https://notion.so/page/Hello%20World')
    expect(c?.hostname).toBe('notion.so')
    expect(c?.pathLast).toBe('Hello%20World')
  })

  it('ruleMatchesUrl host', () => {
    const ctx = buildUrlContext('https://notion.so/x')
    expect(ctx && ruleMatchesUrl(notionRule, ctx)).toBe(true)
  })

  it('ruleMatchesUrl host-path-prefix', () => {
    const ctx = buildUrlContext('https://example.com/docs/guide/intro')
    expect(ctx && ruleMatchesUrl(docsRule, ctx)).toBe(true)
    const no = buildUrlContext('https://example.com/blog/post')
    expect(no && ruleMatchesUrl(docsRule, no)).toBe(false)
  })

  it('pickAutomationRule sorts by priority', () => {
    const r5: LinkBuilderAutomationRule = { ...docsRule, id: 'a', priority: 5 }
    const r10: LinkBuilderAutomationRule = { ...docsRule, id: 'b', priority: 10 }
    const ctx = buildUrlContext('https://example.com/docs/guide')
    expect(ctx).not.toBeNull()
    if (ctx) {
      const picked = pickAutomationRule([r10, r5], ctx)
      expect(picked?.id).toBe('a')
    }
  })

  it('renderLinkBuilderTemplate', () => {
    const ctx = buildUrlContext('https://a.b/c/d')!
    expect(renderLinkBuilderTemplate('{hostname}-{pathLast}', ctx)).toBe('a.b-d')
  })

  it('slugifyPathSegmentForAlias', () => {
    expect(slugifyPathSegmentForAlias('Hello World!')).toBe('hello-world')
  })
})
