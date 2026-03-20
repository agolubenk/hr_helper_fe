import { type ReactNode, useMemo, useState } from 'react'
import { Box, Button, Card, Dialog, Flex, Select, Switch, Table, Text, TextArea, TextField } from '@radix-ui/themes'
import GeneralSettings from '@/components/company-settings/GeneralSettings'
import GradesSettings from '@/components/company-settings/GradesSettings'
import RatingScalesSettings from '@/components/company-settings/RatingScalesSettings'
import EmployeeLifecycleSettings from '@/components/company-settings/EmployeeLifecycleSettings'
import CandidateFieldsSettings from '@/components/company-settings/CandidateFieldsSettings'
import ScorecardSettings from '@/components/company-settings/ScorecardSettings'
import SLASettings from '@/components/company-settings/SLASettings'
import VacancyPromptSettings from '@/components/company-settings/VacancyPromptSettings'
import RecruitingStagesSettings from '@/components/company-settings/RecruitingStagesSettings'
import RecruitingCommandsSettings from '@/components/company-settings/RecruitingCommandsSettings'
import GroupAccessModal, { type AccessRights, type ATSAccessRights, type RecruitingSettingsAccessRights } from '@/components/company-settings/GroupAccessModal'
import UserAccessModal from '@/components/company-settings/UserAccessModal'
import styles from './styles/CompanySettings.module.css'

interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
}

interface IntegrationItem {
  id: string
  name: string
  group: 'ai' | 'messengers' | 'job-sites' | 'hrm-ats' | 'task-trackers' | 'auth'
  active: boolean
}

interface GroupRow {
  id: string
  name: string
  description: string
  users: number
  applications: string[]
  access_rights?: AccessRights
  ats_access?: ATSAccessRights
  recruiting_settings_access?: RecruitingSettingsAccessRights
}

interface UserRow {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  active: boolean
}

interface RuleRow {
  id: string
  name: string
  source: string
  bonus: number
  active: boolean
}

export function CompanySettingsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Общие настройки
      </Text>
      <GeneralSettings />
    </Box>
  )
}

export function CompanySettingsGradesPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Настройки грейдов
      </Text>
      <GradesSettings />
    </Box>
  )
}

export function CompanySettingsRatingScalesPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Шкалы оценок
      </Text>
      <RatingScalesSettings />
    </Box>
  )
}

export function CompanySettingsEmployeeLifecyclePage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Жизненный цикл сотрудников
      </Text>
      <EmployeeLifecycleSettings />
    </Box>
  )
}

export function CompanySettingsCandidateFieldsPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Настройки дополнительных полей кандидатов
      </Text>
      <CandidateFieldsSettings />
    </Box>
  )
}

export function CompanySettingsScorecardPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Настройки Scorecard
      </Text>
      <ScorecardSettings />
    </Box>
  )
}

export function CompanySettingsSlaPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        SLA для вакансий
      </Text>
      <SLASettings />
    </Box>
  )
}

export function CompanySettingsVacancyPromptPage() {
  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Единый промпт для вакансий
      </Text>
      <VacancyPromptSettings />
    </Box>
  )
}

export function CompanySettingsRecruitingStagesPage() {
  return (
    <Box data-tour="recruiting-settings-page" className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Этапы найма и причины отказа
      </Text>
      <RecruitingStagesSettings />
    </Box>
  )
}

export function CompanySettingsRecruitingCommandsPage() {
  return (
    <Box className={styles.container}>
      <Box mb="4">
        <Text size="6" weight="bold" style={{ display: 'block' }}>
          Команды workflow
        </Text>
        <Text size="2" color="gray" mt="2" style={{ display: 'block' }}>
          Настройте команды для workflow чата. Команды /add и /del являются системными.
        </Text>
      </Box>
      <RecruitingCommandsSettings />
    </Box>
  )
}

