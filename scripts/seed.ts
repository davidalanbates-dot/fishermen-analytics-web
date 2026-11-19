/**
 * Loads the agreed website content into the CMS (English only; BM is drafted after sign-off).
 *
 *   npm run seed     (with the database running: npm run db, or npm run dev:local in another terminal)
 *
 * Safe to run more than once: records are matched by slug or name and updated, not duplicated.
 * Sources: CLAUDE.md (brief), seed/content/case-studies.md, docs/reference/preview.html.
 * Results are percentages only (agreed rule); awards show no level, year or client.
 */
import path from 'path'
import { getPayload, type Payload, type Where } from 'payload'
import { fileURLToPath } from 'url'
import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '..')

// ---------- Rich text helpers (Lexical JSON) ----------

const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})
const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }
const paragraph = (value: string) => ({
  ...base,
  type: 'paragraph',
  textFormat: 0,
  children: [text(value)],
})
const bullets = (items: string[]) => ({
  ...base,
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  children: items.map((item, i) => ({
    ...base,
    type: 'listitem',
    value: i + 1,
    children: [text(item)],
  })),
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const richText = (...children: any[]): any => ({ root: { ...base, type: 'root', children } })

// ---------- Upsert helpers ----------

type Slug = Parameters<Payload['find']>[0]['collection']

async function upsert(
  payload: Payload,
  collection: Slug,
  where: Where,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
): Promise<number> {
  const found = await payload.find({ collection, where, limit: 1, depth: 0, draft: true })
  const existing = found.docs[0] as { id: number } | undefined
  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection, id: existing.id, data: data as any, depth: 0 })
    return existing.id
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await payload.create({ collection, data: data as any, depth: 0 })
  return created.id as number
}

async function upsertMedia(payload: Payload, file: string, alt: string): Promise<number> {
  const found = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    depth: 0,
  })
  if (found.docs[0]) return found.docs[0].id as number
  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.resolve(root, file),
  })
  return created.id as number
}

// ---------- Content ----------

type SeedService = {
  slug: string
  title: string
  gameLabel: string
  gameIcon: string
  role?: 'craft' | 'data' | 'search'
  summary: string
  items: string[]
  dataLayer?: string
  searchLayer?: string
}

