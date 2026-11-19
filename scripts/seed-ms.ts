/**
 * Loads the Bahasa Malaysia draft (scripts/content/ms.ts) into the CMS as the `ms` locale.
 *
 *   npm run seed:ms            fills BM fields that are empty or still the English text
 *   npm run seed:ms -- --force overwrites BM fields, including edits made in the CMS
 *
 * Run after `npm run seed`. It reads each English record, swaps every translatable string
 * for its BM version (keeping row and block ids so the two languages stay paired) and saves
 * it in the `ms` locale. By default it never replaces BM text the team has already edited.
 * English text with no BM entry is listed at the end and left to fall back to English.
 */
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'
import { MS } from './content/ms'

const force = process.argv.includes('--force')

/** Field names whose string values are content (localised). Ids, slugs, hrefs, values and names are not. */
const TRANSLATE = new Set([
  'title',
  'gameLabel',
  'summary',
  'dataLayer',
  'searchLayer',
  'item',
  'question',
  'answer',
  'industry',
  'excerpt',
  'label',
  'resultsPeriod',
  'eyebrow',
  'heading',
  'intro',
  'text', // block text and Lexical text nodes
  'category',
  'jobTitle',
  'tagline',
  'description',
  'submitButtonLabel',
  'replyTime',
  'placeholder',
])
const SKIP = new Set(['createdAt', 'updatedAt', '_status', 'meta', 'sizes', 'blockName'])
/**
 * Array fields that are localised as a whole (Services items and FAQs, Insights FAQs, the
 * FAQ block). Every other array and block list is shared by both languages, so its row ids
 * are kept and only the text inside is translated.
 */
const LOCALIZED_ARRAYS = new Set(['items', 'faqs'])

const missing = new Set<string>()
let kept = 0

type Node = unknown
const isObj = (v: Node): v is Record<string, Node> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const isRichText = (v: Node) => isObj(v) && isObj(v.root)

const withoutIds = (v: Node) => JSON.stringify(v, (k, val) => (k === 'id' ? undefined : val))
/** True when existing BM content differs from the draft, i.e. someone edited it in the CMS. */
const isEdited = (en: Node, ms: Node, key?: string) =>
  withoutIds(translate(en, undefined, key)) !== withoutIds(ms)

/** Walks the English tree beside the current BM tree and returns the BM version. */
function translate(en: Node, ms: Node, key?: string): Node {
  if (typeof en === 'string') {
    if (!key || !TRANSLATE.has(key) || !en.trim()) return en
    if (!force && typeof ms === 'string' && ms.trim() && ms !== en) {
      if (ms !== MS[en]) kept++
      return ms
    }
    const out = MS[en]
    if (out === undefined) missing.add(en)
    return out ?? en
  }
  if (Array.isArray(en)) {
    if (key && LOCALIZED_ARRAYS.has(key)) {
      // A localised array has its own rows per language: keep the team's BM rows if they
      // exist, otherwise build new rows (without the English row ids).
      if (!force && Array.isArray(ms) && ms.length) {
        if (isEdited(en, ms, key)) kept++
        return ms
      }
      return en.map((item) => {
        const row = translate(item, undefined, key)
        if (isObj(row)) delete row.id
        return row
      })
    }
    return en.map((item, i) => translate(item, Array.isArray(ms) ? ms[i] : undefined, key))
  }
  if (isObj(en)) {
    // Rich text the team has already edited in BM stays whole
    if (isRichText(en) && !force && isRichText(ms) && JSON.stringify(ms) !== JSON.stringify(en)) {
      if (isEdited(en, ms, key)) kept++
      return ms
    }
    const out: Record<string, Node> = {}
    for (const [k, v] of Object.entries(en)) {
      if (SKIP.has(k)) continue
      out[k] = k === 'id' ? v : translate(v, isObj(ms) ? ms[k] : undefined, k)
    }
    return out
  }
  return en
}

async function localiseCollection(payload: Payload, collection: string, drafts: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = collection as any
  const en = await payload.find({ collection: c, locale: 'en', depth: 0, limit: 500, draft: drafts })
  for (const doc of en.docs as Record<string, Node>[]) {
    const ms = await payload.findByID({
      collection: c,
      id: doc.id as number,
      locale: 'ms',
      fallbackLocale: false,
      depth: 0,
      draft: drafts,
    })
    const data = translate(doc, ms) as Record<string, Node>
    delete data.id
    if (drafts) data._status = 'published'
    await payload.update({ collection: c, id: doc.id as number, locale: 'ms', data, depth: 0 })
  }
  payload.logger.info(`[seed:ms] ${collection}: ${en.docs.length}`)
}

const payload = await getPayload({ config })

await localiseCollection(payload, 'services', true)
await localiseCollection(payload, 'clients', false)
await localiseCollection(payload, 'awards', false)
await localiseCollection(payload, 'case-studies', true)
await localiseCollection(payload, 'team', false)
await localiseCollection(payload, 'forms', false)
await localiseCollection(payload, 'pages', true)
await localiseCollection(payload, 'jobs', true)
await localiseCollection(payload, 'insights', true)

const settingsEn = await payload.findGlobal({ slug: 'site-settings', locale: 'en', depth: 0 })
const settingsMs = await payload.findGlobal({
  slug: 'site-settings',
  locale: 'ms',
  fallbackLocale: false,
  depth: 0,
})
const settings = translate(settingsEn, settingsMs) as Record<string, Node>
delete settings.id
// eslint-disable-next-line @typescript-eslint/no-explicit-any
await payload.updateGlobal({ slug: 'site-settings', locale: 'ms', data: settings as any })
payload.logger.info('[seed:ms] site settings')

if (kept) payload.logger.info(`[seed:ms] kept ${kept} BM fields that differ from the draft, such as edits made in the CMS (use --force to overwrite)`)
if (missing.size) {
  payload.logger.warn(`[seed:ms] ${missing.size} English strings have no BM draft yet:`)
  for (const m of missing) payload.logger.warn(`  - ${m}`)
}
payload.logger.info('[seed:ms] done')
process.exit(0)
