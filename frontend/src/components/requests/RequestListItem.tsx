/**
 * RequestListItem (components/requests/RequestListItem.tsx) - Компонент элемента списка заявки на найм (режим "Список")
 * 
 * Назначение:
 * - Отображение информации о заявке на найм в виде элемента списка
 * - Используется в режиме отображения "Список" на странице заявок
 * - Поддержка группировки нескольких заявок в один элемент списка
 * 
 * Функциональность:
 * - Заголовок, статус, приоритет и ID заявки в первой строке
 * - Информация об отделе, рекрутере, количестве кандидатов, дате и предупреждениях во второй строке
 * - Кнопка разворота для отображения детальной таблицы (если есть данные)
 * - Кнопки действий: просмотр и редактирование
 * - Развернутая таблица с детальной информацией (для одной заявки или группы заявок)
 * 
 * Связи:
 * - hiring-requests/page.tsx: используется в режиме отображения "Список"
 * - hiring-requests/[id]/page.tsx: переход к детальному просмотру при клике
 * - hiring-requests/[id]/edit/page.tsx: переход к редактированию при клике на кнопку редактирования
 * - RequestTableRowExpanded: компонент строки развернутой таблицы
 * 
 * Поведение:
 * - При клике на элемент списка (если передан onClick) - переход к детальному просмотру
 * - При клике на кнопку разворота - раскрывает/сворачивает детальную таблицу
 * - При клике на кнопку просмотра - переход к детальному просмотру
 * - При клике на кнопку редактирования - переход к редактированию
 * - stopPropagation предотвращает всплытие событий от кнопок к элементу списка
 * 
 * Группировка заявок:
 * - Если передано несколько заявок (requests), они отображаются в одной таблице
 * - Таблица развернута по умолчанию для группы заявок
 * - Каждая заявка в группе отображается отдельной строкой в таблице
 * 
 * Отличия от RequestCard:
 * - Горизонтальное расположение информации (вместо вертикального)
 * - Компактное отображение (все в одной строке)
 * - Поддержка развернутой таблицы с детальной информацией
 */
'use client'

import { Box, Flex, Text, Button, Table } from "@radix-ui/themes"
import { PersonIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useRouter } from "@/router-adapter"
import RequestTableRowExpanded from "./RequestTableRowExpanded"
import { COLUMN_HEADERS } from "./RequestsTable"
import styles from './RequestListItem.module.css'

/**
 * Request - интерфейс данных заявки на найм
 * 
 * Структура:
 * - id: уникальный идентификатор заявки
 * - title: название заявки
 * - status: статус заявки
 * - department: отдел
 * - recruiter: имя рекрутера
 * - priority: приоритет заявки
 * - technologies: массив технологий
 * - candidates: количество кандидатов
 * - date: дата заявки (опционально)
 * - hasWarning: флаг наличия предупреждения
 * - warningText: текст предупреждения (опционально)
 * - Дополнительные поля для таблицы (опционально): grade, project, recruiterDays, statusDate, startDate, endDate, isOverdue, factDays, slaDays, slaStatus, t2hDays, t2hSlaDays, candidate
 */
interface Request {
  id: number
  title: string
  status: 'pending' | 'approved' | 'rejected' | 'closed' | 'in_process' | 'planned' | 'cancelled'
  department: string
  recruiter: string
  priority: 'high' | 'medium' | 'low'
  technologies: string[]
  candidates: number
  date: string | null
  hasWarning: boolean
  warningText?: string
  // Дополнительные поля для таблицы
  grade?: string
  project?: string | null
  recruiterDays?: number
  statusDate?: string
  startDate?: string
  endDate?: string
  isOverdue?: boolean
  factDays?: number
  slaDays?: number
  slaStatus?: 'normal' | 'risk' | 'overdue' | 'on_time'
  t2hDays?: number
  t2hSlaDays?: number
  candidate?: {
    name: string
    id: string
  }
}

/**
 * RequestListItemProps - интерфейс пропсов компонента RequestListItem
 * 
 * Структура:
 * - request: данные заявки для отображения (основная заявка)
 * - onClick: обработчик клика на элемент списка (переход к детальному просмотру)
 * - requestsCount: количество заявок в группе (опционально)
 * - requests: массив заявок для группировки (опционально, если передано - отображаются все в таблице)
 */
interface RequestListItemProps {
  request: Request
  onClick?: () => void
  requestsCount?: number
  requests?: Request[]
  visibleColumns?: Record<string, boolean>
  columnOrder?: string[]
}

/**
 * RequestListItem - компонент элемента списка заявки на найм
 * 
 * Состояние:
 * - isExpanded: флаг раскрытости детальной таблицы
 * 
 * Функциональность:
 * - Отображает информацию о заявке в виде элемента списка
 * - Поддерживает группировку нескольких заявок
 * - Управляет раскрытием/сворачиванием детальной таблицы
 */
