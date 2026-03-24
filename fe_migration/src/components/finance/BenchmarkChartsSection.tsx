import { Box, Card, Flex, Select, Text } from '@radix-ui/themes'
import { useMemo } from 'react'
import type { BenchmarkStats } from '@/lib/api'
import { midSalary } from './benchmarkChartUtils'
import styles from './BenchmarkCharts.module.css'
import type { BenchmarkTrendGranularity } from './benchmarkTrendSlice'
import { BENCHMARK_GRANULARITY_LABEL, sliceTrendPoints } from './benchmarkTrendSlice'

export type BenchmarkInterval = '30d' | '90d' | '12m'

export interface BenchmarkMonthlyTrendPoint {
  monthKey: string
  label: string
  avgMidSalary: number
  /** Мок: число бенчмарков по вакансиям в точке (для KPI прироста на дашборде) */
  vacancyBenchmarksCount?: number
  /** Мок: число бенчмарков по кандидатам в точке */
  candidateBenchmarksCount?: number
}

interface BenchmarkChartsSectionProps {
  stats: BenchmarkStats | null
  /** Полный месячный ряд; детализация графика — через expandTrendForGranularity */
  trendSeries: BenchmarkMonthlyTrendPoint[]
  interval: BenchmarkInterval
  trendGranularity: BenchmarkTrendGranularity
  onTrendGranularityChange: (v: BenchmarkTrendGranularity) => void
}

export const BENCHMARK_INTERVAL_LABEL: Record<BenchmarkInterval, string> = {
  '30d': '30 дней',
  '90d': '90 дней',
  '12m': '12 мес.',
}

export type { BenchmarkTrendGranularity } from './benchmarkTrendSlice'
export { BENCHMARK_GRANULARITY_LABEL } from './benchmarkTrendSlice'

