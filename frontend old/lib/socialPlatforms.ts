/**
 * Конфигурация социальных сетей и мессенджеров
 * Расширенный список: ИТ, СНГ, международные платформы
 */
import React, { type ReactNode } from 'react'
import {
  BiLogoWhatsapp,
  BiLogoTelegram,
  BiLogoVk,
  BiLogoLinkedin,
  BiLogoDribbble,
  BiLogoBehance,
  BiLogoPinterest,
  BiLogoGithub,
  BiLogoInstagram,
  BiLogoFacebook,
  BiLogoTwitter,
  BiLogoYoutube,
  BiCodeAlt,
} from 'react-icons/bi'
import { SiViber, SiKaggle, SiDiscord, SiGitlab, SiBitbucket, SiStackoverflow } from 'react-icons/si'
import { FaReddit, FaMedium } from 'react-icons/fa'

/** Ключи платформ (camelCase для совместимости с API) */
export const SOCIAL_PLATFORM_KEYS = [
  // Мессенджеры
  'whatsapp',
  'viber',
  'telegram',
  'wechat',
  'skype',
  // Соцсети СНГ
  'vk',
  'odnoklassniki',
  'habr',
  'habrCareer',
  'vcRu',
  'zen',
  'pikabu',
  // Профессиональные / ИТ
  'linkedin',
  'xing',
  'github',
  'gitlab',
  'bitbucket',
  'stackoverflow',
  'devTo',
  'kaggle',
  // Дизайн и креатив
  'dribbble',
  'behance',
  'figma',
  'pinterest',
  // Общие соцсети
  'instagram',
  'facebook',
  'twitter',
  'youtube',
  'medium',
  'reddit',
  'discord',
] as const

export type SocialPlatformKey = (typeof SOCIAL_PLATFORM_KEYS)[number]

export interface SocialPlatformConfig {
  key: SocialPlatformKey
  label: string
  color: string
  urlPattern: (value: string) => string
  placeholder: string
}

const iconSize = 16

/** Получение URL для платформы */
export const getSocialUrl = (platform: SocialPlatformKey, value: string): string => {
  if (!value) return ''
  const clean = value.replace(/^[@\/]/, '')

  const patterns: Record<SocialPlatformKey, (v: string) => string> = {
    whatsapp: (v) => `https://wa.me/${v.replace(/[^\d]/g, '')}`,
    viber: (v) => `viber://chat?number=${v.replace(/[^\d]/g, '')}`,
    telegram: (v) => `https://t.me/${clean}`,
    wechat: (v) => `https://weixin.qq.com/`,
    skype: (v) => `skype:${clean}?chat`,
    vk: (v) => `https://vk.com/${clean}`,
    odnoklassniki: (v) => `https://ok.ru/${clean}`,
    habr: (v) => `https://habr.com/ru/users/${clean}`,
    habrCareer: (v) => `https://career.habr.com/${clean}`,
    vcRu: (v) => `https://vc.ru/users/${clean}`,
    zen: (v) => `https://dzen.ru/${clean}`,
    pikabu: (v) => `https://pikabu.ru/@${clean}`,
    linkedin: (v) =>
      v.startsWith('http') ? v : `https://linkedin.com${v.startsWith('/') ? v : '/in/' + v}`,
    xing: (v) => `https://www.xing.com/profile/${clean}`,
    github: (v) => `https://github.com/${clean}`,
    gitlab: (v) => `https://gitlab.com/${clean}`,
    bitbucket: (v) => `https://bitbucket.org/${clean}`,
    stackoverflow: (v) =>
      v.startsWith('http') ? v : `https://stackoverflow.com/users/${clean}`,
    devTo: (v) => `https://dev.to/${clean}`,
    kaggle: (v) => `https://kaggle.com/${clean}`,
    dribbble: (v) => `https://dribbble.com/${clean}`,
    behance: (v) => `https://behance.net/${clean}`,
    figma: (v) => `https://figma.com/@${clean}`,
    pinterest: (v) => `https://pinterest.com/${clean}`,
    instagram: (v) => `https://instagram.com/${clean}`,
    facebook: (v) => `https://facebook.com/${clean}`,
    twitter: (v) => `https://twitter.com/${clean}`,
    youtube: (v) =>
      v.startsWith('http') ? v : `https://youtube.com/${v.startsWith('@') ? v : 'channel/' + v}`,
    medium: (v) => `https://medium.com/@${clean}`,
    reddit: (v) => `https://reddit.com/user/${clean}`,
    discord: (v) => (v.startsWith('http') ? v : `https://discord.com/users/${clean}`),
  }
  return patterns[platform]?.(value) ?? ''
}

