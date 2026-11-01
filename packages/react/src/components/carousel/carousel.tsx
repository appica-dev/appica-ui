'use client'

import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import Accessibility, { type AccessibilityOptionsType } from 'embla-carousel-accessibility'
import Autoplay, { type AutoplayOptionsType } from 'embla-carousel-autoplay'
import AutoScroll, { type AutoScrollOptionsType } from 'embla-carousel-auto-scroll'
import AutoHeight, { type AutoHeightOptionsType } from 'embla-carousel-auto-height'
import ClassNames, { type ClassNamesOptionsType } from 'embla-carousel-class-names'
import Fade, { type FadeOptionsType } from 'embla-carousel-fade'
import { WheelGesturesPlugin, type WheelGesturesPluginOptions } from 'embla-carousel-wheel-gestures'
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import { cn, useComposedRefs } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { useReducedMotion } from '../../hooks/use-reduced-motion'

type CarouselOrientation = 'horizontal' | 'vertical'

type CarouselApi = EmblaCarouselType
type CarouselOptions = EmblaOptionsType
type CarouselPlugin = EmblaPluginType

type CarouselAutoplayOptions = AutoplayOptionsType & { resumeAfter?: number }
type CarouselAutoScrollOptions = AutoScrollOptionsType & { resumeAfter?: number }
type CarouselAutoHeightOptions = AutoHeightOptionsType
type CarouselFadeOptions = FadeOptionsType
type CarouselClassNamesOptions = ClassNamesOptionsType
type CarouselAccessibilityOptions = AccessibilityOptionsType
type CarouselWheelGesturesOptions = WheelGesturesPluginOptions

interface CarouselAutoplayState {
  delay: number
  cycleId: number
  isPlaying: boolean
}

interface CarouselContextValue {
  api: CarouselApi | undefined
  viewportRef: (node: HTMLDivElement | null) => void
  orientation: CarouselOrientation
  direction: 'ltr' | 'rtl'
  light: boolean
  autoHeight: boolean
  loop: boolean
  reducedMotion: boolean
  selectedIndex: number
  scrollSnaps: number[]
  canScrollPrev: boolean
  canScrollNext: boolean
  subscribeScrollProgress: (onChange: () => void) => () => void
  getScrollProgress: () => number
  autoplay: CarouselAutoplayState | null
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel(): CarouselContextValue {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) {
    throw new Error('Carousel sub-components must be rendered inside <Carousel>')
  }
  return ctx
}

// The root already names the carousel, so the plugin's empty values keep the
// viewport from becoming a second landmark (its setter skips empty strings).
const CAROUSEL_ACCESSIBILITY_VIEWPORT: CarouselAccessibilityOptions = {
  carouselRole: '',
  carouselAriaLabel: '',
  carouselAriaRoleDescription: '',
}

function getShownSlides(api: CarouselApi): Set<number> {
  const { options, scrollSnapList } = api.internalEngine()
  if (!options.active) return new Set(api.slideNodes().keys())
  // Fade stacks every slide in one place, and the in-view list stays empty
  // until the engine's IntersectionObserver first reports.
  const inView = api.plugins().fade ? [] : api.slidesInView()
  return new Set(inView.length ? inView : (scrollSnapList.slidesBySnap[api.selectedSnap()] ?? []))
}

function useSlideVisibility(api: CarouselApi | undefined, enabled: boolean) {
  React.useEffect(() => {
    if (!api || !enabled) return
    const inert = new Set<HTMLElement>()
    const labels = new Map<HTMLElement, string>()

    const release = (node: HTMLElement) => {
      if (inert.delete(node)) node.removeAttribute('inert')
      if (labels.has(node) && node.getAttribute('aria-label') === labels.get(node)) node.removeAttribute('aria-label')
      labels.delete(node)
    }

    const sync = (focused: EventTarget | null) => {
      const slides = api.slideNodes()
      const shown = getShownSlides(api)
      new Set([...inert, ...labels.keys()]).forEach((node) => {
        if (!slides.includes(node)) release(node)
      })
      slides.forEach((node, index) => {
        const hidden = !shown.has(index) && !(focused instanceof Node && node.contains(focused))
        if (hidden && !inert.has(node)) {
          node.setAttribute('inert', '')
          inert.add(node)
        } else if (!hidden && inert.delete(node)) {
          node.removeAttribute('inert')
        }

        const ownLabel = node.getAttribute('aria-label')
        if (node.hasAttribute('aria-labelledby') || (ownLabel !== null && ownLabel !== labels.get(node))) {
          labels.delete(node)
          return
        }
        const label = `${index + 1} of ${slides.length}`
        if (ownLabel !== label) node.setAttribute('aria-label', label)
        labels.set(node, label)
      })
    }

    const onChange = () => sync(document.activeElement)
    const onFocusOut = (event: FocusEvent) => sync(event.relatedTarget)
    const viewport = api.rootNode()

    onChange()
    api.on('select', onChange)
    api.on('reinit', onChange)
    api.on('slidesinview', onChange)
    viewport?.addEventListener('focusout', onFocusOut)
    return () => {
      api.off('select', onChange)
      api.off('reinit', onChange)
      api.off('slidesinview', onChange)
      viewport?.removeEventListener('focusout', onFocusOut)
      new Set([...inert, ...labels.keys()]).forEach(release)
    }
  }, [api, enabled])
}

