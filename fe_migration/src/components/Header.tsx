'use client'

import { Flex, Text, Box } from '@radix-ui/themes'
import {
  SunIcon,
  MoonIcon,
  PersonIcon,
  ExitIcon,
  LightningBoltIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
  CheckIcon,
  DrawingPinFilledIcon,
} from '@radix-ui/react-icons'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from '@/router-adapter'
import GlobalSearch from '@/components/GlobalSearch/GlobalSearch'
import type { EntityData, ScopeType } from '@/components/GlobalSearch/GlobalSearch'
import { LogoRobot } from '@/components/logo'
import type { AccentColorValue } from '@/components/profile/AccentColorSettings'
import {
  readStoredCompanyDisplayName,
  subscribeCompanyDisplayName,
} from '@/lib/companyDisplayName'
import { HeaderLocaleControl } from '@/components/HeaderLocaleControl'
import styles from './Header.module.css'

const NARROW_BREAKPOINT = 550

interface HeaderProps {
  userName?: string
  onMenuToggle?: () => void
  onThemeToggle: () => void
  currentTheme: 'light' | 'dark'
  accentColor: AccentColorValue
  menuOpen?: boolean
  /** Закрепить открытое меню (док-панель: контент сдвигается, без оверлея) */
  menuPinned?: boolean
  onMenuPinnedToggle?: () => void
  /** Показывать управление pin только на десктопе */
  allowMenuPin?: boolean
  onLogout: () => void
  leftContent?: React.ReactNode
}

function buildVacanciesSearch(query: string, scope: ScopeType | null): string {
  const params = new URLSearchParams()
  const q = query.trim()
  if (q) params.set('q', q)
  if (scope && scope !== 'all') params.set('scope', scope)
  const s = params.toString()
  return s ? `?${s}` : ''
}

