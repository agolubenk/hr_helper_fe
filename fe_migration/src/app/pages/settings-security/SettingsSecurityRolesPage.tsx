import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Select,
  Table,
  Tabs,
  Text,
  TextField,
} from '@radix-ui/themes'
import { PlusIcon, Pencil1Icon, TrashIcon, PersonIcon, LockClosedIcon } from '@radix-ui/react-icons'
import { Fragment, useMemo, useState } from 'react'
import { useOptionalSearchParam, useValidatedSearchParam } from '@/shared/hooks/useUrlSearchState'
import { applyPermissionCounts } from '@/features/rbac-admin/buildPermissionRegistry'
import { patchMatrixCell } from '@/features/rbac-admin/buildMatrix'
import { RbacAccessModelIntro } from '@/features/rbac-admin/components/RbacAccessModelIntro'
import type { RbacAction, RbacResourceId, RbacRole } from '@/features/rbac-admin/types'
import { RBAC_ACTIONS, RBAC_RESOURCE_IDS } from '@/features/rbac-admin/types'
import { RBAC_ACTION_LABELS, RBAC_RESOURCE_LABELS } from '@/features/rbac-admin/resourceLabels'
import { seedNewRoleMatrixRow, useRbacAdminMock } from '@/features/rbac-admin/rbacAdminMockStore'
import { useToast } from '@/components/Toast/ToastContext'
import styles from '@/app/pages/settings-security/rbacAdminPages.module.css'

const RBAC_ROLES_TABS = ['cards', 'matrix', 'hierarchy'] as const

