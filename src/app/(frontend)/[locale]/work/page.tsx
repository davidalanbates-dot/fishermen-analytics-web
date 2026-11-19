import { WorkCard } from '@/components/blocks/Sections'
import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'
import { WorkFilter } from '@/components/WorkFilter'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { getCaseStudies, getServices, populated } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return cmsPageMetadata('work', locale, '/work')
}

export default async function WorkPage({ params }: Props) {
  const { locale } = await params
  const d = t(locale)
  const [cases, services] = await Promise.all([getCaseStudies(locale), getServices(locale)])

  const items = cases.map((c) => ({
    id: c.id,
    services: (c.services ?? []).map((s) => populated(s)?.slug).filter((s): s is string => !!s),
    card: <WorkCard c={c} locale={locale} showServices />,
  }))
  // Only offer filters that match at least one case study
  const used = new Set(items.flatMap((i) => i.services))
  const options = services
    .filter((s) => used.has(s.slug))
    .map((s) => ({ slug: s.slug, title: s.title }))

  return (
    <CmsPage
      slug="work"
      locale={locale}
      after={
        <section className="section">
          <div className="wrap">
            <WorkFilter
              label={d.inner.workFilter}
              allLabel={d.inner.workAll}
              options={options}
              items={items}
            />
          </div>
        </section>
      }
    />
  )
}
