import * as React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { axe } from 'vitest-axe'

// Embla relies on real DOM measurement which jsdom can't provide. Mock the
// React adapter with a stub api so the component's own logic (context wiring,
// sub-component rendering, ARIA, plugin opt-in plumbing, callback refs) can be
// asserted without crashing in the layout engine. Embla's own behavior is
// covered upstream; here we test the React glue.
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

vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [vi.fn(), stubApi, stubApi]),
}))

// Plugin factories: each mock factory inlines its stub so vitest hoisting
// doesn't trip on a shared helper reference.
vi.mock('embla-carousel-accessibility', () => ({
  default: (options?: object) => ({ name: 'accessibility', options: options ?? {}, init: () => {} }),
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

// eslint-disable-next-line import/first
import {
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
  type CarouselApi,
  type CarouselOptions,
  type CarouselProps,
  type CarouselThumbsProps,
} from './carousel'

// eslint-disable-next-line import/first
import useEmblaCarousel from 'embla-carousel-react'

// eslint-disable-next-line import/first
import { renderHook } from '@testing-library/react'

// eslint-disable-next-line import/first
import { Button } from '../button/button'

// eslint-disable-next-line import/first
import { ReducedMotionProvider } from '../../providers/reduced-motion-provider'

/** Calls every handler still subscribed to an Embla event on the stub api. */
function dispatch(event: string, payload?: unknown) {
  const removed = new Set(stubApi.off.mock.calls.filter((c: unknown[]) => c[0] === event).map((c: unknown[]) => c[1]))
  stubApi.on.mock.calls
    .filter((c: unknown[]) => c[0] === event && !removed.has(c[1]))
    .forEach((c: unknown[]) => (c[1] as (api: StubApi, payload?: unknown) => void)(stubApi, payload))
}

function emit(event: string, payload?: unknown) {
  act(() => dispatch(event, payload))
}

function mockDomSlides() {
  stubApi.slideNodes.mockImplementation(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-slot="carousel-slide"]')),
  )
}

/** A stand-in for the Autoplay plugin that reports play and stop through the stub's events. */
function mockAutoplay() {
  let playing = false
  const autoplay = {
    options: { delay: 4000 },
    isPlaying: vi.fn(() => playing),
    play: vi.fn(() => {
      playing = true
      dispatch('autoplay:play')
    }),
    stop: vi.fn(() => {
      if (!playing) return
      playing = false
      dispatch('autoplay:stop')
    }),
    reset: vi.fn(),
  }
  stubApi.plugins.mockReturnValue({ autoplay })
  return autoplay
}

function Basic(props?: Partial<CarouselProps>) {
  return (
    <Carousel {...props}>
      <CarouselContent>
        <CarouselSlide>Slide 1</CarouselSlide>
        <CarouselSlide>Slide 2</CarouselSlide>
        <CarouselSlide>Slide 3</CarouselSlide>
        <CarouselSlide>Slide 4</CarouselSlide>
      </CarouselContent>
      <CarouselPrev />
      <CarouselNext />
      <CarouselPagination />
    </Carousel>
  )
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
  stubApi.rootNode.mockReturnValue(undefined)
  stubApi.internalEngine.mockReturnValue({
    options: { active: true, axis: 'x' },
    scrollSnapList: { slidesBySnap: [[0], [1], [2], [3]] },
  })
  stubApi.on.mockClear()
  stubApi.off.mockClear()
})

describe('Carousel', () => {
  it('renders an unlabeled root as a carousel group with no default name', () => {
    const { container } = render(<Basic />)
    const root = container.querySelector('[data-slot="carousel"]') as HTMLElement
    expect(root).not.toBeNull()
    expect(root.getAttribute('data-orientation')).toBe('horizontal')
    expect(root.getAttribute('role')).toBe('group')
    expect(root.getAttribute('aria-roledescription')).toBe('carousel')
    expect(root.hasAttribute('aria-label')).toBe(false)
  })

  it('becomes a region when labeled with aria-label', () => {
    render(<Basic aria-label="Gallery" />)
    expect(screen.getByRole('region', { name: 'Gallery' })).toHaveAttribute('data-slot', 'carousel')
  })

  it('becomes a region when labeled with aria-labelledby', () => {
    render(
      <>
        <h2 id="gallery-heading">New arrivals</h2>
        <Basic aria-labelledby="gallery-heading" />
      </>,
    )
    expect(screen.getByRole('region', { name: 'New arrivals' })).toHaveAttribute('data-slot', 'carousel')
  })

  it('lets a consumer role and roledescription win', () => {
    const { container } = render(<Basic role="presentation" aria-roledescription="gallery" />)
    const root = container.querySelector('[data-slot="carousel"]') as HTMLElement
    expect(root.getAttribute('role')).toBe('presentation')
    expect(root.getAttribute('aria-roledescription')).toBe('gallery')
  })

  it('merges a consumer ref with its own', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(<Basic {...({ ref } as Partial<CarouselProps>)} />)
    expect(ref.current).toBe(container.querySelector('[data-slot="carousel"]'))
  })

  it('leaves the viewport without a role or name, so each carousel is one landmark at most', () => {
    const { container } = render(<Basic aria-label="Gallery" />)
    const viewport = container.querySelector('[data-slot="carousel-viewport"]') as HTMLElement
    expect(viewport.hasAttribute('role')).toBe(false)
    expect(viewport.hasAttribute('aria-label')).toBe(false)
    const plugins = (useEmblaCarousel as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[1] as {
      name: string
    }[]
    expect(plugins.map((plugin) => plugin.name)).not.toContain('accessibility')
  })

  it('renders viewport + content + slides with the expected data-slots and roles', () => {
    const { container } = render(<Basic />)
    expect(container.querySelector('[data-slot="carousel-viewport"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="carousel-content"]')).not.toBeNull()
    const slides = container.querySelectorAll('[data-slot="carousel-slide"]')
    expect(slides).toHaveLength(4)
    slides.forEach((s) => {
      expect(s.getAttribute('role')).toBe('group')
      expect(s.getAttribute('aria-roledescription')).toBe('slide')
    })
  })

  it('forwards className to the inner track (content)', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent className="track-cls">
          <CarouselSlide>A</CarouselSlide>
          <CarouselSlide>B</CarouselSlide>
        </CarouselContent>
      </Carousel>,
    )
    expect(container.querySelector('[data-slot="carousel-content"]')?.className).toContain('track-cls')
  })

  it('switches axis class on vertical orientation', () => {
    const { container } = render(<Basic orientation="vertical" />)
    expect(container.querySelector('[data-slot="carousel"]')?.getAttribute('data-orientation')).toBe('vertical')
    expect(container.querySelector('[data-slot="carousel-content"]')?.getAttribute('data-orientation')).toBe('vertical')
  })

  it('claims touch drags along its own axis from a surrounding Drawer', () => {
    const { container: row } = render(<Basic />)
    expect(row.querySelector('[data-slot="carousel-viewport"]')).toHaveAttribute('data-base-ui-swipe-ignore', 'x')
    const { container: column } = render(<Basic orientation="vertical" />)
    expect(column.querySelector('[data-slot="carousel-viewport"]')).toHaveAttribute('data-base-ui-swipe-ignore', 'y')
  })

  it('forwards className on the root and other elements', () => {
    const { container } = render(
      <Carousel className="root-cls">
        <CarouselContent className="content-cls">
          <CarouselSlide className="slide-cls">A</CarouselSlide>
          <CarouselSlide>B</CarouselSlide>
        </CarouselContent>
        <CarouselPagination className="pagination-cls" />
      </Carousel>,
    )
    expect(container.querySelector('[data-slot="carousel"]')?.className).toContain('root-cls')
    expect(container.querySelector('[data-slot="carousel-content"]')?.className).toContain('content-cls')
    expect(container.querySelector('[data-slot="carousel-slide"]')?.className).toContain('slide-cls')
    expect(container.querySelector('[data-slot="carousel-pagination"]')?.className).toContain('pagination-cls')
  })
})

