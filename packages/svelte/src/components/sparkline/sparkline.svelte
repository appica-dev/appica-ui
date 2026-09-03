<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { setSparklineContext, type SparklinePoint } from './sparkline-context'

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
    /** **Required.** The series to plot. */
    data: number[]
    /** Per-point labels (e.g. dates), surfaced in the tooltip and to `SparklineLabel`. */
    labels?: string[]
    /**
     * Accent for the line, fill, indicator, and tooltip swatch. Any CSS color.
     * @default var(--primary)
     */
    color?: string
    /** Formatting for displayed values (`SparklineValue`, tooltip). */
    format?: Intl.NumberFormatOptions
    /** Locale used by `Intl.NumberFormat`. */
    locale?: Intl.LocalesArgument
    /** Fires when the hovered point changes; `null` on pointer leave. */
    onActiveChange?: (point: SparklinePoint | null) => void
    children?: Snippet
  }

  let {
    data,
    labels,
    color,
    format,
    locale,
    onActiveChange,
    class: className,
    style,
    children,
    ...rest
  }: Props = $props()

  let activeIndex = $state<number | null>(null)

  function setActiveIndex(index: number | null) {
    if (activeIndex === index) return
    activeIndex = index
    const cb = onActiveChange
    if (!cb) return
    if (index === null) {
      cb(null)
      return
    }
    cb({ index, value: data[index]!, label: labels?.[index] })
  }

  setSparklineContext({
    data: () => data,
    labels: () => labels,
    activeIndex: () => activeIndex,
    setActiveIndex,
    format: () => format,
    locale: () => locale,
  })

  const rootStyle = $derived(`--sparkline-color: ${color ?? 'var(--primary)'};${style ? ` ${style}` : ''}`)
</script>

<div data-slot="sparkline" class={cn('flex flex-col gap-1.5', className)} style={rootStyle} {...rest}>
  {@render children?.()}
</div>
