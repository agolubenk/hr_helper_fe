/**
 * Страница создания/редактирования статьи вики.
 * WYSIWYG-редактор (TipTap), теги, категории, связанное приложение.
 */
import { useState, useEffect } from 'react'
import {
  Flex,
  Text,
  TextField,
  TextArea,
  Select,
  Button,
  IconButton,
  Badge,
  Box,
  Card,
  Checkbox,
  Spinner,
  Dialog,
  DropdownMenu,
} from '@radix-ui/themes'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, PlusIcon, CubeIcon } from '@radix-ui/react-icons'
import { WikiEditor } from '@/shared/components/wiki/WikiEditor'
import {
  fetchWikiPageForEdit,
  fetchWikiPages,
  fetchWikiTags,
  createWikiPage,
  updateWikiPage,
  createWikiTag,
} from '@/shared/api/wiki'
import type { WikiPage, WikiTag, WikiPageFormData } from '@/shared/types/wiki'
import { WIKI_CATEGORIES, RELATED_APP_CHOICES } from '@/shared/types/wiki'
import styles from './WikiEditPage.module.css'

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface WikiEditPageProps {
  slug?: string
}

export function WikiEditPage({ slug: slugProp }: WikiEditPageProps = {}) {
  const params = useParams({ strict: false })
  const slug = slugProp ?? (params as { slug?: string })?.slug
  const navigate = useNavigate()
  const isCreate = !slug

  const [page, setPage] = useState<WikiPage | null>(null)
  const [pages, setPages] = useState<WikiPage[]>([])
  const [tags, setTags] = useState<WikiTag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slugVal, setSlugVal] = useState('')
  const [content, setContent] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [parentId, setParentId] = useState<number | null>(null)
  const [relatedApps, setRelatedApps] = useState<string[]>([])
  const [order, setOrder] = useState(0)
  const [isPublished, setIsPublished] = useState(true)
  const [tagIds, setTagIds] = useState<number[]>([])
  const [changeNote, setChangeNote] = useState('')

  const [newTagModal, setNewTagModal] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6c757d')
  const [tagSelectKey, setTagSelectKey] = useState(0)

  useEffect(() => {
    Promise.all([
      isCreate ? Promise.resolve(null) : fetchWikiPageForEdit(slug!),
      fetchWikiTags(),
      fetchWikiPages(),
    ]).then(([p, t, pg]) => {
      setPage(p ?? null)
      setTags(t)
      setPages(pg ?? [])
      if (p) {
        setTitle(p.title)
        setSlugVal(p.slug)
        setContent(p.content)
        setDescription(p.description)
        setCategory(p.category)
        setParentId(p.parent_id)
        setRelatedApps(p.related_app ? [p.related_app] : [])
        setOrder(p.order)
        setIsPublished(p.is_published)
        setTagIds(p.tags.map((x) => x.id))
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
      setError('Введите название')
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
      const data: WikiPageFormData = {
        title: title.trim(),
        slug: slugVal.trim(),
        content,
        description: description.trim(),
        category,
        parent_id: parentId,
        related_app: relatedApps[0] ?? '',
        order,
        is_published: isPublished,
        tag_ids: tagIds,
        change_note: changeNote.trim(),
      }
      if (isCreate) {
        const created = await createWikiPage(data)
        navigate({ to: '/wiki/page/$slug', params: { slug: created.slug } } as { to: string; params?: { slug: string } })
      } else {
        await updateWikiPage(slug!, data)
        navigate({ to: '/wiki/page/$slug', params: { slug: slugVal } } as { to: string; params?: { slug: string } })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      const tag = await createWikiTag(newTagName.trim(), newTagColor)
      setTags((prev) => [...prev, tag])
      setTagIds((prev) => [...prev, tag.id])
      setNewTagModal(false)
      setNewTagName('')
      setNewTagColor('#6c757d')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка создания тега')
    }
  }

  const toggleTag = (id: number) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  if (loading) {
    return (
      <Flex justify="center" py="8">
        <Spinner size="3" />
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="4" className={styles.container}>
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Link to={isCreate ? '/wiki' : '/wiki/page/$slug'} params={!isCreate && slug ? { slug } : undefined} className={styles.backLink}>
          <Flex align="center" gap="2">
            <ArrowLeftIcon />
            <Text size="2" color="gray">
              {isCreate ? 'Вики' : page?.title}
            </Text>
          </Flex>
        </Link>
        <Text size="5" weight="bold">
          {isCreate ? 'Создать статью' : 'Редактировать'}
        </Text>
      </Flex>

      {error && (
        <Card className={styles.errorCard}>
          <Text size="2" color="red">{error}</Text>
        </Card>
      )}

      <Card className={styles.formCard}>
        <Flex direction="column" gap="4">
          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Название <span className={styles.required}>*</span>
            </Text>
            <TextField.Root
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Введите название страницы"
              style={{ width: '100%' }}
            />
          </Box>

          <Flex gap="4" wrap="wrap" align="start">
            <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                URL-адрес <span className={styles.required}>*</span>
              </Text>
              <TextField.Root
                value={slugVal}
                onChange={(e) => setSlugVal(e.target.value)}
                placeholder="nastroyki-kompanii"
                style={{ width: '100%' }}
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Только латинские буквы, цифры и дефисы
              </Text>
            </Box>
            <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Категория
              </Text>
              <Select.Root value={category || '_'} onValueChange={(v) => setCategory(v === '_' ? '' : v)}>
                <Select.Trigger style={{ width: '100%' }} />
                <Select.Content>
                  {WIKI_CATEGORIES.map((c) => (
                    <Select.Item key={c.value || '_'} value={c.value || '_'}>
                      {c.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Теги и приложения
            </Text>
            <Flex gap="3" wrap="wrap">
              <div className={styles.tagsInput}>
                <Flex gap="2" wrap="wrap" align="center">
                  {tagIds.map((id) => {
                    const t = tags.find((x) => x.id === id)
                    if (!t) return null
                    return (
                      <span
                        key={t.id}
                        className={styles.tagChip}
                        style={{ backgroundColor: t.color, color: 'white' }}
                        onClick={() => toggleTag(t.id)}
                      >
                        #{t.name} ×
                      </span>
                    )
                  })}
                  {tags.some((t) => !tagIds.includes(t.id)) ? (
                    <Select.Root
                      key={tagSelectKey}
                      value="_"
                      onValueChange={(v) => {
                        if (v === '_') return
                        const id = parseInt(v, 10)
                        if (!isNaN(id) && !tagIds.includes(id)) {
                          setTagIds((prev) => [...prev, id])
                          setTagSelectKey((k) => k + 1)
                        }
                      }}
                    >
                      <Select.Trigger placeholder="# Добавить тег" className={styles.tagSelect} />
                      <Select.Content className={styles.tagSelectContent}>
                        <Select.Item value="_"># Добавить тег</Select.Item>
                        {tags.filter((t) => !tagIds.includes(t.id)).map((t) => (
                          <Select.Item key={t.id} value={String(t.id)}>
                            #{t.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  ) : null}
                  <IconButton size="1" variant="soft" onClick={() => setNewTagModal(true)} title="Создать тег">
                    <PlusIcon />
                  </IconButton>
                </Flex>
              </div>
              <div className={styles.tagsInput}>
                <Flex gap="2" wrap="wrap" align="center">
                  {relatedApps.map((app) => (
                    <span
                      key={app}
                      className={styles.appChip}
                      onClick={() => setRelatedApps((prev) => prev.filter((a) => a !== app))}
                    >
                      <CubeIcon width={12} height={12} />
                      {RELATED_APP_CHOICES.find((a) => a.value === app)?.label ?? app} ×
                    </span>
                  ))}
                  {RELATED_APP_CHOICES.some((a) => a.value && !relatedApps.includes(a.value)) ? (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton size="1" variant="soft" title="Добавить приложение">
                          <PlusIcon />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content className={styles.appDropdownContent}>
                        {RELATED_APP_CHOICES.filter((a) => a.value && !relatedApps.includes(a.value)).map((a) => (
                          <DropdownMenu.Item
                            key={a.value}
                            onSelect={(e) => {
                              e.preventDefault()
                              setRelatedApps((prev) => [...prev, a.value])
                            }}
                          >
                            <Flex align="center" gap="2">
                              <CubeIcon width={12} height={12} />
                              {a.label}
                            </Flex>
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  ) : null}
                </Flex>
              </div>
            </Flex>
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Краткое описание
            </Text>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              placeholder="Введите содержание страницы. Можно форматировать текст, вставлять списки и ссылки."
            />
          </Box>

          <Flex gap="4" wrap="wrap" align="center" className={styles.orderRow}>
            <Flex align="center" gap="2">
              <Text size="2" weight="medium">Порядок сортировки</Text>
              <TextField.Root
                type="number"
                value={String(order)}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                style={{ width: 80 }}
              />
            </Flex>
            <Flex align="center" gap="2">
              <Checkbox
                checked={isPublished}
                onCheckedChange={(v) => setIsPublished(v === true)}
              />
              <Text size="2">Опубликовано</Text>
            </Flex>
            <Flex align="center" gap="2">
              <Text size="2" weight="medium">Статья до</Text>
              <Select.Root
                value={parentId ? String(parentId) : '_'}
                onValueChange={(v) => setParentId(v === '_' ? null : parseInt(v, 10))}
              >
                <Select.Trigger placeholder="—" style={{ width: 200 }} />
                <Select.Content>
                  <Select.Item value="_">—</Select.Item>
                  {pages
                    .filter((p) => p.id !== page?.id)
                    .map((p) => (
                      <Select.Item key={p.id} value={String(p.id)}>
                        {p.title}
                      </Select.Item>
                    ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>

          {!isCreate && (
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Примечание к изменению
              </Text>
              <TextField.Root
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="Краткое описание внесённых изменений"
                style={{ width: '100%' }}
              />
            </Box>
          )}

          <Flex gap="3" justify="end">
            <Link to={isCreate ? '/wiki' : '/wiki/page/$slug'} params={!isCreate && slug ? { slug } : undefined}>
              <Button variant="soft" color="gray">Отмена</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="1" /> : null} Сохранить
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Dialog.Root open={newTagModal} onOpenChange={setNewTagModal}>
        <Dialog.Content>
          <Dialog.Title>Создать тег</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Box>
              <Text size="2" mb="1" style={{ display: 'block' }}>Название</Text>
              <TextField.Root
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="настройка"
              />
            </Box>
            <Box>
              <Text size="2" mb="1" style={{ display: 'block' }}>Цвет</Text>
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                style={{ width: 60, height: 32, cursor: 'pointer' }}
              />
            </Box>
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft">Отмена</Button>
            </Dialog.Close>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
              Создать
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}
