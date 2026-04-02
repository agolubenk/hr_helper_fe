import { Box, Button, Checkbox, Flex, Popover, Text, TextField } from '@radix-ui/themes'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'
import { buildRoleTree, filterRoleTree, type RoleTreeNode } from '@/features/rbac-admin/roleHierarchy'
import type { RbacRole } from '@/features/rbac-admin/types'
import styles from '@/features/rbac-admin/components/RoleHierarchyPicker.module.css'

function RoleTreeRows({
  nodes,
  depth,
  assignedLabels,
  onPick,
}: {
  nodes: RoleTreeNode[]
  depth: number
  assignedLabels: string[]
  onPick: (displayName: string) => void
}) {
  return (
    <>
      {nodes.map(({ role, children }) => {
        const taken = assignedLabels.includes(role.displayName)
        return (
          <Box key={role.id}>
            <button
              type="button"
              className={styles.roleRow}
              style={{ paddingLeft: 10 + depth * 16 }}
              disabled={taken}
              onClick={() => onPick(role.displayName)}
            >
              <Flex direction="column" align="start" gap="0" style={{ textAlign: 'left' }}>
                <Text size="2" weight="medium">
                  {role.displayName}
                </Text>
                {role.description ? (
                  <Text size="1" color="gray" className={styles.roleDesc}>
                    {role.description}
                  </Text>
                ) : null}
              </Flex>
            </button>
            {children.length > 0 ? (
              <RoleTreeRows
                nodes={children}
                depth={depth + 1}
                assignedLabels={assignedLabels}
                onPick={onPick}
              />
            ) : null}
          </Box>
        )
      })}
    </>
  )
}

interface RoleHierarchyPickerProps {
  roles: RbacRole[]
  assignedLabels: string[]
  onAdd: (displayName: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RoleHierarchyPicker({
  roles,
  assignedLabels,
  onAdd,
  placeholder = 'Добавить роль…',
  disabled = false,
}: RoleHierarchyPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const tree = useMemo(() => buildRoleTree(roles), [roles])
  const filtered = useMemo(() => filterRoleTree(tree, search), [tree, search])

  const canAddAny = useMemo(
    () => roles.some((r) => !assignedLabels.includes(r.displayName)),
    [roles, assignedLabels]
  )

  const handlePick = (displayName: string) => {
    onAdd(displayName)
    setSearch('')
    setOpen(false)
  }

  if (!canAddAny) {
    return null
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error Radix Themes Popover.Trigger typings omit asChild */}
      <Popover.Trigger asChild disabled={disabled}>
        <Button type="button" variant="outline" color="gray" style={{ maxWidth: 320 }}>
          {placeholder}
        </Button>
      </Popover.Trigger>
      <Popover.Content size="2" sideOffset={6} className={styles.popover}>
        <Box p="2" pb="1">
          <TextField.Root
            size="2"
            placeholder="Поиск по названию, slug, описанию…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>
        <Box className={styles.treeScroll}>
          {filtered.length === 0 ? (
            <Box p="3">
              <Text size="2" color="gray">
                Ничего не найдено.
              </Text>
            </Box>
          ) : (
            <RoleTreeRows
              nodes={filtered}
              depth={0}
              assignedLabels={assignedLabels}
              onPick={handlePick}
            />
          )}
        </Box>
      </Popover.Content>
    </Popover.Root>
  )
}

function RoleTreeCheckRows({
  nodes,
  depth,
  selectedLabels,
  onToggle,
}: {
  nodes: RoleTreeNode[]
  depth: number
  selectedLabels: string[]
  onToggle: (displayName: string, checked: boolean) => void
}) {
  return (
    <>
      {nodes.map(({ role, children }) => {
        const checked = selectedLabels.includes(role.displayName)
        return (
          <Box key={role.id}>
            <label className={styles.checkRow} style={{ paddingLeft: 10 + depth * 16 }}>
              <Flex align="start" gap="2">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => onToggle(role.displayName, v === true)}
                />
                <Flex direction="column" align="start" gap="0">
                  <Text size="2" weight="medium">
                    {role.displayName}
                  </Text>
                  {role.description ? (
                    <Text size="1" color="gray" className={styles.roleDesc}>
                      {role.description}
                    </Text>
                  ) : null}
                </Flex>
              </Flex>
            </label>
            {children.length > 0 ? (
              <RoleTreeCheckRows
                nodes={children}
                depth={depth + 1}
                selectedLabels={selectedLabels}
                onToggle={onToggle}
              />
            ) : null}
          </Box>
        )
      })}
    </>
  )
}

interface RoleHierarchyCheckboxListProps {
  roles: RbacRole[]
  selectedLabels: string[]
  onToggle: (displayName: string, checked: boolean) => void
}

/** Вложенный список ролей с поиском (модалки назначения). */
export function RoleHierarchyCheckboxList({
  roles,
  selectedLabels,
  onToggle,
}: RoleHierarchyCheckboxListProps) {
  const [search, setSearch] = useState('')
  const tree = useMemo(() => buildRoleTree(roles), [roles])
  const filtered = useMemo(() => filterRoleTree(tree, search), [tree, search])

  return (
    <Flex direction="column" gap="2">
      <TextField.Root
        size="2"
        placeholder="Поиск по названию, slug, описанию…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      <Box className={styles.treeScrollFlat}>
        {filtered.length === 0 ? (
          <Box p="2">
            <Text size="2" color="gray">
              Ничего не найдено.
            </Text>
          </Box>
        ) : (
          <RoleTreeCheckRows
            nodes={filtered}
            depth={0}
            selectedLabels={selectedLabels}
            onToggle={onToggle}
          />
        )}
      </Box>
    </Flex>
  )
}
