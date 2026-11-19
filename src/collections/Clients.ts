import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '../access/roles'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'showLogo', 'order'], group: 'Library' },
  defaultSort: 'order',
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'industry', type: 'text', localized: true },
    { name: 'url', type: 'text', label: 'Website' },
    {
      name: 'showLogo',
      type: 'checkbox',
      label: 'Show logo on the site',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Internal only, e.g. "need a higher-resolution logo".' },
      access: { read: ({ req }) => Boolean(req.user) },
    },
  ],
}
