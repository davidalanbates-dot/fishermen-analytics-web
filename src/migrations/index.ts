import * as migration_20261119_071630_initial from './20261119_071630_initial'

export const migrations = [
  {
    up: migration_20261119_071630_initial.up,
    down: migration_20261119_071630_initial.down,
    name: '20261119_071630_initial',
  },
]
