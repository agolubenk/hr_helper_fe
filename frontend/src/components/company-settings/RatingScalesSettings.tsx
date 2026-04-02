'use client'

import { Flex, Text, Button, Card, TextField, Dialog } from '@radix-ui/themes'
import { useState } from 'react'
import { PlusIcon, Pencil2Icon, TrashIcon, Cross2Icon, CheckIcon } from '@radix-ui/react-icons'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './GradesSettings.module.css'
import type { RatingScale, RatingScaleOption } from '@/lib/ratingScale'
import { DEFAULT_RATING_SCALES } from '@/lib/ratingScale'

export default function RatingScalesSettings() {
  const toast = useToast()
  const [scales, setScales] = useState<RatingScale[]>(DEFAULT_RATING_SCALES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formName, setFormName] = useState('')
  const [formOptions, setFormOptions] = useState<RatingScaleOption[]>([])

  const setDefault = (id: string) => {
    setScales((prev) =>
      prev.map((s) => ({ ...s, isDefault: s.id === id }))
    )
  }

  const handleEdit = (scale: RatingScale) => {
    setEditingId(scale.id)
    setIsCreating(false)
    setFormName(scale.name)
    setFormOptions([...scale.options].sort((a, b) => a.order - b.order))
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingId(null)
    setFormName('')
    setFormOptions([{ value: '1', label: '1', order: 1 }])
  }

  const addOption = () => {
    const nextOrder = formOptions.length + 1
    setFormOptions((prev) => [...prev, { value: String(nextOrder), label: String(nextOrder), order: nextOrder }])
  }

  const updateOption = (index: number, field: 'value' | 'label', val: string) => {
    setFormOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [field]: val } : o))
    )
  }

  const removeOption = (index: number) => {
    if (formOptions.length <= 1) return
    setFormOptions((prev) => prev.filter((_, i) => i !== index).map((o, i) => ({ ...o, order: i + 1 })))
  }

  const handleSave = () => {
    const options = formOptions.filter((o) => o.value.trim() && o.label.trim())
    if (!formName.trim()) {
      toast.showError('Ошибка', 'Введите название шкалы')
      return
    }
    if (options.length === 0) {
      toast.showError('Ошибка', 'Добавьте хотя бы один пункт шкалы')
      return
    }
    if (isCreating) {
      const newScale: RatingScale = {
        id: `scale-${Date.now()}`,
        name: formName.trim(),
        isDefault: scales.length === 0,
        options: options.map((o, i) => ({ ...o, order: i + 1 })),
      }
      setScales((prev) => [...prev, newScale])
      setIsCreating(false)
    } else if (editingId) {
      setScales((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, name: formName.trim(), options: options.map((o, i) => ({ ...o, order: i + 1 })) }
            : s
        )
      )
      setEditingId(null)
    }
  }

  const handleDelete = (id: string) => {
    const scale = scales.find((s) => s.id === id)
    if (!scale) return
    toast.showWarning('Удалить шкалу?', `Шкала «${scale.name}» будет удалена.`, {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            setScales((prev) => {
              const next = prev.filter((s) => s.id !== id)
              if (scale.isDefault && next.length > 0 && !next.some((s) => s.isDefault)) {
                next[0].isDefault = true
              }
              return next
            })
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const open = isCreating || !!editingId

  return (
    <Flex direction="column" gap="4">
      <Card className={styles.card}>
        <Flex justify="between" align="center" mb="4">
          <Text size="4" weight="bold">
            Шкалы оценок
          </Text>
          <Button size="1" onClick={handleCreate}>
            <PlusIcon width={14} height={14} />
            Добавить шкалу
          </Button>
        </Flex>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Шкала по умолчанию используется при создании оценки кандидата (баллы по компетенциям).
        </Text>
        <Flex direction="column" gap="2">
          {scales.map((scale) => (
            <Flex
              key={scale.id}
              align="center"
              justify="between"
              gap="3"
              p="3"
              className={styles.ratingScaleRow}
              style={{ border: '1px solid var(--gray-a6)', borderRadius: 8 }}
            >
              <Flex align="center" gap="2" wrap="wrap" style={{ minWidth: 0 }}>
                <Text size="2" weight="medium">
                  {scale.name}
                </Text>
                {scale.isDefault && (
                  <Text size="1" color="gray">
                    (по умолчанию)
                  </Text>
                )}
              </Flex>
              <Flex gap="2" align="center" wrap="nowrap" className={styles.ratingScaleActions}>
                {!scale.isDefault && (
                  <Button size="1" variant="soft" onClick={() => setDefault(scale.id)}>
                    Сделать по умолчанию
                  </Button>
                )}
                <Button size="1" variant="ghost" onClick={() => handleEdit(scale)}>
                  <Pencil2Icon width={14} height={14} />
                </Button>
                <Button size="1" variant="ghost" color="red" onClick={() => handleDelete(scale.id)}>
                  <TrashIcon width={14} height={14} />
                </Button>
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Card>

      <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { setIsCreating(false); setEditingId(null) } }}>
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>{isCreating ? 'Новая шкала' : 'Редактирование шкалы'}</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Flex gap="2" align="center">
              <Text size="2" style={{ minWidth: 100 }}>Название</Text>
              <TextField.Root
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Например: 1–5 баллов"
                style={{ flex: 1 }}
              />
            </Flex>
            <Text size="2" weight="medium">Пункты шкалы (значение и подпись)</Text>
            {formOptions.map((opt, idx) => (
              <Flex key={idx} gap="2" align="center">
                <TextField.Root
                  value={opt.value}
                  onChange={(e) => updateOption(idx, 'value', e.target.value)}
                  placeholder="Значение"
                  style={{ width: 100 }}
                />
                <TextField.Root
                  value={opt.label}
                  onChange={(e) => updateOption(idx, 'label', e.target.value)}
                  placeholder="Подпись"
                  style={{ flex: 1 }}
                />
                <Button size="1" variant="ghost" color="red" onClick={() => removeOption(idx)} disabled={formOptions.length <= 1}>
                  <Cross2Icon width={14} height={14} />
                </Button>
              </Flex>
            ))}
            <Button size="1" variant="soft" onClick={addOption}>
              <PlusIcon width={14} height={14} />
              Добавить пункт
            </Button>
          </Flex>
          <Flex gap="2" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft">Отмена</Button>
            </Dialog.Close>
            <Button onClick={handleSave}>
              <CheckIcon width={14} height={14} />
              {isCreating ? 'Создать' : 'Сохранить'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}