describe('Carousel slides', () => {
  function slides(container: HTMLElement) {
    return Array.from(container.querySelectorAll<HTMLElement>('[data-slot="carousel-slide"]'))
  }

  it('makes slides outside the viewport inert, and keeps the visible ones reachable', () => {
    mockDomSlides()
    stubApi.slidesInView.mockReturnValue([0, 1])
    const { container } = render(<Basic />)
    const [first, second, third, fourth] = slides(container)
    expect(first).not.toHaveAttribute('inert')
    expect(second).not.toHaveAttribute('inert')
    expect(third).toHaveAttribute('inert')
    expect(fourth).toHaveAttribute('inert')
    slides(container).forEach((slide) => expect(slide).not.toHaveAttribute('aria-hidden'))
  })

  it('labels each slide with its position', () => {
    mockDomSlides()
    const { container } = render(<Basic />)
    expect(slides(container).map((slide) => slide.getAttribute('aria-label'))).toEqual([
      '1 of 4',
      '2 of 4',
      '3 of 4',
      '4 of 4',
    ])
  })

  it('keeps a slide label or labelledby of its own', () => {
    mockDomSlides()
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide aria-label="Intro">A</CarouselSlide>
          <CarouselSlide aria-labelledby="slide-2-title">
            <h3 id="slide-2-title">Spring sale</h3>
          </CarouselSlide>
          <CarouselSlide>C</CarouselSlide>
        </CarouselContent>
      </Carousel>,
    )
    const [first, second, third] = slides(container)
    expect(first).toHaveAttribute('aria-label', 'Intro')
    expect(second).not.toHaveAttribute('aria-label')
    expect(third).toHaveAttribute('aria-label', '3 of 3')
  })

  it('updates as slides scroll into view', () => {
    mockDomSlides()
    stubApi.slidesInView.mockReturnValue([0])
    const { container } = render(<Basic />)
    expect(slides(container)[1]).toHaveAttribute('inert')
    stubApi.slidesInView.mockReturnValue([1, 2])
    emit('slidesinview')
    const [first, second, third] = slides(container)
    expect(first).toHaveAttribute('inert')
    expect(second).not.toHaveAttribute('inert')
    expect(third).not.toHaveAttribute('inert')
  })

  it('falls back to the selected snap until the engine reports slides in view', () => {
    mockDomSlides()
    stubApi.slidesInView.mockReturnValue([])
    stubApi.selectedSnap.mockReturnValue(2)
    const { container } = render(<Basic />)
    expect(slides(container).map((slide) => slide.hasAttribute('inert'))).toEqual([true, true, false, true])
  })

  it('follows the selected snap under fade, where every slide shares one place', () => {
    mockDomSlides()
    stubApi.plugins.mockReturnValue({ fade: {} })
    stubApi.slidesInView.mockReturnValue([0, 1, 2, 3])
    stubApi.selectedSnap.mockReturnValue(1)
    const { container } = render(<Basic fade />)
    expect(slides(container).map((slide) => slide.hasAttribute('inert'))).toEqual([true, false, true, true])
  })

  it('leaves every slide reachable while the engine is inactive', () => {
    mockDomSlides()
    stubApi.internalEngine.mockReturnValue({
      options: { active: false },
      scrollSnapList: { slidesBySnap: [[0], [1], [2], [3]] },
    })
    const { container } = render(<Basic active={false} />)
    slides(container).forEach((slide) => expect(slide).not.toHaveAttribute('inert'))
  })

  it('never makes the slide holding focus inert, and re-checks once focus leaves', () => {
    mockDomSlides()
    stubApi.rootNode.mockImplementation(() => document.querySelector('[data-slot="carousel-viewport"]'))
    stubApi.slidesInView.mockReturnValue([0, 1])
    render(
      <>
        <Carousel>
          <CarouselContent>
            <CarouselSlide>A</CarouselSlide>
            <CarouselSlide>
              <button type="button">Shop now</button>
            </CarouselSlide>
            <CarouselSlide>C</CarouselSlide>
          </CarouselContent>
        </Carousel>
        <button type="button">Outside</button>
      </>,
    )
    const cta = screen.getByRole('button', { name: 'Shop now' })
    const slide = cta.closest('[data-slot="carousel-slide"]') as HTMLElement
    act(() => cta.focus())

    stubApi.slidesInView.mockReturnValue([2])
    emit('select')
    expect(slide).not.toHaveAttribute('inert')
    expect(document.activeElement).toBe(cta)

    act(() => screen.getByRole('button', { name: 'Outside' }).focus())
    expect(slide).toHaveAttribute('inert')
  })

  it('removes what it set on unmount', () => {
    mockDomSlides()
    stubApi.slidesInView.mockReturnValue([0])
    const { container, unmount } = render(<Basic />)
    const nodes = slides(container)
    unmount()
    nodes.forEach((slide) => {
      expect(slide).not.toHaveAttribute('inert')
      expect(slide).not.toHaveAttribute('aria-label')
    })
  })

  it('leaves slides alone with accessibility={false}', () => {
    mockDomSlides()
    const { container } = render(<Basic accessibility={false} />)
    slides(container).forEach((slide) => {
      expect(slide).not.toHaveAttribute('inert')
      expect(slide).not.toHaveAttribute('aria-label')
    })
  })

  it('hands slides to the Embla plugin for an options object, still without naming the viewport', () => {
    mockDomSlides()
    const { container } = render(<Basic accessibility={{ slideRole: 'listitem', carouselAriaRoleDescription: 'x' }} />)
    slides(container).forEach((slide) => expect(slide).not.toHaveAttribute('inert'))
    const plugins = (useEmblaCarousel as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[1] as {
      name: string
      options: object
    }[]
    expect(plugins.find((plugin) => plugin.name === 'accessibility')?.options).toEqual({
      carouselRole: '',
      carouselAriaLabel: '',
      carouselAriaRoleDescription: 'x',
      slideRole: 'listitem',
    })
  })

  it('has no accessibility violations with off-screen slides inert', async () => {
    mockDomSlides()
    stubApi.slidesInView.mockReturnValue([0])
    const { container } = render(<Basic aria-label="Featured" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CarouselPrev / CarouselNext', () => {
  it('renders as buttons with the right data-slot and aria-label', () => {
    render(<Basic />)
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(prev.tagName).toBe('BUTTON')
    expect(prev.getAttribute('data-slot')).toBe('carousel-prev')
    expect(next.getAttribute('data-slot')).toBe('carousel-next')
  })

  it('applies position="inside" classes to the outer wrapper, not the trigger', () => {
    const { container } = render(<Basic />)
    const wrapper = container.querySelector('[data-slot="carousel-prev-positioner"]') as HTMLElement
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    expect(wrapper.className).toContain('absolute')
    expect(prev.className).not.toContain('absolute')
  })

  it('does not apply absolute positioning when position="none"', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
          <CarouselSlide>2</CarouselSlide>
        </CarouselContent>
        <CarouselPrev position="none" />
        <CarouselNext position="none" />
      </Carousel>,
    )
    const wrapper = container.querySelector('[data-slot="carousel-prev-positioner"]') as HTMLElement
    expect(wrapper.className).not.toContain('absolute')
  })

  it('forwards className to the outer positioner, not the inner trigger', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
          <CarouselSlide>2</CarouselSlide>
        </CarouselContent>
        <CarouselPrev className="prev-wrapper-cls" />
      </Carousel>,
    )
    const wrapper = container.querySelector('[data-slot="carousel-prev-positioner"]') as HTMLElement
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    expect(wrapper.className).toContain('prev-wrapper-cls')
    expect(prev.className).not.toContain('prev-wrapper-cls')
  })

  it('renders prev as a different element via render prop', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
        </CarouselContent>
        <CarouselPrev render={<a href="#prev" />} />
      </Carousel>,
    )
    const link = screen.getByRole('link', { name: 'Previous slide' })
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('#prev')
  })

  it('marks prev aria-disabled, not natively disabled, when canGoToPrev() reports false', () => {
    render(<Basic />)
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    expect(prev).toHaveAttribute('aria-disabled', 'true')
    expect(prev).not.toHaveAttribute('disabled')
    expect(prev.getAttribute('data-disabled')).not.toBeNull()
  })

  it('honors a consumer-supplied disabled prop on next', async () => {
    const user = userEvent.setup()
    stubApi.goToNext.mockClear()
    render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
        </CarouselContent>
        <CarouselNext disabled />
      </Carousel>,
    )
    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(next).toHaveAttribute('aria-disabled', 'true')
    await user.click(next)
    expect(stubApi.goToNext).not.toHaveBeenCalled()
  })

  it('keeps focus on an arrow once it reaches the end', () => {
    render(<Basic />)
    const next = screen.getByRole('button', { name: 'Next slide' })
    act(() => next.focus())
    stubApi.canGoToNext.mockReturnValue(false)
    emit('select')
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(document.activeElement).toBe(next)
  })

  it('passes aria-disabled through a rendered Button without disabling it natively', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
        </CarouselContent>
        <CarouselPrev render={<Button variant="outline" size="icon-md" />} />
      </Carousel>,
    )
    const prev = screen.getByRole('button', { name: 'Previous slide' })
    expect(prev).toHaveAttribute('aria-disabled', 'true')
    expect(prev).toHaveAttribute('data-disabled')
    expect(prev).not.toHaveAttribute('disabled')
  })

  it('calls api.goToNext when next is clicked', async () => {
    const user = userEvent.setup()
    render(<Basic />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(stubApi.goToNext).toHaveBeenCalled()
  })

  it('fires the consumer onClick alongside the internal scroll handler', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
        </CarouselContent>
        <CarouselNext onClick={onClick} />
      </Carousel>,
    )
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(onClick).toHaveBeenCalled()
  })
})

