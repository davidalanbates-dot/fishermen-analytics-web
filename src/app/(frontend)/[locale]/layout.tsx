import type { Metadata } from 'next'
import { Work_Sans, Zilla_Slab } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { isLocale, locales } from '@/i18n/config'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import '../styles.css'

// Provisional fonts from the preview; swap here when the design is final.
const display = Zilla_Slab({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
})
const body = Work_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: { default: 'Fishermen Analytics', template: '%s | Fishermen Analytics' },
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

  return (
    <html
      lang={locale === 'ms' ? 'ms-MY' : 'en-MY'}
      className={`${display.variable} ${body.variable}`}
    >
      <body>
        <SiteHeader locale={locale} />
        <main id="main">{props.children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  )
}
