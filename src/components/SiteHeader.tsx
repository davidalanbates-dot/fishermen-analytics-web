import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'

const nav = {
  en: [
    ['Services', '/services'],
    ['Work', '/work'],
    ['About', '/about'],
    ['Insights', '/insights'],
    ['Careers', '/careers'],
    ['Contact', '/contact'],
  ],
  ms: [
    ['Perkhidmatan', '/services'],
    ['Hasil Kerja', '/work'],
    ['Tentang Kami', '/about'],
    ['Wawasan', '/insights'],
    ['Kerjaya', '/careers'],
    ['Hubungi', '/contact'],
  ],
} as const

/** Header is navigation only, no logo (agreed). The logo sits in the footer. */
export function SiteHeader({ locale }: { locale: Locale }) {
  const other: Locale = locale === 'en' ? 'ms' : 'en'
  return (
    <header className="site-header">
      <a className="skip" href="#main">
        {locale === 'en' ? 'Skip to content' : 'Langkau ke kandungan'}
      </a>
      <nav className="wrap nav" aria-label={locale === 'en' ? 'Main' : 'Utama'}>
        <Link href={localePath(locale, '/')} className="nav-home">
          {locale === 'en' ? 'Home' : 'Utama'}
        </Link>
        <ul>
          {nav[locale].map(([label, href]) => (
            <li key={href}>
              <Link href={localePath(locale, href)}>{label}</Link>
            </li>
          ))}
        </ul>
        <Link href={localePath(other, '/')} hrefLang={other} lang={other} className="lang">
          {other === 'ms' ? 'BM' : 'EN'}
        </Link>
      </nav>
    </header>
  )
}
