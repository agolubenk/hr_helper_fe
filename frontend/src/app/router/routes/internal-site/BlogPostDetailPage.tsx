/**
 * Страница поста блога с комментариями.
 * Редактирование — для автора/админа.
 */
import { useState, useEffect } from 'react'
import { Flex, Text, Card, Box, Button, TextArea, Spinner } from '@radix-ui/themes'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { fetchBlogPost, fetchBlogPostComments, createComment } from '@/shared/api/internal-site'
import type { BlogPost, BlogPostComment } from '@/shared/types/internal-site'
import { useInternalSiteRole } from '@/shared/stores/internal-site-role'
import styles from './InternalSitePage.module.css'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BlogPostDetailPage() {
  const params = useParams({ strict: false })
  const slug = (params as { slug?: string })?.slug
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<BlogPostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchBlogPost(slug).then(async (p) => {
      setPost(p ?? null)
      if (p) {
        const c = await fetchBlogPostComments(p.id)
        setComments(c)
      }
    }).finally(() => setLoading(false))
  }, [slug])

  const handleAddComment = async () => {
    if (!post || !commentText.trim()) return
    setSubmitting(true)
    try {
      const newComment = await createComment(post.id, commentText.trim())
      setComments((prev) => [...prev, newComment])
      setCommentText('')
    } finally {
      setSubmitting(false)
    }
  }

  const { role } = useInternalSiteRole()
  const canEdit = post && (role === 'admin' || post.author.id === 1)

  if (loading) {
    return (
      <Flex justify="center" py="8">
        <Spinner size="3" />
      </Flex>
    )
  }

  if (!post) {
    return (
      <Flex direction="column" gap="3" align="center" py="8">
        <Text size="4">Пост не найден</Text>
        <Link to="/internal-site">
          <Button variant="soft">Назад</Button>
        </Link>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="6" className={styles.container}>
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Link to="/internal-site" className={styles.backLink}>
          <Flex align="center" gap="2">
            <ArrowLeftIcon />
            <Text size="2" color="gray">
              Внутренний сайт
            </Text>
          </Flex>
        </Link>
        {canEdit && (
          <Link to="/internal-site/post/$slug/edit" params={{ slug: post.slug }}>
            <Button size="2" variant="soft">
              <Pencil1Icon width={16} height={16} />
              Редактировать
            </Button>
          </Link>
        )}
      </Flex>

      <Card>
        <Flex direction="column" gap="3">
          <Text size="6" weight="bold">
            {post.title}
          </Text>
          <Text size="2" color="gray">
            {formatDate(post.created_at)} · {post.author.first_name} {post.author.last_name}
          </Text>
          <Box
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Flex>
      </Card>

      <Box>
        <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
          Комментарии ({comments.length})
        </Text>
        <Flex direction="column" gap="3">
          {comments.map((c) => (
            <Card key={c.id} size="1">
              <Flex direction="column" gap="1">
                <Flex justify="between" align="center">
                  <Text size="2" weight="medium">
                    {c.author.first_name} {c.author.last_name}
                  </Text>
                  <Text size="1" color="gray">
                    {formatDate(c.created_at)}
                  </Text>
                </Flex>
                <Text size="2">{c.content}</Text>
              </Flex>
            </Card>
          ))}
          <Card size="1">
            <Flex direction="column" gap="2">
              <TextArea
                placeholder="Добавить комментарий..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              <Button size="2" onClick={handleAddComment} disabled={!commentText.trim() || submitting}>
                {submitting ? <Spinner size="1" /> : null} Отправить
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Box>
    </Flex>
  )
}
