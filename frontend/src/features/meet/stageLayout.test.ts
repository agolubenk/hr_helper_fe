import { describe, it, expect } from 'vitest'
import { STAGE_LAYOUT_OPTIONS } from './stageLayout'

describe('stageLayout', () => {
  it('options have unique ids and copy', () => {
    const ids = STAGE_LAYOUT_OPTIONS.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    STAGE_LAYOUT_OPTIONS.forEach((o) => {
      expect(o.label.length).toBeGreaterThan(0)
      expect(o.hint.length).toBeGreaterThan(0)
    })
  })
})