const SERVICES: SeedService[] = [
  {
    slug: 'data-analytics',
    gameIcon: 'analytics',
    title: 'Data Analytics',
    gameLabel: 'Data Analytics',
    role: 'data',
    summary:
      'Tracking, dashboards and audience insight that show what is really driving your growth, and what to do next.',
    items: [
      'Google Analytics 4 and tag setup',
      'Dashboards and performance reporting',
      'Audience and behaviour insight with GWI and social insight tools',
      'Conversion and funnel optimisation',
    ],
  },
  {
    slug: 'seo-geo',
    gameIcon: 'seo',
    title: 'SEO / GEO Optimisation',
    gameLabel: 'SEO/GEO',
    role: 'search',
    summary:
      'Visibility on Google and in AI answers from Google AI Overviews, ChatGPT, Gemini and Perplexity.',
    items: [
      'Technical and on-page SEO',
      'Content strategy and predictive keyword research',
      'AI Overview and AI assistant visibility (GEO)',
      'Schema, site health and Core Web Vitals',
    ],
  },
  {
    slug: 'creative-production',
    gameIcon: 'creative',
    dataLayer: 'Audience insight from GWI and social listening shapes the idea.',
    searchLayer: 'Copy and assets written to rank and to be quoted in AI answers.',
    title: 'Creative Production',
    gameLabel: 'Creative',
    summary: 'Campaign ideas, design and copy built on what the data says about your audience.',
    items: [
      'Campaign concepts',
      'Design and copywriting',
      'Insight-led content',
      'English and Bahasa Malaysia content',
    ],
  },
  {
    slug: 'video-production',
    gameIcon: 'video',
    dataLayer: 'Viewing data picks the story, length and platform.',
    searchLayer: 'Transcripts, chapters and schema so Google and AI can find it.',
    title: 'Video Production',
    gameLabel: 'Video',
    summary:
      'Film and short-form video from script to screen, made for the platforms your audience watches.',
    items: [
      'Concept and scriptwriting',
      'Production and direction',
      'Editing and post-production',
      'Short-form social video',
    ],
  },
  {
    slug: 'website-development',
    gameIcon: 'web',
    dataLayer: 'GA4 and conversion tracking built in from day one.',
    searchLayer: 'Fast and crawlable: Core Web Vitals, schema and llms.txt.',
    title: 'Website Development',
    gameLabel: 'Web Dev',
    summary: 'Fast, measurable websites and CMS builds, ready for search and AI from day one.',
    items: [
      'Corporate websites and microsites',
      'CMS design and build',
      'Mobile-first UI/UX',
      'Gamified and interactive experiences',
    ],
  },
  {
    slug: 'social-media-management',
    gameIcon: 'social',
    dataLayer: 'Weekly reporting moves effort to the posts that perform.',
    searchLayer: 'Content planned around what people actually search for.',
    title: 'Social Media Management',
    gameLabel: 'Social Media',
    summary: 'Always-on content, community management and reporting across your social channels.',
    items: [
      'Content calendars and creation',
      'Community management',
      'Influencer and creator partnerships',
      'Social reporting',
    ],
  },
  {
    slug: 'media-management',
    gameIcon: 'media',
    dataLayer: 'Budgets shift to what converts, tracked end to end.',
    searchLayer: 'Paid and organic search planned together, not in silos.',
    title: 'Media Management',
    gameLabel: 'Media',
    summary:
      'Paid media planning and buying across search, social and display, optimised against real outcomes.',
    items: [
      'Media planning and buying',
      'Search and social ads',
      'Performance funnels and retargeting',
      'Ongoing optimisation and reporting',
    ],
  },
]

/** Clients with a logo file in seed/client-logos. Notes are internal only. */
const LOGO_CLIENTS = [
  { name: 'Prince Court Medical Centre', file: 'prince-court.webp', industry: 'Healthcare' },
  { name: 'World Vision Malaysia', file: 'world-vision.svg', industry: 'Non-profit' },
  { name: 'Harvey Norman', file: 'harvey-norman.png', industry: 'Retail' },
  { name: 'Zuellig Pharma', file: 'zuellig-pharma.svg', industry: 'Healthcare' },
  { name: 'PERSOL', file: 'persol.svg', industry: 'Recruitment' },
  {
    name: 'Gleneagles Hospitals',
    file: 'gleneagles-hospitals.webp',
    industry: 'Healthcare',
    notes: 'Low resolution: ask the client for a larger logo.',
  },
  {
    name: 'Pantai Hospitals',
    file: 'pantai-hospitals.webp',
    industry: 'Healthcare',
    notes: 'Low resolution: ask the client for a larger logo.',
  },
  { name: 'Malaysia Healthcare', file: 'malaysia-healthcare.png', industry: 'Healthcare' },
  {
    name: 'Paramount Property',
    file: 'paramount-property.png',
    industry: 'Property',
    notes: 'Slogan already cropped.',
  },
  { name: 'Ellgy Plus', file: 'ellgy-plus.png', industry: 'Healthcare', notes: 'Already trimmed.' },
  {
    name: 'KWC Fashion Wholesale',
    file: 'kwc.png',
    industry: 'Retail',
    notes: 'Low resolution: ask the client for a larger logo.',
  },
  {
    name: 'SD Guthrie',
    file: 'sd-guthrie-white.png',
    industry: 'Plantation',
    hide: true,
    notes: 'White-only logo, invisible on light backgrounds. Need a colour or dark version.',
  },
]

/** Case study clients without a logo file yet. */
const OTHER_CLIENTS = [
  { name: 'Southern Valley (Farmbyte)', industry: 'Food and agriculture' },
  { name: 'Farmbyte', industry: 'Food and agriculture' },
  { name: "Taylor's University", industry: 'Education' },
  { name: 'PETRONAS', industry: 'Energy' },
  { name: 'Life Insurance Association of Malaysia', industry: 'Insurance' },
]

