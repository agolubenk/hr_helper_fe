import { Flex, Box } from '@radix-ui/themes'
import { EnvelopeClosedIcon, CopyIcon } from '@radix-ui/react-icons'
import { BiLogoTelegram } from 'react-icons/bi'
import type { SocialLink } from '@/shared/lib/types/social-links'
import { getPlatformInfo, getSocialUrl } from '@/shared/lib/socialPlatforms'
import { useToast } from '@/shared/components/feedback/Toast'
import styles from './SocialLinks.module.css'

interface SocialLinksProps {
  links: SocialLink[]
  email?: string
  telegram?: string
  /** Сообщение при пустом списке (по умолчанию для секции соцсетей) */
  emptyMessage?: string
}

function SocialLinkWithCopy({
  href,
  title,
  children,
  copyValue,
  backgroundColor,
}: {
  href: string
  title: string
  children: React.ReactNode
  copyValue: string
  backgroundColor: string
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

  return (
    <Box className={styles.socialLinkWrapper}>
      <a
        href={href}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
        className={styles.socialLinkButton}
        style={{ backgroundColor }}
        title={title}
      >
        {children}
      </a>
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

export function SocialLinks({ links, email, telegram, emptyMessage = 'Социальные сети не добавлены' }: SocialLinksProps) {
  const hasEmail = Boolean(email?.trim())
  const hasTelegram = Boolean(telegram?.trim())
  const hasLinks = links && links.length > 0
  const hasTelegramInLinks = hasLinks && links.some((l) => l.platform === 'telegram')
  const showTelegramStandalone = hasTelegram && !hasTelegramInLinks

  if (!hasEmail && !showTelegramStandalone && !hasLinks) {
    return (
      <div className={styles.empty}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={styles.socialLinks}>
      {hasEmail && (
        <SocialLinkWithCopy
          href={`mailto:${email}`}
          title={`Email: ${email}`}
          copyValue={`mailto:${email}`}
          backgroundColor="#EA4335"
        >
          <Flex align="center" justify="center" style={{ width: 24, height: 24 }}>
            <EnvelopeClosedIcon width={16} height={16} style={{ color: '#fff' }} />
          </Flex>
        </SocialLinkWithCopy>
      )}
      {showTelegramStandalone && (
        <SocialLinkWithCopy
          href={`https://t.me/${telegram!.replace(/^@/, '')}`}
          title={`Telegram: ${telegram}`}
          copyValue={`https://t.me/${telegram!.replace(/^@/, '')}`}
          backgroundColor="#0088cc"
        >
          <Flex align="center" justify="center" style={{ width: 24, height: 24 }}>
            <BiLogoTelegram size={16} style={{ color: '#fff' }} />
          </Flex>
        </SocialLinkWithCopy>
      )}
      {links.map((link) => {
        const info = getPlatformInfo(link.platform)
        const url = getSocialUrl(link.platform, link.value)
        if (!url) return null
        return (
          <SocialLinkWithCopy
            key={link.id}
            href={url}
            title={`${info.name}: ${link.value}`}
            copyValue={url}
            backgroundColor={info.color}
          >
            <Flex align="center" justify="center" style={{ width: 24, height: 24 }}>
              {info.icon}
            </Flex>
          </SocialLinkWithCopy>
        )
      })}
    </div>
  )
}
