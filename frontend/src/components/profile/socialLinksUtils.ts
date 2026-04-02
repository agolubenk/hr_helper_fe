import type { SocialLink } from '@/lib/types/social-links'
import type { SocialPlatformKey } from '@/lib/socialPlatforms'
import { SOCIAL_PLATFORM_KEYS } from '@/lib/socialPlatforms'

export const MAX_SOCIAL_LINKS_PER_PLATFORM = 3

export function getAvailableSocialPlatforms(
  links: SocialLink[],
  editingPlatform?: SocialPlatformKey | null
): SocialPlatformKey[] {
  const counts: Partial<Record<SocialPlatformKey, number>> = {}
  for (const link of links) {
    counts[link.platform] = (counts[link.platform] || 0) + 1
  }

  return SOCIAL_PLATFORM_KEYS.filter((platform) => {
    if (editingPlatform === platform) return true
    return (counts[platform] || 0) < MAX_SOCIAL_LINKS_PER_PLATFORM
  })
}
