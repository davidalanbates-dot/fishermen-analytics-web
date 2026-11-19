import type { Locale } from '@/i18n/config'
import type { Page } from '@/payload-types'

export type LayoutBlock = NonNullable<Page['layout']>[number]
export type BlockOf<T extends LayoutBlock['blockType']> = Extract<LayoutBlock, { blockType: T }>
export type BlockProps<T extends LayoutBlock['blockType']> = { block: BlockOf<T>; locale: Locale }
