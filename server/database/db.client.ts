import { Database } from 'bun:sqlite'
import { Kysely } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-sqlite'
import pkg from '~/package.json' with { type: 'json' }
import type { AppDatabase } from './db.schema'

const dbpath = Bun.env.APP_MODE
  ? `storage/${pkg.name}-${Bun.env.APP_MODE}.sqlite`
  : `storage/${pkg.name}.sqlite`

export const dbClient = new Kysely<AppDatabase>({
  dialect: new BunSqliteDialect({
    database: new Database(dbpath, { strict: true })
  })
})
