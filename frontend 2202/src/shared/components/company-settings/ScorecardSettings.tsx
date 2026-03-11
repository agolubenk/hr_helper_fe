/**
 * ScorecardSettings - настройка критериев оценки
 */
import {
  Box,
  Flex,
  Text,
  Button,
  Card,
  TextField,
  Dialog,
  Callout,
} from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, InfoCircledIcon, ListBulletIcon } from '@radix-ui/react-icons'
import { useToast } from '@/shared/components/feedback/Toast'
import styles from './ScorecardSettings.module.css'

interface ScorecardCriteria {
  id: string
  name: string
  description?: string
  order: number
  children?: ScorecardCriteria[]
  parentId?: string
}

interface Pattern {
  id: string
  label: string
  value: string
  category: string
}

const AVAILABLE_PATTERNS: Pattern[] = [
  { id: 'text', label: 'T Текст/Text', value: '[text]', category: 'Текст' },
  { id: 'vacancy_title', label: 'Вакансия', value: '[vacancy_title]', category: 'Вакансия' },
  { id: 'vacancy_id', label: '# ID вакансии', value: '[vacancy_id]', category: 'Вакансия' },
  { id: 'candidate_lastname', label: 'Фамилия', value: '[candidate_lastname]', category: 'Кандидат' },
  { id: 'candidate_firstname', label: 'Имя', value: '[candidate_firstname]', category: 'Кандидат' },
  { id: 'candidate_patronymic', label: 'Отчество', value: '[candidate_patronymic]', category: 'Кандидат' },
  { id: 'candidate_id', label: 'ID кандидата', value: '[candidate_id]', category: 'Кандидат' },
  { id: 'grade', label: 'Senior', value: '[grade]', category: 'Грейд' },
  { id: 'date_day', label: 'День (08)', value: '[date_day]', category: 'Дата и время' },
  { id: 'date_full', label: 'Дата (08.09.2025)', value: '[date_full]', category: 'Дата и время' },
  { id: 'month_num', label: 'Месяц (09)', value: '[month_num]', category: 'Дата и время' },
  { id: 'month_short_ru', label: 'Месяц (сен)', value: '[month_short_ru]', category: 'Дата и время' },
  { id: 'month_full_ru', label: 'Месяц (сентябрь)', value: '[month_full_ru]', category: 'Дата и время' },
  { id: 'weekday_short_ru', label: 'День недели (ПН)', value: '[weekday_short_ru]', category: 'День недели' },
  { id: 'interviewer_name', label: 'Имя интервьюера', value: '[interviewer_name]', category: 'Интервьюер' },
]

const mockCriteria: ScorecardCriteria[] = [
  {
    id: '1',
    name: 'Технические навыки',
    description: '[candidate_firstname] [candidate_lastname] [vacancy_title]',
    order: 1,
    children: [
      { id: '1-1', name: 'Знание технологий', description: '[vacancy_title]', order: 1, parentId: '1' },
      { id: '1-2', name: 'Опыт работы', description: '[grade]', order: 2, parentId: '1' },
    ],
  },
  { id: '2', name: 'Коммуникативные навыки', description: '[candidate_firstname] [candidate_lastname]', order: 2 },
  { id: '3', name: 'Дата интервью', description: '[month_num] [month_full_ru] [date_day] ([weekday_short_ru])', order: 3 },
]

