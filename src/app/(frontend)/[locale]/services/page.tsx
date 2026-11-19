import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'
import type { Locale } from '@/i18n/config'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return cmsPageMetadata('services', locale, '/services')
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  return <CmsPage slug="services" locale={locale} />
}
