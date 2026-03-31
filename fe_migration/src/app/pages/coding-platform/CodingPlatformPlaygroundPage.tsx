import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Switch,
  Tabs,
  Text,
} from '@radix-ui/themes'
import { PlayIcon } from '@radix-ui/react-icons'
import { CodingPlatformPageShell } from './CodingPlatformPageShell'
import { getLanguageById, sortCatalog } from '@/features/coding-platform/languageCatalog'
import type { CodingLanguageDefinition } from '@/features/coding-platform/types'
import {
  CODING_LANGUAGES_CHANGED_EVENT,
  readEnabledCodingLanguageIds,
} from '@/features/coding-platform/codingPlatformLanguagesStorage'
import { PLAYGROUND_MONO_DEFAULTS } from '@/features/coding-platform/playgroundDefaults'
import {
  defaultSelectionForLangParam,
  parseLangsParam,
  selectionHasWebPreview,
  sortSelectedIds,
} from '@/features/coding-platform/playgroundSelection'
import ideStyles from './CodingPlatformPlaygroundPage.module.css'

const DEFAULT_HTML = `<h1>Песочница</h1>
<p id="demo">Здесь оживит JavaScript.</p>`

const DEFAULT_CSS = `body {
  font-family: system-ui, sans-serif;
  padding: 1.25rem;
  background: #f8fafc;
  color: #0f172a;
}
h1 { color: #4f46e5; font-size: 1.5rem; }
#demo { margin-top: 0.5rem; }`

const DEFAULT_JS = `const el = document.getElementById('demo');
if (el) {
  el.textContent = 'Сейчас: ' + new Date().toLocaleString('ru-RU');
}`

const DEFAULT_REACT = PLAYGROUND_MONO_DEFAULTS.react ?? ''

function escapeClosingScript(js: string): string {
  return js.replace(/<\/script>/gi, '<\\/script>')
}

