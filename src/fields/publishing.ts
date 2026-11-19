import type { CollectionConfig } from 'payload'
import { isLoggedIn, preventEditorPublish, publishedOrLoggedIn } from '../access/roles'

/** Shared settings for editorial collections: drafts, scheduled publishing, version history, roles. */
export const editorial = (
  config: Pick<CollectionConfig, 'access' | 'hooks'> = {},
): Pick<CollectionConfig, 'access' | 'hooks' | 'versions'> => ({
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
    ...config.access,
  },
  hooks: {
    ...config.hooks,
    beforeChange: [preventEditorPublish, ...(config.hooks?.beforeChange ?? [])],
  },
  versions: {
    drafts: { autosave: { interval: 800 }, schedulePublish: true },
    maxPerDoc: 50,
  },
})
