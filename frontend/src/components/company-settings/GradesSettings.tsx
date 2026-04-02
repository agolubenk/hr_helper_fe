'use client'

import {
  Box,
  Flex,
  Text,
  Button,
  Card,
  Table,
  TextField,
  Dialog,
  IconButton,
} from '@radix-ui/themes'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import {
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Pencil2Icon,
  TrashIcon,
  Cross2Icon,
  CheckIcon,
  HandIcon,
  ColumnsIcon,
} from '@radix-ui/react-icons'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToast } from '@/components/Toast/ToastContext'
import GradeForm from './GradeForm'
import styles from './GradesSettings.module.css'

interface AdditionalField {
  id: string
  name: string
}

interface Grade {
  id: number
  order: number
  name: string
  category?: string
  level?: string
  comment?: string
  additionalFields?: { [fieldId: string]: string }
}

function defaultMiddleColumnOrder(fields: AdditionalField[]): string[] {
  return ['category', 'level', 'comment', ...fields.map((f) => f.id)]
}

function middleColumnLabel(colKey: string, additionalFields: AdditionalField[]): string {
  switch (colKey) {
    case 'category':
      return 'Категория'
    case 'level':
      return 'Уровень'
    case 'comment':
      return 'Комментарий'
    default:
      return additionalFields.find((f) => f.id === colKey)?.name ?? colKey
  }
}

function renderMiddleHeaderCell(
  colKey: string,
  additionalFields: AdditionalField[],
  onDeleteField: (fieldId: string) => void,
): ReactNode {
  switch (colKey) {
    case 'category':
      return <Table.ColumnHeaderCell key={colKey}>Категория</Table.ColumnHeaderCell>
    case 'level':
      return <Table.ColumnHeaderCell key={colKey}>Уровень</Table.ColumnHeaderCell>
    case 'comment':
      return <Table.ColumnHeaderCell key={colKey}>Комментарий</Table.ColumnHeaderCell>
    default: {
      const field = additionalFields.find((f) => f.id === colKey)
      if (!field) {
        return null
      }
      return (
        <Table.ColumnHeaderCell key={colKey}>
          <Flex align="center" gap="2" justify="between">
            <Text size="2">{field.name}</Text>
            <Button
              variant="ghost"
              size="1"
              color="red"
              onClick={() => onDeleteField(field.id)}
              title="Удалить поле"
            >
              <TrashIcon width={12} height={12} />
            </Button>
          </Flex>
        </Table.ColumnHeaderCell>
      )
    }
  }
}

function renderMiddleBodyCell(grade: Grade, colKey: string): ReactNode {
  switch (colKey) {
    case 'category':
      return (
        <Text size="2" color="gray">
          {grade.category || '-'}
        </Text>
      )
    case 'level':
      return (
        <Text size="2" color="gray">
          {grade.level || '-'}
        </Text>
      )
    case 'comment':
      return (
        <Text size="2" color="gray">
          {grade.comment || '-'}
        </Text>
      )
    default:
      return (
        <Text size="2" color="gray">
          {grade.additionalFields?.[colKey] || '-'}
        </Text>
      )
  }
}

// Моковые данные
const mockGrades: Grade[] = [
  {
    id: 1,
    order: 1,
    name: 'Junior',
    category: 'Разработка',
    level: 'L1',
    comment: 'Начальный уровень',
    additionalFields: {
      field1: 'Джуниор',
      field2: 'Junior Developer',
    },
  },
  {
    id: 2,
    order: 2,
    name: 'Middle',
    category: 'Разработка',
    level: 'L2',
    comment: 'Средний уровень',
    additionalFields: {
      field1: 'Мидл',
      field2: 'Middle Developer',
    },
  },
  {
    id: 3,
    order: 3,
    name: 'Senior',
    category: 'Разработка',
    level: 'L3',
    comment: 'Высокий уровень',
    additionalFields: {
      field1: 'Сеньор',
      field2: 'Senior Developer',
    },
  },
]

const mockAdditionalFields: AdditionalField[] = [
  { id: 'field1', name: 'Альтернативное название' },
  { id: 'field2', name: 'Связь с системой' },
]

interface SortableColumnOrderRowProps {
  id: string
  label: string
}

function SortableColumnOrderRow({ id, label }: SortableColumnOrderRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const rowStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <Flex
      ref={setNodeRef}
      style={rowStyle}
      align="center"
      gap="2"
      className={`${styles.columnOrderRow} ${isDragging ? styles.columnOrderRowDragging : ''}`}
    >
      <IconButton
        type="button"
        variant="ghost"
        size="1"
        className={styles.dragHandle}
        aria-label={`Перетащить столбец «${label}»`}
        {...attributes}
        {...listeners}
      >
        <HandIcon width={14} height={14} />
      </IconButton>
      <Text size="2">{label}</Text>
    </Flex>
  )
}

