import { getContext, setContext } from 'svelte'
import type {
  CarouselApi,
  CarouselAutoplayState,
  CarouselOptions,
  CarouselOrientation,
  CarouselPlugin,
} from './carousel-types'

export interface CarouselContextValue {
  get api(): CarouselApi | undefined
  setApi: (next: CarouselApi | undefined) => void
  get options(): CarouselOptions
  get plugins(): CarouselPlugin[]
  get orientation(): CarouselOrientation
  get direction(): 'ltr' | 'rtl'
  get light(): boolean
  get autoHeight(): boolean
  get loop(): boolean
  get reducedMotion(): boolean
  get selectedIndex(): number
  get scrollSnaps(): number[]
  get canScrollPrev(): boolean
  get canScrollNext(): boolean
  subscribeScrollProgress: (onChange: () => void) => () => void
  getScrollProgress: () => number
  get autoplay(): CarouselAutoplayState | null
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
}

const KEY = Symbol('appica-carousel')

export function setCarouselContext(value: CarouselContextValue) {
  setContext(KEY, value)
}

export function getCarouselContext(): CarouselContextValue | undefined {
  return getContext<CarouselContextValue>(KEY)
}

export function useCarousel(): CarouselContextValue {
  const ctx = getCarouselContext()
  if (!ctx) {
    throw new Error('Carousel sub-components must be rendered inside <Carousel>')
  }
  return ctx
}
