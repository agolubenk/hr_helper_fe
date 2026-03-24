'use client'

import {
  Flex,
  Text,
  Button,
  Box,
  TextField,
  Select,
  Badge,
  Table,
  Avatar,
} from '@radix-ui/themes'
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  CheckIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
  GearIcon,
} from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import UserAccessModal, { type AccessRights } from '@/components/company-settings/UserAccessModal'
import { useToast } from '@/components/Toast/ToastContext'
import { AVAILABLE_COMPANY_USER_GROUPS, fetchCompanyUsersMock } from './mocks'
import type { CompanyUser } from './types'
import styles from './CompanyUsersSettings.module.css'

const emptyNewUser = (): Partial<CompanyUser> => ({
  email: '',
  first_name: '',
  last_name: '',
  position: '',
  groups: [],
  is_active: true,
})

export function CompanyUsersSettings() {
  const toast = useToast()
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null)
  const [accessModalOpen, setAccessModalOpen] = useState(false)
  const [userForAccessModal, setUserForAccessModal] = useState<CompanyUser | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState<Partial<CompanyUser>>(emptyNewUser)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchCompanyUsersMock()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const handleAddUser = async () => {
    if (!newUser.email?.trim() || !newUser.first_name?.trim() || !newUser.last_name?.trim()) {
      toast.showWarning('Обязательные поля', 'Укажите email, имя и фамилию')
      return
    }

    setSaving(true)
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      const id = `u-${Date.now()}`
      const created: CompanyUser = {
        id,
        email: newUser.email.trim(),
        first_name: newUser.first_name.trim(),
        last_name: newUser.last_name.trim(),
        position: (newUser.position ?? '').trim(),
        groups: newUser.groups?.length ? [...newUser.groups] : [],
        is_active: newUser.is_active ?? true,
        last_login: null,
        created_at: new Date().toISOString(),
      }
      setUsers((prev) => [...prev, created])
      setShowAddForm(false)
      setNewUser(emptyNewUser())
      toast.showSuccess('Создано', 'Пользователь добавлен')
    } catch {
      toast.showError('Ошибка', 'Не удалось создать пользователя')
    } finally {
      setSaving(false)
    }
  }

  const handleEditUser = async (user: CompanyUser) => {
    setSaving(true)
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
      setEditingUser(null)
      toast.showSuccess('Сохранено', 'Данные пользователя обновлены')
    } catch {
      toast.showError('Ошибка', 'Не удалось обновить пользователя')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = (id: string) => {
    toast.showWarning('Удалить пользователя?', 'Вы уверены, что хотите удалить этого пользователя?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => void performDeleteUser(id), variant: 'solid', color: 'red' },
      ],
    })
  }

  const performDeleteUser = async (id: string) => {
    try {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      if (editingUser?.id === id) {
        setEditingUser(null)
      }
      if (userForAccessModal?.id === id) {
        setUserForAccessModal(null)
        setAccessModalOpen(false)
      }
    } catch {
      toast.showError('Ошибка', 'Ошибка при удалении пользователя')
    }
  }

  const openAccessModal = (u: CompanyUser) => {
    const latest = users.find((x) => x.id === u.id) ?? u
    setUserForAccessModal(latest)
    setAccessModalOpen(true)
  }

  const handleAccessModalOpenChange = (open: boolean) => {
    setAccessModalOpen(open)
    if (!open) {
      setUserForAccessModal(null)
    }
  }

  const handleApplyAccess = (access: AccessRights) => {
    if (!userForAccessModal) return

    setEditingUser((prev) =>
      prev?.id === userForAccessModal.id ? { ...prev, access } : prev,
    )
    setUsers((prev) =>
      prev.map((u) => (u.id === userForAccessModal.id ? { ...u, access } : u)),
    )

    toast.showSuccess('Сохранено', 'Права доступа обновлены')
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.position.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Никогда'
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

  const pageHeader = (
    <Box>
      <Flex align="center" gap="2" mb="2">
        <Text size="2">👥</Text>
        <Text size="8" weight="bold">
          Пользователи
        </Text>
      </Flex>
      <Text size="3" color="gray">
        Управление пользователями системы: добавление, редактирование и удаление учётных записей
      </Text>
    </Box>
  )

  if (loading) {
    return (
      <Flex direction="column" gap="4" className={styles.page}>
        {pageHeader}
        <Flex align="center" justify="center" className={styles.loadingArea}>
          <Text size="3" color="gray">
            Загрузка...
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="4" className={styles.page}>
      {pageHeader}

      <Flex gap="3" align="center">
        <Box style={{ flex: 1, maxWidth: '400px' }}>
          <TextField.Root
            size="3"
            placeholder="Поиск пользователей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
        </Box>
        <Button size="3" onClick={() => setShowAddForm(!showAddForm)}>
          <PlusIcon width={16} height={16} />
          Добавить пользователя
        </Button>
      </Flex>

      {showAddForm && (
        <Box className={styles.addFormPanel}>
          <Flex direction="column" gap="3">
            <Text size="5" weight="bold">
              Добавить пользователя
            </Text>

            <Flex gap="3" wrap="wrap">
              <Box style={{ flex: '1 1 300px' }}>
                <Text size="2" weight="medium" mb="1" as="div">
                  Email *
                </Text>
                <TextField.Root
                  size="2"
                  placeholder="email@example.com"
                  value={newUser.email || ''}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </Box>
              <Box style={{ flex: '1 1 300px' }}>
                <Text size="2" weight="medium" mb="1" as="div">
                  Имя *
                </Text>
                <TextField.Root
                  size="2"
                  placeholder="Имя"
                  value={newUser.first_name || ''}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                />
              </Box>
              <Box style={{ flex: '1 1 300px' }}>
                <Text size="2" weight="medium" mb="1" as="div">
                  Фамилия *
                </Text>
                <TextField.Root
                  size="2"
                  placeholder="Фамилия"
                  value={newUser.last_name || ''}
                  onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                />
              </Box>
              <Box style={{ flex: '1 1 300px' }}>
                <Text size="2" weight="medium" mb="1" as="div">
                  Должность
                </Text>
                <TextField.Root
                  size="2"
                  placeholder="Должность"
                  value={newUser.position || ''}
                  onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                />
              </Box>
            </Flex>

            <Flex gap="2" align="center">
              <Button size="2" onClick={() => void handleAddUser()} disabled={saving}>
                <CheckIcon width={16} height={16} />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                size="2"
                variant="soft"
                color="gray"
                onClick={() => {
                  setShowAddForm(false)
                  setNewUser(emptyNewUser())
                }}
              >
                <Cross2Icon width={16} height={16} />
                Отмена
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      {users.length === 0 ? (
        <Flex direction="column" align="center" justify="center" gap="3" className={styles.emptyState}>
          <Text size="8" style={{ opacity: 0.3 }}>
            👤
          </Text>
          <Text size="4" color="gray">
            Нет пользователей
          </Text>
          <Text size="2" color="gray">
            Добавьте первого пользователя или обновите список
          </Text>
          <Button size="2" variant="soft" onClick={() => void loadUsers()}>
            Загрузить снова
          </Button>
        </Flex>
      ) : filteredUsers.length === 0 ? (
        <Box className={styles.tableWrap}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Пользователь</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Должность</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Группы</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Последний вход</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className={styles.actionsCol}>Действия</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell colSpan={7} className={styles.emptyCell}>
                  <Text color="gray">Пользователи не найдены</Text>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Box>
      ) : (
        <Box className={styles.tableWrap}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Пользователь</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Должность</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Группы</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>{editingUser ? 'Доступы' : 'Последний вход'}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className={styles.actionsCol}>Действия</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredUsers.map((user) => (
                <Table.Row key={user.id}>
                  {editingUser?.id === user.id ? (
                    <>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <Avatar size="2" fallback={getInitials(user.first_name, user.last_name)} />
                          <Flex direction="column" gap="1">
                            <TextField.Root
                              size="1"
                              placeholder="Имя"
                              value={editingUser.first_name}
                              onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                            />
                            <TextField.Root
                              size="1"
                              placeholder="Фамилия"
                              value={editingUser.last_name}
                              onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                            />
                          </Flex>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" color="gray">
                          {user.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          size="1"
                          placeholder="Должность"
                          value={editingUser.position}
                          onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Select.Root
                          value={editingUser.groups[0] || 'none'}
                          onValueChange={(value) =>
                            setEditingUser({
                              ...editingUser,
                              groups: value === 'none' ? [] : [value],
                            })
                          }
                        >
                          <Select.Trigger />
                          <Select.Content>
                            <Select.Item value="none">Без группы</Select.Item>
                            {AVAILABLE_COMPANY_USER_GROUPS.map((group) => (
                              <Select.Item key={group} value={group}>
                                {group}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <Select.Root
                          value={editingUser.is_active ? 'active' : 'inactive'}
                          onValueChange={(value) =>
                            setEditingUser({ ...editingUser, is_active: value === 'active' })
                          }
                        >
                          <Select.Trigger />
                          <Select.Content>
                            <Select.Item value="active">Активен</Select.Item>
                            <Select.Item value="inactive">Неактивен</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <Button size="1" variant="soft" onClick={() => openAccessModal(editingUser)}>
                          Доступы
                        </Button>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="1">
                          <Button
                            size="1"
                            variant="soft"
                            color="green"
                            onClick={() => void handleEditUser(editingUser)}
                            disabled={saving}
                          >
                            <CheckIcon width={12} height={12} />
                          </Button>
                          <Button size="1" variant="soft" color="gray" onClick={() => setEditingUser(null)}>
                            <Cross2Icon width={12} height={12} />
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </>
                  ) : (
                    <>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <Avatar size="2" fallback={getInitials(user.first_name, user.last_name)} />
                          <Text size="2">
                            {user.first_name} {user.last_name}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{user.email}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{user.position || '-'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="1" wrap="wrap">
                          {user.groups.length > 0 ? (
                            user.groups.map((group) => (
                              <Badge key={group} size="1" variant="soft">
                                {group}
                              </Badge>
                            ))
                          ) : (
                            <Text size="1" color="gray">
                              Без группы
                            </Text>
                          )}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge size="1" color={user.is_active ? 'green' : 'red'} variant="soft">
                          {user.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {editingUser ? (
                          <Text size="1" color="gray">
                            —
                          </Text>
                        ) : (
                          <Text size="1" color="gray">
                            {formatDate(user.last_login)}
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="1" wrap="wrap">
                          <Button
                            size="1"
                            variant="soft"
                            title="Доступы к модулям (без режима редактирования)"
                            aria-label="Доступы к модулям"
                            onClick={() => openAccessModal(user)}
                          >
                            <GearIcon width={12} height={12} />
                          </Button>
                          <Button size="1" variant="soft" onClick={() => setEditingUser({ ...user })}>
                            <Pencil1Icon width={12} height={12} />
                          </Button>
                          <Button size="1" variant="soft" color="red" onClick={() => handleDeleteUser(user.id)}>
                            <TrashIcon width={12} height={12} />
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      <UserAccessModal
        open={accessModalOpen}
        onOpenChange={handleAccessModalOpenChange}
        userName={
          userForAccessModal ? `${userForAccessModal.first_name} ${userForAccessModal.last_name}` : ''
        }
        initialAccess={userForAccessModal?.access}
        onApply={handleApplyAccess}
      />
    </Flex>
  )
}
