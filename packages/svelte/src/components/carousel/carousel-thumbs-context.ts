import { getContext, setContext } from 'svelte'

export interface CarouselThumbsContextValue {
  selectedIndex: number
  select: (index: number) => void
  light: boolean
  nextIndex: () => number
}

const KEY = Symbol('appica-carousel-thumbs')

export function setCarouselThumbsContext(value: CarouselThumbsContextValue) {
  setContext(KEY, value)
}

export function useCarouselThumbs(): CarouselThumbsContextValue {
  const ctx = getContext<CarouselThumbsContextValue>(KEY)
  if (!ctx) {
    throw new Error('<CarouselThumb> must be rendered inside <CarouselThumbs>')
  }
  return ctx
}
