import { describe, expect, it, vi } from 'vitest'
import {
  PLAYGROUND_AUTOSAVE_PREF_KEY,
  PLAYGROUND_DRAFT_STORAGE_KEY,
  readPlaygroundAutosavePref,
  readPlaygroundDraft,
  writePlaygroundAutosavePref,
  writePlaygroundDraft,
} from './playgroundDraftStorage'

describe('playgroundDraftStorage', () => {
  it('writes and reads draft v1', () => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
    })

    const payload = {
      html: '<p>x</p>',
      css: 'body{}',
      js: 'console.log(1)',
      reactCode: 'export default function X(){return null}',
      monoByLang: { json: '{}' },
    }
    writePlaygroundDraft(payload)
    const raw = store[PLAYGROUND_DRAFT_STORAGE_KEY]
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!) as { v: number; savedAt: string }
    expect(parsed.v).toBe(1)
    expect(typeof parsed.savedAt).toBe('string')

    const got = readPlaygroundDraft()
    expect(got).toEqual(payload)
  })

  it('returns null for invalid JSON', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => 'not-json',
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    expect(readPlaygroundDraft()).toBeNull()
  })

  it('autosave pref roundtrip', () => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
    })

    expect(readPlaygroundAutosavePref()).toBe(false)
    writePlaygroundAutosavePref(true)
    expect(store[PLAYGROUND_AUTOSAVE_PREF_KEY]).toBe('1')
    expect(readPlaygroundAutosavePref()).toBe(true)
    writePlaygroundAutosavePref(false)
    expect(readPlaygroundAutosavePref()).toBe(false)
  })
})
