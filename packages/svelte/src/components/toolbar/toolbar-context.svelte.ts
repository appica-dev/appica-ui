import { getContext, setContext, untrack } from 'svelte'

export type ToolbarOrientation = 'horizontal' | 'vertical'

export interface ToolbarItem {
  el: HTMLElement
  disabled: () => boolean
}

export class ToolbarState {
  items = $state<ToolbarItem[]>([])
  tabStop = $state<HTMLElement | null>(null)
  getOrientation: () => ToolbarOrientation = () => 'horizontal'
  getDisabled: () => boolean = () => false

  get orientation() {
    return this.getOrientation()
  }

  get disabled() {
    return this.getDisabled()
  }

  register(item: ToolbarItem) {
    // {@attach} tracks reactive reads. Registering without untrack retriggers
    // the attachment whenever `items` / `tabStop` change, which loops forever.
    return untrack(() => {
      this.items.push(item)
      if (!this.tabStop) this.tabStop = item.el
      return () => {
        this.items = this.items.filter((entry) => entry.el !== item.el)
        if (this.tabStop === item.el) this.tabStop = this.items[0]?.el ?? null
      }
    })
  }

  isTabStop(el: HTMLElement) {
    if (this.getDisabled()) return false
    return (this.tabStop ?? this.items[0]?.el) === el
  }

  enabled() {
    if (this.getDisabled()) return []
    return this.items.filter((item) => !item.disabled())
  }

  focusAt(index: number) {
    const enabled = this.enabled()
    if (enabled.length === 0) return
    const next = enabled[((index % enabled.length) + enabled.length) % enabled.length]
    if (!next) return
    this.tabStop = next.el
    next.el.focus()
  }

  move(delta: number) {
    const enabled = this.enabled()
    if (enabled.length === 0) return
    const current = enabled.findIndex((item) => item.el === this.tabStop)
    this.focusAt((current < 0 ? 0 : current) + delta)
  }
}

const KEY = Symbol('appica-toolbar')

export function setToolbarContext(value: ToolbarState) {
  setContext(KEY, value)
}

export function getToolbarContext(): ToolbarState {
  const ctx = getContext<ToolbarState>(KEY)
  if (!ctx) {
    throw new Error('Toolbar sub-components must be rendered inside <Toolbar>')
  }
  return ctx
}
