import type { SocialLink } from '@/lib/types/social-links'
import type { WorkingHours } from '@/lib/types/working-hours'
import { getApiUrl } from '@/lib/api'

export interface ProfileApiResponse {
  id?: number
  first_name?: string
  last_name?: string
  email?: string
  username?: string
  telegram_username?: string
  date_joined?: string
  last_login?: string
  interview_start_time?: string
  interview_end_time?: string
  meeting_interval_minutes?: number
  work_time_by_day?: WorkingHours['custom']
  social_links?: SocialLink[]
  role?: string
  user_role?: string
  groups?: string[]
  permissions?: string[]
}

export interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  telegram: string
  registrationDate: string
  lastLoginDate: string
  workSchedule: string
  workStartTime: string
  workEndTime: string
  meetingInterval: string
  activeEnvironment: string
  socialLinks: SocialLink[]
  workTimeByDay?: WorkingHours['custom']
}

function formatTimeFromApi(value: string | undefined): string {
  if (!value) return ''
  const match = value.match(/^(\d{1,2}):(\d{2})/)
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : value
}

function formatDateFromApi(value: string | undefined): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return value
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function mapProfileApiToUserData(
  api: ProfileApiResponse | null | undefined,
  fallback: ProfileData
): ProfileData {
  if (!api) return fallback
  const workStart = formatTimeFromApi(api.interview_start_time) || fallback.workStartTime
  const workEnd = formatTimeFromApi(api.interview_end_time) || fallback.workEndTime
  const meetingInterval =
    api.meeting_interval_minutes != null ? String(api.meeting_interval_minutes) : fallback.meetingInterval
  const workSchedule = workStart && workEnd ? `${workStart} - ${workEnd}` : fallback.workSchedule
  return {
    firstName: api.first_name ?? fallback.firstName,
    lastName: api.last_name ?? fallback.lastName,
    email: api.email ?? fallback.email,
    telegram: api.telegram_username ?? fallback.telegram,
    registrationDate: formatDateFromApi(api.date_joined) || fallback.registrationDate,
    lastLoginDate: formatDateFromApi(api.last_login) || fallback.lastLoginDate,
    workSchedule,
    workStartTime: workStart,
    workEndTime: workEnd,
    meetingInterval,
    activeEnvironment: fallback.activeEnvironment,
    socialLinks: api.social_links ?? fallback.socialLinks,
    workTimeByDay: api.work_time_by_day ?? fallback.workTimeByDay,
  }
}

function isProfileApiEnabled(): boolean {
  return import.meta.env?.VITE_USE_PROFILE_API === 'true'
}

const SCHEDULE_STORAGE_KEY = 'profileSchedule'

export interface StoredSchedule {
  workStartTime?: string
  workEndTime?: string
  workTimeByDay?: WorkingHours['custom']
  meetingInterval?: string
}

export function getStoredSchedule(): StoredSchedule | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SCHEDULE_STORAGE_KEY) : null
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSchedule
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function setStoredSchedule(schedule: StoredSchedule): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule))
  }
}

export function mergeScheduleIntoProfileData(
  data: ProfileData,
  schedule: StoredSchedule | null
): ProfileData {
  if (!schedule) return data
  const workSchedule =
    schedule.workStartTime && schedule.workEndTime
      ? `${schedule.workStartTime} - ${schedule.workEndTime}`
      : data.workSchedule
  return {
    ...data,
    workStartTime: schedule.workStartTime ?? data.workStartTime,
    workEndTime: schedule.workEndTime ?? data.workEndTime,
    meetingInterval: schedule.meetingInterval ?? data.meetingInterval,
    workTimeByDay: schedule.workTimeByDay ?? data.workTimeByDay,
    workSchedule,
  }
}

/** Мок: в fe_migration API не вызывается, возвращаем null */
export async function fetchProfile(): Promise<ProfileApiResponse | null> {
  if (!isProfileApiEnabled()) return null

  const tryEndpoints = ['accounts/profile/', 'accounts/me/']
  for (const endpoint of tryEndpoints) {
    try {
      const response = await fetch(getApiUrl(endpoint), { credentials: 'include' })
      if (!response.ok) continue
      const json = await response.json()
      const payload = (json?.data ?? json) as ProfileApiResponse | null
      if (payload && typeof payload === 'object') return payload
    } catch {
      // fallback to next endpoint
    }
  }
  return null
}

export interface SaveProfilePayload {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

export type ProfileApiErrorCode =
  | 'API_DISABLED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'UNKNOWN'

export interface ProfileApiResult {
  ok: boolean
  status?: number
  code?: ProfileApiErrorCode
}

function mapStatusToProfileApiCode(status?: number): ProfileApiErrorCode {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 400 || status === 422) return 'VALIDATION'
  return 'UNKNOWN'
}

export async function saveProfile(payload: SaveProfilePayload): Promise<ProfileApiResult> {
  if (!isProfileApiEnabled()) return { ok: true, code: 'API_DISABLED' }
  try {
    const response = await fetch(getApiUrl('accounts/profile/'), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
      }),
    })
    if (response.ok) {
      return { ok: true, status: response.status }
    }
    return { ok: false, status: response.status, code: mapStatusToProfileApiCode(response.status) }
  } catch {
    return { ok: false, code: 'NETWORK' }
  }
}

export async function saveProfileSocialLinks(links: SocialLink[]): Promise<ProfileApiResult> {
  if (!isProfileApiEnabled()) return { ok: true, code: 'API_DISABLED' }
  try {
    const response = await fetch(getApiUrl('accounts/profile/social-links/'), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ social_links: links }),
    })
    if (response.ok) {
      return { ok: true, status: response.status }
    }
    return { ok: false, status: response.status, code: mapStatusToProfileApiCode(response.status) }
  } catch {
    return { ok: false, code: 'NETWORK' }
  }
}

/** Мок: фраза-напоминание хранится в localStorage */
const REMINDER_STORAGE_KEY = 'profileReminderPhrase'

export async function fetchReminderPhrase(): Promise<string> {
  if (typeof window === 'undefined') return ''
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY)
    return (raw ?? '').trim()
  } catch {
    return ''
  }
}

export async function saveReminderPhrase(phrase: string): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, phrase.trim())
    return true
  } catch {
    return false
  }
}