export default function RequestListItem({ request, onClick, requestsCount, requests, visibleColumns, columnOrder }: RequestListItemProps) {
  const isColumnVisible = (id: string) => visibleColumns == null || visibleColumns[id] !== false
  const orderedIds = columnOrder?.length ? columnOrder : COLUMN_HEADERS.map(c => c.id)
  const visibleHeaders = orderedIds
    .filter(id => isColumnVisible(id))
    .map(id => {
      const defaultLabel = COLUMN_HEADERS.find(c => c.id === id)?.label ?? id
      const label = id === 'vacancyGrade' ? 'Грейд' : defaultLabel
      return { id, label }
    })
  const router = useRouter()
  // Если переданы несколько заявок, показываем их в таблице (развернута по умолчанию)
  const hasMultipleRequests = requests && requests.length > 1
  // Флаг раскрытости детальной таблицы (по умолчанию развернута для группы заявок)
  const [isExpanded, setIsExpanded] = useState(hasMultipleRequests || false)

  /**
   * getStatusLabel - получение текстового представления статуса
   * 
   * Функциональность:
   * - Преобразует код статуса в читаемый текст
   * 
   * @param status - код статуса
   * @returns текстовое представление статуса
   */
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Планируется'
      case 'in_process': return 'В процессе'
      case 'cancelled': return 'Отменена'
      case 'closed': return 'Закрыта'
      default: return status
    }
  }

  /**
   * getPriorityLabel - получение текстового представления приоритета
   * 
   * Функциональность:
   * - Преобразует код приоритета в читаемый текст
   * 
   * @param priority - код приоритета
   * @returns текстовое представление приоритета
   */
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий'
      case 'medium': return 'Средний'
      case 'low': return 'Низкий'
      default: return priority
    }
  }

  /**
   * hasTableData - проверка наличия данных для детальной таблицы
   * 
   * Функциональность:
   * - Проверяет наличие всех необходимых полей для отображения детальной таблицы
   * 
   * Используется для:
   * - Определения, нужно ли показывать кнопку разворота и таблицу
   */
  const hasTableData = request.grade && request.startDate && request.endDate && request.factDays && request.slaDays
  /**
   * shouldShowExpandButton - определение необходимости показа кнопки разворота
   * 
   * Функциональность:
   * - Показываем кнопку разворота если есть данные для таблицы (для одиночных заявок)
   * - Или если это группа заявок и хотя бы у одной есть данные для таблицы
   * 
   * Используется для:
   * - Условного отображения кнопки разворота детальной таблицы
   */
  const shouldShowExpandButton = hasTableData || (hasMultipleRequests && requests && requests.some(r => r.grade && r.startDate && r.endDate && r.factDays && r.slaDays))

  return (
    <Box className={styles.requestListItem}>
      <Flex justify="between" align="center" gap="4">
        {/* Левая часть - информация */}
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <Flex align="center" gap="3">
            <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
              {request.title}
            </Text>
            <Box 
              className={`${styles.statusTag} ${
                request.status === 'planned' ? styles.statusPlanned :
                request.status === 'in_process' ? styles.statusInProcess :
                request.status === 'cancelled' ? styles.statusCancelled :
                request.status === 'closed' ? styles.statusClosed :
                styles.statusPending
              }`}
            >
              <Text size="1" weight="bold">
                {getStatusLabel(request.status)}
              </Text>
            </Box>
            <Box 
              className={`${styles.priorityTag} ${
                request.priority === 'high' ? styles.priorityHigh :
                request.priority === 'medium' ? styles.priorityMedium :
                styles.priorityLow
              }`}
            >
              <Text size="1" weight="bold">
                {getPriorityLabel(request.priority)}
              </Text>
            </Box>
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              # {request.id}
            </Text>
          </Flex>

          <Flex align="center" gap="4" wrap="wrap">
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              {request.department}
            </Text>
            <Flex align="center" gap="2">
              <PersonIcon width={16} height={16} />
              <Text size="2">• {request.recruiter}</Text>
            </Flex>

            {requestsCount !== undefined && (
              <Flex align="center" gap="2">
                <Text size="2" style={{ color: 'var(--gray-11)' }}>
                  Заявок: {requestsCount}
                </Text>
              </Flex>
            )}

            <Flex align="center" gap="2">
              <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                👥
              </Box>
              <Text size="2">{request.candidates} кандидатов</Text>
            </Flex>

            {request.date && (
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                Дата: {request.date}
              </Text>
            )}

            {request.hasWarning && (
              <Flex align="center" gap="2">
                <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
                <Text size="2" style={{ color: '#f59e0b' }}>
                  {request.warningText}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Правая часть - только кнопка разворота; просмотр и редактирование доступны в строках развёрнутой таблицы */}
        <Flex gap="2" className={styles.actionButtons}>
          {shouldShowExpandButton && (
            <Button 
              variant="ghost" 
              size="1" 
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronUpIcon width={16} height={16} />
              ) : (
                <ChevronDownIcon width={16} height={16} />
              )}
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Развернутая таблица - для одной заявки (с кнопкой развернуть) */}
      {!hasMultipleRequests && isExpanded && hasTableData && (
        <Box mt="3" className={styles.expandedTable}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                {visibleHeaders.map(c => (
                  <Table.ColumnHeaderCell key={c.id}>{c.label}</Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <RequestTableRowExpanded 
                request={request as any}
                visibleColumns={visibleColumns}
                columnOrder={columnOrder}
                onView={onClick}
                onEdit={onClick}
              />
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Таблица для нескольких заявок (разворачивается/сворачивается) */}
      {hasMultipleRequests && requests && isExpanded && (
        <Box mt="3" className={styles.expandedTable}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                {visibleHeaders.map(c => (
                  <Table.ColumnHeaderCell key={c.id}>{c.label}</Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {requests.map((req) => (
                <RequestTableRowExpanded 
                  key={req.id}
                  request={req as any}
                  visibleColumns={visibleColumns}
                  columnOrder={columnOrder}
                  onView={() => router.push(`/hiring-requests/${req.id}`)}
                  onEdit={() => router.push(`/hiring-requests/${req.id}/edit`)}
                />
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  )
}
