/**
 * Настройки Huntflow для пользователя (локально).
 */

export type HuntflowCredentialSource = 'mine' | 'company' | 'disabled'

export interface HuntflowUserSettings {
  credentialSource: HuntflowCredentialSource
  activeSystem?: 'prod' | 'sandbox'
  sandboxUrl?: string
  sandboxApiKey?: string
  prodUrl?: string
  accessToken?: string
  refreshToken?: string
}

const HUNTFLOW_USER_SETTINGS_KEY = 'huntflow_user_settings'

export function getHuntflowUserSettings(): HuntflowUserSettings | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(HUNTFLOW_USER_SETTINGS_KEY)
  if (raw) {
    try {
      const o = JSON.parse(raw) as Record<string, unknown>
      return {
        credentialSource:
          o.credentialSource === 'mine' || o.credentialSource === 'company' || o.credentialSource === 'disabled'
            ? (o.credentialSource as HuntflowCredentialSource)
            : 'mine',
        activeSystem: o.activeSystem === 'sandbox' || o.activeSystem === 'prod' ? o.activeSystem : 'prod',
        sandboxUrl: o.sandboxUrl as string | undefined,
        sandboxApiKey: o.sandboxApiKey as string | undefined,
        prodUrl: o.prodUrl as string | undefined,
        accessToken: o.accessToken as string | undefined,
        refreshToken: o.refreshToken as string | undefined,
      }
    } catch {
      return null
    }
  }
  const old = localStorage.getItem('huntflowActiveSystem')
  if (old === 'sandbox' || old === 'prod') {
    return { credentialSource: 'mine', activeSystem: old }
  }
  return null
}

export function saveHuntflowUserSettings(patch: Partial<HuntflowUserSettings>): void {
  if (typeof window === 'undefined') return
  const prev = getHuntflowUserSettings() || { credentialSource: 'mine' as const, activeSystem: 'prod' as const }
  const next: Record<string, unknown> = { ...prev }
  for (const k of Object.keys(patch) as (keyof HuntflowUserSettings)[]) {
    const v = patch[k]
    if (v !== undefined) next[k] = v
  }
  localStorage.setItem(HUNTFLOW_USER_SETTINGS_KEY, JSON.stringify(next))
}
