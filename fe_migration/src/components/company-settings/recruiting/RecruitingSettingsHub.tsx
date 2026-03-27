'use client'

import type { ElementType } from 'react'
import { Box, Card, Flex, Text } from '@radix-ui/themes'
import {
  ArrowRightIcon,
  BarChartIcon,
  ChatBubbleIcon,
  ClockIcon,
  FileTextIcon,
  GearIcon,
  ListBulletIcon,
  MixerHorizontalIcon,
  PersonIcon,
  StarIcon,
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

const LINKS: RecruitingHubLink[] = [
  {
    href: '/company-settings/recruiting/stages',
    label: 'Статусы воронки',
    description: 'Этапы найма, причины отказа и порядок в воронке',
    Icon: MixerHorizontalIcon,
  },
  {
    href: '/company-settings/recruiting/templates',
    label: 'Шаблоны рекрутинга',
    description: 'Офферы, письма и шаблоны сообщений кандидатам',
    Icon: FileTextIcon,
  },
  {
    href: '/interviewers',
    label: 'Интервьюеры',
    description: 'База интервьюеров и доступ к интервью',
    Icon: PersonIcon,
  },
  {
    href: '/company-settings/recruiting/rules',
    label: 'Правила привлечения',
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
  {
    href: '/company-settings/sla',
    label: 'SLA',
    description: 'Сроки и контрольные точки по вакансиям',
    Icon: ClockIcon,
  },
  {
    href: '/company-settings/vacancy-prompt',
    label: 'Единый промпт для вакансий',
    description: 'Общий промпт для описаний и анализа вакансий',
    Icon: FileTextIcon,
  },
  {
    href: '/candidate-responses',
    label: 'Ответы кандидатам',
    description: 'Шаблоны и сценарии ответов кандидатам',
    Icon: ChatBubbleIcon,
  },
]

export function RecruitingSettingsHub() {
  return (
    <Box className={styles.page}>
      <Box className={styles.intro}>
        <Text size="6" weight="bold" style={{ display: 'block' }} mb="2">
          Настройки рекрутинга
        </Text>
        <Text size="3" color="gray">
          Выберите раздел: карточки ведут на страницы настроек модуля рекрутинга
        </Text>
      </Box>

      <Flex wrap="wrap" gap="3">
        {LINKS.map(({ href, label, description, Icon }) => (
          <Link key={href} href={href} className={styles.cardLink} linkState={hubNavState}>
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
        ))}
      </Flex>
    </Box>
  )
}
