import type { Locale } from '@/i18n/config'
import { EnquiryFormBlock } from './EnquiryForm'
import { HeroBlock } from './Hero'
import {
  AwardsBlock,
  ClientLogosBlock,
  CTABlock,
  FamilyBlock,
  FAQBlock,
  FeaturedWorkBlock,
  MethodBlock,
  RichTextBlock,
  ServicesBlock,
} from './Sections'
import type { LayoutBlock } from './types'

/** Renders a page's CMS blocks in the order the team arranged them. */
export function RenderBlocks({ blocks, locale }: { blocks: LayoutBlock[]; locale: Locale }) {
  return blocks.map((block, i) => {
    const key = block.id ?? `${block.blockType}-${i}`
    switch (block.blockType) {
      case 'hero':
        return <HeroBlock key={key} block={block} locale={locale} />
      case 'family':
        return <FamilyBlock key={key} block={block} locale={locale} />
      case 'services':
        return <ServicesBlock key={key} block={block} locale={locale} />
      case 'featuredWork':
        return <FeaturedWorkBlock key={key} block={block} locale={locale} />
      case 'awards':
        return <AwardsBlock key={key} block={block} locale={locale} />
      case 'clientLogos':
        return <ClientLogosBlock key={key} block={block} locale={locale} />
      case 'method':
        return <MethodBlock key={key} block={block} locale={locale} />
      case 'faq':
        return <FAQBlock key={key} block={block} locale={locale} />
      case 'cta':
        return <CTABlock key={key} block={block} locale={locale} />
      case 'richText':
        return <RichTextBlock key={key} block={block} locale={locale} />
      case 'enquiryForm':
        return <EnquiryFormBlock key={key} block={block} locale={locale} />
      default:
        return null
    }
  })
}
