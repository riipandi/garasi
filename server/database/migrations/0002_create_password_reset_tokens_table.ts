import { sql } from 'kysely'
import { UNIX_TIMESTAMP } from '../db.migrator'
import type { DBContext } from '../db.schema'

export async function up(db: DBContext): Promise<void> {
  await db.schema
    .createTable('password_reset_tokens')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('used', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create index for faster lookups by user_id
  await db.schema
    .createIndex('idx_password_reset_tokens_user_id')
    .on('password_reset_tokens')
    .column('user_id')
    .ifNotExists()
    .execute()

  // Create index for faster lookups by token
  await db.schema
    .createIndex('idx_password_reset_tokens_token')
    .on('password_reset_tokens')
    .column('token')
    .ifNotExists()
    .execute()

  // Create index for faster lookups by expires_at
  await db.schema
    .createIndex('idx_password_reset_tokens_expires_at')
    .on('password_reset_tokens')
    .column('expires_at')
    .ifNotExists()
    .execute()
}

export async function down(db: DBContext): Promise<void> {
  await db.schema.dropTable('password_reset_tokens').execute()
}
