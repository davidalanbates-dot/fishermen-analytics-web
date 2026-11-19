import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Locale } from '@/i18n/config'
import type {
  Award,
  CaseStudy,
  Client,
  Insight,
  Job,
  Media,
  Page,
  Service,
  SiteSetting,
  Team,
  User,
} from '@/payload-types'

export const getPayloadClient = cache(() => getPayload({ config }))

/**
 * CMS preview: in Next.js draft mode (switched on by /next/preview for a logged-in CMS user),
 * queries run as that user and return the latest draft. Everyone else gets published content.
 */
export const previewArgs = cache(async (): Promise<{ draft?: true; user?: User }> => {
  try {
    if (!(await draftMode()).isEnabled) return {}
  } catch {
    return {} // outside a request (build-time sitemap, scripts)
  }
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user ? { draft: true, user: user as User } : {}
})

/** Published page by slug, in the requested language (BM falls back to English). */
export const getPage = cache(async (slug: string, locale: Locale): Promise<Page | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
})

export const getServices = cache(async (locale: Locale): Promise<Service[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    sort: 'order',
    depth: 0,
    limit: 20,
  })
  return docs
})

/** Homepage features: explicit picks if given, else the ones marked "Feature on homepage". */
export const getFeaturedCaseStudies = cache(async (locale: Locale): Promise<CaseStudy[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: { featured: { equals: true } },
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    sort: 'order',
    depth: 1,
    limit: 3,
  })
  return docs
})

export const getAwards = cache(async (locale: Locale): Promise<Award[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'awards',
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    sort: 'order',
    depth: 0,
    limit: 50,
  })
  return docs
})

export const getLogoClients = cache(async (): Promise<Client[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'clients',
    where: { and: [{ showLogo: { equals: true } }, { logo: { exists: true } }] },
    overrideAccess: false,
    ...(await previewArgs()),
    sort: 'order',
    depth: 1,
    limit: 50,
  })
  return docs
})

export const getSiteSettings = cache(async (locale: Locale): Promise<SiteSetting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'site-settings',
    locale,
    depth: 1,
    overrideAccess: false,
    ...(await previewArgs()),
  })
})

// ---- Inner pages ----
// Every public query runs with access control on (overrideAccess: false), exactly as an
// anonymous visitor: drafts and internal-only fields (award client/year/level) never come back.
// The one exception is CMS preview (previewArgs above), for logged-in CMS users only.

async function findOne<T>(
  collection: 'services' | 'case-studies' | 'insights',
  slug: string,
  locale: Locale,
  depth = 1,
) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    depth,
    limit: 1,
  })
  return (docs[0] as T | undefined) ?? null
}

export const getService = cache((slug: string, locale: Locale) =>
  findOne<Service>('services', slug, locale, 0),
)

export const getCaseStudies = cache(async (locale: Locale): Promise<CaseStudy[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'case-studies',
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    sort: 'order',
    depth: 1,
    limit: 100,
  })
  return docs
})

export const getCaseStudy = cache((slug: string, locale: Locale) =>
  findOne<CaseStudy>('case-studies', slug, locale, 2),
)

/** A case study has its own page once its story is written (challenge filled in). */
export const hasCaseStudyPage = (c: Pick<CaseStudy, 'challenge'>) => Boolean(c.challenge)

export const getTeam = cache(async (locale: Locale): Promise<Team[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'team',
    where: { showOnAbout: { equals: true } },
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    sort: 'order',
    depth: 1,
    limit: 50,
  })
  return docs
})

export const getInsights = cache(async (locale: Locale): Promise<Insight[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'insights',
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    sort: '-publishedAt',
    depth: 1,
    limit: 100,
  })
  return docs
})

export const getInsight = cache((slug: string, locale: Locale) =>
  findOne<Insight>('insights', slug, locale, 2),
)

export const getOpenJobs = cache(async (locale: Locale): Promise<Job[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'jobs',
    where: { open: { equals: true } },
    locale,
    overrideAccess: false,
    ...(await previewArgs()),
    depth: 0,
    limit: 50,
  })
  return docs
})

/** Narrow a relationship field (id or populated doc) to the populated doc. */
export const populated = <T extends { id: number }>(value: number | T | null | undefined) =>
  value && typeof value === 'object' ? value : null

export const mediaUrl = (value: number | Media | null | undefined) => populated(value)?.url ?? null