export default function ScorecardSettings() {
  const toast = useToast()
  const [criteria, setCriteria] = useState<ScorecardCriteria[]>(mockCriteria)
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState('')
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false)
  const [protectedSheets, setProtectedSheets] = useState<string>('')

  const getAllCriteria = (items: ScorecardCriteria[], level = 0): Array<ScorecardCriteria & { level: number }> => {
    const result: Array<ScorecardCriteria & { level: number }> = []
    items.forEach(item => {
      result.push({ ...item, level })
      if (item.children && item.children.length > 0) {
        result.push(...getAllCriteria(item.children, level + 1))
      }
    })
    return result
  }

  const flatCriteria = getAllCriteria(criteria)

  const handleAddCriteria = (parentId?: string) => {
    const newId = `criteria-${Date.now()}`
    const newCriteria: ScorecardCriteria = {
      id: newId,
      name: '',
      description: '',
      order: parentId
        ? (criteria.find(c => c.id === parentId)?.children?.length || 0) + 1
        : criteria.length + 1,
      parentId,
    }

    if (parentId) {
      setCriteria(prev => prev.map(item => {
        if (item.id === parentId) {
          return { ...item, children: [...(item.children || []), newCriteria] }
        }
        return item
      }))
    } else {
      setCriteria(prev => [...prev, newCriteria])
    }

    setSelectedCriteriaId(newId)
  }

  const handleDeleteCriteria = (id: string, parentId?: string) => {
    const criteriaToDelete = flatCriteria.find(c => c.id === id)
    if (criteriaToDelete && criteriaToDelete.name) {
      const protectedList = protectedSheets.split(',').map(s => s.trim()).filter(s => s.length > 0)
      if (protectedList.includes(criteriaToDelete.name)) {
        toast.showError('Защищённый критерий', `Критерий "${criteriaToDelete.name}" защищен от удаления.`)
        return
      }
    }

    toast.showWarning('Удалить критерий?', 'Вы уверены, что хотите удалить этот критерий?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            if (parentId) {
              setCriteria(prev => prev.map(item => {
                if (item.id === parentId) {
                  return { ...item, children: item.children?.filter(c => c.id !== id) || [] }
                }
                return item
              }))
            } else {
              setCriteria(prev => prev.filter(item => item.id !== id))
            }
            setSelectedCriteriaId(prev => prev === id ? null : prev)
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleUpdateCriteria = (id: string, field: 'name' | 'description', value: string, parentId?: string) => {
    if (parentId) {
      setCriteria(prev => prev.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: item.children?.map(c => (c.id === id ? { ...c, [field]: value } : c)) || [],
          }
        }
        return item
      }))
    } else {
      setCriteria(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)))
    }
  }

  const handleInsertPattern = (pattern: string) => {
    if (!selectedCriteriaId) {
      alert('Выберите критерий для вставки паттерна')
      return
    }
    const selectedCriteria = flatCriteria.find(c => c.id === selectedCriteriaId)
    if (selectedCriteria) {
      const currentDescription = selectedCriteria.description || ''
      const newDescription = currentDescription + (currentDescription ? ' ' : '') + pattern
      handleUpdateCriteria(selectedCriteriaId, 'description', newDescription, selectedCriteria.parentId)
    }
  }

  const generatePreview = () => {
    const targetCriteria = selectedCriteriaId
      ? flatCriteria.find(c => c.id === selectedCriteriaId)
      : criteria[0]

    if (!targetCriteria || !targetCriteria.description) {
      setPreviewText('Выберите критерий и заполните описание для предпросмотра')
      return
    }

    let preview = targetCriteria.description
      .replace(/\[candidate_firstname\]/g, 'Иван')
      .replace(/\[candidate_lastname\]/g, 'Иванов')
      .replace(/\[candidate_patronymic\]/g, 'Иванович')
      .replace(/\[candidate_id\]/g, '12345')
      .replace(/\[vacancy_title\]/g, 'Frontend Engineer (React)')
      .replace(/\[vacancy_id\]/g, '456')
      .replace(/\[grade\]/g, 'Senior')
      .replace(/\[date_day\]/g, '15')
      .replace(/\[date_full\]/g, '15.09.2025')
      .replace(/\[month_num\]/g, '09')
      .replace(/\[month_short_ru\]/g, 'сен')
      .replace(/\[month_full_ru\]/g, 'сентябрь')
      .replace(/\[weekday_short_ru\]/g, 'ПН')
      .replace(/\[interviewer_name\]/g, 'Алексей Петров')
      .replace(/\[text\]/g, 'текст')

    setPreviewText(preview)
  }

  useEffect(() => {
    if (selectedCriteriaId) generatePreview()
  }, [selectedCriteriaId, criteria])

  const patternsByCategory = AVAILABLE_PATTERNS.reduce((acc, pattern) => {
    if (!acc[pattern.category]) acc[pattern.category] = []
    acc[pattern.category].push(pattern)
    return acc
  }, {} as Record<string, Pattern[]>)

  return (
    <Flex direction="column" gap="4">
      <Card className={styles.card}>
        <Flex justify="between" align="start" mb="3">
          <Box style={{ flex: 1 }}>
            <Text size="4" weight="bold" mb="2" style={{ display: 'block' }}>Предварительный просмотр:</Text>
            <Box
              p="3"
              style={{
                border: '1px solid var(--gray-a6)',
                borderRadius: '6px',
                background: 'var(--gray-2)',
                minHeight: '60px',
              }}
            >
              <Text size="3" style={{ whiteSpace: 'pre-wrap' }}>
                {previewText || 'Выберите критерий и нажмите "Обновить предпросмотр"'}
              </Text>
            </Box>
          </Box>
          <Flex gap="2" ml="4">
            <Button variant="soft" size="2" onClick={generatePreview}>
              <InfoCircledIcon width={16} height={16} />
              Обновить предпросмотр
            </Button>
            <Button variant="soft" size="2" onClick={() => setIsExampleModalOpen(true)}>
              <ListBulletIcon width={16} height={16} />
              Пример
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Flex gap="4" align="start">
        <Card className={styles.card} style={{ flex: 1 }}>
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>Критерии оценки:</Text>
          <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
            Создайте иерархию критериев. Нажмите на паттерн, чтобы добавить его в описание.
          </Text>

          <Flex direction="column" gap="3">
            {flatCriteria.map((item) => (
              <Box
                key={item.id}
                className={styles.criteriaItem}
                style={{
                  paddingLeft: `${item.level * 16}px`,
                  border: selectedCriteriaId === item.id ? '2px solid var(--accent-9)' : '1px solid var(--gray-a6)',
                  borderRadius: '6px',
                  background: 'var(--color-panel)',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedCriteriaId(item.id)}
              >
                <Flex align="center" justify="between" style={{ background: 'var(--gray-4)', borderBottom: '1px solid var(--gray-a6)', minHeight: '32px', padding: '8px' }}>
                  <Text size="2" weight="medium" style={{ flex: 1 }}>{item.name || 'Новый критерий'}</Text>
                  <Button
                    variant="ghost"
                    size="1"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCriteria(item.id, item.parentId)
                    }}
                  >
                    <TrashIcon width={14} height={14} />
                  </Button>
                </Flex>
                <Box style={{ padding: '8px' }}>
                  <TextField.Root
                    value={item.description || ''}
                    onChange={(e) => handleUpdateCriteria(item.id, 'description', e.target.value, item.parentId)}
                    placeholder="Введите паттерны через пробел"
                    size={item.level > 0 ? '1' : '2'}
                    onFocus={() => setSelectedCriteriaId(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>
              </Box>
            ))}

            <Button variant="soft" size="2" onClick={() => handleAddCriteria()} style={{ marginTop: '8px' }}>
              <PlusIcon width={16} height={16} />
              Добавить критерий
            </Button>
          </Flex>
        </Card>

        <Card className={styles.card} style={{ width: '400px', flexShrink: 0 }}>
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>Доступные паттерны:</Text>
          <Flex direction="column" gap="4">
            {Object.entries(patternsByCategory).map(([category, patterns]) => (
              <Box key={category}>
                <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>{category}</Text>
                <Flex wrap="wrap" gap="2">
                  {patterns.map(pattern => (
                    <Button
                      key={pattern.id}
                      variant="soft"
                      size="1"
                      onClick={() => handleInsertPattern(pattern.value)}
                      title={pattern.value}
                      style={{ fontSize: '11px' }}
                    >
                      {pattern.label}
                    </Button>
                  ))}
                </Flex>
              </Box>
            ))}
          </Flex>
        </Card>
      </Flex>

      <Dialog.Root open={isExampleModalOpen} onOpenChange={setIsExampleModalOpen}>
        <Dialog.Content style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
          <Dialog.Title>Пример структуры критериев Scorecard</Dialog.Title>
          <Box p="4">
            <Callout.Root mb="4" color="blue">
              <Callout.Icon><InfoCircledIcon width={16} height={16} /></Callout.Icon>
              <Callout.Text size="2">
                Это пример реальной структуры критериев Scorecard. Ваши текущие данные не изменятся.
              </Callout.Text>
            </Callout.Root>
            <Flex justify="end" gap="2" pt="3" style={{ borderTop: '1px solid var(--gray-a6)' }}>
              <Button variant="soft" onClick={() => setIsExampleModalOpen(false)}>Закрыть</Button>
            </Flex>
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      <Card className={styles.card} style={{ width: '100%' }}>
        <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>Защищенные листы (нельзя удалять):</Text>
        <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>
          Укажите через запятую названия критериев, которые нельзя удалять
        </Text>
        <TextField.Root
          value={protectedSheets}
          onChange={(e) => setProtectedSheets(e.target.value)}
          placeholder="Например: Технические навыки, Коммуникативные навыки"
          size="2"
          style={{ width: '100%' }}
        />
      </Card>
    </Flex>
  )
}
