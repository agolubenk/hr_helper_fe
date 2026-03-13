import { memo, type ComponentType, type FC } from 'react'

/**
 * Типизированный React.memo с поддержкой дженериков
 */
export function typedMemo<T extends ComponentType<unknown>>(
  Component: T,
  propsAreEqual?: (
    prevProps: Readonly<React.ComponentProps<T>>,
    nextProps: Readonly<React.ComponentProps<T>>
  ) => boolean
): T {
  return memo(Component, propsAreEqual) as T
}

/**
 * Сравнение только по указанным ключам
 */
export function arePropsEqualByKeys<T extends Record<string, unknown>>(
  keys: (keyof T)[]
): (prevProps: T, nextProps: T) => boolean {
  return (prevProps, nextProps) => {
    return keys.every((key) => Object.is(prevProps[key], nextProps[key]))
  }
}

/**
 * Глубокое сравнение пропсов (для простых объектов)
 */
export function arePropsDeepEqual<T extends Record<string, unknown>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps)
  const nextKeys = Object.keys(nextProps)

  if (prevKeys.length !== nextKeys.length) {
    return false
  }

  return prevKeys.every((key) => {
    const prevValue = prevProps[key]
    const nextValue = nextProps[key]

    if (typeof prevValue === 'object' && prevValue !== null) {
      return JSON.stringify(prevValue) === JSON.stringify(nextValue)
    }

    return Object.is(prevValue, nextValue)
  })
}

/**
 * HOC для добавления displayName к мемоизированным компонентам
 */
export function withMemo<P extends object>(
  Component: FC<P>,
  displayName?: string,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): FC<P> {
  const MemoizedComponent = memo(Component, propsAreEqual) as FC<P>
  MemoizedComponent.displayName = displayName || `Memo(${Component.displayName || Component.name || 'Component'})`
  return MemoizedComponent
}
