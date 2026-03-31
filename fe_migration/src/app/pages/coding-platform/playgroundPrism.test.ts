import { describe, expect, it } from 'vitest'
import { highlightPlaygroundCode } from './playgroundPrism'

describe('highlightPlaygroundCode', () => {
  it('returns highlighted markup for html', () => {
    const html = highlightPlaygroundCode('html', '<div>ok</div>')
    expect(html).toContain('&lt;')
    expect(html.length).toBeGreaterThan(4)
  })

  it('falls back to escaped text for unknown tab', () => {
    expect(highlightPlaygroundCode('unknown', '<x>')).toBe('&lt;x&gt;')
  })

  it('handles json tab', () => {
    const out = highlightPlaygroundCode('json', '{ "a": 1 }')
    expect(out).toContain('a')
  })
})
