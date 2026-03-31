'use client'

import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, Flex, Text, TextField, Badge, Dialog, Checkbox } from '@radix-ui/themes'
import { PlusIcon, Pencil1Icon, TrashIcon, Cross2Icon } from '@radix-ui/react-icons'
import styles from './CompanyListsSettings.module.css'

type ListKind = 'blacklist' | 'whitelist-donors'

interface CompanyListEntry {
  id: string
  name: string
  aliases: string[]
  legalEntities: string[]
  subsidiaries: string[]
  specializationKeys: string[]
  profileKeys: string[]
  createdAt: string
  updatedAt: string
}

const MOCK_SPECIALIZATIONS = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'qa', label: 'QA' },
  { key: 'devops', label: 'DevOps' },
  { key: 'design', label: 'Design' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'analytics', label: 'Аналитика' },
] as const

const MOCK_PROFILES = [
  { key: 'intern', label: 'Стажёр' },
  { key: 'junior', label: 'Junior' },
  { key: 'middle', label: 'Middle' },
  { key: 'senior', label: 'Senior' },
  { key: 'lead', label: 'Lead' },
  { key: 'head', label: 'Head' },
  { key: 'principal', label: 'Principal' },
] as const

function storageKey(kind: ListKind): string {
  return kind === 'blacklist' ? 'recruitingCompanyBlacklist' : 'recruitingCompanyWhitelistDonors'
}

function nowIso(): string {
  return new Date().toISOString()
}

function uniqTrimmed(values: string[]): string[] {
  const cleaned = values
    .map((v) => v.trim())
    .filter(Boolean)
  return [...new Set(cleaned)]
}

