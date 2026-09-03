import { getContext, setContext } from 'svelte'

export interface SparklinePoint {
  index: number
  value: number
  label?: string
}

export interface SparklineContextValue {
  data: () => number[]
  labels: () => string[] | undefined
  activeIndex: () => number | null
  setActiveIndex: (index: number | null) => void
  format: () => Intl.NumberFormatOptions | undefined
  locale: () => Intl.LocalesArgument | undefined
}

const KEY = Symbol('appica-sparkline')

export function setSparklineContext(value: SparklineContextValue) {
  setContext(KEY, value)
}

export function getSparklineContext(): SparklineContextValue {
  const ctx = getContext<SparklineContextValue>(KEY)
  if (!ctx) {
    throw new Error('Sparkline parts must be rendered inside <Sparkline>.')
  }
  return ctx
}
