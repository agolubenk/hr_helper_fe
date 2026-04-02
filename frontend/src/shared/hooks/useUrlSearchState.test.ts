import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useValidatedSearchParam, useOptionalSearchParam } from './useUrlSearchState'

function wrapper(initialEntries: string[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, { initialEntries }, children)
  }
}

describe('useValidatedSearchParam', () => {
  it('returns fallback when param missing or invalid', () => {
    const { result } = renderHook(
      () => useValidatedSearchParam('tab', ['a', 'b'] as const, 'a'),
      { wrapper: wrapper(['/x']) }
    )
    expect(result.current[0]).toBe('a')
  })

  it('reads allowed value from URL', () => {
    const { result } = renderHook(
      () => useValidatedSearchParam('tab', ['a', 'b'] as const, 'a'),
      { wrapper: wrapper(['/x?tab=b']) }
    )
    expect(result.current[0]).toBe('b')
  })

  it('setValue updates search param', () => {
    const { result } = renderHook(
      () => useValidatedSearchParam('tab', ['a', 'b'] as const, 'a', { replace: true }),
      { wrapper: wrapper(['/x']) }
    )
    act(() => {
      result.current[1]('b')
    })
    expect(result.current[0]).toBe('b')
  })

  it('omitWhenDefault removes key', () => {
    const { result } = renderHook(
      () =>
        useValidatedSearchParam('tab', ['a', 'b'] as const, 'a', {
          omitWhenDefault: true,
          replace: true,
        }),
      { wrapper: wrapper(['/x?tab=b']) }
    )
    act(() => {
      result.current[1]('a')
    })
    expect(result.current[0]).toBe('a')
  })
})

describe('useOptionalSearchParam', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns null when absent', () => {
    const { result } = renderHook(() => useOptionalSearchParam('event'), { wrapper: wrapper(['/c']) })
    expect(result.current[0]).toBeNull()
  })

  it('setValue null deletes param', () => {
    const { result } = renderHook(() => useOptionalSearchParam('event', { replace: true }), {
      wrapper: wrapper(['/c?event=1']),
    })
    expect(result.current[0]).toBe('1')
    act(() => {
      result.current[1](null)
    })
    expect(result.current[0]).toBeNull()
  })
})
