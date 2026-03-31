import { Card, Box } from '@radix-ui/themes'
import { Link, usePathname } from '@/router-adapter'
import styles from '../styles/CodingPlatformPages.module.css'

const ITEMS: { href: string; label: string }[] = [
  { href: '/coding-platform', label: 'Обзор' },
  { href: '/coding-platform/languages', label: 'Языки и связи' },
  { href: '/coding-platform/playground', label: 'Песочница' },
  { href: '/coding-platform/link-builder', label: 'Link-билдер' },
]

function active(pathname: string, href: string): boolean {
  if (href === '/coding-platform') return pathname === '/coding-platform'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function CodingPlatformNavCard() {
  const pathname = usePathname()

  return (
    <Card size="1" variant="surface">
      <Box p="2">
        <nav className={styles.navPrimary} aria-label="Разделы кодинговой платформы">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${active(pathname, item.href) ? styles.navLinkActive : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Box>
    </Card>
  )
}
