import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Switch,
  Table,
  Tabs,
  Text,
  TextField,
  Select,
} from '@radix-ui/themes'
import { useEffect, useMemo, useState } from 'react'
import { DownloadIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useToast } from '@/components/Toast/ToastContext'
import { LOCALE_CARD_DEFS, type AppLocale } from '@/features/system-settings/localeCatalog'
import type { LocalizationSettingsState, TranslationOverrideRow } from '@/features/system-settings/types'
import {
  emptyTranslationValues,
  normalizeLocaleState,
  normalizeTranslationOverrideRow,
  readLocalizationSettings,
  readTranslationOverrides,
  writeLocalizationSettings,
  writeTranslationOverrides,
} from '@/features/system-settings/localizationStorage'
import { useSearchParams } from '@/router-adapter'
import styles from './LocalizationSettingsPanel.module.css'

type LocalizationTab = 'language' | 'strings'

function parseTabParam(raw: string | null): LocalizationTab {
  return raw === 'strings' ? 'strings' : 'language'
}

function newRow(): TranslationOverrideRow {
  return {
    id: `r-${Date.now()}`,
    key: '',
    values: emptyTranslationValues(),
  }
}

export function LocalizationSettingsPanel() {
  const { showSuccess, showError } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = useMemo(
    () => parseTabParam(searchParams.get('tab')),
    [searchParams]
  )

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t !== 'language' && t !== 'strings') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', 'language')
          return next
        },
        { replace: true }
      )
    }
  }, [searchParams, setSearchParams])

  const setActiveTab = (value: LocalizationTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', value)
        return next
      },
      { replace: true }
    )
  }

  const [localeState, setLocaleState] = useState<LocalizationSettingsState>(() => readLocalizationSettings())
  const [overrides, setOverrides] = useState<TranslationOverrideRow[]>(() => readTranslationOverrides())

  useEffect(() => {
    writeTranslationOverrides(overrides)
  }, [overrides])

  const stringColumnDefs = useMemo(
    () => LOCALE_CARD_DEFS.filter((d) => localeState.enabledLocales.includes(d.id)),
    [localeState.enabledLocales]
  )

  const persistLocales = () => {
    const next = normalizeLocaleState(localeState)
    writeLocalizationSettings(next)
    setLocaleState(next)
    showSuccess('Сохранено', 'Настройки языка записаны локально.')
  }

  const toggleLocaleEnabled = (id: AppLocale, enable: boolean) => {
    setLocaleState((s) => {
      if (!enable) {
        if (s.enabledLocales.length <= 1 && s.enabledLocales.includes(id)) {
          showError('Языки', 'Нужно оставить хотя бы один доступный язык.')
          return s
        }
        const nextEnabled = s.enabledLocales.filter((x) => x !== id)
        let interfaceLocale = s.interfaceLocale
        let fallbackLocale = s.fallbackLocale
        if (!nextEnabled.includes(interfaceLocale)) interfaceLocale = nextEnabled[0]
        if (!nextEnabled.includes(fallbackLocale)) {
          fallbackLocale = nextEnabled.find((l) => l !== interfaceLocale) ?? nextEnabled[0]
        }
        return normalizeLocaleState({
          ...s,
          enabledLocales: nextEnabled,
          interfaceLocale,
          fallbackLocale,
        })
      }
      if (s.enabledLocales.includes(id)) return s
      return normalizeLocaleState({ ...s, enabledLocales: [...s.enabledLocales, id] })
    })
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ overrides }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translations-overrides.json'
    a.click()
    URL.revokeObjectURL(url)
    showSuccess('Экспорт', 'Файл translations-overrides.json скачан.')
  }

  const importJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result)) as { overrides?: TranslationOverrideRow[] }
          if (!data.overrides || !Array.isArray(data.overrides)) {
            showError('Импорт', 'Некорректный формат файла.')
            return
          }
          setOverrides(
            data.overrides
              .map((r, i) =>
                normalizeTranslationOverrideRow({
                  ...(typeof r === 'object' && r !== null ? r : {}),
                  id: typeof (r as { id?: unknown }).id === 'string' ? (r as { id: string }).id : `import-${i}`,
                  key: String((r as { key?: unknown }).key ?? ''),
                })
              )
              .filter((row): row is TranslationOverrideRow => row !== null)
          )
          showSuccess('Импорт', 'Переопределения загружены из файла.')
        } catch {
          showError('Импорт', 'Не удалось прочитать JSON.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <Tabs.Root value={activeTab} onValueChange={(v) => {
      if (v === 'language' || v === 'strings') setActiveTab(v)
    }}>
      <Tabs.List>
        <Tabs.Trigger value="language">Язык интерфейса</Tabs.Trigger>
        <Tabs.Trigger value="strings">Переопределения строк</Tabs.Trigger>
      </Tabs.List>

      <Box pt="4">
        <Tabs.Content value="language">
          <Card size="1" variant="surface">
            <div className={styles.fieldBlock}>
              <Text size="2" weight="medium" mb="1" as="div">
                Доступные языки
              </Text>
              <Text size="1" color="gray" mb="3" as="p" style={{ whiteSpace: 'normal', maxWidth: '56ch' }}>
                Включите языки, которые сотрудники смогут выбрать для интерфейса. Короткие метки совпадают с обозначениями
                в переключателе локали.
              </Text>
              <div className={styles.localeCards}>
                {LOCALE_CARD_DEFS.map((def) => {
                  const active = localeState.enabledLocales.includes(def.id)
                  return (
                    <Box
                      key={def.id}
                      className={`${styles.localeCard} ${active ? styles.localeCardActive : ''}`}
                    >
                      <Flex justify="between" align="start" gap="3" wrap="wrap">
                        <Flex align="center" gap="2" wrap="wrap">
                          <Badge size="2" variant={active ? 'solid' : 'soft'} color={active ? undefined : 'gray'}>
                            {def.shortLabel}
                          </Badge>
                          <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                            <Text size="2" weight="medium" style={{ whiteSpace: 'normal' }}>
                              {def.label}
                            </Text>
                            <Text size="1" color="gray">
                              {active ? 'Доступен в настройках' : 'Выключен'}
                            </Text>
                          </Flex>
                        </Flex>
                        <Switch
                          checked={active}
                          disabled={active && localeState.enabledLocales.length === 1}
                          onCheckedChange={(v) => toggleLocaleEnabled(def.id, v)}
                          aria-label={`Язык ${def.label}`}
                        />
                      </Flex>
                    </Box>
                  )
                })}
                <Box className={styles.localeCardSoon}>
                  <Flex direction="column" gap="2" style={{ minWidth: 0 }}>
                    <Badge size="2" variant="soft" color="gray">
                      Скоро
                    </Badge>
                    <Text size="2" weight="medium" style={{ whiteSpace: 'normal' }}>
                      Новые языки и переводы скоро будут доступны
                    </Text>
                    <Text size="1" color="gray" style={{ whiteSpace: 'normal' }}>
                      Расширение каталога локалей и пакетов перевода подключим в следующих версиях.
                    </Text>
                  </Flex>
                </Box>
              </div>
            </div>
            <div className={styles.fieldBlock}>
              <Text size="2" weight="medium" mb="2" as="div">
                Основной язык
              </Text>
              <Select.Root
                value={localeState.interfaceLocale}
                onValueChange={(v) => {
                  const loc = v === 'en' || v === 'be' || v === 'ru' ? v : 'ru'
                  if (!localeState.enabledLocales.includes(loc)) return
                  setLocaleState((s) => normalizeLocaleState({ ...s, interfaceLocale: loc }))
                }}
              >
                <Select.Trigger placeholder="Выберите язык" />
                <Select.Content position="popper">
                  {LOCALE_CARD_DEFS.filter((d) => localeState.enabledLocales.includes(d.id)).map((d) => (
                    <Select.Item key={d.id} value={d.id}>
                      {d.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
            <div className={styles.fieldBlock}>
              <Text size="2" weight="medium" mb="2" as="div">
                Резервный язык (если нет перевода)
              </Text>
              <Select.Root
                value={localeState.fallbackLocale}
                onValueChange={(v) => {
                  const loc = v === 'en' || v === 'be' || v === 'ru' ? v : 'en'
                  if (!localeState.enabledLocales.includes(loc)) return
                  setLocaleState((s) => normalizeLocaleState({ ...s, fallbackLocale: loc }))
                }}
              >
                <Select.Trigger />
                <Select.Content position="popper">
                  {LOCALE_CARD_DEFS.filter((d) => localeState.enabledLocales.includes(d.id)).map((d) => (
                    <Select.Item key={d.id} value={d.id}>
                      {d.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
            <Flex align="center" gap="3">
              <Switch
                checked={localeState.showTranslationKeys}
                onCheckedChange={(v) => setLocaleState((s) => ({ ...s, showTranslationKeys: v }))}
              />
              <Text size="2">Показывать ключи строк в интерфейсе (отладка)</Text>
            </Flex>
            <Box mt="4">
              <Button onClick={persistLocales}>Сохранить</Button>
            </Box>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="strings">
          <Card size="1" variant="surface">
            <Text size="2" color="gray" mb="3" as="div">
              Локальные переопределения без деплоя. В продукте загрузка пойдёт через API и версионирование каталогов.
            </Text>
            <div className={styles.tableWrap}>
              <Table.Root variant="surface" size="1">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Ключ</Table.ColumnHeaderCell>
                    {stringColumnDefs.map((def) => (
                      <Table.ColumnHeaderCell key={def.id}>{def.shortLabel}</Table.ColumnHeaderCell>
                    ))}
                    <Table.ColumnHeaderCell style={{ width: 48 }} />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {overrides.map((row, index) => (
                    <Table.Row key={row.id}>
                      <Table.Cell>
                        <TextField.Root
                          value={row.key}
                          onChange={(e) =>
                            setOverrides((rows) =>
                              rows.map((r, i) => (i === index ? { ...r, key: e.target.value } : r))
                            )
                          }
                          placeholder="namespace.key"
                        />
                      </Table.Cell>
                      {stringColumnDefs.map((def) => (
                        <Table.Cell key={def.id}>
                          <TextField.Root
                            value={row.values[def.id] ?? ''}
                            onChange={(e) =>
                              setOverrides((rows) =>
                                rows.map((r, i) =>
                                  i === index
                                    ? {
                                        ...r,
                                        values: { ...r.values, [def.id]: e.target.value },
                                      }
                                    : r
                                )
                              )
                            }
                          />
                        </Table.Cell>
                      ))}
                      <Table.Cell>
                        <Button
                          size="1"
                          variant="soft"
                          color="red"
                          onClick={() => setOverrides((rows) => rows.filter((_, i) => i !== index))}
                        >
                          <TrashIcon width={14} height={14} />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
            <Flex className={styles.rowActions} align="center" justify="between">
              <Button variant="soft" onClick={() => setOverrides((rows) => [...rows, newRow()])}>
                <PlusIcon width={14} height={14} /> Добавить строку
              </Button>
              <Flex gap="2">
                <Button variant="outline" onClick={importJson}>
                  Импорт JSON
                </Button>
                <Button variant="outline" onClick={exportJson}>
                  <DownloadIcon width={14} height={14} /> Экспорт
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  )
}
