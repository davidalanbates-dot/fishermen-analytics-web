/**
 * Structured data (schema.org JSON-LD). Key facts come from Site settings so they stay
 * identical everywhere they appear: on the site, in llms.txt and (by hand) on fishermen.co,
 * LinkedIn and directories.
 */
import { localePath, type Locale } from '@/i18n/config'
import type { CaseStudy, Insight, Service, SiteSetting, Team } from '@/payload-types'
import { mediaUrl, populated } from './payload'
import { richTextToPlain } from './seo'

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')

/** Absolute URL for a language-neutral path in the given language. */
export const absUrl = (locale: Locale, path: string) => siteUrl() + localePath(locale, path)
const abs = (pathOrUrl: string | null | undefined) =>
  !pathOrUrl ? undefined : pathOrUrl.startsWith('http') ? pathOrUrl : siteUrl() + pathOrUrl

const ORG_ID = () => `${siteUrl()}/#organization`
const SITE_ID = () => `${siteUrl()}/#website`
const lang = (locale: Locale) => (locale === 'ms' ? 'ms-MY' : 'en-MY')

type Thing = Record<string, unknown>

export function organization(settings: SiteSetting, locale: Locale): Thing {
  const a = settings.address
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID(),
    name: settings.companyName,
    legalName: settings.legalName || undefined,
    url: absUrl(locale, '/'),
    logo: abs(mediaUrl(settings.logo) ?? '/brand/fishermen-analytics-logo-wide.png'),
    image: abs(mediaUrl(settings.logo) ?? '/brand/fishermen-analytics-logo-wide.png'),
    description: settings.description || undefined,
    slogan: settings.tagline || undefined,
    foundingDate: settings.foundingYear ? String(settings.foundingYear) : undefined,
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: a?.street
      ? {
          '@type': 'PostalAddress',
          streetAddress: a.street,
          postalCode: a.postcode || undefined,
          addressLocality: a.city || undefined,
          addressRegion: a.state || undefined,
          addressCountry: a.country || 'MY',
        }
      : undefined,
    areaServed: [
      { '@type': 'Country', name: 'Malaysia' },
      { '@type': 'Country', name: 'Singapore' },
    ],
    knowsAbout: [
      'Data analytics',
      'Search engine optimisation',
      'Generative engine optimisation',
      'Digital marketing',
    ],
    sameAs: (settings.socials ?? []).map((s) => s.url).filter(Boolean),
  }
}

export function website(settings: SiteSetting, locale: Locale): Thing {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID(),
    url: absUrl(locale, '/'),
    name: settings.companyName,
    inLanguage: ['en-MY', 'ms-MY'],
    publisher: { '@id': ORG_ID() },
  }
}

export function breadcrumbs(locale: Locale, trail: { name: string; path: string }[]): Thing {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: absUrl(locale, t.path),
    })),
  }
}

export function service(s: Service, locale: Locale): Thing {
  const layers = [s.dataLayer, s.searchLayer].filter(Boolean).join(' ')
  return {
    '@type': 'Service',
    '@id': `${absUrl(locale, `/services/${s.slug}`)}#service`,
    name: s.title,
    serviceType: s.title,
    description: [s.summary, layers].filter(Boolean).join(' '),
    url: absUrl(locale, `/services/${s.slug}`),
    provider: { '@id': ORG_ID() },
    areaServed: ['MY', 'SG'],
    inLanguage: lang(locale),
  }
}

export function faqPage(items: { question: string; answer: string }[] | null | undefined) {
  if (!items?.length) return null
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function person(p: Team, locale: Locale): Thing {
  return {
    '@type': 'Person',
    name: p.name,
    jobTitle: p.jobTitle,
    image: abs(mediaUrl(p.photo)),
    description: p.bio ? richTextToPlain(p.bio, 300) : undefined,
    sameAs: p.linkedin ? [p.linkedin] : undefined,
    worksFor: { '@id': ORG_ID() },
    url: absUrl(locale, '/about'),
  }
}

export function article(a: Insight, locale: Locale): Thing {
  const author = populated(a.author)
  return {
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt || richTextToPlain(a.content),
    image: abs(mediaUrl(a.heroImage)),
    datePublished: a.publishedAt || a.createdAt,
    dateModified: a.updatedAt,
    inLanguage: lang(locale),
    url: absUrl(locale, `/insights/${a.slug}`),
    mainEntityOfPage: absUrl(locale, `/insights/${a.slug}`),
    author: author
      ? { '@type': 'Person', name: author.name, jobTitle: author.jobTitle }
      : { '@id': ORG_ID() },
    publisher: { '@id': ORG_ID() },
  }
}

/** A case study as a creative work by the agency for a client. Results stay as percentages. */
export function caseStudy(c: CaseStudy, locale: Locale): Thing {
  const client = populated(c.client)
  return {
    '@type': 'CreativeWork',
    name: c.title,
    headline: client ? `${client.name}: ${c.title}` : c.title,
    description: c.excerpt || richTextToPlain(c.challenge),
    url: absUrl(locale, `/work/${c.slug}`),
    inLanguage: lang(locale),
    creator: { '@id': ORG_ID() },
    sourceOrganization: { '@id': ORG_ID() },
    about: client ? { '@type': 'Organization', name: client.name } : undefined,
    image: abs(mediaUrl(c.heroImage)),
    dateModified: c.updatedAt,
  }
}

/** Wraps nodes in one @graph document, dropping empty ones. */
export function graph(...nodes: (Thing | null | undefined)[]) {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) }
}

/** True only on the live site (Vercel production, or a build whose URL is the real domain). */
export const isProductionSite = () =>
  process.env.VERCEL_ENV === 'production' ||
  (!process.env.VERCEL_ENV && siteUrl().includes('fishermen-analytics.com'))
