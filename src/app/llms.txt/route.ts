import { absUrl, siteUrl } from '@/lib/jsonld'
import {
  getAwards,
  getCaseStudies,
  getServices,
  getSiteSettings,
  hasCaseStudyPage,
  populated,
} from '@/lib/payload'
import { t } from '@/i18n/dictionary'

export const revalidate = 3600

/**
 * llms.txt (https://llmstxt.org): a plain summary of who we are and what we do, built
 * from the CMS so it always matches the site. Written to be quoted accurately in AI answers.
 * Rules carried over from the site: results as percentages only; awards without year,
 * level or client.
 */
export async function GET() {
  const [settings, services, cases, awards] = await Promise.all([
    getSiteSettings('en'),
    getServices('en'),
    getCaseStudies('en'),
    getAwards('en'),
  ])
  const d = t('en')
  const crafts = services.filter((s) => (s.role ?? 'craft') === 'craft')
  const dataLayer = services.find((s) => s.role === 'data')
  const searchLayer = services.find((s) => s.role === 'search')
  const a = settings.address

  const lines: string[] = []
  const push = (...l: string[]) => lines.push(...l)

  push(`# ${settings.companyName}`, '')
  if (settings.description) push(`> ${settings.description}`, '')

  push('## Key facts', '')
  push(`- Legal name: ${settings.legalName || settings.companyName}`)
  if (settings.foundingYear) push(`- Founded: ${settings.foundingYear}`)
  push('- Type: independent digital marketing agency')
  if (a?.street) push(`- Office: ${a.street}, ${a.postcode} ${a.city}, ${a.state}, Malaysia`)
  push('- Clients in: Malaysia and Singapore')
  push('- Languages: English and Bahasa Malaysia')
  if (settings.email) push(`- Email: ${settings.email}`)
  if (settings.phone) push(`- Phone: ${settings.phone}`)
  push(
    `- Part of the Fishermen family, alongside the sister agency Fishermen Integrated (${settings.fishermenIntegratedUrl || 'https://www.fishermen.co'}), known for big creative ideas. Fishermen Analytics is the data-led agency.`,
  )
  push(`- Website: ${siteUrl()}`, '')

  push('## How we work', '')
  push(
    'Everything we make starts with data and is built to be found. Two layers run through all of our work:',
    '',
  )
  if (dataLayer)
    push(
      `- [${dataLayer.title}](${absUrl('en', `/services/${dataLayer.slug}`)}) (the data layer): ${dataLayer.summary}`,
    )
  if (searchLayer)
    push(
      `- [${searchLayer.title}](${absUrl('en', `/services/${searchLayer.slug}`)}) (the search layer): ${searchLayer.summary}`,
    )
  push('', 'Both are also available as standalone services.', '')

  push('## What we make', '')
  for (const s of crafts) {
    push(`- [${s.title}](${absUrl('en', `/services/${s.slug}`)}): ${s.summary}`)
    if (s.dataLayer) push(`  - Data layer: ${s.dataLayer}`)
    if (s.searchLayer) push(`  - Search layer: ${s.searchLayer}`)
  }
  push('')

  push('## Selected work', '')
  push('Results are shown as percentages to protect client data.', '')
  for (const c of cases.filter(hasCaseStudyPage)) {
    const client = populated(c.client)?.name
    push(`### [${client ? `${client}: ` : ''}${c.title}](${absUrl('en', `/work/${c.slug}`)})`, '')
    if (c.excerpt) push(c.excerpt, '')
    for (const r of c.results ?? []) push(`- ${r.value} ${r.label}`)
    if (c.resultsPeriod) push(`- Period: ${c.resultsPeriod}`)
    push('')
  }

  if (awards.length) {
    push('## Awards', '')
    for (const w of awards) {
      const credit = w.credit === 'joint' ? ` (${d.withIntegrated})` : ''
      push(`- ${d.result[w.result]}, ${d.shows[w.show] || w.showName}: ${w.category}${credit}`)
    }
    push('')
  }

  push('## Pages', '')
  push(`- [Services](${absUrl('en', '/services')})`)
  push(`- [Work](${absUrl('en', '/work')})`)
  push(`- [About](${absUrl('en', '/about')})`)
  push(`- [Awards](${absUrl('en', '/awards')})`)
  push(`- [Insights](${absUrl('en', '/insights')})`)
  push(`- [Careers](${absUrl('en', '/careers')})`)
  push(`- [Contact](${absUrl('en', '/contact')})`)
  push(`- [Bahasa Malaysia version](${absUrl('ms', '/')})`)
  push(`- [Sitemap](${siteUrl()}/sitemap.xml)`, '')

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
