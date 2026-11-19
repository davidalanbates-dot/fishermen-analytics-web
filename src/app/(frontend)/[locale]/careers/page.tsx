import Link from 'next/link'

import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'
import { localePath, type Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { getOpenJobs, getSiteSettings } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return cmsPageMetadata('careers', locale, '/careers')
}

export default async function CareersPage({ params }: Props) {
  const { locale } = await params
  const d = t(locale)
  const [jobs, settings] = await Promise.all([getOpenJobs(locale), getSiteSettings(locale)])
  const cvHref = settings.email ? `mailto:${settings.email}` : localePath(locale, '/contact')

  return (
    <CmsPage
      slug="careers"
      locale={locale}
      after={
        <section className="section">
          <div className="wrap">
            <h2 className="h2" style={{ marginBottom: 24 }}>
              {d.inner.openRoles}
            </h2>
            {jobs.length ? (
              <div className="list-cards">
                {jobs.map((job) => (
                  <a key={job.id} href={job.applyUrl || cvHref} className="list-card">
                    <div>
                      <h3>{job.title}</h3>
                      <p>
                        {[
                          job.location,
                          job.closingDate
                            ? `${d.inner.closes} ${new Date(job.closingDate).toLocaleDateString(locale === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {job.summary ? <p>{job.summary}</p> : null}
                    </div>
                    <span className="btn btn-ghost">{d.inner.apply}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-note">
                <p>{d.inner.noRoles}</p>
                <p style={{ marginTop: 14 }}>
                  {settings.email ? (
                    <a href={cvHref} className="btn btn-primary">
                      {d.inner.sendCv}
                    </a>
                  ) : (
                    <Link href={cvHref} className="btn btn-primary">
                      {d.inner.sendCv}
                    </Link>
                  )}
                </p>
              </div>
            )}
          </div>
        </section>
      }
    />
  )
}
