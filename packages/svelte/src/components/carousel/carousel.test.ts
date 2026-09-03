import { tick } from 'svelte'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import type { CarouselApi } from './carousel-types'
import CarouselHost from './carousel.test-host.svelte'
import CarouselLinkedHost from './carousel.test-linked-host.svelte'
import CarouselContent from './carousel-content.svelte'
import CarouselThumb from './carousel-thumb.svelte'

interface StubApi {
  canGoToPrev: ReturnType<typeof vi.fn>
  canGoToNext: ReturnType<typeof vi.fn>
  goToPrev: ReturnType<typeof vi.fn>
  goToNext: ReturnType<typeof vi.fn>
  goTo: ReturnType<typeof vi.fn>
  selectedSnap: ReturnType<typeof vi.fn>
  snapList: ReturnType<typeof vi.fn>
  slideNodes: ReturnType<typeof vi.fn>
  slidesInView: ReturnType<typeof vi.fn>
  scrollProgress: ReturnType<typeof vi.fn>
  plugins: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  reInit: ReturnType<typeof vi.fn>
  rootNode: ReturnType<typeof vi.fn>
  containerNode: ReturnType<typeof vi.fn>
  snapIndex: ReturnType<typeof vi.fn>
  previousSnap: ReturnType<typeof vi.fn>
  createEvent: ReturnType<typeof vi.fn>
  internalEngine: ReturnType<typeof vi.fn>
  cloneEngine: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
}

const stubApi: StubApi = {
  canGoToPrev: vi.fn(() => false),
  canGoToNext: vi.fn(() => true),
  goToPrev: vi.fn(),
  goToNext: vi.fn(),
  goTo: vi.fn(),
  selectedSnap: vi.fn(() => 0),
  snapList: vi.fn(() => [0, 0.33, 0.66]),
  slideNodes: vi.fn(() => [] as HTMLElement[]),
  slidesInView: vi.fn(() => [0]),
  scrollProgress: vi.fn(() => 0),
  plugins: vi.fn(() => ({})),
  on: vi.fn(() => stubApi),
  off: vi.fn(() => stubApi),
  reInit: vi.fn(),
  rootNode: vi.fn(),
  containerNode: vi.fn(),
  snapIndex: vi.fn(),
  previousSnap: vi.fn(),
  createEvent: vi.fn(),
  internalEngine: vi.fn(),
  cloneEngine: vi.fn(),
  destroy: vi.fn(),
}

vi.mock('embla-carousel-svelte', () => ({
  default: vi.fn((node?: HTMLElement) => {
    if (node && typeof node.dispatchEvent === 'function') {
      node.dispatchEvent(new CustomEvent('emblainit', { detail: stubApi }))
    }
    return { destroy: vi.fn(), update: vi.fn() }
  }),
}))

vi.mock('embla-carousel-accessibility', () => ({
  default: () => ({ name: 'accessibility', options: {}, init: () => {} }),
}))
vi.mock('embla-carousel-autoplay', () => ({
  default: () => ({ name: 'autoplay', options: {}, init: () => {} }),
}))
vi.mock('embla-carousel-auto-scroll', () => ({
  default: () => ({ name: 'autoScroll', options: {}, init: () => {} }),
}))
vi.mock('embla-carousel-auto-height', () => ({
  default: () => ({ name: 'autoHeight', options: {}, init: () => {} }),
}))
vi.mock('embla-carousel-class-names', () => ({
  default: () => ({ name: 'classNames', options: {}, init: () => {} }),
}))
vi.mock('embla-carousel-fade', () => ({
  default: () => ({ name: 'fade', options: {}, init: () => {} }),
}))
vi.mock('embla-carousel-wheel-gestures', () => ({
  WheelGesturesPlugin: () => ({ name: 'wheelGestures', options: {}, init: () => {} }),
}))

import emblaCarouselSvelte from 'embla-carousel-svelte'

const emblaMock = emblaCarouselSvelte as unknown as ReturnType<typeof vi.fn>

function lastEmblaOptions() {
  return emblaMock.mock.calls.at(-1)?.[1]?.options as Record<string, unknown> | undefined
}

function fireEmbla(event: string) {
  for (const [name, handler] of stubApi.on.mock.calls) {
    if (name === event && typeof handler === 'function') handler()
  }
}

