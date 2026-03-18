/**
 * MatrixPage (specializations/[id]/matrix/page.tsx) — Страница матрицы навыков специализации
 *
 * Назначение:
 * - Настройка компетенций по блокам (технические, поведенческие, задачи, тесты)
 * - Выбор уровня грейда и проходного балла
 * - Выбор системы оценки в начале каждого таба (из настроек компании «Шкалы оценок»)
 * - Редактирование блоков и элементов в модальных окнах
 *
 * Функциональность:
 * - Табы: Технические навыки, Поведенческие навыки, Задачи, Тесты
 * - В каждом табе: выбор шкалы оценок (Система оценки), список блоков, кнопки «Добавить блок» / «Добавить навык»
 * - Уровень и шаблон: Select из настроек грейдирования (DEFAULT_GRADE_LEVELS при отсутствии конфига)
 * - Предупреждение о сумме весов (недостаток или превышение 100%)
 * - Модалки: навык (уровень, вес, авто/вручную, описание, темы, ссылка на ответы; для поведенческих — отказы), задача, тест, название блока
 *
 * Связи:
 * - useSpecializations: дерево специализаций, gradingBySpecId (уровни по специализации)
 * - lib/ratingScale: шкалы оценок, сохранение выбора по специализации и табу в localStorage
 * - initialTree: DEFAULT_GRADE_LEVELS для fallback списка уровней
 *
 * Поведение:
 * - Уровни для селектов подтягиваются из настроек грейдирования специализации или DEFAULT_GRADE_LEVELS
 * - Выбранная шкала оценок в матрице используется на странице создания/редактирования оценки (по вакансии → специализация)
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  TextField,
  Button,
  Select,
  Slider,
  Badge,
  Tabs,
  Dialog,
  Switch,
} from '@radix-ui/themes'
import { PlusIcon, Cross2Icon, Link2Icon, Pencil1Icon } from '@radix-ui/react-icons'
import { useSpecializations } from '../../context/SpecializationsContext'
import type { CompetencyItem } from '../../types'
import { DEFAULT_GRADE_LEVELS } from '../../data/initialTree'
import { getRatingScales, getRatingScaleIdForSpec, setRatingScaleForSpecTab } from '@/lib/ratingScale'
import styles from '../../specializations.module.css'

/** Блок внутри типа (JS, React, DevOps и т.д.) */
interface MatrixBlock<T> {
  id: string
  name: string
  items: T[]
}

/** Связь задачи с навыком и доля в пропорции */
interface TaskSkillLink {
  competencyId: string
  category: 'technical' | 'behavioral'
  competencyName: string
  weightPercent: number
}

/** Задача: название + привязка к навыкам + темы (метки) + вес в блоке */
interface MatrixTask {
  id: string
  name: string
  skillLinks: TaskSkillLink[]
  topicIds: string[]
  weightPercent?: number
}

/** Элемент теста в блоке тестов */
interface MatrixTestItem {
  id: string
  name: string
  description?: string
  passingScore?: number
  weightPercent?: number
}

const TYPE_LABELS: Record<'technical' | 'behavioral' | 'tasks' | 'tests', string> = {
  technical: 'Технические навыки',
  behavioral: 'Поведенческие навыки',
  tasks: 'Задачи',
  tests: 'Тесты',
}

const TEMPLATES = [
  { id: 'frontend', name: 'Frontend Standard (React/Vue)' },
  { id: 'backend', name: 'Backend Standard (Kotlin/Python)' },
  { id: 'devops', name: 'DevOps Standard' },
]

function createTechnicalBlock(id: string, name: string, items: CompetencyItem[]): MatrixBlock<CompetencyItem> {
  return { id, name, items }
}

function createBehavioralBlock(id: string, name: string, items: CompetencyItem[]): MatrixBlock<CompetencyItem> {
  return { id, name, items }
}

const INITIAL_TECHNICAL_BLOCKS: MatrixBlock<CompetencyItem>[] = [
  createTechnicalBlock('tb1', 'JS / TypeScript', [
    { id: '1', name: 'JavaScript/TypeScript', level: 3, weightPercent: 20, passingLevel: 3, sampleAnswer: 'Пример: описать замыкание', taskLink: '', topics: ['синтаксис', 'типы'], topicLinks: [] },
  ]),
  createTechnicalBlock('tb2', 'React', [
    { id: '2', name: 'React Core (hooks, context)', level: 4, weightPercent: 25, passingLevel: 4, sampleAnswer: '', taskLink: '', topics: [], topicLinks: [] },
    { id: '3', name: 'State Management', level: 2, weightPercent: 15, passingLevel: 2, topics: [], topicLinks: [] },
  ]),
  createTechnicalBlock('tb3', 'Стили и сборка', [
    { id: '4', name: 'CSS/Styling', level: 3, weightPercent: 10, passingLevel: 3, topics: [], topicLinks: [] },
  ]),
]

const INITIAL_BEHAVIORAL_BLOCKS: MatrixBlock<CompetencyItem>[] = [
  createBehavioralBlock('bb1', 'Автономность и ответственность', [
    { id: 'b1', name: 'Автономность', level: 2, weightPercent: 10, passingLevel: 2, rejectionTemplates: ['Не проявил инициативу'], rejectionReasons: ['Низкая самостоятельность'] },
    { id: 'b2', name: 'Mentorship', level: 1, weightPercent: 5, passingLevel: 1, rejectionTemplates: [], rejectionReasons: [] },
    { id: 'b3', name: 'Ownership', level: 2, weightPercent: 10, passingLevel: 2, rejectionTemplates: [], rejectionReasons: [] },
  ]),
]

const INITIAL_TASK_BLOCKS: MatrixBlock<MatrixTask>[] = [
  {
    id: 'taskb1',
    name: 'Frontend задачи',
    items: [
      {
        id: 't1',
        name: 'Разработка фичи по ТЗ',
        skillLinks: [
          { competencyId: '1', category: 'technical', competencyName: 'JavaScript/TypeScript', weightPercent: 40 },
          { competencyId: '2', category: 'technical', competencyName: 'React Core (hooks, context)', weightPercent: 30 },
          { competencyId: 'b1', category: 'behavioral', competencyName: 'Автономность', weightPercent: 30 },
        ],
        topicIds: ['React', 'TypeScript', 'фича'],
        weightPercent: 100,
      },
    ],
  },
]

