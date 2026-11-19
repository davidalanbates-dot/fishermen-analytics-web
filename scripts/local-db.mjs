/**
 * Local PostgreSQL for development, no install or Docker needed.
 *
 *   npm run db          start the database only (Ctrl+C to stop)
 *   npm run dev:local   start the database, then the site and CMS
 *
 * Data is kept in ./.postgres (git-ignored). Delete that folder to start from an empty database.
 * Production uses the hosted database in DATABASE_URL (Neon or Supabase), never this.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import EmbeddedPostgres from 'embedded-postgres'

export const LOCAL_DB = {
  port: 54320, // not 5432, so it never clashes with another Postgres on the machine
  user: 'postgres',
  password: 'postgres',
  database: 'fishermen_analytics',
}

const databaseDir = path.resolve('.postgres')
const withDev = process.argv.includes('--dev')

const pg = new EmbeddedPostgres({
  databaseDir,
  port: LOCAL_DB.port,
  user: LOCAL_DB.user,
  password: LOCAL_DB.password,
  persistent: true,
  onLog: () => {},
  onError: (message) => {
    const text = String(message)
    if (/ERROR|FATAL|PANIC/.test(text)) console.error('[postgres]', text.trim())
  },
})

let stopping = false
async function stop(code = 0) {
  if (stopping) return
  stopping = true
  console.log('\n[postgres] stopping...')
  try {
    await pg.stop()
  } catch {
    // already stopped
  }
  process.exit(code)
}

if (!existsSync(path.join(databaseDir, 'PG_VERSION'))) {
  console.log('[postgres] first run: creating the local database cluster in .postgres/')
  await pg.initialise()
}

await pg.start()

try {
  await pg.createDatabase(LOCAL_DB.database)
  console.log(`[postgres] created database "${LOCAL_DB.database}"`)
} catch {
  // database already exists
}

const url = `postgres://${LOCAL_DB.user}:${LOCAL_DB.password}@127.0.0.1:${LOCAL_DB.port}/${LOCAL_DB.database}`
console.log(`[postgres] running at ${url}`)

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))

if (withDev) {
  const child = spawn('npm run dev', {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, DATABASE_URL: url },
  })
  child.on('exit', (code) => stop(code ?? 0))
} else {
  console.log('[postgres] press Ctrl+C to stop')
}
