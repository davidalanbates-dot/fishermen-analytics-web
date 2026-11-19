import Link from 'next/link'

import { localePath, type Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { NavLinks } from './NavLinks'

/** Header is navigation only, no logo (agreed). The logo sits in the footer. */
export function SiteHeader({ locale }: { locale: Locale }) {
  const d = t(locale)
  const other: Locale = locale === 'en' ? 'ms' : 'en'
  const links = (
    ['home', 'services', 'work', 'about', 'insights', 'careers', 'contact'] as const
  ).map((key) => ({
    label: d.nav[key],
    href: localePath(locale, key === 'home' ? '/' : `/${key}`),
  }))

  return (
    <header className="site-header">
      <nav className="wrap nav" aria-label={d.main}>
        <NavLinks links={links} menuLabel={d.menu} closeLabel={d.closeMenu} />
        <div className="nav-actions">
          <Link
            href={localePath(other, '/')}
            hrefLang={other}
            lang={other}
            className="lang"
            aria-label={d.switchLanguageLabel}
          >
            {d.switchLanguage}
          </Link>
          <Link href={localePath(locale, '/contact')} className="btn btn-primary">
            {d.startProject}
          </Link>
        </div>
      </nav>
    </header>
  )
}
