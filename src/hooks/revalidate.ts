import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
} from 'payload'

/**
 * Publishing in the CMS refreshes the live site straight away (no waiting for the cache).
 * The site is small, so every page is refreshed rather than working out which ones changed.
 * Outside a running site (seed scripts) there is nothing to refresh, so errors are ignored.
 */
function refreshSite(log: { info: (msg: string) => void }, why: string) {
  try {
    revalidatePath('/', 'layout')
    log.info(`Site refreshed: ${why}`)
  } catch {
    // Not inside the Next.js server (e.g. `npm run seed`): nothing to refresh.
  }
}

type Status = { _status?: 'draft' | 'published' | null } | undefined

const afterChange: CollectionAfterChangeHook = ({ doc, previousDoc, collection, req }) => {
  // Saving a draft changes nothing on the live site, unless it un-publishes a live page.
  const live = (d: Status) => !d?._status || d._status === 'published'
  if (live(doc) || live(previousDoc)) refreshSite(req.payload.logger, `${collection.slug} changed`)
  return doc
}

const afterDelete: CollectionAfterDeleteHook = ({ doc, collection, req }) => {
  refreshSite(req.payload.logger, `${collection.slug} deleted`)
  return doc
}

const afterGlobalChange: GlobalAfterChangeHook = ({ doc, global, req }) => {
  refreshSite(req.payload.logger, `${global.slug} changed`)
  return doc
}

export const withRevalidate = (collection: CollectionConfig): CollectionConfig => ({
  ...collection,
  hooks: {
    ...collection.hooks,
    afterChange: [...(collection.hooks?.afterChange ?? []), afterChange],
    afterDelete: [...(collection.hooks?.afterDelete ?? []), afterDelete],
  },
})

export const withGlobalRevalidate = (global: GlobalConfig): GlobalConfig => ({
  ...global,
  hooks: {
    ...global.hooks,
    afterChange: [...(global.hooks?.afterChange ?? []), afterGlobalChange],
  },
})

/** For the form-builder's Forms collection, whose labels show on the site. */
export const revalidateHooks = { afterChange: [afterChange], afterDelete: [afterDelete] }
