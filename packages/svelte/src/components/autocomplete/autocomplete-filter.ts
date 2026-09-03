export type AutocompleteGroupData<T = unknown> = {
  value: string
  items: readonly T[]
}

export function isGroupedItems(items: readonly unknown[]): items is AutocompleteGroupData[] {
  const first = items[0]
  return typeof first === 'object' && first !== null && Array.isArray((first as AutocompleteGroupData).items)
}

export function stringifyItem(item: unknown, itemToStringValue?: (item: unknown) => string): string {
  if (itemToStringValue) return itemToStringValue(item)
  if (typeof item === 'string') return item
  if (typeof item === 'number' || typeof item === 'boolean') return String(item)
  if (item && typeof item === 'object') {
    const rec = item as Record<string, unknown>
    if (typeof rec.label === 'string') return rec.label
    if (typeof rec.value === 'string') return rec.value
    if (typeof rec.name === 'string') return rec.name
  }
  return String(item ?? '')
}

export function itemKey(item: unknown, fallback: number): string | number {
  if (item == null) return fallback
  if (typeof item === 'object') {
    const rec = item as Record<string, unknown>
    const candidate = rec.value ?? rec.id ?? rec.key
    if (typeof candidate === 'string' || typeof candidate === 'number') return candidate
    return fallback
  }
  return item as string | number
}

export function defaultFilter(item: unknown, query: string, itemToStringValue?: (item: unknown) => string): boolean {
  if (!query) return true
  return stringifyItem(item, itemToStringValue).toLowerCase().includes(query.toLowerCase())
}

export function filterItems(
  items: readonly unknown[] | undefined,
  query: string,
  itemToStringValue?: (item: unknown) => string,
  filter?: (item: unknown, query: string) => boolean,
): unknown[] {
  if (!items) return []
  const match = (item: unknown) => (filter ? filter(item, query) : defaultFilter(item, query, itemToStringValue))
  if (isGroupedItems(items)) {
    return items
      .map((group) => ({
        value: group.value,
        items: group.items.filter(match),
      }))
      .filter((group) => group.items.length > 0)
  }
  return items.filter(match)
}
