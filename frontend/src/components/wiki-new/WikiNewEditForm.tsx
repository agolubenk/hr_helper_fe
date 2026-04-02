import { useState, useEffect, useRef } from 'react'
import { Box, Flex, Text, Button, TextField, TextArea, Select, Switch } from '@radix-ui/themes'
import {
  ArrowLeftIcon,
  FontBoldIcon,
  FontItalicIcon,
  CodeIcon,
  QuoteIcon,
  ListBulletIcon,
  HeadingIcon,
} from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import {
  PAGE_TYPES,
  CATEGORIES,
  CONTENT_TEMPLATES,
  TEMPLATE_SNIPPETS,
  BLOCK_TEMPLATES,
} from './types'
import type { PageTypeId, ContentTemplateId } from './types'
import styles from './WikiNewEditForm.module.css'

interface WikiNewEditFormProps {
  initialData?: {
    id: string
    title: string
    slug: string
    category: string
    pageType: PageTypeId
    tags: string[]
    description: string
    content: string
  }
  isNew?: boolean
}

export function WikiNewEditForm({ initialData, isNew = false }: WikiNewEditFormProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0])
  const [pageType, setPageType] = useState<PageTypeId>(initialData?.pageType ?? 'knowledge_base')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [showSource, setShowSource] = useState(true)
  const [blockSelectValue, setBlockSelectValue] = useState('_')
  const [templateSelectValue, setTemplateSelectValue] = useState('_')

  useEffect(() => {
    if (isNew && title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      )
    }
  }, [title, isNew])

  const insertAtCursor = (before: string, after = '') => {
    const el = contentRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const newContent = content.slice(0, start) + before + (content.slice(start, end) || '') + after + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + (end - start))
    }, 0)
  }

  const insertBlock = (snippet: string) => {
    const el = contentRef.current
    if (!el) return
    const start = el.selectionStart
    const newContent = content.slice(0, start) + '\n\n' + snippet + '\n\n' + content.slice(start)
    setContent(newContent)
    setBlockSelectValue('_')
    setTimeout(() => el.focus(), 0)
  }

  const applyTemplate = (templateId: ContentTemplateId) => {
    if (!content.trim()) setContent(TEMPLATE_SNIPPETS[templateId])
    else if (confirm('Заменить текущий контент шаблоном?')) setContent(TEMPLATE_SNIPPETS[templateId])
    setTemplateSelectValue('_')
  }

  const handleSave = () => {
    if (!title.trim() || title.length < 3) {
      alert('Название — минимум 3 символа')
      return
    }
    if (!content.trim()) {
      alert('Добавьте содержание')
      return
    }
    router.push('/wiki-new/1')
  }

  return (
    <Box className={styles.form}>
      <Flex gap="2" mb="4">
        <Button variant="ghost" size="2" onClick={() => router.push('/wiki-new')}>
          <ArrowLeftIcon width={16} height={16} />
          Назад
        </Button>
      </Flex>

      <Flex direction="column" gap="4">
        {isNew && (
          <Box>
            <Text size="2" weight="medium" color="gray" mb="2" as="div">
              Шаблон страницы
            </Text>
            <Select.Root
              value={templateSelectValue}
              onValueChange={(v) => {
                setTemplateSelectValue(v)
                if (v && v !== '_') applyTemplate(v as ContentTemplateId)
              }}
            >
              <Select.Trigger className={styles.select} placeholder="Выберите шаблон (опционально)" />
              <Select.Content>
                <Select.Item value="_">— Не использовать шаблон —</Select.Item>
                {CONTENT_TEMPLATES.map((t) => (
                  <Select.Item key={t.value} value={t.value}>
                    {t.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        )}

        <TextField.Root
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="3"
        />
        <TextField.Root placeholder="URL (slug)" value={slug} onChange={(e) => setSlug(e.target.value)} size="2" />
        <Flex gap="3" wrap="wrap">
          <Box>
            <Text size="1" color="gray" mb="1" as="div">Тип страницы</Text>
            <Select.Root value={pageType} onValueChange={(v) => setPageType(v as PageTypeId)}>
              <Select.Trigger className={styles.select} />
              <Select.Content>
                {PAGE_TYPES.map((t) => (
                  <Select.Item key={t.value} value={t.value}>
                    {t.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
          <Box>
            <Text size="1" color="gray" mb="1" as="div">Категория</Text>
            <Select.Root value={category} onValueChange={setCategory}>
              <Select.Trigger className={styles.select} />
              <Select.Content>
                {CATEGORIES.map((c) => (
                  <Select.Item key={c} value={c}>
                    {c}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
        <TextField.Root
          placeholder="Краткое описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="2"
        />

        <Box>
          <Flex align="center" justify="between" mb="2">
            <Text size="2" weight="medium">
              Содержание
            </Text>
            <Flex align="center" gap="2">
              <Text size="1" color="gray">
                Показать исходник
              </Text>
              <Switch checked={showSource} onCheckedChange={setShowSource} />
            </Flex>
          </Flex>

          {showSource && (
            <>
              <Flex gap="1" wrap="wrap" mb="2" className={styles.toolbar}>
                <Button size="1" variant="soft" onClick={() => insertAtCursor('**', '**')} title="Жирный (Ctrl+B)">
                  <FontBoldIcon width={14} height={14} />
                </Button>
                <Button size="1" variant="soft" onClick={() => insertAtCursor('*', '*')} title="Курсив">
                  <FontItalicIcon width={14} height={14} />
                </Button>
                <Button size="1" variant="soft" onClick={() => insertAtCursor('\n## ', '\n')}>
                  <HeadingIcon width={14} height={14} />
                  H2
                </Button>
                <Button size="1" variant="soft" onClick={() => insertAtCursor('\n### ', '\n')}>
                  H3
                </Button>
                <Button size="1" variant="soft" onClick={() => insertAtCursor('\n- ', '')}>
                  <ListBulletIcon width={14} height={14} />
                </Button>
                <Button size="1" variant="soft" onClick={() => insertAtCursor('\n> ', '\n')}>
                  <QuoteIcon width={14} height={14} />
                </Button>
                <Button size="1" variant="soft" onClick={() => insertAtCursor('\n```\n', '\n```\n')}>
                  <CodeIcon width={14} height={14} />
                </Button>
                <Select.Root
                  value={blockSelectValue}
                  onValueChange={(v) => {
                    const block = BLOCK_TEMPLATES.find((b) => b.id === v)
                    if (block) insertBlock(block.snippet)
                    else setBlockSelectValue(v)
                  }}
                >
                  <Select.Trigger className={styles.blockTrigger} />
                  <Select.Content>
                    <Select.Item value="_">Вставить блок…</Select.Item>
                    {BLOCK_TEMPLATES.map((b) => (
                      <Select.Item key={b.id} value={b.id}>
                        {b.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
              <TextArea
                ref={contentRef}
                placeholder="Markdown: заголовки, списки, **жирный**, *курсив*, код..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.textarea}
                rows={18}
              />
            </>
          )}
          {!showSource && (
            <Box className={styles.preview}>
              <Text size="2" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
                {content || 'Предпросмотр (включите «Показать исходник» для редактирования)'}
              </Text>
            </Box>
          )}
        </Box>

        <Flex gap="2">
          <Button size="3" onClick={handleSave}>
            Сохранить
          </Button>
          <Button size="3" variant="soft" onClick={() => router.push('/wiki-new')}>
            Отмена
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
