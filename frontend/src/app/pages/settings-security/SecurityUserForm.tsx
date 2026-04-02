import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  Flex,
  IconButton,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  RoleHierarchyCheckboxList,
  RoleHierarchyPicker,
} from '@/features/rbac-admin/components/RoleHierarchyPicker'
import {
  COMPANY_EMAIL_DOMAINS,
  composeCompanyEmail,
  CUSTOM_EMAIL_DOMAIN_SENTINEL,
  parseCompanyEmail,
} from '@/features/rbac-admin/companyEmail'
import { collectAllGroupNames } from '@/features/rbac-admin/groupTreeUtils'
import { useRbacAdminMock } from '@/features/rbac-admin/rbacAdminMockStore'
import type { RbacSecurityUser, RbacUserStatus } from '@/features/rbac-admin/types'
import { useToast } from '@/components/Toast/ToastContext'
import styles from '@/app/pages/settings-security/rbacAdminPages.module.css'

export interface SecurityUserFormProps {
  mode: 'create' | 'edit'
  editingUser: RbacSecurityUser | null
  onSuccess: () => void
  onCancel: () => void
  /** Кнопка «Отмена» обёрнута в Dialog.Close (только внутри Dialog). */
  embeddedInDialog?: boolean
  /**
   * Увеличивается при вызове «Роли» в таблице: открыть вложенный каталог ролей (внутри модалки редактирования).
   * 0 — не открывать автоматически.
   */
  rolesCatalogOpenRequest?: number
}

const STATUS_LABELS: Record<RbacUserStatus, string> = {
  active: 'Активен',
  blocked: 'Заблокирован',
  pending: 'Ожидает активации',
  inactive: 'Неактивен',
}

