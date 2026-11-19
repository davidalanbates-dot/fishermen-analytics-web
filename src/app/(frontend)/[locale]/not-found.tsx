import Link from 'next/link'

import { t } from '@/i18n/dictionary'

/** Shown for unknown pages. Rendered inside the site layout (English copy; BM pages fall back). */
export default function NotFound() {
  const d = t('en')
  return (
    <section className="page-head" style={{ minHeight: '50vh' }}>
      <div className="wrap">
        <p className="kicker">404</p>
        <h1>{d.inner.notFoundTitle}</h1>
        <p className="lede">{d.inner.notFoundText}</p>
        <div className="ctas">
          <Link href="/" className="btn btn-primary">
            {d.nav.home}
          </Link>
          <Link href="/work" className="btn btn-ghost">
            {d.nav.work}
          </Link>
        </div>
      </div>
    </section>
  )
}
