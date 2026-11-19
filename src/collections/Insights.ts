import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { editorial } from '../fields/publishing'

export const Insights: CollectionConfig = {
  slug: 'insights',
  labels: { singular: 'Insight', plural: 'Insights' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: 'Content',
  },
  defaultSort: '-publishedAt',
  ...editorial(),
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'excerpt', type: 'textarea', localized: true, maxLength: 260 },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true, localized: true },
    {
      name: 'faqs',
      label: 'FAQs',
      type: 'array',
      localized: true,
      admin: { description: 'Output as FAQ structured data. Write direct, quotable answers.' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    slugField(),
    { name: 'author', type: 'relationship', relationTo: 'team', admin: { position: 'sidebar' } },
    {
      name: 'category',
      type: 'select',
      admin: { position: 'sidebar' },
      options: [
        { label: 'SEO / GEO', value: 'seo-geo' },
        { label: 'Data & Analytics', value: 'data' },
        { label: 'Social & Content', value: 'social' },
        { label: 'Web', value: 'web' },
        { label: 'Agency news', value: 'news' },
      ],
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) =>
            value ?? (siblingData?._status === 'published' ? new Date().toISOString() : value),
        ],
      },
    },
  ],
}
