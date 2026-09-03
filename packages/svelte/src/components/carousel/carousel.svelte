<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type {
    CarouselAccessibilityOptions,
    CarouselApi,
    CarouselAutoplayOptions,
    CarouselAutoScrollOptions,
    CarouselAutoHeightOptions,
    CarouselClassNamesOptions,
    CarouselFadeOptions,
    CarouselOptions,
    CarouselOrientation,
    CarouselPlugin,
    CarouselWheelGesturesOptions,
  } from './carousel-types'

  export type CarouselProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
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
    /** Release snap points; glide to a momentum stop. */
    dragFree?: boolean
    /** Index of the slide to start on. */
    startSnap?: number
    /**
     * When `false`, the engine is inert (no drag/snap) - e.g. to disable at a breakpoint.
     * @default true
     */
    active?: boolean
    /**
     * Whether pointer dragging is enabled (Embla's `watchDrag`).
     * @default true
     */
    draggable?: boolean
    /** Scroll animation duration (Embla's ease). Forced to `0` under reduced motion. */
    duration?: number
    /** Escape hatch: a raw Embla options object, merged last so it wins over the flat props. */
    options?: CarouselOptions
    /** Enable the Autoplay plugin. `resumeAfter` (ms) restarts the timer after user interaction. */
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
     * Keyboard/ARIA plugin for the viewport. Set `false` to opt out.
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
    children?: Snippet
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import Accessibility from 'embla-carousel-accessibility'
  import AutoHeight from 'embla-carousel-auto-height'
  import AutoScroll from 'embla-carousel-auto-scroll'
  import Autoplay from 'embla-carousel-autoplay'
  import ClassNames from 'embla-carousel-class-names'
  import Fade from 'embla-carousel-fade'
  import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
  import { useDirection } from '../../hooks/use-direction/use-direction'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { cn } from '../../internal/utils'
  import { setCarouselContext } from './carousel-context'
  import type { CarouselAutoplayState, CarouselPlugin as Plugin } from './carousel-types'

  let {
    class: className,
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
    children,
    ...rest
  }: CarouselProps = $props()

  const direction = useDirection()
  const reducedMotion = useReducedMotion()

  const autoplayEnabled = $derived(Boolean(autoplay))
  const autoScrollEnabled = $derived(Boolean(autoScroll))
  const isAutoHeight = $derived(Boolean(autoHeight))

  const resumeAfterMs = $derived(
    (typeof autoplay === 'object' && typeof autoplay.resumeAfter === 'number' && autoplay.resumeAfter) ||
      (typeof autoScroll === 'object' && typeof autoScroll.resumeAfter === 'number' && autoScroll.resumeAfter) ||
      0,
  )

  let warnedMutualExclusive = false
  $effect(() => {
    if (autoplayEnabled && autoScrollEnabled && !warnedMutualExclusive) {
      warnedMutualExclusive = true
      console.warn('[Carousel] `autoplay` and `autoScroll` are mutually exclusive - preferring `autoplay`.')
    }
  })

  const plugins = $derived.by((): Plugin[] => {
    const list: Plugin[] = []
    if (accessibility !== false) {
      list.push(Accessibility(typeof accessibility === 'object' ? accessibility : undefined))
    }
    if (wheelGestures !== false) {
      list.push(WheelGesturesPlugin(typeof wheelGestures === 'object' ? wheelGestures : undefined))
    }
    if (autoplay) {
      const opts = typeof autoplay === 'object' ? autoplay : undefined
      const { resumeAfter: _resumeAfter, ...emblaOpts } = opts ?? {}
      const autoResume = typeof opts?.resumeAfter === 'number' && opts.resumeAfter > 0
      list.push(Autoplay(autoResume ? { ...emblaOpts, defaultInteraction: false } : emblaOpts))
    } else if (autoScroll && !reducedMotion.current) {
      const opts = typeof autoScroll === 'object' ? autoScroll : undefined
      const { resumeAfter: _resumeAfter, ...emblaOpts } = opts ?? {}
      const autoResume = typeof opts?.resumeAfter === 'number' && opts.resumeAfter > 0
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
  })

  const emblaOptions = $derived.by(() => {
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
    if (orientation === 'horizontal') merged.direction = direction.current
    if (reducedMotion.current) merged.duration = 0
    return { ...merged, ...options }
  })

  let emblaApi = $state<CarouselApi | undefined>(undefined)
  let selectedIndex = $state(0)
  let scrollSnaps = $state<number[]>([])
  let canScrollPrev = $state(false)
  let canScrollNext = $state(false)
  let autoplayState = $state<CarouselAutoplayState | null>(null)

  let scrollProgress = 0
  const scrollListeners = new SvelteSet<() => void>()

  function subscribeScrollProgress(onChange: () => void) {
    scrollListeners.add(onChange)
    return () => {
      scrollListeners.delete(onChange)
    }
  }

  function getScrollProgress() {
    return scrollProgress
  }

  $effect(() => {
    const api = emblaApi
    if (!api || !reducedMotion.current) return
    const snapToTargetInstantly = () => {
      api.internalEngine().scrollBody.useDuration(0)
    }
    api.on('pointerup', snapToTargetInstantly)
    return () => {
      api.off('pointerup', snapToTargetInstantly)
    }
  })

  $effect(() => {
    const api = emblaApi
    const playAutoplay = autoplayEnabled
    const playAutoScroll = autoScrollEnabled
    const resumeAfter = resumeAfterMs
    if (!api) return

    const notifyScroll = () => {
      scrollProgress = api.scrollProgress()
      scrollListeners.forEach((cb) => cb())
    }
    const syncFull = () => {
      notifyScroll()
      selectedIndex = api.selectedSnap()
      scrollSnaps = api.snapList()
      canScrollPrev = api.canGoToPrev()
      canScrollNext = api.canGoToNext()
    }
    const syncSelection = () => {
      selectedIndex = api.selectedSnap()
      canScrollPrev = api.canGoToPrev()
      canScrollNext = api.canGoToNext()
    }

    syncFull()
    untrack(() => {
      setApi?.(api)
      onReInit?.(api)
    })

    const handleReInit = () => {
      const autoplayWasPlaying = api.plugins().autoplay?.isPlaying()
      const autoScrollWasPlaying = api.plugins().autoScroll?.isPlaying()
      syncFull()
      untrack(() => onReInit?.(api))
      if (playAutoplay && autoplayWasPlaying) api.plugins().autoplay?.play()
      else if (playAutoScroll && autoScrollWasPlaying) api.plugins().autoScroll?.play()
    }
    const handleSelect = () => {
      syncSelection()
      untrack(() => onSelect?.(api))
    }
    const handleScroll = () => {
      notifyScroll()
      untrack(() => onScroll?.(api))
    }

    const syncInView = () => {}
    api.on('reinit', handleReInit)
    api.on('select', handleSelect)
    api.on('scroll', handleScroll)
    api.on('slidesinview', syncInView)
    api.on('slideschanged', syncFull)

    const autoplayPlugin = api.plugins().autoplay
    const autoScrollPlugin = api.plugins().autoScroll

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

    let cleanupAutoplay: (() => void) | undefined
    if (autoplayPlugin) {
      const rawDelay = autoplayPlugin.options.delay
      const initialDelay = typeof rawDelay === 'number' ? rawDelay : 4000
      autoplayState = { delay: initialDelay, cycleId: 0, isPlaying: autoplayPlugin.isPlaying() }
      const onPlay = () => {
        clearResumeTimer()
        autoplayState = autoplayState ? { ...autoplayState, isPlaying: true } : autoplayState
      }
      const onStop = () => {
        autoplayState = autoplayState ? { ...autoplayState, isPlaying: false } : autoplayState
      }
      const onTimerSet = () => {
        autoplayState = autoplayState
          ? { ...autoplayState, cycleId: autoplayState.cycleId + 1, isPlaying: true }
          : autoplayState
      }
      const onTimerStopped = () => {
        autoplayState = autoplayState ? { ...autoplayState, isPlaying: false } : autoplayState
      }
      const resetOnSelect = () => autoplayPlugin.reset()
      const onInteraction = (_api: CarouselApi, event: { detail: { interaction: string } }) => {
        if (event.detail.interaction === 'pointerdown' || event.detail.interaction === 'slidefocus') {
          autoplayPlugin.stop()
          scheduleResume(() => api.plugins().autoplay?.play())
        }
      }
      api.on('autoplay:play', onPlay)
      api.on('autoplay:stop', onStop)
      api.on('autoplay:timerset', onTimerSet)
      api.on('autoplay:timerstopped', onTimerStopped)
      api.on('select', resetOnSelect)
      if (resumeAfter > 0) api.on('autoplay:interaction', onInteraction)
      if (playAutoplay) autoplayPlugin.play()
      cleanupAutoplay = () => {
        api.off('autoplay:play', onPlay)
        api.off('autoplay:stop', onStop)
        api.off('autoplay:timerset', onTimerSet)
        api.off('autoplay:timerstopped', onTimerStopped)
        api.off('select', resetOnSelect)
        if (resumeAfter > 0) api.off('autoplay:interaction', onInteraction)
      }
    } else {
      autoplayState = null
    }

    let cleanupAutoScroll: (() => void) | undefined
    if (autoScrollPlugin && playAutoScroll && !playAutoplay) {
      autoScrollPlugin.play()
      const onInteraction = (_api: CarouselApi, event: { detail: { interaction: string } }) => {
        if (event.detail.interaction === 'pointerdown' || event.detail.interaction === 'slidefocus') {
          autoScrollPlugin.stop()
          scheduleResume(() => api.plugins().autoScroll?.play())
        }
      }
      if (resumeAfter > 0) {
        api.on('autoscroll:interaction', onInteraction)
        cleanupAutoScroll = () => api.off('autoscroll:interaction', onInteraction)
      }
    }

    return () => {
      api.off('reinit', handleReInit)
      api.off('select', handleSelect)
      api.off('scroll', handleScroll)
      api.off('slidesinview', syncInView)
      api.off('slideschanged', syncFull)
      cleanupAutoplay?.()
      cleanupAutoScroll?.()
      clearResumeTimer()
    }
  })

  setCarouselContext({
    get api() {
      return emblaApi
    },
    setApi(next) {
      emblaApi = next
    },
    get options() {
      return emblaOptions
    },
    get plugins() {
      return plugins
    },
    get orientation() {
      return orientation
    },
    get direction() {
      return direction.current
    },
    get light() {
      return light
    },
    get autoHeight() {
      return isAutoHeight
    },
    get loop() {
      return loop
    },
    get reducedMotion() {
      return reducedMotion.current
    },
    get selectedIndex() {
      return selectedIndex
    },
    get scrollSnaps() {
      return scrollSnaps
    },
    get canScrollPrev() {
      return canScrollPrev
    },
    get canScrollNext() {
      return canScrollNext
    },
    subscribeScrollProgress,
    getScrollProgress,
    get autoplay() {
      return autoplayState
    },
    scrollPrev() {
      emblaApi?.goToPrev()
    },
    scrollNext() {
      emblaApi?.goToNext()
    },
    scrollTo(index) {
      emblaApi?.goTo(index)
    },
  })
</script>

<div
  data-slot="carousel"
  data-orientation={orientation}
  role="region"
  aria-roledescription="carousel"
  aria-label="Carousel"
  class={cn('relative', className)}
  {...rest}
>
  {@render children?.()}
</div>
