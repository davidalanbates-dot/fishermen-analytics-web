import type { Metadata } from 'next'
import { localePath, type Locale } from '@/i18n/config'

/**
 * Placeholder homepage. The real homepage renders the "home" document from the Pages
 * collection (blocks: hero, services + game, featured work, awards, logos, family, enquiry form).
 */
const copy = {
  en: {
    eyebrow: 'The data-led Fishermen',
    heading: 'Marketing that starts with the data.',
    intro:
      'Fishermen Analytics is an independent digital marketing agency in Malaysia, founded in 2014. We turn data and user behaviour into marketing that delivers measurable results.',
  },
  ms: {
    eyebrow: 'Fishermen yang berpandukan data',
    heading: 'Pemasaran yang bermula dengan data.',
    intro:
      'Fishermen Analytics ialah agensi pemasaran digital bebas di Malaysia, ditubuhkan pada 2014. Kami menukar data dan tingkah laku pengguna kepada pemasaran yang memberikan hasil yang boleh diukur.',
  },
} satisfies Record<Locale, Record<string, string>>

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await props.params
  return {
    title: { absolute: `Fishermen Analytics | ${copy[locale].heading}` },
    description: copy[locale].intro,
    alternates: {
      canonical: localePath(locale, '/'),
      languages: { 'en-MY': '/', 'ms-MY': '/ms', 'x-default': '/' },
    },
  }
}

export default async function HomePage(props: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await props.params
  const t = copy[locale]
  return (
    <section className="hero">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.heading}</h1>
        <p className="lede">{t.intro}</p>
      </div>
    </section>
  )
}
