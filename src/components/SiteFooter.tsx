/* eslint-disable @next/next/no-img-element -- CMS media; sizes come from the CMS */
import Link from 'next/link'

import { localePath, type Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { getServices, getSiteSettings, mediaUrl } from '@/lib/payload'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const d = t(locale)
  const [settings, services] = await Promise.all([getSiteSettings(locale), getServices(locale)])
  const logo = mediaUrl(settings.logo) ?? '/brand/fishermen-analytics-logo-wide.png'
  const address = settings.address
  const company = (['work', 'about', 'awards', 'insights', 'careers', 'contact'] as const).map(
    (key) => ({
      label: key === 'awards' ? d.footer.awards : d.nav[key],
      href: localePath(locale, `/${key}`),
    }),
  )

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="brand">
          <img src={logo} alt={settings.companyName} width={220} height={73} />
          <p style={{ marginTop: 16 }}>
            {d.footer.family}{' '}
            <a href={settings.fishermenIntegratedUrl || 'https://www.fishermen.co'}>
              Fishermen Integrated
            </a>
            .
          </p>
        </div>
        <div>
          <h2>{d.footer.services}</h2>
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <Link href={localePath(locale, `/services/${s.slug}`)}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{d.footer.company}</h2>
          <ul>
            {company.map((c) => (
              <li key={c.href}>
                <Link href={c.href}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{d.footer.visit}</h2>
          {address?.street ? (
            <p>
              {address.street}, {address.postcode} {address.city}, {address.state}
            </p>
          ) : null}
          {settings.email ? (
            <p style={{ marginTop: 8 }}>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </p>
          ) : null}
          {settings.phone ? <p>{settings.phone}</p> : null}
        </div>
      </div>
      <div className="wrap legal">
        © {new Date().getFullYear()} {settings.legalName || 'Fishermen Analytics Sdn Bhd'}
      </div>
    </footer>
  )
}
