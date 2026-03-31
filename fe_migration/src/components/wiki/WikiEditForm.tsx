'use client'

import { useState, useEffect, useRef } from "react"
import { Box, Flex, Text, Button, TextArea, TextField, Select, Checkbox, Switch, Dialog } from "@radix-ui/themes"
import { ArrowLeftIcon, Pencil1Icon, TrashIcon, UploadIcon, FontBoldIcon, FontItalicIcon, CodeIcon, QuoteIcon, ListBulletIcon, HeadingIcon, InfoCircledIcon, CheckIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons"
import { useRouter } from "@/router-adapter"
import { useToast } from "@/components/Toast/ToastContext"
import WikiFileUploadModal from "./WikiFileUploadModal"
import WikiTagSelector from "./WikiTagSelector"
import { FloatingConfirmActions } from "./FloatingConfirmActions"
import styles from './WikiEditForm.module.css'

interface WikiPageData {
  id: string
  title: string
  slug: string
  category: string
  relatedApp: string
  tags: string[]
  description: string
  content: string
  order: number
  isPublished: boolean
}

interface WikiEditFormProps {
  initialData?: Partial<WikiPageData>
  isNew?: boolean
}

const CATEGORIES = [
  { value: 'none', label: 'Без категории' },
  { value: 'architect', label: 'Архитектура' },
  { value: 'guide', label: 'Руководство' },
  { value: 'api', label: 'API' },
  { value: 'faq', label: 'FAQ' },
]

const RELATED_APPS = [
  { value: 'none', label: 'Не выбрано' },
  { value: 'accounts', label: 'Управление пользователями' },
  { value: 'finance', label: 'Финансы' },
  { value: 'vacancies', label: 'Вакансии' },
  { value: 'hiring_plan', label: 'План найма' },
]

const AVAILABLE_TAGS = [
  { id: 'ai', label: '#ai', color: '#ef4444' },
  { id: 'architect', label: '#architect', color: '#ef4444' },
  { id: 'вакансии', label: '#вакансии', color: '#ef4444' },
  { id: 'интеграции', label: '#интеграции', color: '#84cc16' },
  { id: 'интервьюеры', label: '#интервьюеры', color: '#10b981' },
  { id: 'использование', label: '#использование', color: '#10b981' },
  { id: 'календарь', label: '#календарь', color: '#a855f7' },
  { id: 'метрики', label: '#метрики', color: '#f59e0b' },
  { id: 'настройка', label: '#настройка', color: '#3b82f6' },
  { id: 'пользователи', label: '#пользователи', color: '#6b7280' },
  { id: 'финансы', label: '#финансы', color: '#06b6d4' },
]

const CONTENT_TEMPLATES = [
  { value: '_', label: '— Не использовать шаблон —' },
  { value: 'wiki_article', label: 'Wiki‑статья (Wikipedia-стиль)' },
  { value: 'how_to', label: 'Инструкция / How-to' },
  { value: 'module_doc', label: 'Документация по модулю' },
]

const TEMPLATE_SNIPPETS: Record<string, string> = {
  wiki_article: '# Заголовок\n\nКраткое описание (2–3 строки).\n\n## Кратко / Основное\n\n- Пункт 1\n- Пункт 2\n\n## Основные разделы\n\n### Раздел 1\n\nТекст.\n\n## См. также\n\n- [Связанная страница](/wiki/1)',
  how_to: '# Как сделать…\n\nКраткий контекст: кому и когда это нужно.\n\n## Предпосылки (Prerequisites)\n\n- Что должно быть уже настроено\n\n## Шаги\n\n### Шаг 1\n\nОписание шага.\n\n### Шаг 2\n\nОписание шага.\n\n## Частые ошибки\n\n- Ошибка 1 и как избежать',
  module_doc: '# Название модуля\n\nКраткое описание роли модуля в системе.\n\n## Назначение\n\nТекст.\n\n## Основные сценарии\n\n- Сценарий 1\n- Сценарий 2\n\n## Ограничения и edge-cases\n\nТекст.\n\n## Ключевые сущности / термины\n\n| Термин | Описание |\n|--------|----------|\n| ... | ... |',
}

const BLOCK_TEMPLATES = [
  { id: 'steps', label: 'Инструкция по шагам', snippet: '### Шаг 1\n\nОписание.\n\n### Шаг 2\n\nОписание.\n\n### Шаг 3\n\nОписание.' },
  { id: 'faq', label: 'FAQ (вопрос — ответ)', snippet: '**Вопрос:** …\n\n**Ответ:** …\n\n---\n\n**Вопрос:** …\n\n**Ответ:** …' },
  { id: 'callout', label: 'Важное предупреждение (callout)', snippet: '> **Важно:** Текст предупреждения или подсказки.' },
  { id: 'code', label: 'Пример кода', snippet: '```\n// вставьте код или пример запроса\n```' },
]

export default function WikiEditForm({ initialData, isNew = false }: WikiEditFormProps) {
  const router = useRouter()
  const toast = useToast()
  /** Мобильный режим по ширине блока карточки действий (задаётся из FloatingConfirmActions) */
  const [isActionsCardNarrow, setIsActionsCardNarrow] = useState(false)

  const [formData, setFormData] = useState<WikiPageData>({
    id: initialData?.id || '',
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    category: initialData?.category || '',
    relatedApp: initialData?.relatedApp || '',
    tags: initialData?.tags || [],
    description: initialData?.description || '',
    content: initialData?.content || '',
    order: initialData?.order || 0,
    isPublished: initialData?.isPublished ?? true,
  })

  const [changeNote, setChangeNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [showSource, setShowSource] = useState(true)
  const [blockSelectValue, setBlockSelectValue] = useState('_')
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const actionsCardRef = useRef<HTMLDivElement>(null)
  const [floatingBarVisible, setFloatingBarVisible] = useState(false)

  const titleError = formData.title.length > 0 && formData.title.trim().length < 3 ? 'Минимум 3 символа' : null
  const slugError =
    formData.slug.length > 0 && !/^[a-z0-9-]*$/.test(formData.slug)
      ? 'Только латинские буквы, цифры и дефисы. Используется для создания URL страницы. Необязательно.'
      : null
  const contentError =
    formData.content.length > 0 && formData.content.trim().length < 10
      ? 'Минимум 10 символов. Поддерживается Markdown форматирование.'
      : null

  const helpContent = (
    <>
      <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
        Форматирование текста
      </Text>
      <Text size="2" color="gray" style={{ display: 'block', marginBottom: '8px' }}>
        Поддерживается Markdown форматирование:
      </Text>
      <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
        <li><Text size="2" color="gray"><strong>**жирный текст**</strong> - жирный текст</Text></li>
        <li><Text size="2" color="gray"><em>*курсив*</em> - курсив</Text></li>
        <li><Text size="2" color="gray"><code>`код`</code> - код</Text></li>
        <li><Text size="2" color="gray"># Заголовок 1</Text></li>
        <li><Text size="2" color="gray">## Заголовок 2</Text></li>
        <li><Text size="2" color="gray">- Список</Text></li>
        <li><Text size="2" color="gray">1. Нумерованный список</Text></li>
      </ul>
      <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px', marginTop: '16px' }}>
        Рекомендации
      </Text>
      <ul style={{ marginLeft: '20px' }}>
        <li><Text size="2" color="gray">Используйте понятные и описательные названия</Text></li>
        <li><Text size="2" color="gray">Указывайте категорию для удобной навигации</Text></li>
        <li><Text size="2" color="gray">Добавляйте краткое описание для превью</Text></li>
        <li><Text size="2" color="gray">Структурируйте содержимое с помощью заголовков</Text></li>
      </ul>
    </>
  )

  // Автогенерация slug из title
  useEffect(() => {
    if (isNew && formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.title, isNew, formData.slug])

  const handleChange = (field: keyof WikiPageData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Валидация
    if (!formData.title.trim() || formData.title.length < 3) {
      alert('Название должно содержать минимум 3 символа')
      setIsSubmitting(false)
      return
    }

    if (!formData.content.trim() || formData.content.length < 10) {
      alert('Содержание должно содержать минимум 10 символов')
      setIsSubmitting(false)
      return
    }

    try {
      // TODO: Отправка данных на сервер
      console.log('Saving wiki page:', { ...formData, changeNote })
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // После успешного сохранения переходим на страницу просмотра
      router.push(`/wiki/${formData.slug || formData.id}`)
    } catch (error) {
      console.error('Error saving wiki page:', error)
      alert('Ошибка при сохранении страницы')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isNew) {
      router.push('/wiki')
    } else {
      router.push(`/wiki/${formData.id}`)
    }
  }

  const handleDeleteConfirm = () => {
    // TODO: Удаление страницы
    console.log('Deleting wiki page:', formData.id)
    router.push('/wiki')
  }

  const showDeleteToast = () => {
    toast.showWarning('Удалить страницу?', 'Вы уверены, что хотите удалить эту страницу?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: handleDeleteConfirm, variant: 'solid', color: 'red' },
      ],
    })
  }

  const handleFileUpload = (content: string, fileName: string) => {
    // Вставляем содержимое файла в поле content
    setFormData(prev => ({
      ...prev,
      content: prev.content ? prev.content + '\n\n' + content : content
    }))
    setIsUploadModalOpen(false)
  }

  const insertAtCursor = (before: string, after = '') => {
    const el = contentRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const newContent = formData.content.slice(0, start) + before + (formData.content.slice(start, end) || '') + after + formData.content.slice(end)
    handleChange('content', newContent)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + (end - start))
    }, 0)
  }

  const insertBlock = (snippet: string) => {
    const el = contentRef.current
    if (!el) return
    const start = el.selectionStart
    const newContent = formData.content.slice(0, start) + '\n\n' + snippet + '\n\n' + formData.content.slice(start)
    handleChange('content', newContent)
    setBlockSelectValue('_')
    setTimeout(() => el.focus(), 0)
  }

  const applyTemplate = (templateId: string) => {
    const snippet = TEMPLATE_SNIPPETS[templateId]
    if (!snippet) return
    if (!formData.content.trim()) handleChange('content', snippet)
    else if (confirm('Заменить текущий контент шаблоном?')) handleChange('content', snippet)
  }

  return (
    <Box className={styles.editContainer}>
      {/* Хлебные крошки */}
      <Flex align="center" gap="2" mb="4" wrap="nowrap" className={styles.breadcrumbs}>
        <Text 
          size="2" 
          color="gray" 
          style={{ cursor: 'pointer' }} 
          onClick={() => router.push('/wiki')}
        >
          Вики
        </Text>
        <Text size="2" color="gray">/</Text>
        {!isNew && (
          <>
            <Text 
              size="2" 
              color="gray" 
              style={{ cursor: 'pointer' }} 
              onClick={() => router.push(`/wiki/${formData.id}`)}
            >
              {formData.title || 'Страница'}
            </Text>
            <Text size="2" color="gray">/</Text>
          </>
        )}
        <Text size="2" color="gray">
          {isNew ? 'Создать' : 'Редактировать'}
        </Text>
      </Flex>

      <form id="wiki-edit-form" onSubmit={handleSubmit} className={styles.formWrapper}>
        <Flex gap="4" className={styles.content}>
          {/* Колонка: заголовок и поля */}
          <Box className={styles.formContainer}>
            <Box className={styles.formHeader}>
              <Flex align="center" justify="between" gap="2" wrap="wrap">
                <Flex align="center" gap="2">
                  <Pencil1Icon width={20} height={20} />
                  <Text size="5" weight="bold">
                    {isNew ? 'Создать новую страницу' : 'Редактировать страницу'}
                  </Text>
                </Flex>
                <Button
                  type="button"
                  size="1"
                  variant="ghost"
                  radius="full"
                  className={styles.helpTriggerMobile}
                  onClick={() => setIsHelpModalOpen(true)}
                  title="Справка"
                  aria-label="Открыть справку"
                >
                  <InfoCircledIcon width={20} height={20} />
                </Button>
              </Flex>
            </Box>

            <Box className={styles.form}>
            {/* Название */}
            <Box className={styles.field}>
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                Название <Text color="red">*</Text>
              </Text>
              <TextField.Root
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Введите название страницы"
                required
                minLength={3}
              />
              {titleError ? (
                <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                  {titleError}
                </Text>
              ) : null}
            </Box>

            {/* URL-адрес (необязательный, статьи идентифицируются по id) */}
            <Box className={styles.field}>
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                URL-адрес
              </Text>
              <TextField.Root
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="nastroyki-kompanii"
                pattern="[a-z0-9-]*"
              />
              {slugError ? (
                <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                  {slugError}
                </Text>
              ) : null}
            </Box>

            {/* Категория и связанное приложение */}
            <Flex gap="3" className={styles.row}>
              <Box className={styles.field} style={{ flex: 1 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Категория
                </Text>
                <Select.Root
                  value={formData.category || 'none'}
                  onValueChange={(value) => handleChange('category', value === 'none' ? '' : value)}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {CATEGORIES.map(cat => (
                      <Select.Item key={cat.value} value={cat.value}>
                        {cat.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box className={styles.field} style={{ flex: 1 }}>
                <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Связанное приложение
                </Text>
                <Select.Root
                  value={formData.relatedApp || 'none'}
                  onValueChange={(value) => handleChange('relatedApp', value === 'none' ? '' : value)}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {RELATED_APPS.map(app => (
                      <Select.Item key={app.value} value={app.value}>
                        {app.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            {/* Краткое описание */}
            <Box className={styles.field}>
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                Краткое описание
              </Text>
              <TextArea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Краткое описание страницы для превью"
                maxLength={500}
                rows={3}
              />
              {formData.description.length > 500 ? (
                <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                  Максимум 500 символов
                </Text>
              ) : null}
            </Box>

            {/* Метки (теги) — отдельный блок на всю ширину */}
            <Box className={styles.fullWidthBlock}>
              <WikiTagSelector
                availableTags={AVAILABLE_TAGS}
                selectedTags={formData.tags}
                onTagsChange={(tags) => handleChange('tags', tags)}
              />
            </Box>
            </Box>
            {/* /form — конец колонки полей */}
          </Box>
          {/* /formContainer */}

          {/* Справка (на десктопе — сайдбар, на мобильных скрыта, открывается по кнопке инфо) */}
          <Box className={styles.helpContainer}>
            <Box className={styles.helpCard}>
              <Text size="4" weight="bold" style={{ display: 'block', marginBottom: '12px' }}>
                Справка
              </Text>
              {helpContent}
            </Box>
          </Box>
        </Flex>
        {/* /content — верхняя строка */}

        {/* Карточка: Содержание */}
        <Box className={styles.mainContentBlock}>
              <Box className={styles.contentBlock}>
                <Flex justify="between" align="center" wrap="wrap" gap="2" className={styles.contentBlockHeader}>
                <Text size="2" weight="medium">
                  Содержание <Text color="red">*</Text>
                </Text>
                <Flex align="center" gap="2">
                  <Button
                    type="button"
                    size="2"
                    variant="soft"
                    onClick={() => setIsUploadModalOpen(true)}
                    style={{
                      backgroundColor: 'var(--gray-3)',
                      color: 'var(--gray-11)',
                    }}
                  >
                    <UploadIcon width={14} height={14} />
                    Загрузить из файла
                  </Button>
                  <Flex align="center" gap="2">
                    <Text size="1" color="gray">Показать исходник</Text>
                    <Switch checked={showSource} onCheckedChange={setShowSource} />
                  </Flex>
                </Flex>
                </Flex>
                {showSource && (
                  <>
                    <Flex gap="1" wrap="wrap" mb="2" className={styles.toolbar} justify="between" align="center">
                    <Flex gap="1" wrap="wrap">
                      <Button type="button" size="1" variant="soft" onClick={() => insertAtCursor('**', '**')} title="Жирный">
                        <FontBoldIcon width={14} height={14} />
                      </Button>
                      <Button type="button" size="1" variant="soft" onClick={() => insertAtCursor('*', '*')} title="Курсив">
                        <FontItalicIcon width={14} height={14} />
                      </Button>
                      <Button type="button" size="1" variant="soft" onClick={() => insertAtCursor('\n## ', '\n')}>
                        <HeadingIcon width={14} height={14} />
                        H2
                      </Button>
                      <Button type="button" size="1" variant="soft" onClick={() => insertAtCursor('\n### ', '\n')}>
                        H3
                      </Button>
                      <Button type="button" size="1" variant="soft" onClick={() => insertAtCursor('\n- ', '')}>
                        <ListBulletIcon width={14} height={14} />
                      </Button>
                      <Button type="button" size="1" variant="soft" onClick={() => insertAtCursor('\n> ', '\n')}>
                        <QuoteIcon width={14} height={14} />
                      </Button>
                      <Button type="button" size="1" variant="soft" onClick={() => insertAtCursor('\n```\n', '\n```\n')}>
                        <CodeIcon width={14} height={14} />
                      </Button>
                    </Flex>
                    <Flex gap="2" align="center" style={{ flexShrink: 0 }}>
                      <Select.Root
                        value={blockSelectValue}
                        onValueChange={(v) => {
                          setBlockSelectValue(v)
                          const block = BLOCK_TEMPLATES.find((b) => b.id === v)
                          if (block) insertBlock(block.snippet)
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
                      <Button
                        type="button"
                        size="2"
                        variant="soft"
                        onClick={() => setIsTemplateModalOpen(true)}
                        className={styles.addTemplateButton}
                        style={{ backgroundColor: 'var(--gray-3)', color: 'var(--gray-11)' }}
                      >
                        <PlusIcon width={14} height={14} className={styles.addTemplateButtonIcon} />
                        <span className={styles.addTemplateButtonLabel}>Добавить шаблон</span>
                      </Button>
                    </Flex>
                    </Flex>
                    <TextArea
                      ref={contentRef}
                      value={formData.content}
                      onChange={(e) => handleChange('content', e.target.value)}
                      placeholder="Введите содержание страницы (поддерживается Markdown)"
                      required
                      minLength={10}
                      rows={20}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </>
                )}
                {!showSource && (
                  <Box className={styles.preview}>
                    <Text size="2" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
                      {formData.content || 'Включите «Показать исходник» для редактирования. Здесь отображается результат без сохранения.'}
                    </Text>
                  </Box>
                )}
                {contentError ? (
                  <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                    {contentError}
                  </Text>
                ) : null}
              </Box>
              {/* /Содержание */}
            </Box>
        {/* /mainContentBlock — карточка «Содержание» */}

        {/* Карточка: Порядок сортировки, Опубликовано, Примечание */}
        <Box className={`${styles.card} ${styles.optionsCard}`}>
              <Flex gap="3" className={styles.row}>
                <Box className={styles.field} style={{ flex: 1 }}>
                  <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                    Порядок сортировки
                  </Text>
                  <TextField.Root
                    type="number"
                    value={formData.order.toString()}
                    onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                  <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                    Меньше значение = выше в списке
                  </Text>
                </Box>
                <Box className={`${styles.field} ${styles.publishedField}`} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Flex align="center" gap="2">
                    <Checkbox
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => handleChange('isPublished', checked)}
                    />
                    <Text size="2" weight="medium">
                      Опубликовано
                    </Text>
                  </Flex>
                </Box>
              </Flex>

              {/* Примечание к изменению (только при редактировании) */}
              {!isNew && (
                <Box className={styles.field}>
                  <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                    Примечание к изменению
                  </Text>
                  <TextField.Root
                    value={changeNote}
                    onChange={(e) => setChangeNote(e.target.value)}
                    placeholder="Краткое описание внесенных изменений"
                    maxLength={200}
                  />
                  <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                    Будет сохранено в истории изменений
                  </Text>
                </Box>
              )}
            </Box>
        {/* /optionsCard */}

        {/* Карточка: кнопки действий (Удалить слева, Отмена и Сохранить справа) — в одну строку, с иконками; на ≤800px скрыта, только плавающие кнопки */}
        {/* Обёртка с ref: по её ширине определяется мобильный режим; сама карточка внутри скрывается при узкой ширине */}
        <Box ref={actionsCardRef} className={styles.actionsCardWrapper}>
          <Box
            className={`${styles.card} ${styles.actionsCard} ${isActionsCardNarrow ? styles.actionsCardHiddenWhenNarrow : ''}`}
          >
              <Flex justify="between" align="center" wrap="nowrap" className={styles.actions}>
                {!isNew ? (
                  <Button
                    type="button"
                    size="3"
                    variant="soft"
                    color="red"
                    onClick={showDeleteToast}
                    disabled={isSubmitting}
                  >
                    <TrashIcon width={16} height={16} />
                    Удалить
                  </Button>
                ) : (
                  <Box />
                )}
                <Flex
                  gap="2"
                  wrap="nowrap"
                  className={floatingBarVisible ? styles.actionsGroupHidden : undefined}
                  aria-hidden={floatingBarVisible}
                >
                  <Button
                    type="button"
                    size="3"
                    variant="soft"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <Cross2Icon width={16} height={16} />
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    size="3"
                    style={{
                      backgroundColor: 'var(--accent-9)',
                      color: '#ffffff',
                    }}
                    disabled={isSubmitting}
                  >
                    <CheckIcon width={16} height={16} />
                    {isSubmitting ? 'Сохранение...' : (isNew ? 'Создать страницу' : 'Сохранить изменения')}
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </Box>
        {/* /actionsCard */}
      </form>

      <FloatingConfirmActions
        formId="wiki-edit-form"
        onCancel={handleCancel}
        onDelete={showDeleteToast}
        isNew={isNew}
        isSubmitting={isSubmitting}
        actionsCardRef={actionsCardRef}
        onMobileModeChange={setIsActionsCardNarrow}
        onVisibilityChange={setFloatingBarVisible}
        saveLabel="Сохранить изменения"
        createLabel="Создать страницу"
        submittingLabel="Сохранение..."
      />

      {/* Модальное окно загрузки файлов */}
      <WikiFileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUpload={handleFileUpload}
      />

      {/* Модальное окно шаблонов */}
      <Dialog.Root open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <Dialog.Content style={{ maxWidth: 520 }}>
          <Dialog.Title>Добавить шаблон</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="3">
            Выберите шаблон страницы или блок для вставки в содержание.
          </Dialog.Description>
          <Flex direction="column" gap="4">
            <Box>
              <Text size="2" weight="medium" mb="2" as="div">Шаблон страницы</Text>
              <Text size="1" color="gray" mb="2" as="div">Заменит всё содержание страницы</Text>
              <Flex gap="2" wrap="wrap">
                {CONTENT_TEMPLATES.filter((t) => t.value !== '_').map((t) => (
                  <Button
                    key={t.value}
                    size="2"
                    variant="soft"
                    onClick={() => {
                      applyTemplate(t.value)
                      setIsTemplateModalOpen(false)
                    }}
                  >
                    {t.label}
                  </Button>
                ))}
              </Flex>
            </Box>
            <Box>
              <Text size="2" weight="medium" mb="2" as="div">Блоки для вставки</Text>
              <Text size="1" color="gray" mb="2" as="div">Вставка в текущую позицию курсора</Text>
              <Flex gap="2" wrap="wrap">
                {BLOCK_TEMPLATES.map((b) => (
                  <Button
                    key={b.id}
                    size="2"
                    variant="soft"
                    onClick={() => {
                      insertBlock(b.snippet)
                      setIsTemplateModalOpen(false)
                    }}
                  >
                    {b.label}
                  </Button>
                ))}
              </Flex>
            </Box>
          </Flex>
          <Flex gap="2" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Закрыть</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Модальное окно справки (для мобильных) */}
      <Dialog.Root open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <Dialog.Content className={styles.helpModalContent} style={{ maxWidth: 400 }}>
          <Dialog.Title>Справка</Dialog.Title>
          <Box className={styles.helpModalBody}>
            {helpContent}
          </Box>
          <Flex gap="2" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Закрыть</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
