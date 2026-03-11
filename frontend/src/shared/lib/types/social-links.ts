/**
 * Типы для социальных ссылок пользователя
 */
import type { SocialPlatformKey } from '@/shared/lib/socialPlatforms'

export interface SocialLink {
  id: string
  platform: SocialPlatformKey
  value: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export function createSocialLink(
  platform: SocialPlatformKey,
  value: string,
  overrides?: Partial<SocialLink>
): SocialLink {
  const now = new Date().toISOString()
  return {
    id: overrides?.id ?? crypto.randomUUID(),
    platform,
    value: value.trim(),
    isPublic: overrides?.isPublic ?? true,
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
    ...overrides,
  }
}
