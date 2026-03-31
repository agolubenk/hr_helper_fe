import { Card, Text, Flex } from '@radix-ui/themes'
import { Link, usePathname } from '@/router-adapter'
import styles from '../styles/MeetPages.module.css'

/** Основная навигация meet в шапке страниц (как в ТЗ). */
const PRIMARY_NAV: { href: string; label: string }[] = [
  { href: '/meet', label: 'Главная' },
  { href: '/meet/history', label: 'История' },
  { href: '/meet/upcoming', label: 'Предстоящие' },
]

/** Остальные разделы — сайдбар или эта строка. */
const SECONDARY_NAV: { href: string; label: string }[] = [
  { href: '/meet/new-links', label: 'Новые ссылки' },
  { href: '/meet/room', label: 'Мит' },
  { href: '/meet/archive', label: 'Архивы' },
]

function linkActive(pathname: string, href: string): boolean {
  if (href === '/meet') return pathname === '/meet'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MeetPrimaryNav() {
  const pathname = usePathname()

  return (
    <nav className={styles.navPrimary} aria-label="Основные разделы meet-системы">
      {PRIMARY_NAV.map((item) => {
        const active = linkActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function MeetSecondaryNav() {
  const pathname = usePathname()

  return (
    <Flex align="center" gap="2" wrap="wrap" className={styles.navSecondaryWrap}>
      <Text size="1" color="gray" weight="medium" style={{ whiteSpace: 'nowrap' }}>
        Также в meet
      </Text>
      <nav className={styles.navSecondary} aria-label="Дополнительные разделы meet-системы">
        {SECONDARY_NAV.map((item) => {
          const active = linkActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navSecondaryLink} ${active ? styles.navSecondaryLinkActive : ''}`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </Flex>
  )
}

export function MeetNavCard() {
  return (
    <Card size="1" variant="surface" className={styles.meetNavCard}>
      <Flex p="2" align="center" justify="between" wrap="wrap" gap="3" className={styles.navCardRow}>
        <MeetPrimaryNav />
        <MeetSecondaryNav />
      </Flex>
    </Card>
  )
}
