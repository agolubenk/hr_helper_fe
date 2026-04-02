import type { BenchmarkInterval, BenchmarkMonthlyTrendPoint } from './BenchmarkChartsSection'
import { sliceMonthlyForInterval } from './benchmarkTrendSlice'

function pctChange(first: number, last: number): number | null {
  if (first === 0) return null
  return Math.round(((last - first) / first) * 1000) / 10
}

export interface BenchmarkDashboardKpis {
  avgMidSalary: number
  salaryGrowthPct: number | null
  vacancyGrowthPct: number | null
  candidateGrowthPct: number | null
  /** Индекс рынка: 100 = начало периода (мок) */
  marketIndex: number | null
}

export function computeBenchmarkDashboardKpis(
  points: BenchmarkMonthlyTrendPoint[],
  interval: BenchmarkInterval
): BenchmarkDashboardKpis {
  const slice = sliceMonthlyForInterval(points, interval)
  if (slice.length === 0) {
    return {
      avgMidSalary: 0,
      salaryGrowthPct: null,
      vacancyGrowthPct: null,
      candidateGrowthPct: null,
      marketIndex: null,
    }
  }
  const avgMidSalary = Math.round(slice.reduce((s, p) => s + p.avgMidSalary, 0) / slice.length)

  const last = slice[slice.length - 1]
  const lastKey = last?.monthKey
  const lastIdx = lastKey !== undefined ? points.findIndex((p) => p.monthKey === lastKey) : -1

  let salaryGrowthPct: number | null = null
  let vacancyGrowthPct: number | null = null
  let candidateGrowthPct: number | null = null
  let marketIndex: number | null = null

  if (slice.length >= 2) {
    const first = slice[0]
    const lastP = slice[slice.length - 1]
    salaryGrowthPct = pctChange(first.avgMidSalary, lastP.avgMidSalary)
    if (first.vacancyBenchmarksCount !== undefined && lastP.vacancyBenchmarksCount !== undefined) {
      vacancyGrowthPct = pctChange(first.vacancyBenchmarksCount, lastP.vacancyBenchmarksCount)
    }
    if (first.candidateBenchmarksCount !== undefined && lastP.candidateBenchmarksCount !== undefined) {
      candidateGrowthPct = pctChange(first.candidateBenchmarksCount, lastP.candidateBenchmarksCount)
    }
    if (first.avgMidSalary > 0) {
      marketIndex = Math.round((1000 * lastP.avgMidSalary) / first.avgMidSalary) / 10
    }
  } else if (slice.length === 1 && lastIdx > 0) {
    const prev = points[lastIdx - 1]
    salaryGrowthPct = pctChange(prev.avgMidSalary, last.avgMidSalary)
    if (
      prev.vacancyBenchmarksCount !== undefined &&
      last.vacancyBenchmarksCount !== undefined
    ) {
      vacancyGrowthPct = pctChange(prev.vacancyBenchmarksCount, last.vacancyBenchmarksCount)
    }
    if (
      prev.candidateBenchmarksCount !== undefined &&
      last.candidateBenchmarksCount !== undefined
    ) {
      candidateGrowthPct = pctChange(prev.candidateBenchmarksCount, last.candidateBenchmarksCount)
    }
    if (prev.avgMidSalary > 0) {
      marketIndex = Math.round((1000 * last.avgMidSalary) / prev.avgMidSalary) / 10
    }
  }

  return {
    avgMidSalary,
    salaryGrowthPct,
    vacancyGrowthPct,
    candidateGrowthPct,
    marketIndex,
  }
}

export function formatSignedPercent(value: number | null): string {
  if (value === null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatMarketIndex(value: number | null): string {
  if (value === null) return '—'
  return value.toFixed(1)
}
