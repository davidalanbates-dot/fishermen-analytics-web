import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { WorkCard } from '@/components/blocks/Sections'
import { JsonLd } from '@/components/JsonLd'
import { CtaBand, PageHead } from '@/components/PageParts'
import { localePath, locales, type Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { getCaseStudies, getService, getServices } from '@/lib/payload'
import { breadcrumbs, faqPage, graph, service as serviceLd } from '@/lib/jsonld'
import { pageMetadata } from '@/lib/seo'
import type { Service } from '@/payload-types'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  const services = await getServices('en')
  return locales.flatMap((locale) => services.map((s) => ({ locale, slug: s.slug })))
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const service = await getService(slug, locale)
  if (!service) return {}
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: service.meta?.title || service.title,
    absoluteTitle: Boolean(service.meta?.title),
    description: service.meta?.description || service.summary,
  })
}

const roleOf = (s: Service) => s.role ?? 'craft'

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params
  const d = t(locale)
  const service = await getService(slug, locale)
  if (!service) notFound()

  const [all, cases] = await Promise.all([getServices(locale), getCaseStudies(locale)])
  const href = (s?: Service) => localePath(locale, `/services/${s?.slug ?? ''}`)
  const dataLayer = all.find((s) => roleOf(s) === 'data')
  const searchLayer = all.find((s) => roleOf(s) === 'search')
  const crafts = all.filter((s) => roleOf(s) === 'craft')
  const role = roleOf(service)
  const related = cases.filter((c) =>
    (c.services ?? []).some((s) => (typeof s === 'object' ? s.id : s) === service.id),
  )
  const items = (service.items ?? []).map((i) => i.item).filter(Boolean)

  return (
    <>
      <PageHead
        back={{ href: localePath(locale, '/services'), label: d.inner.allServices }}
        kicker={role === 'craft' ? d.layers.whatWeMake : d.layers[role]}
        title={service.title}
        intro={service.summary}
      >
        {items.length ? (
          <ul className="chips" aria-label={d.inner.included}>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </PageHead>

      {role === 'craft' ? (
        // A craft: show how both layers apply to it
        <section className="section">
          <div className="wrap layer-cards">
            <div className="layer-card data">
              <p className="label">{d.layers.data}</p>
              <p className="line">{service.dataLayer}</p>
              {dataLayer ? <Link href={href(dataLayer)}>{dataLayer.title} →</Link> : null}
            </div>
            <div className="layer-card search">
              <p className="label">{d.layers.search}</p>
              <p className="line">{service.searchLayer}</p>
              {searchLayer ? <Link href={href(searchLayer)}>{searchLayer.title} →</Link> : null}
            </div>
          </div>
        </section>
      ) : (
        // A layer: show what it looks like in every craft
        <section className="section">
          <div className="wrap">
            <p className="kicker">{d.inner.runsThrough}</p>
            <p className="lede" style={{ marginTop: 0, marginBottom: 28 }}>
              {d.inner.runsThroughIntro}
            </p>
            <ul className="layer-list">
              {crafts.map((c) => (
                <li key={c.id}>
                  <Link href={href(c)}>{c.title}</Link>
                  <p>{role === 'data' ? c.dataLayer : c.searchLayer}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {service.body ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap prose">
            <RichText data={service.body} />
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="section section-band">
          <div className="wrap">
            <p className="kicker">{d.inner.relatedWork}</p>
            <div className="cards" style={{ marginTop: 16 }}>
              {related.map((c) => (
                <WorkCard key={c.id} c={c} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {service.faqs?.length ? (
        <section className="section">
          <div className="wrap faq">
            <h2 className="h2" style={{ marginBottom: 24 }}>
              {d.inner.faqs}
            </h2>
            {service.faqs.map((f, i) => (
              <details key={f.id ?? i}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <CtaBand locale={locale} />
      <JsonLd
        data={graph(
          serviceLd(service, locale),
          breadcrumbs(locale, [
            { name: d.nav.home, path: '/' },
            { name: d.nav.services, path: '/services' },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
          faqPage(service.faqs),
        )}
      />
    </>
  )
}
