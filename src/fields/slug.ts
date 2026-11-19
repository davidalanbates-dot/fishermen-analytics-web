import type { Field } from 'payload'

export const formatSlug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * URL slug, shared by EN and BM so /work/x and /ms/work/x are the same document
 * (keeps hreflang pairs simple). Filled from the title field if left empty.
 */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  required: true,
  admin: {
    position: 'sidebar',
    description: `Used in the URL. Leave empty to generate from the ${from}.`,
  },
  hooks: {
    beforeValidate: [
      ({ value, data, req }) => {
        if (typeof value === 'string' && value.length > 0) return formatSlug(value)
        // Only generate from the default-locale title, so BM edits never change the URL.
        const source = data?.[from]
        if (req.locale && req.locale !== 'en') return value
        if (typeof source === 'string') return formatSlug(source)
        if (source && typeof source === 'object' && typeof source.en === 'string')
          return formatSlug(source.en)
        return value
      },
    ],
  },
})
