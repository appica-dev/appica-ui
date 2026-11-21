/**
 * A CSS value as the DOM reports it back from an inline style, so an assertion holds however the
 * environment serializes it (`inset(0 70% 0 0)` reads back as `inset(0px 70% 0px 0px)` in jsdom 31).
 */
export function cssValue(property: string, value: string): string {
  const probe = document.createElement('div')
  probe.style.setProperty(property, value)
  return probe.style.getPropertyValue(property)
}
