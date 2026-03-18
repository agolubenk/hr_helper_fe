'use client'

import { Box, Table } from "@radix-ui/themes"
import RequestTableRow from "./RequestTableRow"
import styles from './RequestsTable.module.css'

interface Request {
  id: number
  title: string
  grade: string
  project: string | null
  recruiter: string
  recruiterDays: number
  status: 'planned' | 'in_process' | 'cancelled' | 'closed'
  statusDate?: string
  startDate: string
  endDate: string
  isOverdue?: boolean
  factDays: number
  slaDays: number
  slaStatus: 'normal' | 'risk' | 'overdue' | 'on_time'
  t2hDays?: number
  t2hSlaDays?: number
  candidate?: {
    name: string
    id: string
  }
}

export const REQUEST_TABLE_COLUMN_IDS = ['vacancyGrade', 'project', 'recruiter', 'status', 'dates', 'factSla', 't2hSla', 'candidate', 'actions'] as const

interface RequestsTableProps {
  requests: Request[]
  visibleColumns?: Record<string, boolean>
  columnOrder?: string[]
  onView?: (id: number) => void
  onEdit?: (id: number) => void
}

export const COLUMN_HEADERS: { id: string; label: string }[] = [
  { id: 'vacancyGrade', label: 'Вакансия / Грейд' },
  { id: 'project', label: 'Проект' },
  { id: 'recruiter', label: 'Рекрутер' },
  { id: 'status', label: 'Статус' },
  { id: 'dates', label: 'Сроки' },
  { id: 'factSla', label: 'Факт/SLA' },
  { id: 't2hSla', label: 'T2H | SLA' },
  { id: 'candidate', label: 'Кандидат' },
  { id: 'actions', label: 'Действия' },
]

export default function RequestsTable({ requests, visibleColumns, columnOrder, onView, onEdit }: RequestsTableProps) {
  const isVisible = (id: string) => visibleColumns == null || visibleColumns[id] !== false
  const orderedIds = columnOrder?.length ? columnOrder : COLUMN_HEADERS.map(c => c.id)
  const visibleOrderedIds = orderedIds.filter(id => isVisible(id))
  const idToLabel = (id: string) => COLUMN_HEADERS.find(c => c.id === id)?.label ?? id

  const sortedRequests = [...requests].sort((a, b) => b.id - a.id)

  return (
    <Box className={styles.tableContainer}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            {visibleOrderedIds.map(id => (
              <Table.ColumnHeaderCell key={id}>{idToLabel(id)}</Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedRequests.map((request) => (
            <RequestTableRow
              key={request.id}
              request={request}
              visibleColumns={visibleColumns}
              columnOrder={columnOrder}
              onView={onView}
              onEdit={onEdit}
            />
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}
