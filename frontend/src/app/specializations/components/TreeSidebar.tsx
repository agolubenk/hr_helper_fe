import { useState } from 'react'
import { Box, Button, Text, TextField } from '@radix-ui/themes'
import { GearIcon, LayersIcon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import { useSpecializations } from '@/app/specializations/context/SpecializationsContext'
import styles from '@/app/pages/styles/SpecializationsPage.module.css'

export function TreeSidebar() {
  const { tree, selectedId, getFilteredTree, firstNodeId } = useSpecializations()
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const filteredTree = getFilteredTree(searchQuery)

  return (
    <Box className={styles.treePanel}>
      <Box className={styles.treeHeader}>
        <Text size="2" weight="bold" className={styles.treeTitle}>Специализации компании</Text>
        <TextField.Root placeholder="Поиск по названию..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={styles.treeSearch}>
          <TextField.Slot><MagnifyingGlassIcon width={16} height={16} /></TextField.Slot>
        </TextField.Root>
      </Box>
      <Box className={styles.treeList}>
        {filteredTree.map((node) => (
          <Box key={node.id} className={`${styles.treeItem} ${selectedId === node.id ? styles.treeItemSelected : ''}`} onClick={() => router.push(`/specializations/${node.id}/info`)}>
            <div className={styles.treeItemInner}>
              <span className={styles.treeItemIcon}>{node.children.length ? <LayersIcon width={16} height={16} /> : <GearIcon width={16} height={16} />}</span>
              <Text size="2">{node.name}</Text>
            </div>
          </Box>
        ))}
      </Box>
      <Button variant="soft" className={styles.addSpecializationBtn} onClick={() => firstNodeId && router.push(`/specializations/${firstNodeId}/info`)}>
        <PlusIcon width={16} height={16} />
        Добавить специализацию
      </Button>
    </Box>
  )
}
