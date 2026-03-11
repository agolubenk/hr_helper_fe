'use client'

import { useState } from 'react'
import { Box, Button, Text, TextField } from '@radix-ui/themes'
import { GearIcon, LayersIcon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import { useSpecializations } from '../context/SpecializationsContext'
import styles from '../SpecializationsLayout.module.css'

export function TreeSidebar() {
  const navigate = useNavigate()
  const { tree, selectedId, getFilteredTree, firstNodeId } = useSpecializations()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTree = getFilteredTree(searchQuery)

  const handleSelect = (id: string) => {
    navigate({ to: '/specializations/$id/info', params: { id } })
  }

  const handleAdd = () => {
    if (firstNodeId) navigate({ to: '/specializations/$id/info', params: { id: firstNodeId } })
  }

  function renderTree(nodes: typeof tree) {
    return nodes.map((node) => (
      <Box key={node.id} style={{ marginBottom: 2 }}>
        <Box className={`${styles.treeItem} ${selectedId === node.id ? styles.treeItemSelected : ''}`} onClick={() => handleSelect(node.id)}>
          <div className={styles.treeItemInner}>
            <span className={styles.treeItemIcon}>
              {node.children.length > 0 ? <LayersIcon width={16} height={16} /> : <GearIcon width={16} height={16} />}
            </span>
            <Text size="2" truncate style={{ flex: 1 }}>
              {node.name}
            </Text>
          </div>
        </Box>
        {node.children.length > 0 && <Box className={styles.treeItemChildren}>{renderTree(node.children)}</Box>}
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