const INITIAL_TEST_BLOCKS: MatrixBlock<MatrixTestItem>[] = [
  { id: 'testb1', name: 'Тесты по фронтенду', items: [{ id: 'te1', name: 'Тест по React', description: 'Базовые вопросы', passingScore: 70, weightPercent: 100 }] },
]

export default function SpecializationMatrixPage() {
  const { selectedNode, gradingBySpecId } = useSpecializations()
  const [selectedLevelId, setSelectedLevelId] = useState<string>('')
  const [templateId, setTemplateId] = useState<string>('')
  const [passingScoreByLevelId, setPassingScoreByLevelId] = useState<Record<string, number>>({})
  const [technicalBlocks, setTechnicalBlocks] = useState<MatrixBlock<CompetencyItem>[]>(() =>
    INITIAL_TECHNICAL_BLOCKS.map((b) => ({ ...b, items: b.items.map((c) => ({ ...c })) }))
  )
  const [behavioralBlocks, setBehavioralBlocks] = useState<MatrixBlock<CompetencyItem>[]>(() =>
    INITIAL_BEHAVIORAL_BLOCKS.map((b) => ({ ...b, items: b.items.map((c) => ({ ...c })) }))
  )
  const [taskBlocks, setTaskBlocks] = useState<MatrixBlock<MatrixTask>[]>(() =>
    INITIAL_TASK_BLOCKS.map((b) => ({ ...b, items: b.items.map((t) => ({ ...t, skillLinks: [...t.skillLinks], topicIds: [...t.topicIds] })) }))
  )
  const [testBlocks, setTestBlocks] = useState<MatrixBlock<MatrixTestItem>[]>(() =>
    INITIAL_TEST_BLOCKS.map((b) => ({ ...b, items: b.items.map((t) => ({ ...t })) }))
  )
  const [activeMatrixTab, setActiveMatrixTab] = useState<'technical' | 'behavioral' | 'tasks' | 'tests'>('technical')
  const [saved, setSaved] = useState(false)
  const ratingScales = getRatingScales()
  const [ratingScaleIdByTab, setRatingScaleIdByTab] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined' || !selectedNode) return { technical: '', behavioral: '', tasks: '', tests: '' }
    return {
      technical: getRatingScaleIdForSpec(selectedNode.id, 'technical'),
      behavioral: getRatingScaleIdForSpec(selectedNode.id, 'behavioral'),
      tasks: getRatingScaleIdForSpec(selectedNode.id, 'tasks'),
      tests: getRatingScaleIdForSpec(selectedNode.id, 'tests'),
    }
  })
  const [availableTopics, setAvailableTopics] = useState<string[]>(['React', 'TypeScript', 'фича', 'автономность', 'code review'])
  const [pullTargetByTaskId, setPullTargetByTaskId] = useState<Record<string, string>>({})

  // Модалки: редактирование/создание в отдельном окне
  const [competencyModal, setCompetencyModal] = useState<{ open: boolean; category: 'technical' | 'behavioral'; blockId: string; itemIndex: number | null }>({ open: false, category: 'technical', blockId: '', itemIndex: null })
  const [competencyForm, setCompetencyForm] = useState<CompetencyItem>({ id: '', name: '', level: 1, weightPercent: 5 })
  /** При создании навыка: true = вес распределять автоматически (равномерно), false = вручную */
  const [competencyWeightAuto, setCompetencyWeightAuto] = useState(true)
  const [taskModal, setTaskModal] = useState<{ open: boolean; blockId: string; taskId: string | null }>({ open: false, blockId: '', taskId: null })
  const [taskForm, setTaskForm] = useState<MatrixTask>({ id: '', name: '', skillLinks: [], topicIds: [] })
  const [testModal, setTestModal] = useState<{ open: boolean; blockId: string; testId: string | null }>({ open: false, blockId: '', testId: null })
  const [testForm, setTestForm] = useState<MatrixTestItem>({ id: '', name: '', passingScore: 70 })
  const [blockNameModal, setBlockNameModal] = useState<{ open: boolean; type: 'technical' | 'behavioral' | 'tasks' | 'tests'; blockId: string; name: string } | null>(null)

  const config = selectedNode ? gradingBySpecId[selectedNode.id] : null
  /** Уровни из настроек грейдирования специализации или fallback из DEFAULT_GRADE_LEVELS */
  const levels = (config?.levels?.length ? config.levels : DEFAULT_GRADE_LEVELS) as { id: string; name: string; order: number }[]
  /** Список уровней для выбора в модалке навыка */
  const effectiveLevelsForModal = [...levels].sort((a, b) => a.order - b.order)
  const maxLevelOrder = effectiveLevelsForModal.length ? Math.max(...effectiveLevelsForModal.map((l) => l.order)) : 5

  useEffect(() => {
    if (levels.length && !selectedLevelId) setSelectedLevelId(levels[0].id)
  }, [levels, selectedLevelId])

  useEffect(() => {
    if (!selectedNode) return
    setRatingScaleIdByTab({
      technical: getRatingScaleIdForSpec(selectedNode.id, 'technical'),
      behavioral: getRatingScaleIdForSpec(selectedNode.id, 'behavioral'),
      tasks: getRatingScaleIdForSpec(selectedNode.id, 'tasks'),
      tests: getRatingScaleIdForSpec(selectedNode.id, 'tests'),
    })
  }, [selectedNode?.id])

  if (!selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Выберите специализацию в левой панели.</Text>
      </Box>
    )
  }

  const allTechnicalCompetencies = technicalBlocks.flatMap((b) => b.items)
  const allBehavioralCompetencies = behavioralBlocks.flatMap((b) => b.items)
  const totalWeight = [...allTechnicalCompetencies, ...allBehavioralCompetencies].reduce((s, c) => s + c.weightPercent, 0)
  const weightWarning = totalWeight !== 100
  const weightWarningType = totalWeight < 100 ? 'недостаток' : totalWeight > 100 ? 'превышение' : null

  const passingScore = selectedLevelId ? (passingScoreByLevelId[selectedLevelId] ?? 3) : 3

  const addBlock = (type: 'technical' | 'behavioral' | 'tasks' | 'tests') => {
    const id = `block-${Date.now()}`
    const name = type === 'technical' ? 'Новый блок (JS, DevOps…)' : type === 'behavioral' ? 'Новый блок' : type === 'tasks' ? 'Новый блок задач' : 'Новый блок тестов'
    if (type === 'technical') setTechnicalBlocks((prev) => [...prev, { id, name, items: [] }])
    if (type === 'behavioral') setBehavioralBlocks((prev) => [...prev, { id, name, items: [] }])
    if (type === 'tasks') setTaskBlocks((prev) => [...prev, { id, name, items: [] }])
    if (type === 'tests') setTestBlocks((prev) => [...prev, { id, name, items: [] }])
  }

  const updateBlockName = (type: 'technical' | 'behavioral' | 'tasks' | 'tests', blockId: string, name: string) => {
    if (type === 'technical') setTechnicalBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, name } : b)))
    if (type === 'behavioral') setBehavioralBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, name } : b)))
    if (type === 'tasks') setTaskBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, name } : b)))
    if (type === 'tests') setTestBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, name } : b)))
  }

  const removeBlock = (type: 'technical' | 'behavioral' | 'tasks' | 'tests', blockId: string) => {
    if (type === 'technical') setTechnicalBlocks((prev) => prev.filter((b) => b.id !== blockId))
    if (type === 'behavioral') setBehavioralBlocks((prev) => prev.filter((b) => b.id !== blockId))
    if (type === 'tasks') setTaskBlocks((prev) => prev.filter((b) => b.id !== blockId))
    if (type === 'tests') setTestBlocks((prev) => prev.filter((b) => b.id !== blockId))
  }

  const addCompetencyToBlock = (category: 'technical' | 'behavioral', blockId: string) => {
    const item: CompetencyItem = { id: `new-${Date.now()}`, name: '', level: 1, weightPercent: 5 }
    if (category === 'technical') setTechnicalBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: [...b.items, item] } : b)))
    if (category === 'behavioral') setBehavioralBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: [...b.items, item] } : b)))
  }

  const removeCompetencyFromBlock = (category: 'technical' | 'behavioral', blockId: string, itemIndex: number) => {
    if (category === 'technical') setTechnicalBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: b.items.filter((_, i) => i !== itemIndex) } : b)))
    if (category === 'behavioral') setBehavioralBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: b.items.filter((_, i) => i !== itemIndex) } : b)))
  }

  const updateCompetencyInBlock = (category: 'technical' | 'behavioral', blockId: string, itemIndex: number, patch: Partial<CompetencyItem>) => {
    if (category === 'technical') setTechnicalBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: b.items.map((c, i) => (i === itemIndex ? { ...c, ...patch } : c)) } : b)))
    if (category === 'behavioral') setBehavioralBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: b.items.map((c, i) => (i === itemIndex ? { ...c, ...patch } : c)) } : b)))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const technicalAndBehavioralCompetencies = [
    ...allTechnicalCompetencies.map((c) => ({ ...c, category: 'technical' as const })),
    ...allBehavioralCompetencies.map((c) => ({ ...c, category: 'behavioral' as const })),
  ]

  const addTaskToBlock = (blockId: string) => {
    setTaskBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, items: [...b.items, { id: `task-${Date.now()}`, name: '', skillLinks: [], topicIds: [] }] } : b
      )
    )
  }

  const removeTaskFromBlock = (blockId: string, taskId: string) => {
    setTaskBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: b.items.filter((t) => t.id !== taskId) } : b)))
  }

  const updateTaskInBlock = (blockId: string, taskId: string, patch: Partial<MatrixTask>) => {
    setTaskBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, items: b.items.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) } : b))
    )
  }

  const addTopicToTask = (blockId: string, taskId: string, topic: string) => {
    setTaskBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, items: b.items.map((t) => (t.id === taskId && !t.topicIds.includes(topic) ? { ...t, topicIds: [...t.topicIds, topic] } : t)) }
          : b
      )
    )
  }

  const removeTopicFromTask = (blockId: string, taskId: string, topic: string) => {
    setTaskBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, items: b.items.map((t) => (t.id === taskId ? { ...t, topicIds: t.topicIds.filter((id) => id !== topic) } : t)) } : b))
    )
  }

  const addTaskSkillLink = (blockId: string, taskId: string) => {
    const first = technicalAndBehavioralCompetencies[0]
    if (!first) return
    setTaskBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b
        const task = b.items.find((t) => t.id === taskId)
        if (!task) return b
        return {
          ...b,
          items: b.items.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  skillLinks: [
                    ...t.skillLinks,
                    { competencyId: first.id, category: first.category, competencyName: first.name || first.id, weightPercent: 100 / (t.skillLinks.length + 1) },
                  ],
                }
              : t
          ),
        }
      })
    )
  }

  const removeTaskSkillLink = (blockId: string, taskId: string, linkIndex: number) => {
    setTaskBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, items: b.items.map((t) => (t.id === taskId ? { ...t, skillLinks: t.skillLinks.filter((_, i) => i !== linkIndex) } : t)) } : b))
    )
  }

  const updateTaskSkillLink = (
    blockId: string,
    taskId: string,
    linkIndex: number,
    patch: Partial<TaskSkillLink> | { competencyId: string; category: 'technical' | 'behavioral'; competencyName: string }
  ) => {
    setTaskBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, items: b.items.map((t) => (t.id === taskId ? { ...t, skillLinks: t.skillLinks.map((link, i) => (i === linkIndex ? { ...link, ...patch } : link)) } : t)) }
          : b
      )
    )
  }

  const getTaskLinksSum = (task: MatrixTask) => task.skillLinks.reduce((s, l) => s + l.weightPercent, 0)

  const addTestToBlock = (blockId: string) => {
    setTestBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, items: [...b.items, { id: `te-${Date.now()}`, name: '', passingScore: 70 }] } : b))
    )
  }

  const removeTestFromBlock = (blockId: string, testId: string) => {
    setTestBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: b.items.filter((t) => t.id !== testId) } : b)))
  }

  const updateTestInBlock = (blockId: string, testId: string, patch: Partial<MatrixTestItem>) => {
    setTestBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: b.items.map((t) => (t.id === testId ? { ...t, ...patch } : t)) } : b)))
  }

  const openCompetencyModal = (category: 'technical' | 'behavioral', blockId: string, itemIndex: number | null) => {
    const blocks = category === 'technical' ? technicalBlocks : behavioralBlocks
    const block = blocks.find((b) => b.id === blockId)
    const allInCategory = blocks.flatMap((b) => b.items)
    if (itemIndex !== null && block?.items[itemIndex]) {
      setCompetencyForm({ ...block.items[itemIndex] })
      setCompetencyWeightAuto(false)
    } else {
      const totalCount = allInCategory.length + 1
      const evenWeight = totalCount > 0 ? Math.round(100 / totalCount) : 5
      setCompetencyForm({ id: `new-${Date.now()}`, name: '', level: 1, weightPercent: evenWeight })
      setCompetencyWeightAuto(true)
    }
    setCompetencyModal({ open: true, category, blockId, itemIndex })
  }

  const saveCompetencyModal = () => {
    const { category, blockId, itemIndex } = competencyModal
    if (itemIndex !== null) {
      updateCompetencyInBlock(category, blockId, itemIndex, competencyForm)
    } else {
      if (category === 'technical') setTechnicalBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: [...b.items, { ...competencyForm }] } : b)))
      else setBehavioralBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: [...b.items, { ...competencyForm }] } : b)))
    }
    setCompetencyModal((m) => ({ ...m, open: false }))
  }

  const openTaskModal = (blockId: string, taskId: string | null) => {
    if (taskId) {
      const block = taskBlocks.find((b) => b.id === blockId)
      const task = block?.items.find((t) => t.id === taskId)
      if (task) setTaskForm({ ...task, skillLinks: [...task.skillLinks], topicIds: [...task.topicIds] })
    } else {
      const block = taskBlocks.find((b) => b.id === blockId)
      const count = block ? block.items.length + 1 : 1
      const evenWeight = count > 0 ? Math.round(100 / count) : 10
      setTaskForm({ id: `task-${Date.now()}`, name: '', skillLinks: [], topicIds: [], weightPercent: evenWeight })
    }
    setTaskModal({ open: true, blockId, taskId })
  }

  const saveTaskModal = () => {
    const { blockId, taskId } = taskModal
    if (taskId) {
      updateTaskInBlock(blockId, taskId, taskForm)
    } else {
      setTaskBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: [...b.items, { ...taskForm }] } : b)))
    }
    setTaskModal((m) => ({ ...m, open: false }))
  }

  const openTestModal = (blockId: string, testId: string | null) => {
    if (testId) {
      const block = testBlocks.find((b) => b.id === blockId)
      const test = block?.items.find((t) => t.id === testId)
      if (test) setTestForm({ ...test })
    } else {
      const block = testBlocks.find((b) => b.id === blockId)
      const count = block ? block.items.length + 1 : 1
      const evenWeight = count > 0 ? Math.round(100 / count) : 10
      setTestForm({ id: `te-${Date.now()}`, name: '', passingScore: 70, weightPercent: evenWeight })
    }
    setTestModal({ open: true, blockId, testId })
  }

  const saveTestModal = () => {
    const { blockId, testId } = testModal
    if (testId) {
      updateTestInBlock(blockId, testId, testForm)
    } else {
      setTestBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, items: [...b.items, { ...testForm }] } : b)))
    }
    setTestModal((m) => ({ ...m, open: false }))
  }

  const openBlockNameModal = (type: 'technical' | 'behavioral' | 'tasks' | 'tests', blockId: string, name: string) => {
    setBlockNameModal({ open: true, type, blockId, name })
  }

  const saveBlockNameModal = (newName: string) => {
    if (!blockNameModal) return
    updateBlockName(blockNameModal.type, blockNameModal.blockId, newName)
    setBlockNameModal(null)
  }

  return (
    <Box>
      <Box className={styles.tabSection}>
        <Flex gap="3" align="center" mb="4" wrap="wrap">
          <Text size="2" weight="bold">Уровень:</Text>
          <Select.Root value={selectedLevelId} onValueChange={setSelectedLevelId}>
            <Select.Trigger style={{ minWidth: 140 }} />
            <Select.Content>
              {levels.map((l) => (
                <Select.Item key={l.id} value={l.id}>
                  {l.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Text size="2" weight="bold">Копировать из шаблона:</Text>
          <Select.Root value={templateId} onValueChange={setTemplateId}>
            <Select.Trigger style={{ minWidth: 220 }} />
            <Select.Content>
              {TEMPLATES.map((t) => (
                <Select.Item key={t.id} value={t.id}>
                  {t.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Text size="2" weight="bold">Проходной балл по грейду:</Text>
          <Flex align="center" gap="2">
            <Slider
              value={[passingScore]}
              onValueChange={([v]) => selectedLevelId && setPassingScoreByLevelId((prev) => ({ ...prev, [selectedLevelId]: v }))}
              min={1}
              max={5}
              step={0.5}
              style={{ width: 100 }}
            />
            <Text size="2">{passingScore}</Text>
          </Flex>
        </Flex>
      </Box>

      {weightWarning && (
        <Box mb="3" p="2" style={{ backgroundColor: 'var(--amber-3)', borderRadius: 6 }}>
          <Text size="2" color="amber">
            {weightWarningType === 'недостаток'
              ? `Сумма весов меньше 100%: ${totalWeight}%. Рекомендуется 100%.`
              : `Сумма весов превышает 100%: ${totalWeight}%. Рекомендуется 100%.`}
          </Text>
        </Box>
      )}

      <Tabs.Root value={activeMatrixTab} onValueChange={(v) => setActiveMatrixTab(v as typeof activeMatrixTab)}>
        <Tabs.List mb="3">
          {(Object.keys(TYPE_LABELS) as Array<keyof typeof TYPE_LABELS>).map((type) => (
            <Tabs.Trigger key={type} value={type}>
              {TYPE_LABELS[type]}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="technical">
          <Flex align="center" gap="2" mb="3" wrap="wrap">
            <Text size="2" weight="bold">Система оценки:</Text>
            <Select.Root
              value={ratingScaleIdByTab.technical || ratingScales[0]?.id}
              onValueChange={(value) => {
                if (selectedNode) {
                  setRatingScaleForSpecTab(selectedNode.id, 'technical', value)
                  setRatingScaleIdByTab((prev) => ({ ...prev, technical: value }))
                }
              }}
            >
              <Select.Trigger style={{ minWidth: 180 }} />
              <Select.Content>
                {ratingScales.map((s) => (
                  <Select.Item key={s.id} value={s.id}>{s.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="bold">Блоки</Text>
            <Button variant="soft" size="1" onClick={() => addBlock('technical')}><PlusIcon width={14} height={14} /> Добавить блок</Button>
          </Flex>
          {technicalBlocks.map((block) => (
            <Box key={block.id} className={styles.tabSection} style={{ border: '1px solid var(--gray-a5)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Flex justify="between" align="center" mb="2">
                <Button variant="ghost" size="2" onClick={() => openBlockNameModal('technical', block.id, block.name)} style={{ fontWeight: 600 }}>
                  {block.name || 'Без названия'}
                </Button>
                <Flex gap="2">
                  <Button variant="soft" size="1" onClick={() => openCompetencyModal('technical', block.id, null)}><PlusIcon width={14} height={14} /> Добавить навык</Button>
                  <Button variant="ghost" color="red" size="1" onClick={() => removeBlock('technical', block.id)}><Cross2Icon width={14} height={14} /></Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="1">
                {block.items.length === 0 ? (
                  <Text size="1" color="gray">Нет навыков. Нажмите «Добавить навык».</Text>
                ) : (
                  block.items.map((c, i) => (
                    <Flex key={c.id} align="center" justify="between" gap="2" p="2" style={{ border: '1px solid var(--gray-a5)', borderRadius: 6, backgroundColor: 'var(--gray-a1)' }}>
                      <Text size="2" weight="medium" style={{ flex: 1 }}>{c.name || '(без названия)'}</Text>
                      <Text size="1" color="gray">уровень {c.level}, вес {c.weightPercent}%</Text>
                      <Button variant="soft" size="1" onClick={() => openCompetencyModal('technical', block.id, i)}><Pencil1Icon width={14} height={14} /> Редактировать</Button>
                      <Button variant="ghost" color="red" size="1" onClick={() => removeCompetencyFromBlock('technical', block.id, i)}><Cross2Icon width={14} height={14} /></Button>
                    </Flex>
                  ))
                )}
              </Flex>
            </Box>
          ))}
        </Tabs.Content>

        <Tabs.Content value="behavioral">
          <Flex align="center" gap="2" mb="3" wrap="wrap">
            <Text size="2" weight="bold">Система оценки:</Text>
            <Select.Root
              value={ratingScaleIdByTab.behavioral || ratingScales[0]?.id}
              onValueChange={(value) => {
                if (selectedNode) {
                  setRatingScaleForSpecTab(selectedNode.id, 'behavioral', value)
                  setRatingScaleIdByTab((prev) => ({ ...prev, behavioral: value }))
                }
              }}
            >
              <Select.Trigger style={{ minWidth: 180 }} />
              <Select.Content>
                {ratingScales.map((s) => (
                  <Select.Item key={s.id} value={s.id}>{s.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="bold">Блоки</Text>
            <Button variant="soft" size="1" onClick={() => addBlock('behavioral')}><PlusIcon width={14} height={14} /> Добавить блок</Button>
          </Flex>
          {behavioralBlocks.map((block) => (
            <Box key={block.id} className={styles.tabSection} style={{ border: '1px solid var(--gray-a5)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Flex justify="between" align="center" mb="2">
                <Button variant="ghost" size="2" onClick={() => openBlockNameModal('behavioral', block.id, block.name)} style={{ fontWeight: 600 }}>{block.name || 'Без названия'}</Button>
                <Flex gap="2">
                  <Button variant="soft" size="1" onClick={() => openCompetencyModal('behavioral', block.id, null)}><PlusIcon width={14} height={14} /> Добавить навык</Button>
                  <Button variant="ghost" color="red" size="1" onClick={() => removeBlock('behavioral', block.id)}><Cross2Icon width={14} height={14} /></Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="1">
                {block.items.length === 0 ? <Text size="1" color="gray">Нет навыков.</Text> : block.items.map((c, i) => (
                  <Flex key={c.id} align="center" justify="between" gap="2" p="2" style={{ border: '1px solid var(--gray-a5)', borderRadius: 6, backgroundColor: 'var(--gray-a1)' }}>
                    <Text size="2" weight="medium" style={{ flex: 1 }}>{c.name || '(без названия)'}</Text>
                    <Text size="1" color="gray">уровень {c.level}, вес {c.weightPercent}%</Text>
                    <Button variant="soft" size="1" onClick={() => openCompetencyModal('behavioral', block.id, i)}><Pencil1Icon width={14} height={14} /> Редактировать</Button>
                    <Button variant="ghost" color="red" size="1" onClick={() => removeCompetencyFromBlock('behavioral', block.id, i)}><Cross2Icon width={14} height={14} /></Button>
                  </Flex>
                ))}
              </Flex>
            </Box>
          ))}
        </Tabs.Content>

        <Tabs.Content value="tasks">
          <Flex align="center" gap="2" mb="3" wrap="wrap">
            <Text size="2" weight="bold">Система оценки:</Text>
            <Select.Root
              value={ratingScaleIdByTab.tasks || ratingScales[0]?.id}
              onValueChange={(value) => {
                if (selectedNode) {
                  setRatingScaleForSpecTab(selectedNode.id, 'tasks', value)
                  setRatingScaleIdByTab((prev) => ({ ...prev, tasks: value }))
                }
              }}
            >
              <Select.Trigger style={{ minWidth: 180 }} />
              <Select.Content>
                {ratingScales.map((s) => (
                  <Select.Item key={s.id} value={s.id}>{s.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="bold">Блоки задач</Text>
            <Button variant="soft" size="1" onClick={() => addBlock('tasks')}><PlusIcon width={14} height={14} /> Добавить блок</Button>
          </Flex>
          <Text size="1" color="gray" mb="3">Список задач. Редактирование — в модальном окне.</Text>
          {taskBlocks.map((block) => (
            <Box key={block.id} className={styles.tabSection} style={{ border: '1px solid var(--gray-a5)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Flex justify="between" align="center" mb="2">
                <Button variant="ghost" size="2" onClick={() => openBlockNameModal('tasks', block.id, block.name)} style={{ fontWeight: 600 }}>{block.name || 'Без названия'}</Button>
                <Flex gap="2">
                  <Button variant="soft" size="1" onClick={() => openTaskModal(block.id, null)}><PlusIcon width={14} height={14} /> Добавить задачу</Button>
                  <Button variant="ghost" color="red" size="1" onClick={() => removeBlock('tasks', block.id)}><Cross2Icon width={14} height={14} /></Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="1">
                {block.items.length === 0 ? <Text size="1" color="gray">Нет задач.</Text> : block.items.map((task) => (
                  <Flex key={task.id} align="center" justify="between" gap="2" p="2" style={{ border: '1px solid var(--gray-a5)', borderRadius: 6, backgroundColor: 'var(--gray-a2)' }}>
                    <Text size="2" weight="medium" style={{ flex: 1 }}>{task.name || '(без названия)'}</Text>
                    <Text size="1" color="gray">вес {task.weightPercent ?? '—'}%, тем: {task.topicIds.length}, навыков: {task.skillLinks.length}</Text>
                    <Button variant="soft" size="1" onClick={() => openTaskModal(block.id, task.id)}><Pencil1Icon width={14} height={14} /> Редактировать</Button>
                    <Button variant="ghost" color="red" size="1" onClick={() => removeTaskFromBlock(block.id, task.id)}><Cross2Icon width={14} height={14} /></Button>
                  </Flex>
                ))}
              </Flex>
            </Box>
          ))}
        </Tabs.Content>

        <Tabs.Content value="tests">
          <Flex align="center" gap="2" mb="3" wrap="wrap">
            <Text size="2" weight="bold">Система оценки:</Text>
            <Select.Root
              value={ratingScaleIdByTab.tests || ratingScales[0]?.id}
              onValueChange={(value) => {
                if (selectedNode) {
                  setRatingScaleForSpecTab(selectedNode.id, 'tests', value)
                  setRatingScaleIdByTab((prev) => ({ ...prev, tests: value }))
                }
              }}
            >
              <Select.Trigger style={{ minWidth: 180 }} />
              <Select.Content>
                {ratingScales.map((s) => (
                  <Select.Item key={s.id} value={s.id}>{s.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="bold">Блоки тестов</Text>
            <Button variant="soft" size="1" onClick={() => addBlock('tests')}><PlusIcon width={14} height={14} /> Добавить блок</Button>
          </Flex>
          {testBlocks.map((block) => (
            <Box key={block.id} className={styles.tabSection} style={{ border: '1px solid var(--gray-a5)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Flex justify="between" align="center" mb="2">
                <Button variant="ghost" size="2" onClick={() => openBlockNameModal('tests', block.id, block.name)} style={{ fontWeight: 600 }}>{block.name || 'Без названия'}</Button>
                <Flex gap="2">
                  <Button variant="soft" size="1" onClick={() => openTestModal(block.id, null)}><PlusIcon width={14} height={14} /> Добавить тест</Button>
                  <Button variant="ghost" color="red" size="1" onClick={() => removeBlock('tests', block.id)}><Cross2Icon width={14} height={14} /></Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="1">
                {block.items.length === 0 ? <Text size="1" color="gray">Нет тестов.</Text> : block.items.map((test) => (
                  <Flex key={test.id} align="center" justify="between" gap="2" p="2" style={{ border: '1px solid var(--gray-a5)', borderRadius: 6, backgroundColor: 'var(--gray-a1)' }}>
                    <Text size="2" weight="medium" style={{ flex: 1 }}>{test.name || '(без названия)'}</Text>
                    <Text size="1" color="gray">вес {test.weightPercent ?? '—'}%, проходной {test.passingScore ?? '—'}%</Text>
                    <Button variant="soft" size="1" onClick={() => openTestModal(block.id, test.id)}><Pencil1Icon width={14} height={14} /> Редактировать</Button>
                    <Button variant="ghost" color="red" size="1" onClick={() => removeTestFromBlock(block.id, test.id)}><Cross2Icon width={14} height={14} /></Button>
                  </Flex>
                ))}
              </Flex>
            </Box>
          ))}
        </Tabs.Content>
      </Tabs.Root>

      {/* Модалка: навык (технический/поведенческий) */}
      <Dialog.Root open={competencyModal.open} onOpenChange={(open) => setCompetencyModal((m) => ({ ...m, open }))}>
        <Dialog.Content style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
          <Dialog.Title>{competencyModal.itemIndex !== null ? 'Редактировать навык' : 'Новый навык'}</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 100 }}>Навык</Text>
              <TextField.Root value={competencyForm.name} onChange={(e) => setCompetencyForm((f) => ({ ...f, name: e.target.value }))} placeholder="Название" style={{ flex: 1 }} />
            </Flex>
            <Flex gap="2" align="start">
              <Text size="1" style={{ minWidth: 100 }}>Описание</Text>
              <TextField.Root value={competencyForm.description ?? ''} onChange={(e) => setCompetencyForm((f) => ({ ...f, description: e.target.value }))} placeholder="Описание" style={{ flex: 1 }} />
            </Flex>
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 100 }}>Уровень</Text>
              <Select.Root
                value={String(Math.min(Math.max(1, competencyForm.level), maxLevelOrder))}
                onValueChange={(v) => setCompetencyForm((f) => ({ ...f, level: Number(v) }))}
              >
                <Select.Trigger style={{ flex: 1 }} />
                <Select.Content>
                  {effectiveLevelsForModal.map((l) => (
                    <Select.Item key={l.id} value={String(l.order)}>{l.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 100 }}>Проходной уровень</Text>
              <Select.Root
                value={String(Math.min(Math.max(1, competencyForm.passingLevel ?? competencyForm.level), maxLevelOrder))}
                onValueChange={(v) => setCompetencyForm((f) => ({ ...f, passingLevel: Number(v) }))}
              >
                <Select.Trigger style={{ flex: 1 }} />
                <Select.Content>
                  {effectiveLevelsForModal.map((l) => (
                    <Select.Item key={l.id} value={String(l.order)}>{l.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 100 }}>Вес %</Text>
              {competencyWeightAuto ? (
                <Text size="2" style={{ flex: 1 }}>{competencyForm.weightPercent} (авто)</Text>
              ) : (
                <TextField.Root type="number" value={competencyForm.weightPercent} onChange={(e) => setCompetencyForm((f) => ({ ...f, weightPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))} style={{ width: 80 }} />
              )}
              <Flex align="center" gap="2">
                <Text size="1">Вручную</Text>
                <Switch
                  checked={!competencyWeightAuto}
                  onCheckedChange={(checked) => {
                    setCompetencyWeightAuto(!checked)
                    if (!checked) {
                      const blocks = competencyModal.category === 'technical' ? technicalBlocks : behavioralBlocks
                      const n = blocks.flatMap((b) => b.items).length + (competencyModal.itemIndex === null ? 1 : 0)
                      setCompetencyForm((f) => ({ ...f, weightPercent: n > 0 ? Math.round(100 / n) : 5 }))
                    }
                  }}
                />
              </Flex>
            </Flex>
            {competencyModal.category === 'technical' && (
              <>
                <Flex gap="2" align="start">
                  <Text size="1" style={{ minWidth: 100 }}>Пример ответа</Text>
                  <TextField.Root value={competencyForm.sampleAnswer ?? ''} onChange={(e) => setCompetencyForm((f) => ({ ...f, sampleAnswer: e.target.value }))} placeholder="Пример ответа" style={{ flex: 1 }} />
                </Flex>
                <Flex gap="2" align="center">
                  <Text size="1" style={{ minWidth: 100 }}>Ссылка на задачу</Text>
                  <TextField.Root value={competencyForm.taskLink ?? ''} onChange={(e) => setCompetencyForm((f) => ({ ...f, taskLink: e.target.value }))} placeholder="https://..." style={{ flex: 1 }} />
                </Flex>
              </>
            )}
            <Flex gap="2" align="start">
              <Text size="1" style={{ minWidth: 100 }}>Темы</Text>
              <TextField.Root value={(competencyForm.topics ?? []).join(', ')} onChange={(e) => setCompetencyForm((f) => ({ ...f, topics: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="через запятую" style={{ flex: 1 }} />
            </Flex>
            {competencyModal.category === 'technical' && (
              <Flex gap="2" align="start">
                <Text size="1" style={{ minWidth: 100 }}>Ссылки на темы</Text>
                <TextField.Root value={(competencyForm.topicLinks ?? []).join(', ')} onChange={(e) => setCompetencyForm((f) => ({ ...f, topicLinks: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="URL через запятую" style={{ flex: 1 }} />
              </Flex>
            )}
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 100 }}>Ссылка на ответы</Text>
              <TextField.Root value={competencyForm.answerLink ?? ''} onChange={(e) => setCompetencyForm((f) => ({ ...f, answerLink: e.target.value }))} placeholder="/candidate-responses или URL" style={{ flex: 1 }} />
              <Button size="1" variant="soft" asChild><a href="/candidate-responses" target="_blank" rel="noopener noreferrer">Открыть ответы</a></Button>
            </Flex>
            {competencyModal.category === 'behavioral' && (
              <>
                <Flex gap="2" align="start">
                  <Text size="1" style={{ minWidth: 100 }}>Шаблоны отказов</Text>
                  <TextField.Root value={(competencyForm.rejectionTemplates ?? []).join(', ')} onChange={(e) => setCompetencyForm((f) => ({ ...f, rejectionTemplates: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="через запятую" style={{ flex: 1 }} />
                </Flex>
                <Flex gap="2" align="start">
                  <Text size="1" style={{ minWidth: 100 }}>Причины отказов</Text>
                  <TextField.Root value={(competencyForm.rejectionReasons ?? []).join(', ')} onChange={(e) => setCompetencyForm((f) => ({ ...f, rejectionReasons: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="через запятую" style={{ flex: 1 }} />
                </Flex>
              </>
            )}
          </Flex>
          <Flex gap="2" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft">Отмена</Button>
            </Dialog.Close>
            <Button onClick={saveCompetencyModal}>Сохранить</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Модалка: задача */}
      <Dialog.Root open={taskModal.open} onOpenChange={(open) => setTaskModal((m) => ({ ...m, open }))}>
        <Dialog.Content style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
          <Dialog.Title>{taskModal.taskId ? 'Редактировать задачу' : 'Новая задача'}</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 90 }}>Название</Text>
              <TextField.Root value={taskForm.name} onChange={(e) => setTaskForm((f) => ({ ...f, name: e.target.value }))} placeholder="Название задачи" style={{ flex: 1 }} />
            </Flex>
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 90 }}>Вес %</Text>
              <TextField.Root type="number" min={0} max={100} value={taskForm.weightPercent ?? ''} onChange={(e) => setTaskForm((f) => ({ ...f, weightPercent: Number(e.target.value) || undefined }))} placeholder="доля в блоке" style={{ width: 80 }} />
            </Flex>
            <Flex gap="2" align="start">
              <Text size="1" style={{ minWidth: 90 }}>Темы</Text>
              <TextField.Root value={taskForm.topicIds.join(', ')} onChange={(e) => setTaskForm((f) => ({ ...f, topicIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="метки через запятую" style={{ flex: 1 }} />
            </Flex>
            <Text size="1" weight="medium">Связь с навыками (пропорция %)</Text>
            {taskForm.skillLinks.map((link, linkIdx) => (
              <Flex key={linkIdx} align="center" gap="2">
                <Select.Root
                  value={`${link.category}:${link.competencyId}`}
                  onValueChange={(val) => {
                    const [cat, id] = val.split(':') as ['technical' | 'behavioral', string]
                    const comp = technicalAndBehavioralCompetencies.find((c) => c.category === cat && c.id === id)
                    if (comp) setTaskForm((f) => ({ ...f, skillLinks: f.skillLinks.map((l, i) => (i === linkIdx ? { ...l, competencyId: comp.id, category: comp.category, competencyName: comp.name || comp.id } : l)) }))
                  }}
                >
                  <Select.Trigger style={{ flex: 1 }} />
                  <Select.Content>
                    <Select.Group><Select.Label>Технические</Select.Label>
                      {allTechnicalCompetencies.map((c) => (<Select.Item key={c.id} value={`technical:${c.id}`}>{c.name || c.id}</Select.Item>))}
                    </Select.Group>
                    <Select.Group><Select.Label>Поведенческие</Select.Label>
                      {allBehavioralCompetencies.map((c) => (<Select.Item key={c.id} value={`behavioral:${c.id}`}>{c.name || c.id}</Select.Item>))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
                <TextField.Root type="number" placeholder="%" value={link.weightPercent} onChange={(e) => setTaskForm((f) => ({ ...f, skillLinks: f.skillLinks.map((l, i) => (i === linkIdx ? { ...l, weightPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) } : l)) }))} style={{ width: 64 }} />
                <Button variant="ghost" color="red" size="1" onClick={() => setTaskForm((f) => ({ ...f, skillLinks: f.skillLinks.filter((_, i) => i !== linkIdx) }))}><Cross2Icon width={14} height={14} /></Button>
              </Flex>
            ))}
            <Button variant="soft" size="1" onClick={() => setTaskForm((f) => {
              const first = technicalAndBehavioralCompetencies[0]
              if (!first) return f
              return { ...f, skillLinks: [...f.skillLinks, { competencyId: first.id, category: first.category, competencyName: first.name || first.id, weightPercent: 100 / (f.skillLinks.length + 1) }] }
            })}><PlusIcon width={14} height={14} /> Добавить связь с навыком</Button>
          </Flex>
          <Flex gap="2" justify="end" mt="4">
            <Dialog.Close><Button variant="soft">Отмена</Button></Dialog.Close>
            <Button onClick={saveTaskModal}>Сохранить</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Модалка: тест */}
      <Dialog.Root open={testModal.open} onOpenChange={(open) => setTestModal((m) => ({ ...m, open }))}>
        <Dialog.Content style={{ maxWidth: 440 }}>
          <Dialog.Title>{testModal.testId ? 'Редактировать тест' : 'Новый тест'}</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 100 }}>Название</Text>
              <TextField.Root value={testForm.name} onChange={(e) => setTestForm((f) => ({ ...f, name: e.target.value }))} placeholder="Название теста" style={{ flex: 1 }} />
            </Flex>
            <Flex gap="2" align="start">
              <Text size="1" style={{ minWidth: 100 }}>Описание</Text>
              <TextField.Root value={testForm.description ?? ''} onChange={(e) => setTestForm((f) => ({ ...f, description: e.target.value }))} placeholder="Описание" style={{ flex: 1 }} />
            </Flex>
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 100 }}>Вес %</Text>
              <TextField.Root type="number" min={0} max={100} value={testForm.weightPercent ?? ''} onChange={(e) => setTestForm((f) => ({ ...f, weightPercent: Number(e.target.value) || undefined }))} placeholder="доля в блоке" style={{ width: 80 }} />
            </Flex>
            <Flex gap="2" align="center">
              <Text size="1" style={{ minWidth: 100 }}>Проходной %</Text>
              <TextField.Root type="number" min={0} max={100} value={testForm.passingScore ?? ''} onChange={(e) => setTestForm((f) => ({ ...f, passingScore: Number(e.target.value) || undefined }))} style={{ width: 80 }} />
            </Flex>
          </Flex>
          <Flex gap="2" justify="end" mt="4">
            <Dialog.Close><Button variant="soft">Отмена</Button></Dialog.Close>
            <Button onClick={saveTestModal}>Сохранить</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Модалка: название блока */}
      <Dialog.Root open={!!blockNameModal} onOpenChange={(open) => !open && setBlockNameModal(null)}>
        <Dialog.Content style={{ maxWidth: 400 }}>
          <Dialog.Title>Название блока</Dialog.Title>
          <TextField.Root
            mt="3"
            value={blockNameModal?.name ?? ''}
            onChange={(e) => blockNameModal && setBlockNameModal({ ...blockNameModal, name: e.target.value })}
            placeholder="JS, React, DevOps…"
          />
          <Flex gap="2" justify="end" mt="4">
            <Dialog.Close><Button variant="soft">Отмена</Button></Dialog.Close>
            <Button onClick={() => blockNameModal && saveBlockNameModal(blockNameModal.name)}>Сохранить</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Flex gap="3" mt="4">
        <Button variant="solid" onClick={handleSave}>
          {saved ? 'Сохранено' : 'Сохранить'}
        </Button>
        <Button variant="soft">Экспорт (JSON)</Button>
        <Button variant="soft">Импорт</Button>
      </Flex>
    </Box>
  )
}