beforeEach(() => {
  stubApi.canGoToPrev.mockReturnValue(false)
  stubApi.canGoToNext.mockReturnValue(true)
  stubApi.selectedSnap.mockReturnValue(0)
  stubApi.snapList.mockReturnValue([0, 0.33, 0.66])
  stubApi.slidesInView.mockReturnValue([0])
  stubApi.scrollProgress.mockReturnValue(0)
  stubApi.plugins.mockReturnValue({})
  stubApi.slideNodes.mockReturnValue([])
  stubApi.containerNode.mockReturnValue(undefined)
  stubApi.on.mockClear()
  stubApi.off.mockClear()
  stubApi.goTo.mockClear()
  stubApi.goToNext.mockClear()
  stubApi.goToPrev.mockClear()
  emblaMock.mockClear()
})

describe('Carousel', () => {
  it('renders the root region with carousel data-slot and orientation', () => {
    const { container } = render(CarouselHost)
    const root = container.querySelector('[data-slot="carousel"]') as HTMLElement
    expect(root).not.toBeNull()
    expect(root.getAttribute('data-orientation')).toBe('horizontal')
    expect(root.getAttribute('role')).toBe('region')
    expect(root.getAttribute('aria-roledescription')).toBe('carousel')
    expect(root.getAttribute('aria-label')).toBe('Carousel')
  })

  it('uses a custom aria-label when provided', () => {
    const { container } = render(CarouselHost, { props: { 'aria-label': 'Gallery' } })
    expect(container.querySelector('[data-slot="carousel"]')?.getAttribute('aria-label')).toBe('Gallery')
  })

  it('renders viewport + content + slides with the expected data-slots and roles', () => {
    const { container } = render(CarouselHost)
    expect(container.querySelector('[data-slot="carousel-viewport"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="carousel-content"]')).not.toBeNull()
    const slides = container.querySelectorAll('[data-slot="carousel-slide"]')
    expect(slides).toHaveLength(4)
    slides.forEach((s) => {
      expect(s.getAttribute('role')).toBe('group')
      expect(s.getAttribute('aria-roledescription')).toBe('slide')
    })
  })

  it('forwards class to the inner track (content)', () => {
    const { container } = render(CarouselHost, { props: { contentClass: 'track-cls' } })
    expect(container.querySelector('[data-slot="carousel-content"]')?.className).toContain('track-cls')
  })

  it('switches axis class on vertical orientation', () => {
    const { container } = render(CarouselHost, { props: { orientation: 'vertical' } })
    expect(container.querySelector('[data-slot="carousel"]')?.getAttribute('data-orientation')).toBe('vertical')
    expect(container.querySelector('[data-slot="carousel-content"]')?.getAttribute('data-orientation')).toBe(
      'vertical',
    )
  })

  it('forwards class on the root and other elements', () => {
    const { container } = render(CarouselHost, {
      props: { class: 'root-cls', contentClass: 'content-cls', slideClass: 'slide-cls', paginationClass: 'pagination-cls' },
    })
    expect(container.querySelector('[data-slot="carousel"]')?.className).toContain('root-cls')
    expect(container.querySelector('[data-slot="carousel-content"]')?.className).toContain('content-cls')
    expect(container.querySelector('[data-slot="carousel-slide"]')?.className).toContain('slide-cls')
    expect(container.querySelector('[data-slot="carousel-pagination"]')?.className).toContain('pagination-cls')
  })
})

