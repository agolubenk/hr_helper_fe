/** Инициалы для аватаров в meet (2 буквы). */
export function getMeetInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  const a = parts[0]![0]
  const b = parts[parts.length - 1]![0]
  return `${a}${b}`.toUpperCase()
}
