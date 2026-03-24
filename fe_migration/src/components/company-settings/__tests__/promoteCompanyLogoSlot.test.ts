import { describe, it, expect } from 'vitest'
import { promoteCompanyLogoSlot } from '../GeneralSettings'

type Slots = readonly [string | null, string | null, string | null, string | null]

describe('promoteCompanyLogoSlot', () => {
  it('s=3: последняя миниатюра → главная, 0→1, 1→2, 2→3', () => {
    const before: Slots = ['M', 'A', 'B', 'C']
    expect(promoteCompanyLogoSlot(before, 3)).toEqual(['C', 'M', 'A', 'B'])
  })

  it('s=2: средняя → главная, 0→1, 1→2, слот 3 без изменения', () => {
    const before: Slots = ['M', 'A', 'B', 'C']
    expect(promoteCompanyLogoSlot(before, 2)).toEqual(['B', 'M', 'A', 'C'])
  })

  it('s=1: первая миниатюра → главная, 0→1, 2 и 3 без изменения', () => {
    const before: Slots = ['M', 'A', 'B', 'C']
    expect(promoteCompanyLogoSlot(before, 1)).toEqual(['A', 'M', 'B', 'C'])
  })

  it('пустой слот — без изменений', () => {
    const before: Slots = ['M', 'A', null, 'C']
    expect(promoteCompanyLogoSlot(before, 2)).toEqual(before)
  })
})