interface SortableGradeSettingsRowProps {
  grade: Grade
  index: number
  total: number
  columnOrder: string[]
  onMoveUp: (id: number) => void
  onMoveDown: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

function SortableGradeSettingsRow({
  grade,
  index,
  total,
  columnOrder,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: SortableGradeSettingsRowProps) {
  const id = String(grade.id)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const rowStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Table.Row
      ref={setNodeRef}
      style={rowStyle}
      className={isDragging ? styles.rowDragging : undefined}
    >
      <Table.Cell className={styles.orderValueCell}>
        <Flex gap="1" align="center" className={styles.orderCell}>
          <IconButton
            type="button"
            variant="ghost"
            size="1"
            className={styles.dragHandle}
            aria-label="Перетащить строку для изменения порядка грейдов"
            {...attributes}
            {...listeners}
          >
            <HandIcon width={14} height={14} />
          </IconButton>
          <Text size="2" weight="medium">
            {grade.order}
          </Text>
          <Flex gap="1" align="center">
            <IconButton
              type="button"
              variant="ghost"
              size="1"
              onClick={() => onMoveUp(grade.id)}
              disabled={index === 0}
              title="Поднять в списке"
              aria-label="Поднять грейд в списке"
              className={styles.orderButton}
            >
              <ChevronUpIcon width={14} height={14} />
            </IconButton>
            <IconButton
              type="button"
              variant="ghost"
              size="1"
              onClick={() => onMoveDown(grade.id)}
              disabled={index === total - 1}
              title="Опустить в списке"
              aria-label="Опустить грейд в списке"
              className={styles.orderButton}
            >
              <ChevronDownIcon width={14} height={14} />
            </IconButton>
          </Flex>
        </Flex>
      </Table.Cell>
      <Table.Cell>
        <Text size="2" weight="medium">
          {grade.name}
        </Text>
      </Table.Cell>
      {columnOrder.map((colKey) => (
        <Table.Cell key={colKey}>{renderMiddleBodyCell(grade, colKey)}</Table.Cell>
      ))}
      <Table.Cell>
        <Flex gap="1">
          <Button
            variant="ghost"
            size="1"
            onClick={() => onEdit(grade.id)}
            title="Редактировать"
            className={styles.actionButton}
          >
            <Pencil2Icon width={14} height={14} />
          </Button>
          <Button
            variant="ghost"
            size="1"
            color="red"
            onClick={() => onDelete(grade.id)}
            title="Удалить"
            className={styles.actionButton}
          >
            <TrashIcon width={14} height={14} />
          </Button>
        </Flex>
      </Table.Cell>
    </Table.Row>
  )
}

export default function GradesSettings() {
  const toast = useToast()
  const [grades, setGrades] = useState<Grade[]>(mockGrades)
  const [additionalFields, setAdditionalFields] = useState<AdditionalField[]>(mockAdditionalFields)
  const [columnOrder, setColumnOrder] = useState<string[]>(() => defaultMiddleColumnOrder(mockAdditionalFields))
  const [columnOrderModalOpen, setColumnOrderModalOpen] = useState(false)
  const [columnOrderDraft, setColumnOrderDraft] = useState<string[]>(() =>
    defaultMiddleColumnOrder(mockAdditionalFields),
  )
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isAddingField, setIsAddingField] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const gradesSorted = useMemo(
    () => [...grades].sort((a, b) => a.order - b.order),
    [grades],
  )

  const gradeRowIds = useMemo(() => gradesSorted.map((g) => String(g.id)), [gradesSorted])

  const handleMoveUp = (id: number) => {
    setGrades((prev) => {
      const index = prev.findIndex((g) => g.id === id)
      if (index <= 0) return prev

      const newGrades = [...prev]
      const temp = newGrades[index]
      newGrades[index] = newGrades[index - 1]
      newGrades[index - 1] = temp

      return newGrades.map((g, i) => ({ ...g, order: i + 1 }))
    })
  }

  const handleMoveDown = (id: number) => {
    setGrades((prev) => {
      const index = prev.findIndex((g) => g.id === id)
      if (index >= prev.length - 1) return prev

      const newGrades = [...prev]
      const temp = newGrades[index]
      newGrades[index] = newGrades[index + 1]
      newGrades[index + 1] = temp

      return newGrades.map((g, i) => ({ ...g, order: i + 1 }))
    })
  }

