import * as migration_20261119_071630_initial from './20261119_071630_initial'
import * as migration_20261119_075233_hero_branding_area from './20261119_075233_hero_branding_area'
import * as migration_20261119_085218_service_game_icon from './20261119_085218_service_game_icon'

export const migrations = [
  {
    up: migration_20261119_071630_initial.up,
    down: migration_20261119_071630_initial.down,
    name: '20261119_071630_initial',
  },
  {
    up: migration_20261119_075233_hero_branding_area.up,
    down: migration_20261119_075233_hero_branding_area.down,
    name: '20261119_075233_hero_branding_area',
  },
  {
    up: migration_20261119_085218_service_game_icon.up,
    down: migration_20261119_085218_service_game_icon.down,
    name: '20261119_085218_service_game_icon',
  },
]