type Case = {
  slug: string
  client: string
  title: string
  services: string[]
  order: number
  featured?: boolean
  industry?: string
  excerpt?: string
  headline?: { value: string; label: string }
  challenge?: string
  whatWeDid?: string[]
  results?: [string, string][]
  resultsPeriod?: string
  award?: string // key in AWARDS
}

const CASES: Case[] = [
  {
    slug: 'prince-court',
    order: 1,
    featured: true,
    client: 'Prince Court Medical Centre',
    title: 'Growing search in the AI Overview era',
    services: ['seo-geo', 'data-analytics'],
    industry: 'Healthcare',
    excerpt:
      'How a private hospital grew organic search while AI Overviews took clicks and branded searches fell.',
    headline: { value: '+71.2%', label: 'unbranded organic traffic' },
    challenge:
      'AI Overviews now answer health questions on the results page, so fewer people click through to hospital websites. Searches for the Prince Court name were also falling, down 11.9%, while the hospital needed to stay among the top private hospitals in the Central Region.',
    whatWeDid: [
      "Planned content from trending searches and real patient questions, tied to Prince Court's priority specialties: 137 articles written, rewritten or optimised in 11 months.",
      'Structured every page for AI answers: clear questions, direct answers, FAQ and local schema, and an llms.txt file.',
      'Fixed the technical foundations so search engines and AI tools can crawl, understand and cite the site.',
    ],
    results: [
      [
        '+14.9%',
        'organic sessions, despite an 11.9% drop in branded searches and AI Overviews taking clicks',
      ],
      [
        '+71.2%',
        'unbranded organic traffic: new patients finding Prince Court through conditions and treatments',
      ],
      [
        '+442%',
        'organic article sessions, with specialty-page sessions up 12.3%, led by orthopaedics, O&G, paediatrics and cardiology',
      ],
      ['+15.2%', 'organic conversions, with returning organic visitors up 12.7%'],
      ['0 → 47', 'AI visibility score; AI search health up from 60 to 82, SEO score from 65 to 79'],
      [
        '+79%',
        'AI citations and pages cited by AI, with AI assistants now a new source of visitors',
      ],
    ],
    resultsPeriod: 'Organic: Sep 2025 to Jul 2026 vs the year before. AI: Aug 2025 vs Jul 2026.',
  },
  {
    slug: 'world-vision',
    order: 2,
    featured: true,
    client: 'World Vision Malaysia',
    title: 'Sponsoring more children with SEO',
    services: ['seo-geo', 'data-analytics'],
    industry: 'Non-profit',
    excerpt: 'SEO that turned falling organic traffic into more child sponsorships.',
    headline: { value: '+30%', label: 'organic traffic' },
    challenge:
      'Organic traffic fell 11% while searches in the sector rose, and child sponsorships dropped 4.7%. Larger charities were outspending World Vision on paid search.',
    whatWeDid: [
      'Used Google Analytics to find the pages people read before donating, and optimised those first.',
      'Rewrote the site in two months in a conversational, question-and-answer style to win position zero, voice and AI queries.',
      'Kept content fresh and had each page re-crawled as soon as it went live.',
    ],
    results: [
      ['+30%', 'organic traffic'],
      ['+66%', 'organic search impressions'],
      ['+24%', 'child sponsorship revenue, with 7.5% more children sponsored'],
      ['+83%', 'revenue from other donation programmes'],
    ],
    resultsPeriod: 'H2 2023 vs H2 2022.',
    award: 'mea-search',
  },
  {
    slug: 'kwc',
    order: 3,
    client: 'KWC Fashion Wholesale',
    title: 'Bilingual fashion storytelling',
    services: ['seo-geo', 'creative-production'],
    industry: 'Retail',
    excerpt:
      'English and Bahasa Malaysia fashion content that won back search traffic after AI Overviews.',
    headline: { value: '+26.5%', label: 'organic search traffic' },
    challenge:
      "After Google rolled out AI Overviews, organic search visits to Malaysia's largest fashion wholesale mall fell 51% in six months, in a market already dominated by bigger retail hubs.",
    whatWeDid: [
      'Wrote fashion content in English and Bahasa Malaysia built to be picked up by AI Overviews, in a truly Malaysian voice rather than straight translation.',
      'Ran weekly predictive keyword research in both languages, so articles on trends, events and festive fashion went live before interest peaked.',
    ],
    results: [
      ['+26.5%', 'organic search traffic, overtaking pre-AI Overview levels'],
      ['+12.8%', 'search impressions'],
      ['0% → 20%', 'of target fashion keywords featuring KWC in AI Overviews'],
    ],
    resultsPeriod: 'Eight months before vs eight months after.',
  },
  {
    slug: 'southern-valley',
    order: 4,
    featured: true,
    client: 'Southern Valley (Farmbyte)',
    title: 'Raya Confirm Ong',
    services: ['creative-production', 'video-production', 'social-media-management', 'seo-geo'],
    industry: 'Food and agriculture',
    excerpt: 'A Hari Raya film, found in the data, that grew a young pineapple brand.',
    headline: { value: '+43%', label: 'sales revenue' },
    challenge:
      'A premium MD2 pineapple brand less than a year old, in a market where pineapple consumption has fallen since 2017 and rivals had a ten-year head start.',
    whatWeDid: [
      'Found the audience in the data: Malay–Chinese marriages are rising, and Chinese households buy pineapples for prosperity ("ong").',
      'Made a Hari Raya film about an inter-ethnic couple, starring Alynna Wong, with pineapples bringing ong to the celebrations.',
      'Placed content on popular local sites to build long-term search visibility for pineapple searches.',
    ],
    results: [
      ['+43%', 'sales revenue'],
      ['+40%', 'retail distribution'],
      ['+990%', 'Instagram profile visits during the campaign, and +1,000% on TikTok'],
      ['Top 2024', 'named one of the top Hari Raya videos of 2024 by Cilisos and Beautiful Nara'],
    ],
    resultsPeriod: 'Campaign quarter vs the quarter before.',
    award: 'mea-specific-audience',
  },
  {
    slug: 'taylors-university',
    order: 5,
    client: "Taylor's University",
    title: 'SEO and lead generation',
    services: ['seo-geo'],
    industry: 'Education',
  },
  {
    slug: 'petronas-corporate-site',
    order: 6,
    client: 'PETRONAS',
    title: 'Corporate site, digital CI and CMS',
    services: ['website-development'],
    industry: 'Energy',
    headline: { value: '−4.5%', label: 'bounce rate in the first month' },
    results: [['−4.5%', 'bounce rate in the first month']],
  },
  {
    slug: 'petronas-integrated-report-flow',
    order: 7,
    client: 'PETRONAS',
    title: 'Integrated Report and FLOW Magazine sites',
    services: ['website-development'],
    industry: 'Energy',
    excerpt: 'Build and ongoing maintenance of two PETRONAS publication sites.',
  },
  {
    slug: 'liam-bukanextra',
    order: 8,
    client: 'Life Insurance Association of Malaysia',
    title: '#BukanExtra 2.0 gamified website',
    services: ['website-development'],
    industry: 'Insurance',
  },
  {
    slug: 'harvey-norman-not-your-parents-feed',
    order: 9,
    client: 'Harvey Norman',
    title: "Not Your Parents' Feed",
    services: ['creative-production', 'social-media-management'],
    industry: 'Retail',
    headline: { value: '+49%', label: 'organic search interest' },
    results: [
      ['+49%', 'organic search interest'],
      ['+88%', 'link clicks'],
    ],
  },
  {
    slug: 'harvey-norman-i-love-sabah',
    order: 10,
    client: 'Harvey Norman',
    title: 'I Love Sabah store launch',
    services: ['creative-production', 'social-media-management'],
    industry: 'Retail',
  },
  {
    slug: 'farmbyte-not-so-corporate-video',
    order: 11,
    client: 'Farmbyte',
    title: 'A not-so-corporate video',
    services: ['video-production'],
    industry: 'Food and agriculture',
  },
]

