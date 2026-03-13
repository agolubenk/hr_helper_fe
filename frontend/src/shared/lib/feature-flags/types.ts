export type FeatureFlagKey =
  | 'new_dashboard'
  | 'ai_assistant'
  | 'advanced_analytics'
  | 'telegram_integration'
  | 'huntflow_sync'
  | 'bulk_actions'
  | 'dark_mode'
  | 'notifications_v2'
  | 'calendar_integration'
  | 'salary_benchmarks'

export interface FeatureFlag {
  key: FeatureFlagKey
  enabled: boolean
  description: string
  rolloutPercentage?: number
  allowedUserIds?: string[]
  allowedRoles?: string[]
}

export interface FeatureFlagsConfig {
  flags: Record<FeatureFlagKey, FeatureFlag>
  userId?: string
  userRole?: string
}

export interface FeatureFlagsContextType {
  isEnabled: (key: FeatureFlagKey) => boolean
  flags: Record<FeatureFlagKey, boolean>
  refresh: () => void
}
