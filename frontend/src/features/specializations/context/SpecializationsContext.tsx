'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { GradingConfig, SpecializationHistoryEntry, SpecializationNode } from '../types'
import {
  cloneTree,
  filterTreeByQuery,
  findNodeById,
  flattenTree,
  getFirstNodeId,
  updateNodeInTree,
} from '../types'
import { INITIAL_GRADING, INITIAL_TREE } from '../data/initialTree'

interface SpecializationsContextValue {
  tree: SpecializationNode[]
  setTree: React.Dispatch<React.SetStateAction<SpecializationNode[]>>
  selectedId: string | null
  selectedNode: SpecializationNode | undefined
  flatNodes: { id: string; name: string; depth: number }[]
  gradingBySpecId: Record<string, GradingConfig>
  setGradingBySpecId: React.Dispatch<React.SetStateAction<Record<string, GradingConfig>>>
  historyBySpecId: Record<string, SpecializationHistoryEntry[]>
  updateNode: (id: string, patch: Partial<SpecializationNode>) => void
  getFilteredTree: (query: string) => SpecializationNode[]
  firstNodeId: string | null
}

const SpecializationsContext = createContext<SpecializationsContextValue | null>(null)

const MOCK_HISTORY: SpecializationHistoryEntry[] = [
  { id: '1', date: '05.02.2026', user: '@admin', change: 'Изменена зарплата Middle: $5000→$6000' },
  { id: '2', date: '01.02.2026', user: '@hr_lead', change: 'Добавлен навык «Accessibility»' },
  { id: '3', date: '28.01.2026', user: '@cto', change: 'Создана подспециализация' },
]

export function SpecializationsProvider({
  children,
  selectedId,
}: {
  children: React.ReactNode
  selectedId: string | null
}) {
  const [tree, setTree] = useState<SpecializationNode[]>(INITIAL_TREE)
  const [gradingBySpecId, setGradingBySpecId] = useState<Record<string, GradingConfig>>(INITIAL_GRADING)
  const [historyBySpecId] = useState<Record<string, SpecializationHistoryEntry[]>>(() => {
    const o: Record<string, SpecializationHistoryEntry[]> = {}
    const fill = (nodes: SpecializationNode[]) => {
      nodes.forEach((n) => {
        o[n.id] = MOCK_HISTORY
        fill(n.children)
      })
    }
    fill(INITIAL_TREE)
    return o
  })

  const selectedNode = useMemo(() => (selectedId ? findNodeById(tree, selectedId) : undefined), [tree, selectedId])
  const flatNodes = useMemo(() => flattenTree(tree), [tree])

  const updateNode = useCallback((id: string, patch: Partial<SpecializationNode>) => {
    setTree((prev) => updateNodeInTree(prev, id, (node) => ({ ...node, ...patch })))
  }, [])

  const getFilteredTree = useCallback((query: string) => filterTreeByQuery(cloneTree(tree), query), [tree])
  const firstNodeId = useMemo(() => getFirstNodeId(tree), [tree])

  const value = useMemo<SpecializationsContextValue>(
    () => ({
      tree,
      setTree,
      selectedId,
      selectedNode,
      flatNodes,
      gradingBySpecId,
      setGradingBySpecId,
      historyBySpecId,
      updateNode,
      getFilteredTree,
      firstNodeId,
    }),
    [tree, selectedId, selectedNode, flatNodes, gradingBySpecId, historyBySpecId, updateNode, getFilteredTree, firstNodeId],
  )

  return <SpecializationsContext.Provider value={value}>{children}</SpecializationsContext.Provider>
}

export function useSpecializations() {
  const ctx = useContext(SpecializationsContext)
  if (!ctx) throw new Error('useSpecializations must be used within SpecializationsProvider')
  return ctx
}

