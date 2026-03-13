import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { FeatureFlag, FeatureFlagOff } from '../FeatureFlag'
import {
  FeatureFlagsContext,
  useFeatureFlagsProvider,
  useFeatureFlag,
} from '../useFeatureFlags'
import { setOverride, clearOverrides } from '../config'
import type { FeatureFlagsContextType } from '../types'

function TestProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const value = useFeatureFlagsProvider(userId)
  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

function TestComponent({ flag }: { flag: Parameters<typeof useFeatureFlag>[0] }) {
  const isEnabled = useFeatureFlag(flag)
  return <div data-testid="result">{isEnabled ? 'enabled' : 'disabled'}</div>
}

describe('Feature Flags', () => {
  beforeEach(() => {
    clearOverrides()
    localStorage.clear()
  })

  describe('useFeatureFlag', () => {
    it('returns true for enabled flags', () => {
      render(
        <TestProvider>
          <TestComponent flag="dark_mode" />
        </TestProvider>
      )

      expect(screen.getByTestId('result')).toHaveTextContent('enabled')
    })

    it('returns false for disabled flags', () => {
      render(
        <TestProvider>
          <TestComponent flag="advanced_analytics" />
        </TestProvider>
      )

      expect(screen.getByTestId('result')).toHaveTextContent('disabled')
    })

    it('respects local storage overrides', () => {
      setOverride('advanced_analytics', true)

      render(
        <TestProvider>
          <TestComponent flag="advanced_analytics" />
        </TestProvider>
      )

      expect(screen.getByTestId('result')).toHaveTextContent('enabled')
    })
  })

  describe('FeatureFlag component', () => {
    it('renders children when flag is enabled', () => {
      render(
        <TestProvider>
          <FeatureFlag flag="dark_mode">
            <span data-testid="content">Feature Content</span>
          </FeatureFlag>
        </TestProvider>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('renders fallback when flag is disabled', () => {
      render(
        <TestProvider>
          <FeatureFlag
            flag="advanced_analytics"
            fallback={<span data-testid="fallback">Fallback Content</span>}
          >
            <span data-testid="content">Feature Content</span>
          </FeatureFlag>
        </TestProvider>
      )

      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      expect(screen.getByTestId('fallback')).toBeInTheDocument()
    })

    it('renders nothing when flag is disabled and no fallback', () => {
      render(
        <TestProvider>
          <FeatureFlag flag="advanced_analytics">
            <span data-testid="content">Feature Content</span>
          </FeatureFlag>
        </TestProvider>
      )

      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })
  })

  describe('FeatureFlagOff component', () => {
    it('renders children when flag is disabled', () => {
      render(
        <TestProvider>
          <FeatureFlagOff flag="advanced_analytics">
            <span data-testid="content">Disabled Feature Message</span>
          </FeatureFlagOff>
        </TestProvider>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('renders nothing when flag is enabled', () => {
      render(
        <TestProvider>
          <FeatureFlagOff flag="dark_mode">
            <span data-testid="content">Disabled Feature Message</span>
          </FeatureFlagOff>
        </TestProvider>
      )

      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })
  })

  describe('Rollout percentage', () => {
    it('enables flag for users within rollout percentage', () => {
      render(
        <TestProvider userId="user-within-rollout">
          <TestComponent flag="advanced_analytics" />
        </TestProvider>
      )
    })
  })

  describe('Override management', () => {
    it('setOverride persists to localStorage', () => {
      setOverride('dark_mode', false)

      const stored = localStorage.getItem('feature_flags_override')
      expect(stored).toBeTruthy()
      expect(JSON.parse(stored!)).toHaveProperty('dark_mode', false)
    })

    it('clearOverrides removes all overrides', () => {
      setOverride('dark_mode', false)
      setOverride('ai_assistant', false)

      clearOverrides()

      const stored = localStorage.getItem('feature_flags_override')
      expect(stored).toBeNull()
    })
  })
})
