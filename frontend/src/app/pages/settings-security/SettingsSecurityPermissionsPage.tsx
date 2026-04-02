import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'
import { getFullPermissionList, useRbacAdminMock } from '@/features/rbac-admin/rbacAdminMockStore'
import type { RbacAction, RbacPermissionEntry, RbacPermissionScope } from '@/features/rbac-admin/types'
import { RBAC_RESOURCE_IDS } from '@/features/rbac-admin/types'
import { RBAC_ACTION_LABELS, RBAC_RESOURCE_LABELS } from '@/features/rbac-admin/resourceLabels'
import { useToast } from '@/components/Toast/ToastContext'
import styles from '@/app/pages/settings-security/rbacAdminPages.module.css'

const ACTION_FILTER_ALL = 'all'

const ACTION_BADGE_COLOR = (
  a: RbacAction
): 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'purple' => {
  if (a === 'manage') return 'red'
  if (a === 'delete') return 'amber'
  if (a === 'read') return 'green'
  return 'blue'
}

export function SettingsSecurityPermissionsPage() {
  const { showSuccess, showError } = useToast()
  const { state, setState } = useRbacAdminMock()
  const [query, setQuery] = useState('')
  const [resourceFilter, setResourceFilter] = useState<string>(ACTION_FILTER_ALL)
  const [actionFilter, setActionFilter] = useState<string>(ACTION_FILTER_ALL)
  const [modalOpen, setModalOpen] = useState(false)
  const [permResource, setPermResource] = useState('')
  const [permAction, setPermAction] = useState<RbacAction>('read')
  const [permScope, setPermScope] = useState<RbacPermissionScope>('all')
  const [permDesc, setPermDesc] = useState('')
  const [permConditions, setPermConditions] = useState('')
  const [permSystem, setPermSystem] = useState(false)

  const fullList = useMemo(() => getFullPermissionList(state), [state])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return fullList.filter((p) => {
      const text = `${p.resource} ${p.action} ${p.description}`.toLowerCase()
      const matchQ = !q || text.includes(q)
      const matchR = resourceFilter === ACTION_FILTER_ALL || p.resource === resourceFilter
      const matchA = actionFilter === ACTION_FILTER_ALL || p.action === actionFilter
      return matchQ && matchR && matchA
    })
  }, [fullList, query, resourceFilter, actionFilter])

  const grouped = useMemo(() => {
    const m = new Map<string, RbacPermissionEntry[]>()
    for (const p of filtered) {
      const list = m.get(p.resource) ?? []
      list.push(p)
      m.set(p.resource, list)
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const saveCustomPermission = () => {
    const res = permResource.trim().toLowerCase().replace(/\s+/g, '_')
    if (!res) {
      showError('Право', 'Укажите ресурс.')
      return
    }
    const id = `custom:${res}:${permAction}:${Date.now()}`
    const entry: RbacPermissionEntry = {
      id,
      resource: res,
      action: permAction,
      scope: permScope,
      description: permDesc.trim() || `${RBAC_ACTION_LABELS[permAction]} — ${res}`,
      isSystem: permSystem,
      roleDisplayNames: [],
    }
    setState((prev) => ({
      ...prev,
      customPermissions: [...prev.customPermissions, entry],
    }))
    setModalOpen(false)
    showSuccess('Право', `Создано право ${res}:${permAction} (мок).`)
  }

  return (
    <Box p={{ initial: '4', sm: '6' }} style={{ maxWidth: 1280 }}>
      <Flex justify="between" align="start" gap="4" wrap="wrap" mb="4">
        <Box>
          <Text size="6" weight="bold" className={styles.pageTitle}>
            Права доступа
          </Text>
          <Text size="2" color="gray" style={{ maxWidth: '60ch' }}>
            Реестр атомарных разрешений: производные из матрицы ролей плюс пользовательские записи (для
            аудита и экспорта в IAM).
          </Text>
        </Box>
        <Button onClick={() => setModalOpen(true)}>
          <PlusIcon /> Новое право
        </Button>
      </Flex>

      <Flex gap="3" wrap="wrap" mb="4">
        <TextField.Root
          placeholder="Поиск по ресурсу, действию, описанию…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 240, flex: '1 1 200px' }}
        />
        <Select.Root value={resourceFilter} onValueChange={setResourceFilter}>
          <Select.Trigger style={{ minWidth: 200 }} />
          <Select.Content>
            <Select.Item value={ACTION_FILTER_ALL}>Все ресурсы</Select.Item>
            {RBAC_RESOURCE_IDS.map((r) => (
              <Select.Item key={r} value={r}>
                {RBAC_RESOURCE_LABELS[r]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Select.Root value={actionFilter} onValueChange={setActionFilter}>
          <Select.Trigger style={{ minWidth: 160 }} />
          <Select.Content>
            <Select.Item value={ACTION_FILTER_ALL}>Все действия</Select.Item>
            {(Object.keys(RBAC_ACTION_LABELS) as RbacAction[]).map((a) => (
              <Select.Item key={a} value={a}>
                {RBAC_ACTION_LABELS[a]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      {grouped.length === 0 ? (
        <Text size="2" color="gray">
          Нет прав по фильтрам.
        </Text>
      ) : (
        grouped.map(([res, perms]) => (
          <Card key={res} size="2" mb="4" variant="surface">
            <Flex align="center" gap="2" mb="3" pb="2" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
              <Text size="3" weight="bold">
                {RBAC_RESOURCE_LABELS[res as keyof typeof RBAC_RESOURCE_LABELS] ?? res}
              </Text>
              <Badge variant="soft" color="gray">
                {perms.length} прав
              </Badge>
            </Flex>
            <div className={styles.tableWrap}>
              <Table.Root size="1" variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Действие</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Область</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Роли</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: 88 }} />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {perms.map((p) => (
                    <Table.Row key={p.id}>
                      <Table.Cell>
                        <Badge color={ACTION_BADGE_COLOR(p.action)} variant="soft">
                          {p.action}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="soft" color="gray">
                          {p.scope}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="1" color="gray">
                          {p.description}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="1" wrap="wrap">
                          {p.roleDisplayNames.slice(0, 3).map((r) => (
                            <Badge key={r} size="1" color="ruby" variant="soft">
                              {r}
                            </Badge>
                          ))}
                          {p.roleDisplayNames.length > 3 ? (
                            <Badge size="1" variant="soft">
                              +{p.roleDisplayNames.length - 3}
                            </Badge>
                          ) : null}
                          {p.roleDisplayNames.length === 0 ? (
                            <Text size="1" color="gray">
                              —
                            </Text>
                          ) : null}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        {p.isSystem ? (
                          <Badge color="gray" variant="soft" size="1">
                            Системное
                          </Badge>
                        ) : (
                          <Badge color="blue" variant="soft" size="1">
                            Пользовательское
                          </Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="1">
                          <Button
                            size="1"
                            variant="ghost"
                            onClick={() => showSuccess('Право', 'Редактирование (мок).')}
                          >
                            <Pencil1Icon />
                          </Button>
                          {!p.isSystem ? (
                            <Button
                              size="1"
                              variant="ghost"
                              color="red"
                              onClick={() => {
                                setState((prev) => ({
                                  ...prev,
                                  customPermissions: prev.customPermissions.filter((x) => x.id !== p.id),
                                }))
                                showSuccess('Право', 'Удалено (мок).')
                              }}
                            >
                              <TrashIcon />
                            </Button>
                          ) : null}
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
          </Card>
        ))
      )}

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>Новое право доступа</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Flex gap="2" wrap="wrap">
              <Box style={{ flex: '1 1 160px' }}>
                <Text size="2" weight="medium" mb="1" as="div">
                  Ресурс
                </Text>
                <TextField.Root
                  value={permResource}
                  onChange={(e) => setPermResource(e.target.value)}
                  placeholder="custom_module"
                />
              </Box>
              <Box style={{ flex: '1 1 140px' }}>
                <Text size="2" weight="medium" mb="1" as="div">
                  Действие
                </Text>
                <Select.Root
                  value={permAction}
                  onValueChange={(v) => setPermAction(v as RbacAction)}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {(Object.keys(RBAC_ACTION_LABELS) as RbacAction[]).map((a) => (
                      <Select.Item key={a} value={a}>
                        {RBAC_ACTION_LABELS[a]}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Область применения
              </Text>
              <Select.Root
                value={permScope}
                onValueChange={(v) => setPermScope(v as RbacPermissionScope)}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="own">own — только свои объекты</Select.Item>
                  <Select.Item value="group">group — в пределах группы</Select.Item>
                  <Select.Item value="all">all — все объекты</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Описание
              </Text>
              <TextField.Root value={permDesc} onChange={(e) => setPermDesc(e.target.value)} />
            </Box>
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Условия (ABAC, JSON) — опционально
              </Text>
              <TextField.Root
                value={permConditions}
                onChange={(e) => setPermConditions(e.target.value)}
                placeholder='{"department":"finance"}'
              />
            </Box>
            <Flex align="center" gap="2">
              <Checkbox checked={permSystem} onCheckedChange={(v) => setPermSystem(v === true)} />
              <Text size="2">Системное право</Text>
            </Flex>
            <Flex justify="end" gap="2" mt="2">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Отмена
                </Button>
              </Dialog.Close>
              <Button onClick={saveCustomPermission}>Создать</Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