/** Получение информации о платформе (название, цвет, иконка) */
export const getPlatformInfo = (platform: string) => {
  const config = SOCIAL_PLATFORMS[platform as SocialPlatformKey]
  if (config) {
    return { name: config.label, color: config.color, icon: config.icon }
  }
  return {
    name: platform,
    color: '#6B7280',
    icon: React.createElement(BiCodeAlt, { size: iconSize }),
  }
}

/** Конфигурация платформ с иконками */
export const SOCIAL_PLATFORMS: Record<
  SocialPlatformKey,
  { label: string; color: string; icon: ReactNode; urlPattern: (v: string) => string }
> = {
  whatsapp: {
    label: 'WhatsApp',
    color: '#25D366',
    icon: <BiLogoWhatsapp size={iconSize} />,
    urlPattern: (v) => getSocialUrl('whatsapp', v),
  },
  viber: {
    label: 'Viber',
    color: '#665CAC',
    icon: <SiViber size={iconSize} />,
    urlPattern: (v) => getSocialUrl('viber', v),
  },
  telegram: {
    label: 'Telegram',
    color: '#0088cc',
    icon: <BiLogoTelegram size={iconSize} />,
    urlPattern: (v) => getSocialUrl('telegram', v),
  },
  wechat: {
    label: 'WeChat',
    color: '#09BB07',
    icon: <BiLogoWhatsapp size={iconSize} />, // Нет иконки WeChat в react-icons/bi, используем похожую
    urlPattern: (v) => getSocialUrl('wechat', v),
  },
  skype: {
    label: 'Skype',
    color: '#00AFF0',
    icon: <BiLogoTelegram size={iconSize} />,
    urlPattern: (v) => getSocialUrl('skype', v),
  },
  vk: {
    label: 'VK',
    color: '#0077FF',
    icon: <BiLogoVk size={iconSize} />,
    urlPattern: (v) => getSocialUrl('vk', v),
  },
  odnoklassniki: {
    label: 'Одноклассники',
    color: '#EE8208',
    icon: <BiLogoVk size={iconSize} />,
    urlPattern: (v) => getSocialUrl('odnoklassniki', v),
  },
  habr: {
    label: 'Хабр',
    color: '#2A7DE1',
    icon: <BiCodeAlt size={iconSize} />,
    urlPattern: (v) => getSocialUrl('habr', v),
  },
  habrCareer: {
    label: 'Хабр Карьера',
    color: '#2A7DE1',
    icon: <BiCodeAlt size={iconSize} />,
    urlPattern: (v) => getSocialUrl('habrCareer', v),
  },
  vcRu: {
    label: 'VC.ru',
    color: '#00B1FF',
    icon: <BiCodeAlt size={iconSize} />,
    urlPattern: (v) => getSocialUrl('vcRu', v),
  },
  zen: {
    label: 'Яндекс Дзен',
    color: '#000000',
    icon: <BiCodeAlt size={iconSize} />,
    urlPattern: (v) => getSocialUrl('zen', v),
  },
  pikabu: {
    label: 'Pikabu',
    color: '#314358',
    icon: <BiCodeAlt size={iconSize} />,
    urlPattern: (v) => getSocialUrl('pikabu', v),
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0077B5',
    icon: <BiLogoLinkedin size={iconSize} />,
    urlPattern: (v) => getSocialUrl('linkedin', v),
  },
  xing: {
    label: 'Xing',
    color: '#006567',
    icon: <BiLogoLinkedin size={iconSize} />,
    urlPattern: (v) => getSocialUrl('xing', v),
  },
  github: {
    label: 'GitHub',
    color: '#181717',
    icon: <BiLogoGithub size={iconSize} />,
    urlPattern: (v) => getSocialUrl('github', v),
  },
  gitlab: {
    label: 'GitLab',
    color: '#FC6D26',
    icon: <SiGitlab size={iconSize} />,
    urlPattern: (v) => getSocialUrl('gitlab', v),
  },
  bitbucket: {
    label: 'Bitbucket',
    color: '#0052CC',
    icon: <SiBitbucket size={iconSize} />,
    urlPattern: (v) => getSocialUrl('bitbucket', v),
  },
  stackoverflow: {
    label: 'Stack Overflow',
    color: '#F48024',
    icon: <SiStackoverflow size={iconSize} />,
    urlPattern: (v) => getSocialUrl('stackoverflow', v),
  },
  devTo: {
    label: 'Dev.to',
    color: '#0A0A0A',
    icon: <BiCodeAlt size={iconSize} />,
    urlPattern: (v) => getSocialUrl('devTo', v),
  },
  kaggle: {
    label: 'Kaggle',
    color: '#20BEFF',
    icon: <SiKaggle size={iconSize} />,
    urlPattern: (v) => getSocialUrl('kaggle', v),
  },
  dribbble: {
    label: 'Dribbble',
    color: '#EA4C89',
    icon: <BiLogoDribbble size={iconSize} />,
    urlPattern: (v) => getSocialUrl('dribbble', v),
  },
  behance: {
    label: 'Behance',
    color: '#1769FF',
    icon: <BiLogoBehance size={iconSize} />,
    urlPattern: (v) => getSocialUrl('behance', v),
  },
  figma: {
    label: 'Figma',
    color: '#F24E1E',
    icon: <BiLogoDribbble size={iconSize} />,
    urlPattern: (v) => getSocialUrl('figma', v),
  },
  pinterest: {
    label: 'Pinterest',
    color: '#BD081C',
    icon: <BiLogoPinterest size={iconSize} />,
    urlPattern: (v) => getSocialUrl('pinterest', v),
  },
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    icon: <BiLogoInstagram size={iconSize} />,
    urlPattern: (v) => getSocialUrl('instagram', v),
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    icon: <BiLogoFacebook size={iconSize} />,
    urlPattern: (v) => getSocialUrl('facebook', v),
  },
  twitter: {
    label: 'Twitter',
    color: '#1DA1F2',
    icon: <BiLogoTwitter size={iconSize} />,
    urlPattern: (v) => getSocialUrl('twitter', v),
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    icon: <BiLogoYoutube size={iconSize} />,
    urlPattern: (v) => getSocialUrl('youtube', v),
  },
  medium: {
    label: 'Medium',
    color: '#000000',
    icon: <FaMedium size={iconSize} />,
    urlPattern: (v) => getSocialUrl('medium', v),
  },
  reddit: {
    label: 'Reddit',
    color: '#FF4500',
    icon: <FaReddit size={iconSize} />,
    urlPattern: (v) => getSocialUrl('reddit', v),
  },
  discord: {
    label: 'Discord',
    color: '#5865F2',
    icon: <SiDiscord size={iconSize} />,
    urlPattern: (v) => getSocialUrl('discord', v),
  },
}

/** Список платформ для ats (без дубликатов) */
export const RECR_CHAT_SOCIAL_PLATFORMS: SocialPlatformKey[] = [
  'whatsapp',
  'viber',
  'telegram',
  'vk',
  'linkedin',
  'habr',
  'habrCareer',
  'vcRu',
  'dribbble',
  'behance',
  'pinterest',
  'github',
  'gitlab',
  'bitbucket',
  'stackoverflow',
  'devTo',
  'instagram',
  'facebook',
  'twitter',
  'youtube',
  'medium',
  'kaggle',
  'discord',
  'reddit',
  'odnoklassniki',
  'zen',
  'xing',
  'wechat',
  'skype',
  'figma',
  'pikabu',
]
