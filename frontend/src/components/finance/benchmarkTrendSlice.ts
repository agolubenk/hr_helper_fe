import type { BenchmarkInterval, BenchmarkMonthlyTrendPoint } from './BenchmarkChartsSection'
import { expandMonthlyToDaily, expandMonthlyToWeekly } from './benchmarkTrendSeries'

export type BenchmarkTrendGranularity = 'month' | 'week' | 'day'

export const BENCHMARK_GRANULARITY_LABEL: Record<BenchmarkTrendGranularity, string> = {
  month: 'По месяцам',
  week: 'По неделям',
  day: 'По дням',
}

function monthCountForInterval(interval: BenchmarkInterval): number {
  switch (interval) {
    case '30d':
      return 1
    case '90d':
      return 3
    case '12m':
      return 12
    default:
      return 12
  }
}

/** Последние N месяцев полного месячного ряда (для KPI и базы графика) */
export function sliceMonthlyForInterval(
  points: BenchmarkMonthlyTrendPoint[],
  interval: BenchmarkInterval
): BenchmarkMonthlyTrendPoint[] {
  if (points.length === 0) return []
  const n = monthCountForInterval(interval)
  return points.slice(-Math.min(n, points.length))
}

/** Недели/дни строятся интерполяцией из месячного среза (мок) */
export function expandTrendForGranularity(
  monthlySlice: BenchmarkMonthlyTrendPoint[],
  granularity: BenchmarkTrendGranularity
): BenchmarkMonthlyTrendPoint[] {
  if (monthlySlice.length === 0) return []
  const copy = [...monthlySlice]
  switch (granularity) {
    case 'month':
      return copy
    case 'week':
      return expandMonthlyToWeekly(copy)
    case 'day':
      return expandMonthlyToDaily(copy)
    default:
      return copy
  }
}

/** Срез для линейного графика: период (месяцы) × детализация (месяц / неделя / день) */
export function sliceTrendPoints(
  points: BenchmarkMonthlyTrendPoint[],
  interval: BenchmarkInterval,
  granularity: BenchmarkTrendGranularity
): BenchmarkMonthlyTrendPoint[] {
  return expandTrendForGranularity(sliceMonthlyForInterval(points, interval), granularity)
}
