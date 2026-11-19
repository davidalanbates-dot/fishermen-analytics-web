import type { MetadataRoute } from 'next'

import { isProductionSite, siteUrl } from '@/lib/jsonld'

/**
 * robots.txt. Everyone may crawl the public site; the CMS and API stay out.
 * AI search and answer crawlers are welcomed by name: being cited in AI answers is part of
 * what this site is meant to show (GEO).
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
]

export default function robots(): MetadataRoute.Robots {
  // Keep non-production deployments (previews, staging, local) out of search results
  const isProduction = isProductionSite()
  const disallow = ['/admin', '/api']

  if (!isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: AI_CRAWLERS, allow: '/', disallow },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  }
}
