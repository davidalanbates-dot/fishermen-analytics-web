import type { GlobalConfig } from 'payload'
import { isAdminField, isPublisherOrAdmin } from '../access/roles'

/**
 * Key facts used across the site and in structured data. Keep these identical to
 * fishermen.co, LinkedIn and directory listings (GEO consistency).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Admin' },
  access: { read: () => true, update: isPublisherOrAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Company',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              defaultValue: 'Fishermen Analytics',
              required: true,
            },
            { name: 'legalName', type: 'text', defaultValue: 'Fishermen Analytics Sdn Bhd' },
            { name: 'foundingYear', type: 'number', defaultValue: 2014 },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              defaultValue: 'Marketing that starts with the data.',
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              admin: { description: 'One or two sentences used in structured data and llms.txt.' },
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  name: 'street',
                  type: 'text',
                  defaultValue: 'D-09-02, Level 9, SkyPark One City, Jalan USJ 25/1',
                },
                { name: 'postcode', type: 'text', defaultValue: '47650' },
                { name: 'city', type: 'text', defaultValue: 'Subang Jaya' },
                { name: 'state', type: 'text', defaultValue: 'Selangor' },
                { name: 'country', type: 'text', defaultValue: 'MY' },
                {
                  name: 'confirmed',
                  type: 'checkbox',
                  label: 'Address confirmed by the team',
                  defaultValue: false,
                },
              ],
            },
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'text' },
            {
              name: 'replyTime',
              type: 'text',
              localized: true,
              admin: {
                description: 'Shown by the enquiry form, e.g. "We reply within one working day."',
              },
            },
            {
              name: 'enquiryRecipients',
              type: 'array',
              admin: { description: 'Who receives enquiry form emails.' },
              access: { read: ({ req }) => Boolean(req.user) },
              fields: [{ name: 'email', type: 'email', required: true }],
            },
          ],
        },
        {
          label: 'Family and social',
          fields: [
            {
              name: 'fishermenIntegratedUrl',
              type: 'text',
              defaultValue: 'https://www.fishermen.co',
            },
            {
              name: 'socials',
              type: 'array',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: ['linkedin', 'instagram', 'facebook', 'youtube', 'tiktok', 'x'],
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Tracking',
          fields: [
            {
              name: 'ga4MeasurementId',
              type: 'text',
              label: 'GA4 measurement ID',
              admin: { description: 'e.g. G-XXXXXXXXXX' },
              access: { update: isAdminField },
            },
            {
              name: 'searchConsoleVerification',
              type: 'text',
              label: 'Google Search Console verification code',
              access: { update: isAdminField },
            },
          ],
        },
      ],
    },
  ],
}
