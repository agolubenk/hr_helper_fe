/**
 * Логика сравнения кандидатов при подозрении на дубликат (моки до API).
 */
import type { AtsCandidate } from './mocks'
import type { SocialPlatformKey } from '@/lib/socialPlatforms'
import { RECR_CHAT_SOCIAL_PLATFORMS } from '@/lib/socialPlatforms'

/** Нормализация подписи поля social (как в UI ATS) → ключ платформы */
function labelNormalizedToPlatformKey(normalized: string): SocialPlatformKey | undefined {
  const map: Record<string, SocialPlatformKey> = {
    whatsapp: 'whatsapp',
    viber: 'viber',
    telegram: 'telegram',
    wechat: 'wechat',
    teams: 'teams',
    msteams: 'teams',
    microsoftteams: 'teams',
    vk: 'vk',
    odnoklassniki: 'odnoklassniki',
    habr: 'habr',
    habrcareer: 'habrCareer',
    'хабркарьера': 'habrCareer',
    vcru: 'vcRu',
    zen: 'zen',
    pikabu: 'pikabu',
    linkedin: 'linkedin',
    xing: 'xing',
    github: 'github',
    gitlab: 'gitlab',
    bitbucket: 'bitbucket',
    stackoverflow: 'stackoverflow',
    devto: 'devTo',
    kaggle: 'kaggle',
    dribbble: 'dribbble',
    behance: 'behance',
    pinterest: 'pinterest',
    instagram: 'instagram',
    facebook: 'facebook',
    twitter: 'twitter',
    x: 'twitter',
    youtube: 'youtube',
    medium: 'medium',
    reddit: 'reddit',
    discord: 'discord',
  }
  return map[normalized]
}

export function getCandidateEmailsForCompare(candidate: Record<string, unknown>): string[] {
  const emails = candidate.emails
  if (Array.isArray(emails)) return emails.filter((e): e is string => typeof e === 'string')
  const email = candidate.email
  if (typeof email === 'string' && email.trim()) return [email.trim()]
  return []
}

export function getCandidatePhonesForCompare(candidate: Record<string, unknown>): string[] {
  const phones = candidate.phones
  if (Array.isArray(phones)) return phones.filter((p): p is string => typeof p === 'string')
  const phone = candidate.phone
  if (typeof phone === 'string' && phone.trim()) return [phone.trim()]
  return []
}

/** Контакты по платформе: plural keys на объекте (мок дубликата) или `social` с человекочитаемыми ключами */
export function getSocialContactsForDuplicateCompare(
  candidate: Record<string, unknown>,
  platform: SocialPlatformKey
): string[] {
  const pluralKey = `${platform}s`
  const pluralVal = candidate[pluralKey]
  if (Array.isArray(pluralVal)) {
    return pluralVal.filter((x): x is string => typeof x === 'string')
  }
  const single = candidate[platform]
  if (typeof single === 'string' && single.trim()) return [single.trim()]

  const social = candidate.social
  if (social && typeof social === 'object' && !Array.isArray(social)) {
    const rec = social as Record<string, string | string[]>
    for (const [label, val] of Object.entries(rec)) {
      const norm = label.toLowerCase().replace(/\s+/g, '')
      if (labelNormalizedToPlatformKey(norm) === platform) {
        if (Array.isArray(val)) return val.map(String).filter(Boolean)
        return val ? [String(val)] : []
      }
    }
  }
  return []
}

export function duplicateFieldIsMatch(value1: unknown, value2: unknown): boolean {
  if (value1 === value2) return true
  if (typeof value1 === 'string' && typeof value2 === 'string') {
    return value1.toLowerCase().trim() === value2.toLowerCase().trim()
  }
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return value1.some((v1) => value2.some((v2) => duplicateFieldIsMatch(v1, v2)))
  }
  return false
}

export function hasMatchingDuplicateContacts(contacts1: string[], contacts2: string[]): boolean {
  return contacts1.some((c1) => contacts2.some((c2) => duplicateFieldIsMatch(c1, c2)))
}

export function isDuplicateContactMatch(contact: string, otherContacts: string[]): boolean {
  return otherContacts.some((c) => duplicateFieldIsMatch(contact, c))
}

export function calculateDuplicateProbability(
  candidate1: Record<string, unknown>,
  candidate2: Record<string, unknown>
): number {
  let matches = 0
  let totalChecks = 0

  totalChecks += 2
  if (duplicateFieldIsMatch(candidate1.name, candidate2.name)) matches += 2

  totalChecks += 1
  if (duplicateFieldIsMatch(candidate1.position, candidate2.position)) matches += 1

  const emails1 = getCandidateEmailsForCompare(candidate1)
  const emails2 = getCandidateEmailsForCompare(candidate2)
  if (emails1.length > 0 && emails2.length > 0) {
    totalChecks += 2
    if (hasMatchingDuplicateContacts(emails1, emails2)) matches += 2
  }

  const phones1 = getCandidatePhonesForCompare(candidate1)
  const phones2 = getCandidatePhonesForCompare(candidate2)
  if (phones1.length > 0 && phones2.length > 0) {
    totalChecks += 2
    if (hasMatchingDuplicateContacts(phones1, phones2)) matches += 2
  }

  RECR_CHAT_SOCIAL_PLATFORMS.forEach((platform) => {
    const c1 = getSocialContactsForDuplicateCompare(candidate1, platform)
    const c2 = getSocialContactsForDuplicateCompare(candidate2, platform)
    if (c1.length > 0 && c2.length > 0) {
      totalChecks += 1
      if (hasMatchingDuplicateContacts(c1, c2)) matches += 1
    }
  })

  if (candidate1.location && candidate2.location) {
    totalChecks += 1
    if (duplicateFieldIsMatch(candidate1.location, candidate2.location)) matches += 1
  }

  if (candidate1.age != null && candidate2.age != null) {
    totalChecks += 1
    if (candidate1.age === candidate2.age) matches += 1
  }

  const tags1 = candidate1.tags
  const tags2 = candidate2.tags
  if (Array.isArray(tags1) && Array.isArray(tags2) && tags1.length > 0 && tags2.length > 0) {
    totalChecks += 1
    if (duplicateFieldIsMatch(tags1, tags2)) matches += 1
  }

  if (totalChecks === 0) return 0
  const probability = Math.round((matches / totalChecks) * 100)
  return Math.min(100, Math.max(0, probability))
}

/** Мок «второй» карточки для сравнения (как в legacy app/ats) — позже заменить ответом API */
export const MOCK_DUPLICATE_CANDIDATE_FOR_COMPARE: Record<string, unknown> = {
  id: '1-duplicate',
  name: 'John Doe',
  position: 'Senior Developer',
  avatar: 'JD',
  email: 'john@example.com',
  emails: ['john@example.com'],
  phone: '+1 (555) 123-4567',
  phones: ['+1 (555) 123-4567'],
  location: 'New York, USA',
  vacancy: 'Frontend Senior',
  status: 'New',
  source: 'LinkedIn',
  applied: 'Jan 15, 2026',
  level: 'Senior',
  tags: ['React', 'TypeScript', 'Senior'],
  age: 32,
  gender: 'Мужской',
  salaryExpectations: '150,000 - 200,000 USD',
  telegrams: ['@johndoe', '@johndoe_new'],
  whatsapps: ['+15551234567'],
  facebooks: ['johndoe'],
  linkedins: ['/in/johndoe'],
}
