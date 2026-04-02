import { Text, Card, Flex } from '@radix-ui/themes'
import {
  Link2Icon,
  VideoIcon,
  CounterClockwiseClockIcon,
  CalendarIcon,
  StackIcon,
} from '@radix-ui/react-icons'
import { Link } from '@/router-adapter'
import { MeetPageShell } from './MeetPageShell'
import styles from '../styles/MeetPages.module.css'

const SECTIONS = [
  {
    href: '/meet/new-links',
    label: 'Новые ссылки',
    hint: 'Приглашения и быстрые ссылки на комнаты',
    Icon: Link2Icon,
  },
  {
    href: '/meet/room',
    label: 'Мит',
    hint: 'Текущая или запланированная видеовстреча',
    Icon: VideoIcon,
  },
  {
    href: '/meet/history',
    label: 'История',
    hint: 'Прошедшие встречи и записи',
    Icon: CounterClockwiseClockIcon,
  },
  {
    href: '/meet/upcoming',
    label: 'Предстоящие',
    hint: 'Расписание и напоминания',
    Icon: CalendarIcon,
  },
  {
    href: '/meet/archive',
    label: 'Архивы',
    hint: 'Долгосрочное хранение материалов',
    Icon: StackIcon,
  },
] as const

export function MeetHomePage() {
  return (
    <MeetPageShell
      title="Внутренние миты"
      description="Корпоративная meet-система: ссылки, комнаты, история и архив (мок-данные)."
    >
      <div className={styles.grid}>
        {SECTIONS.map(({ href, label, hint, Icon }) => (
          <Link key={href} href={href} className={styles.cardLink}>
            <Card style={{ height: '100%' }}>
              <Flex direction="column" gap="2" p="1">
                <Flex align="center" gap="2">
                  <Icon width={18} height={18} style={{ color: 'var(--gray-11)' }} />
                  <Text weight="bold" className={styles.cardTitle}>
                    {label}
                  </Text>
                </Flex>
                <Text size="2" color="gray">
                  {hint}
                </Text>
              </Flex>
            </Card>
          </Link>
        ))}
      </div>
    </MeetPageShell>
  )
}
