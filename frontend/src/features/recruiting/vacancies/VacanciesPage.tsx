'use client'

import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { GridIcon, HamburgerMenuIcon, ListBulletIcon } from '@radix-ui/react-icons'
import { useEffect, useMemo, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { mockVacancies } from './mocks'
import type { Vacancy } from './types'
import styles from './VacanciesPage.module.css'
import { VacanciesSearchFilters } from './components/VacanciesSearchFilters'
import { VacanciesStats } from './components/VacanciesStats'
import { VacancyCard } from './components/VacancyCard'
import { VacancyListItem } from './components/VacancyListItem'
import { VacancyEditModal } from './components/VacancyEditModal'

function getEditIdFromSearch(): number | null {
  if (typeof window === 'undefined') return null
  const id = new URLSearchParams(window.location.search).get('edit')
  if (!id) return null
  const n = Number.parseInt(id, 10)
  return Number.isFinite(n) ? n : null
}

export function VacanciesPage() {
  const routerState = useRouterState()

  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | Vacancy['status']>('all')

  const [viewVacancyId, setViewVacancyId] = useState<number | null>(null)
  const [editVacancyId, setEditVacancyId] = useState<number | null>(getEditIdFromSearch)

  const [statusOverrides, setStatusOverrides] = useState<Record<number, Vacancy['status']>>({})

  useEffect(() => {
    const editId = getEditIdFromSearch()
    if (editId == null) return
    setEditVacancyId(editId)
    setViewVacancyId(null)
  }, [routerState.location.search])

  const getStatus = (v: Vacancy) => statusOverrides[v.id] ?? v.status

  const totalVacancies = mockVacancies.length
  const activeVacancies = useMemo(
    () => mockVacancies.filter((v) => getStatus(v) === 'active').length,
    [statusOverrides]
  )
  const inactiveVacancies = useMemo(
    () => mockVacancies.filter((v) => getStatus(v) === 'inactive').length,
    [statusOverrides]
  )

  const filteredVacancies = useMemo(() => {
    return mockVacancies.filter((vacancy) => {
      const status = getStatus(vacancy)
      const matchesSearch =
        !searchQuery ||
        vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(vacancy.id).includes(searchQuery)
      const matchesRecruiter = selectedRecruiter === 'all' || vacancy.recruiter === selectedRecruiter
      const matchesStatus = selectedStatus === 'all' || status === selectedStatus
      return matchesSearch && matchesRecruiter && matchesStatus
    })
  }, [searchQuery, selectedRecruiter, selectedStatus, statusOverrides])

  const selectedVacancy = useMemo(() => {
    const id = editVacancyId ?? viewVacancyId
    if (id == null) return null
    const v = mockVacancies.find((x) => x.id === id) ?? null
    if (!v) return null
    return { ...v, status: getStatus(v) }
  }, [editVacancyId, viewVacancyId, statusOverrides])

  const modalMode: 'view' | 'edit' = viewVacancyId != null ? 'view' : 'edit'

  return (
    <Box data-tour="vacancies-page" className={styles.vacanciesContainer}>
      <VacanciesSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRecruiter={selectedRecruiter}
        onRecruiterChange={setSelectedRecruiter}
        selectedStatus={selectedStatus}
        onStatusChange={(v) => setSelectedStatus(v as typeof selectedStatus)}
      />

      <VacanciesStats total={totalVacancies} active={activeVacancies} inactive={inactiveVacancies} />

      <Flex data-tour="vacancies-toolbar" justify="between" align="center" className={styles.sectionHeader}>
        <Flex align="center" gap="2">
          <HamburgerMenuIcon width={20} height={20} />
          <Text size="5" weight="bold">
            Вакансии
          </Text>
        </Flex>
        <Flex align="center" gap="3">
          <Flex gap="1" className={styles.viewToggle}>
            <Button
              variant={viewMode === 'cards' ? 'solid' : 'soft'}
              size="2"
              onClick={() => setViewMode('cards')}
              className={styles.viewButton}
            >
              <GridIcon width={16} height={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'solid' : 'soft'}
              size="2"
              onClick={() => setViewMode('list')}
              className={styles.viewButton}
            >
              <ListBulletIcon width={16} height={16} />
            </Button>
          </Flex>
          <Button size="3" className={styles.addButton}>
            + Добавить вакансию
          </Button>
        </Flex>
      </Flex>

      {viewMode === 'cards' ? (
        <Box className={styles.cardsGrid}>
          {filteredVacancies.map((vacancy) => (
            <VacancyCard
              key={vacancy.id}
              vacancy={{ ...vacancy, status: getStatus(vacancy) }}
              onClick={() => {
                setViewVacancyId(vacancy.id)
                setEditVacancyId(null)
              }}
              onEditClick={() => {
                setEditVacancyId(vacancy.id)
                setViewVacancyId(null)
              }}
              onStatusClick={() => {
                const s = getStatus(vacancy)
                setStatusOverrides((prev) => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' }))
              }}
            />
          ))}
        </Box>
      ) : (
        <Box className={styles.listContainer}>
          {filteredVacancies.map((vacancy) => (
            <VacancyListItem
              key={vacancy.id}
              vacancy={{ ...vacancy, status: getStatus(vacancy) }}
              onClick={() => {
                setViewVacancyId(vacancy.id)
                setEditVacancyId(null)
              }}
              onEditClick={() => {
                setEditVacancyId(vacancy.id)
                setViewVacancyId(null)
              }}
              onStatusClick={() => {
                const s = getStatus(vacancy)
                setStatusOverrides((prev) => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' }))
              }}
            />
          ))}
        </Box>
      )}

      <VacancyEditModal
        open={editVacancyId != null || viewVacancyId != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditVacancyId(null)
            setViewVacancyId(null)
          }
        }}
        vacancy={selectedVacancy}
        mode={modalMode}
        onSwitchToEdit={
          viewVacancyId != null
            ? () => {
                setEditVacancyId(viewVacancyId)
                setViewVacancyId(null)
              }
            : undefined
        }
        onStatusChange={(status) => {
          const id = editVacancyId ?? viewVacancyId
          if (id == null) return
          setStatusOverrides((prev) => ({ ...prev, [id]: status }))
        }}
      />
    </Box>
  )
}

