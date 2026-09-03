/** Portal props promoted to flat props on every modal *Content. */
export const MODAL_PORTAL_KEYS = ['container', 'keepMounted'] as const

/**
 * Flat Portal props + typed escape hatches for Overlay / viewport / Portal.
 * `container` maps to bits-ui Portal `to`. `keepMounted` is applied as
 * `forceMount` on Overlay and Content by the calling component.
 */
export type ModalContentProps<Popup, Portal, Overlay, Viewport> = Popup & {
  /**
   * Portal target. Maps to bits-ui Portal `to`.
   * @default document.body
   */
  container?: Element | string
  /**
   * Keep overlay and content mounted while closed so enter/exit animations can run.
   * @default false
   */
  keepMounted?: boolean
  /** Escape hatch: extra props forwarded to the bits-ui Portal. */
  portalProps?: Omit<Portal, 'children' | 'to'>
  /** Escape hatch: props forwarded to the bits-ui Overlay (backdrop). */
  backdropProps?: Omit<Overlay, 'children'>
  /** Escape hatch: props forwarded to the local viewport element. */
  viewportProps?: Omit<Viewport, 'children'>
}

export interface SplitModalProps {
  portal: Record<string, unknown>
  popup: Record<string, unknown>
  keepMounted: boolean
}

/**
 * Partition a modal *Content spread into Portal vs popup targets.
 * Destructure `class`/`children`, the escape hatches, and component-specific
 * props (`backdrop`, `closeButton`, …) before calling this.
 */
export function splitModalProps(props: Record<string, unknown>): SplitModalProps {
  const { portalProps, container, keepMounted, ...rest } = props as {
    portalProps?: Record<string, unknown>
    container?: unknown
    keepMounted?: boolean
  } & Record<string, unknown>

  const portal: Record<string, unknown> = { ...portalProps }
  if (container !== undefined) portal.to = container

  return {
    portal,
    popup: rest,
    keepMounted: keepMounted === true,
  }
}
