import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'

import { CtaBand, PageHead } from '@/components/PageParts'
import { localePath, locales, type Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { getInsight, getInsights, mediaUrl, populated } from '@/lib/payload'
import { pageMetadata, richTextToPlain } from '@/lib/seo'
import { formatDate } from '@/lib/format'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  const articles = await getInsights('en')
  return locales.flatMap((locale) => articles.map((a) => ({ locale, slug: a.slug })))
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const a = await getInsight(slug, locale)
  if (!a) return {}
  return pageMetadata({
    locale,
    path: `/insights/${slug}`,
    title: a.meta?.title || a.title,
    absoluteTitle: Boolean(a.meta?.title),
    description: a.meta?.description || a.excerpt || richTextToPlain(a.content),
    image: mediaUrl(a.meta?.image) || mediaUrl(a.heroImage),
  })
}

export default async function InsightPage({ params }: Props) {
  const { locale, slug } = await params
  const d = t(locale)
  const a = await getInsight(slug, locale)
  if (!a) notFound()
  const author = populated(a.author)

  return (
    <>
      <PageHead
        back={{ href: localePath(locale, '/insights'), label: d.inner.allInsights }}
        kicker={d.nav.insights}
        title={a.title}
        intro={a.excerpt}
      >
        <p className="byline">
          {[author ? `${d.inner.by} ${author.name}` : null, formatDate(a.publishedAt, locale)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </PageHead>

      <section className="section">
        <article className="wrap">
          <div className="article prose">
            <RichText data={a.content} />
          </div>
        </article>
      </section>

      {a.faqs?.length ? (
        <section className="section section-band">
          <div className="wrap faq article">
            <h2 className="h2" style={{ marginBottom: 24 }}>
              {d.inner.faqs}
            </h2>
            {a.faqs.map((f, i) => (
              <details key={f.id ?? i}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <CtaBand locale={locale} />
    </>
  )
}
