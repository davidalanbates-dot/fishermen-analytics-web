import { isLocale, localePath, type Locale } from '../i18n/config'

/** Collections with a page on the site, and where that page lives. */
const PATHS: Record<string, (slug: string) => string> = {
  pages: (slug) => (slug === 'home' ? '/' : `/${slug}`),
  services: (slug) => `/services/${slug}`,
  'case-studies': (slug) => `/work/${slug}`,
  insights: (slug) => `/insights/${slug}`,
  jobs: () => '/careers',
}
export const previewCollections = Object.keys(PATHS)

/**
 * The CMS Preview button and Live Preview open this URL. It switches on Next.js draft mode
 * for a logged-in CMS user, then shows the page in the language being edited.
 */
export function previewUrl(collection: string, slug: unknown, locale?: unknown): string | null {
  const toPath = PATHS[collection]
  if (!toPath || typeof slug !== 'string' || !slug) return null
  // The Preview button passes the locale code; Live Preview passes { code, label }
  const code = typeof locale === 'object' && locale && 'code' in locale ? locale.code : locale
  const lang: Locale = typeof code === 'string' && isLocale(code) ? code : 'en'
  const path = localePath(lang, toPath(slug))
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
  return `${base}/next/preview?path=${encodeURIComponent(path)}`
}
