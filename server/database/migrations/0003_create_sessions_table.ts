import { sql } from 'kysely'
import { UNIX_TIMESTAMP } from '../db.migrator'
import type { DBContext } from '../db.schema'

export async function up(db: DBContext): Promise<void> {
  await db.schema
    .createTable('sessions')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('ip_address', 'text', (col) => col.notNull())
    .addColumn('user_agent', 'text', (col) => col.notNull())
    .addColumn('device_info', 'text', (col) => col.notNull())
    .addColumn('is_active', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('last_activity_at', 'integer', (col) => col.notNull())
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create index for faster lookups by user_id
  await db.schema
    .createIndex('idx_sessions_user_id')
    .on('sessions')
    .column('user_id')
    .ifNotExists()
    .execute()

  // Create index for faster lookups by is_active and expires_at
  await db.schema
    .createIndex('idx_sessions_active_expires')
    .on('sessions')
    .columns(['is_active', 'expires_at'])
    .ifNotExists()
    .execute()

  // Create composite index for faster lookups by user_id, is_active, and expires_at
  await db.schema
    .createIndex('idx_sessions_user_active_expires')
    .on('sessions')
    .columns(['user_id', 'is_active', 'expires_at'])
    .ifNotExists()
    .execute()
}

export async function down(db: DBContext): Promise<void> {
  await db.schema.dropTable('sessions').execute()
}
