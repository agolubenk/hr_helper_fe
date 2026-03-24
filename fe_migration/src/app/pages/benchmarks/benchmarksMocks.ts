/**
 * Общие моки бенчмарков для дашборда и страницы «Все бенчмарки» (до API).
 */

import type { Benchmark, BenchmarkSettings, BenchmarkStats, Grade, Vacancy } from '@/lib/api'
import type { BenchmarkMonthlyTrendPoint } from '@/components/finance/BenchmarkChartsSection'

/** Количество мок-строк в списке «Все бенчмарки» */
export const MOCK_BENCHMARK_LIST_SIZE = 138

const MOCK_LOCATIONS = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
  'Краснодар',
  'Самара',
  'Ростов-на-Дону',
  'Уфа',
  'Воронеж',
  'Пермь',
  'Волгоград',
  'Красноярск',
  'Тюмень',
] as const

const WORK_FORMAT_ROT = ['гибрид', 'удаленка', 'офис'] as const

const DOMAIN_ROT: Array<{ key: string; label: string }> = [
  { key: 'fintech', label: 'FinTech' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'saas', label: 'SaaS' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'edtech', label: 'EdTech' },
  { key: 'health', label: 'HealthTech' },
]

export function formatSalaryDisplay(from: string, to: string): string {
  const nf = from.replace(/\s/g, '')
  const nt = to.replace(/\s/g, '')
  if (!nf && !nt) return '—'
  if (!nt || nf === nt) return `${nf} ₽`
  return `${nf} - ${nt} ₽`
}

export const MOCK_GRADES: Grade[] = [
  { id: 1, name: 'Junior' },
  { id: 2, name: 'Middle' },
  { id: 3, name: 'Senior' },
  { id: 4, name: 'Lead' },
  { id: 5, name: 'Principal' },
]

export const MOCK_VACANCIES: Vacancy[] = [
  { id: 1, name: 'Frontend Developer', title: 'Frontend Developer' },
  { id: 2, name: 'Backend Developer', title: 'Backend Developer' },
  { id: 3, name: 'DevOps Engineer', title: 'DevOps Engineer' },
  { id: 4, name: 'QA Engineer', title: 'QA Engineer' },
  { id: 5, name: 'Project Manager', title: 'Project Manager' },
]

function createMockBenchmarkRow(index: number): Benchmark {
  const id = index + 1
  const vac = MOCK_VACANCIES[index % MOCK_VACANCIES.length]
  const gr = MOCK_GRADES[index % MOCK_GRADES.length]
  const type: 'candidate' | 'vacancy' = index % 3 === 0 ? 'vacancy' : 'candidate'
  const base = 140000 + (index * 7919) % 320000
  const spread = 45000 + (index * 503) % 140000
  const salary_from = String(base)
  const salary_to = String(base + spread)
  const salary_display = formatSalaryDisplay(salary_from, salary_to)
  const loc = MOCK_LOCATIONS[index % MOCK_LOCATIONS.length]
  const wf = WORK_FORMAT_ROT[index % WORK_FORMAT_ROT.length]
  const dom = DOMAIN_ROT[index % DOMAIN_ROT.length]
  const daySeed = (index * 17) % 320
  const d = new Date(Date.UTC(2025, 5, 10 + daySeed, 10 + (index % 8), (index * 13) % 60))
  const iso = d.toISOString()
  const is_active = index % 11 !== 0

  const loc2 = MOCK_LOCATIONS[(index + 3) % MOCK_LOCATIONS.length]
  const linked_candidate_id = type === 'candidate' ? 8000 + (index % 5000) : null
  const total_experience_years = type === 'candidate' ? 1 + (index % 14) : null
  const work_regions_display =
    type === 'candidate'
      ? `${loc}, ${loc2}; документированный опыт в FinTech / ${dom.label} (мок)`
      : null
  const salary_expectations_note =
    type === 'candidate'
      ? `Ожидания по ЗП: вилка ${salary_display}; релокация: ${index % 2 === 0 ? 'возможна' : 'не требуется'}; формат: ${wf}`
      : null
  const vacancy_description =
    type === 'vacancy'
      ? `Роль «${vac.name ?? vac.title}» в продуктовой команде; грейд ${gr.name}; ключевые задачи: разработка и сопровождение; условия: ${wf}, ${loc}. (мок-описание)`
      : null
  const vacancy_source_display =
    type === 'vacancy'
      ? index % 3 === 0
        ? 'HeadHunter'
        : index % 3 === 1
          ? 'Внутренняя база'
          : 'Реферал / рекомендация'
      : null

  return {
    id,
    type,
    vacancy: vac.id,
    vacancy_name: vac.name ?? vac.title ?? `Специализация ${vac.id}`,
    grade: gr.id,
    grade_name: gr.name,
    salary_from,
    salary_to,
    salary_display,
    location: loc,
    work_format: wf,
    compensation: index % 2 === 0 ? 'ДМС, спортзал' : 'ДМС',
    benefits: index % 3 === 0 ? 'Обеды, корпоративы' : 'Обеды',
    development: index % 4 === 0 ? 'Конференции, курсы' : 'Курсы',
    technologies: index % 2 === 0 ? 'React, TypeScript' : 'Python, PostgreSQL',
    domain: dom.key,
    domain_display: dom.label,
    domain_description:
      type === 'vacancy'
        ? `Домен продукта: ${dom.label}; смежные направления по запросу (мок).`
        : `Фокус кандидата: ${dom.label} (мок).`,
    hh_vacancy_id: type === 'vacancy' ? String(12_000_000 + id) : null,
    date_added: iso,
    is_active,
    created_at: iso,
    updated_at: iso,
    linked_candidate_id,
    total_experience_years,
    work_regions_display,
    salary_expectations_note,
    vacancy_description,
    vacancy_source_display,
  }
}