interface CarouselProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect' | 'onScroll' | 'children'> {
  /**
   * Scroll axis. Maps to Embla's `axis`; exposed as `data-orientation`.
   * @default 'horizontal'
   */
  orientation?: CarouselOrientation
  /**
   * Wrap around from the last slide to the first.
   * @default false
   */
  loop?: boolean
  /**
   * Where slides settle within the viewport.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end'
  /**
   * How many slides advance per step. `'auto'` groups by how many fit the viewport.
   * @default 1
   */
  slidesToScroll?: number | 'auto'
  /**
   * Clamp scrolling so there's no empty space at the edges. `false` disables containment.
   * @default 'trimSnaps'
   */
  containScroll?: false | 'trimSnaps' | 'keepSnaps'
  /** Release snap points and glide to a momentum stop. `'snap'` glides, then settles on the nearest snap point. */
  dragFree?: boolean | 'snap'
  /** Index of the slide to start on. */
  startSnap?: number
  /**
   * When `false`, the engine is inert (no drag/snap) - e.g. to disable at a breakpoint.
   * @default true
   */
  active?: boolean
  /**
   * Whether pointer dragging is enabled.
   * @default true
   */
  draggable?: boolean
  /** Scroll animation duration (Embla's ease). Forced to `0` under reduced motion. */
  duration?: number
  /** Escape hatch: a raw Embla options object, merged last so it wins over the flat props. */
  options?: CarouselOptions
  /** Enable the Autoplay plugin. It pauses while hovered or focused and stays off under reduced motion. `resumeAfter` (ms) restarts the timer after user interaction. */
  autoplay?: boolean | CarouselAutoplayOptions
  /** Enable continuous Auto Scroll. Mutually exclusive with `autoplay`; paused under reduced motion. */
  autoScroll?: boolean | CarouselAutoScrollOptions
  /** Enable the Auto Height plugin; animates the viewport to each slide's height. */
  autoHeight?: boolean | CarouselAutoHeightOptions
  /** Enable the Fade plugin (cross-fade instead of slide). Best with one slide per view. */
  fade?: boolean | CarouselFadeOptions
  /** Enable the Class Names plugin, which toggles `snapped` / `inView` classes on slides. */
  classNames?: boolean | CarouselClassNamesOptions
  /**
   * Slide semantics. `true` makes slides outside the viewport `inert` and labels each slide "n of m". An options object hands slides to Embla's Accessibility plugin instead, and `false` leaves them alone.
   * @default true
   */
  accessibility?: boolean | CarouselAccessibilityOptions
  /**
   * Enable trackpad / mouse-wheel scrolling.
   * @default false
   */
  wheelGestures?: boolean | CarouselWheelGesturesOptions
  /** Additional Embla plugins to append. */
  plugins?: CarouselPlugin[]
  /** Receives the Embla instance once initialized - for imperative control. */
  setApi?: (api: CarouselApi) => void
  /** Fires on init and whenever the engine re-initializes. */
  onReInit?: (api: CarouselApi) => void
  /** Fires when the selected snap changes. */
  onSelect?: (api: CarouselApi) => void
  /** Fires continuously while scrolling. */
  onScroll?: (api: CarouselApi) => void
  /**
   * Hint stored in context for light-on-dark surfaces; read via `useCarousel()`.
   * @default false
   */
  light?: boolean
  /** The content. */
  children: React.ReactNode
}

