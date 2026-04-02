/**
 * ThemeProvider (components/ThemeProvider.tsx) - Провайдер темы приложения
 * 
 * Назначение:
 * - Управление темой приложения (светлая/темная)
 * - Управление акцентными цветами для светлой и темной темы
 * - Сохранение настроек темы в localStorage
 * - Определение системной темы при первой загрузке
 * - Применение темы к HTML и body элементам
 * 
 * Функциональность:
 * - Переключение между светлой и темной темой
 * - Сохранение выбранной темы в localStorage
 * - Загрузка сохраненной темы при монтировании
 * - Определение системной темы (prefers-color-scheme) если тема не сохранена
 * - Управление акцентными цветами для каждой темы отдельно
 * - Применение темы к document.documentElement и document.body
 * - Предотвращение hydration mismatch (mounted флаг)
 * 
 * Связи:
 * - AppLayout: использует useTheme для переключения темы
 * - Header: использует useTheme для отображения переключателя темы
 * - AccentColorSettings: использует useTheme для управления акцентными цветами
 * - Radix UI Theme: применяет тему и акцентный цвет к компонентам
 * 
 * Поведение:
 * - При первой загрузке: проверяет localStorage, если нет - использует системную тему
 * - При переключении темы: сохраняет в localStorage и применяет к DOM
 * - При изменении акцентного цвета: сохраняет в localStorage
 * - Применяет тему к HTML и body для глобального применения
 */

'use client'

import { Theme } from '@radix-ui/themes'
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import type { AccentColorValue } from '@/components/profile/AccentColorSettings'
import { getFaviconDataUrl } from '@/components/logo'

/**
 * ThemeMode - тип темы приложения
 * 
 * Варианты:
 * - 'light': светлая тема
 * - 'dark': темная тема
 */
type ThemeMode = 'light' | 'dark'

export type ThemePreference = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: ThemeMode
  themePreference: ThemePreference
  setThemePreference: (pref: ThemePreference) => void
  toggleTheme: () => void
  lightThemeAccentColor: AccentColorValue
  darkThemeAccentColor: AccentColorValue
  setLightThemeAccentColor: (color: AccentColorValue) => void
  setDarkThemeAccentColor: (color: AccentColorValue) => void
}

/**
 * ThemeContext - React Context для темы
 * 
 * Используется для:
 * - Предоставления темы и функций управления темой всем дочерним компонентам
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * useTheme - хук для доступа к контексту темы
 * 
 * Функциональность:
 * - Возвращает контекст темы
 * - Выбрасывает ошибку, если используется вне ThemeProvider
 * 
 * Используется для:
 * - Получения текущей темы и функций управления темой в компонентах
 * 
 * @returns ThemeContextType - контекст темы
 * @throws Error если используется вне ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * ThemeProviderProps - интерфейс пропсов компонента ThemeProvider
 * 
 * Структура:
 * - children: дочерние компоненты
 */
interface ThemeProviderProps {
  children: ReactNode
}