describe('CarouselPrev / CarouselNext', () => {
  it('renders as buttons with the right data-slot and aria-label', () => {
    render(CarouselHost)
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(prev.tagName).toBe('BUTTON')
    expect(prev.getAttribute('data-slot')).toBe('carousel-prev')
    expect(next.getAttribute('data-slot')).toBe('carousel-next')
  })

  it('applies position="inside" classes to the outer wrapper, not the trigger', () => {
    const { container } = render(CarouselHost)
    const wrapper = container.querySelector('[data-slot="carousel-prev-positioner"]') as HTMLElement
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    expect(wrapper.className).toContain('absolute')
    expect(prev.className).not.toContain('absolute')
  })

  it('does not apply absolute positioning when position="none"', () => {
    const { container } = render(CarouselHost, { props: { prevPosition: 'none', nextPosition: 'none' } })
    const wrapper = container.querySelector('[data-slot="carousel-prev-positioner"]') as HTMLElement
    expect(wrapper.className).not.toContain('absolute')
  })

  it('forwards class to the outer positioner, not the inner trigger', () => {
    const { container } = render(CarouselHost, { props: { prevClass: 'prev-wrapper-cls' } })
    const wrapper = container.querySelector('[data-slot="carousel-prev-positioner"]') as HTMLElement
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    expect(wrapper.className).toContain('prev-wrapper-cls')
    expect(prev.className).not.toContain('prev-wrapper-cls')
  })

  it('disables prev when canGoToPrev() reports false', () => {
    render(CarouselHost)
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    expect(prev).toBeDisabled()
    expect(prev.getAttribute('data-disabled')).not.toBeNull()
  })

  it('honors a consumer-supplied disabled prop on next', () => {
    render(CarouselHost, { props: { nextDisabled: true } })
    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(next).toBeDisabled()
  })

  it('calls api.goToNext when next is clicked', async () => {
    const user = userEvent.setup()
    render(CarouselHost)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(stubApi.goToNext).toHaveBeenCalled()
  })

  it('fires the consumer onclick alongside the internal scroll handler', async () => {
    const user = userEvent.setup()
    const nextOnclick = vi.fn()
    render(CarouselHost, { props: { nextOnclick } })
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(nextOnclick).toHaveBeenCalled()
  })
})

describe('CarouselPagination', () => {
  it('renders a bullet per snap and marks the first as active', () => {
    render(CarouselHost)
    const pagination = screen.getByRole('group', { name: 'Choose slide to display' })
    const bullets = pagination.querySelectorAll('[data-slot="carousel-pagination-bullet"]')
    expect(bullets).toHaveLength(3)
    const active = pagination.querySelector('[data-active]') as HTMLElement
    expect(active).not.toBeNull()
    expect(active.getAttribute('aria-current')).toBe('true')
  })

  it('applies the light variant when light is true', () => {
    const { container } = render(CarouselHost, { props: { paginationLight: true } })
    const bullet = container.querySelector('[data-slot="carousel-pagination-bullet"]') as HTMLElement
    expect(bullet.className).toMatch(/bg-white/)
  })

  it('navigates to the clicked snap', async () => {
    const user = userEvent.setup()
    render(CarouselHost)
    const bullets = screen
      .getByRole('group', { name: 'Choose slide to display' })
      .querySelectorAll('[data-slot="carousel-pagination-bullet"]')
    await user.click(bullets[2] as HTMLElement)
    expect(stubApi.goTo).toHaveBeenCalledWith(2)
  })

  it('renders nothing when there is only one snap', () => {
    stubApi.snapList.mockReturnValue([0])
    render(CarouselHost)
    expect(screen.queryByRole('group', { name: 'Choose slide to display' })).toBeNull()
  })
})

