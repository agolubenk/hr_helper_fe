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

  const highlighted = useMemo(
    () => (plain ? '' : highlightPlaygroundCode(tabId, value)),
    [plain, tabId, value],
  )

  const syncScroll = useCallback(() => {
    const ta = taRef.current
    const pre = preRef.current
    if (!ta || !pre) return
    pre.scrollTop = ta.scrollTop
    pre.scrollLeft = ta.scrollLeft
  }, [])

  useLayoutEffect(() => {
    syncScroll()
  }, [highlighted, syncScroll, fontSizePx, value])

  useLayoutEffect(() => {
    const ta = taRef.current
    const host = ta?.parentElement
    if (!ta || !host || plain) return
    const ro = new ResizeObserver(() => {
      syncScroll()
    })
    ro.observe(host)
    return () => ro.disconnect()
  }, [plain, syncScroll])

  const fontStyle = useMemo(() => ({ fontSize: `${fontSizePx}px` }), [fontSizePx])

  if (plain) {
    return (
      <div className={ideStyles.ideEditorStack} style={fontStyle}>
        <textarea
          ref={taRef}
          className={ideStyles.ideTextareaPlain}
          value={value}
          spellCheck={false}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          onSelect={onCaret}
          onKeyUp={onCaret}
          onClick={onCaret}
        />
      </div>
    )
  }

  return (
    <div className={ideStyles.ideEditorStack} style={fontStyle}>
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
  )
}
