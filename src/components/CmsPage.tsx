import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import type { Locale } from '@/i18n/config'
import { getPage, mediaUrl } from '@/lib/payload'
import { pageMetadata } from '@/lib/seo'

/** Metadata for a page built from the CMS Pages collection. */
export async function cmsPageMetadata(
  slug: string,
  locale: Locale,
  path: string,
): Promise<Metadata> {
  const page = await getPage(slug, locale)
  if (!page) return {}
  const hero = page.layout?.find((b) => b.blockType === 'hero')
  return pageMetadata({
    locale,
    path,
    title: page.meta?.title || page.title,
    absoluteTitle: Boolean(page.meta?.title),
    description:
      page.meta?.description || (hero && 'intro' in hero ? hero.intro : undefined) || undefined,
    image: mediaUrl(page.meta?.image),
  })
}

/**
 * Renders a CMS page's blocks. `after` adds page-specific sections the CMS doesn't
 * model as blocks (e.g. the team on About, open roles on Careers).
 */
export async function CmsPage(props: {
  slug: string
  locale: Locale
  after?: ReactNode
  before?: ReactNode
}) {
  const page = await getPage(props.slug, props.locale)
  if (!page) notFound()
  const blocks = page.layout ?? []
  const [first, ...rest] = blocks
  // Page-specific sections go after the page's hero, before its other blocks
  return (
    <>
      {first ? <RenderBlocks blocks={[first]} locale={props.locale} /> : null}
      {props.before}
      <RenderBlocks blocks={rest} locale={props.locale} />
      {props.after}
    </>
  )
}
