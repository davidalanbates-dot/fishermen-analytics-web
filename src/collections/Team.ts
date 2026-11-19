import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '../access/roles'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'jobTitle', 'order'], group: 'Content' },
  defaultSort: 'order',
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'jobTitle', type: 'text', required: true, localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'richText', localized: true },
    { name: 'linkedin', type: 'text', label: 'LinkedIn URL' },
    {
      name: 'showOnAbout',
      type: 'checkbox',
      label: 'Show on About page',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
