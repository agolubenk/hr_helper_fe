/** Утилиты для графиков бенчмарков (мок / до API) */

export function parseSalaryToNumber(raw: string): number {
  const n = parseInt(String(raw).replace(/\D/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

export function midSalary(from: string, to: string): number {
  const a = parseSalaryToNumber(from)
  const b = parseSalaryToNumber(to || from)
  return Math.round((a + b) / 2)
}
