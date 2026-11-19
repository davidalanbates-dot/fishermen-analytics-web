import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { editorial } from '../fields/publishing'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'role', 'order', '_status'],
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
      type: 'row',
      admin: {
        condition: (_, siblingData) => (siblingData?.role ?? 'craft') === 'craft',
      },
      fields: [
        {
          name: 'dataLayer',
          label: 'The data layer',
          type: 'textarea',
          localized: true,
          maxLength: 120,
          admin: {
            width: '50%',
            description:
              'One concrete line: how data shapes this craft. Shown in the services matrix.',
          },
        },
        {
          name: 'searchLayer',
          label: 'The search layer',
          type: 'textarea',
          localized: true,
          maxLength: 120,
          admin: {
            width: '50%',
            description:
              'One concrete line: how this craft is built to be found on Google and in AI answers.',
          },
        },
      ],
    },
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
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'craft',
      admin: {
        position: 'sidebar',
        description:
          'Data Analytics and SEO/GEO are layers that run through everything we make; the rest are crafts.',
      },
      options: [
        { label: 'What we make (craft)', value: 'craft' },
        { label: 'The data layer', value: 'data' },
        { label: 'The search layer', value: 'search' },
      ],
    },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