describe('CarouselPagination', () => {
  it('renders a bullet per snap and marks the first as active', () => {
    render(<Basic />)
    const pagination = screen.getByRole('group', { name: 'Choose slide to display' })
    const bullets = pagination.querySelectorAll('[data-slot="carousel-pagination-bullet"]')
    expect(bullets).toHaveLength(3)
    const active = pagination.querySelector('[data-active]') as HTMLElement
    expect(active).not.toBeNull()
    expect(active.getAttribute('aria-current')).toBe('true')
  })

  it('applies the light variant when light is true', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>Slide 1</CarouselSlide>
          <CarouselSlide>Slide 2</CarouselSlide>
          <CarouselSlide>Slide 3</CarouselSlide>
        </CarouselContent>
        <CarouselPagination light />
      </Carousel>,
    )
    const bullet = container.querySelector('[data-slot="carousel-pagination-bullet"]') as HTMLElement
    expect(bullet.className).toMatch(/bg-white/)
  })

  it('navigates to the clicked snap', async () => {
    const user = userEvent.setup()
    render(<Basic />)
    const bullets = screen
      .getByRole('group', { name: 'Choose slide to display' })
      .querySelectorAll('[data-slot="carousel-pagination-bullet"]')
    await user.click(bullets[2] as HTMLElement)
    expect(stubApi.goTo).toHaveBeenCalledWith(2)
  })

  it('slides the autoplay indicator in rather than resizing it', () => {
    mockAutoplay()
    const { container } = render(<Basic autoplay />)
    const indicator = container.querySelector('[data-slot="carousel-pagination-indicator"]') as HTMLElement
    expect(indicator).not.toBeNull()
    expect(indicator.style.width).toBe('')
    expect(indicator.style.height).toBe('')
    expect(indicator.style.transitionDuration).toBe('4000ms')
  })

  it('slides the vertical autoplay indicator in rather than resizing it', () => {
    mockAutoplay()
    const { container } = render(
      <Carousel autoplay>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
          <CarouselSlide>2</CarouselSlide>
          <CarouselSlide>3</CarouselSlide>
        </CarouselContent>
        <CarouselPagination orientation="vertical" />
        <CarouselProgress source="autoplay" orientation="vertical" />
      </Carousel>,
    )
    const indicators = container.querySelectorAll<HTMLElement>(
      '[data-slot="carousel-pagination-indicator"][data-orientation="vertical"]',
    )
    expect(indicators).toHaveLength(2)
    indicators.forEach((indicator) => {
      expect(indicator.style.width).toBe('')
      expect(indicator.style.height).toBe('')
    })
  })

  it('renders nothing when there is only one snap', () => {
    stubApi.snapList.mockReturnValue([0])
    render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>Only</CarouselSlide>
        </CarouselContent>
        <CarouselPagination />
      </Carousel>,
    )
    expect(screen.queryByRole('group', { name: 'Choose slide to display' })).toBeNull()
  })
})

