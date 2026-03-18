import { useState, useEffect, useCallback } from 'react'
import { Box, Flex } from '@radix-ui/themes'
import { UserCard } from '@/shared/components/profile/UserCard'
import { ProfileNavigation, type ProfileTabType } from '@/shared/components/profile/ProfileNavigation'
import { ProfileInfo } from '@/shared/components/profile/ProfileInfo'
import { ProfileEditForm } from '@/shared/components/profile/ProfileEditForm'
import { ScheduleSettingsPage } from '@/shared/components/profile/ScheduleSettingsPage'
import { IntegrationsPage } from '@/shared/components/profile/IntegrationsPage'
import QuickButtonsPage from '@/shared/components/profile/QuickButtonsPage'
import ReminderPage from '@/shared/components/profile/ReminderPage'
import AccentColorSettings from '@/shared/components/profile/AccentColorSettings'
import QuickTasksSettings from '@/shared/components/profile/QuickTasksSettings'
import { ProfileRequestsPage } from '@/shared/components/profile/ProfileRequestsPage'
import { createSocialLink } from '@/shared/lib/types/social-links'
import type { SocialLink } from '@/shared/lib/types/social-links'
import type { WorkingHours } from '@/shared/lib/types/working-hours'
import { useToast } from '@/shared/components/feedback/Toast'
import { fetchProfile, mapProfileApiToUserData, getStoredSchedule, setStoredSchedule, mergeScheduleIntoProfileData, type ProfileData } from '@/shared/api/profile'
import styles from './ProfilePage.module.css'

const VALID_TABS: ProfileTabType[] = ['profile', 'edit', 'schedule', 'theme', 'integrations', 'quick-buttons', 'reminder', 'requests', 'documents']
const TAB_STORAGE_KEY = 'profileActiveTab'

const INITIAL_USER: ProfileData = {
  firstName: 'Андрей',
  lastName: 'Голубенко',
  email: 'andrei.golubenko@softnetix.io',
  telegram: 'talent_softnetix',
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
}

export function ProfilePage() {
  const toast = useToast()
  const [userData, setUserData] = useState<ProfileData>(INITIAL_USER)

  useEffect(() => {
    fetchProfile().then((api) => {
      const baseData = api ? mapProfileApiToUserData(api, INITIAL_USER) : INITIAL_USER
      const schedule = getStoredSchedule()
      setUserData(mergeScheduleIntoProfileData(baseData, schedule))
    })
  }, [])

  const getInitialTab = useCallback((): ProfileTabType => {
    if (typeof window === 'undefined') return 'profile'
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab && VALID_TABS.includes(tab as ProfileTabType)) return tab as ProfileTabType
    const saved = localStorage.getItem(TAB_STORAGE_KEY)
    if (saved && VALID_TABS.includes(saved as ProfileTabType)) return saved as ProfileTabType
    return 'profile'
  }, [])

  const [activeTab, setActiveTabState] = useState<ProfileTabType>(getInitialTab)

  const setActiveTab = useCallback((tab: ProfileTabType) => {
    setActiveTabState(tab)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TAB_STORAGE_KEY, tab)
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab)
      window.history.replaceState({}, '', url.toString())
      window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key: TAB_STORAGE_KEY, value: tab } }))
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TAB_STORAGE_KEY && e.newValue && VALID_TABS.includes(e.newValue as ProfileTabType)) {
        setActiveTabState(e.newValue as ProfileTabType)
      }
    }
    const handleCustomChange = (e: CustomEvent) => {
      if (e.detail?.key === TAB_STORAGE_KEY && e.detail?.value && VALID_TABS.includes(e.detail.value as ProfileTabType)) {
        setActiveTabState(e.detail.value as ProfileTabType)
      }
    }
    const syncFromStorage = () => {
      const saved = localStorage.getItem(TAB_STORAGE_KEY)
      if (saved && VALID_TABS.includes(saved as ProfileTabType)) setActiveTabState(saved as ProfileTabType)
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomChange as EventListener)
    window.addEventListener('focus', syncFromStorage)
    const intervalId = setInterval(syncFromStorage, 200)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomChange as EventListener)
      window.removeEventListener('focus', syncFromStorage)
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const currentTab = url.searchParams.get('tab')
      if (currentTab !== activeTab) url.searchParams.set('tab', activeTab)
      if (url.toString() !== window.location.href) window.history.replaceState({}, '', url.toString())
    }
  }, [activeTab])

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo userData={userData} />
      case 'edit':
        return (
          <ProfileEditForm
              initialData={{
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                socialLinks: userData.socialLinks,
              }}
              onCancel={() => setActiveTab('profile')}
              onSave={(data) => {
                const telegramLink = (data.socialLinks ?? []).find((l: SocialLink) => l.platform === 'telegram')
                const telegram = telegramLink?.value ?? ''
                setUserData((prev) => ({
                  ...prev,
                  ...data,
                  telegram,
                  socialLinks: data.socialLinks ?? prev.socialLinks,
                }))
                toast.showSuccess('Профиль сохранён', 'Изменения успешно применены')
                setActiveTab('profile')
              }}
            />
        )
      case 'schedule':
        return (
          <ScheduleSettingsPage
            initialData={{
              workStartTime: userData.workStartTime,
              workEndTime: userData.workEndTime,
              workTimeByDay: userData.workTimeByDay,
              meetingInterval: userData.meetingInterval,
            }}
            onCancel={() => setActiveTab('profile')}
            onSave={(data) => {
              const workTimeByDay = data.workTimeByDay as WorkingHours['custom'] | undefined
              const workSchedule =
                data.workStartTime && data.workEndTime
                  ? `${data.workStartTime} - ${data.workEndTime}`
                  : undefined
              setStoredSchedule({
                workStartTime: data.workStartTime,
                workEndTime: data.workEndTime,
                workTimeByDay,
                meetingInterval: data.meetingInterval,
              })
              setUserData((prev) => ({
                ...prev,
                ...data,
                workTimeByDay,
                workSchedule: workTimeByDay ? '' : (workSchedule ?? prev.workSchedule),
              }))
              toast.showSuccess('Расписание сохранено', 'Изменения успешно применены')
              setActiveTab('profile')
            }}
          />
        )
      case 'theme':
        return (
          <Flex direction="column" gap="4">
            <AccentColorSettings />
            <QuickTasksSettings />
          </Flex>
        )
      case 'integrations':
        return <IntegrationsPage />
      case 'quick-buttons':
        return <QuickButtonsPage />
      case 'reminder':
        return <ReminderPage />
      case 'requests':
        return <ProfileRequestsPage blockFilter="requests" />
      case 'documents':
        return <ProfileRequestsPage blockFilter="documents" />
      default:
        return null
    }
  }

  return (
    <Box id="main-content-start" className={styles.profileWrapper}>
      <Flex gap="4" className={styles.profileLayout}>
        <Box className={styles.leftColumn}>
          <UserCard
            firstName={userData.firstName}
            lastName={userData.lastName}
            email={userData.email}
            telegram={userData.socialLinks?.find((l) => l.platform === 'telegram')?.value}
          />
          <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </Box>
        <Box className={styles.rightColumn}>{renderContent()}</Box>
      </Flex>
    </Box>
  )
}
