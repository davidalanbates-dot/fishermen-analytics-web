/* eslint-disable @next/next/no-img-element -- client logos include SVGs served by the CMS */
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

import { GameLoader } from '@/components/game/GameLoader'
import { isPixelIcon } from '@/components/game/icons'

import { localePath } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import {
  getAwards,
  getFeaturedCaseStudies,
  getLogoClients,
  getServices,
  getSiteSettings,
  mediaUrl,
  populated,
} from '@/lib/payload'
import type { CaseStudy } from '@/payload-types'
import type { BlockProps } from './types'

function SectionHead({
  kicker,
  heading,
  intro,
}: {
  kicker?: string
  heading?: string | null
  intro?: string | null
}) {
  if (!heading && !intro) return null
  return (
    <div className="sec-head">
      <div>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        {heading ? <h2 className="h2">{heading}</h2> : null}
      </div>
      {intro ? <p>{intro}</p> : null}
    </div>
  )
}

export async function FamilyBlock({ block, locale }: BlockProps<'family'>) {
  const settings = await getSiteSettings(locale)
  const url = settings.fishermenIntegratedUrl || 'https://www.fishermen.co'
  return (
    <section className="family section-band">
      <div className="wrap">
        <p>
          {block.heading ? <strong>{block.heading}</strong> : null} {block.text}
        </p>
        <a href={url}>
          {locale === 'ms' ? 'Lawati Fishermen Integrated ↗' : 'Visit Fishermen Integrated ↗'}
        </a>
      </div>
    </section>
  )
}

/**
 * What we do, as a matrix: the five crafts down the side, and the two layers that run
 * through all of them (Data Analytics, SEO/GEO) across the top. On phones each craft
 * becomes a card with its two layer lines stacked.
 */