function createId(): string {
  return `cmp_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function load(kind: ListKind): CompanyListEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(kind))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(Boolean) as CompanyListEntry[]
  } catch {
    return []
  }
}

function save(kind: ListKind, data: CompanyListEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(kind), JSON.stringify(data))
}

interface CompanyListsSettingsProps {
  kind: ListKind
}

export function CompanyListsSettings({ kind }: CompanyListsSettingsProps) {
  const title = kind === 'blacklist' ? 'Черный список компаний' : 'Белый список компаний / доноры'
  const description =
    kind === 'blacklist'
      ? 'Компании, из которых не берем кандидатов (и их алиасы/юрлица/дочки), с фильтрами по специализациям и профилям.'
      : 'Компании-доноры (и их алиасы/юрлица/дочки), с фильтрами по специализациям и профилям.'

  const [items, setItems] = useState<CompanyListEntry[]>([])
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setItems(load(kind))
  }, [kind])

  useEffect(() => {
    save(kind, items)
  }, [kind, items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((x) => {
      const hay = [
        x.name,
        ...x.aliases,
        ...x.legalEntities,
        ...x.subsidiaries,
        ...x.specializationKeys,
        ...x.profileKeys,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [items, query])

  const editing = useMemo(
    () => (editingId ? items.find((x) => x.id === editingId) ?? null : null),
    [editingId, items]
  )

  const openCreate = () => {
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (id: string) => {
    setEditingId(id)
    setDialogOpen(true)
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }

  const upsert = (draft: Omit<CompanyListEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = nowIso()
    if (!editing) {
      const created: CompanyListEntry = {
        id: createId(),
        ...draft,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      setItems((prev) => [created, ...prev])
      return
    }
    setItems((prev) =>
      prev.map((x) =>
        x.id === editing.id
          ? {
              ...x,
              ...draft,
              updatedAt: timestamp,
            }
          : x
      )
    )
  }

  return (
    <Box className={styles.page}>
      <Flex justify="between" align="start" wrap="wrap" gap="3" mb="4">
        <Box>
          <Text size="6" weight="bold" style={{ display: 'block' }}>
            {title}
          </Text>
          <Text size="2" color="gray">
            {description}
          </Text>
        </Box>
        <Button onClick={openCreate}>
          <PlusIcon width={16} height={16} />
          Добавить компанию
        </Button>
      </Flex>

      <Card className={styles.toolbar} mb="3">
        <Flex align="center" gap="3" wrap="wrap">
          <TextField.Root
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по компании, алиасам, юрлицам, дочкам, фильтрам…"
            style={{ flex: 1, minWidth: 320 }}
          />
          <Text size="2" color="gray">
            {filtered.length} из {items.length}
          </Text>
        </Flex>
      </Card>

      {filtered.length === 0 ? (
        <Card className={styles.empty}>
          <Text size="3" weight="medium">
            Пусто
          </Text>
          <Text size="2" color="gray">
            Добавьте первую компанию или измените фильтр поиска.
          </Text>
        </Card>
      ) : (
        <Flex direction="column" gap="2">
          {filtered.map((x) => (
            <Card key={x.id} className={styles.item}>
              <Flex justify="between" align="start" gap="3" wrap="wrap">
                <Box style={{ minWidth: 260, flex: 1 }}>
                  <Text size="3" weight="medium" style={{ display: 'block' }}>
                    {x.name}
                  </Text>
                  <Text size="1" color="gray">
                    Обновлено: {new Date(x.updatedAt).toLocaleString('ru-RU')}
                  </Text>
                  <Flex gap="2" wrap="wrap" mt="2">
                    {x.aliases.slice(0, 6).map((a) => (
                      <Badge key={a} color="gray" variant="soft">
                        {a}
                      </Badge>
                    ))}
                    {x.aliases.length > 6 && (
                      <Badge color="gray" variant="soft">
                        +{x.aliases.length - 6}
                      </Badge>
                    )}
                  </Flex>
                </Box>

                <Flex gap="2" align="center">
                  <Button variant="soft" onClick={() => openEdit(x.id)}>
                    <Pencil1Icon width={16} height={16} />
                    Редактировать
                  </Button>
                  <Button color="red" variant="soft" onClick={() => remove(x.id)} title="Удалить">
                    <TrashIcon width={16} height={16} />
                  </Button>
                </Flex>
              </Flex>

              <Flex gap="2" wrap="wrap" mt="3">
                <Group label="Юрлица" values={x.legalEntities} />
                <Group label="Дочки" values={x.subsidiaries} />
                <Group
                  label="Специализации"
                  values={x.specializationKeys.map((k) => MOCK_SPECIALIZATIONS.find((s) => s.key === k)?.label ?? k)}
                />
                <Group
                  label="Профили"
                  values={x.profileKeys.map((k) => MOCK_PROFILES.find((p) => p.key === k)?.label ?? k)}
                />
              </Flex>
            </Card>
          ))}
        </Flex>
      )}

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content className={styles.dialogContent}>
          <Flex justify="between" align="center" mb="3">
            <Dialog.Title>{editing ? 'Редактирование' : 'Новая компания'}</Dialog.Title>
            <Dialog.Close>
              <Button variant="ghost" color="gray">
                <Cross2Icon />
              </Button>
            </Dialog.Close>
          </Flex>
          <CompanyDialogForm
            initial={editing}
            onCancel={() => setDialogOpen(false)}
            onSave={(draft) => {
              upsert(draft)
              setDialogOpen(false)
            }}
          />
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

function Group({ label, values }: { label: string; values: string[] }) {
  if (!values || values.length === 0) return null
  return (
    <Flex gap="2" align="center" wrap="wrap">
      <Text size="1" color="gray">
        {label}:
      </Text>
      {values.slice(0, 4).map((v) => (
        <Badge key={v} variant="outline" color="gray">
          {v}
        </Badge>
      ))}
      {values.length > 4 && (
        <Badge variant="outline" color="gray">
          +{values.length - 4}
        </Badge>
      )}
    </Flex>
  )
}

function CompanyDialogForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: CompanyListEntry | null
  onCancel: () => void
  onSave: (draft: Omit<CompanyListEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [aliasesRaw, setAliasesRaw] = useState((initial?.aliases ?? []).join('\n'))
  const [legalRaw, setLegalRaw] = useState((initial?.legalEntities ?? []).join('\n'))
  const [subsRaw, setSubsRaw] = useState((initial?.subsidiaries ?? []).join('\n'))
  const [specializationKeys, setSpecializationKeys] = useState<string[]>(initial?.specializationKeys ?? [])
  const [profileKeys, setProfileKeys] = useState<string[]>(initial?.profileKeys ?? [])
  const [error, setError] = useState<string | null>(null)

  const toggle = (arr: string[], key: string, next: boolean) => {
    if (next) return uniqTrimmed([...arr, key])
    return arr.filter((x) => x !== key)
  }

  const handleSave = () => {
    const n = name.trim()
    if (!n) {
      setError('Введите название компании')
      return
    }
    setError(null)
    onSave({
      name: n,
      aliases: uniqTrimmed(aliasesRaw.split('\n')),
      legalEntities: uniqTrimmed(legalRaw.split('\n')),
      subsidiaries: uniqTrimmed(subsRaw.split('\n')),
      specializationKeys: uniqTrimmed(specializationKeys),
      profileKeys: uniqTrimmed(profileKeys),
    })
  }

  return (
    <Flex direction="column" gap="4" className={styles.dialogForm}>
      {error && (
        <Card className={styles.error}>
          <Text size="2" color="red">
            {error}
          </Text>
        </Card>
      )}

      <Box>
        <Text size="2" weight="medium" style={{ display: 'block' }} mb="2">
          Компания *
        </Text>
        <TextField.Root value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Softnetix" />
      </Box>

      <Flex direction="column" gap="4" className={styles.listFields}>
        <Box className={styles.listFieldBlock}>
          <Text size="2" weight="medium" style={{ display: 'block' }} mb="2">
            Алиасы (по одному в строке)
          </Text>
          <textarea
            className={styles.textarea}
            value={aliasesRaw}
            onChange={(e) => setAliasesRaw(e.target.value)}
            placeholder="Каждая строка — отдельный алиас"
            rows={4}
          />
        </Box>
        <Box className={styles.listFieldBlock}>
          <Text size="2" weight="medium" style={{ display: 'block' }} mb="2">
            Юрлица (по одному в строке)
          </Text>
          <textarea
            className={styles.textarea}
            value={legalRaw}
            onChange={(e) => setLegalRaw(e.target.value)}
            placeholder="Каждая строка — отдельное юрлицо"
            rows={4}
          />
        </Box>
        <Box className={styles.listFieldBlock}>
          <Text size="2" weight="medium" style={{ display: 'block' }} mb="2">
            Дочерние компании (по одному в строке)
          </Text>
          <textarea
            className={styles.textarea}
            value={subsRaw}
            onChange={(e) => setSubsRaw(e.target.value)}
            placeholder="Каждая строка — отдельная дочерняя компания"
            rows={4}
          />
        </Box>
      </Flex>

      <Box>
        <Text size="2" weight="medium" style={{ display: 'block' }} mb="2">
          Фильтр по специализациям
        </Text>
        <div className={styles.filterScrollRow} role="group" aria-label="Специализации">
          {MOCK_SPECIALIZATIONS.map((s) => {
            const checked = specializationKeys.includes(s.key)
            return (
              <label key={s.key} className={styles.checkItem}>
                <Checkbox checked={checked} onCheckedChange={(v) => setSpecializationKeys((p) => toggle(p, s.key, v === true))} />
                <Text size="2">{s.label}</Text>
              </label>
            )
          })}
        </div>
        <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
          Если не выбрано ничего — правило применяется ко всем специализациям.
        </Text>
      </Box>

      <Box>
        <Text size="2" weight="medium" style={{ display: 'block' }} mb="2">
          Фильтр по профилям
        </Text>
        <div className={styles.filterScrollRow} role="group" aria-label="Профили">
          {MOCK_PROFILES.map((p) => {
            const checked = profileKeys.includes(p.key)
            return (
              <label key={p.key} className={styles.checkItem}>
                <Checkbox checked={checked} onCheckedChange={(v) => setProfileKeys((prev) => toggle(prev, p.key, v === true))} />
                <Text size="2">{p.label}</Text>
              </label>
            )
          })}
        </div>
        <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
          Если не выбрано ничего — правило применяется ко всем профилям.
        </Text>
      </Box>

      <Flex justify="end" gap="2" mt="2">
        <Button variant="soft" color="gray" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </Flex>
    </Flex>
  )
}

