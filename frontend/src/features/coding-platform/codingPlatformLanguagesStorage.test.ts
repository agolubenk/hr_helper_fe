import { beforeEach, describe, expect, it } from 'vitest'
import {
  readEnabledCodingLanguageIds,
  writeEnabledCodingLanguageIds,
} from './codingPlatformLanguagesStorage'

describe('codingPlatformLanguagesStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when storage empty', () => {
    const ids = readEnabledCodingLanguageIds()
    expect(ids).toContain('js')
    expect(ids).toContain('html')
  })

  it('persists enabled set', () => {
    writeEnabledCodingLanguageIds(['python', 'go', 'rust'])
    expect(readEnabledCodingLanguageIds().sort()).toEqual(['go', 'python', 'rust'].sort())
  })
})
