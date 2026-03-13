import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToggle } from '../useToggle'

describe('useToggle', () => {
  it('initializes with default value false', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.value).toBe(false)
  })

  it('initializes with provided value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current.value).toBe(true)
  })

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(false)
  })

  it('setTrue sets value to true', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.setTrue()
    })

    expect(result.current.value).toBe(true)
  })

  it('setFalse sets value to false', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current.setFalse()
    })

    expect(result.current.value).toBe(false)
  })

  it('setValue sets specific value', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.setValue(true)
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.setValue(false)
    })

    expect(result.current.value).toBe(false)
  })

  it('functions are stable between renders', () => {
    const { result, rerender } = renderHook(() => useToggle())

    const { toggle, setTrue, setFalse, setValue } = result.current

    rerender()

    expect(result.current.toggle).toBe(toggle)
    expect(result.current.setTrue).toBe(setTrue)
    expect(result.current.setFalse).toBe(setFalse)
    expect(result.current.setValue).toBe(setValue)
  })
})
