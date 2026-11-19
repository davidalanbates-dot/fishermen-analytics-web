import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { getSiteSettings } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return cmsPageMetadata('contact', locale, '/contact')
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  const d = t(locale)
  const settings = await getSiteSettings(locale)
  const a = settings.address

  // Office, email and phone come from Site settings; missing ones say "to be confirmed"
  const facts = (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="wrap contact-facts">
        <div>
          <h2>{d.inner.office}</h2>
          {a?.street ? (
            <p>
              {a.street}
              <br />
              {a.postcode} {a.city}, {a.state}
            </p>
          ) : (
            <p className="muted">{d.inner.notYet}</p>
          )}
        </div>
        <div>
          <h2>{d.inner.email}</h2>
          {settings.email ? (
            <p>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </p>
          ) : (
            <p className="muted">{d.inner.notYet}</p>
          )}
        </div>
        <div>
          <h2>{d.inner.phone}</h2>
          {settings.phone ? (
            <p>
              <a href={`tel:${settings.phone.replace(/\s+/g, '')}`}>{settings.phone}</a>
            </p>
          ) : (
            <p className="muted">{d.inner.notYet}</p>
          )}
        </div>
        <div>
          <h2>{d.inner.who}</h2>
          <p>{d.inner.whoText}</p>
        </div>
      </div>
    </section>
  )

  return <CmsPage slug="contact" locale={locale} before={facts} />
}