function Carousel({
  orientation = 'horizontal',
  loop = false,
  align = 'start',
  slidesToScroll = 1,
  containScroll = 'trimSnaps',
  dragFree,
  startSnap,
  active = true,
  draggable,
  duration,
  options,
  autoplay,
  autoScroll,
  autoHeight,
  fade,
  classNames,
  accessibility = true,
  wheelGestures = false,
  plugins: userPlugins,
  setApi,
  onReInit,
  onSelect,
  onScroll,
  light = false,
  className,
  children,
  ...rest
}: CarouselProps) {
  const direction = useDirection()

  const reducedMotion = useReducedMotion()

  const autoplayEnabled = !!autoplay
  const autoScrollEnabled = !!autoScroll

  const warnedMutualExclusive = React.useRef(false)
  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      autoplayEnabled &&
      autoScrollEnabled &&
      !warnedMutualExclusive.current
    ) {
      warnedMutualExclusive.current = true
      // eslint-disable-next-line no-console
      console.warn('[Carousel] `autoplay` and `autoScroll` are mutually exclusive - preferring `autoplay`.')
    }
  }, [autoplayEnabled, autoScrollEnabled])

  const resumeAfterMs =
    (typeof autoplay === 'object' && typeof autoplay.resumeAfter === 'number' && autoplay.resumeAfter) ||
    (typeof autoScroll === 'object' && typeof autoScroll.resumeAfter === 'number' && autoScroll.resumeAfter) ||
    0

  const plugins = React.useMemo<CarouselPlugin[]>(() => {
    const list: CarouselPlugin[] = []
    if (typeof accessibility === 'object') {
      list.push(Accessibility({ ...CAROUSEL_ACCESSIBILITY_VIEWPORT, ...accessibility }))
    }
    if (wheelGestures !== false) {
      list.push(WheelGesturesPlugin(typeof wheelGestures === 'object' ? wheelGestures : undefined))
    }
    if (autoplay) {
      const opts = typeof autoplay === 'object' ? autoplay : undefined
      const { resumeAfter, ...emblaOpts } = opts ?? {}
      const autoResume = typeof resumeAfter === 'number' && resumeAfter > 0
      list.push(Autoplay(autoResume ? { ...emblaOpts, defaultInteraction: false } : emblaOpts))
    } else if (autoScroll && !reducedMotion) {
      const opts = typeof autoScroll === 'object' ? autoScroll : undefined
      const { resumeAfter, ...emblaOpts } = opts ?? {}
      const autoResume = typeof resumeAfter === 'number' && resumeAfter > 0
      list.push(AutoScroll(autoResume ? { ...emblaOpts, defaultInteraction: false } : emblaOpts))
    }
    if (autoHeight) {
      list.push(AutoHeight(typeof autoHeight === 'object' ? autoHeight : undefined))
    }
    if (fade) {
      list.push(Fade(typeof fade === 'object' ? fade : undefined))
    }
    if (classNames) {
      list.push(ClassNames(typeof classNames === 'object' ? classNames : undefined))
    }
    if (userPlugins) list.push(...userPlugins)
    return list
  }, [accessibility, wheelGestures, autoplay, autoScroll, autoHeight, fade, classNames, userPlugins, reducedMotion])

  const emblaOptions = React.useMemo<CarouselOptions>(() => {
    const merged: CarouselOptions = {
      axis: orientation === 'vertical' ? 'y' : 'x',
      loop,
      align,
      slidesToScroll,
      containScroll,
      active,
    }
    if (dragFree !== undefined) merged.dragFree = dragFree
    if (startSnap !== undefined) merged.startSnap = startSnap
    if (duration !== undefined) merged.duration = duration
    if (draggable !== undefined) merged.draggable = draggable
    if (orientation === 'horizontal') merged.direction = direction
    if (reducedMotion) merged.duration = 0
    return { ...merged, ...options }
  }, [
    orientation,
    direction,
    loop,
    align,
    slidesToScroll,
    containScroll,
    dragFree,
    startSnap,
    active,
    draggable,
    duration,
    options,
    reducedMotion,
  ])

  const [viewportRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins)
  useSlideVisibility(emblaApi, accessibility === true)

  const { ref: forwardedRef, ...rootProps } = rest as typeof rest & { ref?: React.Ref<HTMLDivElement> }
  const rootRef = React.useRef<HTMLDivElement>(null)
  const composedRootRef = useComposedRefs(rootRef, forwardedRef)

  const setApiRef = React.useRef(setApi)
  const onReInitRef = React.useRef(onReInit)
  const onSelectRef = React.useRef(onSelect)
  const onScrollRef = React.useRef(onScroll)
  React.useEffect(() => {
    setApiRef.current = setApi
  })
  React.useEffect(() => {
    onReInitRef.current = onReInit
  })
  React.useEffect(() => {
    onSelectRef.current = onSelect
  })
  React.useEffect(() => {
    onScrollRef.current = onScroll
  })

  React.useEffect(() => {
    if (!emblaApi || !reducedMotion) return
    const snapToTargetInstantly = () => {
      emblaApi.internalEngine().scrollBody.useDuration(0)
    }
    emblaApi.on('pointerup', snapToTargetInstantly)
    emblaApi.on('scroll', snapToTargetInstantly)
    return () => {
      emblaApi.off('pointerup', snapToTargetInstantly)
      emblaApi.off('scroll', snapToTargetInstantly)
    }
  }, [emblaApi, reducedMotion])

  const [state, setState] = React.useState({
    selectedIndex: 0,
    scrollSnaps: [] as number[],
    canScrollPrev: false,
    canScrollNext: false,
  })
  const [autoplayState, setAutoplayState] = React.useState<CarouselAutoplayState | null>(null)

  const scrollProgressRef = React.useRef(0)
  const scrollListenersRef = React.useRef<Set<() => void>>(new Set())
  const subscribeScrollProgress = React.useCallback((onChange: () => void) => {
    scrollListenersRef.current.add(onChange)
    return () => {
      scrollListenersRef.current.delete(onChange)
    }
  }, [])
  const getScrollProgress = React.useCallback(() => scrollProgressRef.current, [])

  React.useEffect(() => {
    if (!emblaApi) return

    const notifyScroll = () => {
      scrollProgressRef.current = emblaApi.scrollProgress()
      scrollListenersRef.current.forEach((cb) => cb())
    }
    const syncFull = () => {
      notifyScroll()
      setState({
        selectedIndex: emblaApi.selectedSnap(),
        scrollSnaps: emblaApi.snapList(),
        canScrollPrev: emblaApi.canGoToPrev(),
        canScrollNext: emblaApi.canGoToNext(),
      })
    }
    const syncSelection = () => {
      setState((s) => ({
        ...s,
        selectedIndex: emblaApi.selectedSnap(),
        canScrollPrev: emblaApi.canGoToPrev(),
        canScrollNext: emblaApi.canGoToNext(),
      }))
    }
    const syncScroll = () => {
      notifyScroll()
    }

    syncFull()
    setApiRef.current?.(emblaApi)
    onReInitRef.current?.(emblaApi)

    const handleReInit = () => {
      const autoplayWasPlaying = emblaApi.plugins().autoplay?.isPlaying()
      const autoScrollWasPlaying = emblaApi.plugins().autoScroll?.isPlaying()
      syncFull()
      onReInitRef.current?.(emblaApi)
      if (autoplayEnabled && autoplayWasPlaying) emblaApi.plugins().autoplay?.play()
      else if (autoScrollEnabled && autoScrollWasPlaying) emblaApi.plugins().autoScroll?.play()
    }
    const handleSelect = () => {
      syncSelection()
      onSelectRef.current?.(emblaApi)
    }
    const handleScroll = () => {
      syncScroll()
      onScrollRef.current?.(emblaApi)
    }

    emblaApi.on('reinit', handleReInit)
    emblaApi.on('select', handleSelect)
    emblaApi.on('scroll', handleScroll)
    emblaApi.on('slideschanged', syncFull)

    const autoplayPlugin = emblaApi.plugins().autoplay
    const autoScrollPlugin = emblaApi.plugins().autoScroll

    const resumeAfter = resumeAfterMs

    let resumeTimer: ReturnType<typeof setTimeout> | undefined
    const clearResumeTimer = () => {
      if (resumeTimer !== undefined) {
        clearTimeout(resumeTimer)
        resumeTimer = undefined
      }
    }
    const scheduleResume = (play: () => void) => {
      if (resumeAfter <= 0) return
      clearResumeTimer()
      resumeTimer = setTimeout(() => {
        resumeTimer = undefined
        play()
      }, resumeAfter)
    }

    const root = rootRef.current
    let hovered = false
    let focused = false
    // Rotation that hover or focus stopped, owed a restart once both have left.
    let held = false
    const playAutoplay = () => {
      if (hovered || focused) held = true
      else emblaApi.plugins().autoplay?.play()
    }
    const interruptAutoplay = () => {
      held = false
      emblaApi.plugins().autoplay?.stop()
      scheduleResume(playAutoplay)
    }

    let cleanupAutoplay: (() => void) | undefined
    if (autoplayPlugin) {
      const rawDelay = autoplayPlugin.options.delay
      const initialDelay = typeof rawDelay === 'number' ? rawDelay : 4000
      setAutoplayState({
        delay: initialDelay,
        cycleId: 0,
        isPlaying: autoplayPlugin.isPlaying(),
      })
      const onPlay = () => {
        held = false
        clearResumeTimer()
        setAutoplayState((s) => (s ? { ...s, isPlaying: true } : s))
      }
      const onStop = () => setAutoplayState((s) => (s ? { ...s, isPlaying: false } : s))
      const onTimerSet = () => setAutoplayState((s) => (s ? { ...s, cycleId: s.cycleId + 1, isPlaying: true } : s))
      const onTimerStopped = () => setAutoplayState((s) => (s ? { ...s, isPlaying: false } : s))
      const resetOnSelect = () => autoplayPlugin.reset()
      const onUserStop = () => {
        held = false
      }
      const onInteraction = (_api: CarouselApi, event: { detail: { interaction: string } }) => {
        if (event.detail.interaction === 'pointerdown' || event.detail.interaction === 'slidefocus') {
          interruptAutoplay()
        }
      }
      const hold = () => {
        if (!emblaApi.plugins().autoplay?.isPlaying()) return
        held = true
        emblaApi.plugins().autoplay?.stop()
      }
      const release = () => {
        if (held) playAutoplay()
      }
      const onPointerEnter = () => {
        hovered = true
        hold()
      }
      const onPointerLeave = () => {
        hovered = false
        release()
      }
      const onFocusIn = () => {
        focused = true
        hold()
      }
      const onFocusOut = (event: FocusEvent) => {
        if (event.relatedTarget instanceof Node && root?.contains(event.relatedTarget)) return
        focused = false
        release()
      }
      emblaApi.on('autoplay:play', onPlay)
      emblaApi.on('autoplay:stop', onStop)
      emblaApi.on('autoplay:timerset', onTimerSet)
      emblaApi.on('autoplay:timerstopped', onTimerStopped)
      emblaApi.on('select', resetOnSelect)
      emblaApi.on('pointerdown', onUserStop)
      emblaApi.on('slidefocus', onUserStop)
      if (resumeAfter > 0) emblaApi.on('autoplay:interaction', onInteraction)
      root?.addEventListener('pointerenter', onPointerEnter)
      root?.addEventListener('pointerleave', onPointerLeave)
      root?.addEventListener('focusin', onFocusIn)
      root?.addEventListener('focusout', onFocusOut)
      if (autoplayEnabled && !reducedMotion) {
        hovered = !!root?.matches(':hover')
        focused = !!root?.contains(document.activeElement)
        playAutoplay()
      } else {
        autoplayPlugin.stop()
      }
      cleanupAutoplay = () => {
        emblaApi.off('autoplay:play', onPlay)
        emblaApi.off('autoplay:stop', onStop)
        emblaApi.off('autoplay:timerset', onTimerSet)
        emblaApi.off('autoplay:timerstopped', onTimerStopped)
        emblaApi.off('select', resetOnSelect)
        emblaApi.off('pointerdown', onUserStop)
        emblaApi.off('slidefocus', onUserStop)
        if (resumeAfter > 0) emblaApi.off('autoplay:interaction', onInteraction)
        root?.removeEventListener('pointerenter', onPointerEnter)
        root?.removeEventListener('pointerleave', onPointerLeave)
        root?.removeEventListener('focusin', onFocusIn)
        root?.removeEventListener('focusout', onFocusOut)
      }
    } else {
      setAutoplayState(null)
    }

    let cleanupAutoScroll: (() => void) | undefined
    if (autoScrollPlugin && autoScrollEnabled && !autoplayEnabled) {
      autoScrollPlugin.play()
      const onInteraction = (_api: CarouselApi, event: { detail: { interaction: string } }) => {
        if (event.detail.interaction === 'pointerdown' || event.detail.interaction === 'slidefocus') {
          autoScrollPlugin.stop()
          scheduleResume(() => emblaApi.plugins().autoScroll?.play())
        }
      }
      if (resumeAfter > 0) {
        emblaApi.on('autoscroll:interaction', onInteraction)
        cleanupAutoScroll = () => emblaApi.off('autoscroll:interaction', onInteraction)
      }
    }

    let cleanupWheel: (() => void) | undefined
    if (emblaApi.plugins().wheelGestures && (autoplayPlugin || autoScrollPlugin)) {
      const viewport = emblaApi.rootNode()
      const vertical = emblaApi.internalEngine().options.axis === 'y'
      const onWheel = (event: WheelEvent) => {
        const along = Math.abs(vertical ? event.deltaY : event.deltaX)
        const across = Math.abs(vertical ? event.deltaX : event.deltaY)
        if (along <= across) return
        if (autoplayPlugin?.isPlaying() || held) {
          interruptAutoplay()
        } else if (autoScrollPlugin?.isPlaying()) {
          autoScrollPlugin.stop()
          scheduleResume(() => emblaApi.plugins().autoScroll?.play())
        }
      }
      viewport.addEventListener('wheel', onWheel, { passive: true })
      cleanupWheel = () => viewport.removeEventListener('wheel', onWheel)
    }

    return () => {
      emblaApi.off('reinit', handleReInit)
      emblaApi.off('select', handleSelect)
      emblaApi.off('scroll', handleScroll)
      emblaApi.off('slideschanged', syncFull)
      cleanupAutoplay?.()
      cleanupAutoScroll?.()
      cleanupWheel?.()
      clearResumeTimer()
    }
  }, [emblaApi, autoplayEnabled, autoScrollEnabled, resumeAfterMs, reducedMotion])

  const scrollPrev = React.useCallback(() => emblaApi?.goToPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.goToNext(), [emblaApi])
  const scrollTo = React.useCallback((i: number) => emblaApi?.goTo(i), [emblaApi])

  const isAutoHeight = !!autoHeight
  const contextValue = React.useMemo<CarouselContextValue>(
    () => ({
      api: emblaApi,
      viewportRef,
      orientation,
      direction,
      light,
      autoHeight: isAutoHeight,
      loop,
      reducedMotion,
      selectedIndex: state.selectedIndex,
      scrollSnaps: state.scrollSnaps,
      canScrollPrev: state.canScrollPrev,
      canScrollNext: state.canScrollNext,
      subscribeScrollProgress,
      getScrollProgress,
      autoplay: autoplayState,
      scrollPrev,
      scrollNext,
      scrollTo,
    }),
    [
      emblaApi,
      viewportRef,
      orientation,
      direction,
      light,
      isAutoHeight,
      loop,
      reducedMotion,
      state,
      subscribeScrollProgress,
      getScrollProgress,
      autoplayState,
      scrollPrev,
      scrollNext,
      scrollTo,
    ],
  )

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        data-slot="carousel"
        data-orientation={orientation}
        role={rootProps['aria-label'] || rootProps['aria-labelledby'] ? 'region' : 'group'}
        aria-roledescription="carousel"
        className={cn('relative', className)}
        {...rootProps}
        ref={composedRootRef}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

