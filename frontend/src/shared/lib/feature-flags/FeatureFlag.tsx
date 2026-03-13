import type { ReactNode } from 'react'
import { useFeatureFlag } from './useFeatureFlags'
import type { FeatureFlagKey } from './types'

interface FeatureFlagProps {
  flag: FeatureFlagKey
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag)
  return <>{isEnabled ? children : fallback}</>
}

interface FeatureFlagOffProps {
  flag: FeatureFlagKey
  children: ReactNode
}

export function FeatureFlagOff({ flag, children }: FeatureFlagOffProps) {
  const isEnabled = useFeatureFlag(flag)
  return <>{!isEnabled ? children : null}</>
}