/** Display list from the brief. Shown as past wins: no level, year or client on the site. */
const AWARDS = [
  {
    key: 'mea-search',
    show: 'mea',
    category: 'Search Engine Marketing',
    result: 'winner',
    credit: 'analytics',
    clientName: 'World Vision Malaysia',
  },
  {
    key: 'mea-relationship',
    show: 'mea',
    category: 'Relationship Marketing',
    result: 'winner',
    credit: 'analytics',
  },
  {
    key: 'mea-multilingual',
    show: 'mea',
    category: 'Multilingual Marketing',
    result: 'winner',
    credit: 'analytics',
  },
  {
    key: 'mea-specific-audience',
    show: 'mea',
    category: 'Specific Audience',
    result: 'winner',
    credit: 'analytics',
    clientName: 'Southern Valley (Farmbyte)',
  },
  {
    key: 'markies-social',
    show: 'markies',
    category: 'Most Creative Social Media',
    result: 'winner',
    credit: 'analytics',
  },
  {
    key: 'webby-video',
    show: 'webby',
    category: 'Best Use of Video or Moving Image',
    result: 'peoples-voice',
    credit: 'joint',
  },
]

const TEAM = [
  { name: 'David Alan Bates', jobTitle: 'Co-Founder & Managing Director', order: 1 },
  { name: 'Mark Darren Lee', jobTitle: 'Co-Founder', order: 2 },
  { name: 'Joyce Lee', jobTitle: 'Senior Manager, Content & Strategy', order: 3 },
]