interface CarouselContentProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Props for the scroll viewport, the element that clips the track. */
  viewportProps?: React.ComponentPropsWithoutRef<'div'>
}

function CarouselContent({ className, children, viewportProps, ...rest }: CarouselContentProps) {
  const { viewportRef, orientation, autoHeight } = useCarousel()
  return (
    <div
      data-base-ui-swipe-ignore={orientation === 'vertical' ? 'y' : 'x'}
      {...viewportProps}
      ref={viewportRef}
      data-slot="carousel-viewport"
      data-orientation={orientation}
      data-auto-height={autoHeight || undefined}
      className={cn(
        'overflow-hidden',
        autoHeight && 'motion-safe:transition-[height] motion-safe:duration-300 motion-safe:ease-out',
        viewportProps?.className,
      )}
    >
      <div
        data-slot="carousel-content"
        data-orientation={orientation}
        className={cn(
          'flex',
          orientation === 'horizontal'
            ? '-ms-4 touch-pan-y touch-pinch-zoom items-start'
            : '-mt-4 h-full touch-pan-x touch-pinch-zoom flex-col',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </div>
  )
}

type CarouselSlideProps = React.ComponentPropsWithoutRef<'div'>

function CarouselSlide({ className, ...rest }: CarouselSlideProps) {
  const { orientation } = useCarousel()
  return (
    <div
      data-slot="carousel-slide"
      data-orientation={orientation}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-h-0 min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'ps-4' : 'pt-4',
        className,
      )}
      {...rest}
    />
  )
}

