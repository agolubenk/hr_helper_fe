import { describe, expect, it } from 'vitest'
import { createSocialLink } from '@/lib/types/social-links'
import { getAvailableSocialPlatforms } from '@/components/profile/socialLinksUtils'

describe('socialLinksUtils', () => {
  it('hides platform when max links per platform is reached', () => {
    const links = [
      createSocialLink('telegram', 'user-1', { id: '1' }),
      createSocialLink('telegram', 'user-2', { id: '2' }),
      createSocialLink('telegram', 'user-3', { id: '3' }),
    ]

    const available = getAvailableSocialPlatforms(links, null)
    expect(available.includes('telegram')).toBe(false)
  })

  it('keeps current platform available in edit mode', () => {
    const links = [
      createSocialLink('telegram', 'user-1', { id: '1' }),
      createSocialLink('telegram', 'user-2', { id: '2' }),
      createSocialLink('telegram', 'user-3', { id: '3' }),
    ]

    const available = getAvailableSocialPlatforms(links, 'telegram')
    expect(available.includes('telegram')).toBe(true)
  })
})
