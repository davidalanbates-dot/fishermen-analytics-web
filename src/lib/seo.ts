import type { Metadata } from 'next'

import { localePath, type Locale } from '@/i18n/config'

const SITE = 'Fishermen Analytics'

/**
 * Page metadata with the canonical URL for this language and hreflang alternates for both
 * (EN at the root, BM under /ms). `path` is the language-neutral path, e.g. "/work/kwc".
 */
export function pageMetadata(opts: {
  locale: Locale
  path: string
  title: string
  description?: string | null
  image?: string | null
  absoluteTitle?: boolean
}): Metadata {
  const { locale, path, title, description, image, absoluteTitle } = opts
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: description || undefined,
    alternates: {
      canonical: localePath(locale, path),
      languages: {
        'en-MY': localePath('en', path),
        'ms-MY': localePath('ms', path),
        'x-default': localePath('en', path),
      },
    },
    openGraph: {
      title: absoluteTitle ? title : `${title} | ${SITE}`,
      description: description || undefined,
      siteName: SITE,
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
      images: image ? [image] : undefined,
    },
  }
}

/** Plain text from a Lexical rich text value, for meta descriptions. */
export function richTextToPlain(value: unknown, max = 160): string {
  const out: string[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: string; children?: unknown[]; root?: unknown }
    if (typeof n.text === 'string') out.push(n.text)
    if (n.root) walk(n.root)
    n.children?.forEach(walk)
  }
  walk(value)
  const text = out.join(' ').replace(/\s+/g, ' ').trim()
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text
}