interface CarouselThumbBox {
  x: number
  y: number
  width: number
  height: number
}

function sameThumbBox(a: CarouselThumbBox | null, b: CarouselThumbBox) {
  return a !== null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

interface CarouselThumbsContextValue {
  selectedIndex: number
  select: (index: number) => void
  light: boolean
}

const CarouselThumbsContext = React.createContext<CarouselThumbsContextValue | null>(null)
const CarouselThumbIndexContext = React.createContext(0)

function useCarouselThumbs(): CarouselThumbsContextValue {
  const ctx = React.useContext(CarouselThumbsContext)
  if (!ctx) {
    throw new Error('<CarouselThumb> must be rendered inside <CarouselThumbs>')
  }
  return ctx
}

// Naming the slides keeps the indicator, which is a child of the track too, out
// of the snap count.
const CAROUSEL_THUMB_OPTIONS: CarouselOptions = { slides: ':scope > [data-slot=carousel-thumb]' }

const CAROUSEL_THUMB_TRANSITION = cn(
  'transition-[opacity,translate,scale] motion-reduce:transition-none',
  'duration-[300ms,250ms,250ms]',
  'ease-[ease-out,var(--ease-spring),var(--ease-spring)]',
  'active:duration-[300ms,100ms,100ms] active:ease-[ease-out,ease-in-out,ease-in-out]',
)

interface CarouselThumbsProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'draggable' | 'onSelect' | 'onScroll'
> {
  /**
   * Lay the thumbnails out in a row or a column. Independent of the carousel's own axis.
   * @default 'horizontal'
   */
  orientation?: CarouselOrientation
  /**
   * Light-on-dark styling for use over imagery.
   * @default false
   */
  light?: boolean
}

function CarouselThumbs({
  orientation = 'horizontal',
  light: lightProp,
  className,
  children,
  ...rest
}: CarouselThumbsProps) {
  const { selectedIndex, scrollTo, light: ctxLight } = useCarousel()
  const light = lightProp ?? ctxLight
  const [api, setApi] = React.useState<CarouselApi>()
  const [box, setBox] = React.useState<CarouselThumbBox | null>(null)
  const vertical = orientation === 'vertical'

  // No dependency list: any render can add, remove or resize a thumbnail. Offsets
  // are relative to the track, which is what Embla translates, so scrolling the
  // rail carries the indicator along without a re-measure.
  React.useEffect(() => {
    const thumb = api?.slideNodes()[selectedIndex]
    const track = api?.containerNode()

    const measure = () => {
      if (!thumb || !track) return setBox(null)
      // Layout offsets, never rects: the thumbnail scales and shifts under the
      // press, and a rect would catch it mid-animation. The track's transform
      // makes it the offset parent in most engines; where it doesn't, the
      // thumbnail is measured from further up and the track's own offset comes
      // back off.
      const nested = thumb.offsetParent === track
      const next = {
        x: thumb.offsetLeft - (nested ? 0 : track.offsetLeft),
        y: thumb.offsetTop - (nested ? 0 : track.offsetTop),
        width: thumb.offsetWidth,
        height: thumb.offsetHeight,
      }
      setBox((previous) => (sameThumbBox(previous, next) ? previous : next))
    }

    measure()
    if (!thumb || !track || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(thumb)
    return () => observer.disconnect()
  })

  React.useEffect(() => {
    const thumb = api?.slideNodes()[selectedIndex]
    const viewport = api?.rootNode()
    if (!thumb || !viewport) return
    const slide = thumb.getBoundingClientRect()
    const frame = viewport.getBoundingClientRect()
    const visible = vertical
      ? slide.top >= frame.top - 1 && slide.bottom <= frame.bottom + 1
      : slide.left >= frame.left - 1 && slide.right <= frame.right + 1
    if (!visible) api?.goTo(selectedIndex)
  }, [api, selectedIndex, vertical])

  const context = React.useMemo<CarouselThumbsContextValue>(
    () => ({ selectedIndex, select: scrollTo, light }),
    [selectedIndex, scrollTo, light],
  )

  return (
    <CarouselThumbsContext.Provider value={context}>
      <Carousel
        orientation={orientation}
        align="start"
        // One snap per thumbnail even when several share a view, so a snap index
        // means the same thing on both carousels.
        containScroll="keepSnaps"
        options={CAROUSEL_THUMB_OPTIONS}
        accessibility={false}
        setApi={setApi}
        light={light}
        role="group"
        aria-roledescription={undefined}
        aria-label="Choose slide to display"
        data-slot="carousel-thumbs"
        className={cn(vertical ? 'shrink-0' : 'w-full', className)}
        {...rest}
      >
        <CarouselContent
          viewportProps={{
            // Bleed, given back as padding, so focus rings aren't clipped.
            className: cn('-m-0.5 p-0.5', vertical && 'h-[calc(100%+(--spacing(1)))]'),
          }}
          // The track must stay unpositioned: Embla measures it and its slides
          // with `offsetLeft`, so they have to share an offset parent.
          className={cn('gap-2', vertical ? 'mt-0' : 'ms-0')}
        >
          {React.Children.map(children, (child, index) => (
            <CarouselThumbIndexContext.Provider value={index}>{child}</CarouselThumbIndexContext.Provider>
          ))}

          {box ? (
            <span
              aria-hidden="true"
              data-slot="carousel-thumbs-indicator"
              className={cn(
                // Anchored to the track by its transform, so it rides the scroll.
                'pointer-events-none absolute top-0 left-0 rounded-lg border',
                light ? 'border-white' : 'border-border-inverse',
                'motion-safe:transition-[translate,width,height] motion-safe:duration-250',
              )}
              style={{ translate: `${box.x}px ${box.y}px`, width: box.width, height: box.height }}
            />
          ) : null}
        </CarouselContent>
      </Carousel>
    </CarouselThumbsContext.Provider>
  )
}

interface CarouselThumbProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Slide this thumbnail selects. Defaults to its position among the thumbnails. */
  index?: number
}

function CarouselThumb({ index: indexProp, className, children, onClick, ...rest }: CarouselThumbProps) {
  const { selectedIndex, select, light } = useCarouselThumbs()
  const position = React.useContext(CarouselThumbIndexContext)
  const index = indexProp ?? position
  const active = index === selectedIndex

  return (
    <button
      type="button"
      aria-label={`Go to slide ${index + 1}`}
      {...rest}
      data-slot="carousel-thumb"
      data-active={active || undefined}
      aria-current={active ? 'true' : undefined}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) select(index)
      }}
      className={cn(
        'block w-18 shrink-0 grow-0 transform-gpu cursor-pointer rounded-lg border p-1',
        light ? 'outline-ring-light border-white/25 bg-white/10 backdrop-blur-md' : 'bg-background outline-ring',
        'focus-visible:outline-2',
        CAROUSEL_THUMB_TRANSITION,
        'active:translate-y-px active:scale-[0.97]',
        !active && 'opacity-65 hover:opacity-100',
        className,
      )}
    >
      <span
        data-slot="carousel-thumb-media"
        className={cn(
          'relative block aspect-square w-full overflow-hidden rounded-md',
          light ? 'bg-white/10' : 'bg-background-muted',
        )}
      >
        {children}
      </span>
    </button>
  )
}