function PriorityBar({ priority }: { priority: number }) {
  const lvl = priority >= 80 ? 4 : priority >= 50 ? 3 : priority >= 20 ? 2 : 1
  return (
    <div className={styles.priorityBar} aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${styles.priorityPip} ${i <= lvl ? styles.priorityPipFilled : ''}`}
        />
      ))}
    </div>
  )
}

export function SettingsSecurityRolesPage() {
  const { showSuccess, showError } = useToast()
  const { state, setState } = useRbacAdminMock()
  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin')
  const [roleSearch, setRoleSearch] = useState('')
  const [mainTab, setMainTab] = useValidatedSearchParam('tab', RBAC_ROLES_TABS, 'cards', {
    omitWhenDefault: true,
    replace: true,
  })
  const [roleModalParam, setRoleModalParam] = useOptionalSearchParam('roleModal', { replace: true })
  const roleModalOpen = roleModalParam === 'new'
  const [newSlug, setNewSlug] = useState('')
  const [newDisplay, setNewDisplay] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newParent, setNewParent] = useState<string>('_none')
  const [newPriority, setNewPriority] = useState('40')
  const [newColor, setNewColor] = useState('#2563eb')
  const [newDefault, setNewDefault] = useState(false)
  const [newSystem, setNewSystem] = useState(false)

  const rolesFiltered = useMemo(() => {
    const q = roleSearch.trim().toLowerCase()
    return state.roles.filter(
      (r) =>
        !q ||
        r.displayName.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    )
  }, [state.roles, roleSearch])

  const selectedRole = state.roles.find((r) => r.id === selectedRoleId)

  const userCountForRole = (displayName: string) =>
    state.users.filter((u) => u.roleLabels.includes(displayName)).length

  const toggleMatrix = (resource: RbacResourceId, action: RbacAction, value: boolean) => {
    setState((prev) => {
      const nextMatrix = patchMatrixCell(prev.matrix, selectedRoleId, resource, action, value)
      return {
        ...prev,
        matrix: nextMatrix,
        roles: applyPermissionCounts(prev.roles, nextMatrix),
      }
    })
    showSuccess('Матрица', value ? `Включено: ${resource}:${action}` : `Снято: ${resource}:${action}`)
  }

  const openCreateRole = () => {
    setNewSlug('')
    setNewDisplay('')
    setNewDesc('')
    setNewParent('_none')
    setNewPriority('40')
    setNewColor('#2563eb')
    setNewDefault(false)
    setNewSystem(false)
    setRoleModalParam('new')
  }

  const saveNewRole = () => {
    const slug = newSlug.trim().toLowerCase().replace(/\s+/g, '_')
    if (!slug) {
      showError('Роль', 'Введите системное имя (slug).')
      return
    }
    if (!newDisplay.trim()) {
      showError('Роль', 'Введите отображаемое название.')
      return
    }
    const id = `role-${slug}-${Date.now()}`
    const pr = parseInt(newPriority, 10)
    const newRole: RbacRole = {
      id,
      slug,
      displayName: newDisplay.trim(),
      description: newDesc.trim() || '—',
      isSystem: newSystem,
      isDefault: newDefault,
      priority: Number.isFinite(pr) ? Math.min(100, Math.max(1, pr)) : 40,
      color: newColor,
      userCount: 0,
      permissionCount: 0,
      parentRoleId: newParent === '_none' ? null : newParent,
    }
    setState((prev) => {
      const row = seedNewRoleMatrixRow()
      const nextMatrix: typeof prev.matrix = { ...prev.matrix, [id]: row }
      const nextRoles = [...prev.roles, newRole]
      return {
        ...prev,
        matrix: nextMatrix,
        roles: applyPermissionCounts(nextRoles, nextMatrix),
      }
    })
    setSelectedRoleId(id)
    setRoleModalParam(null)
    showSuccess('Роль', `Роль «${newDisplay.trim()}» создана (мок).`)
  }

  const deleteRole = (r: RbacRole) => {
    if (r.isSystem) {
      showError('Роль', 'Системную роль нельзя удалить.')
      return
    }
    setState((prev) => {
      const { [r.id]: _removed, ...restMatrix } = prev.matrix
      const nextRoles = prev.roles.filter((x) => x.id !== r.id)
      return {
        ...prev,
        matrix: restMatrix,
        roles: applyPermissionCounts(nextRoles, restMatrix),
      }
    })
    if (selectedRoleId === r.id) setSelectedRoleId('admin')
    showSuccess('Роль', `Роль «${r.displayName}» удалена (мок).`)
  }

  return (
    <Box p={{ initial: '4', sm: '6' }} style={{ maxWidth: 1280 }}>
      <RbacAccessModelIntro />
      <div className={styles.rolesHeaderBlock}>
        <Flex justify="between" align="start" gap="4" wrap="wrap" className={styles.rolesPageHeader}>
          <Box>
            <Text size="6" weight="bold" className={styles.pageTitle}>
              Роли и права (RBAC)
            </Text>
            <Text as="p" size="2" color="gray" style={{ maxWidth: '60ch', margin: 0 }}>
              Карточки ролей, матрица «ресурс × действие» и иерархия наследования. Изменения матрицы сразу
              отражаются в реестре прав на соседней странице.
            </Text>
          </Box>
          <Button onClick={openCreateRole}>
            <PlusIcon /> Создать роль
          </Button>
        </Flex>
      </div>

      <Tabs.Root
        value={mainTab}
        onValueChange={(v) => setMainTab(v as (typeof RBAC_ROLES_TABS)[number])}
      >
        <Tabs.List>
          <Tabs.Trigger value="cards">Роли</Tabs.Trigger>
          <Tabs.Trigger value="matrix">Матрица прав</Tabs.Trigger>
          <Tabs.Trigger value="hierarchy">Иерархия</Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value="cards">
            <TextField.Root
              placeholder="Поиск роли…"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              mb="3"
              style={{ maxWidth: 320 }}
            />
            <div className={styles.roleGrid}>
              {rolesFiltered.map((role) => (
                <Card
                  key={role.id}
                  className={`${styles.roleCard} ${selectedRoleId === role.id ? styles.roleCardSelected : ''}`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <Flex justify="between" align="start" mb="2">
                    <Box
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `${role.color}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {role.isSystem ? (
                        <LockClosedIcon width={18} height={18} style={{ color: role.color }} />
                      ) : (
                        <PersonIcon width={18} height={18} style={{ color: role.color }} />
                      )}
                    </Box>
                    <Flex direction="column" align="end" gap="1">
                      {role.isSystem ? (
                        <Badge size="1" color="gray" variant="soft">
                          Системная
                        </Badge>
                      ) : null}
                      {role.isDefault ? (
                        <Badge size="1" color="ruby" variant="soft">
                          По умолчанию
                        </Badge>
                      ) : null}
                    </Flex>
                  </Flex>
                  <Text size="3" weight="bold">
                    {role.displayName}
                  </Text>
                  <Text size="1" color="gray" mb="2" style={{ display: 'block', minHeight: 36 }}>
                    {role.description}
                  </Text>
                  <Flex align="center" gap="3" wrap="wrap">
                    <Text size="1" color="gray">
                      {userCountForRole(role.displayName)} польз.
                    </Text>
                    <Text size="1" color="gray">
                      {role.permissionCount} прав
                    </Text>
                    <PriorityBar priority={role.priority} />
                  </Flex>
                  {!role.isSystem ? (
                    <Flex gap="2" mt="3" pt="3" style={{ borderTop: '1px solid var(--gray-a6)' }}>
                      <Button
                        size="1"
                        variant="soft"
                        onClick={(e) => {
                          e.stopPropagation()
                          showSuccess('Роль', `Редактирование «${role.displayName}» (мок).`)
                        }}
                      >
                        <Pencil1Icon /> Изменить
                      </Button>
                      <Button
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteRole(role)
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </Flex>
                  ) : null}
                </Card>
              ))}
            </div>
          </Tabs.Content>

          <Tabs.Content value="matrix">
            <Callout.Root color="blue" mb="3">
              <Callout.Text>
                Выберите роль слева — отметки в матрице сохраняются в общем мок-хранилище и влияют на страницу
                «Права доступа».
              </Callout.Text>
            </Callout.Root>
            <div className={styles.matrixSplit}>
              <Card size="1">
                <Box mb="2" p="3" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
                  <Text size="2" weight="bold">
                    Роль
                  </Text>
                </Box>
                <Flex direction="column" gap="0" p="2">
                  {state.roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`${styles.roleListItem} ${selectedRoleId === r.id ? styles.roleListItemActive : ''}`}
                      onClick={() => setSelectedRoleId(r.id)}
                    >
                      <Box
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: r.color,
                          flexShrink: 0,
                        }}
                      />
                      {r.displayName}
                    </button>
                  ))}
                </Flex>
              </Card>
              <div className={styles.tableWrap}>
                <Table.Root size="1" variant="surface">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell style={{ minWidth: 200 }}>
                        Ресурс / действие
                      </Table.ColumnHeaderCell>
                      {RBAC_ACTIONS.map((a) => (
                        <Table.ColumnHeaderCell key={a} style={{ textAlign: 'center' }}>
                          {RBAC_ACTION_LABELS[a]}
                        </Table.ColumnHeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {RBAC_RESOURCE_IDS.map((res) => (
                      <Fragment key={res}>
                        <Table.Row className={styles.permResourceRow}>
                          <Table.Cell colSpan={1 + RBAC_ACTIONS.length}>
                            {RBAC_RESOURCE_LABELS[res]}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell style={{ paddingLeft: 24 }}>Все операции</Table.Cell>
                          {RBAC_ACTIONS.map((act) => {
                            const granted =
                              state.matrix[selectedRoleId]?.[res]?.[act] ?? false
                            return (
                              <Table.Cell key={act} style={{ textAlign: 'center' }}>
                                <Checkbox
                                  checked={granted}
                                  disabled={!selectedRole}
                                  onCheckedChange={(v) =>
                                    toggleMatrix(res, act, v === true)
                                  }
                                />
                              </Table.Cell>
                            )
                          })}
                        </Table.Row>
                      </Fragment>
                    ))}
                  </Table.Body>
                </Table.Root>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="hierarchy">
            <Card size="2">
              <Text size="3" weight="bold" mb="3">
                Иерархия наследования ролей
              </Text>
              <Flex direction="column" gap="3">
                {state.roles.map((r) => {
                  const parent = r.parentRoleId
                    ? state.roles.find((x) => x.id === r.parentRoleId)
                    : null
                  const children = state.roles.filter((x) => x.parentRoleId === r.id)
                  return (
                    <div key={r.id} className={styles.hierarchyCard}>
                      <Flex align="center" gap="2" wrap="wrap">
                        <Box
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: r.color,
                            flexShrink: 0,
                          }}
                        />
                        <Text weight="bold">{r.displayName}</Text>
                        <Badge size="1" variant="soft" color="gray">
                          приоритет {r.priority}
                        </Badge>
                        {parent ? (
                          <Text size="1" color="gray">
                            ← наследует от <Text color="ruby">{parent.displayName}</Text>
                          </Text>
                        ) : null}
                        {children.length > 0 ? (
                          <Text size="1" color="gray">
                            → дочерние:{' '}
                            {children.map((c) => (
                              <Text key={c.id} as="span" color="blue">
                                {c.displayName}{' '}
                              </Text>
                            ))}
                          </Text>
                        ) : null}
                        {r.isSystem ? (
                          <Badge size="1" color="gray" variant="soft" style={{ marginLeft: 'auto' }}>
                            Системная
                          </Badge>
                        ) : null}
                        {r.isDefault ? (
                          <Badge size="1" color="ruby" variant="soft">
                            По умолчанию
                          </Badge>
                        ) : null}
                      </Flex>
                    </div>
                  )
                })}
              </Flex>
            </Card>
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      <Dialog.Root
        open={roleModalOpen}
        onOpenChange={(open) => {
          if (!open) setRoleModalParam(null)
        }}
      >
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>Новая роль</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Системное имя (slug)
              </Text>
              <TextField.Root value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="content_editor" />
            </Box>
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Отображаемое название
              </Text>
              <TextField.Root value={newDisplay} onChange={(e) => setNewDisplay(e.target.value)} />
            </Box>
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Описание
              </Text>
              <TextField.Root value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </Box>
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Родительская роль
              </Text>
              <Select.Root value={newParent} onValueChange={setNewParent}>
                <Select.Trigger placeholder="Нет (корневая)" />
                <Select.Content>
                  <Select.Item value="_none">Нет (корневая роль)</Select.Item>
                  {state.roles.map((r) => (
                    <Select.Item key={r.id} value={r.id}>
                      {r.displayName}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
            <Flex gap="2" wrap="wrap">
              <Box style={{ flex: 1, minWidth: 120 }}>
                <Text size="2" weight="medium" mb="1" as="div">
                  Приоритет
                </Text>
                <TextField.Root
                  type="number"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" mb="1" as="div">
                  Цвет
                </Text>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  style={{ height: 36, width: 64, cursor: 'pointer', border: '1px solid var(--gray-a6)', borderRadius: 6 }}
                />
              </Box>
            </Flex>
            <Flex gap="4" wrap="wrap">
              <Flex align="center" gap="2">
                <Checkbox checked={newDefault} onCheckedChange={(v) => setNewDefault(v === true)} />
                <Text size="2">По умолчанию для новых</Text>
              </Flex>
              <Flex align="center" gap="2">
                <Checkbox checked={newSystem} onCheckedChange={(v) => setNewSystem(v === true)} />
                <Text size="2">Системная</Text>
              </Flex>
            </Flex>
            <Flex justify="end" gap="2" mt="2">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Отмена
                </Button>
              </Dialog.Close>
              <Button onClick={saveNewRole}>Создать</Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
