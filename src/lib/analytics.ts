/**
 * GA4 events. Uses gtag when GA4 is installed, otherwise pushes to the dataLayer
 * (so Google Tag Manager can pick it up). Does nothing until either exists.
 */
type Params = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (command: 'event', name: string, params?: Params) => void
    dataLayer?: Record<string, unknown>[]
  }
}

export function track(name: string, params: Params = {}) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params })
  }
  if (process.env.NODE_ENV === 'development') console.debug('[analytics]', name, params)
}