type CarouselButtonState = { disabled: boolean; direction: 'prev' | 'next' }

type CarouselNavPosition = 'inside' | 'outside' | 'outside-half' | 'none'

const PREV_POSITION_CLASSES: Record<CarouselNavPosition, string> = {
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

const NEXT_POSITION_CLASSES: Record<CarouselNavPosition, string> = {
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

interface CarouselPrevProps extends useRender.ComponentProps<'button', CarouselButtonState> {
  position?: CarouselNavPosition
  disabled?: boolean
}

function CarouselPrev({ className, position = 'inside', disabled: disabledProp, render, ...props }: CarouselPrevProps) {
  const { scrollPrev, canScrollPrev, orientation } = useCarousel()
  const disabled = (disabledProp ?? false) || !canScrollPrev
  const state: CarouselButtonState = { disabled, direction: 'prev' }

  const trigger = useRender({
    defaultTagName: 'button',
    render,
    state,
    props: mergeProps<'button'>(
      {
        type: 'button',
        'data-slot': 'carousel-prev',
        'data-disabled': disabled || undefined,
        'aria-disabled': disabled || undefined,
        'aria-label': 'Previous slide',
        onClick: disabled ? undefined : scrollPrev,
        suppressHydrationWarning: true,
      } as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>,
      props,
    ),
  })

  return (
    <div
      data-slot="carousel-prev-positioner"
      data-orientation={orientation}
      className={cn(PREV_POSITION_CLASSES[position], className)}
      suppressHydrationWarning
    >
      {trigger}
    </div>
  )
}

interface CarouselNextProps extends useRender.ComponentProps<'button', CarouselButtonState> {
  position?: CarouselNavPosition
  disabled?: boolean
}

function CarouselNext({ className, position = 'inside', disabled: disabledProp, render, ...props }: CarouselNextProps) {
  const { scrollNext, canScrollNext, orientation } = useCarousel()
  const disabled = (disabledProp ?? false) || !canScrollNext
  const state: CarouselButtonState = { disabled, direction: 'next' }

  const trigger = useRender({
    defaultTagName: 'button',
    render,
    state,
    props: mergeProps<'button'>(
      {
        type: 'button',
        'data-slot': 'carousel-next',
        'data-disabled': disabled || undefined,
        'aria-disabled': disabled || undefined,
        'aria-label': 'Next slide',
        onClick: disabled ? undefined : scrollNext,
        suppressHydrationWarning: true,
      } as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>,
      props,
    ),
  })

  return (
    <div
      data-slot="carousel-next-positioner"
      data-orientation={orientation}
      className={cn(NEXT_POSITION_CLASSES[position], className)}
      suppressHydrationWarning
    >
      {trigger}
    </div>
  )
}

interface CarouselPaginationProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Lay the bullets out in a row or a column.
   * @default 'horizontal'
   */
  orientation?: CarouselOrientation
  /**
   * Light-on-dark styling for use over imagery.
   * @default false
   */
  light?: boolean
}

function CarouselPagination({
  className,
  orientation = 'horizontal',
  light: lightProp,
  ...rest
}: CarouselPaginationProps) {
  const { scrollSnaps, selectedIndex, scrollTo, autoplay, reducedMotion, light: ctxLight } = useCarousel()
  const light = lightProp ?? ctxLight

  if (scrollSnaps.length <= 1) return null
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      data-slot="carousel-pagination"
      data-orientation={orientation}
      role="group"
      aria-label="Choose slide to display"
      className={cn('flex gap-2 data-[orientation=vertical]:flex-col', className)}
      {...rest}
    >
      {scrollSnaps.map((_, index) => {
        const isActive = index === selectedIndex
        const renderAutoplay = isActive && autoplay !== null && autoplay.isPlaying && !reducedMotion
        return (
          <button
            key={index}
            type="button"
            aria-current={isActive ? 'true' : undefined}
            aria-label={`Go to slide ${index + 1}`}
            data-slot="carousel-pagination-bullet"
            data-orientation={orientation}
            data-active={isActive || undefined}
            data-autoplay={renderAutoplay || undefined}
            onClick={() => scrollTo(index)}
            className={cn(
              'cursor-pointer rounded-full outline-offset-1',
              isHorizontal ? 'h-1.5' : 'w-1.5',
              light ? 'outline-ring-light' : 'outline-ring',
              'motion-safe:transition-[width,height,background-color] motion-safe:duration-300',
              !isActive && (light ? 'bg-white/25' : 'bg-border-strong'),
              !isActive && (isHorizontal ? 'w-1.5' : 'h-1.5'),
              isActive && !renderAutoplay && (light ? 'bg-white' : 'bg-primary'),
              isActive && !renderAutoplay && (isHorizontal ? 'w-5' : 'h-5'),
              renderAutoplay && 'relative overflow-hidden',
              renderAutoplay && (light ? 'bg-white/25' : 'bg-border-strong'),
              renderAutoplay && (isHorizontal ? 'w-10' : 'h-10'),
            )}
          >
            {renderAutoplay && autoplay ? (
              <CarouselAutoplayIndicator
                key={autoplay.cycleId}
                delay={autoplay.delay}
                isPlaying={autoplay.isPlaying}
                light={light}
                orientation={orientation}
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

// The bar slides in under its parent's `overflow-hidden` instead of growing, so
// the countdown never triggers layout.
const AUTOPLAY_INDICATOR_TRAVEL: Record<CarouselOrientation, { start: string; end: string }> = {
  horizontal: { start: '-translate-x-full rtl:translate-x-full', end: 'translate-x-0' },
  vertical: { start: '-translate-y-full', end: 'translate-y-0' },
}

interface CarouselAutoplayIndicatorProps {
  delay: number
  isPlaying: boolean
  light: boolean
  orientation: CarouselOrientation
}

function CarouselAutoplayIndicator({ delay, isPlaying, light, orientation }: CarouselAutoplayIndicatorProps) {
  const [armed, setArmed] = React.useState(false)

  React.useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setArmed(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  const travel = AUTOPLAY_INDICATOR_TRAVEL[orientation]

  return (
    <span
      aria-hidden="true"
      data-slot="carousel-pagination-indicator"
      data-orientation={orientation}
      data-playing={isPlaying || undefined}
      className={cn(
        'absolute inset-0 rounded-full',
        'motion-safe:transition-[translate] motion-safe:ease-linear',
        armed && isPlaying ? travel.end : travel.start,
        light ? 'bg-white' : 'bg-primary',
      )}
      style={{ transitionDuration: `${delay}ms` }}
    />
  )
}

interface CarouselProgressProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * What drives the fill. `'auto'` counts down autoplay while it plays, otherwise tracks scroll position.
   * @default 'auto'
   */
  source?: 'auto' | 'autoplay' | 'scroll'
  /**
   * Straight bar or circular ring.
   * @default 'bar'
   */
  variant?: 'bar' | 'circular'
  /**
   * Fill direction for the bar variant.
   * @default 'horizontal'
   */
  orientation?: CarouselOrientation
  /**
   * Light-on-dark styling for use over imagery.
   * @default false
   */
  light?: boolean
}

const CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX = 40
const CAROUSEL_PROGRESS_CIRCULAR_THICKNESS = 4
const CAROUSEL_PROGRESS_CIRCULAR_RADIUS =
  (CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX - CAROUSEL_PROGRESS_CIRCULAR_THICKNESS) / 2
const CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE = 2 * Math.PI * CAROUSEL_PROGRESS_CIRCULAR_RADIUS

function CarouselProgress({
  source = 'auto',
  variant = 'bar',
  orientation = 'horizontal',
  light: lightProp,
  className,
  ...rest
}: CarouselProgressProps) {
  const { subscribeScrollProgress, getScrollProgress, autoplay, reducedMotion, light: ctxLight } = useCarousel()
  const scrollProgress = React.useSyncExternalStore(subscribeScrollProgress, getScrollProgress, getScrollProgress)
  const light = lightProp ?? ctxLight
  const resolvedSource = source === 'auto' ? (autoplay && autoplay.isPlaying ? 'autoplay' : 'scroll') : source
  const showAutoplay = resolvedSource === 'autoplay' && autoplay !== null && !reducedMotion

  if (variant === 'circular') {
    const center = CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX / 2
    const offset = CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE * (1 - scrollProgress)
    return (
      <div
        data-slot="carousel-progress"
        data-variant="circular"
        data-source={resolvedSource}
        data-light={light || undefined}
        className={cn('relative size-10', className)}
        {...rest}
      >
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX} ${CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX}`}
          className="size-full -rotate-90 overflow-visible"
        >
          <circle
            data-slot="carousel-progress-track"
            cx={center}
            cy={center}
            r={CAROUSEL_PROGRESS_CIRCULAR_RADIUS}
            fill="none"
            strokeWidth={CAROUSEL_PROGRESS_CIRCULAR_THICKNESS}
            className={light ? 'stroke-white/25' : 'stroke-border-strong'}
          />
          {showAutoplay && autoplay ? (
            <CarouselAutoplayCircularIndicator
              key={autoplay.cycleId}
              delay={autoplay.delay}
              isPlaying={autoplay.isPlaying}
              light={light}
              center={center}
              radius={CAROUSEL_PROGRESS_CIRCULAR_RADIUS}
              circumference={CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE}
              thickness={CAROUSEL_PROGRESS_CIRCULAR_THICKNESS}
            />
          ) : (
            <circle
              data-slot="carousel-progress-indicator"
              cx={center}
              cy={center}
              r={CAROUSEL_PROGRESS_CIRCULAR_RADIUS}
              fill="none"
              strokeWidth={CAROUSEL_PROGRESS_CIRCULAR_THICKNESS}
              strokeLinecap="round"
              strokeDasharray={CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE}
              strokeDashoffset={offset}
              className={light ? 'stroke-white' : 'stroke-primary'}
            />
          )}
        </svg>
      </div>
    )
  }

  const isHorizontal = orientation === 'horizontal'
  return (
    <div
      data-slot="carousel-progress"
      data-variant="bar"
      data-orientation={orientation}
      data-source={resolvedSource}
      data-light={light || undefined}
      className={cn(
        'relative overflow-hidden rounded-full',
        isHorizontal ? 'h-1.5 w-full' : 'h-full w-1.5',
        light ? 'bg-white/25' : 'bg-border-strong',
        className,
      )}
      {...rest}
    >
      {showAutoplay && autoplay ? (
        <CarouselAutoplayIndicator
          key={autoplay.cycleId}
          delay={autoplay.delay}
          isPlaying={autoplay.isPlaying}
          light={light}
          orientation={orientation}
        />
      ) : (
        <span
          aria-hidden="true"
          data-slot="carousel-progress-indicator"
          data-orientation={orientation}
          className={cn('block rounded-full', isHorizontal ? 'h-full' : 'w-full', light ? 'bg-white' : 'bg-primary')}
          style={isHorizontal ? { width: `${scrollProgress * 100}%` } : { height: `${scrollProgress * 100}%` }}
        />
      )}
    </div>
  )
}

interface CarouselAutoplayCircularIndicatorProps {
  delay: number
  isPlaying: boolean
  light: boolean
  center: number
  radius: number
  circumference: number
  thickness: number
}

function CarouselAutoplayCircularIndicator({
  delay,
  isPlaying,
  light,
  center,
  radius,
  circumference,
  thickness,
}: CarouselAutoplayCircularIndicatorProps) {
  const [armed, setArmed] = React.useState(false)

  React.useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setArmed(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  const offset = armed && isPlaying ? 0 : circumference

  return (
    <circle
      data-slot="carousel-progress-indicator"
      data-playing={isPlaying || undefined}
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      strokeWidth={thickness}
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={offset}
      className={cn(
        'motion-safe:transition-[stroke-dashoffset] motion-safe:ease-linear',
        light ? 'stroke-white' : 'stroke-primary',
      )}
      style={{ transitionDuration: `${delay}ms` }}
    />
  )
}

/**
 * Bidirectionally sync the selected snap between two carousels - the classic
 * "main + thumbnails" pattern. Wires `select` on each so navigating either
 * one drives the other. Both apis can be undefined initially (e.g. waiting on
 * `setApi`); the effect re-runs once both resolve.
 */
function useLinkedCarousels(mainApi: CarouselApi | undefined, thumbsApi: CarouselApi | undefined): void {
  React.useEffect(() => {
    if (!mainApi || !thumbsApi) return
    const syncThumbsFromMain = () => {
      thumbsApi.goTo(mainApi.selectedSnap())
    }
    const syncMainFromThumbs = () => {
      mainApi.goTo(thumbsApi.selectedSnap())
    }
    syncThumbsFromMain()
    mainApi.on('select', syncThumbsFromMain)
    thumbsApi.on('select', syncMainFromThumbs)
    return () => {
      mainApi.off('select', syncThumbsFromMain)
      thumbsApi.off('select', syncMainFromThumbs)
    }
  }, [mainApi, thumbsApi])
}

export {
  Carousel,
  CarouselContent,
  CarouselSlide,
  CarouselThumbs,
  CarouselThumb,
  CarouselPrev,
  CarouselNext,
  CarouselPagination,
  CarouselProgress,
  useCarousel,
  useLinkedCarousels,
}
export type {
  CarouselProps,
  CarouselContentProps,
  CarouselSlideProps,
  CarouselThumbsProps,
  CarouselThumbProps,
  CarouselPrevProps,
  CarouselNextProps,
  CarouselPaginationProps,
  CarouselProgressProps,
  CarouselApi,
  CarouselOptions,
  CarouselPlugin,
  CarouselAutoplayOptions,
  CarouselAutoScrollOptions,
  CarouselAutoHeightOptions,
  CarouselFadeOptions,
  CarouselClassNamesOptions,
  CarouselAccessibilityOptions,
  CarouselWheelGesturesOptions,
}
