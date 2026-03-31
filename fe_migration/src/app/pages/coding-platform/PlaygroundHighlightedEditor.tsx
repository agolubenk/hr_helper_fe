import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { highlightPlaygroundCode } from './playgroundPrism'
import ideStyles from './CodingPlatformPlaygroundPage.module.css'

export interface PlaygroundHighlightedEditorProps {
  value: string
  onChange: (next: string) => void
  tabId: string
  fontSizePx: number
  ariaLabel: string
  onCaret: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void
  /** Обычная textarea с видимым текстом (без слоя подсветки) */
  plain?: boolean
}

export const PlaygroundHighlightedEditor = ({
  value,
  onChange,
  tabId,
  fontSizePx,
  ariaLabel,
  onCaret,
  plain = false,
}: PlaygroundHighlightedEditorProps) => {
  const preRef = useRef<HTMLPreElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const lineCount = useMemo(() => Math.max(1, value.split('\n').length), [value])

  const gutterLines = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount],
  )

  const highlighted = useMemo(
    () => (plain ? '' : highlightPlaygroundCode(tabId, value)),
    [plain, tabId, value],
  )

  const syncScroll = useCallback(() => {
    const ta = taRef.current
    const pre = preRef.current
    const gutter = gutterRef.current
    if (!ta) return
    const y = ta.scrollTop
    const x = ta.scrollLeft
    if (pre) {
      pre.scrollTop = y
      pre.scrollLeft = x
    }
    if (gutter) gutter.scrollTop = y
  }, [])

  useLayoutEffect(() => {
    syncScroll()
  }, [highlighted, syncScroll, fontSizePx, value, lineCount])

  useLayoutEffect(() => {
    const ta = taRef.current
    const host = ta?.parentElement
    if (!ta || !host) return
    const ro = new ResizeObserver(() => {
      syncScroll()
    })
    ro.observe(host)
    return () => ro.disconnect()
  }, [plain, syncScroll])

  const editorMetricsStyle = useMemo(
    () => ({ fontSize: `${fontSizePx}px`, lineHeight: 1.55 as const }),
    [fontSizePx],
  )

  const gutter = (
    <div ref={gutterRef} className={ideStyles.ideLineGutter} aria-hidden>
      {gutterLines.map((num) => (
        <div key={num} className={ideStyles.ideLineGutterLine}>
          {num}
        </div>
      ))}
    </div>
  )

  if (plain) {
    return (
      <div className={ideStyles.ideEditorStack} style={editorMetricsStyle}>
        {gutter}
        <div className={ideStyles.ideEditorPane}>
          <textarea
            ref={taRef}
            className={ideStyles.ideTextareaPlain}
            value={value}
            spellCheck={false}
            aria-label={ariaLabel}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onSelect={onCaret}
            onKeyUp={onCaret}
            onClick={onCaret}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={ideStyles.ideEditorStack} style={editorMetricsStyle}>
      {gutter}
      <div className={ideStyles.ideEditorPane}>
        <pre ref={preRef} className={ideStyles.ideHighlightPre} aria-hidden tabIndex={-1}>
          <code className={ideStyles.ideHighlightCode} dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
        <textarea
          ref={taRef}
          className={ideStyles.ideTextarea}
          value={value}
          spellCheck={false}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onSelect={onCaret}
          onKeyUp={onCaret}
          onClick={onCaret}
        />
      </div>
    </div>
  )
}