export function CompanySettingsOrgStructurePage() {
  const [nodes] = useState<TreeNode[]>([
    { id: 'dep-1', name: 'IT', children: [{ id: 'dep-2', name: 'Frontend' }, { id: 'dep-3', name: 'Backend' }] },
    { id: 'dep-4', name: 'HR', children: [{ id: 'dep-5', name: 'Recruiting' }] },
  ])
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query.trim()) return nodes
    const q = query.toLowerCase()
    const filterNode = (list: TreeNode[]): TreeNode[] =>
      list
        .map((n) => ({ ...n, children: n.children ? filterNode(n.children) : undefined }))
        .filter((n) => n.name.toLowerCase().includes(q) || (n.children?.length ?? 0) > 0)
    return filterNode(nodes)
  }, [nodes, query])

  const renderNode = (node: TreeNode, level = 0): ReactNode => (
    <Box key={node.id} style={{ marginLeft: level * 20, marginBottom: 8 }}>
      <Card>
        <Text size="2">{node.name}</Text>
      </Card>
      {node.children?.map((child) => renderNode(child, level + 1))}
    </Box>
  )

  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Оргструктура
      </Text>
      <Box mb="3">
        <TextField.Root placeholder="Поиск департамента..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </Box>
      <Box>{filtered.map((node) => renderNode(node))}</Box>
    </Box>
  )
}

