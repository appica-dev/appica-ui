import type { Snippet } from 'svelte'

export type RatingVariant = 'filled' | 'outline'
export type RatingOrientation = 'horizontal' | 'vertical'

export interface RatingIconPair {
  empty: Snippet
  filled: Snippet
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function round(value: number) {
  return Math.round(value * 1e4) / 1e4
}

export function quantize(raw: number, step: number, count: number) {
  return clamp(round(Math.ceil(round(raw / step)) * step), step, count)
}

export function clipFor(fill: number, rtl: boolean, vertical: boolean) {
  const inset = `${round((1 - fill) * 100)}%`
  if (vertical) return `inset(0 0 ${inset} 0)`
  return rtl ? `inset(0 0 0 ${inset})` : `inset(0 ${inset} 0 0)`
}

export { readTextDirection } from '../../internal/direction'
