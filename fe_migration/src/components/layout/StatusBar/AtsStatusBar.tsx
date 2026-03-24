/**
 * StatusBar для страницы ats — логика и вёрстка как в `frontend/src/shared/components/layout/StatusBar/AtsStatusBar`.
 * vacancySelector: выпадающий список вакансий; statusesScroll: «Все», пиллы этапов, группа «N этапов без кандидатов».
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Box, Flex, Text, Badge, DropdownMenu, Button } from '@radix-ui/themes'
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import styles from './AtsStatusBar.module.css'

export const ATS_STATUS_CHANGE_EVENT = 'atsStatusChange'
export const ATS_STATUS_COUNTS_EVENT = 'atsStatusCountsUpdate'

const DEFAULT_VACANCIES = [
  { id: '1', title: 'Frontend Senior' },
  { id: '2', title: 'Backend Developer' },
  { id: '3', title: 'Product Designer' },
  { id: '4', title: 'DevOps Engineer' },
  { id: '5', title: 'Data Engineer' },
  { id: '6', title: 'QA Lead' },
]

/** Мок-счётчики до подключения API; перезаписываются событием `ATS_STATUS_COUNTS_EVENT` или пропом `statusCounts`. */
const DEMO_STATUS_COUNTS: Record<string, number> = {
  New: 5,
  'Under Review': 3,
  Message: 0,
  Contact: 0,
  'HR Screening': 0,
  'Test Task': 0,
  'Final Interview': 0,
  Decision: 0,
  Interview: 8,
  Offer: 2,
  Accepted: 1,
  Rejected: 4,
  Declined: 2,
  Archived: 12,
}

interface AtsStatusBarProps {
  selectedStatus?: string | null
  onStatusChange?: (status: string | null) => void
  statusCounts?: Record<string, number>
}

const getDefaultStatuses = (counts: Record<string, number>) => [
  { id: 'New', label: 'New', color: '#2180A0', count: counts['New'] ?? 0 },
  { id: 'Under Review', label: 'Under Review', color: '#F59E0B', count: counts['Under Review'] ?? 0 },
  { id: 'Message', label: 'Message', color: '#6366F1', count: counts['Message'] ?? 0 },
  { id: 'Contact', label: 'Contact', color: '#8B5CF6', count: counts['Contact'] ?? 0 },
  { id: 'HR Screening', label: 'HR Screening', color: '#A855F7', count: counts['HR Screening'] ?? 0 },
  { id: 'Test Task', label: 'Test Task', color: '#C084FC', count: counts['Test Task'] ?? 0 },
  { id: 'Final Interview', label: 'Final Interview', color: '#D946EF', count: counts['Final Interview'] ?? 0 },
  { id: 'Decision', label: 'Decision', color: '#EC4899', count: counts['Decision'] ?? 0 },
  { id: 'Interview', label: 'Interview', color: '#8B5CF6', count: counts['Interview'] ?? 0 },
  { id: 'Offer', label: 'Offer', color: '#10B981', count: counts['Offer'] ?? 0 },
  { id: 'Accepted', label: 'Accepted', color: '#059669', count: counts['Accepted'] ?? 0 },
  { id: 'Rejected', label: 'Rejected', color: '#EF4444', count: counts['Rejected'] ?? 0 },
  { id: 'Declined', label: 'Declined', color: '#6B7280', count: counts['Declined'] ?? 0 },
  { id: 'Archived', label: 'Archived', color: '#9CA3AF', count: counts['Archived'] ?? 0 },
]

type StatusGroup = {
  type: 'group'
  statuses: Array<{ id: string; label: string; color: string; count?: number }>
  groupId: string
}

type StatusItem = {
  type: 'status'
  status: { id: string; label: string; color: string; count?: number }
}

