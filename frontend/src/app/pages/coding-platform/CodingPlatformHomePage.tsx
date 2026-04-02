import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, Flex, Text, Badge, Switch, Button, Separator, Box } from '@radix-ui/themes'
import { Link } from '@/router-adapter'
import {
  CODING_LANGUAGE_CATALOG,
  getLanguageById,
  sortCatalog,
} from '@/features/coding-platform/languageCatalog'
import type { CodingLanguageDefinition } from '@/features/coding-platform/types'
import {
  CODING_LANGUAGES_CHANGED_EVENT,
  getDefaultEnabledCodingLanguageIds,
  readEnabledCodingLanguageIds,
  writeEnabledCodingLanguageIds,
} from '@/features/coding-platform/codingPlatformLanguagesStorage'
import { CodingPlatformPageShell } from './CodingPlatformPageShell'
import { CodingPlatformStackMapCard } from './CodingPlatformStackMapCard'
import styles from '../styles/CodingPlatformPages.module.css'

const PREVIEW_LABEL: Record<string, string> = {
  web: 'Браузер',
  styles: 'Стили',
  compile: 'Компиляция',
  runtime: 'Рантайм',
}

const CATEGORY_LABEL: Record<string, string> = {
  markup: 'Разметка',
  styles: 'Стили',
  language: 'Язык',
  framework: 'Фреймворк',
  runtime: 'Рантайм',
  systems: 'Системы',
  data: 'Данные',
}

const RUNNER_LABEL: Record<string, string> = {
  'iframe-web': 'Предпросмотр в iframe',
  'typescript-note': 'TS → проверка типов',
  'static-only': 'Без исполнения',
  'server-mock': 'Запуск (мок-сервер)',
}

