import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, locales } from './i18n/config'

/**
 * Locale routing: English at the root (/work), Bahasa Malaysia under /ms (/ms/work).
 * Internally every page lives under /[locale], so root URLs are rewritten to /en/...
 * and any /en/... URL is redirected to its root form to avoid duplicate content.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(defaultLocale.length + 1) || '/'
    return NextResponse.redirect(url, 308)
  }

  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hasLocale) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip the CMS, API, Next internals and any file with an extension (images, robots.txt, llms.txt).
  matcher: ['/((?!admin|api|_next|next|.*\\..*).*)'],
}
