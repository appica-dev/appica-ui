import { describe, expect, it } from 'vitest'
import { filterItems, isGroupedItems, stringifyItem } from './autocomplete-filter'

describe('autocomplete-filter', () => {
  it('filters a flat string list', () => {
    expect(filterItems(['Next.js', 'SvelteKit', 'Astro'], 'sve')).toEqual(['SvelteKit'])
  })

  it('drops empty groups after filtering', () => {
    const groups = [
      { value: 'Fruits', items: ['Apple', 'Banana'] },
      { value: 'Herbs', items: ['Basil', 'Mint'] },
    ]
    expect(isGroupedItems(groups)).toBe(true)
    expect(filterItems(groups, 'min')).toEqual([{ value: 'Herbs', items: ['Mint'] }])
  })

  it('stringifies object items via itemToStringValue', () => {
    const items = [{ label: 'Dashboard' }, { label: 'Settings' }]
    expect(filterItems(items, 'set', (item) => (item as { label: string }).label)).toEqual([{ label: 'Settings' }])
    expect(stringifyItem(items[0], (item) => (item as { label: string }).label)).toBe('Dashboard')
  })
})
