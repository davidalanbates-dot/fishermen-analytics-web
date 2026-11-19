import type { Block } from 'payload'

/**
 * Page-builder blocks. Each matches a section of the homepage in preview/index.html,
 * so the marketing team can reorder sections or reuse them on other pages.
 */

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'links',
      type: 'array',
      maxRows: 2,
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [{ name: 'content', type: 'richText', required: true, localized: true }],
}

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: 'Services list', plural: 'Services lists' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'showGame',
      type: 'checkbox',
      label: 'Show the services game beside the list',
      defaultValue: false,
      admin: { description: 'Homepage only. Labels come from the Services collection.' },
    },
  ],
}

export const FeaturedWorkBlock: Block = {
  slug: 'featuredWork',
  labels: { singular: 'Featured work', plural: 'Featured work' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'caseStudies',
      type: 'relationship',
      relationTo: 'case-studies',
      hasMany: true,
      maxRows: 3,
      admin: { description: 'Leave empty to use case studies marked "Feature on homepage".' },
    },
  ],
}

export const AwardsBlock: Block = {
  slug: 'awards',
  labels: { singular: 'Awards strip', plural: 'Awards strips' },
  fields: [{ name: 'heading', type: 'text', localized: true }],
}

export const ClientLogosBlock: Block = {
  slug: 'clientLogos',
  labels: { singular: 'Client logos', plural: 'Client logos' },
  fields: [{ name: 'heading', type: 'text', localized: true }],
}

export const FamilyBlock: Block = {
  slug: 'family',
  labels: { singular: 'Fishermen family band', plural: 'Fishermen family bands' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'text', type: 'textarea', localized: true },
  ],
}

export const MethodBlock: Block = {
  slug: 'method',
  labels: { singular: 'Method (fish, hook, reel)', plural: 'Method sections' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'steps',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'text', type: 'textarea', localized: true },
      ],
    },
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      localized: true,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'text', type: 'textarea', localized: true },
    { name: 'label', type: 'text', localized: true },
    { name: 'href', type: 'text' },
  ],
}

export const EnquiryFormBlock: Block = {
  slug: 'enquiryForm',
  labels: { singular: 'Enquiry form', plural: 'Enquiry forms' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'form', type: 'relationship', relationTo: 'forms', required: true },
  ],
}

export const pageBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  ServicesBlock,
  FeaturedWorkBlock,
  MethodBlock,
  AwardsBlock,
  ClientLogosBlock,
  FamilyBlock,
  FAQBlock,
  CTABlock,
  EnquiryFormBlock,
]