export async function ServicesBlock({ block, locale }: BlockProps<'services'>) {
  const d = t(locale)
  const services = await getServices(locale)
  const crafts = services.filter((s) => (s.role ?? 'craft') === 'craft')
  const dataLayer = services.find((s) => s.role === 'data')
  const searchLayer = services.find((s) => s.role === 'search')
  const href = (slug?: string | null) => localePath(locale, `/services/${slug ?? ''}`)

  return (
    <section className="section">
      <div className="wrap">
        <div className="svc-top">
          <div className="svc-head">
            <p className="kicker">{d.kickers.services}</p>
            {block.heading ? <h2 className="h2">{block.heading}</h2> : null}
            {block.intro ? <p className="svc-intro">{block.intro}</p> : null}
          </div>
          {block.showGame ? (
            <GameLoader
              listId="services-list"
              contactHref={localePath(locale, '/contact')}
              text={d.game}
              services={services.map((s) => ({
                id: s.id,
                label: s.gameLabel || s.title,
                title: s.title,
                summary: s.summary,
                href: href(s.slug),
                icon: isPixelIcon(s.gameIcon) ? s.gameIcon : 'analytics',
              }))}
            />
          ) : null}
        </div>

        <table className="layers" id="services-list">
          <caption className="sr-only">{d.layers.caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="layers-make">
                {d.layers.whatWeMake}
              </th>
              <th scope="col" className="layers-head data">
                <span className="layers-name">
                  <span className="swatch" aria-hidden="true" />
                  {d.layers.data}
                </span>
                {dataLayer ? (
                  <>
                    <span className="layers-service">{dataLayer.title}</span>
                    <Link href={href(dataLayer.slug)} className="layers-own">
                      {d.layers.onItsOwn}
                    </Link>
                  </>
                ) : null}
              </th>
              <th scope="col" className="layers-head search">
                <span className="layers-name">
                  <span className="swatch" aria-hidden="true" />
                  {d.layers.search}
                </span>
                {searchLayer ? (
                  <>
                    <span className="layers-service">{searchLayer.title}</span>
                    <Link href={href(searchLayer.slug)} className="layers-own">
                      {d.layers.onItsOwn}
                    </Link>
                  </>
                ) : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {crafts.map((s) => (
              <tr key={s.id}>
                <th scope="row">
                  <Link href={href(s.slug)} className="layers-craft">
                    <span>{s.title}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </th>
                <td className="data" data-label={d.layers.data}>
                  {s.dataLayer}
                </td>
                <td className="search" data-label={d.layers.search}>
                  {s.searchLayer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function WorkCard({ c, locale }: { c: CaseStudy; locale: BlockProps<'featuredWork'>['locale'] }) {
  const d = t(locale)
  const award = populated(c.award)
  const meta = [
    populated(c.client)?.name,
    award ? `${d.result[award.result]}, ${d.shows[award.show] || award.showName || ''}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <Link href={localePath(locale, `/work/${c.slug}`)} className="work-card">
      {c.headline?.value ? <span className="num">{c.headline.value}</span> : null}
      {c.headline?.label ? <span className="label">{c.headline.label}</span> : null}
      <span className="meta">{meta}</span>
      <h3>{c.title}</h3>
    </Link>
  )
}

export async function FeaturedWorkBlock({ block, locale }: BlockProps<'featuredWork'>) {
  const d = t(locale)
  const picked = (block.caseStudies ?? [])
    .map((c) => populated(c))
    .filter((c): c is CaseStudy => Boolean(c))
  const cases = picked.length ? picked : await getFeaturedCaseStudies(locale)
  if (!cases.length) return null
  return (
    <section className="section" style={{ paddingTop: 24 }}>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="kicker">{d.kickers.work}</p>
            {block.heading ? <h2 className="h2">{block.heading}</h2> : null}
          </div>
          <Link href={localePath(locale, '/work')} className="btn btn-ghost">
            {d.allCaseStudies}
          </Link>
        </div>
        <div className="cards">
          {cases.map((c) => (
            <WorkCard key={c.id} c={c} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}

export async function AwardsBlock({ block, locale }: BlockProps<'awards'>) {
  const d = t(locale)
  const awards = await getAwards(locale)
  return (
    <section className="section section-band">
      <div className="wrap awards-layout">
        <div>
          <p className="kicker">{d.kickers.awards}</p>
          {block.heading ? <h2 className="h2">{block.heading}</h2> : null}
        </div>
        <ul className="award-list">
          {awards.map((a) => (
            <li key={a.id}>
              <span>
                <strong>{d.result[a.result]}</strong> · {d.shows[a.show] || a.showName}
              </span>
              <span className="cat">
                {a.category}
                {a.credit === 'joint' ? ` · ${d.withIntegrated}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export async function ClientLogosBlock({ block, locale }: BlockProps<'clientLogos'>) {
  const d = t(locale)
  const clients = await getLogoClients()
  return (
    <section className="section">
      <div className="wrap">
        <SectionHead kicker={d.kickers.clients} heading={block.heading} intro={d.clientsIntro} />
        <ul className="logos">
          {clients.map((c) => {
            const src = mediaUrl(c.logo)
            return src ? (
              <li key={c.id}>
                <img src={src} alt={c.name} loading="lazy" />
              </li>
            ) : null
          })}
        </ul>
      </div>
    </section>
  )
}

export function MethodBlock({ block }: BlockProps<'method'>) {
  return (
    <section className="section">
      <div className="wrap">
        {block.heading ? (
          <h2 className="h2" style={{ marginBottom: 32 }}>
            {block.heading}
          </h2>
        ) : null}
        <div className="method">
          {(block.steps ?? []).map((s, i) => (
            <div key={s.id ?? i}>
              <p className="kicker">{String(i + 1).padStart(2, '0')}</p>
              <h3>{s.title}</h3>
              {s.text ? <p>{s.text}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FAQBlock({ block }: BlockProps<'faq'>) {
  return (
    <section className="section">
      <div className="wrap faq">
        {block.heading ? (
          <h2 className="h2" style={{ marginBottom: 24 }}>
            {block.heading}
          </h2>
        ) : null}
        {(block.items ?? []).map((item, i) => (
          <details key={item.id ?? i}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function CTABlock({ block, locale }: BlockProps<'cta'>) {
  return (
    <section className="section">
      <div className="wrap cta-row">
        <div>
          <h2 className="h2">{block.heading}</h2>
          {block.text ? (
            <p style={{ marginTop: 12, color: 'var(--text-2)' }}>{block.text}</p>
          ) : null}
        </div>
        {block.label && block.href ? (
          <Link
            href={block.href.startsWith('/') ? localePath(locale, block.href) : block.href}
            className="btn btn-primary"
          >
            {block.label}
          </Link>
        ) : null}
      </div>
    </section>
  )
}

export function RichTextBlock({ block }: BlockProps<'richText'>) {
  return (
    <section className="section">
      <div className="wrap prose">
        <RichText data={block.content} />
      </div>
    </section>
  )
}
