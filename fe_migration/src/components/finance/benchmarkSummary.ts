import type { Benchmark } from '@/lib/api'
import { midSalary } from './benchmarkChartUtils'

export interface BenchmarkSummaryRow {
  specialization: string
  location: string
  gradeName: string
  candidateCount: number
  vacancyCount: number
  candidateAvgMid: number | null
  vacancyAvgMid: number | null
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

/** Сводка по специализации + локации + грейду: средняя «середина» вилки отдельно для кандидатов и вакансий */
export function buildBenchmarkSummaryRows(benchmarks: Benchmark[]): BenchmarkSummaryRow[] {
  const map = new Map<
    string,
    { specialization: string; location: string; gradeName: string; candMids: number[]; vacMids: number[] }
  >()

  for (const b of benchmarks) {
    const specialization = b.vacancy_name?.trim() || '—'
    const location = b.location?.trim() || '—'
    const gradeName = b.grade_name?.trim() || '—'
    const key = `${specialization}\u0001${location}\u0001${gradeName}`
    let row = map.get(key)
    if (!row) {
      row = { specialization, location, gradeName, candMids: [], vacMids: [] }
      map.set(key, row)
    }
    const m = midSalary(b.salary_from ?? '', b.salary_to ?? '')
    if (b.type === 'candidate') {
      row.candMids.push(m)
    } else {
      row.vacMids.push(m)
    }
  }

  const rows: BenchmarkSummaryRow[] = [...map.values()].map((row) => ({
    specialization: row.specialization,
    location: row.location,
    gradeName: row.gradeName,
    candidateCount: row.candMids.length,
    vacancyCount: row.vacMids.length,
    candidateAvgMid: average(row.candMids),
    vacancyAvgMid: average(row.vacMids),
  }))

  rows.sort((a, b) => {
    const s = a.specialization.localeCompare(b.specialization, 'ru')
    if (s !== 0) return s
    const l = a.location.localeCompare(b.location, 'ru')
    if (l !== 0) return l
    return a.gradeName.localeCompare(b.gradeName, 'ru')
  })

  return rows
}

export function formatRubMid(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}
