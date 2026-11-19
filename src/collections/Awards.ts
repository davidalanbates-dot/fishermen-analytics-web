import type { CollectionConfig, FieldAccess } from 'payload'
import { isLoggedIn } from '../access/roles'

const internalOnly: { read: FieldAccess } = { read: ({ req }) => Boolean(req.user) }

/**
 * Display rule (agreed): shown as past wins, e.g. "Winner, Marketing Excellence Awards",
 * with no level, no year and no client name. Client, year and level are stored for the team
 * only and are hidden from the public API by field access.
 */
export const Awards: CollectionConfig = {
  slug: 'awards',
  admin: {
    useAsTitle: 'category',
    defaultColumns: ['show', 'category', 'result', 'credit'],
    group: 'Content',
  },
  defaultSort: 'order',
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    {
      name: 'show',
      type: 'select',
      required: true,
      options: [
        { label: 'Marketing Excellence Awards', value: 'mea' },
        { label: 'MARKies Awards', value: 'markies' },
        { label: 'Webby Awards', value: 'webby' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'showName',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.show === 'other',
        description: 'Name of the awards show.',
      },
    },
    { name: 'category', type: 'text', required: true, localized: true },
    {
      name: 'result',
      type: 'select',
      required: true,
      defaultValue: 'winner',
      options: [
        { label: 'Winner', value: 'winner' },
        { label: 'Finalist', value: 'finalist' },
        { label: "People's Voice", value: 'peoples-voice' },
      ],
    },
    {
      name: 'credit',
      type: 'select',
      required: true,
      defaultValue: 'analytics',
      admin: {
        description:
          'Never list Integrated-only awards. Joint wins show "with Fishermen Integrated".',
      },
      options: [
        { label: 'Fishermen Analytics', value: 'analytics' },
        { label: 'With Fishermen Integrated', value: 'joint' },
      ],
    },
    { name: 'caseStudy', type: 'relationship', relationTo: 'case-studies' },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      type: 'collapsible',
      label: 'Internal (never shown on the site)',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'client', type: 'relationship', relationTo: 'clients', access: internalOnly },
        { name: 'year', type: 'number', access: internalOnly },
        {
          name: 'level',
          type: 'text',
          admin: { description: 'e.g. Gold, Silver' },
          access: internalOnly,
        },
      ],
    },
  ],
}
