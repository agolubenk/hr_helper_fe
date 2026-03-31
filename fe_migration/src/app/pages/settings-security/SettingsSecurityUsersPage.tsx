import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import {
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  LockClosedIcon,
  LockOpen1Icon,
  Pencil1Icon,
  PlusIcon,
  ReloadIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'
import { resetRbacAdminMock, useRbacAdminMock } from '@/features/rbac-admin/rbacAdminMockStore'
import type { RbacSecurityUser, RbacUserStatus } from '@/features/rbac-admin/types'
import { useToast } from '@/components/Toast/ToastContext'
import { Link, useLocation, useNavigate } from '@/router-adapter'
import { SecurityUserForm } from '@/app/pages/settings-security/SecurityUserForm'
import styles from '@/app/pages/settings-security/rbacAdminPages.module.css'

const STATUS_META: Record<
  RbacUserStatus,
  { label: string; color: 'green' | 'red' | 'amber' | 'gray' }
> = {
  active: { label: 'Активен', color: 'green' },
  blocked: { label: 'Заблокирован', color: 'red' },
  pending: { label: 'Ожидает', color: 'amber' },
  inactive: { label: 'Неактивен', color: 'gray' },
}

type SortKey = 'name' | 'login'

function userSortKey(u: RbacSecurityUser, key: SortKey): string {
  if (key === 'login') return u.lastLoginLabel
  return `${u.lastName} ${u.firstName}`.toLowerCase()
}

export function SettingsSecurityUsersPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const createUserModalOpen = location.pathname === '/settings/users/new'
  const { showSuccess } = useToast()
  const { state, setState } = useRbacAdminMock()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  /** Увеличивается при клике «Роли» в строке — открывает ту же модалку редактирования и вложенный каталог ролей. */
  const [rolesCatalogOpenRequest, setRolesCatalogOpenRequest] = useState(0)

  const stats = useMemo(() => {
    const users = state.users
    const active = users.filter((u) => u.status === 'active').length
    const blocked = users.filter((u) => u.status === 'blocked').length
    const pending = users.filter((u) => u.status === 'pending').length
    return { total: users.length, active, blocked, pending }
  }, [state.users])

  const filtered = useMemo(() => {
    let list = state.users.filter((u) => {
      const q = query.trim().toLowerCase()
      const match =
        !q ||
        `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(q)
      const st = statusFilter === 'all' || u.status === statusFilter
      const roleOk =
        roleFilter === 'all' || u.roleLabels.includes(roleFilter)
      return match && st && roleOk
    })
    list = [...list].sort((a, b) => {
      const va = userSortKey(a, sortKey)
      const vb = userSortKey(b, sortKey)
      const cmp = va.localeCompare(vb, 'ru')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [state.users, query, statusFilter, roleFilter, sortKey, sortDir])

  const roleOptionsSorted = useMemo(
    () =>
      [...state.roles]
        .sort((a, b) => a.displayName.localeCompare(b.displayName, 'ru'))
        .map((r) => r.displayName),
    [state.roles]
  )

  const editingUser =
    dialogOpen && editingId ? state.users.find((u) => u.id === editingId) ?? null : null

  const openEdit = (u: RbacSecurityUser) => {
    setEditingId(u.id)
    setDialogOpen(true)
  }

  const openEditWithRolesCatalog = (u: RbacSecurityUser) => {
    setEditingId(u.id)
    setDialogOpen(true)
    setRolesCatalogOpenRequest((n) => n + 1)
  }

  const toggleBlock = (u: RbacSecurityUser) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((x) =>
        x.id === u.id
          ? { ...x, status: x.status === 'blocked' ? 'active' : 'blocked' }
          : x
      ),
    }))
    showSuccess(
      'Статус',
      u.status === 'blocked' ? `${u.firstName} разблокирован (мок).` : `${u.firstName} заблокирован (мок).`
    )
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <Box p={{ initial: '4', sm: '6' }} style={{ maxWidth: 1280 }}>
      <div className={styles.settingsPageHeaderRow}>
        <div className={styles.settingsPageHeaderText}>
          <Text size="6" weight="bold" className={styles.pageTitle}>
            Пользователи
          </Text>
          <Text as="p" size="2" color="gray" className={styles.pageIntro}>
            Учётные записи, роли и группы. Данные мока синхронизируются с разделами «Роли», «Права» и «Группы»
            через общее локальное хранилище.
          </Text>
        </div>
        <div className={styles.settingsPageHeaderActions}>
          <Button asChild>
            <Link href="/settings/users/new">
              <PlusIcon /> Создать пользователя
            </Link>
          </Button>
        </div>
      </div>

      <div className={styles.usersStatsContainer}>
        <Box
          role="button"
          tabIndex={0}
          className={`${styles.usersStatCard} ${statusFilter === 'all' ? styles.usersStatCardActive : ''}`}
          onClick={() => setStatusFilter('all')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setStatusFilter('all')
            }
          }}
        >
          <Flex align="center" justify="between">
            <Text size="3" weight="bold">
              {stats.total} Всего
            </Text>
            <FileTextIcon width={20} height={20} />
          </Flex>
        </Box>
        <Box
          role="button"
          tabIndex={0}
          className={`${styles.usersStatCard} ${statusFilter === 'active' ? styles.usersStatCardActive : ''}`}
          onClick={() => setStatusFilter('active')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setStatusFilter('active')
            }
          }}
        >
          <Flex align="center" justify="between">
            <Text size="3" weight="bold">
              {stats.active} Активных
            </Text>
            <CheckIcon width={20} height={20} style={{ color: '#10b981' }} />
          </Flex>
        </Box>
        <Box
          role="button"
          tabIndex={0}
          className={`${styles.usersStatCard} ${statusFilter === 'blocked' ? styles.usersStatCardActive : ''}`}
          onClick={() => setStatusFilter('blocked')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setStatusFilter('blocked')
            }
          }}
        >
          <Flex align="center" justify="between">
            <Text size="3" weight="bold">
              {stats.blocked} Заблокировано
            </Text>
            <LockClosedIcon width={20} height={20} />
          </Flex>
        </Box>
        <Box
          role="button"
          tabIndex={0}
          className={`${styles.usersStatCard} ${statusFilter === 'pending' ? styles.usersStatCardActive : ''}`}
          onClick={() => setStatusFilter('pending')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setStatusFilter('pending')
            }
          }}
        >
          <Flex align="center" justify="between">
            <Text size="3" weight="bold">
              {stats.pending} Ожидают
            </Text>
            <StopwatchIcon width={20} height={20} />
          </Flex>
        </Box>
      </div>

      <Flex gap="3" wrap="wrap" align="center" mb="3">
        <TextField.Root
          placeholder="Поиск по имени, email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 220, flex: '1 1 200px' }}
        />
        <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger style={{ minWidth: 160 }} placeholder="Статус" />
          <Select.Content>
            <Select.Item value="all">Все статусы</Select.Item>
            <Select.Item value="active">Активные</Select.Item>
            <Select.Item value="blocked">Заблокированные</Select.Item>
            <Select.Item value="pending">Ожидающие</Select.Item>
            <Select.Item value="inactive">Неактивные</Select.Item>
          </Select.Content>
        </Select.Root>
        <Select.Root value={roleFilter} onValueChange={setRoleFilter}>
          <Select.Trigger style={{ minWidth: 180 }} placeholder="Роль" />
          <Select.Content>
            <Select.Item value="all">Все роли</Select.Item>
            {roleOptionsSorted.map((r) => (
              <Select.Item key={r} value={r}>
                {r}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Button variant="soft" type="button" onClick={() => showSuccess('Экспорт', 'Выгрузка CSV (мок).')}>
          <DownloadIcon /> Экспорт
        </Button>
        <Button
          variant="outline"
          type="button"
          color="orange"
          onClick={() => {
            resetRbacAdminMock()
            showSuccess('Сброс', 'Данные RBAC-мока возвращены к исходным.')
          }}
        >
          <ReloadIcon /> Сброс мока
        </Button>
      </Flex>

      <div className={styles.tableWrap}>
        <Table.Root size="1" variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                <button
                  type="button"
                  className={styles.roleListItem}
                  style={{ padding: 0 }}
                  onClick={() => toggleSort('name')}
                >
                  Пользователь {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Роли</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Группы</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <button
                  type="button"
                  className={styles.roleListItem}
                  style={{ padding: 0 }}
                  onClick={() => toggleSort('login')}
                >
                  Последний вход {sortKey === 'login' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>2FA</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ width: 120 }} />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <Text size="2" color="gray" align="center">
                    Ничего не найдено — измените фильтры.
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              filtered.map((u) => {
                const st = STATUS_META[u.status]
                return (
                  <Table.Row key={u.id}>
                    <Table.Cell>
                      <Flex align="center" gap="3">
                        <Box
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            background: u.avatarColor,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {u.firstName[0]}
                          {u.lastName[0]}
                        </Box>
                        <Box>
                          <Text size="2" weight="medium">
                            {u.firstName} {u.lastName}
                          </Text>
                          <Text size="1" color="gray">
                            {u.email}
                          </Text>
                        </Box>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={st.color} variant="soft">
                        {st.label}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="1" wrap="wrap">
                        {u.roleLabels.map((r) => (
                          <Badge key={r} color="ruby" variant="soft" size="1">
                            {r}
                          </Badge>
                        ))}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="1" wrap="wrap">
                        {u.groupLabels.length === 0 ? (
                          <Text size="1" color="gray">
                            —
                          </Text>
                        ) : (
                          u.groupLabels.map((g) => (
                            <Badge key={g} color="blue" variant="soft" size="1">
                              {g}
                            </Badge>
                          ))
                        )}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="1" color="gray">
                        {u.lastLoginLabel}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      {u.mfaEnabled ? (
                        <Badge color="green" variant="soft" size="1">
                          Вкл
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="soft" size="1">
                          Выкл
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Flex className={styles.userRowActions}>
                        <Button
                          size="1"
                          variant="outline"
                          color="gray"
                          title="Редактировать"
                          aria-label="Редактировать пользователя"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil1Icon />
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color="ruby"
                          title="Открыть редактирование с полным каталогом ролей"
                          aria-label="Роли пользователя — каталог в карточке редактирования"
                          onClick={() => openEditWithRolesCatalog(u)}
                        >
                          Роли
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color={u.status === 'blocked' ? 'green' : 'orange'}
                          title={u.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                          aria-label={u.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                          onClick={() => toggleBlock(u)}
                        >
                          {u.status === 'blocked' ? <LockOpen1Icon /> : <LockClosedIcon />}
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <Text size="1" color="gray" mt="3">
        Показано {filtered.length} из {state.users.length}. Пагинация — визуальный мок (как в прототипе).
      </Text>

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingId(null)
        }}
      >
        <Dialog.Content
          style={{
            maxWidth: 640,
            maxHeight: 'min(92dvh, 960px)',
            overflow: 'auto',
          }}
        >
          <Dialog.Title>Редактирование пользователя</Dialog.Title>
          {editingUser ? (
            <>
              <Dialog.Description
                style={{
                  marginTop: 8,
                  marginBottom: 16,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: 'var(--gray-11)',
                }}
              >
                Карточка учётной записи: контакты, статус, 2FA, роли и группы. Кнопка «Роли» в таблице открывает эту
                же форму и вложенное окно с деревом ролей.
              </Dialog.Description>
              <Box
                mb="4"
                p="3"
                style={{
                  border: '1px solid var(--gray-a6)',
                  borderRadius: 'var(--radius-3)',
                  background: 'var(--gray-a2)',
                }}
              >
                <Text size="1" color="gray" as="div" mb="1">
                  Краткая сводка (из мока)
                </Text>
                <Text size="2" weight="medium" mb="1">
                  {editingUser.firstName} {editingUser.lastName}
                </Text>
                <Text size="2" color="gray" as="p" style={{ margin: '0 0 6px' }}>
                  {editingUser.email} · @{editingUser.username}
                </Text>
                <Text size="1" color="gray" as="p" style={{ margin: '0 0 8px', fontFamily: 'var(--font-mono, monospace)' }}>
                  id: {editingUser.id}
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Badge color={STATUS_META[editingUser.status].color} variant="soft" size="1">
                    {STATUS_META[editingUser.status].label}
                  </Badge>
                  <Badge color="ruby" variant="soft" size="1">
                    Ролей: {editingUser.roleLabels.length}
                  </Badge>
                  <Badge color="blue" variant="soft" size="1">
                    Групп: {editingUser.groupLabels.length}
                  </Badge>
                  <Badge color={editingUser.mfaEnabled ? 'green' : 'gray'} variant="soft" size="1">
                    2FA: {editingUser.mfaEnabled ? 'да' : 'нет'}
                  </Badge>
                  <Badge color="gray" variant="outline" size="1">
                    Вход: {editingUser.lastLoginLabel}
                  </Badge>
                </Flex>
              </Box>
              <SecurityUserForm
                key={editingUser.id}
                mode="edit"
                editingUser={editingUser}
                embeddedInDialog
                rolesCatalogOpenRequest={rolesCatalogOpenRequest}
                onSuccess={() => setDialogOpen(false)}
                onCancel={() => setDialogOpen(false)}
              />
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={createUserModalOpen}
        onOpenChange={(open) => {
          if (!open) navigate('/settings/users')
        }}
      >
        <Dialog.Content
          style={{
            maxWidth: 640,
            maxHeight: 'min(90dvh, 920px)',
            overflow: 'auto',
          }}
        >
          <Dialog.Title>Новый пользователь</Dialog.Title>
          <Dialog.Description
            style={{
              marginTop: 8,
              marginBottom: 16,
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--gray-11)',
            }}
          >
            Заполните учётную запись, корпоративный email, роли и группы. После сохранения запись появится в общем
            списке.
          </Dialog.Description>
          {createUserModalOpen ? (
            <Box
              p="4"
              style={{
                border: '1px solid var(--gray-a6)',
                borderRadius: 'var(--radius-3)',
                background: 'var(--color-panel)',
              }}
            >
              <SecurityUserForm
                mode="create"
                editingUser={null}
                embeddedInDialog
                onSuccess={() => navigate('/settings/users')}
                onCancel={() => navigate('/settings/users')}
              />
            </Box>
          ) : null}
        </Dialog.Content>
      </Dialog.Root>

    </Box>
  )
}
