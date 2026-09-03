import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import type { AccessibilityOptionsType } from 'embla-carousel-accessibility'
import type { AutoHeightOptionsType } from 'embla-carousel-auto-height'
import type { AutoScrollOptionsType } from 'embla-carousel-auto-scroll'
import type { AutoplayOptionsType } from 'embla-carousel-autoplay'
import type { ClassNamesOptionsType } from 'embla-carousel-class-names'
import type { FadeOptionsType } from 'embla-carousel-fade'
import type { WheelGesturesPluginOptions } from 'embla-carousel-wheel-gestures'

export type CarouselOrientation = 'horizontal' | 'vertical'
export type CarouselApi = EmblaCarouselType
export type CarouselOptions = EmblaOptionsType
export type CarouselPlugin = EmblaPluginType

export type CarouselAutoplayOptions = AutoplayOptionsType & { resumeAfter?: number }
export type CarouselAutoScrollOptions = AutoScrollOptionsType & { resumeAfter?: number }
export type CarouselAutoHeightOptions = AutoHeightOptionsType
export type CarouselFadeOptions = FadeOptionsType
export type CarouselClassNamesOptions = ClassNamesOptionsType
export type CarouselAccessibilityOptions = AccessibilityOptionsType
export type CarouselWheelGesturesOptions = WheelGesturesPluginOptions

export type CarouselNavPosition = 'inside' | 'outside' | 'outside-half' | 'none'

export interface CarouselAutoplayState {
  delay: number
  cycleId: number
  isPlaying: boolean
}

export type CarouselThumbBox = {
  x: number
  y: number
  width: number
  height: number
}

export function sameThumbBox(a: CarouselThumbBox | null, b: CarouselThumbBox): boolean {
  return a !== null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}
