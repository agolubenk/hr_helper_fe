/**
 * SpecializationGradesPage (specializations/[id]/grades/page.tsx) — Грейдирование специализации
 *
 * Назначение: настройка уровней (грейдов) для выбранной специализации: наследование от родителя, тип (grades/custom),
 * список уровней (название, описание). Уровни используются в матрице навыков и в настройках компании.
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  TextField,
  TextArea,
  Button,
  Switch,
} from '@radix-ui/themes'
import { PlusIcon, Cross2Icon } from '@radix-ui/react-icons'
import { useSpecializations } from '../../context/SpecializationsContext'
import { DEFAULT_GRADE_LEVELS } from '../../data/initialTree'
import type { GradingConfig, GradeLevel, GradingType } from '../../types'
import styles from '../../specializations.module.css'

/** Страница настройки грейдов и уровней специализации. */
export default function SpecializationGradesPage() {
  const { selectedNode, gradingBySpecId, setGradingBySpecId } = useSpecializations()
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const config: GradingConfig = selectedNode
    ? gradingBySpecId[selectedNode.id] ?? {
        inheritFromParent: false,
        type: 'grades',
        levels: [...DEFAULT_GRADE_LEVELS],
      }
    : { inheritFromParent: false, type: 'grades', levels: [] }

  const [inherit, setInherit] = useState(config.inheritFromParent)
  const [type, setType] = useState<GradingType>(config.type)
  const [levels, setLevels] = useState<GradeLevel[]>(config.levels)

  useEffect(() => {
    setInherit(config.inheritFromParent)
    setType(config.type)
    setLevels(config.levels.length ? config.levels : [...DEFAULT_GRADE_LEVELS])
  }, [selectedNode?.id, config.inheritFromParent, config.type, config.levels.length])

  if (!selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Выберите специализацию в левой панели.</Text>
      </Box>
    )
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    for (let i = 0; i < levels.length; i++) {
      const l = levels[i]
      if (!l.name?.trim()) next[`level_${i}_name`] = 'Укажите название уровня'
      const min = l.minSalary ?? 0
      const max = l.maxSalary ?? 0
      if (min > max) next[`level_${i}_range`] = `Min не может быть больше Max`
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    setGradingBySpecId((prev) => ({
      ...prev,
      [selectedNode.id]: {
        inheritFromParent: inherit,
        type,
        levels,
      },
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addLevel = () => {
    const nextOrder = Math.max(0, ...levels.map((l) => l.order)) + 1
    setLevels((prev) => [
      ...prev,
      {
        id: `level-${Date.now()}`,
        name: '',
        order: nextOrder,
        minSalary: undefined,
        maxSalary: undefined,
        criteria: '',
      },
    ])
  }

  const removeLevel = (index: number) => {
    setLevels((prev) => prev.filter((_, i) => i !== index))
  }

  const updateLevel = (index: number, patch: Partial<GradeLevel>) => {
    setLevels((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    )
  }

  return (
    <Box>
      <Box className={styles.tabSection}>
        <Flex align="center" gap="3" mb="3">
          <Text size="2" weight="bold">Наследовать от родителя</Text>
          <Switch checked={inherit} onCheckedChange={setInherit} />
        </Flex>
        {inherit && (
          <Text size="2" color="gray">
            Используется система грейдирования родительской специализации. Изменить можно, отключив переключатель.
          </Text>
        )}
      </Box>

      {!inherit && (
        <>
          <Box className={styles.tabSection}>
            <Text size="2" weight="bold" className={styles.tabSectionTitle}>
              Тип градации
            </Text>
            <Flex gap="2">
              <Button
                variant={type === 'grades' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setType('grades')}
              >
                Грейды
              </Button>
              <Button
                variant={type === 'streams' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setType('streams')}
              >
                Стримы
              </Button>
              <Button
                variant={type === 'hybrid' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setType('hybrid')}
              >
                Гибрид
              </Button>
            </Flex>
          </Box>

          <Box className={styles.tabSection}>
            <Flex justify="between" align="center" mb="2">
              <Text size="2" weight="bold" className={styles.tabSectionTitle}>
                Уровни (Grades)
              </Text>
              <Button variant="soft" size="1" onClick={addLevel}>
                <PlusIcon width={14} height={14} />
                Добавить уровень
              </Button>
            </Flex>
            {levels.map((level, i) => (
              <Box
                key={level.id}
                mb="4"
                p="3"
                style={{
                  border: '1px solid var(--gray-a6)',
                  borderRadius: 8,
                  backgroundColor: 'var(--gray-a2)',
                }}
              >
                <Flex justify="between" align="center" mb="2">
                  <Text size="2" weight="bold">
                    {i + 1}. {level.name || 'Новый уровень'}
                  </Text>
                  <Button
                    variant="ghost"
                    color="red"
                    size="1"
                    onClick={() => removeLevel(i)}
                  >
                    <Cross2Icon width={14} height={14} />
                  </Button>
                </Flex>
                <TextField.Root
                  placeholder="Название (например: Junior, Middle)"
                  value={level.name}
                  onChange={(e) => updateLevel(i, { name: e.target.value })}
                  mb="2"
                  color={errors[`level_${i}_name`] ? 'red' : undefined}
                />
                {errors[`level_${i}_name`] && (
                  <Text size="1" color="red" mb="2">{errors[`level_${i}_name`]}</Text>
                )}
                <Flex gap="2" mb="2">
                  <TextField.Root
                    type="number"
                    placeholder="Min, $"
                    value={level.minSalary ?? ''}
                    onChange={(e) =>
                      updateLevel(i, {
                        minSalary: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                  <TextField.Root
                    type="number"
                    placeholder="Max, $"
                    value={level.maxSalary ?? ''}
                    onChange={(e) =>
                      updateLevel(i, {
                        maxSalary: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </Flex>
                {errors[`level_${i}_range`] && (
                  <Text size="1" color="red" mb="2">{errors[`level_${i}_range`]}</Text>
                )}
                <TextArea
                  placeholder="Критерии входа, ожидания..."
                  value={level.criteria ?? ''}
                  onChange={(e) => updateLevel(i, { criteria: e.target.value })}
                  rows={2}
                />
              </Box>
            ))}
          </Box>

          <Flex gap="3" mt="4">
            <Button variant="solid" onClick={handleSave}>
              {saved ? 'Сохранено' : 'Сохранить'}
            </Button>
          </Flex>
        </>
      )}
    </Box>
  )
}
