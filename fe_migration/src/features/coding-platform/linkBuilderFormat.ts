export function truncateMiddle(text: string, max: number): string {
  if (text.length <= max) return text
  const elide = 3
  const take = max - elide
  const head = Math.ceil(take / 2)
  const tail = Math.floor(take / 2)
  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Значение для input type="datetime-local" из ISO-строки (локальное время браузера). */
export function isoToDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function datetimeLocalToIso(local: string): string | null {
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

/** Значение `datetime-local` через N дней от текущего момента (локальное время). */
export function daysFromNowDatetimeLocal(days: number): string {
  const d = new Date()
  d.setSeconds(0, 0)
  d.setDate(d.getDate() + Math.max(0, Math.floor(days)))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
