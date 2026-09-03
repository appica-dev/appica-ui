export type OverlayHandle = {
  get open(): boolean
  set open(value: boolean)
}

/** Programmatic open state for Dialog, AlertDialog, Drawer, and Popover. */
export function createHandle(): OverlayHandle {
  let open = $state(false)
  return {
    get open() {
      return open
    },
    set open(value: boolean) {
      open = value
    },
  }
}
