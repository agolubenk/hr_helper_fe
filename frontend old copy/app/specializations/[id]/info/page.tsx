/**
 * SpecializationInfoPage (specializations/[id]/info/page.tsx) — Основная информация о специализации
 *
 * Назначение:
 * - Редактирование основных полей специализации: название, родитель, описание, департамент, проект, приоритет, tech stack
 *
 * Функциональность:
 * - Форма с полями из selectedNode; сохранение через updateNode
 * - Справочники: DEPARTMENTS, PROJECTS, PRIORITY_OPTIONS; родитель — из getFlatNodesForSelect
 *
 * Связи: useSpecializations (selectedNode, updateNode, getFlatNodesForSelect). Данные из initialTree.
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  TextField,
  TextArea,
  Button,
  Select,
  Badge,
} from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useSpecializations } from '../../context/SpecializationsContext'
import { DEPARTMENTS, PROJECTS } from '../../data/initialTree'
import type { SpecializationNode } from '../../types'
import styles from '../../specializations.module.css'

const PRIORITY_OPTIONS = [
  { value: 'required', label: 'Required' },
  { value: 'nice', label: 'Nice-to-have' },
  { value: 'bonus', label: 'Bonus' },
] as const

/** Страница редактирования основной информации выбранной специализации. */
export default function SpecializationInfoPage() {
  const { selectedNode, updateNode, getFlatNodesForSelect } = useSpecializations()
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const parentOptions = useMemo(() => getFlatNodesForSelect(selectedNode?.id), [getFlatNodesForSelect, selectedNode?.id])

  const [form, setForm] = useState({
    name: selectedNode?.name ?? '',
    parentId: selectedNode?.parentId ?? '',
    departmentId: selectedNode?.departmentId ?? '',
    projectIds: selectedNode?.projectIds ?? [],
    description: selectedNode?.description ?? '',
    techStack: selectedNode?.techStack ?? [],
  })

  if (!selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Выберите специализацию в левой панели.</Text>
      </Box>
    )
  }

  const syncFormFromNode = (node: SpecializationNode) => {
    setForm({
      name: node.name,
      parentId: node.parentId ?? '',
      departmentId: node.departmentId ?? '',
      projectIds: node.projectIds ?? [],
      description: node.description ?? '',
      techStack: node.techStack ?? [],
    })
  }

  useEffect(() => {
    if (selectedNode) syncFormFromNode(selectedNode)
  }, [selectedNode?.id])

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Укажите название'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    updateNode(selectedNode.id, {
      name: form.name.trim(),
      parentId: form.parentId || null,
      departmentId: form.departmentId || undefined,
      projectIds: form.projectIds.length ? form.projectIds : undefined,
      description: form.description.trim() || undefined,
      techStack: form.techStack.length ? form.techStack : undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addTech = () => {
    setForm((p) => ({
      ...p,
      techStack: [...p.techStack, { name: '', priority: 'required' }],
    }))
  }

  const removeTech = (index: number) => {
    setForm((p) => ({
      ...p,
      techStack: p.techStack.filter((_, i) => i !== index),
    }))
  }

  const updateTech = (index: number, field: 'name' | 'priority', value: string) => {
    setForm((p) => ({
      ...p,
      techStack: p.techStack.map((s, i) =>
        i === index ? { ...s, [field]: field === 'name' ? value : (value as 'required' | 'nice' | 'bonus') } : s
      ),
    }))
  }

  const toggleProject = (projectId: string) => {
    setForm((p) => ({
      ...p,
      projectIds: p.projectIds.includes(projectId)
        ? p.projectIds.filter((id) => id !== projectId)
        : [...p.projectIds, projectId],
    }))
  }

  return (
    <Box>
      <Box className={styles.tabSection}>
        <Text size="2" weight="bold" className={styles.tabSectionTitle}>
          Название
        </Text>
        <TextField.Root
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Название специализации"
          color={errors.name ? 'red' : undefined}
        />
        {errors.name && (
          <Text size="1" color="red" mt="1">{errors.name}</Text>
        )}
      </Box>

      <Box className={styles.tabSection}>
        <Text size="2" weight="bold" className={styles.tabSectionTitle}>
          Родитель
        </Text>
        <Select.Root
          value={form.parentId || 'root'}
          onValueChange={(v) => setForm((p) => ({ ...p, parentId: v === 'root' ? '' : v }))}
        >
          <Select.Trigger style={{ width: '100%' }} />
          <Select.Content>
            {parentOptions.map((n) => (
              <Select.Item key={n.id || 'root'} value={n.id || 'root'}>
                {'\u00A0'.repeat(n.depth * 2)}{n.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>

      <Box className={styles.tabSection}>
        <Text size="2" weight="bold" className={styles.tabSectionTitle}>
          Отдел
        </Text>
        <Select.Root
          value={form.departmentId}
          onValueChange={(v) => setForm((p) => ({ ...p, departmentId: v }))}
        >
          <Select.Trigger style={{ width: '100%' }} />
          <Select.Content>
            {DEPARTMENTS.map((d) => (
              <Select.Item key={d.id} value={d.id}>
                {d.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>

      <Box className={styles.tabSection}>
        <Text size="2" weight="bold" className={styles.tabSectionTitle}>
          Проекты
        </Text>
        <Flex gap="2" wrap="wrap">
          {PROJECTS.map((pr) => (
            <Badge
              key={pr.id}
              color={form.projectIds.includes(pr.id) ? 'blue' : 'gray'}
              style={{ cursor: 'pointer' }}
              onClick={() => toggleProject(pr.id)}
            >
              {pr.name}
            </Badge>
          ))}
        </Flex>
      </Box>

      <Box className={styles.tabSection}>
        <Text size="2" weight="bold" className={styles.tabSectionTitle}>
          Описание специфики
        </Text>
        <TextArea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Опишите фокус и специфику специализации..."
          rows={4}
        />
      </Box>

      <Box className={styles.tabSection}>
        <Flex justify="between" align="center" mb="2">
          <Text size="2" weight="bold" className={styles.tabSectionTitle}>
            Tech Stack
          </Text>
          <Button variant="soft" size="1" onClick={addTech}>
            + Добавить технологию
          </Button>
        </Flex>
        {form.techStack.map((t, i) => (
          <Flex key={i} align="center" gap="2" mb="2" className={styles.techStackRow}>
            <TextField.Root
              placeholder="Например: React 18"
              value={t.name}
              onChange={(e) => updateTech(i, 'name', e.target.value)}
              style={{ flex: 1 }}
            />
            <Select.Root
              value={t.priority}
              onValueChange={(v) => updateTech(i, 'priority', v)}
            >
              <Select.Trigger className={styles.techStackRowSelect} />
              <Select.Content>
                {PRIORITY_OPTIONS.map((o) => (
                  <Select.Item key={o.value} value={o.value}>
                    {o.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Button variant="ghost" color="red" size="1" onClick={() => removeTech(i)}>
              <Cross2Icon width={14} height={14} />
            </Button>
          </Flex>
        ))}
      </Box>

      <Flex gap="3" mt="4">
        <Button variant="solid" onClick={handleSave}>
          {saved ? 'Сохранено' : 'Сохранить'}
        </Button>
      </Flex>
    </Box>
  )
}
