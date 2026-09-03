export function readTextDirection(el: HTMLElement | undefined): 'ltr' | 'rtl' {
  if (!el) return 'ltr'
  const withDir = el.closest('[dir]')
  const attr = withDir?.getAttribute('dir')
  if (attr === 'rtl' || attr === 'ltr') return attr
  if (typeof getComputedStyle === 'function') {
    return getComputedStyle(el).direction === 'rtl' ? 'rtl' : 'ltr'
  }
  return 'ltr'
}