describe('CarouselThumbs / CarouselThumb', () => {
  it('renders a labeled rail of thumbnails, one per slide', () => {
    const { container } = render(CarouselHost, { props: { showThumbs: true, showPagination: false } })
    const rail = container.querySelector('[data-slot="carousel-thumbs"]') as HTMLElement
    expect(rail).not.toBeNull()
    expect(rail.getAttribute('role')).toBe('group')
    expect(rail.getAttribute('aria-label')).toBe('Choose slide to display')
    expect(rail.getAttribute('aria-roledescription')).toBeNull()
    expect(rail.querySelectorAll('[data-slot="carousel-thumb"]')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toBeInTheDocument()
  })

  it('marks the thumbnail of the selected slide as current', () => {
    const { container } = render(CarouselHost, { props: { showThumbs: true, showPagination: false } })
    const thumbs = container.querySelectorAll('[data-slot="carousel-thumb"]')
    expect(thumbs[0]).toHaveAttribute('data-active')
    expect(thumbs[0]).toHaveAttribute('aria-current', 'true')
    expect(thumbs[1]).not.toHaveAttribute('data-active')
  })

  it('navigates the carousel to the clicked thumbnail', async () => {
    const user = userEvent.setup()
    render(CarouselHost, { props: { showThumbs: true, showPagination: false } })
    await user.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    expect(stubApi.goTo).toHaveBeenCalledWith(2)
  })

  it('honors an explicit index over the thumbnail position', async () => {
    const user = userEvent.setup()
    render(CarouselHost, { props: { showThumbs: true, showPagination: false, thumbIndex: 5 } })
    await user.click(screen.getByRole('button', { name: 'Go to slide 6' }))
    expect(stubApi.goTo).toHaveBeenCalledWith(5)
  })

  it('fires the consumer onclick alongside the internal navigation', async () => {
    const user = userEvent.setup()
    const thumbOnclick = vi.fn()
    render(CarouselHost, { props: { showThumbs: true, showPagination: false, thumbOnclick } })
    await user.click(screen.getByRole('button', { name: 'Go to slide 1' }))
    expect(thumbOnclick).toHaveBeenCalled()
    expect(stubApi.goTo).toHaveBeenCalledWith(0)
  })

  it('lays the rail out on the vertical axis when asked', () => {
    const { container } = render(CarouselHost, {
      props: { showThumbs: true, showPagination: false, thumbsOrientation: 'vertical' },
    })
    const rail = container.querySelector('[data-slot="carousel-thumbs"]') as HTMLElement
    expect(rail.getAttribute('data-orientation')).toBe('vertical')
    const track = rail.querySelector('[data-slot="carousel-content"]') as HTMLElement
    expect(track.getAttribute('data-orientation')).toBe('vertical')
  })

  it('applies the light variant to the thumbnails and the indicator', () => {
    const { container } = render(CarouselHost, { props: { showThumbs: true, showPagination: false, thumbsLight: true } })
    const thumb = container.querySelector('[data-slot="carousel-thumb"]') as HTMLElement
    expect(thumb.className).toMatch(/border-white/)
  })

  it('draws the indicator over the selected thumbnail once the engine reports its slides', async () => {
    const { container } = render(CarouselHost, { props: { showThumbs: true, showPagination: false } })
    expect(container.querySelector('[data-slot="carousel-thumbs-indicator"]')).toBeNull()

    const rail = container.querySelector('[data-slot="carousel-thumbs"]') as HTMLElement
    const thumbs = Array.from(rail.querySelectorAll<HTMLElement>('[data-slot="carousel-thumb"]'))
    stubApi.slideNodes.mockReturnValue(thumbs)
    stubApi.containerNode.mockReturnValue(rail.querySelector('[data-slot="carousel-content"]'))
    fireEmbla('reinit')
    await tick()

    const indicator = container.querySelector('[data-slot="carousel-thumbs-indicator"]') as HTMLElement
    expect(indicator).not.toBeNull()
    expect(indicator.style.translate).toBe('0px 0px')
  })

  it('excludes the indicator from the rail snap count', () => {
    render(CarouselHost, { props: { showThumbs: true, showPagination: false } })
    expect(lastEmblaOptions()?.slides).toBe(':scope > [data-slot=carousel-thumb]')
    expect(lastEmblaOptions()?.containScroll).toBe('keepSnaps')
  })

  it('throws when a thumbnail is used outside CarouselThumbs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(CarouselThumb)).toThrow(/CarouselThumb/)
    spy.mockRestore()
  })
})

describe('CarouselProgress', () => {
  it('renders a progress bar with data-source="scroll" when no autoplay', () => {
    const { container } = render(CarouselHost, { props: { showProgress: true, showPagination: false } })
    const progress = container.querySelector('[data-slot="carousel-progress"]') as HTMLElement
    expect(progress.getAttribute('data-source')).toBe('scroll')
    expect(progress.querySelector('[data-slot="carousel-progress-indicator"]')).not.toBeNull()
  })
})

describe('useCarousel + lifecycle', () => {
  it('throws when sub-components are used outside <Carousel>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(CarouselContent)).toThrow(/Carousel sub-components must be rendered inside <Carousel>/)
    spy.mockRestore()
  })

  it('exposes the Embla api to descendants via useCarousel()', () => {
    let captured: CarouselApi | undefined
    render(CarouselHost, {
      props: {
        onApi: (api: CarouselApi | undefined) => {
          captured = api
        },
      },
    })
    expect(captured).toBeDefined()
    expect(captured?.goToNext).toBe(stubApi.goToNext)
  })

  it('invokes onReInit after init with the Embla api', () => {
    const onReInit = vi.fn()
    render(CarouselHost, { props: { onReInit } })
    expect(onReInit).toHaveBeenCalledWith(stubApi)
  })

  it('invokes setApi once with the Embla api after init', () => {
    const setApi = vi.fn()
    render(CarouselHost, { props: { setApi } })
    expect(setApi).toHaveBeenCalledTimes(1)
    expect(setApi).toHaveBeenCalledWith(stubApi)
  })

  it('subscribes to v9 lowercase events including select, scroll, slideschanged, slidesinview, reinit', () => {
    render(CarouselHost)
    const subscribed = stubApi.on.mock.calls.map((c: unknown[]) => c[0])
    expect(subscribed).toEqual(expect.arrayContaining(['reinit', 'select', 'scroll', 'slidesinview', 'slideschanged']))
  })

  it('does not re-run the sync effect when re-rendered with a new-but-equal autoplay object', () => {
    const { rerender } = render(CarouselHost, { props: { autoplay: { delay: 3000 } } })
    const initialOnCalls = stubApi.on.mock.calls.length
    expect(initialOnCalls).toBeGreaterThan(0)

    rerender({ autoplay: { delay: 3000 } })
    expect(stubApi.on.mock.calls.length).toBe(initialOnCalls)
  })
})

