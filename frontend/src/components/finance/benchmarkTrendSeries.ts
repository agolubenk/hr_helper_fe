import type { BenchmarkMonthlyTrendPoint } from './BenchmarkChartsSection'

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpOpt(a: number | undefined, b: number | undefined, t: number): number | undefined {
  if (a === undefined || b === undefined) return undefined
  return Math.round(lerp(a, b, t))
}

/** Между соседними месяцами: ~4 недели (мок) */
export function expandMonthlyToWeekly(monthly: BenchmarkMonthlyTrendPoint[]): BenchmarkMonthlyTrendPoint[] {
  const out: BenchmarkMonthlyTrendPoint[] = []
  for (let i = 0; i < monthly.length - 1; i++) {
    const a = monthly[i]
    const b = monthly[i + 1]
    const segments = 4
    for (let k = 0; k < segments; k++) {
      const t = (k + 0.5) / segments
      out.push({
        monthKey: `${a.monthKey}-w${i * segments + k}`,
        label: `н${i * segments + k + 1}`,
        avgMidSalary: Math.round(lerp(a.avgMidSalary, b.avgMidSalary, t)),
        vacancyBenchmarksCount: lerpOpt(a.vacancyBenchmarksCount, b.vacancyBenchmarksCount, t),
        candidateBenchmarksCount: lerpOpt(a.candidateBenchmarksCount, b.candidateBenchmarksCount, t),
      })
    }
  }
  const last = monthly[monthly.length - 1]
  out.push({
    monthKey: `${last.monthKey}-w-end`,
    label: 'н+',
    avgMidSalary: last.avgMidSalary,
    vacancyBenchmarksCount: last.vacancyBenchmarksCount,
    candidateBenchmarksCount: last.candidateBenchmarksCount,
  })
  return out
}

/** Между соседними месяцами: 30 дней (мок) */
export function expandMonthlyToDaily(monthly: BenchmarkMonthlyTrendPoint[]): BenchmarkMonthlyTrendPoint[] {
  const out: BenchmarkMonthlyTrendPoint[] = []
  for (let i = 0; i < monthly.length - 1; i++) {
    const a = monthly[i]
    const b = monthly[i + 1]
    const days = 30
    for (let d = 0; d < days; d++) {
      const t = (d + 0.5) / days
      const dayNum = d + 1
      out.push({
        monthKey: `${a.monthKey}-d${d}`,
        label: `${dayNum}`,
        avgMidSalary: Math.round(lerp(a.avgMidSalary, b.avgMidSalary, t)),
        vacancyBenchmarksCount: lerpOpt(a.vacancyBenchmarksCount, b.vacancyBenchmarksCount, t),
        candidateBenchmarksCount: lerpOpt(a.candidateBenchmarksCount, b.candidateBenchmarksCount, t),
      })
    }
  }
  const last = monthly[monthly.length - 1]
  out.push({
    monthKey: `${last.monthKey}-d-end`,
    label: '…',
    avgMidSalary: last.avgMidSalary,
    vacancyBenchmarksCount: last.vacancyBenchmarksCount,
    candidateBenchmarksCount: last.candidateBenchmarksCount,
  })
  return out
}
