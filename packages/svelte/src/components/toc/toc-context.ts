import { getContext, setContext } from 'svelte'

export type TocContextValue = {
  activeIds: () => readonly string[]
  currentId: () => string | null
  register: (id: string, element: HTMLElement) => () => void
  getLinkElement: (id: string) => HTMLElement | undefined
}

const KEY = Symbol('appica-toc')

export function setTocContext(value: TocContextValue) {
  setContext(KEY, value)
}

export function getTocContext(component: string): TocContextValue {
  const ctx = getContext<TocContextValue>(KEY)
  if (!ctx) throw new Error(`Appica UI: <${component}> must be used within <Toc>.`)
  return ctx
}

export function areSameIds(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

export function closestHeadingId(ids: readonly string[], rootBounds: DOMRectReadOnly | null) {
  if (!rootBounds) return null
  let closest: string | null = null
  let minDistance = Number.POSITIVE_INFINITY
  for (const id of ids) {
    const heading = document.getElementById(id)
    if (!heading) continue
    const distance = Math.abs(heading.getBoundingClientRect().top - rootBounds.top)
    if (distance < minDistance) {
      minDistance = distance
      closest = id
    }
  }
  return closest
}

export const DEPTH_INDENT: Record<number, string> = {
  2: 'ps-4',
  3: 'ps-7',
  4: 'ps-10',
  5: 'ps-13',
  6: 'ps-16',
}
