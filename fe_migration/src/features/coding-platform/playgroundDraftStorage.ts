export const PLAYGROUND_DRAFT_STORAGE_KEY = 'coding-playground-draft-v1'

export const PLAYGROUND_AUTOSAVE_PREF_KEY = 'coding-playground-draft-autosave'

export interface PlaygroundDraftPayload {
  html: string
  css: string
  js: string
  reactCode: string
  monoByLang: Record<string, string>
}

export interface PlaygroundDraftV1 extends PlaygroundDraftPayload {
  v: 1
  savedAt: string
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export function readPlaygroundDraft(): PlaygroundDraftPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PLAYGROUND_DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isRecord(parsed)) return null
    if (parsed.v !== 1) return null
    const html = typeof parsed.html === 'string' ? parsed.html : null
    const css = typeof parsed.css === 'string' ? parsed.css : null
    const js = typeof parsed.js === 'string' ? parsed.js : null
    const reactCode = typeof parsed.reactCode === 'string' ? parsed.reactCode : null
    const monoRaw = parsed.monoByLang
    if (!html || !css || !js || !reactCode || !isRecord(monoRaw)) return null
    const monoByLang: Record<string, string> = {}
    for (const [k, v] of Object.entries(monoRaw)) {
      if (typeof v === 'string') monoByLang[k] = v
    }
    return { html, css, js, reactCode, monoByLang }
  } catch {
    return null
  }
}

export function writePlaygroundDraft(payload: PlaygroundDraftPayload): void {
  if (typeof window === 'undefined') return
  const body: PlaygroundDraftV1 = {
    v: 1,
    savedAt: new Date().toISOString(),
    ...payload,
  }
  localStorage.setItem(PLAYGROUND_DRAFT_STORAGE_KEY, JSON.stringify(body))
}

export function readPlaygroundAutosavePref(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(PLAYGROUND_AUTOSAVE_PREF_KEY) === '1'
  } catch {
    return false
  }
}

export function writePlaygroundAutosavePref(on: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PLAYGROUND_AUTOSAVE_PREF_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}
