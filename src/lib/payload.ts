import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Locale } from '@/i18n/config'
import type { Award, CaseStudy, Client, Media, Page, Service, SiteSetting } from '@/payload-types'

export const getPayloadClient = cache(() => getPayload({ config }))

/** Published page by slug, in the requested language (BM falls back to English). */
export const getPage = cache(async (slug: string, locale: Locale): Promise<Page | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
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
    sort: 'order',
    depth: 1,
    limit: 50,
  })
  return docs
})

export const getSiteSettings = cache(async (locale: Locale): Promise<SiteSetting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })
})

/** Narrow a relationship field (id or populated doc) to the populated doc. */
export const populated = <T extends { id: number }>(value: number | T | null | undefined) =>
  value && typeof value === 'object' ? value : null

export const mediaUrl = (value: number | Media | null | undefined) => populated(value)?.url ?? null
