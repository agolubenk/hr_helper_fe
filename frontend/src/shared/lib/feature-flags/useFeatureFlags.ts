import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { FeatureFlagKey, FeatureFlagsContextType } from './types'
import { defaultFlags, getOverrides } from './config'

export const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined
)

function calculateFlags(
  userId?: string
): Record<FeatureFlagKey, boolean> {
  const overrides = getOverrides()
  const result = {} as Record<FeatureFlagKey, boolean>

  for (const [key, flag] of Object.entries(defaultFlags)) {
    const flagKey = key as FeatureFlagKey

    if (flagKey in overrides) {
      result[flagKey] = overrides[flagKey]!
      continue
    }

    if (!flag.enabled) {
      result[flagKey] = false
      continue
    }

    if (flag.allowedUserIds && userId) {
      result[flagKey] = flag.allowedUserIds.includes(userId)
      continue
    }

    if (flag.rolloutPercentage !== undefined && userId) {
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      result[flagKey] = (hash % 100) < flag.rolloutPercentage
      continue
    }

    result[flagKey] = flag.enabled
  }

  return result
}

export function useFeatureFlagsProvider(userId?: string): FeatureFlagsContextType {
  const [version, setVersion] = useState(0)

  const flags = useMemo(
    () => calculateFlags(userId),
    [userId, version]
  )

  const isEnabled = useCallback(
    (key: FeatureFlagKey): boolean => flags[key] ?? false,
    [flags]
  )

  const refresh = useCallback(() => {
    setVersion((v) => v + 1)
  }, [])

  return {
    isEnabled,
    flags,
    refresh,
  }
}

export function useFeatureFlags(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext)
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider')
  }
  return context
}

export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const { isEnabled } = useFeatureFlags()
  return isEnabled(key)
}
