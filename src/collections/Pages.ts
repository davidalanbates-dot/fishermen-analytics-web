import type { CollectionConfig } from 'payload'
import { pageBlocks } from '../blocks'
import { slugField } from '../fields/slug'
import { editorial } from '../fields/publishing'

/** Flexible pages: Home, About, Awards, Careers, Contact and any landing page. Home uses slug "home". */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'], group: 'Content' },
  ...editorial(),
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'layout', type: 'blocks', blocks: pageBlocks, localized: false },
    slugField(),
  ],
}
