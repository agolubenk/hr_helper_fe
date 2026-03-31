import { describe, it, expect } from 'vitest'
import { normalizeLongUrlInput, validateLongUrl, validateAliasAgainstRecords } from './linkBuilderValidation'

describe('linkBuilderValidation', () => {
  it('normalizeLongUrlInput adds https', () => {
    expect(normalizeLongUrlInput('example.com')).toBe('https://example.com')
    expect(normalizeLongUrlInput('http://a.b')).toBe('http://a.b')
  })

  it('validateLongUrl rejects empty', () => {
    expect(validateLongUrl('').ok).toBe(false)
    expect(validateLongUrl('   ').ok).toBe(false)
  })

  it('validateLongUrl accepts http(s)', () => {
    const a = validateLongUrl('https://example.com/path?q=1')
    expect(a.ok).toBe(true)
    expect(a.normalized).toBe('https://example.com/path?q=1')
  })

  it('validateAliasAgainstRecords allows empty', () => {
    expect(validateAliasAgainstRecords('', []).ok).toBe(true)
  })

  it('validateAliasAgainstRecords detects duplicate slug', () => {
    const records = [
      {
        id: '1',
        alias: null,
        shortUrl: 'https://app.test/l/abcDefG',
      },
    ]
    expect(validateAliasAgainstRecords('abcdefg', records).ok).toBe(false)
    expect(validateAliasAgainstRecords('abcdefg', records, '1').ok).toBe(true)
  })
})
