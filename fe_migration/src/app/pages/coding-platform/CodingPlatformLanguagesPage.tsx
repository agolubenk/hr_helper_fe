import { useEffect, useMemo, useState } from 'react'
import { Card, Flex, Text, Box, Switch } from '@radix-ui/themes'
import { CodingPlatformPageShell } from './CodingPlatformPageShell'
import { codingGraphEdges, codingGraphNodes } from '@/features/coding-platform/mocks'
import {
  CODING_LANGUAGES_CHANGED_EVENT,
  readEnabledCodingLanguageIds,
} from '@/features/coding-platform/codingPlatformLanguagesStorage'
import styles from '../styles/CodingPlatformPages.module.css'

const NODE_W = 108
const NODE_H = 52

function nodeById(id: string) {
  return codingGraphNodes.find((n) => n.id === id)
}

function filterByEnabled(enabled: Set<string>) {
  const nodes = codingGraphNodes.filter((n) => enabled.has(n.id))
  const ids = new Set(nodes.map((n) => n.id))
  const edges = codingGraphEdges.filter((e) => ids.has(e.fromId) && ids.has(e.toId))
  return { nodes, edges }
}

export function CodingPlatformLanguagesPage() {
  const [enabledIds, setEnabledIds] = useState<string[]>(() => readEnabledCodingLanguageIds())
  const [showFullMap, setShowFullMap] = useState(false)

  useEffect(() => {
    const sync = () => setEnabledIds(readEnabledCodingLanguageIds())
    window.addEventListener(CODING_LANGUAGES_CHANGED_EVENT, sync)
    return () => window.removeEventListener(CODING_LANGUAGES_CHANGED_EVENT, sync)
  }, [])

  const enabledSet = useMemo(() => new Set(enabledIds), [enabledIds])

  const { nodes, edges } = useMemo(() => {
    if (showFullMap) {
      return { nodes: codingGraphNodes, edges: codingGraphEdges }
    }
    return filterByEnabled(enabledSet)
  }, [enabledSet, showFullMap])

  return (
    <CodingPlatformPageShell
      title="Языки и связи"
      description="Карта стеков расширена под каталог (включая Python, Go, Rust, SQL). Режим «только подключённые» скрывает узлы вне вашего набора — как кастомное окружение перед сессией."
    >
      <Card size="2" mb="3">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Text size="2" color="gray" style={{ flex: '1 1 240px' }}>
            Переключатель ниже влияет только на отображение графа. Подключение языков — на странице «Обзор».
          </Text>
          <Flex align="center" gap="2">
            <Text size="2">Показать полную карту</Text>
            <Switch checked={showFullMap} onCheckedChange={setShowFullMap} aria-label="Показать полную карту" />
          </Flex>
        </Flex>
      </Card>

      <Card size="2">
        <Flex direction="column" gap="3">
          <Text size="2" color="gray">
            {!showFullMap
              ? 'Отображаются только подключённые узлы и рёбра между ними.'
              : 'Полная схема: неподключённые узлы приглушены.'}
          </Text>
          <Box className={styles.graphWrap}>
            <svg
              className={styles.graphSvg}
              viewBox="0 0 600 460"
              role="img"
              aria-label="Карта языков и стеков"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="var(--gray-9)" />
                </marker>
              </defs>
              {edges.map((e) => {
                const a = nodeById(e.fromId)
                const b = nodeById(e.toId)
                if (!a || !b) return null
                const dim =
                  showFullMap && (!enabledSet.has(e.fromId) || !enabledSet.has(e.toId)) ? 0.35 : 1
                const x1 = a.x
                const y1 = a.y
                const x2 = b.x
                const y2 = b.y
                const mx = (x1 + x2) / 2
                const my = (y1 + y2) / 2
                return (
                  <g key={e.id} opacity={dim}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="var(--gray-8)"
                      strokeWidth="1.5"
                      markerEnd="url(#arrowhead)"
                    />
                    <text x={mx} y={my - 6} textAnchor="middle" className={styles.edgeLabel}>
                      {e.label}
                    </text>
                  </g>
                )
              })}
              {(showFullMap ? codingGraphNodes : nodes).map((n) => {
                const dim = showFullMap && !enabledSet.has(n.id) ? 0.4 : 1
                const stroke = showFullMap && !enabledSet.has(n.id) ? 'var(--gray-a6)' : 'var(--gray-a7)'
                const fill = showFullMap && !enabledSet.has(n.id) ? 'var(--gray-2)' : 'var(--gray-3)'
                return (
                  <g key={n.id} opacity={dim}>
                    <rect
                      x={n.x - NODE_W / 2}
                      y={n.y - NODE_H / 2}
                      width={NODE_W}
                      height={NODE_H}
                      rx="8"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="1"
                    />
                    <text
                      x={n.x}
                      y={n.y - 4}
                      textAnchor="middle"
                      fill="var(--gray-12)"
                      fontSize="13"
                      fontWeight="600"
                    >
                      {n.label}
                    </text>
                    <text x={n.x} y={n.y + 12} textAnchor="middle" fill="var(--gray-11)" fontSize="11">
                      {n.subtitle}
                    </text>
                  </g>
                )
              })}
            </svg>
          </Box>
        </Flex>
      </Card>
    </CodingPlatformPageShell>
  )
}
