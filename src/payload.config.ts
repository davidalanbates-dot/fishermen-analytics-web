import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig, type CollectionConfig, type Field } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { isLoggedIn } from './access/roles'
import { Awards } from './collections/Awards'
import { CaseStudies } from './collections/CaseStudies'
import { Clients } from './collections/Clients'
import { Insights } from './collections/Insights'
import { Jobs } from './collections/Jobs'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Services } from './collections/Services'
import { Team } from './collections/Team'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { emailEnquiry } from './hooks/emailEnquiry'
import { revalidateHooks, withGlobalRevalidate, withRevalidate } from './hooks/revalidate'
import { previewCollections, previewUrl } from './lib/previewUrl'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const siteName = 'Fishermen Analytics'

/** Adds the Preview button (opens the draft on the site) to collections that have pages. */
const withPreview = (collection: CollectionConfig): CollectionConfig =>
  previewCollections.includes(collection.slug)
    ? {
        ...collection,
        admin: {
          ...collection.admin,
          preview: (doc, { locale }) => previewUrl(collection.slug, doc?.slug, locale),
        },
      }
    : collection

/** Make the SEO plugin's title, description and image editable per language. */
const localizeSeoFields = ({ defaultFields }: { defaultFields: Field[] }): Field[] =>
  defaultFields.map((field) =>
    'name' in field && ['title', 'description', 'image'].includes(field.name)
      ? ({ ...field, localized: true } as Field)
      : field,
  )

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ` | ${siteName} CMS` },
    importMap: { baseDir: path.resolve(dirname) },
    // Side-by-side preview while editing; the page refreshes on each autosave
    livePreview: {
      collections: previewCollections,
      url: ({ data, collectionConfig, locale }) =>
        previewUrl(collectionConfig?.slug ?? '', data?.slug, locale) ?? '',
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Bahasa Malaysia', code: 'ms' },
    ],
    defaultLocale: 'en',
    // Untranslated BM fields show the English text until the team translates them.
    fallback: true,
  },
  collections: [Pages, Services, CaseStudies, Awards, Insights, Team, Clients, Jobs, Media, Users]
    .map(withPreview)
    // Publishing refreshes the live site; logins don't change any page
    .map((c) => (c.slug === Users.slug ? c : withRevalidate(c))),
  globals: [SiteSettings].map(withGlobalRevalidate),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'website@fishermen-analytics.com',
        defaultFromName: siteName,
      })
    : undefined,
  sharp,
  plugins: [
    seoPlugin({
      collections: ['pages', 'services', 'case-studies', 'insights', 'jobs'],
      uploadsCollection: 'media',
      tabbedUI: true,
      fields: localizeSeoFields,
      generateTitle: ({ doc }) => (doc?.title ? `${doc.title} | ${siteName}` : siteName),
      generateDescription: ({ doc }) => doc?.excerpt || doc?.summary || '',
    }),
    redirectsPlugin({
      collections: ['pages', 'services', 'case-studies', 'insights'],
      overrides: { admin: { group: 'Admin' } },
    }),
    formBuilderPlugin({
      fields: { payment: false, state: false, country: false },
      formOverrides: { admin: { group: 'Enquiries' }, hooks: revalidateHooks },
      formSubmissionOverrides: {
        labels: { singular: 'Enquiry', plural: 'Enquiries' },
        admin: { group: 'Enquiries' },
        access: { read: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
        hooks: { afterChange: [emailEnquiry] },
      },
    }),
    vercelBlobStorage({
      // Uses local disk in development until the team adds a Blob token.
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
