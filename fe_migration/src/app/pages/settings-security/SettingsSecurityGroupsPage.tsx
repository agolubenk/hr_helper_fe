import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOptionalSearchParam } from '@/shared/hooks/useUrlSearchState'
import {
  addGroupChild,
  findGroupNode,
  flattenGroupOptions,
  getTopLevelSectionContaining,
  updateGroupNode,
} from '@/features/rbac-admin/groupTreeUtils'
import { useRbacAdminMock } from '@/features/rbac-admin/rbacAdminMockStore'
import type { RbacGroupNode, RbacGroupType } from '@/features/rbac-admin/types'
import { useToast } from '@/components/Toast/ToastContext'
import styles from '@/app/pages/settings-security/rbacAdminPages.module.css'

const STATUS_META = {
  active: { label: 'Активен', color: 'green' as const },
  blocked: { label: 'Заблокирован', color: 'red' as const },
  pending: { label: 'Ожидает', color: 'amber' as const },
  inactive: { label: 'Неактивен', color: 'gray' as const },
}

const GROUP_TREE_COLLAPSED_STORAGE_KEY = 'hr-helper-settings-security-groups-collapsed-sections'

function readCollapsedSectionIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(GROUP_TREE_COLLAPSED_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

function writeCollapsedSectionIds(next: Set<string>): void {
  try {
    localStorage.setItem(GROUP_TREE_COLLAPSED_STORAGE_KEY, JSON.stringify([...next]))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Узлы ниже верхнего блока (глубина от корня «Компания» ≥ 2). */
function GroupTreeNestedRows({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: RbacGroupNode
  depth: number
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <>
      <button
        type="button"
        className={`${styles.groupRow} ${selectedId === node.id ? styles.groupRowSelected : ''}`}
        style={{ paddingLeft: 10 + depth * 14 }}
        onClick={() => onSelect(node.id)}
      >
        <Text size="2" style={{ flex: 1, textAlign: 'left' }}>
          {node.name}
        </Text>
        <Text size="1" color="gray">
          {node.memberCount}
        </Text>
      </button>
      {node.children.map((c) => (
        <GroupTreeNestedRows
          key={c.id}
          node={c}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

function GroupTreeSectionRow({
  section,
  selectedId,
  onSelect,
  collapsed,
  onToggleCollapsed,
}: {
  section: RbacGroupNode
  selectedId: string
  onSelect: (id: string) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const hasChildren = section.children.length > 0
  return (
    <>
      <Flex align="center" className={styles.groupTreeSectionRow}>
        {hasChildren ? (
          <button
            type="button"
            className={styles.groupTreeCollapseBtn}
            aria-expanded={!collapsed}
            aria-label={collapsed ? `Развернуть «${section.name}»` : `Свернуть «${section.name}»`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleCollapsed()
            }}
          >
            {collapsed ? <ChevronRightIcon width={14} height={14} /> : <ChevronDownIcon width={14} height={14} />}
          </button>
        ) : (
          <span className={styles.groupTreeCollapseSpacer} aria-hidden />
        )}
        <button
          type="button"
          className={`${styles.groupRow} ${styles.groupRowInSection} ${
            selectedId === section.id ? styles.groupRowSelected : ''
          }`}
          onClick={() => onSelect(section.id)}
        >
          <Text size="2" style={{ flex: 1, textAlign: 'left' }}>
            {section.name}
          </Text>
          <Text size="1" color="gray">
            {section.memberCount}
          </Text>
        </button>
      </Flex>
      {!collapsed &&
        section.children.map((child) => (
          <GroupTreeNestedRows
            key={child.id}
            node={child}
            depth={2}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </>
  )
}

function GroupTree({
  tree,
  selectedId,
  onSelect,
  collapsedSectionIds,
  onToggleSection,
}: {
  tree: RbacGroupNode
  selectedId: string
  onSelect: (id: string) => void
  collapsedSectionIds: Set<string>
  onToggleSection: (sectionId: string) => void
}) {
  return (
    <>
      <button
        type="button"
        className={`${styles.groupRow} ${selectedId === tree.id ? styles.groupRowSelected : ''}`}
        style={{ paddingLeft: 10 }}
        onClick={() => onSelect(tree.id)}
      >
        <Text size="2" style={{ flex: 1, textAlign: 'left' }}>
          {tree.name}
        </Text>
        <Text size="1" color="gray">
          {tree.memberCount}
        </Text>
      </button>
      {tree.children.map((section) => (
        <GroupTreeSectionRow
          key={section.id}
          section={section}
          selectedId={selectedId}
          onSelect={onSelect}
          collapsed={collapsedSectionIds.has(section.id)}
          onToggleCollapsed={() => onToggleSection(section.id)}
        />
      ))}
    </>
  )
}

type GroupModalMode = 'create' | 'edit'

export function SettingsSecurityGroupsPage() {
  const { showSuccess, showError } = useToast()
  const { state, setState } = useRbacAdminMock()
  const [groupSel, setGroupSel] = useOptionalSearchParam('group', { replace: true })
  const [groupDlg, setGroupDlg] = useOptionalSearchParam('groupDlg', { replace: true })
  const [groupPar, setGroupPar] = useOptionalSearchParam('groupPar', { replace: true })
  const [groupEdit, setGroupEdit] = useOptionalSearchParam('groupEdit', { replace: true })

  const selectedId = groupSel ?? 'root'
  const modalOpen = groupDlg === 'create' || groupDlg === 'edit'
  const groupModalMode: GroupModalMode = groupDlg === 'edit' ? 'edit' : 'create'
  const editingGroupId = groupDlg === 'edit' ? groupEdit : null

  const [gName, setGName] = useState('')
  const [gType, setGType] = useState<RbacGroupType>('organizational')
  const [gParent, setGParent] = useState('root')
  const [gDesc, setGDesc] = useState('')
  const [gInherit, setGInherit] = useState(true)

  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(() => readCollapsedSectionIds())

  const toggleSectionCollapsed = useCallback((sectionId: string) => {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      writeCollapsedSectionIds(next)
      return next
    })
  }, [])

  const selected = findGroupNode(state.groupTree, selectedId)

  useEffect(() => {
    const section = getTopLevelSectionContaining(state.groupTree, selectedId)
    if (!section) return
    setCollapsedSectionIds((prev) => {
      if (!prev.has(section.id)) return prev
      const next = new Set(prev)
      next.delete(section.id)
      writeCollapsedSectionIds(next)
      return next
    })
  }, [selectedId, state.groupTree])

  useEffect(() => {
    if (groupDlg === 'edit' && (!groupEdit || !findGroupNode(state.groupTree, groupEdit))) {
      setGroupDlg(null)
      setGroupEdit(null)
      setGroupPar(null)
    }
  }, [groupDlg, groupEdit, state.groupTree, setGroupDlg, setGroupEdit, setGroupPar])

  useEffect(() => {
    if (groupDlg !== 'create') return
    setGParent(groupPar ?? 'root')
    setGName('')
    setGDesc('')
    setGType('organizational')
    setGInherit(true)
  }, [groupDlg, groupPar])

  useEffect(() => {
    if (groupDlg !== 'edit' || !groupEdit) return
    const node = findGroupNode(state.groupTree, groupEdit)
    if (node) {
      setGName(node.name)
      setGType(node.type)
    }
  }, [groupDlg, groupEdit, state.groupTree])

  const flatParents = useMemo(() => flattenGroupOptions(state.groupTree), [state.groupTree])

  const members = useMemo(() => {
    if (!selected) return []
    return state.users.filter((u) =>
      u.groupLabels.some((g) => g.toLowerCase() === selected.name.toLowerCase())
    )
  }, [selected, state.users])

  const closeGroupDialog = () => {
    setGroupDlg(null)
    setGroupPar(null)
    setGroupEdit(null)
  }

  const openCreateGroup = (parentId: string) => {
    setGroupPar(parentId)
    setGroupEdit(null)
    setGroupDlg('create')
  }

  const saveGroup = () => {
    if (!gName.trim()) {
      showError('Группа', 'Укажите название.')
      return
    }
    if (groupModalMode === 'edit' && editingGroupId) {
      setState((prev) => ({
        ...prev,
        groupTree: updateGroupNode(prev.groupTree, editingGroupId, {
          name: gName.trim(),
          type: gType,
        }),
      }))
      closeGroupDialog()
      showSuccess('Группа', `«${gName.trim()}» обновлена (мок).`)
      return
    }
    const id = `grp-${Date.now()}`
    const node: RbacGroupNode = {
      id,
      name: gName.trim(),
      iconKey: 'folder',
      type: gType,
      inheritedRoleLabels: [],
      memberCount: 0,
      children: [],
    }
    setState((prev) => ({
      ...prev,
      groupTree: addGroupChild(prev.groupTree, gParent, node),
    }))
    closeGroupDialog()
    setGroupSel(id)
    showSuccess('Группа', `«${gName.trim()}» создана (мок). Наследование ролей: ${gInherit ? 'да' : 'нет'}.`)
    setGDesc('')
    setGName('')
  }

  return (
    <Box p={{ initial: '4', sm: '6' }} style={{ maxWidth: 1280 }}>
      <div className={styles.settingsPageHeaderRow}>
        <div className={styles.settingsPageHeaderText}>
          <Text size="6" weight="bold" className={styles.pageTitle}>
            Группы пользователей
          </Text>
          <Text as="p" size="2" color="gray" className={styles.pageIntro} style={{ maxWidth: '58ch' }}>
            Иерархия оргструктуры и функциональных команд. Участники подбираются по совпадению названия
            группы с метками в карточке пользователя (мок).
          </Text>
        </div>
        <div className={styles.settingsPageHeaderActions}>
          <Button onClick={() => openCreateGroup(selectedId ?? 'root')}>
            <PlusIcon /> Создать группу
          </Button>
        </div>
      </div>

      <div className={styles.groupLayout}>
        <div className={styles.treePanel}>
          <Box p="3" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
            <Text size="2" weight="bold">
              Структура групп
            </Text>
          </Box>
          <div className={styles.treeBody}>
            <GroupTree
              tree={state.groupTree}
              selectedId={selectedId}
              onSelect={(id) => setGroupSel(id === 'root' ? null : id)}
              collapsedSectionIds={collapsedSectionIds}
              onToggleSection={toggleSectionCollapsed}
            />
          </div>
        </div>

        <Box>
          {!selected ? (
            <Card size="3">
              <Text size="2" color="gray" align="center">
                Выберите группу в дереве.
              </Text>
            </Card>
          ) : (
            <Card size="3" variant="surface">
              <div className={styles.groupCardHeader}>
                <div className={styles.groupCardTitle}>
                  <Text size="5" weight="bold" style={{ display: 'block', wordBreak: 'break-word' }}>
                    {selected.name}
                  </Text>
                </div>
                <div className={styles.groupCardActions}>
                  <Button
                    variant="soft"
                    size="2"
                    onClick={() => {
                      setGroupPar(null)
                      setGroupEdit(selected.id)
                      setGroupDlg('edit')
                    }}
                  >
                    <Pencil1Icon /> Изменить
                  </Button>
                  <Button size="2" onClick={() => openCreateGroup(selected.id)}>
                    <PlusIcon /> Подгруппа
                  </Button>
                </div>
              </div>

              <Text size="1" color="gray" mb="3" style={{ display: 'block' }}>
                Тип: {selected.type} • id: {selected.id}
              </Text>

              <Flex gap="3" wrap="wrap" mb="4">
                <Box className={styles.statCard} style={{ flex: '1 1 120px', textAlign: 'center' }}>
                  <Text size="6" weight="bold" color="ruby">
                    {members.length}
                  </Text>
                  <Text size="1" color="gray" as="div" style={{ marginTop: 4 }}>
                    Участников (по метке)
                  </Text>
                </Box>
                <Box className={styles.statCard} style={{ flex: '1 1 120px', textAlign: 'center' }}>
                  <Text size="6" weight="bold">
                    {selected.inheritedRoleLabels.length}
                  </Text>
                  <Text size="1" color="gray" as="div" style={{ marginTop: 4 }}>
                    Ролей группы
                  </Text>
                </Box>
                <Box className={styles.statCard} style={{ flex: '1 1 120px', textAlign: 'center' }}>
                  <Text size="6" weight="bold">
                    {selected.children.length}
                  </Text>
                  <Text size="1" color="gray" as="div" style={{ marginTop: 4 }}>
                    Подгрупп
                  </Text>
                </Box>
              </Flex>

              {selected.inheritedRoleLabels.length > 0 ? (
                <Box mb="4">
                  <Text size="1" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>
                    Роли группы
                  </Text>
                  <Flex gap="1" wrap="wrap">
                    {selected.inheritedRoleLabels.map((r) => (
                      <Badge key={r} color="ruby" variant="soft" size="1">
                        {r}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              ) : null}

              <Box>
                <Text size="1" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>
                  Участники (по метке «{selected.name}»)
                </Text>
                {members.length === 0 ? (
                  <Text size="2" color="gray">
                    Нет пользователей с такой группой в мок-данных.
                  </Text>
                ) : (
                  members.map((u) => {
                    const st = STATUS_META[u.status]
                    return (
                      <Flex
                        key={u.id}
                        align="center"
                        gap="3"
                        py="2"
                        style={{ borderBottom: '1px solid var(--gray-a6)' }}
                      >
                        <Box
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 999,
                            background: u.avatarColor,
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {u.firstName[0]}
                          {u.lastName[0]}
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <Text size="2" weight="medium">
                            {u.firstName} {u.lastName}
                          </Text>
                          <Text size="1" color="gray">
                            {u.email}
                          </Text>
                        </Box>
                        <Badge color={st.color} variant="soft" size="1">
                          {st.label}
                        </Badge>
                      </Flex>
                    )
                  })
                )}
              </Box>
            </Card>
          )}
        </Box>
      </div>

      <Dialog.Root
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) closeGroupDialog()
        }}
      >
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>
            {groupModalMode === 'edit' ? 'Редактировать группу' : 'Новая группа'}
          </Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Название
              </Text>
              <TextField.Root value={gName} onChange={(e) => setGName(e.target.value)} />
            </Box>
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Тип
              </Text>
              <Select.Root value={gType} onValueChange={(v) => setGType(v as RbacGroupType)}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="organizational">Организационная</Select.Item>
                  <Select.Item value="functional">Функциональная</Select.Item>
                  <Select.Item value="custom">Пользовательская</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
            {groupModalMode === 'create' ? (
              <Box>
                <Text size="2" weight="medium" mb="1" as="div">
                  Родительская группа
                </Text>
                <Select.Root value={gParent} onValueChange={setGParent}>
                  <Select.Trigger />
                  <Select.Content>
                    {flatParents.map((o) => (
                      <Select.Item key={o.id} value={o.id}>
                        {o.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            ) : null}
            {groupModalMode === 'create' ? (
              <>
                <Box>
                  <Text size="2" weight="medium" mb="1" as="div">
                    Описание
                  </Text>
                  <TextField.Root value={gDesc} onChange={(e) => setGDesc(e.target.value)} />
                </Box>
                <Flex align="center" gap="2">
                  <Checkbox checked={gInherit} onCheckedChange={(v) => setGInherit(v === true)} />
                  <Text size="2">Наследовать роли в дочерних группах</Text>
                </Flex>
              </>
            ) : null}
            <Flex justify="end" gap="2" mt="2">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Отмена
                </Button>
              </Dialog.Close>
              <Button onClick={saveGroup}>
                {groupModalMode === 'edit' ? 'Сохранить' : 'Создать'}
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