export const MOCK_BENCHMARKS: Benchmark[] = Array.from({ length: MOCK_BENCHMARK_LIST_SIZE }, (_, i) =>
  createMockBenchmarkRow(i)
)

export const MOCK_STATS: BenchmarkStats = {
  total_benchmarks: MOCK_BENCHMARK_LIST_SIZE,
  active_benchmarks: 125,
  type_stats: [
    { type: 'candidate', count: 92, avg_salary_from: '210000', avg_salary_to: '310000' },
    { type: 'vacancy', count: 46, avg_salary_from: '340000', avg_salary_to: '480000' },
  ],
  grade_stats: [
    { grade__name: 'Junior', count: 28, avg_salary_from: '150000', avg_salary_to: '220000' },
    { grade__name: 'Middle', count: 28, avg_salary_from: '230000', avg_salary_to: '340000' },
    { grade__name: 'Senior', count: 28, avg_salary_from: '320000', avg_salary_to: '460000' },
    { grade__name: 'Lead', count: 28, avg_salary_from: '410000', avg_salary_to: '580000' },
    { grade__name: 'Principal', count: 26, avg_salary_from: '480000', avg_salary_to: '720000' },
  ],
}

export const MOCK_SETTINGS: BenchmarkSettings = {
  id: 1,
  vacancy_fields: ['work_format', 'compensation', 'benefits', 'development', 'technologies', 'domain'],
  candidate_fields: ['work_format', 'compensation', 'benefits'],
}

export const MOCK_MONTHLY_TREND: BenchmarkMonthlyTrendPoint[] = [
  { monthKey: '2025-04', label: 'апр.', avgMidSalary: 198000, vacancyBenchmarksCount: 9, candidateBenchmarksCount: 12 },
  { monthKey: '2025-05', label: 'май', avgMidSalary: 205000, vacancyBenchmarksCount: 9, candidateBenchmarksCount: 13 },
  { monthKey: '2025-06', label: 'июн.', avgMidSalary: 212000, vacancyBenchmarksCount: 10, candidateBenchmarksCount: 13 },
  { monthKey: '2025-07', label: 'июл.', avgMidSalary: 218000, vacancyBenchmarksCount: 10, candidateBenchmarksCount: 14 },
  { monthKey: '2025-08', label: 'авг.', avgMidSalary: 221000, vacancyBenchmarksCount: 11, candidateBenchmarksCount: 14 },
  { monthKey: '2025-09', label: 'сен.', avgMidSalary: 224000, vacancyBenchmarksCount: 11, candidateBenchmarksCount: 15 },
  { monthKey: '2025-10', label: 'окт.', avgMidSalary: 228000, vacancyBenchmarksCount: 12, candidateBenchmarksCount: 15 },
  { monthKey: '2025-11', label: 'ноя.', avgMidSalary: 231000, vacancyBenchmarksCount: 12, candidateBenchmarksCount: 16 },
  { monthKey: '2025-12', label: 'дек.', avgMidSalary: 235000, vacancyBenchmarksCount: 12, candidateBenchmarksCount: 16 },
  { monthKey: '2026-01', label: 'янв.', avgMidSalary: 238000, vacancyBenchmarksCount: 13, candidateBenchmarksCount: 17 },
  { monthKey: '2026-02', label: 'фев.', avgMidSalary: 242000, vacancyBenchmarksCount: 13, candidateBenchmarksCount: 17 },
  { monthKey: '2026-03', label: 'мар.', avgMidSalary: 246000, vacancyBenchmarksCount: 14, candidateBenchmarksCount: 18 },
]