/**
 * ThemeProvider - провайдер темы приложения
 * 
 * Состояние:
 * - theme: текущая тема (light/dark)
 * - mounted: флаг монтирования компонента (для предотвращения hydration mismatch)
 * - lightThemeAccentColor: акцентный цвет для светлой темы
 * - darkThemeAccentColor: акцентный цвет для темной темы
 * 
 * Функциональность:
 * - Инициализация темы из localStorage или системной темы
 * - Применение темы к DOM элементам
 * - Управление акцентными цветами
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Текущая тема (по умолчанию 'light' для SSR)
  const [theme, setTheme] = useState<ThemeMode>('light')
  /**
   * mounted - флаг монтирования компонента
   * 
   * Используется для:
   * - Предотвращения hydration mismatch (сервер рендерит с одной темой, клиент с другой)
   * - Применения темы к DOM только после монтирования
   */
  const [mounted, setMounted] = useState(false)
  // Акцентный цвет для светлой темы (по умолчанию 'crimson')
  const [lightThemeAccentColor, setLightThemeAccentColorState] = useState<AccentColorValue>('crimson')
  // Акцентный цвет для темной темы (по умолчанию 'crimson')
  const [darkThemeAccentColor, setDarkThemeAccentColorState] = useState<AccentColorValue>('crimson')
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('auto')

  const applyResolvedTheme = useCallback((resolved: ThemeMode) => {
    setTheme(resolved)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', resolved)
    }
  }, [])

  const setThemePreference = useCallback(
    (pref: ThemePreference) => {
      setThemePreferenceState(pref)
      if (typeof window === 'undefined') return
      localStorage.setItem('themePreference', pref)
      const resolved =
        pref === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : pref
      applyResolvedTheme(resolved)
    },
    [applyResolvedTheme]
  )

  /**
   * useEffect - инициализация темы при монтировании компонента
   * 
   * Функциональность:
   * - Загружает сохраненную тему из localStorage
   * - Если тема не сохранена - определяет системную тему (prefers-color-scheme)
   * - Загружает сохраненные акцентные цвета
   * - Применяет тему к DOM элементам
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Устанавливает mounted в true после инициализации
   * - Применяет тему к document.documentElement и document.body
   * - Устанавливает классы и стили для темы
   * 
   * Причина:
   * - Обеспечивает правильную инициализацию темы при загрузке страницы
   * - Восстанавливает сохраненные настройки пользователя
   */
  useEffect(() => {
    setMounted(true)
    let pref: ThemePreference = 'auto'
    const tp = localStorage.getItem('themePreference')
    if (tp === 'light' || tp === 'dark' || tp === 'auto') {
      pref = tp
    } else {
      const t = localStorage.getItem('theme') as ThemeMode
      if (t === 'light' || t === 'dark') {
        pref = t
        localStorage.setItem('themePreference', t)
      }
    }
    setThemePreferenceState(pref)
    const initialTheme: ThemeMode =
      pref === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : pref
    setTheme(initialTheme)
    localStorage.setItem('theme', initialTheme)

    const savedLightAccent = localStorage.getItem('lightThemeAccentColor') as AccentColorValue
    const savedDarkAccent = localStorage.getItem('darkThemeAccentColor') as AccentColorValue
    if (savedLightAccent) setLightThemeAccentColorState(savedLightAccent)
    if (savedDarkAccent) setDarkThemeAccentColorState(savedDarkAccent)
  }, [])

  useEffect(() => {
    if (!mounted || themePreference !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const r = mq.matches ? 'dark' : 'light'
      setTheme(r)
      localStorage.setItem('theme', r)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mounted, themePreference])

  /**
   * toggleTheme - переключение темы
   * 
   * Функциональность:
   * - Инвертирует текущую тему (light <-> dark)
   * - Сохраняет новую тему в localStorage
   * - Применяет тему к DOM элементам
   * 
   * Поведение:
   * - Вызывается при клике на переключатель темы
   * - Сохраняет предпочтения пользователя в localStorage
   * - Немедленно применяет тему к DOM
   */
  const toggleTheme = () => {
    const newPref: ThemePreference = theme === 'light' ? 'dark' : 'light'
    setThemePreference(newPref)
  }

  /**
   * useEffect - применение темы к DOM при изменении
   * 
   * Функциональность:
   * - Применяет текущую тему к DOM элементам при изменении theme или mounted
   * 
   * Поведение:
   * - Выполняется при изменении theme или mounted
   * - Применяет тему только после монтирования (mounted === true)
   * - Обновляет атрибуты, стили и классы для темы
   * 
   * Причина:
   * - Обеспечивает синхронизацию темы с DOM при изменении
   * - Предотвращает hydration mismatch (применяет только после монтирования)
   */
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      // Применяем текущую тему к html и body элементам
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.colorScheme = theme
      document.body.setAttribute('data-theme', theme)
      document.body.style.colorScheme = theme
      
      // Применяем фон к body напрямую в зависимости от темы
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

      // Favicon во вкладке — лого-робот по текущей теме и акценту
      const favicon = document.getElementById('favicon') as HTMLLinkElement | null
      if (favicon) {
        const accent = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor
        favicon.href = getFaviconDataUrl(accent, theme)
      }
    }
  }, [theme, mounted, lightThemeAccentColor, darkThemeAccentColor])

  /**
   * setLightThemeAccentColor - установка акцентного цвета для светлой темы
   * 
   * Функциональность:
   * - Устанавливает акцентный цвет для светлой темы
   * - Сохраняет цвет в localStorage
   * 
   * Поведение:
   * - Вызывается из AccentColorSettings при изменении цвета
   * - Сохраняет предпочтения пользователя
   * 
   * @param color - новый акцентный цвет
   */
  const setLightThemeAccentColor = (color: AccentColorValue) => {
    setLightThemeAccentColorState(color) // Обновляем состояние
    localStorage.setItem('lightThemeAccentColor', color) // Сохраняем в localStorage
  }

  /**
   * setDarkThemeAccentColor - установка акцентного цвета для темной темы
   * 
   * Функциональность:
   * - Устанавливает акцентный цвет для темной темы
   * - Сохраняет цвет в localStorage
   * 
   * Поведение:
   * - Вызывается из AccentColorSettings при изменении цвета
   * - Сохраняет предпочтения пользователя
   * 
   * @param color - новый акцентный цвет
   */
  const setDarkThemeAccentColor = (color: AccentColorValue) => {
    setDarkThemeAccentColorState(color) // Обновляем состояние
    localStorage.setItem('darkThemeAccentColor', color) // Сохраняем в localStorage
  }

  /**
   * currentAccentColor - текущий акцентный цвет на основе активной темы
   * 
   * Логика:
   * - Если тема светлая - возвращает lightThemeAccentColor
   * - Если тема темная - возвращает darkThemeAccentColor
   * 
   * Используется для:
   * - Применения акцентного цвета к Radix UI Theme компоненту
   * 
   * Примечание:
   * - До mount используем дефолты, чтобы сервер и первый клиентский рендер совпадали
   * - Это предотвращает "missing bootstrap script" ошибку
   */
  const currentAccentColor = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor

  /**
   * Рендер компонента ThemeProvider
   * 
   * Структура:
   * - ThemeContext.Provider: предоставляет контекст темы дочерним компонентам
   * - Radix UI Theme: применяет тему и акцентный цвет к компонентам Radix UI
   * 
   * Параметры Radix UI Theme:
   * - accentColor: текущий акцентный цвет (зависит от темы)
   * - grayColor: цветовая палитра серого ("sand")
   * - radius: радиус скругления ("large")
   * - scaling: масштабирование (95%)
   * - appearance: тема (light/dark)
   */
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
      {/* Radix UI Theme компонент
          - Применяет тему и акцентный цвет ко всем компонентам Radix UI
          - Обеспечивает единообразный стиль во всем приложении */}
      <Theme 
        accentColor={currentAccentColor} // Текущий акцентный цвет (зависит от темы)
        grayColor="sand" // Цветовая палитра серого
        radius="large" // Радиус скругления
        scaling="95%" // Масштабирование компонентов
        appearance={theme} // Тема (light/dark)
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  )
}
