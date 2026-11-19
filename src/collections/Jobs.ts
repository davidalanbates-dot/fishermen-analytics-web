import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { editorial } from '../fields/publishing'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'employmentType', 'open', '_status'],
    group: 'Content',
  },
  ...editorial(),
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'applyUrl', type: 'text', label: 'Apply link or email (mailto:)' },
    slugField(),
    {
      name: 'employmentType',
      type: 'select',
      defaultValue: 'FULL_TIME',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Full-time', value: 'FULL_TIME' },
        { label: 'Part-time', value: 'PART_TIME' },
        { label: 'Contract', value: 'CONTRACTOR' },
        { label: 'Internship', value: 'INTERN' },
      ],
    },
    {
      name: 'location',
      type: 'text',
      defaultValue: 'Subang Jaya, Selangor',
      admin: { position: 'sidebar' },
    },
    {
      name: 'open',
      type: 'checkbox',
      label: 'Accepting applications',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    { name: 'closingDate', type: 'date', admin: { position: 'sidebar' } },
  ],
}
