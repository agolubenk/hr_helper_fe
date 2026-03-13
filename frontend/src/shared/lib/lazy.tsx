import { lazy, Suspense, type ComponentType } from 'react'
import { Spinner } from '@/shared/components/ui/Spinner'
import { Box } from '@radix-ui/themes'

interface LazyOptions {
  fallback?: React.ReactNode
}

const DefaultFallback = () => (
  <Box
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      width: '100%',
    }}
  >
    <Spinner size="3" />
  </Box>
)

export function lazyLoad<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyOptions = {}
) {
  const LazyComponent = lazy(importFn)
  const { fallback = <DefaultFallback /> } = options

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

export function lazyLoadNamed<T extends ComponentType<unknown>>(
  importFn: () => Promise<Record<string, T>>,
  exportName: string,
  options: LazyOptions = {}
) {
  const LazyComponent = lazy(() =>
    importFn().then((module) => ({ default: module[exportName] as T }))
  )
  const { fallback = <DefaultFallback /> } = options

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}
