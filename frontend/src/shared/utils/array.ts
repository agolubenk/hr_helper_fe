export const chunk = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) return []
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}

export const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>()
  return array.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item)
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    },
    {} as Record<K, T[]>
  )
}

export const sortBy = <T>(
  array: T[],
  keyFn: (item: T) => string | number,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  const sorted = [...array].sort((a, b) => {
    const aVal = keyFn(a)
    const bVal = keyFn(b)
    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
    return 0
  })
  return order === 'desc' ? sorted.reverse() : sorted
}

export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const first = <T>(array: T[]): T | undefined => {
  return array[0]
}

export const last = <T>(array: T[]): T | undefined => {
  return array[array.length - 1]
}

export const isEmpty = <T>(array: T[]): boolean => {
  return array.length === 0
}

export const range = (start: number, end: number, step = 1): number[] => {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

export const intersection = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b)
  return a.filter((item) => setB.has(item))
}

export const difference = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b)
  return a.filter((item) => !setB.has(item))
}

export const flatten = <T>(array: T[][]): T[] => {
  return array.flat()
}

export const compact = <T>(array: (T | null | undefined | false | 0 | '')[]): T[] => {
  return array.filter(Boolean) as T[]
}
