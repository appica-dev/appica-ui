import { getContext, setContext } from 'svelte'

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isComplete: boolean
}

export type CountdownUnit = 'days' | 'hours' | 'minutes' | 'seconds'

const MS = { day: 86_400_000, hour: 3_600_000, minute: 60_000, second: 1_000 } as const

const KEY = Symbol('appica-countdown')

export function toTimestamp(value: Date | number | string): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return new Date(value).getTime()
}

export function getParts(total: number): CountdownParts {
  const remaining = Math.max(0, total)
  return {
    days: Math.floor(remaining / MS.day),
    hours: Math.floor(remaining / MS.hour) % 24,
    minutes: Math.floor(remaining / MS.minute) % 60,
    seconds: Math.floor(remaining / MS.second) % 60,
    total: remaining,
    isComplete: remaining <= 0,
  }
}

export function setCountdownContext(parts: () => CountdownParts) {
  setContext(KEY, parts)
}

export function getCountdownContext(): (() => CountdownParts) | undefined {
  return getContext<() => CountdownParts>(KEY)
}
