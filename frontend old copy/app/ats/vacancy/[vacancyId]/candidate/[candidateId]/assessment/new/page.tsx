/**
 * NewAssessmentPage (ats/.../assessment/new/page.tsx) — Страница создания новой оценки кандидата
 *
 * Назначение:
 * - Ввод баллов по компетенциям по блокам (как в матрице специализации)
 * - Варианты оценок берутся из шкалы, выбранной в матрице специализации, связанной с вакансией
 *
 * Функциональность:
 * - Отображение блоков компетенций (JS/TypeScript, React, Стили и сборка, Автономность и ответственность)
 * - В каждом блоке: компетенции с Select по шкале оценок и кнопка «Скриншот»
 * - Шкала: getRatingScaleForSpec(specId, 'technical'), specId из VACANCY_SPEC_ID[vacancyId] (пока мок)
 * - Ссылка на матрицу специализации для контекста
 *
 * Связи:
 * - lib/ratingScale: getRatingScaleForSpec — шкала по специализации (выбор из матрицы сохраняется в localStorage)
 * - Вакансия → специализация: VACANCY_SPEC_ID (далее — из API вакансии)
 *
 * Поведение:
 * - При загрузке подставляется шкала для specId вакансии; варианты в селектах — пункты этой шкалы
 */

'use client'

import { useParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Button, Card, Select } from '@radix-ui/themes'
import { ArrowLeftIcon, UploadIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { getRatingScaleForSpec } from '@/lib/ratingScale'

/** Связь вакансия → специализация (для подтягивания шкалы из матрицы). Пока мок; далее — из API вакансии. */
const VACANCY_SPEC_ID: Record<string, string> = {
  '1': 'frontend',
  '2': 'frontend-legacy',
  '3': 'frontend-product',
}

/** Блок компетенций (как в матрице специализации) */
interface AssessmentBlock {
  id: string
  name: string
  competencies: { id: string; name: string }[]
}

/** Мок блоков по аналогии с матрицей: технические + поведенческие */
const ASSESSMENT_BLOCKS: AssessmentBlock[] = [
  {
    id: 'tb1',
    name: 'JS / TypeScript',
    competencies: [{ id: '1', name: 'JavaScript/TypeScript' }],
  },
  {
    id: 'tb2',
    name: 'React',
    competencies: [
      { id: '2', name: 'React Core (hooks, context)' },
      { id: '3', name: 'State Management' },
    ],
  },
  {
    id: 'tb3',
    name: 'Стили и сборка',
    competencies: [{ id: '4', name: 'CSS/Styling' }],
  },
  {
    id: 'bb1',
    name: 'Автономность и ответственность',
    competencies: [
      { id: 'b1', name: 'Автономность' },
      { id: 'b2', name: 'Mentorship' },
      { id: 'b3', name: 'Ownership' },
    ],
  },
]

/**
 * Страница создания новой оценки (результатов по матрице компетенций).
 * Оценки сгруппированы по блокам; шкала оценок берётся из настроек компании.
 */
export default function NewAssessmentPage() {
  const params = useParams()
  const vacancyId = (params?.vacancyId as string) ?? ''
  const candidateId = (params?.candidateId as string) ?? ''

  const backUrl = `/ats/vacancy/${vacancyId}/candidate/${candidateId}`

  const specId = VACANCY_SPEC_ID[vacancyId] ?? 'frontend'
  const ratingScale = useMemo(() => getRatingScaleForSpec(specId, 'technical'), [specId])
  const scaleOptions = useMemo(() => [...ratingScale.options].sort((a, b) => a.order - b.order), [ratingScale])

  const [scoresByCompetencyId, setScoresByCompetencyId] = useState<Record<string, string>>({})

  const setScore = (competencyId: string, value: string) => {
    setScoresByCompetencyId((prev) => ({ ...prev, [competencyId]: value }))
  }

  const handleSubmit = () => {
    // TODO: сохранить оценку через API
    console.log('Assessment scores', scoresByCompetencyId)
  }

  return (
    <AppLayout pageTitle="Новая оценка">
      <Box p="4">
        <Flex gap="3" mb="4" align="center">
          <Button variant="soft" size="1" asChild>
            <Link href={backUrl}>
              <ArrowLeftIcon width={14} height={14} />
              К карточке кандидата
            </Link>
          </Button>
        </Flex>
        <Card size="2">
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold">
              Создание оценки
            </Text>
            <Text size="2" color="gray">
              Вакансия: {vacancyId} · Кандидат: {candidateId}
            </Text>
            <Flex align="center" gap="2" wrap="wrap">
              <Text size="2" color="gray">
                Шкала оценок:
              </Text>
              <Text size="2" weight="medium">
                {ratingScale.name}
              </Text>
              <Button size="1" variant="ghost" asChild>
                <Link href="/company-settings/rating-scales" target="_blank">
                  Настроить шкалы
                </Link>
              </Button>
            </Flex>
            <Button
              size="2"
              variant="soft"
              asChild
            >
              <Link
                href={`/specializations/${specId}/matrix?candidate_id=${candidateId}&vacancy_id=${vacancyId}`}
                target="_blank"
              >
                Открыть матрицу специализации
              </Link>
            </Button>

            <Text size="2" color="gray">
              Заполните баллы по компетенциям по блокам. К каждому полю можно прикрепить скриншот.
            </Text>

            {ASSESSMENT_BLOCKS.map((block) => (
              <Box key={block.id} style={{ border: '1px solid var(--gray-a6)', borderRadius: 8, overflow: 'hidden' }}>
                <Box p="2" style={{ backgroundColor: 'var(--gray-a3)' }}>
                  <Text size="2" weight="bold">
                    {block.name}
                  </Text>
                </Box>
                <Flex direction="column" gap="0">
                  {block.competencies.map((comp) => (
                    <Flex
                      key={comp.id}
                      align="center"
                      gap="3"
                      p="2"
                      style={{
                        borderTop: '1px solid var(--gray-a5)',
                      }}
                    >
                      <Text size="2" style={{ minWidth: 200 }}>
                        {comp.name}
                      </Text>
                      <Select.Root
                        value={scoresByCompetencyId[comp.id] ?? ''}
                        onValueChange={(value) => setScore(comp.id, value)}
                      >
                        <Select.Trigger placeholder="Оценка" style={{ width: 140 }} />
                        <Select.Content>
                          {scaleOptions.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                      <Button size="1" variant="soft">
                        <UploadIcon width={14} height={14} />
                        Скриншот
                      </Button>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            ))}

            <Flex gap="2" justify="end" mt="2">
              <Button variant="soft" asChild>
                <Link href={backUrl}>Отмена</Link>
              </Button>
              <Button onClick={handleSubmit}>Сохранить оценку</Button>
            </Flex>
          </Flex>
        </Card>
      </Box>
    </AppLayout>
  )
}
