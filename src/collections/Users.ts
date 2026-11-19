import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin, isAdminField, isLoggedIn } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'role'], group: 'Admin' },
  auth: true,
  access: {
    read: isLoggedIn,
    create: isAdmin,
    delete: isAdmin,
    // Users can edit their own profile; admins can edit anyone.
    update: ({ req, id }) => hasRole(req.user as never, 'admin') || req.user?.id === id,
  },
  hooks: {
    beforeChange: [
      // The very first account (created on /admin/create-first-user) is always an admin,
      // otherwise the owner would be locked out of user and tracking settings.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        return totalDocs === 0 ? { ...data, role: 'admin' } : data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { update: isAdminField, create: isAdminField },
      admin: { description: 'The first account is always created as an Admin.' },
      options: [
        { label: 'Editor (drafts only)', value: 'editor' },
        { label: 'Publisher (can publish)', value: 'publisher' },
        { label: 'Admin', value: 'admin' },
      ],
    },
  ],
}
