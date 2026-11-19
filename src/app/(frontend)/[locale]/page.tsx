import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { localePath, type Locale } from '@/i18n/config'
import { getPage, getSiteSettings, mediaUrl } from '@/lib/payload'

// Re-check the CMS at most once a minute. On-demand revalidation on publish comes later.
export const revalidate = 60

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await props.params
  const [page, settings] = await Promise.all([getPage('home', locale), getSiteSettings(locale)])
  const hero = page?.layout?.find((b) => b.blockType === 'hero')
  const title =
    page?.meta?.title ||
    [settings.companyName || 'Fishermen Analytics', settings.tagline].filter(Boolean).join(' | ')
  const description =
    page?.meta?.description || (hero && 'intro' in hero ? hero.intro : undefined) || undefined
  const image = mediaUrl(page?.meta?.image)
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: localePath(locale, '/'),
      languages: { 'en-MY': '/', 'ms-MY': '/ms', 'x-default': '/' },
    },
    openGraph: { title, description, images: image ? [image] : undefined },
  }
}

export default async function HomePage(props: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await props.params
  const page = await getPage('home', locale)
  if (!page) notFound()
  return <RenderBlocks blocks={page.layout ?? []} locale={locale} />
}
