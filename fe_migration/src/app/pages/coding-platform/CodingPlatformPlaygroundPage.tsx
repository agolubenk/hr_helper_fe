import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Button, Checkbox, Dialog, Flex, Switch, Tabs, Text } from '@radix-ui/themes'
import {
  CaretLeftIcon,
  CaretRightIcon,
  ChevronDownIcon,
  DashboardIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  FileTextIcon,
  LayersIcon,
  PlayIcon,
} from '@radix-ui/react-icons'
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
import { PlaygroundHighlightedEditor } from './PlaygroundHighlightedEditor'

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

const PREVIEW_DEBOUNCE_MS = 320

type DocumentWithWebkitFs = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}

type HTMLElementWithWebkitFs = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>
}

function getFullscreenElement(): Element | null {
  const doc = document as DocumentWithWebkitFs
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

async function exitFullscreenCompat(): Promise<void> {
  const doc = document as DocumentWithWebkitFs
  if (document.fullscreenElement != null && typeof document.exitFullscreen === 'function') {
    await document.exitFullscreen()
  } else if (typeof doc.webkitExitFullscreen === 'function') {
    await doc.webkitExitFullscreen()
  }
}

async function requestFullscreenCompat(el: HTMLElement): Promise<void> {
  const node = el as HTMLElementWithWebkitFs
  if (typeof el.requestFullscreen === 'function') {
    await el.requestFullscreen()
  } else if (typeof node.webkitRequestFullscreen === 'function') {
    await node.webkitRequestFullscreen()
  }
}

const WORKSPACE_TITLE_STORAGE_KEY = 'coding-playground-workspace-title'
const DEFAULT_WORKSPACE_TITLE = 'Рабочая область'

function readStoredWorkspaceTitle(): string {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE_TITLE
  try {
    const raw = localStorage.getItem(WORKSPACE_TITLE_STORAGE_KEY)?.trim()
    return raw && raw.length > 0 ? raw : DEFAULT_WORKSPACE_TITLE
  } catch {
    return DEFAULT_WORKSPACE_TITLE
  }
}

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

function cursorLineCol(text: string, index: number): { line: number; col: number } {
  const i = Math.max(0, Math.min(index, text.length))
  const before = text.slice(0, i)
  const lines = before.split('\n')
  const line = lines.length
  const col = (lines[lines.length - 1]?.length ?? 0) + 1
  return { line, col }
}

const RUNNER_LABEL: Record<string, string> = {
  'iframe-web': 'браузер',
  'typescript-note': 'tsc (мок)',
  'static-only': 'статика',
  'server-mock': 'раннер (мок)',
}

function bottomPanelCopyForLang(def: CodingLanguageDefinition | undefined): { main: string; hint: string } {
  if (!def) {
    return { main: 'Вывод', hint: 'Выберите вкладку языка.' }
  }
  if (def.runner === 'iframe-web') {
    return {
      main: 'Терминал',
      hint: `${def.title}: логи debounce и принудительного обновления предпросмотра (мок).`,
    }
  }
  if (def.runner === 'typescript-note') {
    return {
      main: 'Консоль',
      hint: `${def.title}: вывод проверки типов (мок, без реального tsc).`,
    }
  }
  if (def.runner === 'server-mock') {
    return {
      main: 'Консоль',
      hint: `${def.title}: stdout / stderr раннера в песочнице (мок).`,
    }
  }
  return {
    main: 'Консоль',
    hint: `${def.title}: статическая проверка или парсинг без исполнения (мок).`,
  }
}

function usePlaygroundNarrow(): boolean {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)')
    const apply = () => setNarrow(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return narrow
}

export function CodingPlatformPlaygroundPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [enabledIds, setEnabledIds] = useState<string[]>(() => readEnabledCodingLanguageIds())
  const [langDialogOpen, setLangDialogOpen] = useState(false)
  const [workspaceTitle, setWorkspaceTitle] = useState(readStoredWorkspaceTitle)
  const narrowLayout = usePlaygroundNarrow()
  const splitRowRef = useRef<HTMLDivElement | null>(null)
  const sideSplitRef = useRef<HTMLDivElement | null>(null)
  const editorColumnRef = useRef<HTMLDivElement | null>(null)
  const sideColumnRef = useRef<HTMLDivElement | null>(null)
  const ideRootRef = useRef<HTMLDivElement | null>(null)

  const [editorFontPx, setEditorFontPx] = useState(13)
  const [activityBarVisible, setActivityBarVisible] = useState(true)
  const [splitRatio, setSplitRatio] = useState(0.56)
  const [sidePreviewRatio, setSidePreviewRatio] = useState(0.55)
  const [sashDragging, setSashDragging] = useState(false)
  const [sideSashDragging, setSideSashDragging] = useState(false)
  const [debouncedSrcDoc, setDebouncedSrcDoc] = useState('')
  const [caret, setCaret] = useState({ line: 1, col: 1 })
  const [activityFocus, setActivityFocus] = useState<'explorer' | 'preview'>('explorer')
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true)
  const [ideFullscreen, setIdeFullscreen] = useState(false)

  useEffect(() => {
    const sync = () => setEnabledIds(readEnabledCodingLanguageIds())
    window.addEventListener(CODING_LANGUAGES_CHANGED_EVENT, sync)
    return () => window.removeEventListener(CODING_LANGUAGES_CHANGED_EVENT, sync)
  }, [])

  useEffect(() => {
    const syncFs = () => {
      setIdeFullscreen(getFullscreenElement() === ideRootRef.current)
    }
    document.addEventListener('fullscreenchange', syncFs)
    document.addEventListener('webkitfullscreenchange', syncFs as EventListener)
    return () => {
      document.removeEventListener('fullscreenchange', syncFs)
      document.removeEventListener('webkitfullscreenchange', syncFs as EventListener)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        setEditorFontPx((n) => Math.min(n + 1, 22))
      }
      if (e.key === '-') {
        e.preventDefault()
        setEditorFontPx((n) => Math.max(n - 1, 10))
      }
      if (e.key === '0') {
        e.preventDefault()
        setEditorFontPx(13)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const enabledSorted = useMemo(
    () => sortCatalog(enabledIds.map((id) => getLanguageById(id)).filter(Boolean) as CodingLanguageDefinition[]),
    [enabledIds],
  )

  const enabledSet = useMemo(() => new Set(enabledIds), [enabledIds])

  const langsParam = searchParams.get('langs')
  const langParam = searchParams.get('lang')
  const previewOpen = searchParams.get('preview') !== '0'
  const outputOpen = searchParams.get('output') !== '0'

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
        if (!p.has('output')) p.set('output', '1')
        return p
      },
      { replace: true },
    )
  }, [selectedIds, langsParam, enabledIds.length, setSearchParams])

  const canWebPreview = useMemo(
    () => selectionHasWebPreview(selectedIds, getLanguageById),
    [selectedIds],
  )

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

  const setOutputOpen = useCallback(
    (open: boolean) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          p.set('output', open ? '1' : '0')
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
  const [terminalLines, setTerminalLines] = useState<string[]>(() => [
    'sandbox@playground:~$ мок-терминал предпросмотра. Логи появляются при обновлении iframe.',
  ])

  const appendTerminalLine = useCallback((message: string) => {
    const stamp = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    setTerminalLines((prev) => [...prev, `${stamp}  ${message}`].slice(-320))
  }, [])

  const showBrowser = canWebPreview && previewOpen
  const showOutputPanel = outputOpen
  const showSideColumn = showBrowser || showOutputPanel

  const jsForIframe = useMemo(() => {
    const parts: string[] = []
    if (selectedIds.includes('js')) parts.push(js)
    if (selectedIds.includes('react')) parts.push(reactCode)
    return parts.join('\n\n/* --- */\n\n')
  }, [js, reactCode, selectedIds])

  const srcDoc = useMemo(() => buildSrcDoc(html, css, jsForIframe), [html, css, jsForIframe])

  useEffect(() => {
    if (!showBrowser) {
      setDebouncedSrcDoc('')
      return
    }
    const t = window.setTimeout(() => setDebouncedSrcDoc(srcDoc), PREVIEW_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [srcDoc, showBrowser])

  const previewDocLoggedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!showBrowser) previewDocLoggedRef.current = null
  }, [showBrowser])

  useEffect(() => {
    if (!showBrowser || !debouncedSrcDoc) return
    if (previewDocLoggedRef.current === debouncedSrcDoc) return
    previewDocLoggedRef.current = debouncedSrcDoc
    appendTerminalLine('preview: документ применён в iframe (debounce)')
  }, [appendTerminalLine, debouncedSrcDoc, showBrowser])

  const refreshPreview = useCallback(() => {
    setDebouncedSrcDoc(srcDoc)
    setIframeKey((k) => k + 1)
  }, [srcDoc])

  const activeDef = activeTab ? getLanguageById(activeTab) : undefined

  const activeEditorText = useMemo(() => {
    if (!activeDef) return ''
    if (activeDef.runner === 'iframe-web') {
      if (activeTab === 'html') return html
      if (activeTab === 'css') return css
      if (activeTab === 'js') return js
      if (activeTab === 'react') return reactCode
    }
    return monoCode
  }, [activeDef, activeTab, html, css, js, reactCode, monoCode])

  useEffect(() => {
    const { line, col } = cursorLineCol(activeEditorText, 0)
    setCaret({ line, col })
  }, [activeTab, activeEditorText])

  const updateCaretFromEvent = useCallback(
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const t = e.currentTarget
      setCaret(cursorLineCol(t.value, t.selectionStart))
    },
    [],
  )

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
    if (activeTab === 'docker') {
      setMockOutput('Dockerfile: статическая проверка инструкций (мок). Подключите hadolint или API.')
      return
    }
    if (activeTab === 'markdown') {
      setMockOutput('Markdown: разбор заголовков и блоков кода (мок).')
      return
    }
    if (activeTab === 'sql') {
      setMockOutput('SQL: проверка на сервере (мок). Сохраните запрос для отправки в API.')
      return
    }
    setMockOutput('Статическая проверка (мок).')
  }, [activeTab, monoCode])

  const runForActive = useCallback(() => {
    if (!activeDef) return
    if (activeDef.runner === 'iframe-web') {
      refreshPreview()
      appendTerminalLine('run: принудительное обновление предпросмотра')
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
  }, [activeDef, appendTerminalLine, refreshPreview, runServerMock, runStaticMock, runTsMock])

  useEffect(() => {
    setMockOutput('')
  }, [activeTab])

  const runLabel = 'Запустить'

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

  const focusFirstEditor = useCallback(() => {
    const ta = editorColumnRef.current?.querySelector('textarea')
    ta?.focus()
    setActivityFocus('explorer')
  }, [])

  const focusSidePanel = useCallback(() => {
    sideColumnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setActivityFocus('preview')
  }, [])

  const finalizeWorkspaceTitle = useCallback((raw: string) => {
    const next = raw.trim() || DEFAULT_WORKSPACE_TITLE
    setWorkspaceTitle(next)
    try {
      localStorage.setItem(WORKSPACE_TITLE_STORAGE_KEY, next)
    } catch {
      /* quota / private mode */
    }
  }, [])

  const toggleIdeFullscreen = useCallback(async () => {
    const host = ideRootRef.current
    if (!host) return
    try {
      if (getFullscreenElement() === host) {
        await exitFullscreenCompat()
      } else {
        await requestFullscreenCompat(host)
      }
    } catch {
      /* отклонено пользователем или API недоступно */
    }
  }, [])

  const onSashMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (narrowLayout || !showSideColumn) return
      e.preventDefault()
      setSashDragging(true)
      const row = splitRowRef.current
      if (!row) return
      const rect = row.getBoundingClientRect()
      const onMove = (ev: MouseEvent) => {
        const x = ev.clientX - rect.left
        const next = Math.min(0.82, Math.max(0.22, x / rect.width))
        setSplitRatio(next)
      }
      const onUp = () => {
        setSashDragging(false)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [narrowLayout, showSideColumn],
  )

  const onSideSashMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (narrowLayout || !showBrowser || !showOutputPanel || !bottomPanelOpen) return
      e.preventDefault()
      setSideSashDragging(true)
      const host = sideSplitRef.current
      if (!host) return
      const rect = host.getBoundingClientRect()
      const onMove = (ev: MouseEvent) => {
        const y = ev.clientY - rect.top
        const next = Math.min(0.82, Math.max(0.18, y / rect.height))
        setSidePreviewRatio(next)
      }
      const onUp = () => {
        setSideSashDragging(false)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [bottomPanelOpen, narrowLayout, showBrowser, showOutputPanel],
  )

  const previewGrow = Math.round(sidePreviewRatio * 100)
  const outputGrow = 100 - previewGrow
  const bottomPanelLegend = useMemo(() => bottomPanelCopyForLang(activeDef), [activeDef])
  const bottomPanelBody =
    activeDef?.runner === 'iframe-web'
      ? terminalLines.join('\n')
      : mockOutput.trim().length > 0
        ? mockOutput
        : null

  const activeEditor = useMemo(() => {
    if (!activeTab || !selectedIds.includes(activeTab)) return null
    const d = getLanguageById(activeTab)
    if (!d) return null
    const common = {
      fontSizePx: editorFontPx,
      onCaret: updateCaretFromEvent,
    } as const
    if (d.runner === 'iframe-web') {
      if (activeTab === 'html') {
        return (
          <PlaygroundHighlightedEditor
            tabId="html"
            value={html}
            onChange={setHtml}
            ariaLabel="HTML"
            {...common}
          />
        )
      }
      if (activeTab === 'css') {
        return (
          <PlaygroundHighlightedEditor tabId="css" value={css} onChange={setCss} ariaLabel="CSS" {...common} />
        )
      }
      if (activeTab === 'js') {
        return (
          <PlaygroundHighlightedEditor
            tabId="js"
            value={js}
            onChange={setJs}
            ariaLabel="JavaScript"
            {...common}
          />
        )
      }
      if (activeTab === 'react') {
        return (
          <PlaygroundHighlightedEditor
            tabId="react"
            value={reactCode}
            onChange={setReactCode}
            ariaLabel="React"
            {...common}
          />
        )
      }
    }
    const code = monoByLang[activeTab] ?? PLAYGROUND_MONO_DEFAULTS[activeTab] ?? ''
    return (
      <PlaygroundHighlightedEditor
        plain
        tabId={activeTab}
        value={code}
        onChange={(next) =>
          setMonoByLang((prev) => ({
            ...prev,
            [activeTab]: next,
          }))
        }
        ariaLabel={d.title}
        {...common}
      />
    )
  }, [
    activeTab,
    selectedIds,
    html,
    css,
    js,
    reactCode,
    monoByLang,
    editorFontPx,
    updateCaretFromEvent,
  ])

  const reverseTerminalChrome = showBrowser && showOutputPanel

  const browserPreviewTree = (
    <>
      <Box className={ideStyles.idePreviewChrome}>
        <span className={ideStyles.idePreviewTitle}>Предпросмотр</span>
        <span className={ideStyles.idePreviewDots} aria-hidden>
          <span className={ideStyles.idePreviewDot} style={{ background: 'var(--red-9)' }} />
          <span className={ideStyles.idePreviewDot} style={{ background: 'var(--amber-9)' }} />
          <span className={ideStyles.idePreviewDot} style={{ background: 'var(--green-9)' }} />
        </span>
      </Box>
      <Box className={ideStyles.idePreviewBody}>
        <iframe
          key={iframeKey}
          title="Предпросмотр песочницы"
          sandbox="allow-scripts"
          srcDoc={debouncedSrcDoc}
          style={{
            flex: 1,
            minHeight: 200,
            width: '100%',
            border: '1px solid var(--gray-a6)',
            borderRadius: 'var(--radius-3)',
            background: '#fff',
          }}
        />
      </Box>
    </>
  )

  const sideOutputPanel = (
    <div
      className={[
        ideStyles.ideBottomPanel,
        ideStyles.ideBottomPanelInSide,
        bottomPanelOpen ? ideStyles.ideBottomPanelExpanded : ideStyles.ideBottomPanelCollapsed,
        reverseTerminalChrome ? ideStyles.ideBottomPanelReverse : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={ideStyles.ideBottomPanelHead}
        aria-expanded={bottomPanelOpen}
        aria-controls="playground-bottom-panel-body"
        id="playground-bottom-panel-head"
        onClick={() => setBottomPanelOpen((o) => !o)}
      >
        <ChevronDownIcon className={ideStyles.ideBottomPanelChevron} width={16} height={16} aria-hidden />
        <span className={ideStyles.ideBottomPanelHeadText}>
          <span className={ideStyles.ideBottomPanelHeadMain}>{bottomPanelLegend.main}</span>
          <span className={ideStyles.ideBottomPanelHeadHint}>{bottomPanelLegend.hint}</span>
        </span>
      </button>
      <Box
        id="playground-bottom-panel-body"
        role="region"
        aria-labelledby="playground-bottom-panel-head"
        className={ideStyles.ideBottomPanelBody}
      >
        {bottomPanelBody ? (
          bottomPanelBody
        ) : (
          <span className={ideStyles.ideBottomPanelPlaceholder}>
            {activeDef?.runner === 'iframe-web'
              ? 'Сообщения появятся после правок с включённым предпросмотром или по кнопке запуска.'
              : 'Запустите проверку или раннер — вывод появится здесь.'}
          </span>
        )}
      </Box>
    </div>
  )

  return (
    <CodingPlatformPageShell title="Песочница live-coding" fillAvailableHeight>
      <Box ref={ideRootRef} className={ideStyles.ideRoot} data-playground-ide>
        <Flex className={ideStyles.ideToolbar} align="center" gap="2" wrap="nowrap">
          <div className={ideStyles.ideToolbarLead}>
            <button
              type="button"
              className={ideStyles.ideActivityToggle}
              aria-pressed={activityBarVisible}
              aria-label={
                activityBarVisible ? 'Скрыть панель активности' : 'Показать панель активности'
              }
              onClick={() => setActivityBarVisible((v) => !v)}
            >
              {activityBarVisible ? <CaretLeftIcon width={16} height={16} /> : <CaretRightIcon width={16} height={16} />}
            </button>
            <input
              type="text"
              className={ideStyles.ideWorkspaceTitle}
              value={workspaceTitle}
              onChange={(e) => setWorkspaceTitle(e.target.value)}
              onBlur={(e) => finalizeWorkspaceTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              }}
              maxLength={120}
              spellCheck={false}
              aria-label="Название рабочей области"
            />

            {canWebPreview ? (
              <Flex align="center" gap="2">
                <Text size="2">Браузер</Text>
                <Switch checked={previewOpen} onCheckedChange={setPreviewOpen} aria-label="Панель предпросмотра" />
              </Flex>
            ) : null}

            <Flex align="center" gap="2">
              <Text size="2">Вывод</Text>
              <Switch
                checked={outputOpen}
                onCheckedChange={setOutputOpen}
                aria-label="Панель терминала или консоли"
              />
            </Flex>
          </div>

          <Button
            size="2"
            variant="soft"
            onClick={() => void toggleIdeFullscreen()}
            aria-pressed={ideFullscreen}
            aria-label={
              ideFullscreen
                ? 'Выйти из полноэкранного режима рабочей области'
                : 'Показать рабочую область на весь экран'
            }
            style={{ flexShrink: 0 }}
          >
            <Flex align="center" gap="2">
              {ideFullscreen ? (
                <ExitFullScreenIcon width={14} height={14} aria-hidden />
              ) : (
                <EnterFullScreenIcon width={14} height={14} aria-hidden />
              )}
              {ideFullscreen ? 'Выйти' : 'На весь экран'}
            </Flex>
          </Button>

          <Button size="2" variant="solid" onClick={runForActive} disabled={!activeDef} style={{ flexShrink: 0 }}>
            <Flex align="center" gap="2">
              <PlayIcon width={14} height={14} />
              {runLabel}
            </Flex>
          </Button>
        </Flex>

        <Dialog.Root open={langDialogOpen} onOpenChange={setLangDialogOpen}>
          <Dialog.Content size="3" style={{ maxWidth: 440 }}>
            <Dialog.Title>Открытые языки</Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="3">
              Отметьте один или несколько подключённых языков. Вкладки редактора следуют порядку каталога. Минимум один язык.
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

        <div className={ideStyles.ideMain}>
          {activityBarVisible ? (
            <div className={ideStyles.ideActivityBar} aria-label="Панель активности">
            <button
              type="button"
              className={`${ideStyles.ideActivityBtn} ${activityFocus === 'explorer' ? ideStyles.ideActivityBtnActive : ''}`}
              title="Фокус на редакторе"
              aria-label="Фокус на редакторе"
              onClick={focusFirstEditor}
            >
              <FileTextIcon width={20} height={20} />
            </button>
            <button
              type="button"
              className={`${ideStyles.ideActivityBtn} ${activityFocus === 'preview' ? ideStyles.ideActivityBtnActive : ''}`}
              title="К боковой панели"
              aria-label="К боковой панели (предпросмотр или вывод)"
              onClick={focusSidePanel}
              disabled={!showSideColumn}
            >
              <DashboardIcon width={20} height={20} />
            </button>
            <button type="button" className={ideStyles.ideActivityBtn} title="Стеки (языки)" aria-label="Языки" onClick={() => setLangDialogOpen(true)}>
              <LayersIcon width={20} height={20} />
            </button>
            </div>
          ) : null}

          <div className={ideStyles.ideWorkspace}>
            <div ref={splitRowRef} className={ideStyles.ideSplitRow}>
              <Box
                ref={editorColumnRef}
                className={ideStyles.ideEditorColumn}
                style={
                  !showSideColumn || narrowLayout
                    ? { flex: 1, minWidth: 0, width: '100%' }
                    : { width: `${splitRatio * 100}%`, minWidth: 0 }
                }
              >
                <Tabs.Root className={ideStyles.ideTabsRoot} value={activeTab} onValueChange={setActiveTab}>
                  <Tabs.List className={ideStyles.ideTabsList}>
                    {selectedIds.map((id) => {
                      const d = getLanguageById(id)
                      return (
                        <Tabs.Trigger key={id} value={id} className={ideStyles.ideTabTrigger}>
                          {d?.title ?? id}
                        </Tabs.Trigger>
                      )
                    })}
                  </Tabs.List>

                  <div className={ideStyles.ideTabsPanelWrap}>
                    {activeTab && selectedIds.includes(activeTab) ? (
                      <Tabs.Content key={activeTab} value={activeTab} className={ideStyles.ideTabContent}>
                        {activeEditor}
                      </Tabs.Content>
                    ) : null}
                  </div>
                </Tabs.Root>
              </Box>

              {showSideColumn && !narrowLayout ? (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  className={`${ideStyles.ideSash} ${sashDragging ? ideStyles.ideSashDragging : ''}`}
                  onMouseDown={onSashMouseDown}
                />
              ) : null}

              {showSideColumn ? (
                <Box ref={sideColumnRef} className={ideStyles.ideSideColumn}>
                  {showBrowser && showOutputPanel && bottomPanelOpen ? (
                    <div ref={sideSplitRef} className={ideStyles.ideSideSplitHost}>
                      <div
                        className={ideStyles.ideSidePreview}
                        style={{ flex: `${previewGrow} 1 0%`, minHeight: 0 }}
                      >
                        {browserPreviewTree}
                      </div>
                      <div
                        role="separator"
                        aria-orientation="horizontal"
                        className={`${ideStyles.ideSashRow} ${sideSashDragging ? ideStyles.ideSashRowDragging : ''}`}
                        onMouseDown={onSideSashMouseDown}
                      />
                      <div
                        className={`${ideStyles.ideSideOutput} ${ideStyles.ideSideOutputStacked}`}
                        style={{ flex: `${outputGrow} 1 0%`, minHeight: 0 }}
                      >
                        {sideOutputPanel}
                      </div>
                    </div>
                  ) : showBrowser && showOutputPanel && !bottomPanelOpen ? (
                    <>
                      <div className={`${ideStyles.ideSidePreview} ${ideStyles.ideSidePreviewFill}`}>
                        {browserPreviewTree}
                      </div>
                      <div className={`${ideStyles.ideSideOutput} ${ideStyles.ideSideOutputStacked}`}>
                        {sideOutputPanel}
                      </div>
                    </>
                  ) : showBrowser ? (
                    <div className={`${ideStyles.ideSidePreview} ${ideStyles.ideSidePreviewFill}`}>
                      {browserPreviewTree}
                    </div>
                  ) : showOutputPanel ? (
                    <div className={ideStyles.ideSideOutput}>{sideOutputPanel}</div>
                  ) : null}
                </Box>
              ) : null}
            </div>
          </div>
        </div>

        <Flex className={ideStyles.ideStatusBar} align="center">
          <Text size="1">
            UTF-8 · Ln {caret.line}, Col {caret.col} · строк: {linesCount}
            {activeDef ? ` · ${activeDef.title}` : ''}
          </Text>
          <Text size="1">{activeDef ? RUNNER_LABEL[activeDef.runner] ?? activeDef.runner : '—'}</Text>
          <Text size="1">
            шрифт {editorFontPx}px · мок-слой (без реального API)
          </Text>
        </Flex>
      </Box>
    </CodingPlatformPageShell>
  )
}
