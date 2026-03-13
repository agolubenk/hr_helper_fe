import { createContext, useContext } from 'react'

export type AccentColorValue =
  | 'blue' | 'tomato' | 'red' | 'ruby' | 'crimson' | 'pink' | 'plum' | 'purple'
  | 'violet' | 'iris' | 'indigo' | 'cyan' | 'teal' | 'jade' | 'green' | 'grass'
  | 'lime' | 'yellow' | 'amber' | 'orange' | 'brown'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = 'light' | 'dark' | 'auto'

export interface ThemeContextType {
  theme: ThemeMode
  themePreference: ThemePreference
  setThemePreference: (pref: ThemePreference) => void
  toggleTheme: () => void
  lightThemeAccentColor: AccentColorValue
  darkThemeAccentColor: AccentColorValue
  setLightThemeAccentColor: (color: AccentColorValue) => void
  setDarkThemeAccentColor: (color: AccentColorValue) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const THEME_PREFERENCE_KEY = 'themePreference'
export const LIGHT_ACCENT_KEY = 'lightThemeAccentColor'
export const DARK_ACCENT_KEY = 'darkThemeAccentColor'
