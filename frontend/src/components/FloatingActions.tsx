'use client'

import { Flex, Box, Separator } from '@radix-ui/themes'
import {
  GearIcon,
  LightningBoltIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  PaperPlaneIcon,
  ClockIcon,
  ArrowUpIcon,
  HomeIcon,
  PersonIcon,
  FileTextIcon,
  StarIcon,
  HeartIcon,
  Link2Icon,
  CheckIcon,
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ListBulletIcon,
  CopyIcon,
  GitHubLogoIcon,
  NotionLogoIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
  UploadIcon,
} from '@radix-ui/react-icons'
import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useRouter, usePathname } from '@/router-adapter'
import { useTheme } from './ThemeProvider'
import {
  getQuickButtons,
  QUICK_BUTTONS_KEY,
  QUICK_BUTTONS_ENABLED_KEY,
  type QuickButton,
} from '@/lib/quickButtonsStorage'

export { QUICK_BUTTONS_ENABLED_KEY } from '@/lib/quickButtonsStorage'

const PinUnpinnedIcon = ({
  width = 15,
  height = 15,
  color = 'currentColor',
}: {
  width?: number
  height?: number
  color?: string
}) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.3285 1.13607C10.1332 0.940809 9.81662 0.940808 9.62136 1.13607C9.42609 1.33133 9.42609 1.64792 9.62136 1.84318L10.2744 2.49619L5.42563 6.13274L4.31805 5.02516C4.12279 4.8299 3.80621 4.8299 3.61095 5.02516C3.41569 5.22042 3.41569 5.537 3.61095 5.73226L5.02516 7.14648L6.08582 8.20714L2.81545 11.4775C2.62019 11.6728 2.62019 11.9894 2.81545 12.1846C3.01072 12.3799 3.3273 12.3799 3.52256 12.1846L6.79293 8.91425L7.85359 9.97491L9.2678 11.3891C9.46306 11.5844 9.77965 11.5844 9.97491 11.3891C10.1702 11.1939 10.1702 10.8773 9.97491 10.682L8.86733 9.57443L12.5039 4.7257L13.1569 5.37871C13.3522 5.57397 13.6687 5.57397 13.864 5.37871C14.0593 5.18345 14.0593 4.86687 13.864 4.6716L12.8033 3.61094L11.3891 2.19673L10.3285 1.13607ZM6.13992 6.84702L10.9887 3.21047L11.7896 4.01142L8.15305 8.86015L6.13992 6.84702Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)

const PinLeftIcon = ({
  width = 20,
  height = 20,
  color = 'currentColor',
}: {
  width?: number
  height?: number
  color?: string
}) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 4L4 7.5L8 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

const iconComponents: Record<string, React.ComponentType<{ width?: number | string; height?: number | string }>> = {
  LightningBoltIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  PaperPlaneIcon,
  ClockIcon,
  HomeIcon,
  PersonIcon,
  FileTextIcon,
  StarIcon,
  HeartIcon,
  Link2Icon,
  GearIcon,
  CheckIcon,
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ListBulletIcon,
  CopyIcon,
  GitHubLogoIcon,
  NotionLogoIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
  UploadIcon,
}

function renderIcon(iconName: string, size = 20) {
  const IconComponent = iconComponents[iconName]
  return IconComponent ? <IconComponent width={size} height={size} /> : <span style={{ fontSize: size }}>⚡</span>
}

interface FloatingAction {
  id: string
  icon: ReactNode
  onClick?: () => void
  label?: string
}

interface FloatingActionsProps {
  actions?: FloatingAction[]
}

const STORAGE_KEY = 'floatingActionsPinned'
const SCROLL_TOP_BUTTON_STORAGE_KEY = 'floatingActionsScrollTopEnabled'
const SETTINGS_BUTTON_STORAGE_KEY = 'floatingActionsSettingsEnabled'