export function AtsStatusBar({ selectedStatus: propSelectedStatus, onStatusChange, statusCounts: propStatusCounts }: AtsStatusBarProps) {
  const [selectedVacancy, setSelectedVacancy] = useState(DEFAULT_VACANCIES[0]?.id ?? '__my__')
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [localSelectedStatus, setLocalSelectedStatus] = useState<string | null>(null)
  const [localStatusCounts, setLocalStatusCounts] = useState<Record<string, number>>(DEMO_STATUS_COUNTS)

  const selectedStatus = propSelectedStatus !== undefined ? propSelectedStatus : localSelectedStatus
  const statusCounts = propStatusCounts ?? localStatusCounts

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleCountsUpdate = (e: CustomEvent<Record<string, number>>) => {
      setLocalStatusCounts(e.detail)
    }

    window.addEventListener(ATS_STATUS_COUNTS_EVENT, handleCountsUpdate as EventListener)
    return () => window.removeEventListener(ATS_STATUS_COUNTS_EVENT, handleCountsUpdate as EventListener)
  }, [])

  const myVacancies = DEFAULT_VACANCIES.slice(0, 2)

  const triggerLabel =
    selectedVacancy === '__all__'
      ? 'Все'
      : selectedVacancy === '__my__'
        ? 'Мои'
        : DEFAULT_VACANCIES.find((v) => v.id === selectedVacancy)?.title ?? 'Выберите вакансию'

  const statuses = useMemo(() => getDefaultStatuses(statusCounts), [statusCounts])

  const groupedStatuses = useMemo(() => {
    const result: Array<StatusGroup | StatusItem> = []
    let currentGroup: Array<{ id: string; label: string; color: string; count?: number }> = []

    const flushInactiveRun = (indexAtFlush: number) => {
      if (currentGroup.length === 0) return
      if (currentGroup.length === 1) {
        result.push({ type: 'status', status: currentGroup[0] })
      } else {
        result.push({
          type: 'group',
          statuses: [...currentGroup],
          groupId: `group-${indexAtFlush - currentGroup.length}`,
        })
      }
      currentGroup = []
    }

    statuses.forEach((status, index) => {
      const isActive = status.count !== undefined && status.count > 0

      if (!isActive) {
        currentGroup.push(status)
      } else {
        flushInactiveRun(index)
        result.push({ type: 'status', status })
      }
    })

    flushInactiveRun(statuses.length)

    return result
  }, [statuses])

  const handleStatusClick = useCallback((statusId: string) => {
    const newStatus = statusId === '' || selectedStatus === statusId ? null : statusId

    if (onStatusChange) {
      onStatusChange(newStatus)
    } else {
      setLocalSelectedStatus(newStatus)
      window.dispatchEvent(new CustomEvent(ATS_STATUS_CHANGE_EVENT, { detail: newStatus }))
    }
  }, [selectedStatus, onStatusChange])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  return (
    <Box className={styles.statusBar}>
      <Box className={styles.vacancySelector}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              className={styles.selectTrigger}
              variant="soft"
              style={{ justifyContent: 'space-between' }}
            >
              <Text size="2" truncate style={{ flex: 1, textAlign: 'left' }}>
                {triggerLabel}
              </Text>
              <ChevronDownIcon width={14} height={14} style={{ flexShrink: 0, marginLeft: 4 }} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content style={{ minWidth: 200 }}>
            <DropdownMenu.Item
              className={styles.addVacancyItemFirst}
              onSelect={() => {}}
            >
              <Flex align="center" gap="2">
                <PlusIcon width={14} height={14} />
                <Text size="2">Добавить вакансию</Text>
              </Flex>
            </DropdownMenu.Item>

            {viewMode === 'my' ? (
              <>
                <DropdownMenu.Group>
                  <DropdownMenu.Label className={styles.sectionLabel}>
                    Мои
                  </DropdownMenu.Label>
                  {myVacancies.map((vacancy) => (
                    <DropdownMenu.Item
                      key={vacancy.id}
                      onSelect={() => setSelectedVacancy(vacancy.id)}
                    >
                      {vacancy.title}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Group>
                <DropdownMenu.Item
                  className={styles.allVacanciesItem}
                  onSelect={(e) => {
                    e.preventDefault()
                    setViewMode('all')
                    setSelectedVacancy('__all__')
                  }}
                >
                  <Text size="2">Все</Text>
                </DropdownMenu.Item>
              </>
            ) : (
              <>
                <DropdownMenu.Item
                  className={styles.allHeaderInAllMode}
                  onSelect={(e) => {
                    e.preventDefault()
                    setViewMode('all')
                    setSelectedVacancy('__all__')
                  }}
                >
                  <Text size="2">Все</Text>
                </DropdownMenu.Item>
                {DEFAULT_VACANCIES.map((vacancy) => (
                  <DropdownMenu.Item
                    key={vacancy.id}
                    onSelect={() => setSelectedVacancy(vacancy.id)}
                  >
                    {vacancy.title}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Item
                  className={styles.mySwitchItem}
                  onSelect={(e) => {
                    e.preventDefault()
                    setViewMode('my')
                    setSelectedVacancy('__my__')
                  }}
                >
                  <Text size="2">Мои</Text>
                </DropdownMenu.Item>
              </>
            )}

            <DropdownMenu.Item
              className={styles.generalSettingsItem}
              onSelect={() => {}}
            >
              <Text size="2">Общие настройки</Text>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              size="2"
              variant="soft"
              style={{
                flexShrink: 0,
                minWidth: 30,
                width: 30,
                height: 30,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Взять на другую вакансию"
            >
              <PlusIcon width={14} height={14} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            {DEFAULT_VACANCIES.map((v) => (
              <DropdownMenu.Item key={v.id}>{v.title}</DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Box>

      <Box className={styles.statusesScroll}>
        <Flex align="center" gap="1" className={styles.statusesContainer}>
          <Box
            className={styles.statusItem}
            style={{
              borderColor: '#6B7280',
              backgroundColor: selectedStatus === null ? 'var(--accent-3)' : undefined,
            }}
            onClick={() => handleStatusClick('')}
          >
            <Badge
              size="2"
              style={{
                backgroundColor: selectedStatus === null ? 'var(--accent-9)' : '#6B7280',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Все
              <Text size="1" style={{ marginLeft: '4px', opacity: 0.9 }}>
                ({Object.values(statusCounts).reduce((a, b) => a + b, 0)})
              </Text>
            </Badge>
          </Box>
          {groupedStatuses.map((item) => {
            if (item.type === 'group') {
              const isExpanded = expandedGroups.has(item.groupId)
              const count = item.statuses.length
              const countText = count < 5 ? 'этапа' : 'этапов'

              if (isExpanded) {
                return (
                  <Box key={item.groupId} style={{ display: 'contents' }}>
                    {item.statuses.map((status) => (
                      <Box
                        key={status.id}
                        className={`${styles.statusItem} ${styles.statusItemDisabled}`}
                        style={{
                          borderColor: status.color,
                          opacity: 0.5,
                          cursor: 'not-allowed',
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <Badge
                          size="2"
                          style={{
                            backgroundColor: status.color,
                            color: 'white',
                            cursor: 'not-allowed',
                            opacity: 0.6,
                          }}
                        >
                          {status.label}
                        </Badge>
                      </Box>
                    ))}
                    <Box
                      className={styles.statusItem}
                      style={{ borderColor: '#9CA3AF', cursor: 'pointer' }}
                      onClick={() => toggleGroup(item.groupId)}
                    >
                      <Badge
                        size="2"
                        style={{
                          backgroundColor: '#9CA3AF',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <ChevronUpIcon
                          width={12}
                          height={12}
                          style={{ transform: 'rotate(-90deg)', display: 'inline-block' }}
                        />
                      </Badge>
                    </Box>
                  </Box>
                )
              }

              return (
                <Box
                  key={item.groupId}
                  className={styles.statusItem}
                  style={{ borderColor: '#9CA3AF', cursor: 'pointer' }}
                  onClick={() => toggleGroup(item.groupId)}
                >
                  <Badge
                    size="2"
                    style={{
                      backgroundColor: '#9CA3AF',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {count} {countText} без кандидатов
                  </Badge>
                </Box>
              )
            }

            const status = item.status
            const isActive = status.count !== undefined && status.count > 0
            const isSelected = selectedStatus === status.id

            return (
              <Box
                key={status.id}
                className={`${styles.statusItem} ${!isActive ? styles.statusItemDisabled : ''}`}
                style={{
                  borderColor: status.color,
                  opacity: isActive ? 1 : 0.5,
                  cursor: isActive ? 'pointer' : 'not-allowed',
                  backgroundColor: isSelected ? 'var(--accent-3)' : undefined,
                }}
                onClick={(e) => {
                  if (!isActive) {
                    e.preventDefault()
                    e.stopPropagation()
                  } else {
                    handleStatusClick(status.id)
                  }
                }}
                onMouseDown={(e) => {
                  if (!isActive) {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
              >
                <Badge
                  size="2"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-9)' : status.color,
                    color: 'white',
                    cursor: isActive ? 'pointer' : 'not-allowed',
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  {status.label}
                  {status.count !== undefined && status.count > 0 && (
                    <Text size="1" style={{ marginLeft: '4px', opacity: 0.9 }}>
                      ({status.count})
                    </Text>
                  )}
                </Badge>
              </Box>
            )
          })}
        </Flex>
      </Box>
    </Box>
  )
}
