'use client'

import { Box, Flex, Text, Button, Card, Table, TextField, Select, Dialog, Switch, Callout, TextArea, Badge } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon, EyeOpenIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './CandidateFieldsSettings.module.css'

interface CandidateField {
  id: string
  /** Уникальный ключ для API и интеграций (латиница, snake_case). */
  fieldKey: string
  name: string
  description?: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'textarea' | 'url' | 'checkbox'
  required: boolean
  order: number
  options?: string[]
  placeholder?: string
  /** Строковое представление значения по умолчанию; для checkbox: 'true' | 'false'. */
  defaultValue?: string
  isActive?: boolean
}

/** Простая генерация ключа из названия (если пользователь не задал свой). */
function fieldKeyFromName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 48)
  return base || `field_${Date.now()}`
}

// Моковые данные (расширенный набор типов и атрибутов — см. RECRUITING_SETTINGS_UX_PLAN_2026-03-24.md §4)
const mockFields: CandidateField[] = [
  {
    id: '1',
    fieldKey: 'age',
    name: 'Возраст',
    description: 'Полных лет',
    type: 'number',
    required: false,
    order: 1,
    placeholder: 'Введите возраст',
    isActive: true,
  },
  {
    id: '2',
    fieldKey: 'gender',
    name: 'Пол',
    type: 'select',
    required: false,
    order: 2,
    options: ['Мужской', 'Женский', 'Не указано'],
    isActive: true,
  },
  {
    id: '3',
    fieldKey: 'salary_expectations',
    name: 'Зарплатные ожидания',
    type: 'text',
    required: false,
    order: 3,
    placeholder: 'Например: от 200 000 ₽ net',
    isActive: true,
  },
  {
    id: '4',
    fieldKey: 'experience_years',
    name: 'Опыт работы',
    type: 'number',
    required: false,
    order: 4,
    placeholder: 'Лет в профессии',
    isActive: true,
  },
  {
    id: '5',
    fieldKey: 'linkedin_url',
    name: 'LinkedIn профиль',
    type: 'url',
    required: false,
    order: 5,
    placeholder: 'https://linkedin.com/in/username',
    isActive: true,
  },
  {
    id: '6',
    fieldKey: 'ready_to_relocate',
    name: 'Готовность к переезду',
    description: 'Булево поле для фильтрации',
    type: 'checkbox',
    required: false,
    order: 6,
    defaultValue: 'false',
    isActive: true,
  },
  {
    id: '7',
    fieldKey: 'availability_date',
    name: 'Дата выхода на работу',
    type: 'date',
    required: false,
    order: 7,
    isActive: true,
  },
  {
    id: '8',
    fieldKey: 'tech_stack',
    name: 'Стек технологий',
    type: 'multiselect',
    required: false,
    order: 8,
    options: ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Другое'],
    isActive: true,
  },
  {
    id: '9',
    fieldKey: 'recruiter_comment',
    name: 'Комментарий рекрутёра',
    type: 'textarea',
    required: false,
    order: 9,
    placeholder: 'Внутренние заметки',
    isActive: true,
  },
  {
    id: '10',
    fieldKey: 'source_channel',
    name: 'Канал привлечения',
    type: 'select',
    required: true,
    order: 10,
    options: ['hh.ru', 'LinkedIn', 'Рекомендация', 'Конференция', 'Другое'],
    isActive: true,
  },
]

const fieldTypes: { value: CandidateField['type']; label: string }[] = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'select', label: 'Выпадающий список' },
  { value: 'multiselect', label: 'Мультивыбор' },
  { value: 'date', label: 'Дата' },
  { value: 'textarea', label: 'Многострочный текст' },
  { value: 'url', label: 'Ссылка' },
  { value: 'checkbox', label: 'Да / нет (чекбокс)' },
]

interface MockVacancy {
  id: string
  title: string
}

/** Вакансии, где поле может быть доступно (мок). */
const mockVacancies: MockVacancy[] = [
  { id: 'vac-1', title: 'Senior Frontend Developer' },
  { id: 'vac-2', title: 'Product Manager' },
  { id: 'vac-3', title: 'Аналитик данных' },
  { id: 'vac-4', title: 'HR Business Partner' },
]

