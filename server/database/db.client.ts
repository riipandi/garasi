/**
 * Configures the Kysely database client with the appropriate dialect and plugins.
 *
 * The configuration includes the following plugins:
 * - `CamelCasePlugin`: Automatically converts column names to camelCase.
 * - `ParseJSONResultsPlugin`: Automatically parses JSON columns.
 *
 * @see https://www.kysely.dev/docs/dialects
 * @see https://github.com/kysely-org/kysely-postgres-js
 */

import { Database } from 'bun:sqlite'
import type { ErrorLogEvent, KyselyConfig, QueryLogEvent } from 'kysely'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-sqlite'
import pkg from '~/package.json' with { type: 'json' }
import logger from '~/server/platform/logger'
import { protectedEnv } from '~/shared/envars'
import { prettyMs } from '~/shared/utils/humanize'
import type { AppDatabase } from './db.schema'

const dbpath = Bun.env.APP_MODE
  ? `storage/${pkg.name}-${Bun.env.APP_MODE}.sqlite`
  : `storage/${pkg.name}.sqlite`

export const kyselyConfig: KyselyConfig = {
  dialect: new BunSqliteDialect({
    database: new Database(dbpath, { strict: true, create: true })
  }),
  plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()]
}

// Initialize Kysely instance with logging capabilities
export const dbClient = new Kysely<AppDatabase>({
  ...kyselyConfig,
  log: (event: QueryLogEvent | ErrorLogEvent): void => {
    const logLevel = protectedEnv.APP_LOG_LEVEL
    const { queryId } = event.query.queryId
    const klogger = logger.withPrefix('KYSELY').withMetadata({ queryId })

    if (event.level === 'query' && logLevel === 'trace') {
      klogger
        .withMetadata({
          sql: event.query.sql,
          parameters: JSON.stringify(event.query.parameters),
          duration: prettyMs(event.queryDurationMillis)
        })
        .trace('Executed SQL Query')
      return
    }
    if (event.level === 'error' && logLevel === 'debug') {
      klogger.withError(event.error).debug('Error SQL Query')
    }
  }
})
