/**
 * AppLayout (components/AppLayout.tsx) - Основной layout компонент приложения
 * 
 * Назначение:
 * - Оборачивает все страницы приложения единым layout
 * - Управляет структурой страницы (Header, Sidebar, контент)
 * - Управляет состоянием бокового меню (открыто/закрыто)
 * - Адаптивная верстка для мобильных и десктопных устройств
 * - Сохранение состояния меню в localStorage
 * 
 * Функциональность:
 * - Header: верхняя панель с названием компании (десктоп), поиском, уведомлениями, темой, пользователем
 * - Sidebar: боковое меню навигации (открывается/закрывается)
 * - FloatingActions: плавающие кнопки действий
 * - StatusBar: статусная панель (показывается только на странице ats)
 * - Управление темой через ThemeProvider
 * - Адаптивное поведение меню (на мобильных всегда закрыто, на десктопе сохраняется состояние)
 * 
 * Связи:
 * - Header: название компании из настроек, поиск, уведомления, переключатель темы
 * - Sidebar: боковое меню навигации
 * - FloatingActions: плавающие кнопки быстрых действий
 * - StatusBar: статусная панель для страницы ats
 * - ThemeProvider: управление темой приложения
 * - usePathname: определение текущего пути для условного рендеринга
 * 
 * Поведение:
 * - На десктопе: меню может быть открыто/закрыто, состояние сохраняется в localStorage
 * - На мобильных: меню всегда закрыто при загрузке, не сохраняется в localStorage
 * - При изменении размера окна: если переключились на мобильное - меню закрывается
 * - На странице ats: дополнительно показывается StatusBar
 * - Контент страницы отображается с отступом от Header (64px) и StatusBar (если есть)
 */

'use client'

import { Box, Flex } from "@radix-ui/themes"
import { useState, useEffect, useRef, ReactNode } from "react"
import { usePathname } from "@/router-adapter"
import Header from "./Header"
import Sidebar from "./Sidebar"
import FloatingActions from "./FloatingActions"
import StatusBar from "./StatusBar"
import { Footer } from "./navigation/Footer/Footer"
import { useTheme } from "./ThemeProvider"
import {
  applyDocumentLangFromPreferences,
  subscribeUserAndCompanyLocaleChanges,
} from '@/features/system-settings/userLocalePreferences'
import styles from './AppLayout.module.css'

/**
 * SIDEBAR_STATE_STORAGE_KEY - ключ для сохранения состояния бокового меню в localStorage
 * 
 * Используется для:
 * - Сохранения состояния открыто/закрыто меню на десктопе
 * - Восстановления состояния при следующей загрузке страницы
 */
const SIDEBAR_STATE_STORAGE_KEY = 'sidebarMenuOpen'
const SIDEBAR_PINNED_STORAGE_KEY = 'sidebarMenuPinned'
/** Ширина панели меню (см. Sidebar.module.css) — резервируем у контента в закреплённом режиме */
const SIDEBAR_WIDTH_PX = 280

/** Высота фиксированного футера (см. Footer.module.css) — как во frontend MainLayout */
const FOOTER_HEIGHT = 48

/** Фиксированный header: 64px + 1px border (см. Header.tsx) — отступ контента от верха вьюпорта */
const HEADER_OFFSET = 65

/** StatusBar под header на страницах /ats */
const ATS_STATUS_BAR_HEIGHT = 48

/**
 * DESKTOP_BREAKPOINT - точка перелома для определения десктопных устройств
 * 
 * Используется для:
 * - Определения, является ли устройство десктопом или мобильным
 * - Адаптивного поведения меню (на мобильных всегда закрыто)
 * 
 * Значение: 768px (стандартная точка перелома для планшетов/десктопов)
 */
const DESKTOP_BREAKPOINT = 768 // Мобильные устройства < 768px

/**
 * AppLayoutProps - интерфейс пропсов компонента AppLayout
 * 
 * Структура:
 * - children: содержимое страницы (ReactNode)
 * - pageTitle: заголовок страницы (document.title; в шапке — название компании из настроек)
 * - userName: имя пользователя (отображается в Header)
 * - onLogout: обработчик выхода из системы (опционально)
 */
interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
  userName?: string
  onLogout?: () => void
  /** Контент слева от заголовка (например, бургер для админки) */
  leftHeaderContent?: ReactNode
}

