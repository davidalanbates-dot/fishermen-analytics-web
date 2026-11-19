import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { CtaBand, PageHead } from '@/components/PageParts'
import { localePath, locales, type Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { getCaseStudies, getCaseStudy, hasCaseStudyPage, mediaUrl, populated } from '@/lib/payload'
import { breadcrumbs, caseStudy as caseStudyLd, graph } from '@/lib/jsonld'
import { pageMetadata, richTextToPlain } from '@/lib/seo'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  const cases = (await getCaseStudies('en')).filter(hasCaseStudyPage)
  return locales.flatMap((locale) => cases.map((c) => ({ locale, slug: c.slug })))
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const c = await getCaseStudy(slug, locale)
  if (!c || !hasCaseStudyPage(c)) return {}
  const client = populated(c.client)?.name
  return pageMetadata({
    locale,
    path: `/work/${slug}`,
    title: c.meta?.title || [client, c.title].filter(Boolean).join(': '),
    absoluteTitle: Boolean(c.meta?.title),
    description: c.meta?.description || c.excerpt || richTextToPlain(c.challenge),
    image: mediaUrl(c.meta?.image) || mediaUrl(c.heroImage),
  })
}

export default async function CaseStudyPage({ params }: Props) {
  const { locale, slug } = await params
  const d = t(locale)
  const c = await getCaseStudy(slug, locale)
  // Case studies without their story written yet have no page of their own
  if (!c || !hasCaseStudyPage(c)) notFound()

  const client = populated(c.client)
  const award = populated(c.award)
  const services = (c.services ?? []).map((s) => populated(s)).filter((s) => !!s)

  return (
    <>
      <PageHead
        back={{ href: localePath(locale, '/work'), label: d.inner.allWork }}
        kicker={client?.name}
        title={c.title}
        intro={c.excerpt}
      >
        <div className="case-meta">
          {services.length ? (
            <span>
              <strong>{d.inner.services}</strong>
              {services.map((s, i) => (
                <span key={s.id}>
                  {i ? ', ' : ''}
                  <Link href={localePath(locale, `/services/${s.slug}`)}>{s.title}</Link>
                </span>
              ))}
            </span>
          ) : null}
          {c.industry ? (
            <span>
              <strong>{d.inner.industry}</strong>
              {c.industry}
            </span>
          ) : null}
          {award ? (
            <span>
              <strong>{d.result[award.result]}</strong>
              {d.shows[award.show] || award.showName} · {award.category}
            </span>
          ) : null}
          {c.sharedCredit ? (
            <span>
              <strong>{d.inner.credit}</strong>
              {d.withIntegrated}
            </span>
          ) : null}
        </div>
        {c.headline?.value ? (
          <p className="case-headline">
            <span className="num">{c.headline.value}</span>
            <span>{c.headline.label}</span>
          </p>
        ) : null}
      </PageHead>

      <section className="section">
        <div className="wrap case-grid">
          {c.challenge ? (
            <div>
              <h2>{d.inner.challenge}</h2>
              <div className="prose">
                <RichText data={c.challenge} />
              </div>
            </div>
          ) : null}
          {c.whatWeDid ? (
            <div>
              <h2>{d.inner.whatWeDid}</h2>
              <div className="prose">
                <RichText data={c.whatWeDid} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {c.results?.length ? (
        <section className="section section-band results">
          <div className="wrap">
            <h2>{d.inner.results}</h2>
            <ul>
              {c.results.map((r, i) => (
                <li key={r.id ?? i}>
                  <span className="num">{r.value}</span>
                  <span>{r.label}</span>
                </li>
              ))}
            </ul>
            <p className="note">
              {c.resultsPeriod ? `${c.resultsPeriod} ` : ''}
              {d.inner.percentNote}
            </p>
          </div>
        </section>
      ) : null}

      <CtaBand locale={locale} />
      <JsonLd
        data={graph(
          caseStudyLd(c, locale),
          breadcrumbs(locale, [
            { name: d.nav.home, path: '/' },
            { name: d.nav.work, path: '/work' },
            { name: c.title, path: `/work/${c.slug}` },
          ]),
        )}
      />
    </>
  )
}
