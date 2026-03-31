import type { ProfileTabType } from '@/components/profile/ProfileNavigation'

export const VALID_PROFILE_TABS: ProfileTabType[] = [
  'profile',
  'edit',
  'schedule',
  'theme',
  'localization',
  'integrations',
  'quick-buttons',
  'reminder',
  'requests',
  'documents',
]

export const PROFILE_TAB_STORAGE_KEY = 'profileActiveTab'

export function isValidProfileTab(value: string | null | undefined): value is ProfileTabType {
  return !!value && VALID_PROFILE_TABS.includes(value as ProfileTabType)
}

export function resolveInitialProfileTab(
  searchTabValue: string | null | undefined,
  storageTabValue: string | null | undefined
): ProfileTabType {
  if (isValidProfileTab(searchTabValue)) return searchTabValue
  if (isValidProfileTab(storageTabValue)) return storageTabValue
  return 'profile'
}
