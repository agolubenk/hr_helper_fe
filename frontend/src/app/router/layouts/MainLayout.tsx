import { Box, Flex } from '@radix-ui/themes'
import { useState, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import Header from '@/shared/components/navigation/Header/Header'
import Sidebar from '@/shared/components/navigation/Sidebar/Sidebar'
import { Footer } from '@/shared/components/navigation/Footer/Footer'
import FloatingActions from '@/shared/components/navigation/FloatingActions/FloatingActions'
import { RecrChatStatusBar } from '@/shared/components/layout/StatusBar/RecrChatStatusBar'
import { useTheme } from '@/app/providers/ThemeProvider'
import styles from './MainLayout.module.css'

const FOOTER_HEIGHT = 48

const SIDEBAR_STATE_STORAGE_KEY = 'sidebarMenuOpen'
const DESKTOP_BREAKPOINT = 768

interface MainLayoutProps {
  children: ReactNode
  pageTitle?: string
  userName?: string
  onLogout?: () => void
  leftHeaderContent?: ReactNode
  /** Отступы контента (false — для страниц ошибок, убирает лишнее пространство) */
  contentPadding?: boolean
}

export function MainLayout({
  children,
  pageTitle = 'HR Helper',
  userName = 'Голубенко Андрей',
  onLogout,
  leftHeaderContent,
  contentPadding = true,
}: MainLayoutProps) {
  const pathname = useRouterState().location.pathname
  const isRecrChatPage = pathname?.startsWith('/recr-chat')
  const isAdminPage = pathname?.startsWith('/admin')

  const isDesktop = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= DESKTOP_BREAKPOINT
  }

  const [menuOpen, setMenuOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    if (!isDesktop()) return false
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY)
      return savedState === 'true'
    } catch {
      return false
    }
  })

  const { theme, toggleTheme, lightThemeAccentColor, darkThemeAccentColor } = useTheme()
  const accentColor = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      try {
        localStorage.removeItem(SIDEBAR_STATE_STORAGE_KEY)
      } catch {}
      return
    }
    try {
      localStorage.setItem(SIDEBAR_STATE_STORAGE_KEY, String(menuOpen))
    } catch (e) {
      console.error('Ошибка при сохранении состояния меню в localStorage:', e)
    }
  }, [menuOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        setMenuOpen((prev) => {
          if (prev) {
            try {
              localStorage.removeItem(SIDEBAR_STATE_STORAGE_KEY)
            } catch {}
            return false
          }
          return prev
        })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      console.log('Выход из системы')
    }
  }

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  useLayoutEffect(() => {
    if (!contentPadding) {
      const prevHtml = document.documentElement.style.overflow
      const prevBody = document.body.style.overflow
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      return () => {
        document.documentElement.style.overflow = prevHtml
        document.body.style.overflow = prevBody
      }
    }
  }, [contentPadding])

  return (
    <>
      <Header
        pageTitle={pageTitle}
        userName={userName}
        onMenuToggle={handleMenuToggle}
        onThemeToggle={toggleTheme}
        currentTheme={theme}
        accentColor={accentColor}
        menuOpen={menuOpen}
        onLogout={handleLogout}
        leftContent={leftHeaderContent}
      />
      {isRecrChatPage && <RecrChatStatusBar />}
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <FloatingActions />

      <Flex
        className={styles.contentWrapper}
        style={{
          marginTop: isRecrChatPage ? '112px' : '64px',
          width: '100%',
          maxWidth: '100vw',
          minHeight: isRecrChatPage ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)',
          flexDirection: 'column',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Box
          className={styles.content}
          style={{
            padding: contentPadding
              ? isAdminPage
                ? `0 0 ${FOOTER_HEIGHT + 24}px 0`
                : `24px 0 ${FOOTER_HEIGHT + 24}px 0`
              : 0,
            borderTop: contentPadding ? '1px solid var(--gray-a6)' : 'none',
            flex: 1,
            minWidth: 0,
            maxWidth: '100%',
            marginLeft: '34px',
            marginRight: menuOpen ? '280px' : '24px',
            width: menuOpen ? 'calc(100% - 280px - 34px)' : 'calc(100% - 34px - 24px)',
            transition: 'margin-right 0.2s ease-in-out, width 0.2s ease-in-out',
          }}
        >
          {children}
        </Box>
      </Flex>
      <Footer />
    </>
  )
}
