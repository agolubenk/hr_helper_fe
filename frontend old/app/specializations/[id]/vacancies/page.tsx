/**
 * SpecializationVacanciesPage (specializations/[id]/vacancies/page.tsx) — Вакансии по специализации
 *
 * Назначение: список вакансий, привязанных к выбранной специализации (мок MOCK_VACANCIES), с фильтром и колонками (грейд, проект, tech match, кандидаты, статус).
 * Связи: useSpecializations (selectedNode).
 */

'use client'

import { useState } from 'react'
import { Box, Flex, Text, Button, Table, Badge, TextField } from '@radix-ui/themes'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useSpecializations } from '../../context/SpecializationsContext'
import styles from '../../specializations.module.css'

const MOCK_VACANCIES = [
  { id: '142', name: 'React Dev #142', grade: 'Middle', project: 'Alpha', techMatch: 95, candidates: 12, inPipeline: 3, status: 'Active' },
  { id: '156', name: 'Frontend #156', grade: 'Senior', project: 'Beta', techMatch: 60, candidates: 5, inPipeline: 1, status: 'On Hold' },
  { id: '160', name: 'Frontend Junior #160', grade: 'Junior', project: 'Alpha', techMatch: 100, candidates: 8, inPipeline: 2, status: 'Active' },
]

export default function SpecializationVacanciesPage() {
  const { selectedNode } = useSpecializations()
  const [filter, setFilter] = useState('')

  if (!selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Выберите специализацию в левой панели.</Text>
      </Box>
    )
  }

  const filtered = filter.trim()
    ? MOCK_VACANCIES.filter(
        (v) =>
          v.name.toLowerCase().includes(filter.toLowerCase()) ||
          v.grade.toLowerCase().includes(filter.toLowerCase()) ||
          v.project.toLowerCase().includes(filter.toLowerCase())
      )
    : MOCK_VACANCIES

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="2" weight="bold">Связи с вакансиями</Text>
        <Button variant="soft">Создать вакансии по шаблону</Button>
      </Flex>

      <TextField.Root
        placeholder="Поиск по вакансии, грейду, проекту..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mb="4"
      >
        <TextField.Slot>
          <MagnifyingGlassIcon width={16} height={16} />
        </TextField.Slot>
      </TextField.Root>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Проект</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Tech Match</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Кандидатов</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filtered.map((v) => (
            <Table.Row key={v.id}>
              <Table.Cell>
                <Text weight="medium">{v.name}</Text>
              </Table.Cell>
              <Table.Cell>{v.grade}</Table.Cell>
              <Table.Cell>{v.project}</Table.Cell>
              <Table.Cell>
                {v.techMatch >= 90 ? (
                  <Badge color="green">{v.techMatch}% ✓</Badge>
                ) : v.techMatch >= 70 ? (
                  <Badge color="yellow">{v.techMatch}%</Badge>
                ) : (
                  <Badge color="red">{v.techMatch}% ⚠️</Badge>
                )}
              </Table.Cell>
              <Table.Cell>
                {v.candidates} → {v.inPipeline}
              </Table.Cell>
              <Table.Cell>
                <Badge color={v.status === 'Active' ? 'green' : 'gray'}>{v.status}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Button variant="ghost" size="1">
                  Открыть
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {filtered.length === 0 && (
        <Text size="2" color="gray" mt="4">
          Нет вакансий по выбранной специализации или по фильтру.
        </Text>
      )}
    </Box>
  )
}