export function CodingPlatformHomePage() {
  const [enabledIds, setEnabledIds] = useState<string[]>(() => readEnabledCodingLanguageIds())

  useEffect(() => {
    const sync = () => setEnabledIds(readEnabledCodingLanguageIds())
    sync()
    window.addEventListener(CODING_LANGUAGES_CHANGED_EVENT, sync)
    return () => window.removeEventListener(CODING_LANGUAGES_CHANGED_EVENT, sync)
  }, [])

  const enabledSet = useMemo(() => new Set(enabledIds), [enabledIds])

  const setEnabled = useCallback((next: string[]) => {
    writeEnabledCodingLanguageIds(next)
    setEnabledIds(next)
  }, [])

  const toggleLanguage = useCallback(
    (id: string, checked: boolean) => {
      if (checked) {
        setEnabled([...new Set([...enabledIds, id])])
        return
      }
      const next = enabledIds.filter((x) => x !== id)
      if (next.length === 0) return
      setEnabled(next)
    },
    [enabledIds, setEnabled],
  )

  const resetDefaults = useCallback(() => {
    setEnabled(getDefaultEnabledCodingLanguageIds())
  }, [setEnabled])

  const catalogSorted = useMemo(() => sortCatalog(CODING_LANGUAGE_CATALOG), [])

  const enabledLanguages = useMemo(() => {
    const list = enabledIds
      .map((id) => getLanguageById(id))
      .filter((x): x is CodingLanguageDefinition => x != null)
    return sortCatalog(list)
  }, [enabledIds])

  const relatedLine = (relatedIds: string[]) =>
    relatedIds
      .map((rid) => getLanguageById(rid)?.title)
      .filter(Boolean)
      .join(' · ')

  return (
    <CodingPlatformPageShell
      title="Кодинговая платформа"
      description="Соберите набор языков и фреймворков: каталог ниже, карта связей и песочница с мок-раннерами. Сохранённые черновики — в разделе «Сохранённое»."
    >
      <Card size="2" mb="4" variant="surface">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            Ориентир по структуре практики live coding — внешний симулятор{' '}
            <a
              href="https://practice.meet2code.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-11)' }}
            >
              Meet2Code
            </a>
            : задача, редактор, язык и запуск. Здесь — внутренний мок: каталог языков, подключение в профиль и песочница с
            браузерным превью и мок-исполнением для остальных.
          </Text>
        </Flex>
      </Card>

      <Text size="4" weight="bold" mb="2" className={styles.studioSectionTitle}>
        Подключённые стеки
      </Text>
      <Text size="2" color="gray" mb="3">
        Быстрый переход в песочницу с выбранным языком (параметр <code>lang</code>).
      </Text>
      <div className={styles.grid} style={{ marginBottom: 'var(--space-5)' }}>
        {enabledLanguages.map((l) => (
          <Card key={l.id} size="2">
            <Flex direction="column" gap="2">
              <Flex align="center" justify="between" gap="2" wrap="wrap">
                <Text weight="bold" size="3">
                  {l.title}
                </Text>
                <Badge size="1" variant="soft" color="grass">
                  В работе
                </Badge>
              </Flex>
              <Text size="1" color="gray">
                {CATEGORY_LABEL[l.category] ?? l.category} · {RUNNER_LABEL[l.runner] ?? l.runner}
              </Text>
              <Text size="2" color="gray">
                {l.description}
              </Text>
              {l.relatedIds.length > 0 ? (
                <Text size="1" color="gray">
                  Связи: {relatedLine(l.relatedIds)}
                </Text>
              ) : null}
              <Button size="2" variant="soft" asChild style={{ alignSelf: 'flex-start' }}>
                <Link href={`/coding-platform/playground?lang=${encodeURIComponent(l.id)}`}>Открыть песочницу</Link>
              </Button>
            </Flex>
          </Card>
        ))}
      </div>

      <Separator size="4" my="4" />

      <Flex align="center" justify="between" gap="3" wrap="wrap" mb="3">
        <div>
          <Text size="4" weight="bold" className={styles.studioSectionTitle}>
            Каталог языков и стеков
          </Text>
          <Text size="2" color="gray">
            Включайте и отключайте позиции — сохраняется локально в браузере.
          </Text>
        </div>
        <Button size="2" variant="outline" onClick={resetDefaults}>
          Сбросить к набору по умолчанию
        </Button>
      </Flex>

      <Flex direction="column" gap="2">
        {catalogSorted.map((l) => (
          <Card key={l.id} size="1" variant="surface">
            <Flex
              align="center"
              justify="between"
              gap="3"
              wrap="wrap"
              py="1"
              px="2"
              className={styles.catalogRow}
            >
              <Box style={{ flex: '1 1 220px', minWidth: 0 }}>
                <Flex align="center" gap="2" wrap="wrap" mb="1">
                  <Text weight="bold" size="2">
                    {l.title}
                  </Text>
                  <Badge size="1" variant="soft" color="gray">
                    {PREVIEW_LABEL[l.previewKind] ?? l.previewKind}
                  </Badge>
                  <Badge size="1" variant="outline" color="gray">
                    {CATEGORY_LABEL[l.category] ?? l.category}
                  </Badge>
                </Flex>
                <Text size="2" color="gray">
                  {l.description}
                </Text>
                {l.relatedIds.length > 0 ? (
                  <Text size="1" color="gray" mt="1">
                    Связи: {relatedLine(l.relatedIds)}
                  </Text>
                ) : null}
              </Box>
              <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                <Text size="2" color="gray">
                  Подключить
                </Text>
                <Switch
                  checked={enabledSet.has(l.id)}
                  onCheckedChange={(c) => toggleLanguage(l.id, c)}
                  aria-label={`Подключить ${l.title}`}
                />
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Separator size="4" my="4" />

      <Text size="4" weight="bold" mb="2" className={styles.studioSectionTitle}>
        Карта связей
      </Text>
      <Text size="2" color="gray" mb="3">
        Узлы соответствуют каталогу; подключённые языки подсвечиваются при фильтре «только подключённые».
      </Text>
      <CodingPlatformStackMapCard />
    </CodingPlatformPageShell>
  )
}