function buildSrcDoc(html: string, css: string, jsCombined: string): string {
  const safeJs = escapeClosingScript(jsCombined)
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>${css}</style></head><body>${html}<script>${safeJs}<\/script></body></html>`
}

function pickDefaultLang(enabledIds: string[]): string {
  const defs = sortCatalog(
    enabledIds.map((id) => getLanguageById(id)).filter(Boolean) as CodingLanguageDefinition[],
  )
  const web = defs.find((d) => d.runner === 'iframe-web')
  return web?.id ?? defs[0]?.id ?? 'js'
}

const RUNNER_LABEL: Record<string, string> = {
  'iframe-web': 'браузер',
  'typescript-note': 'tsc (мок)',
  'static-only': 'статика',
  'server-mock': 'раннер (мок)',
}

export function CodingPlatformPlaygroundPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [enabledIds, setEnabledIds] = useState<string[]>(() => readEnabledCodingLanguageIds())
  const [langDialogOpen, setLangDialogOpen] = useState(false)

  useEffect(() => {
    const sync = () => setEnabledIds(readEnabledCodingLanguageIds())
    window.addEventListener(CODING_LANGUAGES_CHANGED_EVENT, sync)
    return () => window.removeEventListener(CODING_LANGUAGES_CHANGED_EVENT, sync)
  }, [])

  const enabledSorted = useMemo(
    () => sortCatalog(enabledIds.map((id) => getLanguageById(id)).filter(Boolean) as CodingLanguageDefinition[]),
    [enabledIds],
  )

  const enabledSet = useMemo(() => new Set(enabledIds), [enabledIds])

  const langsParam = searchParams.get('langs')
  const langParam = searchParams.get('lang')
  const previewOpen = searchParams.get('preview') !== '0'

  const selectedIds = useMemo(() => {
    const parsed = parseLangsParam(langsParam, enabledSet)
    if (parsed.length > 0) return sortSelectedIds(parsed, enabledSorted)
    const primary = langParam && enabledSet.has(langParam) ? langParam : pickDefaultLang(enabledIds)
    if (!primary || !enabledSet.has(primary)) return []
    return sortSelectedIds(defaultSelectionForLangParam(primary, enabledSet, getLanguageById), enabledSorted)
  }, [langsParam, langParam, enabledSet, enabledIds, enabledSorted])

  useEffect(() => {
    if (selectedIds.length === 0 || enabledIds.length === 0) return
    const canonical = selectedIds.join(',')
    if (langsParam === canonical) return
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.set('langs', canonical)
        p.set('lang', selectedIds[0])
        if (!p.has('preview')) p.set('preview', '1')
        return p
      },
      { replace: true },
    )
  }, [selectedIds, langsParam, enabledIds.length, setSearchParams])

  const [activeTab, setActiveTab] = useState<string>('')

  useEffect(() => {
    if (selectedIds.length === 0) return
    if (!activeTab || !selectedIds.includes(activeTab)) setActiveTab(selectedIds[0])
  }, [selectedIds, activeTab])

  const setPreviewOpen = useCallback(
    (open: boolean) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          p.set('preview', open ? '1' : '0')
          return p
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const pushSelection = useCallback(
    (next: string[]) => {
      const sorted = sortSelectedIds(
        next.filter((id) => enabledSet.has(id)),
        enabledSorted,
      )
      if (sorted.length === 0) return
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          p.set('langs', sorted.join(','))
          p.set('lang', sorted[0])
          return p
        },
        { replace: true },
      )
    },
    [enabledSet, enabledSorted, setSearchParams],
  )

  const toggleLang = useCallback(
    (id: string, checked: boolean) => {
      if (checked) {
        pushSelection([...selectedIds, id])
        return
      }
      if (selectedIds.length <= 1) return
      pushSelection(selectedIds.filter((x) => x !== id))
    },
    [pushSelection, selectedIds],
  )

  const [html, setHtml] = useState(DEFAULT_HTML)
  const [css, setCss] = useState(DEFAULT_CSS)
  const [js, setJs] = useState(DEFAULT_JS)
  const [reactCode, setReactCode] = useState(DEFAULT_REACT)
  const [iframeKey, setIframeKey] = useState(0)

  const [monoByLang, setMonoByLang] = useState<Record<string, string>>(() => ({ ...PLAYGROUND_MONO_DEFAULTS }))
  const monoCode = monoByLang[activeTab] ?? PLAYGROUND_MONO_DEFAULTS[activeTab] ?? ''
  const setMonoCode = useCallback(
    (text: string) => {
      setMonoByLang((prev) => ({ ...prev, [activeTab]: text }))
    },
    [activeTab],
  )

  const [mockOutput, setMockOutput] = useState('')

  const showBrowser = selectionHasWebPreview(selectedIds, getLanguageById) && previewOpen

  const jsForIframe = useMemo(() => {
    const parts: string[] = []
    if (selectedIds.includes('js')) parts.push(js)
    if (selectedIds.includes('react')) parts.push(reactCode)
    return parts.join('\n\n/* --- */\n\n')
  }, [js, reactCode, selectedIds])

  const srcDoc = useMemo(() => buildSrcDoc(html, css, jsForIframe), [html, css, jsForIframe])

  const refreshPreview = useCallback(() => {
    setIframeKey((k) => k + 1)
  }, [])

  const activeDef = activeTab ? getLanguageById(activeTab) : undefined

  const runServerMock = useCallback(() => {
    const title = activeDef?.title ?? 'язык'
    setMockOutput(
      `[мок-раннер] Запуск ${title}…\n` +
        `pid: sandbox-${Date.now()}\n` +
        `stdout:\n${monoCode.slice(0, 400)}${monoCode.length > 400 ? '\n…' : ''}\n` +
        `exit: 0`,
    )
  }, [activeDef?.title, monoCode])

  const runTsMock = useCallback(() => {
    setMockOutput('tsc --noEmit --pretty (мок): ошибок не найдено.\nЦель: подключить реальный компилятор или WASM.')
  }, [])

  const runStaticMock = useCallback(() => {
    if (activeTab === 'json') {
      try {
        JSON.parse(monoCode)
        setMockOutput('JSON синтаксически корректен (проверка в браузере).')
      } catch (e) {
        setMockOutput(`Ошибка JSON: ${e instanceof Error ? e.message : String(e)}`)
      }
      return
    }
    setMockOutput('SQL: проверка на сервере (мок). Сохраните запрос для отправки в API.')
  }, [activeTab, monoCode])

  const runForActive = useCallback(() => {
    if (!activeDef) return
    if (activeDef.runner === 'iframe-web') {
      refreshPreview()
      return
    }
    if (activeDef.runner === 'typescript-note') {
      runTsMock()
      return
    }
    if (activeDef.runner === 'server-mock') {
      runServerMock()
      return
    }
    runStaticMock()
  }, [activeDef, refreshPreview, runServerMock, runStaticMock, runTsMock])

  useEffect(() => {
    setMockOutput('')
  }, [activeTab])

  const runLabel =
    activeDef?.runner === 'iframe-web'
      ? 'Обновить предпросмотр'
      : activeDef?.runner === 'typescript-note'
        ? 'Проверить типы (мок)'
        : activeDef?.runner === 'static-only' && activeTab === 'json'
          ? 'Проверить JSON'
          : activeDef?.runner === 'static-only'
            ? 'Проверить (мок)'
            : 'Запустить (мок)'

  const linesCount = useMemo(() => {
    if (!activeDef) return 0
    if (activeDef.runner === 'iframe-web') {
      if (activeTab === 'html') return html.split('\n').length
      if (activeTab === 'css') return css.split('\n').length
      if (activeTab === 'js') return js.split('\n').length
      if (activeTab === 'react') return reactCode.split('\n').length
      return 0
    }
    return monoCode.split('\n').length
  }, [activeDef, activeTab, html, css, js, reactCode, monoCode])

  return (
    <CodingPlatformPageShell
      wide
      title="Песочница live-coding"
      description="Режим IDE: несколько языков во вкладках, отдельная панель браузера при веб-стеке. Параметры URL: langs=html,css,js, preview=1|0, lang — первичный для обратной совместимости."
    >
      <Box className={ideStyles.ideChrome}>
        <Flex className={ideStyles.ideToolbar} align="center" gap="2" wrap="wrap">
          <Text size="2" weight="bold">
            Рабочая область
          </Text>
          <Dialog.Root open={langDialogOpen} onOpenChange={setLangDialogOpen}>
            <Dialog.Trigger>
              <Button size="2" variant="soft">
                Языки и стеки…
              </Button>
            </Dialog.Trigger>
            <Dialog.Content size="3" style={{ maxWidth: 440 }}>
              <Dialog.Title>Открытые языки</Dialog.Title>
              <Dialog.Description size="2" color="gray" mb="3">
                Отметьте один или несколько подключённых языков. Вкладки редактора следуют порядку каталога. Минимум один
                язык.
              </Dialog.Description>
              <Flex direction="column" gap="1">
                {enabledSorted.map((l) => {
                  const on = selectedIds.includes(l.id)
                  return (
                    <Flex key={l.id} align="center" justify="between" gap="3" className={ideStyles.langDialogRow}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}>
                        <Checkbox
                          checked={on}
                          disabled={on && selectedIds.length <= 1}
                          onCheckedChange={(v) => toggleLang(l.id, v === true)}
                        />
                        <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                          <Text size="2" weight="medium">
                            {l.title}
                          </Text>
                          <Text size="1" color="gray">
                            {RUNNER_LABEL[l.runner] ?? l.runner}
                          </Text>
                        </Flex>
                      </label>
                    </Flex>
                  )
                })}
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          {selectionHasWebPreview(selectedIds, getLanguageById) ? (
            <Flex align="center" gap="2">
              <Text size="2">Браузер</Text>
              <Switch checked={previewOpen} onCheckedChange={setPreviewOpen} aria-label="Панель предпросмотра" />
            </Flex>
          ) : null}

          <Button size="2" variant="solid" onClick={runForActive} disabled={!activeDef}>
            <Flex align="center" gap="2">
              <PlayIcon width={14} height={14} />
              {runLabel}
            </Flex>
          </Button>

          <Text className={ideStyles.ideToolbarMeta} size="1" color="gray">
            Вкладок: {selectedIds.length}
            {showBrowser ? ' · предпросмотр вкл.' : ''}
          </Text>
        </Flex>

        <Box
          className={`${ideStyles.ideWorkArea} ${showBrowser ? ideStyles.ideWorkAreaSplit : ''}`.trim()}
        >
          <Box className={ideStyles.ideEditorColumn}>
            <Tabs.Root
              className={ideStyles.ideTabsRoot}
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <Tabs.List className={ideStyles.ideTabsList}>
                {selectedIds.map((id) => {
                  const d = getLanguageById(id)
                  return (
                    <Tabs.Trigger key={id} value={id}>
                      {d?.title ?? id}
                    </Tabs.Trigger>
                  )
                })}
              </Tabs.List>

              {selectedIds.map((id) => {
                const d = getLanguageById(id)
                if (!d) return null
                if (d.runner === 'iframe-web' && id === 'html') {
                  return (
                    <Tabs.Content key={id} value="html" className={ideStyles.ideTabContent}>
                      <Text className={ideStyles.ideLabel}>HTML</Text>
                      <textarea
                        className={ideStyles.ideTextarea}
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        spellCheck={false}
                        aria-label="HTML"
                      />
                    </Tabs.Content>
                  )
                }
                if (d.runner === 'iframe-web' && id === 'css') {
                  return (
                    <Tabs.Content key={id} value="css" className={ideStyles.ideTabContent}>
                      <Text className={ideStyles.ideLabel}>CSS</Text>
                      <textarea
                        className={ideStyles.ideTextarea}
                        value={css}
                        onChange={(e) => setCss(e.target.value)}
                        spellCheck={false}
                        aria-label="CSS"
                      />
                    </Tabs.Content>
                  )
                }
                if (d.runner === 'iframe-web' && id === 'js') {
                  return (
                    <Tabs.Content key={id} value="js" className={ideStyles.ideTabContent}>
                      <Text className={ideStyles.ideLabel}>JavaScript</Text>
                      <textarea
                        className={ideStyles.ideTextarea}
                        value={js}
                        onChange={(e) => setJs(e.target.value)}
                        spellCheck={false}
                        aria-label="JavaScript"
                      />
                    </Tabs.Content>
                  )
                }
                if (d.runner === 'iframe-web' && id === 'react') {
                  return (
                    <Tabs.Content key={id} value="react" className={ideStyles.ideTabContent}>
                      <Text className={ideStyles.ideLabel}>React (доп. к JS в iframe, мок)</Text>
                      <textarea
                        className={ideStyles.ideTextarea}
                        value={reactCode}
                        onChange={(e) => setReactCode(e.target.value)}
                        spellCheck={false}
                        aria-label="React"
                      />
                    </Tabs.Content>
                  )
                }
                if (d.runner !== 'iframe-web') {
                  const code = monoByLang[id] ?? PLAYGROUND_MONO_DEFAULTS[id] ?? ''
                  return (
                    <Tabs.Content key={id} value={id} className={ideStyles.ideTabContent}>
                      <Text className={ideStyles.ideLabel}>{d.title}</Text>
                      <textarea
                        className={ideStyles.ideTextarea}
                        value={code}
                        onChange={(e) =>
                          setMonoByLang((prev) => ({
                            ...prev,
                            [id]: e.target.value,
                          }))
                        }
                        spellCheck={false}
                        aria-label={d.title}
                      />
                    </Tabs.Content>
                  )
                }
                return null
              })}
            </Tabs.Root>

            {mockOutput ? <Box className={ideStyles.ideOutput}>{mockOutput}</Box> : null}
          </Box>

          {showBrowser ? (
            <Box className={ideStyles.idePreviewColumn}>
              <Box className={ideStyles.idePreviewHead}>Предпросмотр (iframe)</Box>
              <Box className={ideStyles.idePreviewBody}>
                <iframe
                  key={iframeKey}
                  title="Предпросмотр песочницы"
                  sandbox="allow-scripts"
                  srcDoc={srcDoc}
                  style={{
                    flex: 1,
                    minHeight: 200,
                    width: '100%',
                    border: '1px solid var(--gray-a6)',
                    borderRadius: 'var(--radius-3)',
                    background: '#fff',
                  }}
                />
                <Text size="1" color="gray" mt="2">
                  sandbox=&quot;allow-scripts&quot; — изолирован от родительского окна. HTML/CSS/JS/React склеиваются в один
                  документ.
                </Text>
              </Box>
            </Box>
          ) : null}
        </Box>

        <Flex className={ideStyles.ideStatusBar} align="center">
          <Text size="1">
            UTF-8 · строк: {linesCount}
            {activeDef ? ` · ${activeDef.title}` : ''}
          </Text>
          <Text size="1">
            {activeDef ? RUNNER_LABEL[activeDef.runner] ?? activeDef.runner : '—'}
          </Text>
          <Text size="1">мок-слой (без реального API)</Text>
        </Flex>
      </Box>

      <Card size="2" mt="3">
        <Text size="2" color="gray">
          Примеры ссылок:{' '}
          <code>/coding-platform/playground?lang=html</code> (автодобавит langs для веб-стека),{' '}
          <code>?langs=html,css,ts&amp;preview=1</code>, <code>?preview=0</code> — только редакторы.
        </Text>
      </Card>
    </CodingPlatformPageShell>
  )
}
