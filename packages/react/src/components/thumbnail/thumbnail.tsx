import * as React from 'react'
import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const thumbnailVariants = cva(
  "relative inline-flex size-[1em] shrink-0 items-center justify-center overflow-hidden [&_svg:not([class*='size-'])]:size-[0.5em]",
  {
    variants: {
      size: {
        '2xs': 'text-[1.25rem]',
        xs: 'text-[1.5rem]',
        sm: 'text-[2rem]',
        md: 'text-[2.5rem]',
        lg: 'text-[3rem]',
        xl: 'text-[4rem]',
        '2xl': 'text-[5rem]',
      },
      shape: {
        rounded: 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]',
        circle: 'rounded-full',
      },
      variant: {
        image: 'bg-background-muted',
        'icon-soft': 'bg-background-muted text-foreground-intense',
        'icon-outline': 'bg-background text-foreground-intense border border-border',
        'icon-primary': 'bg-primary text-primary-foreground',
        'icon-primary-outline': 'text-primary border border-primary',
        'icon-secondary': 'bg-secondary-muted text-secondary-foreground',
        'icon-error': 'bg-error-muted text-error-foreground',
        'icon-success': 'bg-success-muted text-success-foreground',
        'icon-warning': 'bg-warning-muted text-warning-foreground',
        'icon-info': 'bg-info-muted text-info-foreground',
      },
    },
  },
)

type ThumbnailPresetSize = NonNullable<VariantProps<typeof thumbnailVariants>['size']>
type ThumbnailShape = NonNullable<VariantProps<typeof thumbnailVariants>['shape']>
type ThumbnailVariant = NonNullable<VariantProps<typeof thumbnailVariants>['variant']>

type BaseImageProps = React.ComponentProps<typeof BaseAvatar.Image>

interface ThumbnailProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'size' | 'children'> {
  /**
   * Image tile, or a colored icon tile.
   * @default 'image'
   */
  variant?: ThumbnailVariant
  /**
   * Rounded square or full circle.
   * @default 'rounded'
   */
  shape?: ThumbnailShape
  /**
   * A preset scale, or a pixel number for an exact size.
   * @default 'md'
   */
  size?: ThumbnailPresetSize | number
  /** Image URL (image variant). Lifted from `render` when omitted. */
  src?: string
  /**
   * Alternative text describing the image. Defaults to `""` (decorative) when omitted.
   * @default ''
   */
  alt?: string
  /** Swap the `<img>` for another element - e.g. a Next.js `<Image>`. */
  render?: BaseImageProps['render']
  /**
   * Mount the image and let it load in place instead of preloading `src`. Set it for `loading="lazy"` and for image components such as Next.js `<Image>`, which otherwise download twice.
   * @default false
   */
  keepMounted?: BaseImageProps['keepMounted']
  /** Fires as the image moves through its loading lifecycle. */
  onLoadingStatusChange?: BaseImageProps['onLoadingStatusChange']
  /** The icon to frame (icon variants). */
  children?: React.ReactNode
}

function Thumbnail({
  className,
  style,
  variant = 'image',
  shape = 'rounded',
  size = 'md',
  src,
  alt,
  render,
  keepMounted,
  onLoadingStatusChange,
  children,
  ...props
}: ThumbnailProps) {
  const isNumeric = typeof size === 'number'

  const variantClass = thumbnailVariants({
    variant,
    shape,
    size: isNumeric ? undefined : size,
  })

  const numericStyle = isNumeric ? { fontSize: `${size}px` } : undefined
  const mergedStyle = { ...numericStyle, ...style }
  const mergedClassName = cn(variantClass, className)

  if (variant === 'image') {
    const lifted =
      React.isValidElement<{ src?: string; alt?: string }>(render) && render.props ? render.props : undefined

    if (process.env.NODE_ENV !== 'production' && children != null) {
      // eslint-disable-next-line no-console
      console.warn('[Thumbnail] `children` is ignored when `variant="image"`.')
    }

    return (
      <BaseAvatar.Root
        data-slot="thumbnail"
        className={mergedClassName}
        style={mergedStyle}
        render={<div />}
        {...(props as React.ComponentProps<typeof BaseAvatar.Root>)}
      >
        <BaseAvatar.Image
          data-slot="thumbnail-image"
          className="size-full rounded-[inherit] object-cover"
          src={src ?? lifted?.src}
          alt={alt ?? lifted?.alt ?? ''}
          render={render}
          keepMounted={keepMounted}
          onLoadingStatusChange={onLoadingStatusChange}
        />
        <BaseAvatar.Fallback
          data-slot="thumbnail-fallback"
          delay={0}
          className="text-foreground-subtle flex size-full items-center justify-center has-[svg]:text-[1em]"
        >
          <ImageFallbackIcon />
        </BaseAvatar.Fallback>
      </BaseAvatar.Root>
    )
  }

  return (
    <div data-slot="thumbnail" className={mergedClassName} style={mergedStyle} {...props}>
      {children}
    </div>
  )
}

function ImageFallbackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      data-slot="thumbnail-fallback-icon"
    >
      <path d="M2.47 2.47a.75.75 0 0 1 1.061 0l.703.703c.078.037.151.086.215.151.057.059.099.126.133.196l15.925 15.925c.057.032.113.069.162.117s.094.111.128.173l.734.734a.75.75 0 0 1-1.061 1.061l-.402-.402c-.194.128-.398.24-.613.33a3.74 3.74 0 0 1-1.454.291v.001H6A3.75 3.75 0 0 1 2.25 18V6c0-.765.23-1.476.622-2.068L2.47 3.53a.75.75 0 0 1 0-1.061zM20.25 17v-.689l-2.77-2.771c-.388-.374-.762-.485-1.079-.455a.75.75 0 0 1-.141-1.494c.727-.068 1.421.175 2.013.651l.248.218 1.73 1.729V6A2.25 2.25 0 0 0 18 3.75H7a.75.75 0 1 1 0-1.5h11A3.75 3.75 0 0 1 21.75 6v11a.75.75 0 1 1-1.5 0zm-5.24-9.75a.75.75 0 1 1 0 1.5H15a.75.75 0 1 1 0-1.5h.01zM3.75 18A2.25 2.25 0 0 0 6 20.25h12.001c.299 0 .596-.059.872-.175.033-.014.063-.032.095-.047L10.48 11.54c-.351-.338-.69-.46-.979-.46s-.628.122-.979.46L3.75 16.311V18zm0-3.81l3.729-3.729c.354-.34.753-.594 1.181-.739L3.971 5.031A2.24 2.24 0 0 0 3.75 6v8.19z" />
    </svg>
  )
}

export { Thumbnail }
export type { ThumbnailProps }
