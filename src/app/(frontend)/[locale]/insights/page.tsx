import Link from 'next/link'

import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'
import { localePath, type Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { formatDate } from '@/lib/format'
import { getInsights, populated } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return cmsPageMetadata('insights', locale, '/insights')
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params
  const d = t(locale)
  const articles = await getInsights(locale)

  return (
    <CmsPage
      slug="insights"
      locale={locale}
      after={
        <section className="section">
          <div className="wrap">
            {articles.length ? (
              <div className="list-cards">
                {articles.map((a) => (
                  <Link
                    key={a.id}
                    href={localePath(locale, `/insights/${a.slug}`)}
                    className="list-card"
                  >
                    <div>
                      <h3>{a.title}</h3>
                      {a.excerpt ? <p>{a.excerpt}</p> : null}
                      <p className="muted" style={{ fontSize: 14 }}>
                        {[formatDate(a.publishedAt, locale), populated(a.author)?.name]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <span className="btn btn-ghost">{d.inner.read}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty-note">{d.inner.insightsEmpty}</p>
            )}
          </div>
        </section>
      }
    />
  )
}
