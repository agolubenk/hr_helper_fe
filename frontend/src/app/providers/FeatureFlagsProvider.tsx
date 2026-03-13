import type { ReactNode } from 'react'
import {
  FeatureFlagsContext,
  useFeatureFlagsProvider,
} from '@/shared/lib/feature-flags'

interface FeatureFlagsProviderProps {
  children: ReactNode
  userId?: string
}

export function FeatureFlagsProvider({ children, userId }: FeatureFlagsProviderProps) {
  const value = useFeatureFlagsProvider(userId)

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}
