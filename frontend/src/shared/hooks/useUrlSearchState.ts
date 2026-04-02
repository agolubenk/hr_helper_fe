import { useCallback, useMemo } from 'react'
import { useSearchParams } from '@/router-adapter'

type ValidatedOptions = {
  replace?: boolean
  /** Удалять ключ из URL, если значение совпадает с fallback */
  omitWhenDefault?: boolean
}

/**
 * Синхронизирует перечислимое состояние с query-параметром (для вкладок, режимов и т.п.).
 */
export function useValidatedSearchParam<T extends string>(
  paramKey: string,
  allowedValues: readonly T[],
  fallback: T,
  options?: ValidatedOptions
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const replace = options?.replace ?? false
  const omitWhenDefault = options?.omitWhenDefault ?? false

  const allowedSet = useMemo(() => new Set<string>(allowedValues as readonly string[]), [allowedValues])

  const value = useMemo((): T => {
    const raw = searchParams.get(paramKey)
    if (raw != null && allowedSet.has(raw)) return raw as T
    return fallback
  }, [searchParams, paramKey, allowedSet, fallback])

  const setValue = useCallback(
    (next: T) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (omitWhenDefault && next === fallback) nextParams.delete(paramKey)
          else nextParams.set(paramKey, next)
          return nextParams
        },
        { replace }
      )
    },
    [setSearchParams, paramKey, fallback, omitWhenDefault, replace]
  )

  return [value, setValue]
}

type OptionalOptions = {
  replace?: boolean
}

/**
 * Опциональная строка в query (модалки по id, выбранная сущность и т.д.).
 */
export function useOptionalSearchParam(
  paramKey: string,
  options?: OptionalOptions
): [string | null, (value: string | null) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const replace = options?.replace ?? true

  const value = useMemo(() => {
    const v = searchParams.get(paramKey)
    return v === '' ? null : v
  }, [searchParams, paramKey])

  const setValue = useCallback(
    (next: string | null) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (next == null || next === '') nextParams.delete(paramKey)
          else nextParams.set(paramKey, next)
          return nextParams
        },
        { replace }
      )
    },
    [setSearchParams, paramKey, replace]
  )

  return [value, setValue]
}