const hero = (eyebrow: string, heading: string, intro: string, links: [string, string][] = []) => ({
  blockType: 'hero',
  eyebrow,
  heading,
  intro,
  links: links.map(([label, href]) => ({ label, href })),
})

// ---------- Run ----------

const payload = await getPayload({ config })
const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

// Services
const serviceIds: Record<string, number> = {}
for (const [i, s] of SERVICES.entries()) {
  serviceIds[s.slug] = await upsert(
    payload,
    'services',
    { slug: { equals: s.slug } },
    {
      title: s.title,
      gameLabel: s.gameLabel,
      gameIcon: s.gameIcon,
      summary: s.summary,
      items: s.items.map((item) => ({ item })),
      slug: s.slug,
      role: s.role ?? 'craft',
      dataLayer: s.dataLayer ?? null,
      searchLayer: s.searchLayer ?? null,
      order: i + 1,
      _status: 'published',
    },
  )
}
log(`services: ${SERVICES.length}`)

// Clients and logos
const clientIds: Record<string, number> = {}
for (const [i, c] of LOGO_CLIENTS.entries()) {
  const logo = await upsertMedia(payload, `seed/client-logos/${c.file}`, `${c.name} logo`)
  clientIds[c.name] = await upsert(
    payload,
    'clients',
    { name: { equals: c.name } },
    {
      name: c.name,
      logo,
      industry: c.industry,
      showLogo: !c.hide,
      order: i + 1,
      notes: c.notes ?? null,
    },
  )
}
for (const [i, c] of OTHER_CLIENTS.entries()) {
  clientIds[c.name] = await upsert(
    payload,
    'clients',
    { name: { equals: c.name } },
    {
      name: c.name,
      industry: c.industry,
      showLogo: false,
      order: 50 + i,
      notes: 'No logo file yet.',
    },
  )
}
log(`clients: ${LOGO_CLIENTS.length + OTHER_CLIENTS.length}`)

