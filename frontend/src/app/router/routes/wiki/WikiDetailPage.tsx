/**
 * Страница просмотра статьи вики.
 * Wikipedia-стиль: заголовок, метаданные, содержание, связанные страницы.
 */
import { useState, useEffect } from 'react'
import { Flex, Text, Badge, Card, Spinner } from '@radix-ui/themes'
import { Link, useParams } from '@tanstack/react-router'
import { Pencil1Icon, ArrowLeftIcon, CubeIcon } from '@radix-ui/react-icons'
import { fetchWikiPage } from '@/shared/api/wiki'
import type { WikiPage } from '@/shared/types/wiki'
import { RELATED_APP_CHOICES } from '@/shared/types/wiki'
import styles from './WikiDetailPage.module.css'

export function WikiDetailPage() {
  const { slug } = useParams({ from: '/wiki/page/$slug' })
  const [page, setPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchWikiPage(slug)
      .then(setPage)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <Flex justify="center" py="8">
        <Spinner size="3" />
      </Flex>
    )
  }

  if (!page) {
    return (
      <Flex direction="column" align="center" gap="3" py="8">
        <Text size="4" color="gray">Страница не найдена</Text>
        <Link to="/wiki">
          <Flex align="center" gap="2">
            <ArrowLeftIcon />
            <Text color="blue">К списку статей</Text>
          </Flex>
        </Link>
      </Flex>
    )
  }

  const authorName = page.author
    ? [page.author.first_name, page.author.last_name].filter(Boolean).join(' ') || page.author.email
    : null

  return (
    <Flex direction="column" gap="4" className={styles.container}>
      <Flex justify="between" align="center" wrap="wrap" gap="3" className={styles.headerRow}>
        <Link to="/wiki" className={styles.backLink}>
          <Flex align="center" gap="2">
            <ArrowLeftIcon />
            <Text size="2" color="gray">Вики</Text>
          </Flex>
        </Link>
        <Text size="5" weight="bold" className={styles.headerTitle}>{page.title}</Text>
        <Link
          to="/wiki/page/$slug/edit"
          params={{ slug: page.slug }}
          className={styles.editIconBtn}
          title="Редактировать"
        >
          <Pencil1Icon width={18} height={18} />
        </Link>
      </Flex>

      <Flex justify="between" align="center" wrap="wrap" gap="2">
        {page.category ? (
          <Text size="2" color="gray">{page.category}</Text>
        ) : (
          <span />
        )}
        <Flex gap="2" wrap="wrap" align="center">
          {page.tags.map((t) => (
            <Badge key={t.id} size="1" style={{ backgroundColor: t.color, color: 'white' }} className={styles.tagBadge}>
              #{t.name}
            </Badge>
          ))}
          {page.related_app && (
            <Flex align="center" gap="1" className={styles.appLabel}>
              <CubeIcon width={12} height={12} />
              <Text size="1" color="gray">
                {RELATED_APP_CHOICES.find((a) => a.value === page.related_app)?.label ?? page.related_app}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>

      <Card className={styles.contentCard}>
        <Flex direction="column" gap="4">
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          <Flex gap="4" wrap="wrap" className={styles.meta}>
            {authorName && (
              <Text size="1" color="gray">
                Автор: {authorName}
              </Text>
            )}
            <Text size="1" color="gray">
              Обновлено: {new Date(page.updated_at).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}