describe('useLinkedCarousels', () => {
  function makeApi() {
    const stub = {
      selectedSnap: vi.fn(() => 0),
      goTo: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }
    stub.on.mockImplementation(() => stub)
    stub.off.mockImplementation(() => stub)
    return stub
  }

  it('subscribes select on both apis and pushes initial main to thumbs sync', () => {
    const mainApi = makeApi()
    const thumbsApi = makeApi()
    mainApi.selectedSnap.mockReturnValue(2)
    render(CarouselLinkedHost, {
      props: { mainApi: mainApi as unknown as CarouselApi, thumbsApi: thumbsApi as unknown as CarouselApi },
    })
    expect(mainApi.on).toHaveBeenCalledWith('select', expect.any(Function))
    expect(thumbsApi.on).toHaveBeenCalledWith('select', expect.any(Function))
    expect(thumbsApi.goTo).toHaveBeenCalledWith(2)
  })

  it('main select handler navigates thumbs to the new index', () => {
    const mainApi = makeApi()
    const thumbsApi = makeApi()
    render(CarouselLinkedHost, {
      props: { mainApi: mainApi as unknown as CarouselApi, thumbsApi: thumbsApi as unknown as CarouselApi },
    })
    const mainSelect = mainApi.on.mock.calls.find((c) => c[0] === 'select')?.[1] as () => void
    thumbsApi.goTo.mockClear()
    mainApi.selectedSnap.mockReturnValue(3)
    mainSelect()
    expect(thumbsApi.goTo).toHaveBeenCalledWith(3)
  })

  it('thumbs select handler navigates main to the new index', () => {
    const mainApi = makeApi()
    const thumbsApi = makeApi()
    render(CarouselLinkedHost, {
      props: { mainApi: mainApi as unknown as CarouselApi, thumbsApi: thumbsApi as unknown as CarouselApi },
    })
    const thumbsSelect = thumbsApi.on.mock.calls.find((c) => c[0] === 'select')?.[1] as () => void
    mainApi.goTo.mockClear()
    thumbsApi.selectedSnap.mockReturnValue(1)
    thumbsSelect()
    expect(mainApi.goTo).toHaveBeenCalledWith(1)
  })

  it('unsubscribes from both apis on unmount', () => {
    const mainApi = makeApi()
    const thumbsApi = makeApi()
    const { unmount } = render(CarouselLinkedHost, {
      props: { mainApi: mainApi as unknown as CarouselApi, thumbsApi: thumbsApi as unknown as CarouselApi },
    })
    unmount()
    expect(mainApi.off).toHaveBeenCalledWith('select', expect.any(Function))
    expect(thumbsApi.off).toHaveBeenCalledWith('select', expect.any(Function))
  })

  it('is a no-op when either api is undefined', () => {
    const mainApi = makeApi()
    render(CarouselLinkedHost, { props: { mainApi: mainApi as unknown as CarouselApi } })
    expect(mainApi.on).not.toHaveBeenCalled()
  })
})

describe('a11y', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(CarouselHost)
    const results = await axe(container)
    expect(results.violations.map((v) => v.id)).toEqual([])
  }, 15_000)

  it('has no accessibility violations with a thumbnail rail', async () => {
    const { container } = render(CarouselHost, { props: { showThumbs: true, showPagination: false } })
    const results = await axe(container)
    expect(results.violations.map((v) => v.id)).toEqual([])
  }, 15_000)
})