// Awards (case study links are added after case studies exist)
const awardIds: Record<string, number> = {}
for (const [i, a] of AWARDS.entries()) {
  awardIds[a.key] = await upsert(
    payload,
    'awards',
    { and: [{ show: { equals: a.show } }, { category: { equals: a.category } }] },
    {
      show: a.show,
      category: a.category,
      result: a.result,
      credit: a.credit,
      order: i + 1,
      client: a.clientName ? clientIds[a.clientName] : null,
    },
  )
}
log(`awards: ${AWARDS.length}`)

// Case studies
const caseIds: Record<string, number> = {}
for (const c of CASES) {
  caseIds[c.slug] = await upsert(
    payload,
    'case-studies',
    { slug: { equals: c.slug } },
    {
      title: c.title,
      slug: c.slug,
      client: clientIds[c.client],
      services: c.services.map((s) => serviceIds[s]),
      industry: c.industry,
      excerpt: c.excerpt ?? null,
      headline: c.headline ?? { value: null, label: null },
      challenge: c.challenge ? richText(paragraph(c.challenge)) : null,
      whatWeDid: c.whatWeDid ? richText(bullets(c.whatWeDid)) : null,
      results: (c.results ?? []).map(([value, label]) => ({ value, label })),
      resultsPeriod: c.resultsPeriod ?? null,
      award: c.award ? awardIds[c.award] : null,
      featured: Boolean(c.featured),
      clientApproved: false,
      order: c.order,
      _status: 'published',
    },
  )
}
for (const c of CASES.filter((c) => c.award)) {
  await payload.update({
    collection: 'awards',
    id: awardIds[c.award!],
    data: { caseStudy: caseIds[c.slug] },
  })
}
log(`case studies: ${CASES.length}`)

// Team
for (const t of TEAM) {
  await upsert(payload, 'team', { name: { equals: t.name } }, { ...t, showOnAbout: true })
}
log(`team: ${TEAM.length}`)