/**
 * AppLayout - основной layout компонент приложения
 * 
 * Состояние:
 * - menuOpen: флаг открытости бокового меню
 * - theme: текущая тема приложения (light/dark)
 * 
 * Функциональность:
 * - Управляет состоянием бокового меню
 * - Сохраняет состояние меню в localStorage (только на десктопе)
 * - Адаптирует поведение меню для мобильных устройств
 * - Определяет, является ли текущая страница ats (для показа StatusBar)
 */
export default function AppLayout({
  children,
  pageTitle = "HR Helper",
  userName = "Голубенко Андрей",
  onLogout,
  leftHeaderContent,
}: AppLayoutProps) {
  // Получение текущего пути для условного рендеринга
  const pathname = usePathname()
  // Проверка, является ли текущая страница ats (для показа StatusBar)
  const isRecrChatPage = pathname?.startsWith('/ats')
  const isAdminPage = pathname?.startsWith('/admin')
  const isAiChatPage = pathname?.startsWith('/aichat')
  const isMeetRoomPage = pathname?.startsWith('/meet/room')
  const isUniversalTasksShell = pathname === '/work-items' || pathname === '/tasks'
  const isCodingPlaygroundPage = pathname === '/coding-platform/playground'

  useEffect(() => {
    const t = (pageTitle ?? 'HR Helper').trim()
    document.title = t === 'HR Helper' ? 'HR Helper' : `${t} — HR Helper`
  }, [pageTitle])

  useEffect(() => {
    if (typeof window === 'undefined') return
    applyDocumentLangFromPreferences()
    return subscribeUserAndCompanyLocaleChanges(applyDocumentLangFromPreferences)
  }, [])

  /**
   * isDesktop - проверка, является ли устройство десктопом
   * 
   * Функциональность:
   * - Проверяет ширину окна браузера
   * - Возвращает true если ширина >= DESKTOP_BREAKPOINT
   * 
   * Используется для:
   * - Определения поведения меню (на мобильных всегда закрыто)
   * - Решения, сохранять ли состояние меню в localStorage
   * 
   * @returns true если устройство десктоп, false если мобильное
   */
  const isDesktop = () => {
    if (typeof window === 'undefined') return false // SSR: всегда false
    return window.innerWidth >= DESKTOP_BREAKPOINT
  }

  /**
   * menuOpen - состояние открытости бокового меню
   * 
   * Инициализация:
   * - На мобильных: всегда false (меню закрыто)
   * - На десктопе: загружается из localStorage (если есть сохраненное состояние)
   * 
   * Поведение:
   * - На десктопе: состояние сохраняется в localStorage
   * - На мобильных: состояние не сохраняется, всегда закрыто при загрузке
   */
  const [menuOpen, setMenuOpen] = useState(() => {
    if (typeof window === 'undefined') return false // SSR: всегда false
    
    // На мобильных устройствах всегда начинаем с закрытого меню
    if (!isDesktop()) {
      return false
    }

    // На десктопе загружаем сохраненное состояние из localStorage
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY)
      return savedState === 'true' // Преобразуем строку в boolean
    } catch (error) {
      console.error('Ошибка при загрузке состояния меню из localStorage:', error)
      return false // При ошибке возвращаем false
    }
  })

  const [menuPinned, setMenuPinned] = useState(() => {
    if (typeof window === 'undefined') return false
    if (!isDesktop()) return false
    try {
      return localStorage.getItem(SIDEBAR_PINNED_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [viewportDesktop, setViewportDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT,
  )

  const prevPathnameRef = useRef<string | null>(null)

  // Хук для управления темой приложения
  const { theme, toggleTheme, lightThemeAccentColor, darkThemeAccentColor } = useTheme()
  const currentAccentColor = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor

  /**
   * useEffect - сохранение состояния меню в localStorage при изменении
   * 
   * Функциональность:
   * - Сохраняет состояние меню в localStorage (только на десктопе)
   * - На мобильных устройствах удаляет сохраненное состояние
   * 
   * Поведение:
   * - Выполняется при изменении menuOpen
   * - На десктопе: сохраняет состояние в localStorage
   * - На мобильных: удаляет сохраненное состояние (чтобы не мешать при следующем заходе с десктопа)
   * 
   * Причина:
   * - Позволяет сохранять предпочтения пользователя на десктопе
   * - На мобильных меню всегда должно быть закрыто при загрузке
   */
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR: пропускаем

    // На мобильных устройствах не сохраняем состояние
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      // На мобильных устройствах удаляем сохраненное состояние
      try {
        localStorage.removeItem(SIDEBAR_STATE_STORAGE_KEY)
      } catch (error) {
        // Игнорируем ошибки при удалении из localStorage
      }
      return
    }

    // На десктопе сохраняем состояние
    try {
      localStorage.setItem(SIDEBAR_STATE_STORAGE_KEY, String(menuOpen))
    } catch (error) {
      console.error('Ошибка при сохранении состояния меню в localStorage:', error)
    }
  }, [menuOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!viewportDesktop) {
      try {
        localStorage.removeItem(SIDEBAR_PINNED_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      return
    }
    try {
      localStorage.setItem(SIDEBAR_PINNED_STORAGE_KEY, String(menuPinned))
    } catch (error) {
      console.error('Ошибка при сохранении закрепления меню в localStorage:', error)
    }
  }, [menuPinned, viewportDesktop])

  useEffect(() => {
    const path = pathname ?? ''
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = path
      return
    }
    if (prevPathnameRef.current === path) return
    prevPathnameRef.current = path
    if (menuOpen && !menuPinned) setMenuOpen(false)
  }, [pathname, menuOpen, menuPinned])

  /**
   * useEffect - обработчик изменения размера окна
   * 
   * Функциональность:
   * - Отслеживает изменение размера окна браузера
   * - При переключении на мобильное устройство закрывает меню
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - При уменьшении окна до мобильного размера (< 768px) закрывает меню
   * - Удаляет сохраненное состояние из localStorage при переключении на мобильное
   * 
   * Причина:
   * - Обеспечивает корректное поведение меню при изменении размера окна
   * - На мобильных меню должно быть закрыто
   */
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR: пропускаем

    const handleResize = () => {
      const wide = window.innerWidth >= DESKTOP_BREAKPOINT
      setViewportDesktop(wide)
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        setMenuPinned(false)
        setMenuOpen((prev) => {
          if (prev) {
            try {
              localStorage.removeItem(SIDEBAR_STATE_STORAGE_KEY)
            } catch {
              /* ignore */
            }
            return false
          }
          return prev
        })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Пустой массив зависимостей, так как функция handleResize проверяет window.innerWidth напрямую

  /**
   * handleLogout - обработчик выхода из системы
   * 
   * Функциональность:
   * - Вызывает переданный обработчик onLogout, если он есть
   * - Иначе выводит сообщение в консоль
   * 
   * Поведение:
   * - Вызывается при клике на кнопку выхода в Header
   * - Если передан onLogout - вызывает его
   * - Если не передан - выводит сообщение в консоль (для разработки)
   * 
   * Связи:
   * - Header: кнопка выхода вызывает эту функцию
   * - onLogout: опциональный обработчик из пропсов
   */
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      console.log('Выход из системы')
      // Здесь можно добавить логику выхода по умолчанию
    }
  }

  /**
   * handleMenuToggle - обработчик переключения состояния меню
   * 
   * Функциональность:
   * - Переключает состояние menuOpen (открыто/закрыто)
   * 
   * Поведение:
   * - Вызывается при клике на кнопку меню в Header
   * - Инвертирует текущее состояние menuOpen
   * 
   * Связи:
   * - Header: кнопка меню вызывает эту функцию
   * - setMenuOpen: обновляет состояние меню
   */
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  const handleMenuPinnedToggle = () => {
    if (!viewportDesktop) return
    setMenuPinned((p) => !p)
  }

  const sidebarDocked = menuOpen && menuPinned && viewportDesktop
  const showSidebarBackdrop = menuOpen && !menuPinned

  const requestCloseSidebar = () => {
    if (!menuPinned) setMenuOpen(false)
  }

  /**
   * Рендер компонента AppLayout
   * 
   * Структура:
   * - Header: верхняя панель (фиксированная, 64px + 1px border → HEADER_OFFSET)
   * - StatusBar: статусная панель (только на странице ats, высота 48px)
   * - Sidebar: боковое меню (открывается/закрывается)
   * - FloatingActions: плавающие кнопки действий
   * - children: содержимое страницы (с отступом от Header и StatusBar)
   */
  return (
    <>
      {/* Верхняя панель приложения
          - Название компании (десктоп), поиск, уведомления, переключатель темы, пользователя
          - Кнопка меню для открытия/закрытия Sidebar
          - Фиксированная позиция, высота 64px */}
      <Header
        userName={userName}
        onMenuToggle={handleMenuToggle}
        onThemeToggle={toggleTheme}
        currentTheme={theme}
        menuOpen={menuOpen}
        menuPinned={menuPinned}
        onMenuPinnedToggle={handleMenuPinnedToggle}
        allowMenuPin={viewportDesktop}
        onLogout={handleLogout}
        leftContent={leftHeaderContent}
        accentColor={currentAccentColor}
      />
      {/* Статусная панель (только на странице ats)
          - Показывается только если текущая страница начинается с /ats
          - Высота 48px, фиксированная позиция под Header */}
      {isRecrChatPage && <StatusBar />}
      {/* Боковое меню навигации
          - Открывается/закрывается через кнопку в Header
          - На мобильных закрывается при клике вне меню или при навигации
          - Состояние сохраняется в localStorage на десктопе */}
      <Sidebar isOpen={menuOpen} onClose={requestCloseSidebar} />
      {showSidebarBackdrop ? (
        <Box
          className={styles.sidebarMenuBackdrop}
          style={{
            top: isRecrChatPage
              ? `${HEADER_OFFSET + ATS_STATUS_BAR_HEIGHT}px`
              : `${HEADER_OFFSET}px`,
          }}
          onClick={requestCloseSidebar}
          role="presentation"
          aria-hidden
        />
      ) : null}
      {/* Плавающие кнопки быстрых действий
          - Отображаются поверх контента
          - Предоставляют быстрый доступ к часто используемым функциям */}
      <FloatingActions />
      
      {/* Контейнер для содержимого страницы
          - height/overflow: без прокрутки у контейнера, скролл только внутри контента страниц
          - marginTop: отступ от Header (HEADER_OFFSET) и StatusBar (если /ats) */}
      <Flex
        className={styles.contentWrapper}
        style={{
          marginTop: isRecrChatPage ? `${HEADER_OFFSET + ATS_STATUS_BAR_HEIGHT}px` : `${HEADER_OFFSET}px`,
          width: '100%',
          maxWidth: '100vw',
          height: isRecrChatPage
            ? `calc(100vh - ${HEADER_OFFSET + ATS_STATUS_BAR_HEIGHT}px - ${FOOTER_HEIGHT}px)`
            : `calc(100vh - ${HEADER_OFFSET}px - ${FOOTER_HEIGHT}px)`,
          flexDirection: 'column',
          minHeight: 0,
          transition: 'all 0.2s ease-in-out',
          overflowX: 'hidden',
          overflowY:
            isAiChatPage || isMeetRoomPage || isCodingPlaygroundPage || isUniversalTasksShell ? 'hidden' : 'auto',
        }}
      >
        {/* Основной контент страницы */}
        <Box 
          className={styles.content}
          data-app-layout-content
          style={{ 
            padding: isAdminPage
              ? `0 0 ${FOOTER_HEIGHT + 24}px 0`
              : (isRecrChatPage || isAiChatPage || isMeetRoomPage || isCodingPlaygroundPage || isUniversalTasksShell)
                ? '0'
                : `24px 0 ${FOOTER_HEIGHT + 24}px 0`,
            borderTop: '1px solid var(--gray-a6)',
            /* Для обычных страниц высота = контент, иначе scroll на contentWrapper не получает scrollHeight */
            ...(isRecrChatPage || isAiChatPage || isMeetRoomPage || isCodingPlaygroundPage || isUniversalTasksShell
              ? {
                  flex: 1,
                  minHeight: 0,
                  ...((isMeetRoomPage || isCodingPlaygroundPage || isUniversalTasksShell)
                    ? { display: 'flex', flexDirection: 'column' as const }
                    : {}),
                }
              : { flex: '0 1 auto', minHeight: 'auto' }),
            minWidth: 0,
            maxWidth: '100%',
            height: isRecrChatPage
              ? `calc(100vh - ${HEADER_OFFSET + ATS_STATUS_BAR_HEIGHT}px - ${FOOTER_HEIGHT}px)`
              : undefined,
            marginLeft: isUniversalTasksShell ? 0 : '34px',
            marginRight: isUniversalTasksShell
              ? sidebarDocked
                ? `${SIDEBAR_WIDTH_PX}px`
                : 0
              : sidebarDocked
                ? `${SIDEBAR_WIDTH_PX}px`
                : '24px',
            width: isUniversalTasksShell
              ? sidebarDocked
                ? `calc(100% - ${SIDEBAR_WIDTH_PX}px)`
                : '100%'
              : sidebarDocked
                ? `calc(100% - ${SIDEBAR_WIDTH_PX}px - 34px)`
                : 'calc(100% - 34px - 24px)',
            transition: 'margin-right 0.2s ease-in-out, width 0.2s ease-in-out',
            /* Закреплено: резерв под панель; иначе оверлей без сдвига */
          }}
        >
          {children}
        </Box>
      </Flex>
      <Footer />
    </>
  )
}
