import { describe, it, expect } from 'vitest'
import {
  parseLangsParam,
  defaultWebStackSelection,
  defaultSelectionForLangParam,
  sortSelectedIds,
  selectionHasWebPreview,
} from './playgroundSelection'
import { CODING_LANGUAGE_CATALOG, getLanguageById } from './languageCatalog'

const enabled = new Set(['html', 'css', 'js', 'ts', 'react', 'python'])
const sorted = [...CODING_LANGUAGE_CATALOG].sort((a, b) => a.order - b.order)

describe('playgroundSelection', () => {
  it('parseLangsParam filters unknown and dedupes', () => {
    expect(parseLangsParam('html,css,html,unknown', enabled)).toEqual(['html', 'css'])
  })

  it('defaultWebStackSelection respects enabled', () => {
    expect(defaultWebStackSelection(enabled)).toEqual(['html', 'css', 'js', 'react'])
    expect(defaultWebStackSelection(new Set(['html', 'js']))).toEqual(['html', 'js'])
  })

  it('defaultSelectionForLangParam expands web primary to stack', () => {
    expect(defaultSelectionForLangParam('html', enabled, getLanguageById)).toEqual(['html', 'css', 'js', 'react'])
    expect(defaultSelectionForLangParam('ts', enabled, getLanguageById)).toEqual(['ts'])
  })

  it('sortSelectedIds follows catalog order', () => {
    expect(sortSelectedIds(['python', 'html', 'ts'], sorted)).toEqual(['html', 'ts', 'python'])
  })

  it('selectionHasWebPreview', () => {
    expect(selectionHasWebPreview(['ts'], getLanguageById)).toBe(false)
    expect(selectionHasWebPreview(['html'], getLanguageById)).toBe(true)
  })
})