describe('CarouselThumbs / CarouselThumb', () => {
  function WithThumbs(props?: Partial<CarouselThumbsProps>) {
    return (
      <Carousel>
        <CarouselContent>
          <CarouselSlide>Slide 1</CarouselSlide>
          <CarouselSlide>Slide 2</CarouselSlide>
          <CarouselSlide>Slide 3</CarouselSlide>
        </CarouselContent>
        <CarouselThumbs {...props}>
          <CarouselThumb>
            <img src="/1.jpg" alt="" />
          </CarouselThumb>
          <CarouselThumb>
            <img src="/2.jpg" alt="" />
          </CarouselThumb>
          <CarouselThumb>
            <img src="/3.jpg" alt="" />
          </CarouselThumb>
        </CarouselThumbs>
      </Carousel>
    )
  }

  it('renders a labeled rail of thumbnails, one per slide', () => {
    const { container } = render(<WithThumbs />)
    const rail = container.querySelector('[data-slot="carousel-thumbs"]') as HTMLElement
    expect(rail).not.toBeNull()
    expect(rail.getAttribute('role')).toBe('group')
    expect(rail.getAttribute('aria-label')).toBe('Choose slide to display')
    expect(rail.getAttribute('aria-roledescription')).toBeNull()
    expect(rail.querySelectorAll('[data-slot="carousel-thumb"]')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toBeInTheDocument()
  })

  it('marks the thumbnail of the selected slide as current', () => {
    const { container } = render(<WithThumbs />)
    const thumbs = container.querySelectorAll('[data-slot="carousel-thumb"]')
    expect(thumbs[0]).toHaveAttribute('data-active')
    expect(thumbs[0]).toHaveAttribute('aria-current', 'true')
    expect(thumbs[1]).not.toHaveAttribute('data-active')
  })

  it('navigates the carousel to the clicked thumbnail', async () => {
    const user = userEvent.setup()
    render(<WithThumbs />)
    await user.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    expect(stubApi.goTo).toHaveBeenCalledWith(2)
  })

  it('honors an explicit index over the thumbnail position', async () => {
    const user = userEvent.setup()
    render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>Slide 1</CarouselSlide>
        </CarouselContent>
        <CarouselThumbs>
          <CarouselThumb index={5}>Five</CarouselThumb>
        </CarouselThumbs>
      </Carousel>,
    )
    await user.click(screen.getByRole('button', { name: 'Go to slide 6' }))
    expect(stubApi.goTo).toHaveBeenCalledWith(5)
  })

  it('fires the consumer onClick alongside the internal navigation', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>Slide 1</CarouselSlide>
        </CarouselContent>
        <CarouselThumbs>
          <CarouselThumb onClick={onClick}>One</CarouselThumb>
        </CarouselThumbs>
      </Carousel>,
    )
    await user.click(screen.getByRole('button', { name: 'Go to slide 1' }))
    expect(onClick).toHaveBeenCalled()
    expect(stubApi.goTo).toHaveBeenCalledWith(0)
  })

  it('lays the rail out on the vertical axis when asked', () => {
    const { container } = render(<WithThumbs orientation="vertical" />)
    const rail = container.querySelector('[data-slot="carousel-thumbs"]') as HTMLElement
    expect(rail.getAttribute('data-orientation')).toBe('vertical')
    const track = rail.querySelector('[data-slot="carousel-content"]') as HTMLElement
    expect(track.getAttribute('data-orientation')).toBe('vertical')
  })

  it('claims drags along the rail axis, independent of the carousel axis', () => {
    const { container } = render(<WithThumbs orientation="vertical" />)
    const [main, rail] = container.querySelectorAll('[data-slot="carousel-viewport"]')
    expect(main).toHaveAttribute('data-base-ui-swipe-ignore', 'x')
    expect(rail).toHaveAttribute('data-base-ui-swipe-ignore', 'y')
  })

  it('applies the light variant to the thumbnails and the indicator', () => {
    const { container } = render(<WithThumbs light />)
    const thumb = container.querySelector('[data-slot="carousel-thumb"]') as HTMLElement
    expect(thumb.className).toMatch(/border-white/)
  })

  it('draws the indicator over the selected thumbnail once the engine reports its slides', () => {
    const { container, rerender } = render(<WithThumbs />)
    expect(container.querySelector('[data-slot="carousel-thumbs-indicator"]')).toBeNull()

    const rail = container.querySelector('[data-slot="carousel-thumbs"]') as HTMLElement
    const thumbs = Array.from(rail.querySelectorAll<HTMLElement>('[data-slot="carousel-thumb"]'))
    stubApi.slideNodes.mockReturnValue(thumbs)
    stubApi.containerNode.mockReturnValue(rail.querySelector('[data-slot="carousel-content"]'))
    rerender(<WithThumbs />)

    const indicator = container.querySelector('[data-slot="carousel-thumbs-indicator"]') as HTMLElement
    expect(indicator).not.toBeNull()
    expect(indicator.style.translate).toBe('0px 0px')
  })

  it('excludes the indicator from the rail snap count', () => {
    render(<WithThumbs />)
    const options = (useEmblaCarousel as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0]
    expect(options.slides).toBe(':scope > [data-slot=carousel-thumb]')
    expect(options.containScroll).toBe('keepSnaps')
  })

  it('keeps thumbnails as plain buttons, outside any slide management', () => {
    const mocked = vi.mocked(useEmblaCarousel)
    const thumbsApi = {
      ...stubApi,
      slideNodes: vi.fn(() => Array.from(document.querySelectorAll<HTMLElement>('[data-slot="carousel-thumb"]'))),
    }
    mockDomSlides()
    mocked.mockImplementation(((options?: CarouselOptions) => {
      const api = options?.slides ? thumbsApi : stubApi
      return [vi.fn(), api, api]
    }) as unknown as typeof useEmblaCarousel)
    try {
      const { container } = render(<WithThumbs />)
      const thumbs = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="carousel-thumb"]'))
      expect(thumbs).toHaveLength(3)
      thumbs.forEach((thumb, index) => {
        expect(screen.getByRole('button', { name: `Go to slide ${index + 1}` })).toBe(thumb)
        expect(thumb).not.toHaveAttribute('aria-hidden')
        expect(thumb).not.toHaveAttribute('aria-roledescription')
        expect(thumb).not.toHaveAttribute('inert')
      })
      const railPlugins = mocked.mock.calls.findLast(([options]) => options?.slides)?.[1] ?? []
      expect(railPlugins.map((plugin) => plugin.name)).not.toContain('accessibility')
    } finally {
      mocked.mockImplementation((() => [vi.fn(), stubApi, stubApi]) as unknown as typeof useEmblaCarousel)
    }
  })

  it('throws when a thumbnail is used outside CarouselThumbs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<CarouselThumb>Orphan</CarouselThumb>)).toThrow(/CarouselThumb/)
    spy.mockRestore()
  })
})

