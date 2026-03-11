/**
 * Редактирование поста блога.
 * Доступно администратору и автору.
 */
import { useState, useEffect } from 'react'
import { Flex, Text, Card, Box, Button, TextField, TextArea, Checkbox, Spinner } from '@radix-ui/themes'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { WikiEditor } from '@/shared/components/wiki/WikiEditor'
import { fetchBlogPostForEdit, updateBlogPost, createBlogPost } from '@/shared/api/internal-site'
import type { BlogPost, BlogPostFormData } from '@/shared/types/internal-site'
import styles from './InternalSitePage.module.css'

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function BlogPostEditPage() {
  const params = useParams({ strict: false })
  const slug = (params as { slug?: string })?.slug
  const navigate = useNavigate()
  const isCreate = !slug

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slugVal, setSlugVal] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [isPinned, setIsPinned] = useState(false)

  useEffect(() => {
    if (isCreate) {
      setLoading(false)
      return
    }
    fetchBlogPostForEdit(slug!).then((p) => {
      setPost(p ?? null)
      if (p) {
        setTitle(p.title)
        setSlugVal(p.slug)
        setExcerpt(p.excerpt)
        setContent(p.content)
        setIsPublished(p.is_published)
        setIsPinned(p.is_pinned ?? false)
      }
    }).finally(() => setLoading(false))
  }, [slug, isCreate])

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (isCreate && !slugVal) setSlugVal(slugFromTitle(v))
  }

  const handleSave = async () => {
    setError(null)
    if (!title.trim()) {
      setError('Введите заголовок')
      return
    }
    if (!slugVal.trim()) {
      setError('Введите URL-адрес')
      return
    }
    if (content.length < 10) {
      setError('Содержание должно содержать минимум 10 символов')
      return
    }
    setSaving(true)
    try {
      const data: BlogPostFormData = {
        title: title.trim(),
        slug: slugVal.trim(),
        excerpt: excerpt.trim(),
        content,
        is_published: isPublished,
        is_pinned: isPinned,
      }
      if (isCreate) {
        const created = await createBlogPost(data)
        navigate({ to: '/internal-site/post/$slug', params: { slug: created.slug } } as { to: string; params?: { slug: string } })
      } else {
        await updateBlogPost(slug!, data)
        navigate({ to: '/internal-site/post/$slug', params: { slug: slugVal } } as { to: string; params?: { slug: string } })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Flex justify="center" py="8">
        <Spinner size="3" />
      </Flex>
    )
  }

  if (!isCreate && !post) {
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
        <Link
          to={isCreate ? '/internal-site' : '/internal-site/post/$slug'}
          params={!isCreate ? { slug: slugVal } : undefined}
          className={styles.backLink}
        >
          <Flex align="center" gap="2">
            <ArrowLeftIcon />
            <Text size="2" color="gray">
              {isCreate ? 'Внутренний сайт' : post?.title}
            </Text>
          </Flex>
        </Link>
        <Text size="5" weight="bold">
          {isCreate ? 'Создать пост' : 'Редактировать'}
        </Text>
      </Flex>

      {error && (
        <Card className={styles.errorCard}>
          <Text size="2" color="red">{error}</Text>
        </Card>
      )}

      <Card>
        <Flex direction="column" gap="4">
          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Заголовок <span className={styles.required}>*</span>
            </Text>
            <TextField.Root
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Заголовок поста"
              style={{ width: '100%' }}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              URL-адрес <span className={styles.required}>*</span>
            </Text>
            <TextField.Root
              value={slugVal}
              onChange={(e) => setSlugVal(e.target.value)}
              placeholder="welcome-post"
              style={{ width: '100%' }}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Краткое описание
            </Text>
            <TextArea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Краткое описание для превью"
              rows={2}
              style={{ width: '100%' }}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Содержание <span className={styles.required}>*</span>
            </Text>
            <WikiEditor
              content={content}
              onChange={setContent}
              placeholder="Введите содержание поста..."
            />
          </Box>

          <Flex gap="4" wrap="wrap" align="center">
            <Flex align="center" gap="2">
              <Checkbox
                checked={isPublished}
                onCheckedChange={(v) => setIsPublished(v === true)}
              />
              <Text size="2">Опубликовано</Text>
            </Flex>
            <Flex align="center" gap="2">
              <Checkbox
                checked={isPinned}
                onCheckedChange={(v) => setIsPinned(v === true)}
              />
              <Text size="2">Закрепить в карусели</Text>
            </Flex>
          </Flex>

          <Flex gap="3" justify="end">
            <Link
              to={isCreate ? '/internal-site' : '/internal-site/post/$slug'}
              params={!isCreate ? { slug: slugVal } : undefined}
            >
              <Button variant="soft" color="gray">Отмена</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="1" /> : null} Сохранить
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}
