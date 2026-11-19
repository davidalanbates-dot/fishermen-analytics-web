import type { Access, CollectionBeforeChangeHook, FieldAccess } from 'payload'

/**
 * Roles agreed in the brief:
 * - editor: creates and edits drafts
 * - publisher: everything an editor can do, plus publishing
 * - admin: everything, including users and site settings
 */
export type Role = 'editor' | 'publisher' | 'admin'

type MaybeUser = { role?: Role | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]) =>
  Boolean(user?.role && roles.includes(user.role))

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
export const isAdmin: Access = ({ req }) => hasRole(req.user as MaybeUser, 'admin')
export const isPublisherOrAdmin: Access = ({ req }) =>
  hasRole(req.user as MaybeUser, 'publisher', 'admin')
export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user as MaybeUser, 'admin')

/** Public can read published documents; logged-in users can also read drafts. */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

/** Stops editors from publishing. They can still save drafts for a publisher to review. */
export const preventEditorPublish: CollectionBeforeChangeHook = ({ data, req }) => {
  if (data?._status === 'published' && hasRole(req.user as MaybeUser, 'editor')) {
    throw new Error('Editors can save drafts only. Ask a publisher to publish this.')
  }
  return data
}
