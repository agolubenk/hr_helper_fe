'use client'

import { Flex, Box } from '@radix-ui/themes'
import { EnvelopeClosedIcon, CopyIcon } from '@radix-ui/react-icons'
import { BiLogoTelegram } from 'react-icons/bi'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { SocialLink } from '@/lib/types/social-links'
import { getPlatformInfo, getSocialUrl } from '@/lib/socialPlatforms'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './SocialLinks.module.css'

interface SocialLinksProps {
  links: SocialLink[]
  email?: string
  telegram?: string
  emptyMessage?: string
}

function formatNicknameTooltip(platform: SocialLink['platform'], value: string): string {
  const v = value.trim()
  if (platform === 'telegram') {
    return `@${v.replace(/^@/, '')}`
  }
  return v
}

function SocialLinkWithCopy({
  href,
  title,
  children,
  copyValue,
  backgroundColor,
  nicknameTooltip,
  showNicknameTooltip,
}: {
  href: string
  title: string
  children: React.ReactNode
  copyValue: string
  backgroundColor: string
  nicknameTooltip: string
  showNicknameTooltip: boolean
}) {
  const toast = useToast()

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(copyValue).then(
      () => toast.showSuccess('Скопировано', 'Ссылка скопирована в буфер обмена'),
      () => toast.showError('Ошибка', 'Не удалось скопировать')
    )
  }

  const anchor = (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
      className={styles.socialLinkButton}
      style={{ backgroundColor }}
      title={showNicknameTooltip ? undefined : title}
    >
      {children}
    </a>
  )

  return (
    <Box className={styles.socialLinkWrapper}>
      {showNicknameTooltip ? (
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{anchor}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className={styles.nicknameTooltipContent}
              sideOffset={8}
              side="bottom"
            >
              {nicknameTooltip}
              <Tooltip.Arrow className={styles.nicknameTooltipArrow} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      ) : (
        anchor
      )}
      <button
        type="button"
        className={styles.copyButton}
        onClick={handleCopy}
        title="Копировать ссылку"
        aria-label="Копировать ссылку"
      >
        <CopyIcon width={12} height={12} />
      </button>
    </Box>
  )
}

export default function SocialLinks({
  links,
  email,
  telegram,
  emptyMessage = 'Социальные сети не добавлены',
}: SocialLinksProps) {
  const hasEmail = Boolean(email?.trim())
  const hasTelegram = Boolean(telegram?.trim())
  const hasLinks = links && links.length > 0
  const hasTelegramInLinks = hasLinks && links.some((l) => l.platform === 'telegram')
  const showTelegramStandalone = hasTelegram && !hasTelegramInLinks

  const linkEntries = (links ?? [])
    .map((link) => {
      const url = getSocialUrl(link.platform as Parameters<typeof getSocialUrl>[0], link.value)
      if (!url) return null
      return { link, url }
    })
    .filter(Boolean) as { link: SocialLink; url: string }[]

  const socialIconCount = linkEntries.length + (showTelegramStandalone ? 1 : 0)
  const showNicknameTooltip = socialIconCount >= 2

  if (!hasEmail && !showTelegramStandalone && linkEntries.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  const standaloneTgUrl = showTelegramStandalone
    ? `https://t.me/${telegram!.replace(/^@/, '')}`
    : ''
  const standaloneNickname = showTelegramStandalone
    ? `@${telegram!.replace(/^@/, '')}`
    : ''

  return (
    <Tooltip.Provider delayDuration={250}>
      <div className={styles.socialLinks}>
        {hasEmail && (
          <SocialLinkWithCopy
            href={`mailto:${email}`}
            title={`Email: ${email}`}
            copyValue={email!}
            backgroundColor="#EA4335"
            nicknameTooltip={email!}
            showNicknameTooltip={false}
          >
            <Flex align="center" justify="center" style={{ width: 24, height: 24 }}>
              <EnvelopeClosedIcon width={16} height={16} style={{ color: '#fff' }} />
            </Flex>
          </SocialLinkWithCopy>
        )}
        {showTelegramStandalone && (
          <SocialLinkWithCopy
            href={standaloneTgUrl}
            title={`Telegram: ${telegram}`}
            copyValue={standaloneTgUrl}
            backgroundColor="#0088cc"
            nicknameTooltip={standaloneNickname}
            showNicknameTooltip={showNicknameTooltip}
          >
            <Flex align="center" justify="center" style={{ width: 24, height: 24 }}>
              <BiLogoTelegram size={16} style={{ color: '#fff' }} />
            </Flex>
          </SocialLinkWithCopy>
        )}
        {linkEntries.map(({ link, url }) => {
          const info = getPlatformInfo(link.platform)
          return (
            <SocialLinkWithCopy
              key={link.id}
              href={url}
              title={`${info.name}: ${link.value}`}
              copyValue={url}
              backgroundColor={info.color}
              nicknameTooltip={formatNicknameTooltip(link.platform, link.value)}
              showNicknameTooltip={showNicknameTooltip}
            >
              <Flex align="center" justify="center" style={{ width: 24, height: 24 }}>
                {info.icon}
              </Flex>
            </SocialLinkWithCopy>
          )
        })}
      </div>
    </Tooltip.Provider>
  )
}
