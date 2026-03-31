import { useEffect, useState } from 'react'
import { Flex, Text, Card, Box, Spinner, Button, Select } from '@radix-ui/themes'
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

export function InternalSitePage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<InternalSiteRole>(getInitialRole)

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

  return (
    <Flex direction="column" gap="6" className={styles.container}>
      <Flex justify="between" align="start" wrap="wrap" gap="3">
        <Box>
          <Text size="6" weight="bold" mb="1" style={{ display: 'block' }}>
            Внутренний сайт
          </Text>
          <Text size="2" color="gray">
            Блог и портал для сотрудников — новости, объявления, быстрый доступ к разделам
          </Text>
        </Box>
        <Flex align="center" gap="3">
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
        </Flex>
      </Flex>

      <Carousel slides={carouselSlides} />

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

      <Box>
        <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
          Последние посты
        </Text>
        {loading ? (
          <Flex justify="center" py="4">
            <Spinner size="3" />
          </Flex>
        ) : posts.length === 0 ? (
          <Text size="2" color="gray">
            Пока нет постов
          </Text>
        ) : (
          <Flex direction="column" gap="2">
            {posts.slice(0, 5).map((post) => (
              <Link key={post.id} href={`/internal-site/post/${post.slug}`} className={styles.postLink}>
                <Card className={styles.postCard}>
                  <Flex justify="between" align="start" gap="3">
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">
                        {post.title}
                      </Text>
                      <Text size="1" color="gray">
                        {post.excerpt}
                      </Text>
                      <Text size="1" color="gray">
                        {formatDate(post.created_at)} · {post.author.first_name} {post.author.last_name}
                      </Text>
                    </Flex>
                    <Pencil1Icon width={16} height={16} style={{ opacity: 0.5 }} />
                  </Flex>
                </Card>
              </Link>
            ))}
          </Flex>
        )}
      </Box>

      <Card className={styles.infoCard}>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            О разделе
          </Text>
          <Text size="2" color="gray">
            Внутренний сайт — блог для сотрудников. Здесь публикуются новости и объявления, можно
            комментировать посты. Редактирование доступно авторам и администраторам.
          </Text>
        </Flex>
      </Card>
    </Flex>
  )
}

