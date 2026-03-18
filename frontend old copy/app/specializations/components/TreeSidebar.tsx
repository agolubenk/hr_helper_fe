'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Text, TextField, Button } from '@radix-ui/themes'
import { LayersIcon, GearIcon, PlusIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useSpecializations } from '../context/SpecializationsContext'
import styles from '../specializations.module.css'

export default function TreeSidebar() {
  const router = useRouter()
  const { tree, selectedId, getFilteredTree, firstNodeId } = useSpecializations()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTree = getFilteredTree(searchQuery)

  const handleSelect = (id: string) => {
    router.push(`/specializations/${id}/info`)
  }

  const handleAdd = () => {
    // TODO: модальное окно создания; пока редирект на первую или сохранение новой в контекст
    if (firstNodeId) router.push(`/specializations/${firstNodeId}/info`)
  }

  function renderTree(nodes: typeof tree, level = 0) {
    return nodes.map((node) => (
      <Box key={node.id} style={{ marginBottom: 2 }}>
        <Box
          className={`${styles.treeItem} ${selectedId === node.id ? styles.treeItemSelected : ''}`}
          onClick={() => handleSelect(node.id)}
        >
          <div className={styles.treeItemInner}>
            <span className={styles.treeItemIcon}>
              {node.children.length > 0 ? (
                <LayersIcon width={16} height={16} />
              ) : (
                <GearIcon width={16} height={16} />
              )}
            </span>
            <Text size="2" truncate style={{ flex: 1 }}>
              {node.name}
            </Text>
          </div>
        </Box>
        {node.children.length > 0 && (
          <Box className={styles.treeItemChildren}>{renderTree(node.children, level + 1)}</Box>
        )}
      </Box>
    ))
  }

  return (
    <Box className={styles.treePanel}>
      <Box className={styles.treeHeader}>
        <Text size="2" weight="bold" className={styles.treeTitle}>
          Специализации компании
        </Text>
        <TextField.Root
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.treeSearch}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon width={16} height={16} />
          </TextField.Slot>
        </TextField.Root>
      </Box>
      <Box className={styles.treeList}>{renderTree(filteredTree)}</Box>
      <Button variant="soft" className={styles.addSpecializationBtn} onClick={handleAdd}>
        <PlusIcon width={16} height={16} />
        Добавить специализацию
      </Button>
    </Box>
  )
}
