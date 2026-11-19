import type { MetadataRoute } from 'next'

import { localePath, locales } from '@/i18n/config'
import { siteUrl } from '@/lib/jsonld'
import { getCaseStudies, getInsights, getServices, hasCaseStudyPage } from '@/lib/payload'

export const revalidate = 3600

/**
 * XML sitemap: every page in English and Bahasa Malaysia, each with its hreflang
 * alternates, so search engines pair the two language versions.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, cases, insights] = await Promise.all([
    getServices('en'),
    getCaseStudies('en'),
    getInsights('en'),
  ])

  const pages: { path: string; updated?: string | null; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/services', priority: 0.9 },
    ...services.map((s) => ({ path: `/services/${s.slug}`, updated: s.updatedAt, priority: 0.8 })),
    { path: '/work', priority: 0.9 },
    ...cases
      .filter(hasCaseStudyPage)
      .map((c) => ({ path: `/work/${c.slug}`, updated: c.updatedAt, priority: 0.7 })),
    { path: '/about', priority: 0.6 },
    { path: '/awards', priority: 0.5 },
    { path: '/insights', priority: 0.7 },
    ...insights.map((a) => ({ path: `/insights/${a.slug}`, updated: a.updatedAt, priority: 0.6 })),
    { path: '/careers', priority: 0.4 },
    { path: '/contact', priority: 0.6 },
  ]

  const base = siteUrl()
  return pages.flatMap((p) =>
    locales.map((locale) => ({
      url: base + localePath(locale, p.path),
      lastModified: p.updated ? new Date(p.updated) : undefined,
      priority: locale === 'en' ? p.priority : Math.round(p.priority * 0.9 * 10) / 10,
      alternates: {
        languages: {
          'en-MY': base + localePath('en', p.path),
          'ms-MY': base + localePath('ms', p.path),
        },
      },
    })),
  )
}
