import type { SandboxSettingsState } from './types'

const STORAGE_KEY = 'hr-helper-sandbox-stand-settings'

export const SANDBOX_SETTINGS_CHANGED = 'hr-helper-sandbox-changed' as const

const DEFAULT_SANDBOX: SandboxSettingsState = {
  mode: 'isolated',
  baseUrl: 'https://stand.company.local/api',
  apiKeyMasked: '',
  organizationId: 'org-demo-01',
  allowWrite: false,
}

export function readSandboxSettings(): SandboxSettingsState {
  if (typeof window === 'undefined') return { ...DEFAULT_SANDBOX }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SANDBOX }
    const p = JSON.parse(raw) as Partial<SandboxSettingsState>
    const mode =
      p.mode === 'production_mirror' || p.mode === 'staging' || p.mode === 'isolated' ? p.mode : 'isolated'
    return {
      mode,
      baseUrl: typeof p.baseUrl === 'string' ? p.baseUrl : DEFAULT_SANDBOX.baseUrl,
      apiKeyMasked: typeof p.apiKeyMasked === 'string' ? p.apiKeyMasked : '',
      organizationId:
        typeof p.organizationId === 'string' ? p.organizationId : DEFAULT_SANDBOX.organizationId,
      allowWrite: Boolean(p.allowWrite),
    }
  } catch {
    return { ...DEFAULT_SANDBOX }
  }
}

export function writeSandboxSettings(s: SandboxSettingsState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(SANDBOX_SETTINGS_CHANGED))
}
