import * as migration_20261119_071630_initial from './20261119_071630_initial'
import * as migration_20261119_075233_hero_branding_area from './20261119_075233_hero_branding_area'
import * as migration_20261119_085218_service_game_icon from './20261119_085218_service_game_icon'
import * as migration_20261119_092303_services_add_layers from './20261119_092303_services_add_layers'
import * as migration_20261119_092314_services_drop_core from './20261119_092314_services_drop_core'

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
  {
    up: migration_20261119_092303_services_add_layers.up,
    down: migration_20261119_092303_services_add_layers.down,
    name: '20261119_092303_services_add_layers',
  },
  {
    up: migration_20261119_092314_services_drop_core.up,
    down: migration_20261119_092314_services_drop_core.down,
    name: '20261119_092314_services_drop_core',
  },
]
