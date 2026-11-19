/* eslint-disable @next/next/no-img-element -- team photos come from the CMS */
import { RichText } from '@payloadcms/richtext-lexical/react'

import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'
import { CtaBand } from '@/components/PageParts'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { person } from '@/lib/jsonld'
import { getTeam, mediaUrl } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return cmsPageMetadata('about', locale, '/about')
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const d = t(locale)
  const team = await getTeam(locale)

  return (
    <CmsPage
      slug="about"
      schema={team.map((p) => person(p, locale))}
      locale={locale}
      after={
        <>
          {team.length ? (
            <section className="section section-band">
              <div className="wrap">
                <p className="kicker">{d.inner.teamKicker}</p>
                <h2 className="h2" style={{ marginBottom: 32 }}>
                  {d.inner.teamHeading}
                </h2>
                <div className="team">
                  {team.map((p) => {
                    const photo = mediaUrl(p.photo)
                    return (
                      <article key={p.id} className="person">
                        <div className="avatar" aria-hidden={photo ? undefined : true}>
                          {photo ? <img src={photo} alt={p.name} /> : initials(p.name)}
                        </div>
                        <h3>{p.name}</h3>
                        <p className="role">{p.jobTitle}</p>
                        <div className="bio">
                          {p.bio ? (
                            <RichText data={p.bio} />
                          ) : (
                            <p className="muted">{d.inner.bioSoon}</p>
                          )}
                        </div>
                        {p.linkedin ? (
                          <a
                            href={p.linkedin}
                            className="muted"
                            style={{ display: 'inline-block', marginTop: 12 }}
                          >
                            LinkedIn ↗
                          </a>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </div>
            </section>
          ) : null}
          <CtaBand locale={locale} />
        </>
      }
    />
  )
}