export default function CandidateFieldsSettings() {
  const toast = useToast()
  const [fields, setFields] = useState<CandidateField[]>(mockFields)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<CandidateField | null>(null)
  const [formData, setFormData] = useState<Partial<CandidateField>>({
    fieldKey: '',
    name: '',
    description: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: [],
    defaultValue: undefined,
    isActive: true,
  })
  const [newOption, setNewOption] = useState('')
  /** fieldId → vacancyId → видно ли поле в анкете/карточке по этой вакансии */
  const [vacancyVisibilityByField, setVacancyVisibilityByField] = useState<
    Record<string, Record<string, boolean>>
  >({})
  const [visibilityFieldId, setVisibilityFieldId] = useState<string | null>(null)

  const openVisibilityModal = (field: CandidateField) => {
    setVisibilityFieldId(field.id)
    setVacancyVisibilityByField((prev) => {
      if (prev[field.id]) return prev
      const initial: Record<string, boolean> = {}
      for (const v of mockVacancies) {
        initial[v.id] = true
      }
      return { ...prev, [field.id]: initial }
    })
  }

  const setVacancyVisible = (fieldId: string, vacancyId: string, visible: boolean) => {
    setVacancyVisibilityByField((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], [vacancyId]: visible },
    }))
  }

  const visibilityField = visibilityFieldId ? fields.find((f) => f.id === visibilityFieldId) : undefined
  const visibilityMap = visibilityFieldId ? vacancyVisibilityByField[visibilityFieldId] ?? {} : {}

  const handleAddField = () => {
    setEditingField(null)
    setFormData({
      fieldKey: '',
      name: '',
      description: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
      defaultValue: undefined,
      isActive: true,
    })
    setNewOption('')
    setIsDialogOpen(true)
  }

  const handleEditField = (field: CandidateField) => {
    setEditingField(field)
    setFormData({
      fieldKey: field.fieldKey,
      name: field.name,
      description: field.description,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder,
      options: field.options || [],
      defaultValue: field.defaultValue,
      isActive: field.isActive !== false,
    })
    setNewOption('')
    setIsDialogOpen(true)
  }

  const handleDeleteField = (id: string) => {
    toast.showWarning('Удалить поле?', 'Вы уверены, что хотите удалить это поле?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setFields(prev => prev.filter(f => f.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  const handleMoveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === id)
    if (index === -1) return

    const newFields = [...fields]
    if (direction === 'up' && index > 0) {
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]]
      newFields[index - 1].order = index
      newFields[index].order = index + 1
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]]
      newFields[index].order = index + 1
      newFields[index + 1].order = index + 2
    }
    setFields(newFields)
  }

  const handleSaveField = () => {
    if (!formData.name?.trim()) {
      alert('Пожалуйста, введите название поля')
      return
    }

    const resolvedKey = (formData.fieldKey || '').trim() || fieldKeyFromName(formData.name)
    const needsOptions = formData.type === 'select' || formData.type === 'multiselect'
    const options = needsOptions ? formData.options : undefined

    const base: Omit<CandidateField, 'id' | 'order'> = {
      fieldKey: resolvedKey,
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      type: formData.type as CandidateField['type'],
      required: formData.required || false,
      placeholder: formData.type === 'checkbox' ? undefined : formData.placeholder?.trim() || undefined,
      options,
      defaultValue:
        formData.type === 'checkbox'
          ? formData.defaultValue === 'true'
            ? 'true'
            : 'false'
          : formData.defaultValue?.trim() || undefined,
      isActive: formData.isActive !== false,
    }

    if (editingField) {
      setFields(
        fields.map((f) =>
          f.id === editingField.id
            ? {
                ...f,
                ...base,
                options: needsOptions ? options : undefined,
              }
            : f
        )
      )
    } else {
      const newField: CandidateField = {
        id: Date.now().toString(),
        ...base,
        order: fields.length + 1,
        options: needsOptions ? options : undefined,
      }
      setFields([...fields, newField])
    }

    setIsDialogOpen(false)
  }

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), newOption.trim()]
      })
      setNewOption('')
    }
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(formData.options || [])]
    newOptions.splice(index, 1)
    setFormData({ ...formData, options: newOptions })
  }

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="3" color="gray">
          Управляйте дополнительными полями, которые будут отображаться в профилях кандидатов
        </Text>
        <Button onClick={handleAddField}>
          <PlusIcon width={16} height={16} />
          Добавить поле
        </Button>
      </Flex>

      <Callout.Root color="blue" mb="4">
        <Callout.Icon>
          <InfoCircledIcon width={16} height={16} />
        </Callout.Icon>
        <Box className={styles.calloutMain}>
          <Text size="2" as="p" style={{ margin: 0 }}>
            Здесь задаётся <Text weight="bold" as="span">единый профиль полей</Text> для компании — общие правила для всех вакансий.
          </Text>
          <Text size="2" as="p" style={{ margin: 0 }}>
            Индивидуальные настройки — на карточке вакансии, вкладка «Дополнительные поля».
          </Text>
            <Box>
            <Text size="2" weight="medium" mb="1" style={{ display: 'block' }}>
              Пример пути (шаблон)
            </Text>
            <pre className={styles.calloutUrl}>
              {`/vacancies?vacancy=<id>&mode=view&tab=additionalFields`}
            </pre>
          </Box>
          <Text size="2" className={styles.calloutDocRef} as="p" style={{ margin: 0 }}>
            Документация в репозитории:{' '}
            <Text weight="medium" as="span">
              fe_migration/docs/RECRUITING_SETTINGS_UX_PLAN_2026-03-24.md
            </Text>
            , раздел 4.
          </Text>
        </Box>
      </Callout.Root>

      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell style={{ width: '50px' }}>Порядок</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ minWidth: '120px' }}>Ключ (API)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ minWidth: '100px' }}>Тип</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Обяз.</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Активно</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ width: '240px' }}>Действия</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.map((field, index) => (
              <Table.Row key={field.id}>
                <Table.Cell>
                  <Flex gap="1">
                    <Button
                      size="1"
                      variant="ghost"
                      onClick={() => handleMoveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUpIcon width={12} height={12} />
                    </Button>
                    <Button
                      size="1"
                      variant="ghost"
                      onClick={() => handleMoveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      <ChevronDownIcon width={12} height={12} />
                    </Button>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" style={{ fontFamily: 'var(--code-font-family, ui-monospace, monospace)' }}>
                    {field.fieldKey}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text weight="medium">{field.name}</Text>
                  {field.description && (
                    <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                      {field.description}
                    </Text>
                  )}
                  {field.placeholder && (
                    <Text size="1" color="gray" style={{ display: 'block', marginTop: '2px' }}>
                      {field.placeholder}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Text>{fieldTypes.find(t => t.value === field.type)?.label || field.type}</Text>
                  {(field.type === 'select' || field.type === 'multiselect') && field.options && (
                    <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                      {field.options.length} вариантов
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {field.required ? (
                    <Text color="green">Да</Text>
                  ) : (
                    <Text color="gray">Нет</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {field.isActive !== false ? (
                    <Badge color="green" size="1">Да</Badge>
                  ) : (
                    <Badge color="gray" size="1">Нет</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button
                      size="1"
                      variant="soft"
                      color="gray"
                      title="Видимость по вакансиям"
                      onClick={() => openVisibilityModal(field)}
                    >
                      <EyeOpenIcon width={14} height={14} />
                    </Button>
                    <Button
                      size="1"
                      variant="soft"
                      onClick={() => handleEditField(field)}
                    >
                      <Pencil2Icon width={14} height={14} />
                    </Button>
                    <Button
                      size="1"
                      variant="soft"
                      color="red"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <TrashIcon width={14} height={14} />
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>

      <Dialog.Root
        open={visibilityFieldId !== null}
        onOpenChange={(open) => {
          if (!open) setVisibilityFieldId(null)
        }}
      >
        <Dialog.Content style={{ maxWidth: '520px' }}>
          <Dialog.Title>Видимость поля по вакансиям</Dialog.Title>
          <Text size="2" color="gray" mt="1" mb="3" style={{ display: 'block' }}>
            {visibilityField
              ? `Поле «${visibilityField.name}»: где показывать в контексте вакансий (мок-список вакансий).`
              : ''}
          </Text>
          <Flex direction="column" gap="3">
            {mockVacancies.map((vac) => (
              <Flex key={vac.id} align="center" justify="between" gap="3">
                <Text size="2" style={{ flex: 1 }}>
                  {vac.title}
                </Text>
                <Flex align="center" gap="2">
                  <Text size="1" color="gray">
                    {visibilityMap[vac.id] ? 'Доступно' : 'Скрыто'}
                  </Text>
                  <Switch
                    checked={visibilityMap[vac.id] !== false}
                    onCheckedChange={(checked) =>
                      visibilityFieldId && setVacancyVisible(visibilityFieldId, vac.id, checked)
                    }
                    size="2"
                  />
                </Flex>
              </Flex>
            ))}
          </Flex>
          <Flex justify="end" mt="4">
            <Button variant="soft" onClick={() => setVisibilityFieldId(null)}>
              Закрыть
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content style={{ maxWidth: '600px' }}>
          <Dialog.Title>
            {editingField ? 'Редактировать поле' : 'Добавить поле'}
          </Dialog.Title>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Ключ поля (API) *
              </Text>
              <TextField.Root
                value={formData.fieldKey || ''}
                onChange={(e) => setFormData({ ...formData, fieldKey: e.target.value })}
                placeholder="latin_snake_case, например salary_expectations"
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Если оставить пустым, ключ будет сгенерирован из названия (только латиница).
              </Text>
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Название поля *
              </Text>
              <TextField.Root
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Возраст"
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Описание
              </Text>
              <TextArea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Подсказка для рекрутера или кандидата"
                rows={2}
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Тип поля *
              </Text>
              <Select.Root
                value={formData.type}
                onValueChange={(value) => {
                  const next = value as CandidateField['type']
                  const withOptions = next === 'select' || next === 'multiselect'
                  setFormData({
                    ...formData,
                    type: next,
                    options: withOptions ? formData.options || [] : undefined,
                    placeholder: next === 'checkbox' ? undefined : formData.placeholder,
                    defaultValue: next === 'checkbox' ? (formData.defaultValue === 'true' ? 'true' : 'false') : formData.defaultValue,
                  })
                }}
              >
                <Select.Trigger />
                <Select.Content>
                  {fieldTypes.map(type => (
                    <Select.Item key={type.value} value={type.value}>
                      {type.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {(formData.type === 'select' || formData.type === 'multiselect') && (
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Варианты выбора
                </Text>
                <Flex gap="2" mb="2">
                  <TextField.Root
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Добавить вариант"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddOption()
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button onClick={handleAddOption}>
                    <PlusIcon width={16} height={16} />
                  </Button>
                </Flex>
                {formData.options && formData.options.length > 0 && (
                  <Flex direction="column" gap="1">
                    {formData.options.map((option, index) => (
                      <Flex key={index} align="center" gap="2" style={{ padding: '8px', backgroundColor: 'var(--gray-2)', borderRadius: '4px' }}>
                        <Text size="2" style={{ flex: 1 }}>{option}</Text>
                        <Button
                          size="1"
                          variant="ghost"
                          color="red"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <TrashIcon width={12} height={12} />
                        </Button>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Box>
            )}

            {(formData.type === 'text' ||
              formData.type === 'number' ||
              formData.type === 'textarea' ||
              formData.type === 'url' ||
              formData.type === 'date') && (
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Placeholder
                </Text>
                <TextField.Root
                  value={formData.placeholder || ''}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder={
                    formData.type === 'url'
                      ? 'Например: https://example.com'
                      : formData.type === 'date'
                        ? 'Например: ДД.ММ.ГГГГ'
                        : 'Подсказка для поля'
                  }
                />
              </Box>
            )}

            {formData.type === 'checkbox' && (
              <Flex align="center" gap="2">
                <Switch
                  checked={formData.defaultValue === 'true'}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, defaultValue: c ? 'true' : 'false' })
                  }
                />
                <Text size="2">Значение по умолчанию: да</Text>
              </Flex>
            )}

            {formData.type !== 'checkbox' && (
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Значение по умолчанию (строка)
                </Text>
                <TextField.Root
                  value={formData.defaultValue || ''}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  placeholder="Необязательно"
                />
              </Box>
            )}

            <Flex align="center" gap="2">
              <input
                type="checkbox"
                checked={formData.required || false}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                id="required-field"
              />
              <Text size="2" as="label" htmlFor="required-field" style={{ cursor: 'pointer' }}>
                Обязательное поле
              </Text>
            </Flex>

            <Flex align="center" gap="2">
              <Switch
                checked={formData.isActive !== false}
                onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
                id="active-field"
              />
              <Text size="2" as="label" htmlFor="active-field" style={{ cursor: 'pointer' }}>
                Поле активно (учитывается в формах)
              </Text>
            </Flex>
          </Flex>

          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveField}>
              <CheckIcon width={16} height={16} />
              Сохранить
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
