import Link from 'next/link'

import { localePath } from '@/i18n/config'
import { t } from '@/i18n/dictionary'
import { getFeaturedCaseStudies, populated } from '@/lib/payload'
import type { CaseStudy } from '@/payload-types'
import type { BlockProps } from './types'

/** Highlights the last two words of the heading in yellow ("…with the data."). */
function splitHeading(heading: string) {
  const words = heading.trim().split(/\s+/)
  if (words.length < 4) return { lead: heading, hl: '' }
  return { lead: words.slice(0, -2).join(' ') + ' ', hl: words.slice(-2).join(' ') }
}

/** The "fish finder": featured results appear as catches on a sonar display. */
function Sonar({ cases, label }: { cases: CaseStudy[]; label: string }) {
  const spots = [
    { cx: 300, cy: 120, tx: 314, ty: 114 },
    { cx: 236, cy: 70, tx: 174, ty: 52 },
    { cx: 128, cy: 150, tx: 54, ty: 138 },
  ]
  const results = cases.filter((c) => c.headline?.value).slice(0, 3)
  const aria = `${label}: ${results.map((c) => `${c.headline?.value} ${c.headline?.label}`).join(', ')}`
  return (
    <svg
      className="sonar"
      width="420"
      height="260"
      viewBox="0 0 420 260"
      role="img"
      aria-label={aria}
    >
      {[60, 120, 180, 240].map((r, i) => (
        <circle
          key={r}
          cx="210"
          cy="250"
          r={r}
          fill="none"
          stroke="#00A2E8"
          strokeOpacity={0.55 - i * 0.13}
          strokeWidth="1.5"
        />
      ))}
      <line x1="210" y1="250" x2="360" y2="62" stroke="#00A2E8" strokeWidth="2" />
      {results.map((c, i) => (
        <g key={c.id}>
          <circle cx={spots[i].cx} cy={spots[i].cy} r="7" fill="#FFF200" />
          <text
            x={spots[i].tx}
            y={spots[i].ty}
            fill="#FFF200"
            fontFamily="var(--font-display), sans-serif"
            fontWeight="700"
            fontSize="20"
          >
            {c.headline?.value}
          </text>
        </g>
      ))}
    </svg>
  )
}

export async function HeroBlock({ block, locale }: BlockProps<'hero'>) {
  const d = t(locale)
  const featured = block.brandingArea ? await getFeaturedCaseStudies(locale) : []
  const { lead, hl } = splitHeading(block.heading)
  const links = block.links ?? []

  return (
    <section className={block.brandingArea ? 'hero' : 'hero page-hero'}>
      <div className="wrap">
        {block.brandingArea ? (
          <div className="brand-zone">
            <div className="wordmark">
              <p className="kicker">{d.sonarLabel}</p>
              <p className="wordmark-text" aria-hidden="true">
                Fishermen
                <br />
                <span>Analytics</span>
              </p>
            </div>
            <Sonar cases={featured} label={d.sonarAria} />
          </div>
        ) : null}

        <div className="hero-grid">
          <div className="hero-main">
            {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
            <h1>
              {lead}
              {hl ? <span className="hl">{hl}</span> : null}
            </h1>
            {block.intro ? <p className="lede">{block.intro}</p> : null}
            {links.length ? (
              <div className="ctas">
                {links.map((link, i) => (
                  <Link
                    key={link.id ?? i}
                    href={link.href.startsWith('/') ? localePath(locale, link.href) : link.href}
                    className={`btn ${i === 0 ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {featured.length ? (
            <div className="proof">
              {featured.map((c) => (
                <Link key={c.id} href={localePath(locale, `/work/${c.slug}`)}>
                  <p className="num">{c.headline?.value}</p>
                  <p className="what">
                    {c.headline?.label} · {populated(c.client)?.name}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
