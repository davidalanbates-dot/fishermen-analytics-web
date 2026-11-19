import type { Dictionary } from '@/i18n/dictionary'
import type { PixelIcon } from './icons'

export type GameService = {
  id: number
  label: string
  title: string
  summary: string
  href: string
  core: boolean
  icon: PixelIcon
}

export type GameText = Dictionary['game']

export type GameProps = {
  services: GameService[]
  text: GameText
  contactHref: string
  listId: string
}
