import { useEffect, useMemo, useState } from 'react'
import { Flex, Text, Card, Box, Spinner, Button, Select, Badge } from '@radix-ui/themes'
import { Link } from '@/router-adapter'
import {
  FileTextIcon,
  CalendarIcon,
  PersonIcon,
  GearIcon,
  BarChartIcon,
  ChatBubbleIcon,
  Pencil1Icon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons'
import { Carousel, type CarouselSlide } from '@/components/internal-site/Carousel'
import { fetchBlogPosts } from '@/app/api/internal-site'
import type { BlogPost, InternalSiteRole } from '@/lib/types/internal-site'
import styles from './styles/InternalSitePage.module.css'

const ROLE_STORAGE_KEY = 'internal-site-role'

const QUICK_LINKS = [
  { label: 'Вики', href: '/wiki', icon: FileTextIcon, description: 'База знаний компании' },
  { label: 'Календарь', href: '/calendar', icon: CalendarIcon, description: 'Расписание интервью' },
  { label: 'Сотрудники', href: '/employees', icon: PersonIcon, description: 'Справочник и оргструктура' },
  { label: 'Настройки', href: '/company-settings', icon: GearIcon, description: 'Настройки компании' },
  { label: 'Отчётность', href: '/reporting', icon: BarChartIcon, description: 'Аналитика по подбору' },
  { label: 'Workflow', href: '/workflow', icon: ChatBubbleIcon, description: 'Чат и процессы' },
]

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getInitialRole(): InternalSiteRole {
  if (typeof window === 'undefined') return 'admin'
  const role = localStorage.getItem(ROLE_STORAGE_KEY)
  return role === 'user' ? 'user' : 'admin'
}

type FeedTabId = 'all' | 'pinned' | 'published' | 'drafts'

export function InternalSitePage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<InternalSiteRole>(getInitialRole)
  const [tab, setTab] = useState<FeedTabId>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchBlogPosts()
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = (value: string) => {
    const nextRole: InternalSiteRole = value === 'user' ? 'user' : 'admin'
    setRole(nextRole)
    if (typeof window !== 'undefined') localStorage.setItem(ROLE_STORAGE_KEY, nextRole)
  }

  const carouselSlides: CarouselSlide[] = posts
    .filter((p) => p.is_pinned)
    .slice(0, 5)
    .map((p) => ({
      id: String(p.id),
      title: p.title,
      description: p.excerpt,
      href: `/internal-site/post/${p.slug}`,
    }))

  if (carouselSlides.length === 0) {
    carouselSlides.push({
      id: 'welcome',
      title: 'Добро пожаловать',
      description:
        'Внутренний портал для сотрудников. Новости, объявления и быстрый доступ к разделам.',
    })
  }

  const isAdmin = role === 'admin'

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    switch (tab) {
      case 'pinned':
        return posts.filter((p) => p.is_pinned).filter((p) => (q ? matchesQuery(p, q) : true))
      case 'published':
        return posts.filter((p) => p.is_published).filter((p) => (q ? matchesQuery(p, q) : true))
      case 'drafts':
        return posts.filter((p) => !p.is_published).filter((p) => (q ? matchesQuery(p, q) : true))
      case 'all':
      default:
        return posts.filter((p) => (q ? matchesQuery(p, q) : true))
    }
  }, [posts, tab, query])

  const kpis = useMemo(() => {
    const total = posts.length
    const pinned = posts.filter((p) => p.is_pinned).length
    const published = posts.filter((p) => p.is_published).length
    const drafts = posts.filter((p) => !p.is_published).length
    return { total, pinned, published, drafts }
  }, [posts])

  return (
    <Flex direction="column" gap="6" className={styles.container}>
      <Flex justify="between" align="start" wrap="wrap" gap="3" className={styles.pageHeader}>
        <Box>
          <Text size="6" weight="bold" mb="1" style={{ display: 'block' }}>
            Внутренний сайт
          </Text>
          <Text size="2" color="gray">
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            · HR Helper
          </Text>
        </Box>
        <div className={styles.headerRight}>
          <div className={styles.searchWrap}>
            <MagnifyingGlassIcon className={styles.searchIco} />
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Поиск по ленте..."
              aria-label="Поиск по ленте"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select.Root value={role} onValueChange={handleRoleChange}>
            <Select.Trigger style={{ width: 160 }} />
            <Select.Content>
              <Select.Item value="user">Пользователь</Select.Item>
              <Select.Item value="admin">Администратор</Select.Item>
            </Select.Content>
          </Select.Root>
          {isAdmin && (
            <Link href="/internal-site/post/create">
              <Button size="2">
                <PlusIcon width={16} height={16} />
                Создать пост
              </Button>
            </Link>
          )}
        </div>
      </Flex>

      <Flex gap="4" wrap="wrap">
        {QUICK_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className={styles.cardLink}>
            <Card className={styles.quickCard}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <item.icon width={20} height={20} />
                  <Text size="3" weight="medium">
                    {item.label}
                  </Text>
                </Flex>
                <Text size="1" color="gray">
                  {item.description}
                </Text>
              </Flex>
            </Card>
          </Link>
        ))}
      </Flex>

      <div className={styles.kpiGrid} role="list" aria-label="Сводка">
        <div className={styles.kpi} role="listitem">
          <div className={styles.kpiLabel}>Всего постов</div>
          <div className={styles.kpiValue}>{kpis.total}</div>
          <div className={styles.kpiHint}>Все записи во внутреннем сайте</div>
        </div>
        <div className={styles.kpi} role="listitem">
          <div className={styles.kpiLabel}>Закреплено</div>
          <div className={styles.kpiValue}>{kpis.pinned}</div>
          <div className={styles.kpiHint}>Показываются в карусели</div>
        </div>
        <div className={styles.kpi} role="listitem">
          <div className={styles.kpiLabel}>Опубликовано</div>
          <div className={styles.kpiValue}>{kpis.published}</div>
          <div className={styles.kpiHint}>Доступно всем пользователям</div>
        </div>
        <div className={styles.kpi} role="listitem">
          <div className={styles.kpiLabel}>Черновики</div>
          <div className={styles.kpiValue}>{kpis.drafts}</div>
          <div className={styles.kpiHint}>Видно авторам и админам</div>
        </div>
      </div>

      <Carousel slides={carouselSlides} />

      <Box>
        <Flex justify="between" align="center" wrap="wrap" gap="3" mb="3">
          <Text size="4" weight="bold" style={{ display: 'block' }}>
            Лента
          </Text>
          <div className={styles.tabs} role="tablist" aria-label="Фильтр ленты">
            <button
              type="button"
              className={`${styles.tab} ${tab === 'all' ? styles.tabOn : ''}`}
              onClick={() => setTab('all')}
              role="tab"
              aria-selected={tab === 'all'}
            >
              Все <Badge size="1" variant="soft">{kpis.total}</Badge>
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'pinned' ? styles.tabOn : ''}`}
              onClick={() => setTab('pinned')}
              role="tab"
              aria-selected={tab === 'pinned'}
            >
              Закреплённые <Badge size="1" variant="soft">{kpis.pinned}</Badge>
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'published' ? styles.tabOn : ''}`}
              onClick={() => setTab('published')}
              role="tab"
              aria-selected={tab === 'published'}
            >
              Опубликованные <Badge size="1" variant="soft">{kpis.published}</Badge>
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'drafts' ? styles.tabOn : ''}`}
              onClick={() => setTab('drafts')}
              role="tab"
              aria-selected={tab === 'drafts'}
            >
              Черновики <Badge size="1" variant="soft">{kpis.drafts}</Badge>
            </button>
          </div>
        </Flex>

        {loading ? (
          <Flex justify="center" py="4">
            <Spinner size="3" />
          </Flex>
        ) : filteredPosts.length === 0 ? (
          <Text size="2" color="gray">
            Нет постов по выбранному фильтру
          </Text>
        ) : (
          <div className={styles.feed}>
            {filteredPosts.slice(0, 12).map((post) => (
              <Link key={post.id} href={`/internal-site/post/${post.slug}`} className={styles.postLink}>
                <Card className={styles.postCardNexus}>
                  <div className={styles.postHero} aria-hidden />
                  <div className={styles.postBody}>
                    <div className={styles.postMeta}>
                      <span>
                        {formatDate(post.created_at)} · {post.author.first_name} {post.author.last_name}
                      </span>
                      {post.is_pinned ? <Badge size="1" color="teal">Закреплено</Badge> : null}
                      {!post.is_published ? <Badge size="1" color="amber">Черновик</Badge> : null}
                    </div>
                    <div className={styles.postTitle}>{post.title}</div>
                    <div className={styles.postExcerpt}>{post.excerpt}</div>
                  </div>
                  <div className={styles.postFoot}>
                    <div className={styles.postActRow}>
                      <span className={styles.postAct}>
                        <Pencil1Icon width={14} height={14} aria-hidden /> Открыть
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Box>

      <Card className={styles.infoCard}>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            О разделе
          </Text>
          <Text size="2" color="gray">
            Внутренний сайт — единая лента для сотрудников. Закрепляйте важные объявления, ведите записи по процессам и публикуйте новости компании.
          </Text>
        </Flex>
      </Card>
    </Flex>
  )
}

function matchesQuery(post: BlogPost, queryLower: string) {
  const hay = `${post.title}\n${post.excerpt}\n${post.author.first_name} ${post.author.last_name}`.toLowerCase()
  return hay.includes(queryLower)
}
