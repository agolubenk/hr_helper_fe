/**
 * Клиентская часть страницы профиля. Получает initialTabFromUrl с сервера,
 * чтобы первый рендер совпадал с серверным (нет гидрации из-за window/localStorage).
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Box } from "@radix-ui/themes"
import UserCard from "@/components/profile/UserCard"
import ProfileNavigation from "@/components/profile/ProfileNavigation"
import ProfileInfo from "@/components/profile/ProfileInfo"
import ProfileEditForm from "@/components/profile/ProfileEditForm"
import IntegrationsPage from "@/components/profile/IntegrationsPage"
import AccentColorSettings from "@/components/profile/AccentColorSettings"
import QuickButtonsPage from "@/components/profile/QuickButtonsPage"
import { useTheme } from "@/components/ThemeProvider"
import { useState, useEffect } from "react"
import { createSocialLink } from "@/lib/types/social-links"
import styles from './profile.module.css'

export type TabType = 'profile' | 'edit' | 'integrations' | 'quick-buttons'

const VALID_TABS: TabType[] = ['profile', 'edit', 'integrations', 'quick-buttons']

function isValidTab(t: string): t is TabType {
  return VALID_TABS.includes(t as TabType)
}

interface ProfilePageClientProps {
  /** Начальная вкладка из URL (searchParams.tab), чтобы сервер и клиент рендерили одинаково */
  initialTabFromUrl: TabType
}

export default function ProfilePageClient({ initialTabFromUrl }: ProfilePageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTabFromUrl)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const tabFromUrl = new URLSearchParams(window.location.search).get('tab')
    if (tabFromUrl && isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl)
      return
    }
    const saved = localStorage.getItem('profileActiveTab')
    if (saved && isValidTab(saved)) {
      setActiveTab(saved)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', activeTab)
    }
  }, [activeTab])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileActiveTab' && e.newValue && isValidTab(e.newValue)) {
        setActiveTab(e.newValue as TabType)
      }
    }

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === 'profileActiveTab' && e.detail?.value && isValidTab(e.detail.value)) {
        setActiveTab(e.detail.value as TabType)
      }
    }

    const handleFocus = () => {
      const saved = localStorage.getItem('profileActiveTab')
      if (saved && isValidTab(saved)) setActiveTab(saved as TabType)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener)
    window.addEventListener('focus', handleFocus)

    const intervalId = setInterval(() => {
      const saved = localStorage.getItem('profileActiveTab')
      if (saved && isValidTab(saved)) {
        setActiveTab(prev => (prev !== saved ? (saved as TabType) : prev))
      }
    }, 200)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalId)
    }
  }, [])

  const { lightThemeAccentColor, darkThemeAccentColor, setLightThemeAccentColor, setDarkThemeAccentColor } = useTheme()

  const [userData, setUserData] = useState({
    firstName: 'Andrei',
    lastName: 'Golubenko',
    email: 'andrei.golubenko@softnetix.io',
    registrationDate: '05.09.2025 15:03',
    lastLoginDate: '08.01.2026 10:57',
    workSchedule: '11:00 - 18:30',
    workStartTime: '11:00',
    workEndTime: '18:30',
    meetingInterval: '15',
    activeEnvironment: 'Прод',
    socialLinks: [
      createSocialLink('telegram', 'talent_softnetix'),
      createSocialLink('linkedin', 'andrei-golubenko'),
    ],
  } as {
    firstName: string
    lastName: string
    email: string
    registrationDate: string
    lastLoginDate: string
    workSchedule?: string
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: {
      monday?: { start: string; end: string }
      tuesday?: { start: string; end: string }
      wednesday?: { start: string; end: string }
      thursday?: { start: string; end: string }
      friday?: { start: string; end: string }
    }
    meetingInterval: string
    activeEnvironment: string
    socialLinks?: import('@/lib/types/social-links').SocialLink[]
  })

  const handleSave = (data: {
    firstName: string
    lastName: string
    email: string
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: {
      monday?: { start: string; end: string }
      tuesday?: { start: string; end: string }
      wednesday?: { start: string; end: string }
      thursday?: { start: string; end: string }
      friday?: { start: string; end: string }
    }
    meetingInterval?: string
    socialLinks?: import('@/lib/types/social-links').SocialLink[]
  }) => {
    console.log('Сохранение данных:', data)
    setUserData(prev => {
      const updated = { ...prev, ...data }
      if (data.workStartTime && data.workEndTime) {
        updated.workSchedule = `${data.workStartTime} - ${data.workEndTime}`
        updated.workStartTime = data.workStartTime
        updated.workEndTime = data.workEndTime
        updated.workTimeByDay = undefined
      } else if (data.workTimeByDay) {
        updated.workTimeByDay = data.workTimeByDay
        updated.workSchedule = undefined
        updated.workStartTime = undefined
        updated.workEndTime = undefined
      }
      if (data.socialLinks !== undefined) updated.socialLinks = data.socialLinks
      return updated
    })
  }

  const handleCancel = () => {
    setActiveTab('profile')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo userData={userData} />
      case 'edit':
        return (
          <Flex direction="column" gap="4">
            <ProfileEditForm
              initialData={{
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                workStartTime: userData.workStartTime,
                workEndTime: userData.workEndTime,
                workTimeByDay: userData.workTimeByDay,
                meetingInterval: userData.meetingInterval,
                socialLinks: userData.socialLinks,
              }}
              onCancel={handleCancel}
              onSave={handleSave}
            />
            <AccentColorSettings
              lightThemeColor={lightThemeAccentColor}
              darkThemeColor={darkThemeAccentColor}
              onLightThemeColorChange={(color) => setLightThemeAccentColor(color)}
              onDarkThemeColorChange={(color) => setDarkThemeAccentColor(color)}
            />
          </Flex>
        )
      case 'integrations':
        return <IntegrationsPage />
      case 'quick-buttons':
        return <QuickButtonsPage />
      default:
        return null
    }
  }

  return (
    <AppLayout pageTitle="Профиль">
      <Box id="main-content-start" className={styles.profileWrapper}>
        <Flex gap="4" className={styles.profileLayout}>
          <Box className={styles.leftColumn}>
            <UserCard
              firstName={userData.firstName}
              lastName={userData.lastName}
              email={userData.email}
              telegram={userData.socialLinks?.find(l => l.platform === 'telegram')?.value}
            />
            <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </Box>
          <Box className={styles.rightColumn}>
            {renderContent()}
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}