export function CompanySettingsIntegrationsPage() {
  const [group, setGroup] = useState<'all' | IntegrationItem['group']>('all')
  const [scopeOpen, setScopeOpen] = useState(false)
  const [googleOpen, setGoogleOpen] = useState(false)
  const [selected, setSelected] = useState<IntegrationItem | null>(null)
  const [items, setItems] = useState<IntegrationItem[]>([
    { id: 'google', name: 'Google', group: 'auth', active: false },
    { id: 'telegram', name: 'Telegram', group: 'messengers', active: false },
    { id: 'hh', name: 'hh.ru / rabota.by', group: 'job-sites', active: false },
    { id: 'huntflow', name: 'Huntflow', group: 'hrm-ats', active: true },
    { id: 'gemini', name: 'Gemini', group: 'ai', active: false },
  ])
  const visible = group === 'all' ? items : items.filter((x) => x.group === group)

  const updateActive = (id: string, active: boolean) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, active } : it)))
  }

  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="2" style={{ display: 'block' }}>
        Интеграции
      </Text>
      <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
        Базовая миграция раздела: переключение, фильтр и модальные настройки.
      </Text>

      <Flex gap="2" mb="4" wrap="wrap">
        {(['all', 'ai', 'auth', 'messengers', 'job-sites', 'hrm-ats', 'task-trackers'] as const).map((g) => (
          <Button key={g} variant={group === g ? 'solid' : 'soft'} onClick={() => setGroup(g)}>
            {g}
          </Button>
        ))}
      </Flex>

      <Flex gap="3" wrap="wrap">
        {visible.map((it) => (
          <Card key={it.id} style={{ width: 260 }}>
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text weight="medium">{it.name}</Text>
                <Switch checked={it.active} onCheckedChange={(v) => updateActive(it.id, v)} />
              </Flex>
              <Button
                variant="soft"
                onClick={() => {
                  setSelected(it)
                  if (it.id === 'google') setGoogleOpen(true)
                  else setScopeOpen(true)
                }}
              >
                Настроить
              </Button>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Dialog.Root open={scopeOpen} onOpenChange={setScopeOpen}>
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>Настройки интеграции</Dialog.Title>
          <Text size="2" color="gray">
            {selected?.name}: режим ключей и токенов.
          </Text>
          <Box mt="4">
            <Select.Root defaultValue="common">
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="common">Общий</Select.Item>
                <Select.Item value="per_user">У каждого свой</Select.Item>
                <Select.Item value="both">Оба</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          <Flex justify="end" mt="4">
            <Button onClick={() => setScopeOpen(false)}>Готово</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={googleOpen} onOpenChange={setGoogleOpen}>
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>Подключение Google</Dialog.Title>
          <Text size="2" color="gray">Включите нужные сервисы для аккаунтов команды.</Text>
          <Flex direction="column" gap="2" mt="4">
            <label><input type="checkbox" defaultChecked /> Календарь</label>
            <label><input type="checkbox" defaultChecked /> Диск</label>
            <label><input type="checkbox" defaultChecked /> Таблицы</label>
          </Flex>
          <Flex justify="end" mt="4">
            <Button onClick={() => setGoogleOpen(false)}>Сохранить</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

export function CompanySettingsUserGroupsPage() {
  const [groups, setGroups] = useState<GroupRow[]>([
    { id: 'g1', name: 'Администраторы', description: 'Полный доступ', users: 3, applications: ['huntflow', 'telegram'] },
    { id: 'g2', name: 'Рекрутеры', description: 'Подбор и интервью', users: 11, applications: ['huntflow'] },
  ])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<GroupRow | null>(null)
  const list = groups.filter((g) => `${g.name} ${g.description}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Группы пользователей
      </Text>
      <Box mb="3">
        <TextField.Root placeholder="Поиск группы..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </Box>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Группа</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Пользователей</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {list.map((g) => (
            <Table.Row key={g.id}>
              <Table.Cell>{g.name}</Table.Cell>
              <Table.Cell>{g.description}</Table.Cell>
              <Table.Cell>{g.users}</Table.Cell>
              <Table.Cell>
                <Button
                  size="1"
                  onClick={() => {
                    setSelected(g)
                    setOpen(true)
                  }}
                >
                  Доступы
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {selected && (
        <GroupAccessModal
          open={open}
          onOpenChange={setOpen}
          groupName={selected.name}
          initialApplications={selected.applications}
          initialAccess={selected.access_rights}
          initialATSAccess={selected.ats_access}
          initialRecruitingSettingsAccess={selected.recruiting_settings_access}
          onApply={(applications, access, atsAccess, recruitingAccess) => {
            setGroups((prev) =>
              prev.map((x) =>
                x.id === selected.id
                  ? { ...x, applications, access_rights: access, ats_access: atsAccess, recruiting_settings_access: recruitingAccess }
                  : x,
              ),
            )
          }}
        />
      )}
    </Box>
  )
}

export function CompanySettingsUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([
    { id: 'u1', firstName: 'Иван', lastName: 'Иванов', email: 'admin@example.com', role: 'Администратор', active: true },
    { id: 'u2', firstName: 'Мария', lastName: 'Петрова', email: 'recruiter@example.com', role: 'Рекрутер', active: true },
  ])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UserRow | null>(null)
  const [accessOpen, setAccessOpen] = useState(false)
  const visible = rows.filter((x) => `${x.firstName} ${x.lastName} ${x.email}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Пользователи
      </Text>
      <Box mb="3">
        <TextField.Root placeholder="Поиск пользователя..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </Box>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Имя</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Роль</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Активен</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visible.map((u) => (
            <Table.Row key={u.id}>
              <Table.Cell>{u.firstName} {u.lastName}</Table.Cell>
              <Table.Cell>{u.email}</Table.Cell>
              <Table.Cell>{u.role}</Table.Cell>
              <Table.Cell>
                <Switch checked={u.active} onCheckedChange={(v) => setRows((p) => p.map((x) => (x.id === u.id ? { ...x, active: v } : x)))} />
              </Table.Cell>
              <Table.Cell>
                <Button
                  size="1"
                  onClick={() => {
                    setSelected(u)
                    setAccessOpen(true)
                  }}
                >
                  Права доступа
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <UserAccessModal
        open={accessOpen}
        onOpenChange={setAccessOpen}
        userName={selected ? `${selected.firstName} ${selected.lastName}` : ''}
        initialAccess={undefined}
        onApply={() => undefined}
      />
    </Box>
  )
}

export function CompanySettingsRecruitingRulesPage() {
  const [rows, setRows] = useState<RuleRow[]>([
    { id: 'r1', name: 'Бонус за рекомендацию', source: 'Рекомендации', bonus: 10000, active: true },
    { id: 'r2', name: 'Бонус за hh.ru', source: 'hh.ru', bonus: 5000, active: true },
  ])
  const [newName, setNewName] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newBonus, setNewBonus] = useState('')
  const addRule = () => {
    if (!newName.trim() || !newSource.trim()) return
    setRows((prev) => [...prev, { id: `r-${Date.now()}`, name: newName.trim(), source: newSource.trim(), bonus: Number(newBonus || '0'), active: true }])
    setNewName('')
    setNewSource('')
    setNewBonus('')
  }

  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Правила привлечения
      </Text>
      <Card style={{ marginBottom: 16 }}>
        <Flex gap="2" wrap="wrap">
          <TextField.Root placeholder="Название" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <TextField.Root placeholder="Источник" value={newSource} onChange={(e) => setNewSource(e.target.value)} />
          <TextField.Root placeholder="Бонус" value={newBonus} onChange={(e) => setNewBonus(e.target.value)} />
          <Button onClick={addRule}>Добавить</Button>
        </Flex>
      </Card>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Правило</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Источник</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Бонус</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Активно</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((r) => (
            <Table.Row key={r.id}>
              <Table.Cell>{r.name}</Table.Cell>
              <Table.Cell>{r.source}</Table.Cell>
              <Table.Cell>{r.bonus.toLocaleString('ru-RU')} RUB</Table.Cell>
              <Table.Cell>
                <Switch checked={r.active} onCheckedChange={(v) => setRows((p) => p.map((x) => (x.id === r.id ? { ...x, active: v } : x)))} />
              </Table.Cell>
              <Table.Cell>
                <Button size="1" color="red" variant="soft" onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}>
                  Удалить
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

export function CompanySettingsRecruitingOfferTemplatePage() {
  const [templateText, setTemplateText] = useState(
    'Здравствуйте, {candidate_name}!\n\nПредлагаем позицию {vacancy_name} с доходом {salary_before_tax} {currency}.',
  )
  const [candidateName, setCandidateName] = useState('Иван Иванов')
  const [vacancyName, setVacancyName] = useState('Frontend Developer')
  const [salary, setSalary] = useState('200000')
  const [currency, setCurrency] = useState('RUB')

  const preview = templateText
    .split('{candidate_name}').join(candidateName)
    .split('{vacancy_name}').join(vacancyName)
    .split('{salary_before_tax}').join(salary)
    .split('{currency}').join(currency)

  return (
    <Box className={styles.container}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Шаблон оффера
      </Text>
      <Flex gap="4" wrap="wrap">
        <Card style={{ flex: 1, minWidth: 360 }}>
          <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            Шаблон
          </Text>
          <TextArea rows={10} value={templateText} onChange={(e) => setTemplateText(e.target.value)} />
        </Card>
        <Card style={{ flex: 1, minWidth: 360 }}>
          <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            Переменные
          </Text>
          <Flex direction="column" gap="2">
            <TextField.Root value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="candidate_name" />
            <TextField.Root value={vacancyName} onChange={(e) => setVacancyName(e.target.value)} placeholder="vacancy_name" />
            <TextField.Root value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="salary_before_tax" />
            <TextField.Root value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="currency" />
          </Flex>
          <Text size="3" weight="medium" mt="4" mb="2" style={{ display: 'block' }}>
            Предпросмотр
          </Text>
          <Card>
            <Text style={{ whiteSpace: 'pre-wrap' }}>{preview}</Text>
          </Card>
        </Card>
      </Flex>
    </Box>
  )
}
