import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'
import { CtaBand } from '@/components/PageParts'
import type { Locale } from '@/i18n/config'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return cmsPageMetadata('awards', locale, '/awards')
}

export default async function AwardsPage({ params }: Props) {
  const { locale } = await params
  return <CmsPage slug="awards" locale={locale} after={<CtaBand locale={locale} />} />
}
