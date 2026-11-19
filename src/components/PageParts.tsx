import Link from 'next/link'
import type { ReactNode } from 'react'

import { localePath, type Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'

/** Standard header for inner pages: optional back link, kicker, H1, intro and extras. */
export function PageHead(props: {
  kicker?: string | null
  title: string
  intro?: string | null
  back?: { href: string; label: string }
  children?: ReactNode
}) {
  return (
    <section className="page-head">
      <div className="wrap">
        {props.back ? (
          <Link href={props.back.href} className="back-link">
            {props.back.label}
          </Link>
        ) : null}
        {props.kicker ? <p className="kicker">{props.kicker}</p> : null}
        <h1>{props.title}</h1>
        {props.intro ? <p className="lede">{props.intro}</p> : null}
        {props.children}
      </div>
    </section>
  )
}

/** Closing band on inner pages that sends people to the enquiry form. */
export function CtaBand({ locale }: { locale: Locale }) {
  const d = t(locale)
  return (
    <section className="section cta-band">
      <div className="wrap cta-row">
        <h2 className="h2">{d.inner.ctaHeading}</h2>
        <Link href={localePath(locale, '/contact')} className="btn btn-primary">
          {d.startProject}
        </Link>
      </div>
    </section>
  )
}
