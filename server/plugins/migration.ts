import { Migrator } from 'kysely'
import { definePlugin } from 'nitro'
import { dbClient } from '~/server/database/db.client'
import { createMigrationProvider } from '~/server/database/db.migrator'
import { logger } from '~/server/platform/logger'

export default definePlugin(async (_nitro) => {
  const log = logger.withPrefix('[MIGRATION]')

  // Run database migration once during server startup
  log.info('Starting database migration...')

  // Use the in-memory migration provider instead of FileMigrationProvider.
  // This allows migrations to be bundled with the code and run in production
  // without filesystem access
  const migrationProvider = createMigrationProvider()
  const migrator = new Migrator({ db: dbClient, provider: migrationProvider })

  log.info('Running migrations to latest version...')

  const { error, results } = await migrator.migrateToLatest()

  if (results && results.length > 0) {
    let executedCount = 0
    let skippedCount = 0

    results.forEach((it) => {
      if (it.status === 'Success') {
        log.info(`  - Migration "${it.migrationName}" executed successfully`)
        executedCount++
      } else if (it.status === 'Error') {
        log.error(`  - Failed to execute migration "${it.migrationName}"`)
      }
    })

    // Count skipped migrations (already executed)
    const filteredResult = results.filter(
      (it) => it.status === 'NotExecuted' || it.status === 'Success'
    )
    skippedCount = filteredResult.length - executedCount

    log.info('Migration summary:')
    log.info(`  - Executed: ${executedCount}`)
    log.info(`  - Already up to date: ${skippedCount}`)
  } else {
    log.info('No migrations to run (database is up to date)')
  }

  if (error) {
    log.withError(error).error('Migration failed')
    process.exit(1)
  }

  log.info('Database migration completed successfully')
})
