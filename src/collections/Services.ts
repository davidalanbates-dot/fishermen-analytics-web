import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { editorial } from '../fields/publishing'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'core', 'order', '_status'],
    group: 'Content',
  },
  defaultSort: 'order',
  ...editorial(),
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'gameLabel',
      type: 'text',
      localized: true,
      maxLength: 18,
      admin: {
        description: 'Short label shown on the block in the homepage game, e.g. "SEO/GEO".',
      },
    },
    {
      name: 'gameIcon',
      type: 'select',
      defaultValue: 'analytics',
      admin: { description: 'Pixel icon on this service’s buoy in the homepage game.' },
      options: [
        { label: 'Bar chart', value: 'analytics' },
        { label: 'Magnifier', value: 'seo' },
        { label: 'Pen', value: 'creative' },
        { label: 'Play button', value: 'video' },
        { label: 'Browser window', value: 'web' },
        { label: 'Chat bubble', value: 'social' },
        { label: 'Megaphone', value: 'media' },
      ],
    },
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 220 },
    {
      name: 'items',
      label: 'What is included',
      type: 'array',
      localized: true,
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'body', type: 'richText', localized: true },
    {
      name: 'faqs',
      label: 'FAQs',
      type: 'array',
      localized: true,
      admin: { description: 'Shown on the service page and output as FAQ structured data.' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    slugField(),
    {
      name: 'core',
      type: 'checkbox',
      label: 'Core service ("Our core")',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
