import { apiClient } from './client'
import type { SocialLink } from '@/shared/lib/types/social-links'
import type { WorkingHours } from '@/shared/lib/types/working-hours'

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
}

/** Формат ответа UnifiedResponseHandler */
interface ApiWrapper<T> {
  success?: boolean
  data?: T
  message?: string
}

function formatTimeFromApi(value: string | undefined): string {
  if (!value) return ''
  // API может вернуть "11:00:00" — оставляем "11:00"
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

export interface ProfileData {
  firstName: string
  lastName: string
  email: string
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

const PROFILE_ENDPOINT = 'v1/accounts/users/profile/'
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

export async function fetchProfile(): Promise<ProfileApiResponse | null> {
  try {
    const res = await apiClient.get<ApiWrapper<ProfileApiResponse> | ProfileApiResponse>(PROFILE_ENDPOINT)
    const data = res && typeof res === 'object' && 'data' in res ? (res as ApiWrapper<ProfileApiResponse>).data : (res as ProfileApiResponse)
    return data ?? null
  } catch {
    return null
  }
}
