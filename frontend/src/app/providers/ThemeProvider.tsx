'use client'

import { Theme } from '@radix-ui/themes'
import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { getFaviconDataUrl } from '@/shared/components/logo'
import {
  ThemeContext,
  THEME_PREFERENCE_KEY,
  LIGHT_ACCENT_KEY,
  DARK_ACCENT_KEY,
  type ThemeMode,
  type ThemePreference,
  type AccentColorValue,
} from '@/shared/lib/theme'

export { useTheme } from '@/shared/lib/theme'
export type { ThemeMode, ThemePreference } from '@/shared/lib/theme'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('auto')
  const [mounted, setMounted] = useState(false)
  const [lightThemeAccentColor, setLightThemeAccentColorState] = useState<AccentColorValue>('crimson')
  const [darkThemeAccentColor, setDarkThemeAccentColorState] = useState<AccentColorValue>('crimson')

  useEffect(() => {
    setMounted(true)
    let savedPref = localStorage.getItem(THEME_PREFERENCE_KEY) as ThemePreference | null
    if (!savedPref) {
      const oldTheme = localStorage.getItem('theme') as ThemeMode | null
      if (oldTheme === 'light' || oldTheme === 'dark') {
        savedPref = oldTheme
        localStorage.setItem(THEME_PREFERENCE_KEY, savedPref)
      }
    }
    const pref: ThemePreference = savedPref && ['light', 'dark', 'auto'].includes(savedPref) ? savedPref : 'auto'
    setThemePreferenceState(pref)

    const initialTheme = pref === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref
    setTheme(initialTheme)

    const savedLightAccent = localStorage.getItem(LIGHT_ACCENT_KEY) as AccentColorValue | null
    const savedDarkAccent = localStorage.getItem(DARK_ACCENT_KEY) as AccentColorValue | null

    if (savedLightAccent) setLightThemeAccentColorState(savedLightAccent)
    if (savedDarkAccent) setDarkThemeAccentColorState(savedDarkAccent)

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', initialTheme)
      document.documentElement.style.colorScheme = initialTheme
      document.body.setAttribute('data-theme', initialTheme)
      document.body.style.colorScheme = initialTheme

      if (initialTheme === 'dark') {
        document.body.style.backgroundColor = 'var(--gray-1, #1c1c1f)'
        document.body.style.color = 'var(--gray-12, #ffffff)'
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
      } else {
        document.body.style.backgroundColor = '#ffffff'
        document.body.style.color = '#000000'
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
      }
    }
  }, [])

  const setThemePreference = useCallback((pref: ThemePreference) => {
    setThemePreferenceState(pref)
    localStorage.setItem(THEME_PREFERENCE_KEY, pref)
    const newTheme = pref === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref
    setTheme(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const newPref: ThemePreference = theme === 'light' ? 'dark' : 'light'
    setThemePreference(newPref)
  }, [theme])

  useEffect(() => {
    if (themePreference === 'auto' && typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => setTheme(mq.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [themePreference])

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.colorScheme = theme
      document.body.setAttribute('data-theme', theme)
      document.body.style.colorScheme = theme

      const favicon = document.getElementById('favicon') as HTMLLinkElement | null
      const accent = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor
      if (favicon) {
        favicon.href = getFaviconDataUrl(accent, theme)
      }

      if (theme === 'dark') {
        document.body.style.backgroundColor = 'var(--gray-1, #1c1c1f)'
        document.body.style.color = 'var(--gray-12, #ffffff)'
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
      } else {
        document.body.style.backgroundColor = '#ffffff'
        document.body.style.color = '#000000'
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
      }
    }
  }, [theme, mounted, lightThemeAccentColor, darkThemeAccentColor])

  const setLightThemeAccentColor = (color: AccentColorValue) => {
    setLightThemeAccentColorState(color)
    localStorage.setItem(LIGHT_ACCENT_KEY, color)
  }

  const setDarkThemeAccentColor = (color: AccentColorValue) => {
    setDarkThemeAccentColorState(color)
    localStorage.setItem(DARK_ACCENT_KEY, color)
  }

  const currentAccentColor = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themePreference,
        setThemePreference,
        toggleTheme,
        lightThemeAccentColor,
        darkThemeAccentColor,
        setLightThemeAccentColor,
        setDarkThemeAccentColor,
      }}
    >
      <Theme
        accentColor={currentAccentColor}
        grayColor="sand"
        radius="large"
        scaling="95%"
        appearance={theme}
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  )
}
