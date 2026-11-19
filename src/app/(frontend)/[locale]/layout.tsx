import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { isLocale, locales } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { Analytics } from '@/components/Analytics'
import { JsonLd } from '@/components/JsonLd'
import { graph, isProductionSite, organization, website } from '@/lib/jsonld'
import { getSiteSettings } from '@/lib/payload'
import '../styles.css'

// Direction B · Sonar: Space Grotesk for headings and numbers, Inter for body text.
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
})
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: { default: 'Fishermen Analytics', template: '%s | Fishermen Analytics' },
  // Only the live site may be indexed; previews, staging and local copies say noindex
  robots: isProductionSite() ? undefined : { index: false, follow: false },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  if (!isLocale(locale)) notFound()
  const settings = await getSiteSettings(locale)

  return (
    <html
      lang={locale === 'ms' ? 'ms-MY' : 'en-MY'}
      className={`${display.variable} ${body.variable}`}
    >
      <body>
        <a className="skip" href="#main">
          {t(locale).skip}
        </a>
        <SiteHeader locale={locale} />
        <main id="main">{props.children}</main>
        <SiteFooter locale={locale} />
        <JsonLd data={graph(organization(settings, locale), website(settings, locale))} />
        <Analytics
          measurementId={settings.ga4MeasurementId}
          verification={settings.searchConsoleVerification}
          enabled={isProductionSite()}
        />
      </body>
    </html>
  )
}
