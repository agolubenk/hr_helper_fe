import { createContext, useCallback, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { INITIAL_GRADING, INITIAL_TREE } from '@/app/specializations/data/initialTree'
import type { GradingConfig, SpecializationHistoryEntry, SpecializationNode } from '@/app/specializations/types'
import { cloneTree, filterTreeByQuery, findNodeById, flattenTree, getFirstNodeId, updateNodeInTree } from '@/app/specializations/types'

interface SpecializationsContextValue {
  tree: SpecializationNode[]
  selectedId: string | null
  selectedNode: SpecializationNode | undefined
  gradingBySpecId: Record<string, GradingConfig>
  setGradingBySpecId: Dispatch<SetStateAction<Record<string, GradingConfig>>>
  historyBySpecId: Record<string, SpecializationHistoryEntry[]>
  updateNode: (id: string, patch: Partial<SpecializationNode>) => void
  getFlatNodesForSelect: (excludeId?: string) => { id: string; name: string; depth: number }[]
  getFilteredTree: (query: string) => SpecializationNode[]
  firstNodeId: string | null
}

const SpecializationsContext = createContext<SpecializationsContextValue | null>(null)

export function SpecializationsProvider({ children, selectedId }: { children: ReactNode; selectedId: string | null }) {
  const [tree, setTree] = useState<SpecializationNode[]>(INITIAL_TREE)
  const [gradingBySpecId, setGradingBySpecId] = useState<Record<string, GradingConfig>>(INITIAL_GRADING)
  const [historyBySpecId] = useState<Record<string, SpecializationHistoryEntry[]>>({
    frontend: [{ id: '1', date: '05.02.2026', user: '@admin', change: 'Обновлены требования по middle.' }],
    backend: [{ id: '1', date: '04.02.2026', user: '@cto', change: 'Добавлен новый поток развития.' }],
  })

  const selectedNode = useMemo(() => (selectedId ? findNodeById(tree, selectedId) : undefined), [tree, selectedId])
  const flatNodes = useMemo(() => flattenTree(tree), [tree])
  const updateNode = useCallback((id: string, patch: Partial<SpecializationNode>) => {
    setTree((prev) => updateNodeInTree(prev, id, (node) => ({ ...node, ...patch })))
  }, [])
  const getFlatNodesForSelect = useCallback((excludeId?: string) => [{ id: '', name: '— Без родителя —', depth: 0 }, ...flatNodes].filter((n) => n.id !== excludeId), [flatNodes])
  const getFilteredTree = useCallback((query: string) => filterTreeByQuery(cloneTree(tree), query), [tree])
  const firstNodeId = useMemo(() => getFirstNodeId(tree), [tree])

  return (
    <SpecializationsContext.Provider value={{ tree, selectedId, selectedNode, gradingBySpecId, setGradingBySpecId, historyBySpecId, updateNode, getFlatNodesForSelect, getFilteredTree, firstNodeId }}>
      {children}
    </SpecializationsContext.Provider>
  )
}

export function useSpecializations() {
  const ctx = useContext(SpecializationsContext)
  if (!ctx) throw new Error('useSpecializations must be used within SpecializationsProvider')
  return ctx
}
