import { cn } from '../../internal/utils'
import type { CarouselNavPosition } from './carousel-types'

export const PREV_POSITION_CLASSES: Record<CarouselNavPosition, string> = {
  inside: cn(
    'absolute z-10',
    'data-[orientation=horizontal]:inset-s-4 data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:-translate-y-1/2',
    'data-[orientation=vertical]:inset-s-1/2 data-[orientation=vertical]:top-4 data-[orientation=vertical]:-translate-x-1/2',
  ),
  outside: cn(
    'absolute z-10',
    'data-[orientation=horizontal]:-inset-s-14 data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:-translate-y-1/2',
    'data-[orientation=vertical]:inset-s-1/2 data-[orientation=vertical]:-top-14 data-[orientation=vertical]:-translate-x-1/2',
  ),
  'outside-half': cn(
    'absolute z-10',
    'data-[orientation=horizontal]:inset-s-0 data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:-translate-y-1/2',
    'data-[orientation=horizontal]:ltr:-translate-x-1/2 data-[orientation=horizontal]:rtl:translate-x-1/2',
    'data-[orientation=vertical]:inset-s-1/2 data-[orientation=vertical]:top-0 data-[orientation=vertical]:-translate-x-1/2 data-[orientation=vertical]:-translate-y-1/2',
  ),
  none: '',
}

export const NEXT_POSITION_CLASSES: Record<CarouselNavPosition, string> = {
  inside: cn(
    'absolute z-10',
    'data-[orientation=horizontal]:inset-e-4 data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:-translate-y-1/2',
    'data-[orientation=vertical]:inset-s-1/2 data-[orientation=vertical]:bottom-4 data-[orientation=vertical]:-translate-x-1/2',
  ),
  outside: cn(
    'absolute z-10',
    'data-[orientation=horizontal]:-inset-e-14 data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:-translate-y-1/2',
    'data-[orientation=vertical]:inset-s-1/2 data-[orientation=vertical]:-bottom-14 data-[orientation=vertical]:-translate-x-1/2',
  ),
  'outside-half': cn(
    'absolute z-10',
    'data-[orientation=horizontal]:inset-e-0 data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:-translate-y-1/2',
    'data-[orientation=horizontal]:ltr:translate-x-1/2 data-[orientation=horizontal]:rtl:-translate-x-1/2',
    'data-[orientation=vertical]:inset-s-1/2 data-[orientation=vertical]:bottom-0 data-[orientation=vertical]:-translate-x-1/2 data-[orientation=vertical]:translate-y-1/2',
  ),
  none: '',
}

export const CAROUSEL_THUMB_TRANSITION = cn(
  'transition-[opacity,translate,scale] motion-reduce:transition-none',
  'duration-[300ms,250ms,250ms]',
  'ease-[ease-out,cubic-bezier(0.175,0.885,0.32,1.5),cubic-bezier(0.175,0.885,0.32,1.5)]',
  'active:duration-[300ms,100ms,100ms] active:ease-[ease-out,ease-in-out,ease-in-out]',
)

export const CAROUSEL_THUMB_OPTIONS = { slides: ':scope > [data-slot=carousel-thumb]' } as const

export const CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX = 40
export const CAROUSEL_PROGRESS_CIRCULAR_THICKNESS = 4
export const CAROUSEL_PROGRESS_CIRCULAR_RADIUS =
  (CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX - CAROUSEL_PROGRESS_CIRCULAR_THICKNESS) / 2
export const CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE = 2 * Math.PI * CAROUSEL_PROGRESS_CIRCULAR_RADIUS
