'use client'

import type { ElementType } from 'react'
import { Box, Card, Flex, Text, Heading } from '@radix-ui/themes'
import {
  ArrowRightIcon,
  BarChartIcon,
  ChatBubbleIcon,
  ClockIcon,
  FileTextIcon,
  GearIcon,
  ListBulletIcon,
  MixerHorizontalIcon,
  Cross2Icon,
  PlusIcon,
  StarIcon,
  ArrowTopRightIcon,
  BoxIcon,
  LockClosedIcon,
  EnvelopeClosedIcon,
} from '@radix-ui/react-icons'
import { Link } from '@/router-adapter'
import { RECRUITING_HUB_PATH } from '@/components/company-settings/recruiting/recruitingNavState'
import styles from './RecruitingSettingsHub.module.css'

const hubNavState = { recruitingFrom: RECRUITING_HUB_PATH }

interface RecruitingHubLink {
  href: string
  label: string
  description: string
  Icon: ElementType
}

interface RecruitingHubSection {
  title: string
  links: RecruitingHubLink[]
}

const HUB_SECTIONS: RecruitingHubSection[] = [
  {
    title: 'Процесс найма',
    links: [
      {
        href: '/company-settings/recruiting/stages',
        label: 'Статусы воронки',
        description: 'Этапы найма, причины отказа и порядок в воронке',
        Icon: MixerHorizontalIcon,
      },
      {
        href: '/company-settings/sla',
        label: 'SLA',
        description: 'Сроки и контрольные точки по вакансиям',
        Icon: ClockIcon,
      },
      {
        href: '/company-settings/Scorecard',
        label: 'Scorecard',
        description: 'Настройки scorecard для оценки кандидатов',
        Icon: StarIcon,
      },
      {
        href: '/company-settings/rating-scales',
        label: 'Шкалы оценок',
        description: 'Шкалы для интервью и обратной связи',
        Icon: BarChartIcon,
      },
    ],
  },
  {
    title: 'Вакансии',
    links: [
      {
        href: '/company-settings/recruiting/vacancy-types',
        label: 'Типы вакансий',
        description: 'Типы и классификация вакансий',
        Icon: BoxIcon,
      },
      {
        href: '/company-settings/vacancy-prompt',
        label: 'Единый промпт для вакансий',
        description: 'Общий промпт для описаний и анализа вакансий',
        Icon: FileTextIcon,
      },
      {
        href: '/company-settings/recruiting/permissions',
        label: 'Права по вакансиям',
        description: 'Кто может видеть и редактировать вакансии',
        Icon: LockClosedIcon,
      },
    ],
  },
  {
    title: 'Кандидаты и источники',
    links: [
      {
        href: '/company-settings/recruiting/sources',
        label: 'Источники кандидатов',
        description: 'Каналы и источники привлечения',
        Icon: ArrowTopRightIcon,
      },
      {
        href: '/company-settings/recruiting/company-blacklist',
        label: 'Черный список компаний',
        description: 'Компании, из которых не берём кандидатов (алиасы, юрлица, дочерние)',
        Icon: Cross2Icon,
      },
      {
        href: '/company-settings/recruiting/company-whitelist-donors',
        label: 'Белый список компаний / доноры',
        description: 'Компании-доноры (алиасы, юрлица, дочерние) и фильтры по профилям',
        Icon: PlusIcon,
      },
    ],
  },
  {
    title: 'Коммуникации и документы',
    links: [
      {
        href: '/company-settings/recruiting/response-templates',
        label: 'Шаблоны ответов кандидатам',
        description: 'Тексты и сценарии ответов кандидатам',
        Icon: ChatBubbleIcon,
      },
      {
        href: '/company-settings/recruiting/offer-template',
        label: 'Шаблон оффера',
        description: 'Структура и блоки оффера',
        Icon: FileTextIcon,
      },
      {
        href: '/company-settings/recruiting/message-templates',
        label: 'Шаблоны писем и сообщений',
        description: 'Почтовые и мессенджер-шаблоны',
        Icon: EnvelopeClosedIcon,
      },
    ],
  },
  {
    title: 'Автоматизация и данные',
    links: [
      {
        href: '/company-settings/recruiting/rules',
        label: 'Автоматизация сорсинга',
        description: 'Бонусы и условия для источников привлечения кандидатов',
        Icon: GearIcon,
      },
      {
        href: '/company-settings/recruiting/commands',
        label: 'Команды workflow',
        description: 'Команды и сценарии в процессе подбора',
        Icon: ListBulletIcon,
      },
      {
        href: '/company-settings/recruiting/candidate-fields',
        label: 'Дополнительные поля кандидатов',
        description: 'Кастомные поля анкеты и карточки кандидата',
        Icon: FileTextIcon,
      },
      {
        href: '/company-settings/recruiting/vacancy-fields',
        label: 'Дополнительные поля вакансии',
        description: 'Единый профиль полей вакансии и правила применения',
        Icon: FileTextIcon,
      },
    ],
  },
]

function HubCard({ href, label, description, Icon }: RecruitingHubLink) {
  return (
    <Link href={href} className={styles.cardLink} linkState={hubNavState}>
      <Card size="2" className={styles.card}>
        <Flex className={styles.cardInner}>
          <div className={styles.titleRow}>
            <Box className={styles.iconWrap}>
              <Icon width={20} height={20} />
            </Box>
            <ArrowRightIcon width={16} height={16} className={styles.chevron} />
          </div>
          <Text size="3" weight="medium">
            {label}
          </Text>
          <Text size="2" color="gray">
            {description}
          </Text>
        </Flex>
      </Card>
    </Link>
  )
}

export function RecruitingSettingsHub() {
  return (
    <Box className={styles.page}>
      <Box className={styles.intro}>
        <Text size="6" weight="bold" style={{ display: 'block' }} mb="2">
          Настройки рекрутинга
        </Text>
        <Text size="3" color="gray">
          Разделы сгруппированы по домену: карточки ведут на страницы настроек модуля
        </Text>
      </Box>

      {HUB_SECTIONS.map((section) => (
        <Box key={section.title} className={styles.section}>
          <Heading as="h2" size="4" className={styles.sectionTitle} mb="3">
            {section.title}
          </Heading>
          <Flex wrap="wrap" gap="3" className={styles.sectionCards}>
            {section.links.map((link) => (
              <HubCard key={link.href} {...link} />
            ))}
          </Flex>
        </Box>
      ))}
    </Box>
  )
}
