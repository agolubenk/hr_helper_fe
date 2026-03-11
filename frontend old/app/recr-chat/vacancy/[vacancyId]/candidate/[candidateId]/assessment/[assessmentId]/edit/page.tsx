/**
 * EditAssessmentPage (recr-chat/.../assessment/[assessmentId]/edit/page.tsx) — Страница редактирования оценки
 *
 * Назначение:
 * - Редактирование ранее сохранённой оценки кандидата (баллы по компетенциям по блокам)
 * - Доступно в течение EDIT_WINDOW_HOURS часов с момента проведения оценки
 *
 * Функциональность:
 * - Те же блоки и шкала оценок, что и на странице создания: getRatingScaleForSpec(specId, 'technical')
 * - Форма по блокам с Select по шкале и кнопкой «Скриншот»
 * - При превышении времени редактирования отображается сообщение о недоступности
 *
 * Связи:
 * - lib/ratingScale: шкала по специализации вакансии
 * - VACANCY_SPEC_ID: мок связи вакансия → специализация
 *
 * Поведение:
 * - Варианты оценок подтягиваются из настроек (шкала из матрицы специализации вакансии)
 */

'use client'

import { useParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Button, Card, Select } from '@radix-ui/themes'
import { UploadIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { getRatingScaleForSpec } from '@/lib/ratingScale'

/** Окно редактирования оценки (например 15 часов с момента создания) */
const EDIT_WINDOW_HOURS = 15

/** Связь вакансия → специализация (шкала из матрицы). Пока мок. */
const VACANCY_SPEC_ID: Record<string, string> = {
  '1': 'frontend',
  '2': 'frontend-legacy',
  '3': 'frontend-product',
}

const ASSESSMENT_BLOCKS: { id: string; name: string; competencies: { id: string; name: string }[] }[] = [
  { id: 'tb1', name: 'JS / TypeScript', competencies: [{ id: '1', name: 'JavaScript/TypeScript' }] },
  { id: 'tb2', name: 'React', competencies: [{ id: '2', name: 'React Core (hooks, context)' }, { id: '3', name: 'State Management' }] },
  { id: 'tb3', name: 'Стили и сборка', competencies: [{ id: '4', name: 'CSS/Styling' }] },
  { id: 'bb1', name: 'Автономность и ответственность', competencies: [{ id: 'b1', name: 'Автономность' }, { id: 'b2', name: 'Mentorship' }, { id: 'b3', name: 'Ownership' }] },
]

/**
 * Страница редактирования результата оценки.
 * Варианты оценок подтягиваются из шкалы, выбранной в матрице специализации, связанной с вакансией.
 */
export default function EditAssessmentPage() {
  const params = useParams()
  const vacancyId = (params?.vacancyId as string) ?? ''
  const candidateId = (params?.candidateId as string) ?? ''
  const assessmentId = (params?.assessmentId as string) ?? ''

  const backUrl = `/recr-chat/vacancy/${vacancyId}/candidate/${candidateId}`

  const specId = VACANCY_SPEC_ID[vacancyId] ?? 'frontend'
  const ratingScale = useMemo(() => getRatingScaleForSpec(specId, 'technical'), [specId])
  const scaleOptions = useMemo(() => [...ratingScale.options].sort((a, b) => a.order - b.order), [ratingScale])

  const [scoresByCompetencyId, setScoresByCompetencyId] = useState<Record<string, string>>({})

  const setScore = (competencyId: string, value: string) => {
    setScoresByCompetencyId((prev) => ({ ...prev, [competencyId]: value }))
  }

  // TODO: по assessmentId загрузить conductedAt; проверить, что прошло не более EDIT_WINDOW_HOURS
  const conductedAt = new Date()
  const now = new Date()
  const hoursSince = (now.getTime() - conductedAt.getTime()) / (1000 * 60 * 60)
  const canEdit = hoursSince <= EDIT_WINDOW_HOURS

  return (
    <AppLayout pageTitle="Редактирование оценки">
      <Box p="4">
        <Flex gap="3" mb="4" align="center">
          <Button variant="soft" size="1" asChild>
            <Link href={backUrl}>← К карточке кандидата</Link>
          </Button>
          <Button variant="soft" size="1" asChild>
            <Link href={`${backUrl}/assessment/${assessmentId}`}>Просмотр</Link>
          </Button>
        </Flex>
        <Card size="2">
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold">Редактирование оценки</Text>
            <Text size="2" color="gray">
              Вакансия: {vacancyId} · Кандидат: {candidateId} · Оценка: {assessmentId}
            </Text>
            {!canEdit ? (
              <Box p="3" style={{ backgroundColor: 'var(--red-3)', borderRadius: 8 }}>
                <Text size="2">
                  Редактирование недоступно: прошло более {EDIT_WINDOW_HOURS} часов с момента проведения оценки.
                </Text>
              </Box>
            ) : (
              <>
                <Text size="2" color="gray">
                  Осталось времени на редактирование: до {EDIT_WINDOW_HOURS} часов. Шкала оценок из матрицы специализации.
                </Text>
                <Flex align="center" gap="2" wrap="wrap">
                  <Text size="2" color="gray">Шкала:</Text>
                  <Text size="2" weight="medium">{ratingScale.name}</Text>
                  <Button size="1" variant="ghost" asChild>
                    <Link href={`/specializations/${specId}/matrix`} target="_blank">Изменить в матрице</Link>
                  </Button>
                </Flex>
                <Text size="2" weight="medium" mt="2">Компетенции по блокам</Text>
                {ASSESSMENT_BLOCKS.map((block) => (
                  <Box key={block.id} style={{ border: '1px solid var(--gray-a6)', borderRadius: 8, overflow: 'hidden' }}>
                    <Box p="2" style={{ backgroundColor: 'var(--gray-a3)' }}>
                      <Text size="2" weight="bold">{block.name}</Text>
                    </Box>
                    <Flex direction="column" gap="0">
                      {block.competencies.map((comp) => (
                        <Flex key={comp.id} align="center" gap="3" p="2" style={{ borderTop: '1px solid var(--gray-a5)' }}>
                          <Text size="2" style={{ minWidth: 200 }}>{comp.name}</Text>
                          <Select.Root value={scoresByCompetencyId[comp.id] ?? ''} onValueChange={(value) => setScore(comp.id, value)}>
                            <Select.Trigger placeholder="Оценка" style={{ width: 140 }} />
                            <Select.Content>
                              {scaleOptions.map((opt) => (
                                <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
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
              </>
            )}
          </Flex>
        </Card>
      </Box>
    </AppLayout>
  )
}