  const handleGradeDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setGrades((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const oldIndex = sorted.findIndex((g) => String(g.id) === String(active.id))
      const newIndex = sorted.findIndex((g) => String(g.id) === String(over.id))
      if (oldIndex < 0 || newIndex < 0) return prev
      const moved = arrayMove(sorted, oldIndex, newIndex)
      return moved.map((g, i) => ({ ...g, order: i + 1 }))
    })
  }

  const handleColumnDraftDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setColumnOrderDraft((prev) => {
      const oldIndex = prev.indexOf(String(active.id))
      const newIndex = prev.indexOf(String(over.id))
      if (oldIndex < 0 || newIndex < 0) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingGradeId(null)
  }

  const handleEdit = (id: number) => {
    setEditingGradeId(id)
    setIsCreating(false)
  }

  const handleSave = (gradeData: Partial<Grade>) => {
    if (isCreating) {
      const newAdditionalFields: { [key: string]: string } = {}
      additionalFields.forEach((field) => {
        newAdditionalFields[field.id] = gradeData.additionalFields?.[field.id] || ''
      })

      const newGrade: Grade = {
        id: Date.now(),
        order: grades.length + 1,
        name: gradeData.name || '',
        category: gradeData.category,
        level: gradeData.level,
        comment: gradeData.comment,
        additionalFields: newAdditionalFields,
      }
      setGrades((prev) => [...prev, newGrade])
      setIsCreating(false)
    } else if (editingGradeId) {
      setGrades((prev) =>
        prev.map((g) => {
          if (g.id === editingGradeId) {
            return {
              ...g,
              name: gradeData.name || g.name,
              category: gradeData.category,
              level: gradeData.level,
              comment: gradeData.comment,
              additionalFields: {
                ...g.additionalFields,
                ...gradeData.additionalFields,
              },
            }
          }
          return g
        }),
      )
      setEditingGradeId(null)
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingGradeId(null)
  }

  const handleDelete = (id: number) => {
    toast.showWarning('Удалить грейд?', 'Вы уверены, что хотите удалить этот грейд?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () =>
            setGrades((prev) => {
              const filtered = prev.filter((g) => g.id !== id)
              return filtered.map((g, i) => ({ ...g, order: i + 1 }))
            }),
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleAddAdditionalField = () => {
    if (!newFieldName.trim()) {
      alert('Введите название поля')
      return
    }

    const fieldId = `field_${Date.now()}`
    const newField: AdditionalField = {
      id: fieldId,
      name: newFieldName.trim(),
    }

    setGrades((prev) =>
      prev.map((grade) => ({
        ...grade,
        additionalFields: {
          ...grade.additionalFields,
          [fieldId]: '',
        },
      })),
    )

    setAdditionalFields((prev) => [...prev, newField])
    setColumnOrder((prev) => [...prev, fieldId])
    setNewFieldName('')
    setIsAddingField(false)
  }

  const handleDeleteAdditionalField = (fieldId: string) => {
    toast.showWarning(
      'Удалить поле?',
      'Вы уверены, что хотите удалить это дополнительное поле? Оно будет удалено для всех грейдов.',
      {
        actions: [
          { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
          {
            label: 'Удалить',
            onClick: () => {
              setGrades((prev) =>
                prev.map((grade) => {
                  const { [fieldId]: _removed, ...rest } = grade.additionalFields || {}
                  return { ...grade, additionalFields: rest }
                }),
              )
              setAdditionalFields((prev) => prev.filter((f) => f.id !== fieldId))
              setColumnOrder((prev) => prev.filter((k) => k !== fieldId))
            },
            variant: 'solid',
            color: 'red',
          },
        ],
      },
    )
  }

  const openColumnOrderModal = () => {
    setColumnOrderDraft(columnOrder)
    setColumnOrderModalOpen(true)
  }

  const saveColumnOrderFromModal = () => {
    setColumnOrder(columnOrderDraft)
    setColumnOrderModalOpen(false)
  }

  const cancelColumnOrderModal = () => {
    setColumnOrderDraft(columnOrder)
    setColumnOrderModalOpen(false)
  }

  const currentGrade = editingGradeId ? grades.find((g) => g.id === editingGradeId) : null

  return (
    <Flex direction="column" gap="4">
        <Card className={styles.card}>
          <Flex justify="between" align="center" mb="4">
            <Text size="4" weight="bold">
              Грейды компании
            </Text>
            <Flex gap="2">
              {!isCreating && !editingGradeId && (
                <>
                  <Button variant="soft" size="2" type="button" onClick={openColumnOrderModal}>
                    <ColumnsIcon width={16} height={16} />
                    Порядок столбцов
                  </Button>
                  <Button variant="soft" size="2" type="button" onClick={() => setIsAddingField(true)}>
                    <PlusIcon width={16} height={16} />
                    Добавить поле
                  </Button>
                  <Button size="2" type="button" onClick={handleCreate}>
                    <PlusIcon width={16} height={16} />
                    Создать грейд
                  </Button>
                </>
              )}
            </Flex>
          </Flex>

          {grades.length > 0 ? (
            <Box style={{ overflowX: 'auto' }}>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell style={{ width: '96px' }} className={styles.orderHeaderCell}>
                      Порядок
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                    {columnOrder.map((colKey) =>
                      renderMiddleHeaderCell(colKey, additionalFields, handleDeleteAdditionalField),
                    )}
                    <Table.ColumnHeaderCell style={{ width: '150px' }}>Действия</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleGradeDragEnd}
                >
                  <SortableContext items={gradeRowIds} strategy={verticalListSortingStrategy}>
                    <Table.Body>
                      {gradesSorted.map((grade, index) => (
                        <SortableGradeSettingsRow
                          key={grade.id}
                          grade={grade}
                          index={index}
                          total={gradesSorted.length}
                          columnOrder={columnOrder}
                          onMoveUp={handleMoveUp}
                          onMoveDown={handleMoveDown}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </Table.Body>
                  </SortableContext>
                </DndContext>
              </Table.Root>
            </Box>
          ) : (
            <Box
              p="4"
              style={{
                textAlign: 'center',
                border: '1px solid var(--gray-a6)',
                borderRadius: '8px',
                background: 'var(--gray-2)',
              }}
            >
              <Text size="3" color="gray">
                Нет грейдов. Создайте первый грейд.
              </Text>
            </Box>
          )}
        </Card>

        <Dialog.Root
          open={columnOrderModalOpen}
          onOpenChange={(open) => {
            setColumnOrderModalOpen(open)
            if (open) {
              setColumnOrderDraft(columnOrder)
            }
          }}
        >
          <Dialog.Content style={{ maxWidth: '420px' }}>
            <Dialog.Title>Порядок столбцов</Dialog.Title>
            <Text size="2" color="gray" style={{ display: 'block', marginTop: 8 }}>
              Столбцы «Порядок», «Название» и «Действия» всегда на своих местах. Перетащите остальные в
              нужной последовательности.
            </Text>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleColumnDraftDragEnd}
            >
              <SortableContext items={columnOrderDraft} strategy={verticalListSortingStrategy}>
                <div className={styles.columnOrderList}>
                  {columnOrderDraft.map((key) => (
                    <SortableColumnOrderRow
                      key={key}
                      id={key}
                      label={middleColumnLabel(key, additionalFields)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <Flex gap="2" justify="end" mt="4">
              <Button variant="soft" type="button" onClick={cancelColumnOrderModal}>
                <Cross2Icon width={16} height={16} />
                Отмена
              </Button>
              <Button type="button" onClick={saveColumnOrderFromModal}>
                <CheckIcon width={16} height={16} />
                Сохранить
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        <Dialog.Root
          open={isCreating || editingGradeId !== null}
          onOpenChange={(open) => {
            if (!open) {
              handleCancel()
            }
          }}
        >
          <Dialog.Content style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <Dialog.Title>
              {isCreating ? 'Создание грейда' : 'Редактирование грейда'}
            </Dialog.Title>
            <Box p="4">
              <GradeForm
                initialData={currentGrade}
                additionalFields={additionalFields}
                columnOrder={columnOrder}
                onSave={(data) => {
                  handleSave(data)
                }}
                onCancel={handleCancel}
                isCreating={isCreating}
              />
            </Box>
          </Dialog.Content>
        </Dialog.Root>

        <Dialog.Root open={isAddingField} onOpenChange={setIsAddingField}>
          <Dialog.Content style={{ maxWidth: '400px' }}>
            <Dialog.Title>Добавить дополнительное поле</Dialog.Title>
            <Box p="4">
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Название поля
              </Text>
              <TextField.Root
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Введите название поля (например, Альтернативное название)"
                style={{ width: '100%' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddAdditionalField()
                  }
                }}
              />
              <Flex gap="2" justify="end" mt="4">
                <Button
                  variant="soft"
                  type="button"
                  onClick={() => {
                    setIsAddingField(false)
                    setNewFieldName('')
                  }}
                >
                  <Cross2Icon width={16} height={16} />
                  Отмена
                </Button>
                <Button type="button" onClick={handleAddAdditionalField}>
                  <CheckIcon width={16} height={16} />
                  Добавить
                </Button>
              </Flex>
            </Box>
          </Dialog.Content>
        </Dialog.Root>
    </Flex>
  )
}
