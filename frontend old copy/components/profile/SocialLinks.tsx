'use client'

/**
 * SocialLinks - отображение социальных кнопок на странице профиля
 */
import { Flex } from '@radix-ui/themes'
import type { SocialLink } from '@/lib/types/social-links'
import { getPlatformInfo, getSocialUrl } from '@/lib/socialPlatforms'
import styles from './SocialLinks.module.css'

interface SocialLinksProps {
  links: SocialLink[]
}

export default function SocialLinks({ links }: SocialLinksProps) {
  if (!links || links.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Социальные сети не добавлены</p>
      </div>
    )
  }

  return (
    <div className={styles.socialLinks}>
      {links.map((link) => {
        const info = getPlatformInfo(link.platform)
        const url = getSocialUrl(link.platform as Parameters<typeof getSocialUrl>[0], link.value)
        if (!url) return null

        return (
          <a
            key={link.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLinkButton}
            style={{ backgroundColor: info.color }}
            title={`${info.name}: ${link.value}`}
          >
            <Flex align="center" justify="center" style={{ width: 24, height: 24 }}>
              {info.icon}
            </Flex>
          </a>
        )
      })}
    </div>
  )
}
