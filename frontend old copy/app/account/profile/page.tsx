/**
 * ProfilePage (profile/page.tsx) - Страница профиля пользователя
 *
 * Серверный компонент: читает ?tab= из URL и передаёт начальную вкладку в клиент,
 * чтобы первый рендер совпадал на сервере и клиенте (избегаем hydration mismatch).
 */

import ProfilePageClient from './ProfilePageClient'

type TabType = 'profile' | 'edit' | 'integrations' | 'quick-buttons'

const VALID_TABS: TabType[] = ['profile', 'edit', 'integrations', 'quick-buttons']

function getInitialTabFromSearchParams(searchParams: { tab?: string } | null): TabType {
  const tab = searchParams?.tab
  if (tab && VALID_TABS.includes(tab as TabType)) {
    return tab as TabType
  }
  return 'profile'
}

interface ProfilePageProps {
  searchParams?: { tab?: string } | Promise<{ tab?: string }>
}

export default async function ProfilePage(props: ProfilePageProps) {
  const searchParams = typeof props.searchParams?.then === 'function'
    ? await props.searchParams
    : props.searchParams ?? {}
  const initialTabFromUrl = getInitialTabFromSearchParams(searchParams)

  return <ProfilePageClient initialTabFromUrl={initialTabFromUrl} />
}