describe('CarouselProgress', () => {
  it('renders a progress bar with data-source="scroll" when no autoplay', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
          <CarouselSlide>2</CarouselSlide>
        </CarouselContent>
        <CarouselProgress />
      </Carousel>,
    )
    const progress = container.querySelector('[data-slot="carousel-progress"]') as HTMLElement
    expect(progress.getAttribute('data-source')).toBe('scroll')
    expect(progress.querySelector('[data-slot="carousel-progress-indicator"]')).not.toBeNull()
  })
})

describe('useCarousel + lifecycle', () => {
  it('throws when sub-components are used outside <Carousel>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<CarouselContent>x</CarouselContent>)).toThrow(
      /Carousel sub-components must be rendered inside <Carousel>/,
    )
    spy.mockRestore()
  })

  it('exposes the Embla api to descendants via useCarousel()', () => {
    let captured: CarouselApi | undefined
    function ReadApi() {
      captured = useCarousel().api
      return null
    }
    render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>1</CarouselSlide>
        </CarouselContent>
        <ReadApi />
      </Carousel>,
    )
    expect(captured).toBeDefined()
    expect(captured?.goToNext).toBe(stubApi.goToNext)
  })

  it('invokes onReInit after init with the Embla api', () => {
    const onReInit = vi.fn()
    render(<Basic onReInit={onReInit} />)
    expect(onReInit).toHaveBeenCalledWith(stubApi)
  })

  it('invokes setApi once with the Embla api after init', () => {
    const setApi = vi.fn()
    render(<Basic setApi={setApi} />)
    expect(setApi).toHaveBeenCalledTimes(1)
    expect(setApi).toHaveBeenCalledWith(stubApi)
  })

  it('subscribes to v9 lowercase events including select, scroll, slideschanged, slidesinview, reinit', () => {
    render(<Basic />)
    const subscribed = stubApi.on.mock.calls.map((c: unknown[]) => c[0])
    expect(subscribed).toEqual(expect.arrayContaining(['reinit', 'select', 'scroll', 'slidesinview', 'slideschanged']))
  })

  it('pauses autoplay on an on-axis wheel when wheel gestures are on', () => {
    const viewport = document.createElement('div')
    const autoplay = {
      options: { delay: 4000 },
      isPlaying: vi.fn(() => true),
      play: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
    }
    stubApi.plugins.mockReturnValue({ wheelGestures: {}, autoplay })
    stubApi.rootNode.mockReturnValue(viewport)
    stubApi.internalEngine.mockReturnValue({
      options: { active: true, axis: 'x' },
      scrollSnapList: { slidesBySnap: [] },
    })
    try {
      render(<Basic autoplay wheelGestures />)
      viewport.dispatchEvent(new WheelEvent('wheel', { deltaX: 2, deltaY: 40 }))
      expect(autoplay.stop).not.toHaveBeenCalled()
      viewport.dispatchEvent(new WheelEvent('wheel', { deltaX: 40, deltaY: 2 }))
      expect(autoplay.stop).toHaveBeenCalledTimes(1)
    } finally {
      stubApi.rootNode.mockReset()
      stubApi.internalEngine.mockReset()
    }
  })

  it('does not re-run the sync effect when re-rendered with a new-but-equal autoplay object', () => {
    const { rerender } = render(<Basic autoplay={{ delay: 3000 }} />)
    const initialOnCalls = stubApi.on.mock.calls.length
    expect(initialOnCalls).toBeGreaterThan(0)

    rerender(<Basic autoplay={{ delay: 3000 }} />)
    expect(stubApi.on.mock.calls.length).toBe(initialOnCalls)
  })
})