// Enquiry form
const serviceOptions = ['Not sure yet', ...SERVICES.map((s) => s.title)].map((label) => ({
  label,
  value: label,
}))
const formId = await upsert(
  payload,
  'forms',
  { title: { equals: 'Enquiry' } },
  {
    title: 'Enquiry',
    submitButtonLabel: 'Send enquiry',
    confirmationType: 'message',
    confirmationMessage: richText(
      paragraph('Thank you. Our team has your details and will come back to you soon.'),
    ),
    fields: [
      { blockType: 'text', name: 'name', label: 'Name', required: true, width: 50 },
      { blockType: 'text', name: 'company', label: 'Company', width: 50 },
      { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
      { blockType: 'text', name: 'phone', label: 'Phone', width: 50 },
      {
        blockType: 'select',
        name: 'service',
        label: 'What do you need help with?',
        options: serviceOptions,
        defaultValue: 'Not sure yet',
        width: 100,
      },
      { blockType: 'textarea', name: 'message', label: 'Tell us a little about it', width: 100 },
    ],
  },
)
log('enquiry form: 1')

// Pages
const PAGES = [
  {
    slug: 'home',
    title: 'Home',
    layout: [
      {
        ...hero(
          'Independent digital marketing agency · Malaysia · Since 2014',
          'Marketing that starts with the data.',
          'We turn data and user behaviour into insights you can act on, then put them to work across search, creative, video, social, web and media.',
          [
            ['Start a project', '/contact'],
            ['See our work', '/work'],
          ],
        ),
        brandingArea: true,
      },
      {
        blockType: 'family',
        heading: 'Part of the Fishermen family.',
        text: 'Our sister agency Fishermen Integrated brings the big ideas. We bring the insight, search visibility and measurable results. One team from strategy to performance.',
      },
      {
        blockType: 'services',
        heading: 'Everything we make starts with data and is built to be found.',
        intro:
          'Five things we make. Two layers that run through all of them. Data Analytics and SEO/GEO are also available on their own.',
        showGame: true,
      },
      { blockType: 'featuredWork', heading: 'The numbers behind the work.' },
      { blockType: 'awards', heading: 'Award-winning work.' },
      { blockType: 'clientLogos', heading: 'Brands we work with.' },
      {
        blockType: 'enquiryForm',
        heading: 'Tell us what you need to grow.',
        intro: 'Share a few details and our team will come back to you.',
        form: formId,
      },
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    layout: [
      hero(
        'Services',
        'Data first. Then everything else.',
        'Five things we make, and two layers that run through all of them: data that shapes the work, and search that gets it found on Google and in AI answers.',
      ),
      { blockType: 'services' },
      {
        blockType: 'cta',
        heading: 'Need more than one? That is how we work best.',
        label: 'Start a project',
        href: '/contact',
      },
    ],
  },
  {
    slug: 'work',
    title: 'Work',
    layout: [
      hero(
        'Work',
        'Results you can measure.',
        'Case studies across search, analytics, content and creative. Results are shown as percentages to protect client data.',
      ),
    ],
  },
  {
    slug: 'about',
    title: 'About',
    layout: [
      hero(
        'About',
        'The data-led Fishermen.',
        'Fishermen Analytics is an independent Malaysian agency, founded in 2014. We help brands understand their audience through data and user behaviour, then reach them with search, content and creative that performs.',
      ),
      {
        blockType: 'method',
        heading: 'Find the fish. Craft the hook. Reel in the results.',
        steps: [
          {
            title: 'Find the fish',
            text: 'Every audience behaves differently. We use tools like GWI, social insight platforms and your own analytics to understand exactly who we are trying to reach.',
          },
          {
            title: 'Craft the hook',
            text: 'Ideas, content and entertainment built on that insight, so the message lands with the people it was made for.',
          },
          {
            title: 'Reel in the results',
            text: 'We measure, test and optimise across search, social and the web, so budget moves to what works.',
          },
        ],
      },
      {
        blockType: 'family',
        heading: 'Two agencies. One team when you need it.',
        text: 'Fishermen Analytics works alongside our sister agency, Fishermen Integrated. They are known for big creative ideas. We are known for insight, search visibility and measurable results. Clients can work with either of us, or both: strategy and creative from Integrated, data, SEO/GEO and performance from Analytics.',
      },
    ],
  },
  {
    slug: 'awards',
    title: 'Awards',
    layout: [
      hero(
        'Awards',
        'Recognised for work that performs.',
        'Wins for search, audience and relationship marketing, and a Webby shared with Fishermen Integrated.',
      ),
      { blockType: 'awards' },
    ],
  },
  {
    slug: 'insights',
    title: 'Insights',
    layout: [
      hero(
        'Insights',
        'Notes on search, AI and data.',
        'Articles from our team on SEO, GEO, analytics and what is changing in how people find brands.',
      ),
    ],
  },
  {
    slug: 'careers',
    title: 'Careers',
    layout: [
      hero(
        'Careers',
        'Join the Fishermen.',
        'We are always keen to meet analysts, SEO specialists, writers and creatives who like working with data.',
      ),
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    layout: [
      hero('Contact', "Let's talk.", 'Tell us about your brand and what you want to achieve.'),
      { blockType: 'enquiryForm', form: formId },
    ],
  },
]
for (const p of PAGES) {
  await upsert(payload, 'pages', { slug: { equals: p.slug } }, { ...p, _status: 'published' })
}
log(`pages: ${PAGES.length}`)

// Site settings
const siteLogo = await upsertMedia(
  payload,
  'public/brand/fishermen-analytics-logo-wide.png',
  'Fishermen Analytics logo',
)
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    companyName: 'Fishermen Analytics',
    legalName: 'Fishermen Analytics Sdn Bhd',
    foundingYear: 2014,
    tagline: 'Marketing that starts with the data.',
    description:
      'Fishermen Analytics is an independent digital marketing agency in Malaysia, founded in 2014. The data-led member of the Fishermen family, it specialises in data analytics and SEO/GEO, with creative, video, web, social and media services shaped by data. Sister agency: Fishermen Integrated.',
    logo: siteLogo,
    fishermenIntegratedUrl: 'https://www.fishermen.co',
  },
})
log('site settings updated')

log('done')
process.exit(0)