/** Горизонтальные бары: средняя вилка по грейдам */
function GradeSalaryBars({ stats }: { stats: BenchmarkStats }) {
  const rows = stats.grade_stats.map((g) => ({
    label: g.grade__name,
    value: midSalary(g.avg_salary_from, g.avg_salary_to),
  }))
  const max = Math.max(...rows.map((r) => r.value), 1)
  const w = 320
  const h = 28
  const gap = 8
  const totalH = rows.length * (h + gap)
  const barMaxW = w - 120

  return (
    <svg
      className={styles.svgChart}
      viewBox={`0 0 ${w} ${totalH}`}
      role="img"
      aria-label="Средняя вилка зарплат по грейдам"
    >
      {rows.map((row, i) => {
        const y = i * (h + gap)
        const bw = (row.value / max) * barMaxW
        return (
          <g key={row.label} transform={`translate(0, ${y})`}>
            <text x={0} y={h / 2 + 4} className={styles.barLabel}>
              {row.label}
            </text>
            <rect
              x={110}
              y={4}
              width={bw}
              height={h - 8}
              rx={4}
              fill="var(--accent-a5)"
            />
            <text x={115 + bw + 6} y={h / 2 + 4} className={styles.barValue}>
              {(row.value / 1000).toFixed(0)}k ₽
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Два столбца: кандидаты vs вакансии */
function TypeCompareBars({ stats }: { stats: BenchmarkStats }) {
  const rows = stats.type_stats.map((t) => ({
    label: t.type === 'candidate' ? 'Кандидаты' : 'Вакансии',
    value: midSalary(t.avg_salary_from, t.avg_salary_to),
  }))
  const max = Math.max(...rows.map((r) => r.value), 1)
  const w = 280
  const chartH = 140
  const baseY = chartH - 24
  const barW = 56

  return (
    <svg
      className={styles.svgChart}
      viewBox={`0 0 ${w} ${chartH}`}
      role="img"
      aria-label="Средняя вилка по типу записи"
    >
      <line className={styles.axisLine} x1={32} y1={baseY} x2={w - 16} y2={baseY} />
      {rows.map((row, i) => {
        const x = 48 + i * 100
        const bh = (row.value / max) * (baseY - 28)
        return (
          <g key={row.label}>
            <rect
              x={x}
              y={baseY - bh}
              width={barW}
              height={bh}
              rx={4}
              fill={i === 0 ? 'var(--green-9)' : 'var(--blue-9)'}
              opacity={0.85}
            />
            <text x={x + barW / 2} y={baseY + 14} textAnchor="middle" className={styles.barLabel}>
              {row.label}
            </text>
            <text x={x + barW / 2} y={baseY - bh - 6} textAnchor="middle" className={styles.barValue}>
              {(row.value / 1000).toFixed(0)}k
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function formatYAxisK(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `${Math.round(v / 1000)}k`
  return `${Math.round(v)}`
}

/** Линейный тренд средней вилки */
function TrendLineChart({
  points,
  granularityLabel,
}: {
  points: BenchmarkMonthlyTrendPoint[]
  granularityLabel: string
}) {
  if (points.length === 0) {
    return (
      <Text size="2" color="gray">
        Нет данных за выбранный период
      </Text>
    )
  }

  const w = 560
  const h = 200
  const padL = 44
  const padR = 16
  const padT = 16
  const padB = 36
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const vals = points.map((p) => p.avgMidSalary)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const span = maxV - minV || 1
  const yPad = span * 0.08
  const yMin = minV - yPad
  const yMax = maxV + yPad
  const ySpan = yMax - yMin || 1

  const yToY = (v: number) => padT + innerH - ((v - yMin) / ySpan) * innerH

  const denom = Math.max(points.length - 1, 1)
  const coords = points.map((p, i) => {
    const x = padL + (i / denom) * innerW
    const y = yToY(p.avgMidSalary)
    return { x, y, p }
  })

  const lineD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const areaD = `${lineD} L ${coords[coords.length - 1]?.x ?? padL} ${padT + innerH} L ${coords[0]?.x ?? padL} ${padT + innerH} Z`

  const n = points.length
  const maxXLabels = 11
  const labelStep = n <= maxXLabels ? 1 : Math.max(1, Math.ceil((n - 1) / (maxXLabels - 1)))

  const dotEvery = n > 80 ? Math.ceil(n / 40) : n > 40 ? 2 : 1
  const dotR = n > 60 ? 2.5 : 3.5
  const dotRingR = n > 60 ? 4 : 6

  const gridYTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => yMin + t * ySpan)

  return (
    <div className={styles.trendChartWrap}>
      <svg
        className={styles.svgChart}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        preserveAspectRatio="xMidYMid meet"
        aria-label={`Динамика средней вилки (${granularityLabel})`}
      >
        {gridYTicks.map((tick) => {
          const y = yToY(tick)
          return (
            <line
              key={tick}
              className={styles.trendGridLine}
              x1={padL}
              y1={y}
              x2={w - padR}
              y2={y}
            />
          )
        })}
        <text x={padL - 4} y={yToY(yMax)} className={styles.trendAxisY} textAnchor="end">
          {formatYAxisK(yMax)}
        </text>
        <text x={padL - 4} y={yToY(yMin)} className={styles.trendAxisY} textAnchor="end">
          {formatYAxisK(yMin)}
        </text>
        <line className={styles.axisLine} x1={padL} y1={padT + innerH} x2={w - padR} y2={padT + innerH} />
        <path d={areaD} className={styles.trendFill} />
        <path d={lineD} className={styles.trendLine} />
        {coords.map((c, i) => (
          <g key={`${c.p.monthKey}-${i}`}>
            {(i % dotEvery === 0 || i === coords.length - 1) && (
              <>
                <circle cx={c.x} cy={c.y} r={dotRingR} className={styles.trendDotRing} />
                <circle cx={c.x} cy={c.y} r={dotR} className={styles.trendDot} />
              </>
            )}
            {(i % labelStep === 0 || i === coords.length - 1) && (
              <text x={c.x} y={h - 8} textAnchor="middle" className={styles.trendXLabel}>
                {c.p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

export function BenchmarkChartsSection({
  stats,
  trendSeries,
  interval,
  trendGranularity,
  onTrendGranularityChange,
}: BenchmarkChartsSectionProps) {
  const trendChartPoints = useMemo(
    () => sliceTrendPoints(trendSeries, interval, trendGranularity),
    [trendSeries, interval, trendGranularity]
  )

  if (!stats) return null

  return (
    <Card className={styles.chartsBlock}>
      <div className={styles.toolbar}>
        <div>
          <Text size="3" weight="bold" as="div">
            Графики и интервалы
          </Text>
          <Text size="2" color="gray">
            Мок на основе статистики; после API подставятся реальные агрегаты. Период тренда задаётся в шапке страницы.
          </Text>
        </div>
      </div>

      <div className={styles.chartGrid}>
        <Box className={styles.chartCard}>
          <div className={styles.chartTitle}>Средняя вилка по грейдам</div>
          <GradeSalaryBars stats={stats} />
        </Box>
        <Box className={styles.chartCard}>
          <div className={styles.chartTitle}>Средняя вилка: кандидаты и вакансии</div>
          <TypeCompareBars stats={stats} />
        </Box>
      </div>

      <Box className={styles.chartCard}>
        <Flex className={styles.chartTitleRow} align="center" justify="between" wrap="wrap" gap="2">
          <div className={styles.chartTitle}>Динамика средней вилки (мок)</div>
          <Flex align="center" gap="2">
            <Text size="2" color="gray">
              Детализация
            </Text>
            <Select.Root
              value={trendGranularity}
              onValueChange={(v) => onTrendGranularityChange(v as BenchmarkTrendGranularity)}
            >
              <Select.Trigger style={{ minWidth: 140 }} />
              <Select.Content>
                <Select.Item value="month">{BENCHMARK_GRANULARITY_LABEL.month}</Select.Item>
                <Select.Item value="week">{BENCHMARK_GRANULARITY_LABEL.week}</Select.Item>
                <Select.Item value="day">{BENCHMARK_GRANULARITY_LABEL.day}</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
        <TrendLineChart
          points={trendChartPoints}
          granularityLabel={BENCHMARK_GRANULARITY_LABEL[trendGranularity]}
        />
      </Box>
    </Card>
  )
}