export default function FloatingActions({ actions = [] }: FloatingActionsProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const isAtsPage = pathname?.startsWith('/ats')
  const topOffset = isAtsPage ? '112px' : '64px'

  const handleSettingsClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', 'quick-buttons')
      window.dispatchEvent(
        new CustomEvent('localStorageChange', {
          detail: { key: 'profileActiveTab', value: 'quick-buttons' },
        })
      )
    }
    router.push('/account/profile')
  }

  const [isPinned, setIsPinned] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) === 'true' : false
  )
  const [isScrollTopEnabled, setIsScrollTopEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem(SCROLL_TOP_BUTTON_STORAGE_KEY)
    return saved !== null ? saved === 'true' : true
  })
  const [isSettingsEnabled, setIsSettingsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem(SETTINGS_BUTTON_STORAGE_KEY)
    return saved !== null ? saved === 'true' : true
  })
  const [isQuickButtonsEnabled, setIsQuickButtonsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem(QUICK_BUTTONS_ENABLED_KEY)
    return saved !== null ? saved === 'true' : true
  })
  const [quickButtons, setQuickButtons] = useState<QuickButton[]>(() => getQuickButtons())

  useEffect(() => {
    const onNativeStorage = (e: StorageEvent) => {
      if (e.key === QUICK_BUTTONS_KEY || e.key === null) {
        setQuickButtons(getQuickButtons())
      }
    }
    const handleCustom = (e: CustomEvent) => {
      if (e.detail?.key === QUICK_BUTTONS_KEY) setQuickButtons(getQuickButtons())
    }
    window.addEventListener('storage', onNativeStorage)
    window.addEventListener('localStorageChange', handleCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onNativeStorage)
      window.removeEventListener('localStorageChange', handleCustom as EventListener)
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === QUICK_BUTTONS_ENABLED_KEY) {
        setIsQuickButtonsEnabled(e.detail.value === 'true')
      }
    }
    window.addEventListener('localStorageChange', handleStorageChange as EventListener)
    return () => window.removeEventListener('localStorageChange', handleStorageChange as EventListener)
  }, [])

  useEffect(() => {
    const checkScroll = () => {
      const saved = localStorage.getItem(SCROLL_TOP_BUTTON_STORAGE_KEY)
      setIsScrollTopEnabled(saved !== null ? saved === 'true' : true)
    }
    const checkSettings = () => {
      const saved = localStorage.getItem(SETTINGS_BUTTON_STORAGE_KEY)
      setIsSettingsEnabled(saved !== null ? saved === 'true' : true)
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === SCROLL_TOP_BUTTON_STORAGE_KEY) setIsScrollTopEnabled(e.newValue === 'true')
      else if (e.key === SETTINGS_BUTTON_STORAGE_KEY) setIsSettingsEnabled(e.newValue === 'true')
    }
    const onCustom = (e: CustomEvent) => {
      if (e.detail?.key === SCROLL_TOP_BUTTON_STORAGE_KEY) setIsScrollTopEnabled(e.detail?.value === 'true')
      else if (e.detail?.key === SETTINGS_BUTTON_STORAGE_KEY) setIsSettingsEnabled(e.detail?.value === 'true')
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('localStorageChange', onCustom as EventListener)
    window.addEventListener('focus', () => {
      checkScroll()
      checkSettings()
    })
    const id = setInterval(() => {
      checkScroll()
      checkSettings()
    }, 500)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('localStorageChange', onCustom as EventListener)
      clearInterval(id)
    }
  }, [])

  const [isVisible, setIsVisible] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) === 'true' : false
  )
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isPinned))
    } catch {
      /* ignore */
    }
  }, [isPinned])

  const handlePinToggle = () => {
    setIsPinned((prev) => {
      if (!prev) setIsVisible(true)
      return !prev
    })
  }

  const handleMouseEnter = () => {
    if (!isQuickButtonsEnabled) return
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    if (!isQuickButtonsEnabled) return
    if (!isPinned) {
      timeoutRef.current = setTimeout(() => setIsVisible(false), 300)
    }
  }

  useEffect(() => {
    if (!isQuickButtonsEnabled && !isPinned) setIsVisible(false)
  }, [isQuickButtonsEnabled, isPinned])

  const smoothScrollTo = (element: HTMLElement | Window, target: number, duration = 800) =>
    new Promise<void>((resolve) => {
      const start =
        element === window ? window.scrollY || window.pageYOffset : (element as HTMLElement).scrollTop
      const distance = target - start
      let startTime: number | null = null
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
      const step = (t: number) => {
        if (startTime === null) startTime = t
        const p = Math.min((t - startTime) / duration, 1)
        const pos = start + distance * ease(p)
        if (element === window) window.scrollTo(0, pos)
        else (element as HTMLElement).scrollTop = pos
        if (p < 1) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })

  const scrollToTop = async () => {
    if (typeof window === 'undefined') return
    const scrollY = window.scrollY || window.pageYOffset || 0
    if (scrollY === 0) return
    const maxScroll = Math.max(scrollY, document.documentElement?.scrollTop || 0, document.body?.scrollTop || 0)
    const duration = Math.min(800 + maxScroll * 0.3, 1200)
    try {
      if (scrollY > 0) await smoothScrollTo(window, 0, duration)
      if ((document.documentElement?.scrollTop || 0) > 0 && document.documentElement)
        await smoothScrollTo(document.documentElement, 0, duration)
      if ((document.body?.scrollTop || 0) > 0) await smoothScrollTo(document.body, 0, duration)
      setTimeout(() => {
        window.scrollTo(0, 0)
        if (document.documentElement) document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }, 100)
    } catch {
      /* ignore */
    }
  }

  const buttonsToUse = [...quickButtons].sort((a, b) => a.order - b.order)
  const defaultActions: FloatingAction[] = !isQuickButtonsEnabled
    ? []
    : actions.length > 0
      ? actions
      : buttonsToUse.map((button) => ({
          id: button.id,
          icon: renderIcon(button.icon, 20),
          label: button.name,
          onClick: () => {
            if (!isQuickButtonsEnabled) return
            if (button.type === 'link') window.open(button.value, '_blank')
            else if (button.type === 'text' || button.type === 'datetime')
              void navigator.clipboard.writeText(button.value)
          },
        }))

  const buttonColorMap = Object.fromEntries(quickButtons.map((b) => [b.id, b.color]))

  const pinIconColor = theme === 'light' ? '#1f2937' : '#ffffff'
  const settingsAction = isSettingsEnabled
    ? {
        id: 'settings',
        icon: <GearIcon width="20" height="20" style={{ color: '#ffffff' }} />,
        onClick: handleSettingsClick,
        label: 'Настройки',
      }
    : null
  const scrollTopAction = isScrollTopEnabled
    ? {
        id: 'scroll-top',
        icon: <ArrowUpIcon width="20" height="20" style={{ color: '#ffffff' }} />,
        onClick: scrollToTop,
        label: 'Наверх',
      }
    : null
  const pinAction: FloatingAction = {
    id: 'pin',
    icon: isPinned ? (
      <PinLeftIcon width={20} height={20} color={pinIconColor} />
    ) : (
      <PinUnpinnedIcon width={20} height={20} color={pinIconColor} />
    ),
    onClick: handlePinToggle,
    label: isPinned ? 'Открепить' : 'Закрепить',
  }

  const renderActionButton = (action: FloatingAction) => (
    <Box
      key={action.id}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        action.onClick?.()
      }}
      style={{
        width: '39px',
        height: '39px',
        minWidth: '39px',
        minHeight: '39px',
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor:
          action.id === 'pin' && isPinned
            ? 'var(--gray-4)'
            : action.id === 'scroll-top'
              ? 'var(--accent-9)'
              : action.id === 'settings'
                ? 'var(--gray-9)'
                : buttonColorMap[action.id] || 'var(--gray-3)',
        border: '1px solid var(--gray-a6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.opacity = '0.9'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.opacity = '1'
      }}
      title={action.label}
    >
      <Box
        style={{
          color: action.id === 'pin' ? (theme === 'light' ? '#1f2937' : '#ffffff') : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          transform: 'scale(0.9)',
        }}
      >
        {action.icon}
      </Box>
    </Box>
  )

  const maxHeightOffset = topOffset === '112px' ? 202 : 184

  return (
    <>
      <Box
        position="fixed"
        top={topOffset}
        left="0"
        bottom="0"
        width="7px"
        style={{
          zIndex: 998,
          pointerEvents: isPinned || !isQuickButtonsEnabled ? 'none' : 'auto',
        }}
        onMouseEnter={() => {
          if (!isPinned && isQuickButtonsEnabled) setIsVisible(true)
        }}
        onMouseLeave={() => {
          if (!isPinned && isQuickButtonsEnabled) {
            timeoutRef.current = setTimeout(() => setIsVisible(false), 300)
          }
        }}
      />
      {(isVisible || isPinned) && isQuickButtonsEnabled && (
        <Box
          position="fixed"
          left="8px"
          bottom="60px"
          style={{
            zIndex: 1500,
            pointerEvents: 'auto',
            transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
            opacity: isVisible || isPinned ? 1 : 0,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Flex
            direction="column"
            gap="2"
            align="center"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(28, 28, 31, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--gray-a6)',
              borderRadius: '12px',
              padding: '10px 6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              maxHeight: `calc(100vh - ${maxHeightOffset}px)`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {isSettingsEnabled && settingsAction && (
              <>
                {renderActionButton(settingsAction)}
                <Separator size="2" my="2" style={{ width: '100%', flexShrink: 0 }} />
              </>
            )}
            <Box
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {defaultActions.map((action) => renderActionButton(action))}
            </Box>
            {isScrollTopEnabled && scrollTopAction && (
              <>
                <Separator size="2" my="2" style={{ width: '100%', flexShrink: 0 }} />
                {renderActionButton(scrollTopAction)}
              </>
            )}
            <Separator size="2" my="2" style={{ width: '100%', flexShrink: 0 }} />
            {renderActionButton(pinAction)}
          </Flex>
        </Box>
      )}
    </>
  )
}
