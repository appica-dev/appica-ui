import type { CarouselApi } from './carousel-types'

/**
 * Bidirectionally sync the selected snap between two carousels - the classic
 * main + thumbnails pattern. Pass getters so Svelte can track the apis
 * (component scripts run once).
 */
export function useLinkedCarousels(
  getMainApi: () => CarouselApi | undefined,
  getThumbsApi: () => CarouselApi | undefined,
): void {
  $effect(() => {
    const mainApi = getMainApi()
    const thumbsApi = getThumbsApi()
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
  })
}