describe('Carousel autoplay', () => {
  function root(container: HTMLElement) {
    return container.querySelector('[data-slot="carousel"]') as HTMLElement
  }

  it('starts rotation on mount', () => {
    const autoplay = mockAutoplay()
    render(<Basic autoplay />)
    expect(autoplay.play).toHaveBeenCalledTimes(1)
  })

  it('stays off under reduced motion', () => {
    const autoplay = mockAutoplay()
    render(
      <ReducedMotionProvider disableAnimations>
        <Basic autoplay />
      </ReducedMotionProvider>,
    )
    expect(autoplay.play).not.toHaveBeenCalled()
  })

  it('stops when reduced motion turns on, and starts again when it turns off', () => {
    const autoplay = mockAutoplay()
    const { rerender } = render(
      <ReducedMotionProvider>
        <Basic autoplay />
      </ReducedMotionProvider>,
    )
    expect(autoplay.isPlaying()).toBe(true)
    rerender(
      <ReducedMotionProvider disableAnimations>
        <Basic autoplay />
      </ReducedMotionProvider>,
    )
    expect(autoplay.isPlaying()).toBe(false)
    rerender(
      <ReducedMotionProvider>
        <Basic autoplay />
      </ReducedMotionProvider>,
    )
    expect(autoplay.isPlaying()).toBe(true)
  })

  it('pauses while hovered and resumes when the pointer leaves', () => {
    const autoplay = mockAutoplay()
    const { container } = render(<Basic autoplay />)
    fireEvent.pointerEnter(root(container))
    expect(autoplay.isPlaying()).toBe(false)
    expect(container.querySelector('[data-slot="carousel-pagination-indicator"]')).toBeNull()
    fireEvent.pointerLeave(root(container))
    expect(autoplay.isPlaying()).toBe(true)
    expect(autoplay.play).toHaveBeenCalledTimes(2)
  })

  it('pauses while focus is inside and resumes once it leaves the carousel', () => {
    const autoplay = mockAutoplay()
    render(
      <>
        <Basic autoplay />
        <button type="button">Outside</button>
      </>,
    )
    act(() => screen.getByRole('button', { name: 'Next slide' }).focus())
    expect(autoplay.isPlaying()).toBe(false)
    act(() => screen.getByRole('button', { name: 'Previous slide' }).focus())
    expect(autoplay.isPlaying()).toBe(false)
    act(() => screen.getByRole('button', { name: 'Outside' }).focus())
    expect(autoplay.isPlaying()).toBe(true)
  })

  it('waits for both the pointer and focus to leave', () => {
    const autoplay = mockAutoplay()
    const { container } = render(
      <>
        <Basic autoplay />
        <button type="button">Outside</button>
      </>,
    )
    fireEvent.pointerEnter(root(container))
    act(() => screen.getByRole('button', { name: 'Next slide' }).focus())
    fireEvent.pointerLeave(root(container))
    expect(autoplay.isPlaying()).toBe(false)
    act(() => screen.getByRole('button', { name: 'Outside' }).focus())
    expect(autoplay.isPlaying()).toBe(true)
  })

  it('keeps a pointerdown stop after the pointer leaves, without resumeAfter', () => {
    const autoplay = mockAutoplay()
    const { container } = render(<Basic autoplay />)
    fireEvent.pointerEnter(root(container))
    emit('pointerdown')
    fireEvent.pointerLeave(root(container))
    expect(autoplay.isPlaying()).toBe(false)
    expect(autoplay.play).toHaveBeenCalledTimes(1)
  })

  it('holds the resumeAfter restart while hovered or focused', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      const autoplay = mockAutoplay()
      const { container } = render(
        <>
          <Basic autoplay={{ resumeAfter: 1000 }} />
          <button type="button">Outside</button>
        </>,
      )
      fireEvent.pointerEnter(root(container))
      emit('pointerdown')
      emit('autoplay:interaction', { detail: { interaction: 'pointerdown' } })
      act(() => vi.advanceTimersByTime(1000))
      expect(autoplay.isPlaying()).toBe(false)

      act(() => screen.getByRole('button', { name: 'Next slide' }).focus())
      fireEvent.pointerLeave(root(container))
      expect(autoplay.isPlaying()).toBe(false)

      act(() => screen.getByRole('button', { name: 'Outside' }).focus())
      expect(autoplay.isPlaying()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('restarts after resumeAfter once nothing is inside', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      const autoplay = mockAutoplay()
      render(<Basic autoplay={{ resumeAfter: 1000 }} />)
      emit('autoplay:interaction', { detail: { interaction: 'pointerdown' } })
      expect(autoplay.isPlaying()).toBe(false)
      act(() => vi.advanceTimersByTime(999))
      expect(autoplay.isPlaying()).toBe(false)
      act(() => vi.advanceTimersByTime(1))
      expect(autoplay.isPlaying()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
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

  it('subscribes select on both apis and pushes initial main → thumbs sync', () => {
    const mainApi = makeApi()
    const thumbsApi = makeApi()
    mainApi.selectedSnap.mockReturnValue(2)
    renderHook(() => useLinkedCarousels(mainApi as unknown as CarouselApi, thumbsApi as unknown as CarouselApi))
    expect(mainApi.on).toHaveBeenCalledWith('select', expect.any(Function))
    expect(thumbsApi.on).toHaveBeenCalledWith('select', expect.any(Function))
    expect(thumbsApi.goTo).toHaveBeenCalledWith(2)
  })

  it('main select handler navigates thumbs to the new index', () => {
    const mainApi = makeApi()
    const thumbsApi = makeApi()
    renderHook(() => useLinkedCarousels(mainApi as unknown as CarouselApi, thumbsApi as unknown as CarouselApi))
    const mainSelect = mainApi.on.mock.calls.find((c) => c[0] === 'select')?.[1] as () => void
    thumbsApi.goTo.mockClear()
    mainApi.selectedSnap.mockReturnValue(3)
    mainSelect()
    expect(thumbsApi.goTo).toHaveBeenCalledWith(3)
  })

  it('thumbs select handler navigates main to the new index', () => {
    const mainApi = makeApi()
    const thumbsApi = makeApi()
    renderHook(() => useLinkedCarousels(mainApi as unknown as CarouselApi, thumbsApi as unknown as CarouselApi))
    const thumbsSelect = thumbsApi.on.mock.calls.find((c) => c[0] === 'select')?.[1] as () => void
    mainApi.goTo.mockClear()
    thumbsApi.selectedSnap.mockReturnValue(1)
    thumbsSelect()
    expect(mainApi.goTo).toHaveBeenCalledWith(1)
  })

  it('unsubscribes from both apis on unmount', () => {
    const mainApi = makeApi()
    const thumbsApi = makeApi()
    const { unmount } = renderHook(() =>
      useLinkedCarousels(mainApi as unknown as CarouselApi, thumbsApi as unknown as CarouselApi),
    )
    unmount()
    expect(mainApi.off).toHaveBeenCalledWith('select', expect.any(Function))
    expect(thumbsApi.off).toHaveBeenCalledWith('select', expect.any(Function))
  })

  it('is a no-op when either api is undefined', () => {
    const mainApi = makeApi()
    renderHook(() => useLinkedCarousels(mainApi as unknown as CarouselApi, undefined))
    expect(mainApi.on).not.toHaveBeenCalled()
  })
})

describe('a11y', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Basic />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('reports no landmark violations with several carousels on one page', async () => {
    const { container } = render(
      <main>
        <Basic />
        <Basic />
        <Basic aria-label="New arrivals" />
        <Basic aria-label="Best sellers" />
      </main>,
    )
    const results = await axe(container, {
      runOnly: ['landmark-unique', 'aria-allowed-role', 'aria-hidden-focus'],
    })
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations with a thumbnail rail', async () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselSlide>Slide 1</CarouselSlide>
          <CarouselSlide>Slide 2</CarouselSlide>
        </CarouselContent>
        <CarouselThumbs>
          <CarouselThumb>
            <img src="/1.jpg" alt="" />
          </CarouselThumb>
          <CarouselThumb>
            <img src="/2.jpg" alt="" />
          </CarouselThumb>
        </CarouselThumbs>
      </Carousel>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
