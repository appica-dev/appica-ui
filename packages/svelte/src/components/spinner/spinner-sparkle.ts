const SPARKLE_MORPH_PATH =
  'M12.846 3.581C12.711 3.231 12.375 3 12 3C11.625 3 11.278 3.263 11.154 3.581C10.604 5.011 10.054 6.442 9.504 7.872C8.752 8.16 8.159 8.752 7.871 9.504C6.441 10.054 5.011 10.604 3.581 11.154C3.41 11.22 3.263 11.336 3.159 11.487C3.055 11.638 3 11.817 3 12C3 12.183 3.056 12.362 3.159 12.513C3.262 12.664 3.41 12.78 3.581 12.846C5.011 13.396 6.442 13.946 7.872 14.496C8.16 15.248 8.752 15.841 9.504 16.129C10.054 17.559 10.604 18.989 11.154 20.419C11.22 20.59 11.336 20.737 11.487 20.841C11.638 20.945 11.817 21 12 21C12.183 21 12.362 20.945 12.513 20.841C12.664 20.737 12.78 20.59 12.846 20.419C13.396 18.989 13.946 17.559 14.496 16.129C15.248 15.841 15.841 15.248 16.129 14.496C17.559 13.946 18.989 13.396 20.419 12.846C20.59 12.78 20.737 12.664 20.841 12.513C20.945 12.362 21 12.183 21 12C21 11.817 20.945 11.638 20.841 11.487C20.737 11.336 20.59 11.22 20.419 11.154C18.989 10.604 17.559 10.054 16.129 9.504C15.841 8.752 15.248 8.16 14.496 7.871C13.946 6.441 13.396 5.011 12.846 3.581Z'

const SQUARE_MORPH_PATH =
  'M12.704 5C12.469 5 12.235 5 12 5C11.765 5 11.531 5 11.296 5C10.161 5.053 9.025 5.106 7.889 5.159C6.979 6.069 6.069 6.979 5.159 7.889C5.106 9.025 5.053 10.161 5 11.296C5 11.395 5 11.494 5 11.593C5 11.729 5 11.864 5 12C5 12.136 5 12.271 5 12.407C5 12.506 5 12.605 5 12.704C5.053 13.839 5.106 14.975 5.159 16.111C6.069 17.021 6.979 17.931 7.889 18.841C9.025 18.894 10.161 18.947 11.296 19C11.395 19 11.494 19 11.593 19C11.729 19 11.864 19 12 19C12.136 19 12.271 19 12.407 19C12.506 19 12.605 19 12.704 19C13.839 18.947 14.975 18.894 16.111 18.841C17.021 17.931 17.931 17.021 18.841 16.111C18.894 14.975 18.947 13.839 19 12.704C19 12.605 19 12.506 19 12.407C19 12.271 19 12.136 19 12C19 11.864 19 11.729 19 11.593C19 11.494 19 11.395 19 11.296C18.947 10.161 18.894 9.025 18.841 7.889C17.931 6.979 17.021 6.069 16.111 5.159C14.975 5.106 13.839 5.053 12.704 5Z'

function parsePathNumbers(d: string): number[] {
  return d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
}

const SPARKLE_NUMBERS = parsePathNumbers(SPARKLE_MORPH_PATH)
const SQUARE_NUMBERS = parsePathNumbers(SQUARE_MORPH_PATH)
const MORPH_CUBIC_COUNT = (SPARKLE_NUMBERS.length - 2) / 6

function buildSparklePath(nums: number[]): string {
  let d = `M${nums[0]} ${nums[1]}`
  for (let i = 0; i < MORPH_CUBIC_COUNT; i++) {
    const o = 2 + i * 6
    d += `C${nums[o]} ${nums[o + 1]} ${nums[o + 2]} ${nums[o + 3]} ${nums[o + 4]} ${nums[o + 5]}`
  }
  return d + 'Z'
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

const SPARKLE_CYCLE = 2.5
const SPARKLE_MORPH_END = 0.4

function sparkleFrame(t: number): { d: string; rotate: number } {
  const rotate = t < SPARKLE_MORPH_END ? easeInOut(t / SPARKLE_MORPH_END) * 360 : 360
  if (t < SPARKLE_MORPH_END / 2) {
    const sub = easeInOut(t / (SPARKLE_MORPH_END / 2))
    return {
      d: buildSparklePath(SPARKLE_NUMBERS.map((a, i) => lerp(a, SQUARE_NUMBERS[i]!, sub))),
      rotate,
    }
  }
  if (t < SPARKLE_MORPH_END) {
    const sub = easeInOut((t - SPARKLE_MORPH_END / 2) / (SPARKLE_MORPH_END / 2))
    return {
      d: buildSparklePath(SQUARE_NUMBERS.map((a, i) => lerp(a, SPARKLE_NUMBERS[i]!, sub))),
      rotate,
    }
  }
  return { d: SPARKLE_MORPH_PATH, rotate }
}

function attachSparkle(node: SVGPathElement) {
  let raf = 0
  let startedAt: number | null = null
  const tick = (now: number) => {
    if (startedAt === null) startedAt = now
    const frame = sparkleFrame(((now - startedAt) / (SPARKLE_CYCLE * 1000)) % 1)
    node.setAttribute('d', frame.d)
    node.style.transformOrigin = '12px 12px'
    node.style.transform = `rotate(${frame.rotate}deg)`
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

export { SPARKLE_MORPH_PATH, attachSparkle }