export default function Header({
  userName = 'Голубенко Андрей',
  onMenuToggle,
  onThemeToggle,
  currentTheme,
  accentColor,
  menuOpen: _menuOpen = false,
  menuPinned = false,
  onMenuPinnedToggle,
  allowMenuPin = false,
  onLogout,
  leftContent,
}: HeaderProps) {
  const navigate = useNavigate()
  const [userHover, setUserHover] = useState(false)

  const handleSearch = (query: string, scope: ScopeType | null) => {
    navigate(`/vacancies${buildVacanciesSearch(query, scope)}`)
  }

  const handleEntityClick = (entity: EntityData) => {
    switch (entity.entityType) {
      case 'vacancy':
        navigate('/vacancies')
        break
      case 'candidate':
        navigate('/hiring-requests')
        break
      case 'company':
        navigate('/company-settings')
        break
      default:
        navigate('/vacancies')
    }
  }
  const [logoutHover, setLogoutHover] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const [shortcutKey, setShortcutKey] = useState<'⌘S' | 'Ctrl+S'>('Ctrl+S')
  const [isNarrow, setIsNarrow] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [companyDisplayName, setCompanyDisplayName] = useState(() => readStoredCompanyDisplayName())

  useEffect(() => {
    setCompanyDisplayName(readStoredCompanyDisplayName())
    return subscribeCompanyDisplayName(setCompanyDisplayName)
  }, [])

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < NARROW_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isNarrow) setMobileSearchOpen(false)
  }, [isNarrow])

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchRef.current) {
      const input = mobileSearchRef.current.querySelector('input')
      input?.focus()
    }
  }, [mobileSearchOpen])

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setShortcutKey(isMac ? '⌘S' : 'Ctrl+S')
  }, [])

  const firstName = userName.split(' ')[1] || userName

  const handleUserClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', 'profile')
    }
    navigate('/account/profile')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyS') {
        e.preventDefault()
        if (isNarrow) {
          setMobileSearchOpen(true)
          return
        }
        if (searchContainerRef.current) {
          const input = searchContainerRef.current.querySelector('input') as HTMLInputElement
          if (input) {
            input.focus()
            input.select()
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isNarrow])

  return (
    <header
      id="app-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'var(--gray-2)',
        borderBottom: '1px solid var(--gray-a6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        backdropFilter: 'none',
      }}
    >
      {mobileSearchOpen && isNarrow && (
        <div
          ref={mobileSearchRef}
          className={styles.mobileSearchOverlay}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--gray-2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '8px',
              height: '64px',
              flexShrink: 0,
              borderBottom: '1px solid var(--gray-a6)',
            }}
          >
            <Box style={{ flex: 1, minWidth: 0 }}>
              <GlobalSearch
                placeholder="Поиск..."
                dark={currentTheme === 'dark'}
                dropdownFullWidth
                onSearch={(q, s) => {
                  handleSearch(q, s)
                  setMobileSearchOpen(false)
                }}
                onEntityClick={(e) => {
                  handleEntityClick(e)
                  setMobileSearchOpen(false)
                }}
              />
            </Box>
          <Box
            className={styles.searchActionButton}
            onClick={() => {
              const input = mobileSearchRef.current?.querySelector('input')
              const q = input?.value?.trim() ?? ''
              handleSearch(q, null)
              setMobileSearchOpen(false)
            }}
            title="Подтвердить"
            aria-label="Подтвердить"
          >
            <CheckIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
          </Box>
          <Box
            className={styles.searchCloseButton}
            onClick={() => setMobileSearchOpen(false)}
            title="Закрыть поиск"
            aria-label="Закрыть поиск"
          >
            <Cross2Icon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
          </Box>
          </div>
        </div>
      )}
      <Flex
        align="center"
        justify="between"
        width="100%"
        className={mobileSearchOpen && isNarrow ? styles.headerContentHidden : ''}
        style={{ position: 'relative', zIndex: 0 }}
      >
        <Flex align="center" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <Link href="/" className={styles.logoLink} aria-label="На главную">
            <LogoRobot
              theme={currentTheme}
              accentColor={accentColor}
              size={38}
              className={styles.logoImg}
            />
          </Link>
          {leftContent}
          <Text size="5" weight="bold" className={styles.pageTitle} style={{ flexShrink: 0 }}>
            {companyDisplayName}
          </Text>
        </Flex>

        <Flex align="center" gap={isNarrow ? '2' : '3'} style={{ flexShrink: 1, minWidth: 0 }}>
          {isNarrow ? (
            <Box
              className={styles.searchButton}
              onClick={() => setMobileSearchOpen(true)}
              title="Поиск"
              aria-label="Поиск"
            >
              <MagnifyingGlassIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            </Box>
          ) : (
            <Box ref={searchContainerRef} className={styles.searchContainer} style={{ position: 'relative', width: '200px', minWidth: '150px', flexShrink: 0 }}>
              <GlobalSearch
                placeholder="Поиск..."
                shortcutHint={shortcutKey}
                dark={currentTheme === 'dark'}
                onSearch={handleSearch}
                onEntityClick={handleEntityClick}
              />
            </Box>
          )}
          <Box
            data-tour="header-menu"
            className={styles.menuToggle}
            onClick={onMenuToggle}
            title={menuPinned ? 'Меню (закреплено)' : 'Меню'}
            aria-label="Меню"
          >
            {allowMenuPin ? (
              <button
                type="button"
                className={`${styles.menuTogglePin} ${menuPinned ? styles.menuTogglePinActive : ''}`}
                title={menuPinned ? 'Открепить меню (оверлей)' : 'Закрепить меню (сдвиг контента)'}
                aria-label={menuPinned ? 'Открепить боковое меню' : 'Закрепить боковое меню'}
                aria-pressed={menuPinned}
                onClick={(e) => {
                  e.stopPropagation()
                  onMenuPinnedToggle?.()
                }}
              >
                <DrawingPinFilledIcon width={10} height={10} />
              </button>
            ) : null}
            <LightningBoltIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
          </Box>

          <Box
            style={{
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: '1px solid var(--gray-a6)',
              borderRadius: '6px',
              padding: '6px 8px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            title="Уведомления"
          >
            <BellIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
          </Box>

          <Box
            data-tour="header-theme"
            onClick={onThemeToggle}
            style={{
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: '1px solid var(--gray-a6)',
              borderRadius: '6px',
              padding: '6px 8px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            title="Переключить тему"
          >
            {currentTheme === 'light' ? (
              <MoonIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            ) : (
              <SunIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            )}
          </Box>

          <HeaderLocaleControl compactTrigger={isNarrow} />

          <Flex
            align="center"
            style={{
              border: '1px solid var(--gray-a6)',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: 'transparent',
              height: '34px',
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            <Flex
              data-tour="header-profile"
              align="center"
              gap="2"
              px={isNarrow ? '2' : '3'}
              onMouseEnter={() => setUserHover(true)}
              onMouseLeave={() => setUserHover(false)}
              style={{
                backgroundColor: userHover
                  ? (currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                  : 'transparent',
                borderRight: '1px solid var(--gray-a6)',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s ease-in-out',
                minWidth: 0,
                flex: '0 1 auto',
              }}
              onClick={handleUserClick}
            >
              <PersonIcon width={16} height={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <Text
                size="2"
                className={`${styles.userFullName} ${styles.profileNameClip}`}
                style={{ color: '#3b82f6', fontWeight: 400 }}
              >
                {userName}
              </Text>
              <Text
                size="2"
                className={`${styles.userName} ${styles.profileNameClip}`}
                style={{ color: '#3b82f6', fontWeight: 400 }}
              >
                {firstName}
              </Text>
            </Flex>

            <Flex
              data-tour="header-logout"
              align="center"
              gap="2"
              px="3"
              className={styles.logoutButton}
              onMouseEnter={() => setLogoutHover(true)}
              onMouseLeave={() => setLogoutHover(false)}
              onClick={onLogout}
              style={{
                backgroundColor: logoutHover
                  ? (currentTheme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)')
                  : 'transparent',
                borderLeft: '1px solid var(--gray-a6)',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s ease-in-out',
              }}
            >
              <ExitIcon width={16} height={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <Text size="2" className={styles.logoutText} style={{ color: '#ef4444', whiteSpace: 'nowrap', fontWeight: 400 }}>
                Выход
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </header>
  )
}
