/**
 * SpecializationCareerPage (specializations/[id]/career/page.tsx) — Карьерная лестница специализации
 *
 * Назначение: управление переходами между грейдами (требования, рекомендации, типичная длительность).
 * Данные: MOCK_TRANSITIONS; связь с useSpecializations (selectedNode).
 */

'use client'

import { useState } from 'react'
import { Box, Flex, Text, Button, Table, Dialog, TextArea, TextField, Select } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'
import { useSpecializations } from '../../context/SpecializationsContext'
import type { CareerTransition } from '../../types'
import styles from '../../specializations.module.css'

const MOCK_TRANSITIONS: CareerTransition[] = [
  {
    id: '1',
    fromGradeLevelId: 'junior',
    toGradeLevelId: 'middle',
    requirements: ['2+ года в Middle', 'Completion компетенций ≥ 85%', 'Ментор минимум 2 Junior'],
    recommendations: ['Курсы: System Design, React Perf', 'Проекты: Alpha, Gamma'],
    typicalDurationMonths: 18,
  },
  {
    id: '2',
    fromGradeLevelId: 'middle',
    toGradeLevelId: 'senior',
    requirements: ['Ownership 1+ критической системы', 'Менторство стабильно'],
    recommendations: ['Архитектурные курсы'],
    typicalDurationMonths: 24,
  },
]

export default function SpecializationCareerPage() {
  const { selectedNode, gradingBySpecId } = useSpecializations()
  const [transitions, setTransitions] = useState<CareerTransition[]>(MOCK_TRANSITIONS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    fromGradeLevelId: 'junior',
    toGradeLevelId: 'middle',
    requirements: '',
    recommendations: '',
    typicalDurationMonths: 18,
  })

  const config = selectedNode ? gradingBySpecId[selectedNode.id] : null
  const levels = config?.levels ?? []

  const getLevelName = (id: string) => levels.find((l) => l.id === id)?.name ?? id

  if (!selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Выберите специализацию в левой панели.</Text>
      </Box>
    )
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({
      fromGradeLevelId: levels[0]?.id ?? '',
      toGradeLevelId: levels[1]?.id ?? '',
      requirements: '',
      recommendations: '',
      typicalDurationMonths: 18,
    })
    setModalOpen(true)
  }

  const handleSaveTransition = () => {
    const reqList = form.requirements.split('\n').filter(Boolean)
    const recList = form.recommendations.split('\n').filter(Boolean)
    if (editingId) {
      setTransitions((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                fromGradeLevelId: form.fromGradeLevelId,
                toGradeLevelId: form.toGradeLevelId,
                requirements: reqList,
                recommendations: recList,
                typicalDurationMonths: form.typicalDurationMonths,
              }
            : t
        )
      )
    } else {
      setTransitions((prev) => [
        ...prev,
        {
          id: `t-${Date.now()}`,
          fromGradeLevelId: form.fromGradeLevelId,
          toGradeLevelId: form.toGradeLevelId,
          requirements: reqList,
          recommendations: recList,
          typicalDurationMonths: form.typicalDurationMonths,
        },
      ])
    }
    setModalOpen(false)
  }

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="2" weight="bold">Карьерные переходы</Text>
        <Button variant="soft" size="2" onClick={openCreate}>
          <PlusIcon width={16} height={16} />
          Добавить переход
        </Button>
      </Flex>

      <Text size="2" color="gray" mb="4">
        Настройка требований и рекомендаций для перехода между уровнями. Клик по строке откроет редактирование.
      </Text>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>От уровня</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>К уровню</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Срок (мес.)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Требований</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {transitions.map((t) => (
            <Table.Row
              key={t.id}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setEditingId(t.id)
                setForm({
                  fromGradeLevelId: t.fromGradeLevelId,
                  toGradeLevelId: t.toGradeLevelId,
                  requirements: t.requirements.join('\n'),
                  recommendations: t.recommendations.join('\n'),
                  typicalDurationMonths: t.typicalDurationMonths ?? 0,
                })
                setModalOpen(true)
              }}
            >
              <Table.Cell>{getLevelName(t.fromGradeLevelId)}</Table.Cell>
              <Table.Cell>{getLevelName(t.toGradeLevelId)}</Table.Cell>
              <Table.Cell>{t.typicalDurationMonths ?? '—'}</Table.Cell>
              <Table.Cell>{t.requirements.length}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>
            {editingId ? 'Редактировать переход' : 'Новый переход'}
          </Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Text size="2">От уровня → К уровню</Text>
            <Flex gap="2">
              <Select.Root
                value={form.fromGradeLevelId}
                onValueChange={(v) => setForm((p) => ({ ...p, fromGradeLevelId: v }))}
              >
                <Select.Trigger style={{ flex: 1 }} />
                <Select.Content>
                  {levels.map((l) => (
                    <Select.Item key={l.id} value={l.id}>{l.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Select.Root
                value={form.toGradeLevelId}
                onValueChange={(v) => setForm((p) => ({ ...p, toGradeLevelId: v }))}
              >
                <Select.Trigger style={{ flex: 1 }} />
                <Select.Content>
                  {levels.map((l) => (
                    <Select.Item key={l.id} value={l.id}>{l.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
            <Text size="2">Требования (каждый с новой строки)</Text>
            <TextArea
              value={form.requirements}
              onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
              rows={3}
              placeholder="Один пункт на строку"
            />
            <Text size="2">Рекомендации</Text>
            <TextArea
              value={form.recommendations}
              onChange={(e) => setForm((p) => ({ ...p, recommendations: e.target.value }))}
              rows={2}
            />
            <TextField.Root
              type="number"
              placeholder="Средний срок (месяцев)"
              value={form.typicalDurationMonths || ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, typicalDurationMonths: Number(e.target.value) || 0 }))
              }
            />
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveTransition}>Сохранить</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