export function SecurityUserForm({
  mode,
  editingUser,
  onSuccess,
  onCancel,
  embeddedInDialog = false,
  rolesCatalogOpenRequest = 0,
}: SecurityUserFormProps) {
  const { showSuccess, showError } = useToast()
  const { state, setState } = useRbacAdminMock()
  const [formFirst, setFormFirst] = useState('')
  const [formLast, setFormLast] = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formStatus, setFormStatus] = useState<RbacUserStatus>('active')
  const [formMfa, setFormMfa] = useState(false)
  const [formEmailLocal, setFormEmailLocal] = useState('')
  const [formEmailDomainChoice, setFormEmailDomainChoice] = useState<string>(COMPANY_EMAIL_DOMAINS[0])
  const [formEmailCustom, setFormEmailCustom] = useState('')
  const [formRoleLabels, setFormRoleLabels] = useState<string[]>([])
  const [formGroupLabels, setFormGroupLabels] = useState<string[]>([])
  const [rolesCatalogOpen, setRolesCatalogOpen] = useState(false)
  const rolesCatalogSnapshotRef = useRef<string[]>([])
  const lastProcessedRolesCatalogRequestRef = useRef(0)
  const rolesCatalogCloseIntentRef = useRef<'keep' | null>(null)

  const groupNameOptions = useMemo(
    () => [...new Set(collectAllGroupNames(state.groupTree))].sort((a, b) => a.localeCompare(b, 'ru')),
    [state.groupTree]
  )

  const composedFormEmail = useMemo((): string => {
    if (formEmailDomainChoice === CUSTOM_EMAIL_DOMAIN_SENTINEL) {
      return composeCompanyEmail({ mode: 'custom', full: formEmailCustom })
    }
    const domain = (COMPANY_EMAIL_DOMAINS as readonly string[]).includes(formEmailDomainChoice)
      ? (formEmailDomainChoice as (typeof COMPANY_EMAIL_DOMAINS)[number])
      : COMPANY_EMAIL_DOMAINS[0]
    return composeCompanyEmail({ mode: 'company', local: formEmailLocal, domain })
  }, [formEmailCustom, formEmailDomainChoice, formEmailLocal])

  useEffect(() => {
    if (mode === 'create' || !editingUser) {
      setFormFirst('')
      setFormLast('')
      setFormUsername('')
      setFormStatus('active')
      setFormMfa(false)
      setFormEmailLocal('')
      setFormEmailDomainChoice(COMPANY_EMAIL_DOMAINS[0])
      setFormEmailCustom('')
      setFormRoleLabels(['Наблюдатель'])
      setFormGroupLabels([])
      return
    }
    setFormFirst(editingUser.firstName)
    setFormLast(editingUser.lastName)
    setFormUsername(editingUser.username)
    setFormStatus(editingUser.status)
    setFormMfa(editingUser.mfaEnabled)
    const parsed = parseCompanyEmail(editingUser.email)
    if (parsed.mode === 'company') {
      setFormEmailLocal(parsed.local)
      setFormEmailDomainChoice(parsed.domain)
      setFormEmailCustom('')
    } else {
      setFormEmailDomainChoice(CUSTOM_EMAIL_DOMAIN_SENTINEL)
      setFormEmailCustom(parsed.full)
      setFormEmailLocal('')
    }
    setFormRoleLabels([...editingUser.roleLabels])
    setFormGroupLabels([...editingUser.groupLabels])
  }, [mode, editingUser])

  useEffect(() => {
    if (mode !== 'edit' || !editingUser) return
    if (rolesCatalogOpenRequest <= 0) return
    if (rolesCatalogOpenRequest <= lastProcessedRolesCatalogRequestRef.current) return
    lastProcessedRolesCatalogRequestRef.current = rolesCatalogOpenRequest
    const labels = [...editingUser.roleLabels]
    rolesCatalogSnapshotRef.current = labels
    setFormRoleLabels(labels)
    setRolesCatalogOpen(true)
  }, [mode, editingUser?.id, rolesCatalogOpenRequest])

  const openRolesCatalog = () => {
    rolesCatalogSnapshotRef.current = [...formRoleLabels]
    setRolesCatalogOpen(true)
  }

  const closeRolesCatalogKeep = () => {
    rolesCatalogCloseIntentRef.current = 'keep'
    setRolesCatalogOpen(false)
  }

  const closeRolesCatalogRevert = () => {
    rolesCatalogCloseIntentRef.current = null
    setRolesCatalogOpen(false)
  }

  const handleRolesCatalogOpenChange = (open: boolean) => {
    if (!open) {
      const keep = rolesCatalogCloseIntentRef.current === 'keep'
      rolesCatalogCloseIntentRef.current = null
      if (!keep) {
        setFormRoleLabels([...rolesCatalogSnapshotRef.current])
      }
    }
    setRolesCatalogOpen(open)
  }

  const toggleCatalogRole = (displayName: string, checked: boolean) => {
    setFormRoleLabels((prev) => {
      if (checked) return prev.includes(displayName) ? prev : [...prev, displayName]
      return prev.filter((r) => r !== displayName)
    })
  }

  const handleRolesCatalogDone = () => {
    if (formRoleLabels.length === 0) {
      showError('Роли', 'Нужна хотя бы одна роль.')
      return
    }
    closeRolesCatalogKeep()
  }

  const handleSubmit = () => {
    if (!formFirst.trim() || !formLast.trim()) {
      showError('Форма', 'Укажите имя и фамилию.')
      return
    }
    const emailValue = composedFormEmail
    if (!emailValue.trim()) {
      showError('Форма', 'Укажите email.')
      return
    }
    if (formRoleLabels.length === 0) {
      showError('Роли', 'Нужна хотя бы одна роль.')
      return
    }
    const emailTrim = emailValue.trim()
    const usernameFromEmail =
      emailTrim.includes('@') && emailTrim.indexOf('@') > 0
        ? emailTrim.slice(0, emailTrim.indexOf('@'))
        : emailTrim

    if (mode === 'edit' && editingUser) {
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                firstName: formFirst.trim(),
                lastName: formLast.trim(),
                email: emailTrim,
                username: formUsername.trim() || usernameFromEmail,
                status: formStatus,
                mfaEnabled: formMfa,
                roleLabels: [...formRoleLabels],
                groupLabels: [...formGroupLabels],
              }
            : u
        ),
      }))
      showSuccess('Сохранено (мок)', 'Пользователь обновлён.')
    } else {
      const id = `u-${Date.now()}`
      const newUser: RbacSecurityUser = {
        id,
        firstName: formFirst.trim(),
        lastName: formLast.trim(),
        email: emailTrim,
        username: formUsername.trim() || usernameFromEmail || 'user',
        status: formStatus,
        roleLabels: formRoleLabels.length > 0 ? [...formRoleLabels] : ['Наблюдатель'],
        groupLabels: [...formGroupLabels],
        mfaEnabled: formMfa,
        lastLoginLabel: '—',
        avatarColor: '#2563eb',
      }
      setState((prev) => ({ ...prev, users: [...prev.users, newUser] }))
      showSuccess('Сохранено (мок)', 'Пользователь создан.')
    }
    onSuccess()
  }

  return (
    <Flex direction="column" gap="3" mt={embeddedInDialog ? '3' : '0'}>
      {mode === 'edit' && editingUser ? (
        <Dialog.Root open={rolesCatalogOpen} onOpenChange={handleRolesCatalogOpenChange}>
          <Dialog.Content className={styles.rolesNestedDialogContent} style={{ maxWidth: 520 }}>
            <Dialog.Title>Назначение ролей</Dialog.Title>
            <Dialog.Description
              style={{
                marginTop: 6,
                marginBottom: 12,
                fontSize: 13,
                lineHeight: 1.45,
                color: 'var(--gray-11)',
              }}
            >
              Вложенное окно открыто из карточки редактирования. Иерархия совпадает с разделом «Роли» (мок). Закрытие
              по клику вне окна или Escape отменяет несохранённые в каталоге правки; «Готово» фиксирует выбор в
              черновике формы — затем нажмите «Сохранить» в основной модалке.
            </Dialog.Description>
            <Flex direction="column" gap="2" mb="3">
              <Text size="2" color="gray" as="p" style={{ margin: 0 }}>
                Пользователь:{' '}
                <Text weight="bold" as="span">
                  {editingUser.firstName} {editingUser.lastName}
                </Text>
              </Text>
              <Text size="2" color="gray" as="p" style={{ margin: 0 }}>
                Email: <Text weight="medium">{editingUser.email}</Text>
                {' · '}
                Логин: <Text weight="medium">{editingUser.username}</Text>
              </Text>
              <Text size="1" color="gray" as="p" style={{ margin: 0, fontFamily: 'var(--font-mono, monospace)' }}>
                ID: {editingUser.id}
              </Text>
              <Flex gap="2" wrap="wrap" align="center">
                <Badge color="gray" variant="soft" size="1">
                  Статус: {STATUS_LABELS[editingUser.status]}
                </Badge>
                <Badge color={editingUser.mfaEnabled ? 'green' : 'gray'} variant="soft" size="1">
                  2FA: {editingUser.mfaEnabled ? 'включена' : 'выключена'}
                </Badge>
                <Badge color="ruby" variant="soft" size="1">
                  Выбрано ролей: {formRoleLabels.length}
                </Badge>
                <Badge color="gray" variant="outline" size="1">
                  Последний вход: {editingUser.lastLoginLabel}
                </Badge>
              </Flex>
              <Text size="2" color="gray" as="p" style={{ margin: 0, lineHeight: 1.45 }}>
                Отметьте прямые назначения ролей. Связи родитель — потомок отображаются в дереве. Права с групп
                пользователя настраиваются в блоке «Группы» основной формы.
              </Text>
              {editingUser.groupLabels.length > 0 ? (
                <Text size="2" color="gray" as="p" style={{ margin: 0 }}>
                  Текущие группы: <Text weight="medium">{editingUser.groupLabels.join(', ')}</Text>
                </Text>
              ) : (
                <Text size="2" color="gray" as="p" style={{ margin: 0 }}>
                  Группы не назначены.
                </Text>
              )}
            </Flex>
            <Box mb="4" className={styles.rolesNestedDialogTree}>
              <RoleHierarchyCheckboxList
                roles={state.roles}
                selectedLabels={formRoleLabels}
                onToggle={toggleCatalogRole}
              />
            </Box>
            <Flex justify="end" gap="2">
              <Button type="button" variant="soft" color="gray" onClick={closeRolesCatalogRevert}>
                Отмена
              </Button>
              <Button type="button" onClick={handleRolesCatalogDone}>
                Готово
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      ) : null}
      <Flex gap="2" wrap="wrap">
        <Box style={{ flex: '1 1 140px' }}>
          <Text size="2" weight="medium" mb="1" as="div">
            Имя
          </Text>
          <TextField.Root value={formFirst} onChange={(e) => setFormFirst(e.target.value)} />
        </Box>
        <Box style={{ flex: '1 1 140px' }}>
          <Text size="2" weight="medium" mb="1" as="div">
            Фамилия
          </Text>
          <TextField.Root value={formLast} onChange={(e) => setFormLast(e.target.value)} />
        </Box>
      </Flex>
      <Box>
        <Text size="2" weight="medium" mb="1" as="div">
          Email (домены компании)
        </Text>
        <Text size="1" color="gray" mb="2" as="p" style={{ margin: '0 0 8px' }}>
          Локальная часть и домен из справочника организации; при необходимости — произвольный адрес.
        </Text>
        {formEmailDomainChoice === CUSTOM_EMAIL_DOMAIN_SENTINEL ? (
          <TextField.Root
            type="email"
            placeholder="user@partner.com"
            value={formEmailCustom}
            onChange={(e) => setFormEmailCustom(e.target.value)}
          />
        ) : (
          <Flex gap="2" wrap="wrap" align="start">
            <Box style={{ flex: '1 1 160px', minWidth: 140 }}>
              <TextField.Root
                placeholder="ivan.petrov"
                value={formEmailLocal}
                onChange={(e) => setFormEmailLocal(e.target.value)}
              />
            </Box>
            <Box style={{ flex: '0 1 200px', minWidth: 160 }}>
              <Select.Root
                value={formEmailDomainChoice}
                onValueChange={(v) => {
                  if (
                    v === CUSTOM_EMAIL_DOMAIN_SENTINEL &&
                    formEmailDomainChoice !== CUSTOM_EMAIL_DOMAIN_SENTINEL
                  ) {
                    const dom = (COMPANY_EMAIL_DOMAINS as readonly string[]).includes(
                      formEmailDomainChoice
                    )
                      ? formEmailDomainChoice
                      : COMPANY_EMAIL_DOMAINS[0]
                    const loc = formEmailLocal.trim()
                    setFormEmailCustom(loc ? `${loc}@${dom}` : '')
                  }
                  setFormEmailDomainChoice(v)
                }}
              >
                <Select.Trigger placeholder="Домен" />
                <Select.Content position="popper">
                  {COMPANY_EMAIL_DOMAINS.map((d) => (
                    <Select.Item key={d} value={d}>
                      @{d}
                    </Select.Item>
                  ))}
                  <Select.Item value={CUSTOM_EMAIL_DOMAIN_SENTINEL}>Другой адрес…</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>
        )}
        {formEmailDomainChoice === CUSTOM_EMAIL_DOMAIN_SENTINEL ? (
          <Button
            type="button"
            variant="ghost"
            size="1"
            mt="2"
            onClick={() => {
              setFormEmailDomainChoice(COMPANY_EMAIL_DOMAINS[0])
              setFormEmailCustom('')
            }}
          >
            Выбрать домен компании
          </Button>
        ) : null}
      </Box>
      <Box>
        <Text size="2" weight="medium" mb="1" as="div">
          Имя пользователя
        </Text>
        <TextField.Root value={formUsername} onChange={(e) => setFormUsername(e.target.value)} />
      </Box>
      <Box>
        <Text size="2" weight="bold" mb="2" as="div">
          Роли и группы
        </Text>
        <Text size="2" weight="medium" mb="1" as="div">
          Роли
        </Text>
        {mode === 'edit' && editingUser ? (
          <Button type="button" variant="outline" size="1" mb="2" onClick={openRolesCatalog}>
            Полный каталог ролей (дерево)…
          </Button>
        ) : null}
        <Flex gap="2" wrap="wrap" align="center" mb="2">
          {formRoleLabels.map((r) => (
            <Flex key={r} align="center" gap="1">
              <Badge color="ruby" variant="soft" size="2">
                {r}
              </Badge>
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                aria-label={`Удалить роль «${r}»`}
                onClick={() => setFormRoleLabels((prev) => prev.filter((x) => x !== r))}
              >
                <Cross2Icon width={14} height={14} />
              </IconButton>
            </Flex>
          ))}
        </Flex>
        {state.roles.some((r) => !formRoleLabels.includes(r.displayName)) ? (
          <RoleHierarchyPicker
            roles={state.roles}
            assignedLabels={formRoleLabels}
            onAdd={(displayName) => {
              setFormRoleLabels((prev) =>
                prev.includes(displayName) ? prev : [...prev, displayName]
              )
            }}
          />
        ) : (
          <Text size="1" color="gray">
            Все доступные роли уже назначены.
          </Text>
        )}
        <Text size="2" weight="medium" mb="1" mt="3" as="div">
          Группы
        </Text>
        <Flex gap="2" wrap="wrap" align="center" mb="2">
          {formGroupLabels.map((g) => (
            <Flex key={g} align="center" gap="1">
              <Badge color="blue" variant="soft" size="2">
                {g}
              </Badge>
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                aria-label={`Удалить группу «${g}»`}
                onClick={() => setFormGroupLabels((prev) => prev.filter((x) => x !== g))}
              >
                <Cross2Icon width={14} height={14} />
              </IconButton>
            </Flex>
          ))}
        </Flex>
        {groupNameOptions.some((g) => !formGroupLabels.includes(g)) ? (
          <Select.Root
            key={`add-grp-${formGroupLabels.join('|')}`}
            onValueChange={(v) => {
              if (v && !formGroupLabels.includes(v)) {
                setFormGroupLabels((prev) => [...prev, v])
              }
            }}
          >
            <Select.Trigger placeholder="Добавить группу…" style={{ maxWidth: 280 }} />
            <Select.Content position="popper">
              {groupNameOptions
                .filter((g) => !formGroupLabels.includes(g))
                .map((g) => (
                  <Select.Item key={g} value={g}>
                    {g}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select.Root>
        ) : (
          <Text size="1" color="gray">
            Нет доступных групп для добавления.
          </Text>
        )}
      </Box>
      <Box>
        <Text size="2" weight="medium" mb="1" as="div">
          Статус
        </Text>
        <Select.Root value={formStatus} onValueChange={(v) => setFormStatus(v as RbacUserStatus)}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="active">Активен</Select.Item>
            <Select.Item value="inactive">Неактивен</Select.Item>
            <Select.Item value="pending">Ожидает активации</Select.Item>
            <Select.Item value="blocked">Заблокирован</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>
      <Flex align="center" gap="2">
        <Checkbox checked={formMfa} onCheckedChange={(v) => setFormMfa(v === true)} />
        <Text size="2">Обязательная 2FA</Text>
      </Flex>
      <Flex justify="end" gap="2" mt="2">
        {embeddedInDialog ? (
          <Dialog.Close>
            <Button type="button" variant="soft" color="gray">
              Отмена
            </Button>
          </Dialog.Close>
        ) : (
          <Button type="button" variant="soft" color="gray" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="button" onClick={handleSubmit}>
          {mode === 'create' ? 'Создать' : 'Сохранить'}
        </Button>
      </Flex>
    </Flex>
  )
}
