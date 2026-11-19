import type { CollectionConfig, TextFieldSingleValidation } from 'payload'
import { slugField } from '../fields/slug'
import { editorial } from '../fields/publishing'

/** Agreed rule: results as percentages only. Blocks obvious absolute money figures. */
const noAbsoluteMoney: TextFieldSingleValidation = (value) => {
  if (value && /(\bRM\s?\d|S?\$\s?\d|\bUSD\b|\bSGD\b|\bMYR\b)/i.test(value)) {
    return 'Show results as percentages only. No revenue, budgets or other absolute client figures.'
  }
  return true
}

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Case study', plural: 'Case studies' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'featured', '_status'],
    group: 'Content',
  },
  defaultSort: 'order',
  ...editorial(),
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'client', type: 'relationship', relationTo: 'clients', required: true },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      required: true,
    },
    { name: 'industry', type: 'text', localized: true },
    { name: 'excerpt', type: 'textarea', localized: true, maxLength: 240 },
    {
      name: 'headline',
      label: 'Headline result',
      type: 'group',
      admin: {
        description: 'The number shown on cards, e.g. "+71.2%" and "unbranded organic traffic".',
      },
      fields: [
        { name: 'value', type: 'text', validate: noAbsoluteMoney },
        { name: 'label', type: 'text', localized: true },
      ],
    },
    { name: 'challenge', type: 'richText', localized: true },
    { name: 'whatWeDid', label: 'What we did', type: 'richText', localized: true },
    {
      name: 'results',
      type: 'array',
      admin: {
        description:
          'Percentages only. No revenue, budgets, visit counts or other absolute client figures.',
      },
      fields: [
        { name: 'value', type: 'text', required: true, validate: noAbsoluteMoney },
        { name: 'label', type: 'text', required: true, localized: true },
      ],
    },
    {
      name: 'resultsPeriod',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "H2 2023 vs H2 2022"' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'videoUrl', type: 'text', label: 'Video URL (YouTube or Vimeo)' },
    slugField(),
    { name: 'award', type: 'relationship', relationTo: 'awards', admin: { position: 'sidebar' } },
    {
      name: 'sharedCredit',
      type: 'checkbox',
      label: 'Joint work with Fishermen Integrated',
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on homepage',
      admin: { position: 'sidebar' },
    },
    {
      name: 'clientApproved',
      type: 'checkbox',
      label: 'Client has approved publishing these results',
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
