export type TextAnimateSegment = 'char' | 'word' | 'line'

export type TextAnimateEffectName = 'typewriter' | 'scramble' | 'rise' | 'highlight' | 'wave' | 'flip' | 'shimmer'

export interface TextAnimateUnitContext {
  index: number
  total: number
  text: string
  by: TextAnimateSegment
  globalProgress: number
  reduced: boolean
}

export interface TextAnimateEffectResult {
  style?: Record<string, string>
  className?: string
  content?: string
  caret?: boolean
  innerTransform?: string
}

export type TextAnimateEffect = (progress: number, ctx: TextAnimateUnitContext) => TextAnimateEffectResult

export type TextAnimateContainerEffect = (
  progress: number,
  ctx: { reduced: boolean },
) => { style?: Record<string, string>; className?: string }

interface PresetConfig {
  fn: TextAnimateEffect
  by: TextAnimateSegment
  stagger: number
  continuous: boolean
  container?: TextAnimateContainerEffect
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&@$?/<>*'
const SCRAMBLE_STEPS = 10

const SHIMMER_SPREAD = 'var(--text-shimmer-spread, calc(3ch + 40px))'
const SHIMMER_BASE = 'var(--text-shimmer-base, color-mix(in oklab, currentColor 38%, transparent))'
const SHIMMER_GLARE = 'var(--text-shimmer-glare, currentColor)'
const SHIMMER_MID = `color-mix(in oklab, ${SHIMMER_GLARE}, ${SHIMMER_BASE} 50%)`
const SHIMMER_GRADIENT =
  `linear-gradient(calc(90deg + var(--text-shimmer-angle, 20deg)),` +
  ` ${SHIMMER_BASE} calc(50% - ${SHIMMER_SPREAD}),` +
  ` ${SHIMMER_MID} calc(50% - ${SHIMMER_SPREAD} * 0.5),` +
  ` ${SHIMMER_GLARE} 50%,` +
  ` ${SHIMMER_MID} calc(50% + ${SHIMMER_SPREAD} * 0.5),` +
  ` ${SHIMMER_BASE} calc(50% + ${SHIMMER_SPREAD}))`

export const presets: Record<TextAnimateEffectName, PresetConfig> = {
  typewriter: {
    by: 'char',
    stagger: 1,
    continuous: false,
    fn: (p, ctx) => {
      const typed = p > 0
      const head = Math.min(Math.floor(ctx.globalProgress * ctx.total), ctx.total - 1)
      const onEdge = ctx.index === head && ctx.globalProgress < 1
      const caret = onEdge || (ctx.globalProgress >= 1 && ctx.index === ctx.total - 1)
      return { content: typed ? ctx.text : '', caret }
    },
  },
  scramble: {
    by: 'char',
    stagger: 0.6,
    continuous: false,
    fn: (p, ctx) => {
      if (p >= 1 || ctx.text.trim() === '' || ctx.reduced) return {}
      const step = Math.floor(p * SCRAMBLE_STEPS)
      const glyph = SCRAMBLE_CHARS[(ctx.index * 131 + step * 977) % SCRAMBLE_CHARS.length]
      return { content: glyph, style: { opacity: String(0.55 + p * 0.45) } }
    },
  },
  rise: {
    by: 'char',
    stagger: 0.7,
    continuous: false,
    fn: (p, ctx) => {
      if (ctx.reduced) return {}
      const eased = 1 - Math.pow(1 - p, 3)
      return {
        style: {
          display: 'inline-block',
          overflow: 'hidden',
          verticalAlign: 'bottom',
          paddingBottom: '0.12em',
          marginBottom: '-0.12em',
        },
        content: ctx.text,
        innerTransform: `translateY(${((1 - eased) * 110).toFixed(2)}%)`,
      }
    },
  },
  highlight: {
    by: 'word',
    stagger: 0.85,
    continuous: false,
    fn: (p) => ({ style: { opacity: String(0.18 + 0.82 * p) } }),
  },
  wave: {
    by: 'char',
    stagger: 0,
    continuous: true,
    fn: (_p, ctx) => {
      if (ctx.reduced) return {}
      const y = Math.sin(ctx.globalProgress * Math.PI * 2 + ctx.index * 0.55)
      return { style: { display: 'inline-block', transform: `translateY(${(-y * 0.16).toFixed(3)}em)` } }
    },
  },
  flip: {
    by: 'char',
    stagger: 0.7,
    continuous: false,
    fn: (p, ctx) => {
      if (ctx.reduced) return {}
      return {
        style: {
          display: 'inline-block',
          transformOrigin: '50% 0%',
          backfaceVisibility: 'hidden',
          transform: `perspective(600px) rotateX(${((1 - p) * -90).toFixed(2)}deg)`,
          opacity: p < 0.5 ? String(p * 2) : '1',
        },
      }
    },
  },
  shimmer: {
    by: 'line',
    stagger: 0,
    continuous: true,
    fn: () => ({}),
    container: (p, { reduced }) => {
      if (reduced) return {}
      return {
        style: {
          display: 'inline-block',
          backgroundImage: SHIMMER_GRADIENT,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `calc(200% + ${SHIMMER_SPREAD} * 2) 100%`,
          backgroundPosition: `${((1 - p) * 100).toFixed(3)}% 0px`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
      }
    },
  },
}

export interface BuiltChar {
  ch: string
  index: number
}
export interface BuiltWord {
  text: string
  index: number
  chars: BuiltChar[] | null
}
export interface BuiltLine {
  text: string
  index: number
  words: BuiltWord[] | null
}

export function tokenize(text: string, by: TextAnimateSegment): { lines: BuiltLine[]; total: number } {
  let u = 0
  const lines = text.split('\n').map<BuiltLine>((lineText) => {
    if (by === 'line') {
      return { text: lineText, index: u++, words: null }
    }
    const words = (lineText.length ? lineText.split(' ') : ['']).map<BuiltWord>((word) => {
      if (by === 'word') {
        return { text: word, index: u++, chars: null }
      }
      const chars = Array.from(word).map<BuiltChar>((ch) => ({ ch, index: u++ }))
      return { text: word, index: -1, chars }
    })
    return { text: lineText, index: -1, words }
  })
  return { lines, total: u }
}

export const MIN_UNIT_DURATION = 1e-4

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

export function cssStyle(style?: Record<string, string>): string | undefined {
  if (!style) return undefined
  const parts: string[] = []
  for (const [key, value] of Object.entries(style)) {
    const prop = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    parts.push(`${prop}: ${value}`)
  }
  return parts.join('; ')
}

export function resolvePreset(effect: TextAnimateEffectName | TextAnimateEffect) {
  return typeof effect === 'string' ? presets[effect] : null
}
